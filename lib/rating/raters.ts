import { createHash } from 'node:crypto'

// Blind human rating of lesson samples against pipeline/rubric.md: the check on the
// model judges. Pure and dependency-free, like the scoring modules, so the rules for
// who may rate what are tested without a database or a request.

export const CRITERIA = [
  'objective_alignment',
  'level_fidelity',
  'worked_example',
  'knowledge_check',
  'scenario_authenticity',
  'bilingual_quality',
  'concision',
  'accessibility_ip',
] as const
export type Criterion = (typeof CRITERIA)[number]

/** The samples a second rater scores too, so agreement is measured on the same lessons. */
export const OVERLAP = ['L01', 'L03', 'L04', 'L05', 'L07', 'L09', 'L15', 'L18', 'L26', 'L28', 'L30', 'L38', 'L39', 'L48', 'L49']

type Rater = { id: string; codeSha256: string; scope: 'all' | 'overlap' }

// Access codes are given to each rater privately; only their hashes live here.
const RATERS: Rater[] = [
  { id: 'r1', codeSha256: 'ab8bf71f150fe3accaa637a2c8dcfe2106b41c958e44e9a20d21160e62c30573', scope: 'all' },
  { id: 'r2', codeSha256: '25a2b43146b360b33c5bcbabc9e0c4efb9021e12f6920ef03507affd2fce1429', scope: 'overlap' },
]

export function raterFor(code: string | null | undefined, raters: Rater[] = RATERS): Rater | null {
  if (!code || code.length < 16 || code.length > 64) return null
  const h = createHash('sha256').update(code).digest('hex')
  return raters.find((r) => r.codeSha256 === h) ?? null
}

export function mayRate(rater: Rater, sampleId: string, lang: 'ar' | 'en'): boolean {
  if (!/^L\d{2}$/.test(sampleId)) return false
  return rater.scope === 'all' || (OVERLAP.includes(sampleId) && lang === 'ar')
}

/** Complete means all eight criteria scored, and every score of 3 or below explained. */
export function isComplete(scores: Partial<Record<Criterion, number>>, notes: Partial<Record<Criterion, string>>): boolean {
  return CRITERIA.every((c) => {
    const s = scores[c]
    return typeof s === 'number' && (s > 3 || (notes[c] ?? '').trim().length > 0)
  })
}
