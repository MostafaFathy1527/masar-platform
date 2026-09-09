import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth-guard'
import { getDb } from '@/lib/db'
import {
  certificateEligibility,
  certificatePayloadHash,
  certificateSerial,
} from '@/lib/certificates'

// Issue is idempotent per learner and course: asking twice returns the same
// certificate rather than minting a second serial for the same achievement.

export async function POST() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const userId = user.id

  const db = getDb()

  const course = await db.course.findFirst({ where: { status: 'PUBLISHED' } })
  if (!course) return NextResponse.json({ error: 'No course' }, { status: 404 })

  const existing = await db.certificate.findFirst({
    where: { userId, courseId: course.id, revokedAt: null },
  })
  if (existing) return NextResponse.json({ serial: existing.serial, reissued: false })

  const examAssessment = await db.assessment.findFirst({
    where: { courseId: course.id, scope: 'EXAM' },
  })
  const bestExam = examAssessment
    ? await db.attempt.findFirst({
        where: { userId, assessmentId: examAssessment.id, scorePct: { not: null } },
        orderBy: { scorePct: 'desc' },
      })
    : null
  const simPassed = await db.simSubmission.findFirst({ where: { userId, passed: true } })

  // The same pure function the page calls, so a certificate can never be issued
  // on a rule the learner was not shown — or withheld on one they were.
  const eligibility = certificateEligibility({
    examScorePct: bestExam?.scorePct ?? null,
    examPassPct: examAssessment?.passPct ?? 75,
    simulationPassed: !!simPassed,
    isDemo: user.isDemo,
  })
  if (!eligibility.eligible) {
    return NextResponse.json({ error: 'Not eligible', gates: eligibility.gates }, { status: 403 })
  }

  const year = new Date().getFullYear()
  const issuedThisYear = await db.certificate.count({
    where: { issuedAt: { gte: new Date(`${year}-01-01T00:00:00.000Z`) } },
  })
  const serial = certificateSerial(year, issuedThisYear + 1)
  const issuedAt = new Date()

  const objectivesMet = bestExam
    ? ((await db.attemptAnswer.findMany({
        where: { attemptId: bestExam.id, isCorrect: true },
        include: { item: { select: { objectiveId: true } } },
      })).map((a) => a.item.objectiveId))
    : []

  const cert = await db.certificate.create({
    data: {
      serial,
      userId,
      courseId: course.id,
      issuedAt,
      finalScorePct: bestExam?.scorePct ?? 0,
      objectivesMet: [...new Set(objectivesMet)].sort(),
      payloadHash: certificatePayloadHash({
        serial,
        holderName: user.name,
        courseSlug: course.slug,
        issuedAtIso: issuedAt.toISOString(),
        finalScorePct: bestExam?.scorePct ?? 0,
      }),
      isDemo: eligibility.viaDemoShortcut,
    },
  })

  return NextResponse.json({ serial: cert.serial, reissued: false, isDemo: cert.isDemo })
}
