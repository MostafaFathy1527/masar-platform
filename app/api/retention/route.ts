import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { guestCutoff, GUEST_RETENTION_DAYS } from '@/lib/retention'

/**
 * Purges expired guest accounts. Deleting the User row cascades to enrolments,
 * progress, attempts, answers, simulation submissions and certificates.
 *
 * Safe to call by anyone: it takes no input, reveals nothing about who was
 * deleted, and only ever removes guest rows that are already past the published
 * retention window. Making it public means the claim on /privacy can be checked
 * by the person relying on it.
 */
export async function purgeExpiredGuests() {
  const { count } = await getDb().user.deleteMany({
    where: { isDemo: true, createdAt: { lt: guestCutoff() } },
  })
  return count
}

export async function POST() {
  const purged = await purgeExpiredGuests()
  return NextResponse.json({ purged, retentionDays: GUEST_RETENTION_DAYS })
}

export async function GET() {
  const db = getDb()
  const [guests, expired] = await Promise.all([
    db.user.count({ where: { isDemo: true } }),
    db.user.count({ where: { isDemo: true, createdAt: { lt: guestCutoff() } } }),
  ])
  // Counts only. Enough to verify the policy is being kept without exposing
  // anything about individual guests.
  return NextResponse.json({ guests, expired, retentionDays: GUEST_RETENTION_DAYS })
}
