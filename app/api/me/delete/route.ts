import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth-guard'
import { getDb } from '@/lib/db'

/**
 * Deletes the signed-in learner's account and everything hanging off it.
 *
 * A real delete, not a deactivation flag: the privacy page says the data is
 * removed, so it is removed. Every table holding learner data cascades from
 * User, and a test asserts that no model can hold a userId without one.
 */
export async function POST() {
  const me = await requireUser()
  if (!me) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  await getDb().user.delete({ where: { id: me.id } })
  // The cookie remains cryptographically valid until it expires, so it must not
  // be trusted on its own. Every authorized path goes through requireUser(),
  // which resolves the row and now finds nothing.
  return NextResponse.json({ deleted: true })
}
