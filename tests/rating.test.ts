import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { CRITERIA, OVERLAP, isComplete, mayRate, raterFor } from '@/lib/rating/raters'

const sha = (s: string) => createHash('sha256').update(s).digest('hex')
const raters = [
  { id: 'a', codeSha256: sha('code-for-rater-a-0001'), scope: 'all' as const },
  { id: 'b', codeSha256: sha('code-for-rater-b-0002'), scope: 'overlap' as const },
]
const full = Object.fromEntries(CRITERIA.map((c) => [c, 4]))

describe('rater access', () => {
  it('knows a rater only by the code whose hash is listed', () => {
    expect(raterFor('code-for-rater-a-0001', raters)?.id).toBe('a')
    expect(raterFor('code-for-rater-a-0002', raters)).toBeNull()
    expect(raterFor('', raters)).toBeNull()
    expect(raterFor(null, raters)).toBeNull()
  })

  it('lets the second rater score only the Arabic overlap samples', () => {
    const b = raters[1]
    expect(mayRate(b, OVERLAP[0], 'ar')).toBe(true)
    expect(mayRate(b, OVERLAP[0], 'en')).toBe(false)
    expect(mayRate(b, 'L02', 'ar')).toBe(OVERLAP.includes('L02'))
    expect(mayRate(raters[0], 'L02', 'en')).toBe(true)
  })

  it('refuses sample ids that are not shaped like L01..L99', () => {
    expect(mayRate(raters[0], '../x', 'ar')).toBe(false)
    expect(mayRate(raters[0], 'L1', 'ar')).toBe(false)
  })
})

describe('a complete rating', () => {
  it('needs every criterion scored', () => {
    expect(isComplete(full, {})).toBe(true)
    const { concision: _, ...missing } = full
    expect(isComplete(missing, {})).toBe(false)
  })

  it('needs a reason for every score of 3 or below', () => {
    expect(isComplete({ ...full, knowledge_check: 3 }, {})).toBe(false)
    expect(isComplete({ ...full, knowledge_check: 3 }, { knowledge_check: '  ' })).toBe(false)
    expect(isComplete({ ...full, knowledge_check: 3 }, { knowledge_check: 'two distractors nobody would pick' })).toBe(true)
  })
})
