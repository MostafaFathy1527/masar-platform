import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { getDb } from '@/lib/db'
import { scoreAttempt, type Responses, type ScoredItem } from '@/lib/assessment/scoring'

// Submitting scores the attempt server-side against the item set stored at
// start. Rationales and per-option feedback are returned here and only here —
// after the attempt is over.

const Body = z.object({
  responses: z.record(z.string(), z.array(z.string()).max(10)),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const session = await auth().catch(() => null)
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const db = getDb()
  const attempt = await db.attempt.findUnique({
    where: { id },
    include: { assessment: true },
  })
  // Same 404 for "not yours" and "does not exist": an attempt id must not be a
  // probe for whether someone else's attempt exists.
  if (!attempt || attempt.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (attempt.state !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'This attempt is already submitted' }, { status: 409 })
  }

  const itemIds = attempt.itemIdsJson as string[]
  const items = (await db.item.findMany({
    where: { id: { in: itemIds } },
    include: { options: true },
  })) as unknown as ScoredItem[]
  const byId = new Map(items.map((i) => [i.id, i]))
  const ordered = itemIds.map((i) => byId.get(i)!).filter(Boolean)

  // Only responses for items actually in this attempt are considered, so a
  // client cannot answer a question it was never asked.
  const responses: Responses = {}
  for (const itemId of itemIds) {
    responses[itemId] = parsed.data.responses[itemId] ?? []
  }

  // Server-authoritative timing: if the limit has passed, what was submitted
  // still scores, but the attempt is recorded as expired rather than clean.
  const limit = attempt.assessment.timeLimitSec
  const elapsedSec = (Date.now() - attempt.startedAt.getTime()) / 1000
  const expired = limit !== null && elapsedSec > limit

  const result = scoreAttempt(ordered, responses, attempt.assessment.passPct)

  await db.$transaction([
    db.attemptAnswer.createMany({
      data: result.itemScores.map((s) => ({
        attemptId: attempt.id,
        itemId: s.itemId,
        responseJson: { selected: s.selectedOptionIds },
        isCorrect: s.correct,
      })),
      skipDuplicates: true,
    }),
    db.attempt.update({
      where: { id: attempt.id },
      data: {
        submittedAt: new Date(),
        scorePct: result.scorePct,
        passed: result.passed,
        state: expired ? 'EXPIRED' : 'SUBMITTED',
      },
    }),
  ])

  return NextResponse.json({
    scorePct: result.scorePct,
    passed: result.passed,
    passPct: result.passPct,
    expired,
    byObjective: result.byObjective,
    weakestObjectives: result.weakestObjectives,
    // The review payload: now that the attempt is over, the learner gets the
    // rationale and the per-option feedback, including for distractors.
    review: ordered.map((item) => {
      const s = result.itemScores.find((x) => x.itemId === item.id)!
      return {
        itemId: item.id,
        objectiveId: item.objectiveId,
        stemAr: item.stemAr,
        stemEn: item.stemEn,
        credit: s.credit,
        correct: s.correct,
        rationaleAr: item.rationaleAr,
        rationaleEn: item.rationaleEn,
        options: item.options
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((o) => ({
            id: o.id,
            textAr: o.textAr,
            textEn: o.textEn,
            isCorrect: o.isCorrect,
            selected: s.selectedOptionIds.includes(o.id),
            feedbackAr: o.feedbackAr,
            feedbackEn: o.feedbackEn,
          })),
      }
    }),
  })
}
