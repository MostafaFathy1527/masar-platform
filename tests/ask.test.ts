import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LessonDoc } from '@/lib/schema/lesson'
import { LESSON_DIR } from '@/lib/lessons'
import { askSources, lessonPassages } from '@/lib/ask/passages'
import { readCitations, RELEVANCE_FLOOR, SYSTEM } from '@/lib/ask/cohere'
import { checkLimits, PER_DAY, PER_VISITOR_PER_HOUR, visitorCode } from '@/lib/ask/limits'

const lessons = readdirSync(LESSON_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => LessonDoc.parse(JSON.parse(readFileSync(`${LESSON_DIR}/${f}`, 'utf-8'))))

const allBlocks = (l: LessonDoc) => [...(l.blocks.l1 ?? []), ...(l.blocks.l2 ?? []), ...(l.blocks.l3 ?? [])]

describe('what "Ask the lesson" may answer from', () => {
  it.each(lessons.map((l) => [l.slug, l] as const))('%s: never the answer to its own exercises', (_, lesson) => {
    const text = lessonPassages(lesson, 'en')
      .map((p) => p.text)
      .join('\n')
    for (const block of allBlocks(lesson)) {
      if (block.type === 'scenario') {
        for (const d of block.payload.decisions) {
          expect(text).not.toContain(d.consequenceEn)
          expect(text).not.toContain(d.optionEn)
        }
      }
      if (block.type === 'sort_buckets') {
        for (const c of block.payload.cards) expect(text).not.toContain(c.whyEn)
      }
    }
  })

  it('has no passage for a knowledge check, whose answer lives in the item bank', () => {
    const checks = lessons.flatMap((l) => allBlocks(l).filter((b) => b.type === 'knowledge_check').map((b) => b.id))
    expect(checks.length).toBeGreaterThan(0)
    const ids = new Set(lessons.flatMap((l) => lessonPassages(l, 'ar').map((p) => p.blockId)))
    for (const id of checks) expect(ids.has(id)).toBe(false)
  })

  it('reads an English-only lesson in English whatever the locale', () => {
    const english = lessons.find((l) => !l.bilingual)!
    expect(lessonPassages(english, 'ar')).toEqual(lessonPassages(english, 'en'))
  })

  it('reads a bilingual lesson in the reader\'s language', () => {
    const both = lessons.find((l) => l.bilingual)!
    const ar = lessonPassages(both, 'ar').map((p) => p.text).join('')
    expect(ar).toMatch(/[؀-ۿ]/)
  })

  it('can link every passage to a place in the lesson', () => {
    for (const lesson of lessons) {
      const sources = askSources(lesson, 'ar')
      for (const p of lessonPassages(lesson, 'ar')) {
        expect(sources[p.blockId]?.label).toBeTruthy()
        expect(sources[p.blockId]?.level).toBe(p.level)
      }
    }
  })
})

describe('reading an answer', () => {
  it('turns markers into sources, in order, once each', () => {
    const r = readCitations('A payer holds the risk [b1_d_payer]. A TPA does not [b1_d_tpa][b1_d_payer].', [
      'b1_d_payer',
      'b1_d_tpa',
    ])
    expect(r.text).toBe('A payer holds the risk. A TPA does not.')
    expect(r.cites).toEqual(['b1_d_payer', 'b1_d_tpa'])
  })

  it('never links to a block the model was not given', () => {
    const r = readCitations('Invented [b9_nowhere].', ['b1_d_tpa'])
    expect(r.cites).toEqual([])
    expect(r.text).toBe('Invented [b9_nowhere].')
  })

  it('tells the model not to give away exercise answers', () => {
    expect(SYSTEM).toMatch(/so the learner makes the choice/)
    expect(RELEVANCE_FLOOR).toBeGreaterThan(0)
  })
})

describe('caps', () => {
  it('stops a visitor after the hourly number, and everyone after the daily one', () => {
    expect(checkLimits({ visitorLastHour: 0, today: 0 })).toBe('ok')
    expect(checkLimits({ visitorLastHour: PER_VISITOR_PER_HOUR, today: 0 })).toBe('visitor')
    expect(checkLimits({ visitorLastHour: 0, today: PER_DAY })).toBe('day')
  })

  it('counts a visitor within a day and cannot follow them to the next', () => {
    const a = visitorCode('203.0.113.7', new Date('2026-10-29T08:00:00Z'), 's')
    expect(visitorCode('203.0.113.7', new Date('2026-10-29T23:00:00Z'), 's')).toBe(a)
    expect(visitorCode('203.0.113.7', new Date('2026-10-30T00:00:00Z'), 's')).not.toBe(a)
    expect(a).not.toContain('203.0.113.7')
  })
})
