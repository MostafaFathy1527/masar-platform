import { describe, expect, it } from 'vitest'
import { draftIndex, draftRubric } from '@/lib/drafts'

describe('draftRubric', () => {
  it('reads every judge beside each draft and takes pass/fail from the gate report', () => {
    const drafts = draftIndex()
    expect(drafts.length).toBeGreaterThan(0)
    for (const d of drafts) {
      const r = draftRubric(d.dir)
      expect(r, d.code).not.toBeNull()
      expect(r!.judges.length).toBeGreaterThanOrEqual(1)
      for (const j of r!.judges) {
        expect(j.mean).toBeGreaterThanOrEqual(1)
        expect(j.mean).toBeLessThanOrEqual(5)
        expect(j.scored).toBeGreaterThan(0)
      }
      expect(r!.minMean).toBeLessThanOrEqual(r!.maxMean)
    }
  })

  it('returns null for a draft no judge has scored', () => {
    expect(draftRubric('does-not-exist/v1')).toBeNull()
  })
})

describe('draft listing', () => {
  it('reads the panel decision beside each draft', async () => {
    const { draftIndex, draftRubric } = await import('@/lib/drafts')
    for (const d of draftIndex()) {
      const r = draftRubric(d.dir)
      expect(r?.panel, d.code).toMatch(/^(PASS|NEEDS HUMAN|FAIL)$/)
      if (r?.panel === 'NEEDS HUMAN') expect(r.split.length, d.code).toBeGreaterThan(0)
    }
  })

  it('lists only drafts whose objective statement was written by hand', async () => {
    const { draftIndex, DRAFT_OBJECTIVES } = await import('@/lib/drafts')
    const codes = draftIndex().map((d) => d.code)
    expect(codes.length).toBeGreaterThan(0)
    for (const c of codes) expect(DRAFT_OBJECTIVES[c]).toBeDefined()
    // The withdrawn OPS-01 run is evidence, not a sample: one code, one page.
    expect(new Set(codes).size).toBe(codes.length)
    expect(draftIndex().find((d) => d.code === 'OPS-01')?.dir).toBe('lesson-ops-01-r2/v2')
  })
})
