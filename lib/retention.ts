/**
 * Guest data retention.
 *
 * `/privacy` and `SPEC.md` state that guest accounts are purged after seven
 * days. That sentence was published before anything enforced it, which is
 * exactly the class of unbacked claim this project is meant not to make — so
 * the mechanism lives here and the wording points at it.
 *
 * Deliberately not a cron. The hosting plan allows very few scheduled jobs, and
 * a purge that only runs on a schedule is a purge that silently stops when the
 * schedule breaks. Instead it runs opportunistically whenever a guest is
 * created: the event that produces the data is the event that clears the old
 * data, so the mechanism cannot drift away from the thing it is cleaning up.
 * A route exists as well, for running it on demand.
 */

export const GUEST_RETENTION_DAYS = 7

/** Guests created before this instant are expired. */
export function guestCutoff(now: Date = new Date(), days = GUEST_RETENTION_DAYS): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

export function isExpiredGuest(
  user: { isDemo: boolean; createdAt: Date },
  now: Date = new Date(),
  days = GUEST_RETENTION_DAYS,
): boolean {
  return user.isDemo && user.createdAt.getTime() < guestCutoff(now, days).getTime()
}

/**
 * The minimum a purge must delete for the published claim to be true.
 *
 * Every table that holds guest data hangs off `User` with `onDelete: Cascade`,
 * so deleting the user row removes enrolments, lesson progress, attempts,
 * attempt answers, simulation submissions and certificates with it. This list
 * is asserted by a test against the Prisma schema, so a future table that holds
 * learner data without a cascade fails the build rather than quietly surviving
 * a purge and making the privacy page a lie.
 */
export const CASCADES_FROM_USER = [
  'Enrollment',
  'Attempt',
  'SimSubmission',
  'Certificate',
] as const
