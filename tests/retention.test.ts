import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  CASCADES_FROM_USER,
  GUEST_RETENTION_DAYS,
  guestCutoff,
  isExpiredGuest,
} from '@/lib/retention'

const days = (n: number) => n * 24 * 60 * 60 * 1000
const NOW = new Date('2026-09-20T12:00:00.000Z')

describe('guest retention window', () => {
  it('matches the published policy of seven days', () => {
    expect(GUEST_RETENTION_DAYS).toBe(7)
  })

  it('expires a guest older than the window', () => {
    const user = { isDemo: true, createdAt: new Date(NOW.getTime() - days(8)) }
    expect(isExpiredGuest(user, NOW)).toBe(true)
  })

  it('keeps a guest inside the window', () => {
    const user = { isDemo: true, createdAt: new Date(NOW.getTime() - days(6)) }
    expect(isExpiredGuest(user, NOW)).toBe(false)
  })

  // A registered learner's data is not guest data and must never be swept up by
  // a policy written for throwaway accounts.
  it('never expires a non-guest, however old', () => {
    const user = { isDemo: false, createdAt: new Date(NOW.getTime() - days(3650)) }
    expect(isExpiredGuest(user, NOW)).toBe(false)
  })

  it('puts the cutoff exactly seven days back', () => {
    expect(guestCutoff(NOW).toISOString()).toBe('2026-09-13T12:00:00.000Z')
  })
})

// The privacy claim is only true if deleting a guest actually removes their
// learning data. Every table holding it must cascade from User; a new table
// added without a cascade would leave orphaned learner data behind and quietly
// make the published page false.
describe('deleting a guest removes their data', () => {
  const schema = readFileSync('prisma/schema.prisma', 'utf-8')

  it.each(CASCADES_FROM_USER)('%s cascades from User', (model) => {
    const block = schema.slice(
      schema.indexOf(`model ${model} {`),
      schema.indexOf('}', schema.indexOf(`model ${model} {`)),
    )
    expect(block, `${model} must reference User`).toContain('references: [id]')
    expect(block, `${model} must cascade on user delete`).toMatch(
      /user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)/,
    )
  })

  it('catches any future model holding a userId without a cascade', () => {
    const models = [...schema.matchAll(/model (\w+) \{([\s\S]*?)\n\}/g)]
    const offenders = models
      .filter(([, name, body]) => name !== 'User' && /userId\s+String/.test(body))
      .filter(([, , body]) => !/onDelete: Cascade/.test(body))
      .map(([, name]) => name)
    expect(offenders, 'these hold userId with no cascade, so a purge would orphan them').toEqual([])
  })
})
