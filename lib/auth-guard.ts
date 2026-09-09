import { auth } from '@/auth'
import { getDb } from '@/lib/db'
import type { Role } from '@prisma/client'

/**
 * Resolves the signed-in user FROM THE DATABASE, not just from the token.
 *
 * A JWT session outlives the row it describes: after an account is deleted the
 * cookie is still cryptographically valid, so `session.user.id` alone will
 * happily identify a user who no longer exists. That was a real defect — a
 * deleted learner could still call the data-export endpoint and get a 200.
 *
 * Reading the row also means role changes take effect for authorization here
 * even though the token still carries the old role, so a demoted admin loses
 * access at the next request rather than at the next sign-in.
 */
export async function requireUser(): Promise<{
  id: string
  name: string
  email: string
  role: Role
  isDemo: boolean
} | null> {
  const session = await auth().catch(() => null)
  const id = session?.user?.id
  if (!id) return null

  const user = await getDb().user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, isDemo: true, isActive: true },
  })
  if (!user || !user.isActive) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isDemo: user.isDemo,
  }
}

/** As above, and additionally requires the ADMIN role as stored, not as claimed. */
export async function requireAdmin() {
  const user = await requireUser()
  return user?.role === 'ADMIN' ? user : null
}
