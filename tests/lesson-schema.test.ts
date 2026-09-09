import { describe, expect, it } from 'vitest'
import { Block, BLOCK_LEVELS, LessonDoc } from '@/lib/schema/lesson'

// These cover the invariants a human editor cannot enforce by eye across many
// lessons, and which the Python pipeline will rely on through the generated
// JSON Schema. They are not exhaustive field-presence tests — Zod already does
// that — they are the cross-field rules that would otherwise fail silently.

const heading = (id: string) => ({
  id,
  type: 'heading' as const,
  objectiveId: 'MI-04',
  payload: { textAr: 'عنوان', textEn: 'Heading', level: 2 as const },
})

const base = {
  slug: 'anatomy-of-a-claim',
  titleAr: 'تشريح المطالبة',
  titleEn: 'Anatomy of a claim',
  estMinutes: 45,
  objectives: ['MI-04'],
  conceptsIntroduced: [],
}

describe('LessonDoc', () => {
  it('accepts a minimal valid L1 lesson', () => {
    const r = LessonDoc.safeParse({
      ...base,
      levels: ['L1'],
      blocks: { l1: [heading('b1')] },
    })
    expect(r.success).toBe(true)
  })

  it('rejects a declared level with no blocks', () => {
    const r = LessonDoc.safeParse({ ...base, levels: ['L1', 'L2'], blocks: { l1: [heading('b1')] } })
    expect(r.success).toBe(false)
    expect(JSON.stringify(r.error?.issues)).toContain('L2 is declared but has no blocks')
  })

  it('rejects blocks for an undeclared level', () => {
    const r = LessonDoc.safeParse({
      ...base,
      levels: ['L1'],
      blocks: { l1: [heading('b1')], l2: [heading('b2')] },
    })
    expect(r.success).toBe(false)
    expect(JSON.stringify(r.error?.issues)).toContain('not declared')
  })

  // BlockInteraction rows key on block id. A duplicate would silently merge
  // two different blocks' analytics rather than erroring.
  it('rejects a duplicate block id across levels', () => {
    const r = LessonDoc.safeParse({
      ...base,
      levels: ['L1', 'L2'],
      blocks: { l1: [heading('same')], l2: [heading('same')] },
    })
    expect(r.success).toBe(false)
    expect(JSON.stringify(r.error?.issues)).toContain('duplicate block id')
  })

  it('rejects a block type used at a level it is not allowed at', () => {
    const r = LessonDoc.safeParse({
      ...base,
      levels: ['L1'],
      blocks: {
        l1: [{ id: 'b1', type: 'practice_sim', objectiveId: 'MI-04', payload: { simSlug: 'claim-review' } }],
      },
    })
    expect(r.success).toBe(false)
    expect(JSON.stringify(r.error?.issues)).toContain('not allowed at L1')
  })

  it('requires a kebab-case slug and an MI-NN objective', () => {
    expect(LessonDoc.safeParse({ ...base, slug: 'Not Kebab', levels: ['L1'], blocks: { l1: [heading('b1')] } }).success).toBe(false)
    expect(LessonDoc.safeParse({ ...base, objectives: ['MI4'], levels: ['L1'], blocks: { l1: [heading('b1')] } }).success).toBe(false)
  })
})

describe('block payloads', () => {
  it('rejects a compare_table whose rows do not match its columns', () => {
    const r = Block.safeParse({
      id: 'b1',
      type: 'compare_table',
      objectiveId: 'MI-04',
      payload: {
        captionAr: 'ت', captionEn: 'C',
        columns: ['a', 'b', 'c'],
        rows: [['1', '2']],
      },
    })
    expect(r.success).toBe(false)
  })

  it('requires a scenario to have exactly one best decision', () => {
    const decision = (id: string, isBest: boolean) => ({
      id, optionAr: 'خيار', optionEn: 'Option',
      consequenceAr: 'نتيجة', consequenceEn: 'Consequence', isBest,
    })
    const make = (bests: boolean[]) =>
      Block.safeParse({
        id: 'b1', type: 'scenario', objectiveId: 'MI-04',
        payload: {
          situationAr: 'موقف', situationEn: 'Situation',
          decisions: bests.map((b, i) => decision(`d${i}`, b)),
        },
      }).success

    expect(make([true, false])).toBe(true)
    expect(make([false, false])).toBe(false)
    expect(make([true, true])).toBe(false)
  })

  it('requires every sort_buckets card to name a bucket that exists', () => {
    const card = (bucketId: string) => ({
      id: 'c1', textAr: 'ن', textEn: 'T', bucketId, whyAr: 'س', whyEn: 'W',
    })
    const payload = (bucketId: string) => ({
      buckets: [
        { id: 'covered', labelAr: 'مغطى', labelEn: 'Covered' },
        { id: 'excluded', labelAr: 'مستثنى', labelEn: 'Excluded' },
      ],
      cards: [card(bucketId), { ...card('excluded'), id: 'c2' }],
    })
    expect(Block.safeParse({ id: 'b', type: 'sort_buckets', objectiveId: 'MI-04', payload: payload('covered') }).success).toBe(true)
    expect(Block.safeParse({ id: 'b', type: 'sort_buckets', objectiveId: 'MI-04', payload: payload('nope') }).success).toBe(false)
  })

  it('requires takeaways to be balanced across languages', () => {
    const p = (ar: string[], en: string[]) =>
      Block.safeParse({ id: 'b', type: 'takeaways', objectiveId: 'MI-04', payload: { itemsAr: ar, itemsEn: en } }).success
    expect(p(['أ', 'ب'], ['a', 'b'])).toBe(true)
    expect(p(['أ', 'ب'], ['a'])).toBe(false)
  })
})

describe('block registry', () => {
  it('stays within the 16-type cap the plan sets', () => {
    expect(Object.keys(BLOCK_LEVELS).length).toBeLessThanOrEqual(16)
  })

  it('allows practice_sim only at L3', () => {
    expect(BLOCK_LEVELS.practice_sim).toEqual(['L3'])
  })
})
