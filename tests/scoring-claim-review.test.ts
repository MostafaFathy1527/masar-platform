import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  flaggableKeysFor,
  scoreClaimReview,
  type SeededError,
} from '@/lib/scoring/claim-review'

// These tests encode what the case study CLAIMS, not what the code happens to
// do. If a claim and the implementation disagree, that is the point of having
// them — better found here than in front of a reviewer.

const sim = JSON.parse(
  readFileSync('content/courses/rcm-foundations/simulations/claim-review.json', 'utf-8'),
)
const seededErrors: SeededError[] = sim.seededErrors
const flaggableKeys = flaggableKeysFor(sim.dataset.claim)
const errorKeys = seededErrors.map((e) => e.fieldKey)

const score = (flagged: string[]) =>
  scoreClaimReview({ seededErrors, flaggableKeys, flagged, passPct: sim.passPct })

describe('the simulation dataset', () => {
  it('seeds exactly six errors, one per class', () => {
    expect(seededErrors).toHaveLength(6)
    expect(new Set(seededErrors.map((e) => e.class)).size).toBe(6)
  })

  it('gives every seeded error a written explanation in both languages', () => {
    for (const e of seededErrors) {
      expect(e.whyAr.length, `${e.id} Arabic explanation`).toBeGreaterThan(20)
      expect(e.whyEn.length, `${e.id} English explanation`).toBeGreaterThan(20)
    }
  })

  // Without this link the simulation is a quiz with a nicer skin.
  it('links every seeded error to a block that exists in the lesson', () => {
    const lesson = JSON.parse(
      readFileSync(
        'content/courses/rcm-foundations/lessons/04-anatomy-of-a-claim.json',
        'utf-8',
      ),
    )
    const ids = new Set<string>()
    for (const key of ['l1', 'l2', 'l3'] as const) {
      for (const b of lesson.blocks[key] ?? []) ids.add(b.id)
    }
    for (const e of seededErrors) {
      expect(ids, `${e.id} -> ${e.teachesBlockId}`).toContain(e.teachesBlockId)
    }
  })

  it('places every seeded error on a flaggable field', () => {
    for (const e of seededErrors) expect(flaggableKeys).toContain(e.fieldKey)
  })
})

describe('scoring mechanics', () => {
  it('scores a perfect careful review at 100', () => {
    expect(score(errorKeys).scorePct).toBe(100)
  })

  it('ignores duplicate and unknown flags', () => {
    const a = score([errorKeys[0]])
    const b = score([errorKeys[0], errorKeys[0], 'not_a_field'])
    expect(b.flagsMade).toBe(a.flagsMade)
    expect(b.scorePct).toBe(a.scorePct)
  })

  it('returns a written explanation for every hit and every miss', () => {
    const r = score([errorKeys[0], errorKeys[1]])
    expect(r.outcomes).toHaveLength(6)
    expect(r.outcomes.filter((o) => o.found)).toHaveLength(2)
    for (const o of r.outcomes) {
      expect(o.whyEn.length).toBeGreaterThan(20)
      expect(o.teachesBlockId).toBeTruthy()
    }
  })
})

describe('the case-study claim', () => {
  const fourCareful = score(errorKeys.slice(0, 4))
  const shotgun = score(flaggableKeys)

  it('flagging four fields, all correct, passes', () => {
    expect(fourCareful.hits).toBe(4)
    expect(fourCareful.falsePositives).toBe(0)
    expect(fourCareful.passed).toBe(true)
  })

  it('one correct flag has perfect precision but does not pass', () => {
    const r = score([errorKeys[0]])
    expect(r.falsePositives).toBe(0)
    expect(r.precision, 'precision is perfect').toBe(1)
    expect(r.recall).toBeCloseTo(1 / 6, 10)
    // F1 is dominated by the worse of the two, so one lucky flag cannot pass.
    expect(r.passed, 'a single lucky flag must not pass').toBe(false)
  })

  it('is the harmonic mean, so the worse of precision and recall dominates', () => {
    const r = score(flaggableKeys)
    const expected = (2 * r.precision * r.recall) / (r.precision + r.recall)
    expect(r.score).toBeCloseTo(expected, 12)
    expect(r.recall, 'shotgun maxes recall').toBe(1)
    expect(r.precision, 'and destroys precision').toBeLessThan(0.4)
  })

  // THE claim the case study makes. If this fails, the formula does not do
  // what the project says it does.
  it('shotgun-flagging every field scores WORSE than reading four carefully', () => {
    expect(shotgun.scorePct).toBeLessThan(fourCareful.scorePct)
  })

  it('flagging nothing scores zero', () => {
    expect(score([]).scorePct).toBe(0)
  })
})

describe('integrity: answers must not reach the browser', () => {
  // The page ships the claim, the note and the card. If someone later passes
  // the seeded errors to the client component "for convenience", the
  // simulation becomes a spot-the-highlighted-field exercise. This is a cheap
  // structural guard for a property that is otherwise easy to regress.
  it('the practice page never reads seededErrorsJson', () => {
    const page = readFileSync('app/[locale]/practice/[slug]/page.tsx', 'utf-8')
    expect(page).not.toContain('seededErrorsJson')
    expect(page).toContain('datasetJson')
  })

  it('the client workbench has no notion of a seeded error', () => {
    const wb = readFileSync('components/sims/ClaimReviewWorkbench.tsx', 'utf-8')
    expect(wb).not.toContain('seededErrors')
  })

  it('scoring happens only in the server route', () => {
    const route = readFileSync('app/api/sim/route.ts', 'utf-8')
    expect(route).toContain('scoreClaimReview')
    const wb = readFileSync('components/sims/ClaimReviewWorkbench.tsx', 'utf-8')
    expect(wb).not.toContain('scoreClaimReview')
  })
})
