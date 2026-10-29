import type { Block, LessonDoc } from '@/lib/schema/lesson'

/**
 * A lesson cut into the passages "Ask the lesson" may answer from.
 *
 * One passage per block, so a citation is a block id and the reader can scroll
 * to it. Pure and dependency-free (docs/CONVENTIONS.md, "Code"): what a learner
 * can be told is decided here, and it is tested without a network.
 *
 * What is left out matters as much as what is kept. A knowledge check is only an
 * item reference, and its answer lives in the item bank, so it has no text here.
 * A scenario keeps its situation but not its options, so the model has nothing to
 * pick from; a sort-buckets block keeps its cards but never where they go. Otherwise the learner could ask the lesson for the answer to the
 * question the lesson is about to ask them.
 */

export type Passage = { blockId: string; level: 'L1' | 'L2' | 'L3'; text: string }

type Lesson = LessonDoc
type Side = 'ar' | 'en'

const s = (side: Side, ar: string | undefined, en: string | undefined) =>
  ((side === 'ar' ? ar : en) ?? ar ?? '').trim()

export function blockText(block: Block, side: Side): string {
  switch (block.type) {
    case 'heading':
      return s(side, block.payload.textAr, block.payload.textEn)
    case 'rich_text':
    case 'job_tip':
      return s(side, block.payload.mdAr, block.payload.mdEn)
    case 'definition_card': {
      const d = block.payload
      const example = s(side, d.exampleAr, d.exampleEn)
      return [`${s(side, d.termAr, d.termEn)}: ${s(side, d.defAr, d.defEn)}`, example].filter(Boolean).join('\n')
    }
    case 'compare_table': {
      const t = block.payload
      const head = t.columns.map((c) => s(side, c.labelAr, c.labelEn)).join(' | ')
      const rows = t.rows.map((r) => r.map((c) => s(side, c.textAr, c.textEn)).join(' | '))
      return [s(side, t.captionAr, t.captionEn), head, ...rows].join('\n')
    }
    case 'process_flow':
      return block.payload.steps
        .map((st, i) => `${i + 1}. ${s(side, st.labelAr, st.labelEn)}: ${s(side, st.detailAr, st.detailEn)}`)
        .join('\n')
    case 'takeaways':
      return (side === 'ar' ? block.payload.itemsAr : block.payload.itemsEn).map((i) => `- ${i}`).join('\n')
    case 'worked_example': {
      const w = block.payload
      return [
        s(side, w.promptAr, w.promptEn),
        ...w.steps.map((st) => `${s(side, st.showAr, st.showEn)} (${s(side, st.whyAr, st.whyEn)})`),
        s(side, w.answerAr, w.answerEn),
      ].join('\n')
    }
    case 'scenario': {
      const sc = block.payload
      return s(side, sc.situationAr, sc.situationEn)
    }
    case 'sort_buckets':
      return block.payload.cards.map((c) => `- ${s(side, c.textAr, c.textEn)}`).join('\n')
    case 'knowledge_check':
    case 'practice_sim':
      return ''
    default: {
      const exhaustive: never = block
      return exhaustive
    }
  }
}

/**
 * Every passage of a lesson, in reading order. An English-only lesson is read in
 * English whatever the locale, because its Arabic fields hold English too.
 */
export function lessonPassages(lesson: Lesson, locale: Side): Passage[] {
  const side: Side = lesson.bilingual === false ? 'en' : locale
  const levels = [
    ['L1', lesson.blocks.l1],
    ['L2', lesson.blocks.l2],
    ['L3', lesson.blocks.l3],
  ] as const
  const out: Passage[] = []
  for (const [level, blocks] of levels) {
    for (const block of blocks ?? []) {
      const text = blockText(block, side)
      if (text) out.push({ blockId: block.id, level, text })
    }
  }
  return out
}

/**
 * Where each block is, for the links under an answer: the nearest heading at or
 * before it, and the level it belongs to (so the reader can switch to it).
 */
export function askSources(lesson: Lesson, locale: Side): Record<string, { label: string; level: Passage['level'] }> {
  const side: Side = lesson.bilingual === false ? 'en' : locale
  const out: Record<string, { label: string; level: Passage['level'] }> = {}
  let heading = s(side, lesson.titleAr, lesson.titleEn)
  for (const [level, blocks] of [
    ['L1', lesson.blocks.l1],
    ['L2', lesson.blocks.l2],
    ['L3', lesson.blocks.l3],
  ] as const) {
    for (const block of blocks ?? []) {
      if (block.type === 'heading') heading = s(side, block.payload.textAr, block.payload.textEn)
      out[block.id] = { label: heading, level }
    }
  }
  return out
}
