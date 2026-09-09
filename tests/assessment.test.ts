import { describe, expect, it } from 'vitest'
import {
  assemble,
  blueprintSize,
  ThinPoolError,
  type PoolItem,
} from '@/lib/assessment/assembly'
import {
  scoreAttempt,
  scoreItem,
  toPublicItem,
  toPublicItems,
  type ScoredItem,
} from '@/lib/assessment/scoring'

const pool = (n: number, objectiveId: string, over: Partial<PoolItem> = {}): PoolItem[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `${objectiveId}-${String(i).padStart(2, '0')}`,
    objectiveId,
    formative: false,
    status: 'LIVE' as const,
    ...over,
  }))

const item = (over: Partial<ScoredItem> = {}): ScoredItem => ({
  id: 'i1',
  objectiveId: 'MI-06',
  type: 'MCQ_SINGLE',
  stemAr: 'سؤال',
  stemEn: 'Question',
  isScenario: false,
  rationaleAr: 'التفسير',
  rationaleEn: 'The rationale',
  options: [
    { id: 'a', order: 1, textAr: 'أ', textEn: 'A', isCorrect: true, feedbackAr: 'صح', feedbackEn: 'Right because…' },
    { id: 'b', order: 2, textAr: 'ب', textEn: 'B', isCorrect: false, feedbackAr: 'خطأ', feedbackEn: 'Wrong because…' },
  ],
  ...over,
})

describe('assembly', () => {
  const p = [...pool(8, 'MI-05'), ...pool(8, 'MI-06')]

  it('draws exactly what the blueprint asks for', () => {
    const ids = assemble(p, { 'MI-05': 3, 'MI-06': 2 }, 'seed-1')
    expect(ids).toHaveLength(5)
    expect(new Set(ids).size).toBe(5) // no repeats
  })

  it('is deterministic for a given seed, and differs across seeds', () => {
    const a = assemble(p, { 'MI-05': 3, 'MI-06': 2 }, 'seed-1')
    const b = assemble(p, { 'MI-05': 3, 'MI-06': 2 }, 'seed-1')
    const c = assemble(p, { 'MI-05': 3, 'MI-06': 2 }, 'seed-2')
    expect(a).toEqual(b) // a reload cannot reroll the attempt
    expect(a).not.toEqual(c)
  })

  // Serving a short assessment scores it out of the wrong denominator, and
  // nobody notices until the numbers are already wrong.
  it('fails loudly rather than serving a short assessment', () => {
    expect(() => assemble(p, { 'MI-05': 20 }, 's')).toThrow(ThinPoolError)
    expect(() => assemble(p, { 'MI-07': 1 }, 's')).toThrow(/only 0/)
  })

  it('never draws a formative item into a scored assessment', () => {
    const mixed = [...pool(2, 'MI-05'), ...pool(6, 'MI-05', { formative: true })]
    // Only 2 are eligible, so asking for 3 must fail rather than reach for a
    // knowledge check.
    expect(() => assemble(mixed, { 'MI-05': 3 }, 's')).toThrow(ThinPoolError)
    expect(assemble(mixed, { 'MI-05': 2 }, 's')).toHaveLength(2)
  })

  it('never draws a draft or retired item', () => {
    const mixed = [
      ...pool(1, 'MI-05'),
      ...pool(5, 'MI-05', { status: 'DRAFT' }),
      ...pool(5, 'MI-05', { status: 'RETIRED' }),
    ]
    expect(() => assemble(mixed, { 'MI-05': 2 }, 's')).toThrow(ThinPoolError)
  })

  it('counts a blueprint', () => {
    expect(blueprintSize({ 'MI-05': 3, 'MI-06': 2 })).toBe(5)
  })
})

// The constraint, proven rather than asserted in prose.
describe('integrity: an in-progress attempt payload carries no answers', () => {
  const items = [
    item(),
    item({ id: 'i2', type: 'MULTI_SELECT', objectiveId: 'MI-07' }),
  ]
  const payload = toPublicItems(items)
  const serialised = JSON.stringify(payload)

  it('contains no isCorrect flag anywhere', () => {
    expect(serialised).not.toContain('isCorrect')
    for (const i of payload) {
      for (const o of i.options) {
        expect(Object.keys(o)).toEqual(['id', 'order', 'textAr', 'textEn'])
      }
    }
  })

  it('contains no option feedback', () => {
    expect(serialised).not.toContain('feedback')
    expect(serialised).not.toContain('Right because')
    expect(serialised).not.toContain('Wrong because')
  })

  it('contains no item rationale', () => {
    expect(serialised).not.toContain('rationale')
    expect(serialised).not.toContain('The rationale')
  })

  // Knowing which objective an item tests is itself a hint.
  it('does not reveal which objective an item tests', () => {
    expect(serialised).not.toContain('objectiveId')
    expect(serialised).not.toContain('MI-06')
  })

  // A field added to the model later must be excluded by default, not leak
  // because someone forgot to update a blocklist.
  it('copies fields explicitly, so a new model field cannot leak by default', () => {
    const withSecret = { ...item(), answerKeyNote: 'the answer is A' } as ScoredItem
    expect(JSON.stringify(toPublicItem(withSecret))).not.toContain('answer is A')
  })

  it('still gives the learner everything needed to answer', () => {
    expect(payload[0].stemEn).toBe('Question')
    expect(payload[0].options.map((o) => o.textEn)).toEqual(['A', 'B'])
  })
})

describe('item scoring', () => {
  it('scores MCQ_SINGLE all-or-nothing', () => {
    expect(scoreItem(item(), ['a']).credit).toBe(1)
    expect(scoreItem(item(), ['b']).credit).toBe(0)
    expect(scoreItem(item(), []).credit).toBe(0)
    // Selecting both is not a half-right answer to a single-answer question.
    expect(scoreItem(item(), ['a', 'b']).credit).toBe(0)
  })

  const multi = item({
    type: 'MULTI_SELECT',
    options: [
      { id: 'a', order: 1, textAr: 'أ', textEn: 'A', isCorrect: true, feedbackAr: 'x', feedbackEn: 'x' },
      { id: 'b', order: 2, textAr: 'ب', textEn: 'B', isCorrect: true, feedbackAr: 'x', feedbackEn: 'x' },
      { id: 'c', order: 3, textAr: 'ج', textEn: 'C', isCorrect: false, feedbackAr: 'x', feedbackEn: 'x' },
      { id: 'd', order: 4, textAr: 'د', textEn: 'D', isCorrect: false, feedbackAr: 'x', feedbackEn: 'x' },
    ],
  })

  it('gives MULTI_SELECT partial credit', () => {
    expect(scoreItem(multi, ['a', 'b']).credit).toBe(1)
    expect(scoreItem(multi, ['a']).credit).toBe(0.5)
    expect(scoreItem(multi, ['a', 'c']).credit).toBe(0) // one right, one wrong
  })

  // The same argument as the simulation's precision term, one level down.
  it('scores zero for selecting everything on a MULTI_SELECT', () => {
    expect(scoreItem(multi, ['a', 'b', 'c', 'd']).credit).toBe(0)
  })

  it('ignores duplicate and unknown option ids', () => {
    expect(scoreItem(multi, ['a', 'a', 'zzz']).credit).toBe(0.5)
  })
})

describe('attempt scoring', () => {
  const items = [
    item({ id: 'i1', objectiveId: 'MI-05' }),
    item({ id: 'i2', objectiveId: 'MI-05' }),
    item({ id: 'i3', objectiveId: 'MI-06' }),
    item({ id: 'i4', objectiveId: 'MI-06' }),
  ]

  it('scores out of the number of items asked', () => {
    const r = scoreAttempt(items, { i1: ['a'], i2: ['a'], i3: ['a'], i4: ['b'] }, 70)
    expect(r.scorePct).toBe(75)
    expect(r.passed).toBe(true)
  })

  it('fails below the pass mark', () => {
    const r = scoreAttempt(items, { i1: ['a'], i2: ['b'], i3: ['b'], i4: ['b'] }, 70)
    expect(r.scorePct).toBe(25)
    expect(r.passed).toBe(false)
  })

  it('breaks the score down per objective', () => {
    const r = scoreAttempt(items, { i1: ['a'], i2: ['a'], i3: ['a'], i4: ['b'] }, 70)
    expect(r.byObjective).toEqual([
      { objectiveId: 'MI-05', credit: 2, outOf: 2, pct: 100 },
      { objectiveId: 'MI-06', credit: 1, outOf: 2, pct: 50 },
    ])
  })

  it('names the weakest objectives, worst first', () => {
    const r = scoreAttempt(items, { i1: ['a'], i2: ['a'], i3: ['b'], i4: ['b'] }, 70)
    expect(r.weakestObjectives).toEqual(['MI-06'])
  })

  it('an unanswered attempt scores zero, not a pass', () => {
    const r = scoreAttempt(items, {}, 70)
    expect(r.scorePct).toBe(0)
    expect(r.passed).toBe(false)
  })
})
