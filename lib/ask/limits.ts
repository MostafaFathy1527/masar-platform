import { createHmac } from 'node:crypto'

/**
 * How much "Ask the lesson" may be used. Every answer is a paid model call, so the
 * caps are what keeps a public page from spending more than it should: a visitor
 * gets a handful of questions an hour, and the whole site a fixed number a day.
 * When the day's number is reached the box says so and stops asking the model.
 */

export const PER_VISITOR_PER_HOUR = 8
export const PER_DAY = 150
export const ASK_RETENTION_DAYS = 30
export const QUESTION_MIN = 3
export const QUESTION_MAX = 400

/**
 * A visitor is a keyed hash of the network address and the UTC day, never the
 * address itself: enough to count one visitor's questions within a day, and not
 * enough to follow them to the next one.
 */
export function visitorCode(ip: string, now: Date, secret: string): string {
  const day = now.toISOString().slice(0, 10)
  return createHmac('sha256', secret).update(`${day}|${ip}`).digest('hex').slice(0, 32)
}

export function startOfUtcDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export type Limit = 'ok' | 'visitor' | 'day'

export function checkLimits(counts: { visitorLastHour: number; today: number }): Limit {
  if (counts.today >= PER_DAY) return 'day'
  if (counts.visitorLastHour >= PER_VISITOR_PER_HOUR) return 'visitor'
  return 'ok'
}

/** The first address in x-forwarded-for is the client's on Vercel. */
export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown'
}
