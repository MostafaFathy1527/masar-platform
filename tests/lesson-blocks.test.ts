import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const LESSON_DIR = 'content/courses/rcm-foundations/lessons'
const ITEM_DIR = 'content/courses/rcm-foundations/items'

type Block = { id: string; type: string; payload: Record<string, unknown> }

function lessons() {
  return readdirSync(LESSON_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: f, doc: JSON.parse(readFileSync(`${LESSON_DIR}/${f}`, 'utf-8')) }))
}

function items() {
  return readdirSync(ITEM_DIR)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(`${ITEM_DIR}/${f}`, 'utf-8')).items as Array<{
      key: string
      formative?: boolean
    }>)
}

function allBlocks() {
  return lessons().flatMap(({ file, doc }) =>
    Object.entries(doc.blocks as Record<string, Block[]>).flatMap(([level, blocks]) =>
      blocks.map((b) => ({ file, level, ...b })),
    ),
  )
}

describe('lesson blocks resolve to real content', () => {
  // A knowledge_check carries only an itemRef. Nothing validated that the
  // reference resolved: while every check rendered a "ships in Week 4"
  // placeholder, a dangling ref and a real one looked identical on the page.
  it('every knowledge_check points at an item that exists and is formative', () => {
    const byKey = new Map(items().map((i) => [i.key, i]))
    const checks = allBlocks().filter((b) => b.type === 'knowledge_check')
    expect(checks.length).toBeGreaterThan(0)

    for (const c of checks) {
      const ref = String(c.payload.itemRef)
      const item = byKey.get(ref)
      expect(item, `${c.file} ${c.id} references missing item ${ref}`).toBeDefined()
      expect(
        item?.formative,
        `${c.file} ${c.id} references ${ref}, which is a scored item — a lesson must never embed one`,
      ).toBe(true)
    }
  })

  it('every practice_sim points at a simulation that exists in content', () => {
    const sims = readdirSync('content/courses/rcm-foundations/simulations')
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(`content/courses/rcm-foundations/simulations/${f}`, 'utf-8')).slug)

    for (const b of allBlocks().filter((x) => x.type === 'practice_sim')) {
      expect(sims, `${b.file} ${b.id} references unknown simulation`).toContain(
        String(b.payload.simSlug),
      )
    }
  })
})

describe('no block ships a build-schedule placeholder', () => {
  // The flagship lesson rendered "This check renders once the item bank ships
  // (Week 4)" and "The simulation ships in Week 3" long after both shipped —
  // the same stale-fact sub-pattern as the "Week 1 — under construction" badge,
  // and worse, because it made the L2 and L3 level labels claims the artefact
  // did not support.
  it('block components do not promise work that has already shipped', () => {
    const files = readdirSync('components/blocks').filter((f) => f.endsWith('.tsx'))
    const offenders: string[] = []

    for (const f of files) {
      const src = readFileSync(`components/blocks/${f}`, 'utf-8')
      // Strip comments: the components explain the old bug in prose.
      const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
      if (/ships in Week|renders once|الأسبوع الثالث|الأسبوع الرابع/.test(code)) offenders.push(f)
    }

    expect(offenders, 'these render a "coming in Week N" placeholder').toEqual([])
  })
})
