import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth-guard'
import { getDb } from '@/lib/db'

/**
 * Everything this platform holds about the signed-in learner, as JSON.
 *
 * Guests included: a throwaway account is still someone's data while it exists.
 * The password hash is deliberately excluded — it is about the account, not
 * about the person, and returning it would be a liability with no benefit.
 */
export async function GET() {
  // Resolves the row, not just the token: a deleted account's cookie is still
  // valid and must not return an export of nothing with a 200.
  const me = await requireUser()
  if (!me) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const userId = me.id

  const db = getDb()
  const [user, enrollments, progress, attempts, answers, submissions, certificates] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true, email: true, name: true, locale: true, role: true,
          isDemo: true, emailVerifiedAt: true, createdAt: true, updatedAt: true,
        },
      }),
      db.enrollment.findMany({ where: { userId } }),
      db.lessonProgress.findMany({ where: { enrollment: { userId } } }),
      db.attempt.findMany({ where: { userId } }),
      db.attemptAnswer.findMany({ where: { attempt: { userId } } }),
      db.simSubmission.findMany({ where: { userId } }),
      db.certificate.findMany({ where: { userId } }),
    ])

  return NextResponse.json(
    {
      exportedAt: new Date().toISOString(),
      note: 'Everything held about this account. The password hash is excluded deliberately.',
      user, enrollments, progress, attempts, answers, submissions, certificates,
    },
    { headers: { 'content-disposition': 'attachment; filename="masar-data-export.json"' } },
  )
}
