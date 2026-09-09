import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/auth-guard'
import { getDb } from '@/lib/db'
import {
  flaggableKeysFor,
  scoreClaimReview,
  type SeededError,
} from '@/lib/scoring/claim-review'

// Scoring happens here and only here.
//
// The seeded errors are never sent to the browser before submission — the same
// rule that strips answer keys from an in-progress attempt. The page ships the
// claim, the note and the member card; the learner posts the keys they flagged;
// the explanations come back only in the response. A learner who opens dev
// tools finds the claim, not the answers.

const Body = z.object({
  slug: z.string().min(1),
  flagged: z.array(z.string().min(1)).max(200),
})

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const db = getDb()
  const sim = await db.simulation.findUnique({ where: { slug: parsed.data.slug } })
  if (!sim) return NextResponse.json({ error: 'Unknown simulation' }, { status: 404 })

  const dataset = sim.datasetJson as unknown as {
    claim: { fields: Array<{ key: string }>; lines: Array<{ key: string }> }
  }
  const seededErrors = sim.seededErrorsJson as unknown as SeededError[]

  const result = scoreClaimReview({
    seededErrors,
    flaggableKeys: flaggableKeysFor(dataset.claim),
    flagged: parsed.data.flagged,
    passPct: sim.passPct,
  })

  // Persist only for a signed-in learner. A visitor who has not entered as a
  // guest still gets scored and still gets the explanations — the exercise is
  // the point, and requiring a session first would put a wall exactly where the
  // demo is trying to remove one.
  const me = await requireUser()
  const userId = me?.id
  if (userId) {
    await db.simSubmission
      .create({
        data: {
          simulationId: sim.id,
          userId,
          responseJson: { flagged: parsed.data.flagged },
          scoreJson: result as unknown as object,
          scorePct: result.scorePct,
          passed: result.passed,
        },
      })
      // A failed write must not cost the learner their feedback.
      .catch(() => null)
  }

  return NextResponse.json(result)
}
