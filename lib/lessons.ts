import { readFileSync, readdirSync } from 'node:fs'
import { LessonDoc } from '@/lib/schema/lesson'

/**
 * The lesson index, read from the content files.
 *
 * The content files are the source of truth — that is section 0.3's ownership
 * story — and reading them here means the course index and the reader cannot
 * disagree about which lessons exist. It also means a lesson can be read while
 * the database is unreachable, which on this network is a real condition rather
 * than a hypothetical: a reader that breaks when 5432 is blocked is a reader
 * that cannot be reviewed, and reviewing the lessons is the one open item that
 * everything else waits on.
 */

export const LESSON_DIR = 'content/courses/rcm-foundations/lessons'

export type LessonSummary = {
  slug: string
  /** Position in reading order, 1-based, from the numbered filenames. */
  order: number
  titleAr: string
  titleEn: string
  estMinutes: number
  levels: string[]
  /** Absent in the source means bilingual; the English-only lessons say so. */
  bilingual: boolean
  objectives: string[]
  blockCounts: Record<string, number>
}

function summarise(file: string, order: number): LessonSummary {
  const d = JSON.parse(readFileSync(`${LESSON_DIR}/${file}`, 'utf-8'))
  return {
    slug: d.slug,
    order,
    titleAr: d.titleAr,
    titleEn: d.titleEn,
    estMinutes: d.estMinutes,
    levels: d.levels,
    bilingual: d.bilingual !== false,
    objectives: d.objectives ?? [],
    blockCounts: Object.fromEntries(
      Object.entries(d.blocks ?? {}).map(([k, v]) => [k, (v as unknown[]).length]),
    ),
  }
}

/** Filenames are numbered, so sorting them is the authored reading order. */
export function lessonFiles(): string[] {
  return readdirSync(LESSON_DIR).filter((f) => f.endsWith('.json')).sort()
}

export function lessonIndex(): LessonSummary[] {
  return lessonFiles().map((f, i) => summarise(f, i + 1))
}

/**
 * One lesson, fully parsed against the schema.
 *
 * Parsed rather than cast: invalid content fails here rather than rendering
 * something half-formed, which is the same choice /depth makes.
 */
export function lessonBySlug(slug: string) {
  for (const file of lessonFiles()) {
    const raw = JSON.parse(readFileSync(`${LESSON_DIR}/${file}`, 'utf-8'))
    if (raw.slug === slug) return LessonDoc.parse(raw)
  }
  return null
}

/** Previous and next in authored order, for reading straight through. */
export function lessonNeighbours(slug: string) {
  const all = lessonIndex()
  const i = all.findIndex((l) => l.slug === slug)
  if (i === -1) return { previous: null, next: null, position: null, total: all.length }
  return {
    previous: i > 0 ? all[i - 1] : null,
    next: i < all.length - 1 ? all[i + 1] : null,
    position: i + 1,
    total: all.length,
  }
}

/** The deepest level a lesson declares — what a reader should open on. */
export function deepestLevel(levels: string[]): 'L1' | 'L2' | 'L3' {
  const order = ['L1', 'L2', 'L3'] as const
  const declared = levels.map((x) => x.toUpperCase())
  for (const level of [...order].reverse()) {
    if (declared.includes(level)) return level
  }
  return 'L1'
}
