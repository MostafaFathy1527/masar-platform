import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/auth-guard'
import { getDb } from '@/lib/db'
import { assemble, ThinPoolError, type Blueprint, type PoolItem } from '@/lib/assessment/assembly'
import { toPublicItemsShuffled, type ScoredItem } from '@/lib/assessment/scoring'

// Starting an attempt materialises its item set server-side and stores it on
// the Attempt row. The server decides what was asked; a client cannot influence
// it, and a reload cannot reroll it.

const Body = z.object({
  scope: z.enum(['LESSON', 'EXAM']),
  scopeId: z.string().min(1).optional(),
})

export async function POST(req: Request) {
  const me = await requireUser()
  const userId = me?.id
  if (!userId) {
    return NextResponse.json(
      { error: 'Sign in or enter as a guest to start an attempt.' },
      { status: 401 },
    )
  }

  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const db = getDb()
  const assessment = await db.assessment.findFirst({
    where: {
      scope: parsed.data.scope,
      ...(parsed.data.scopeId ? { scopeId: parsed.data.scopeId } : {}),
    },
  })
  if (!assessment) return NextResponse.json({ error: 'Unknown assessment' }, { status: 404 })

  const pool: PoolItem[] = (
    await db.item.findMany({
      where: { courseId: assessment.courseId },
      select: { id: true, objectiveId: true, formative: true, status: true },
    })
  ).map((i) => ({ ...i, status: i.status as PoolItem['status'] }))

  const seed = randomUUID()
  let itemIds: string[]
  try {
    itemIds = assemble(pool, assessment.assemblyJson as Blueprint, seed)
  } catch (e) {
    // A thin pool is a content problem, not a learner problem. Surfacing it as
    // a 500 with the real reason beats silently serving a short assessment.
    if (e instanceof ThinPoolError) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
    throw e
  }

  const attemptNo =
    (await db.attempt.count({ where: { userId, assessmentId: assessment.id } })) + 1

  const attempt = await db.attempt.create({
    data: { userId, assessmentId: assessment.id, itemIdsJson: itemIds, seed, attemptNo },
  })

  const items = await db.item.findMany({
    where: { id: { in: itemIds } },
    include: { options: true },
  })
  // Preserve the assembled order, which findMany does not guarantee.
  const byId = new Map(items.map((i) => [i.id, i]))
  const ordered = itemIds.map((id) => byId.get(id)!) as unknown as ScoredItem[]

  return NextResponse.json({
    attemptId: attempt.id,
    passPct: assessment.passPct,
    timeLimitSec: assessment.timeLimitSec,
    startedAt: attempt.startedAt.toISOString(),
    // Stripped: no correct keys, no feedback, no rationales, no objective
    // codes. Options are shuffled per attempt so position cannot predict the
    // answer.
    items: toPublicItemsShuffled(ordered, attempt.seed),
  })
}
