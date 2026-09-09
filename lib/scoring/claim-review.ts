/**
 * Scoring for the claim-review simulation.
 *
 * Pure and dependency-free on purpose: this is the one part
 * of the project that makes a falsifiable claim, so it must be testable without
 * a database, a request, or a rendered page.
 *
 * The published formula, which appears in the UI and the case study:
 *
 *     precision = hits / flagsMade          (0 when nothing was flagged)
 *     recall    = hits / totalErrors
 *     score     = 2 x precision x recall / (precision + recall)      // F1
 *
 * WHY F1 AND NOT A WEIGHTED SUM. The original specification used
 * `(hits/6) x 0.7 + (1 - falsePositives/flagsMade) x 0.3`. That formula does
 * not support the claim the case study makes about it. Flagging every field
 * maxes recall, and the recall weight alone (0.70) already reaches the pass
 * mark, so a shotgun strategy scored 79% against 77% for reading four fields
 * carefully — better, not worse. The linear form only delivers the claim when
 * the claim form has more than 27 flaggable fields; this one has 19, and
 * padding the form to fit the metric would be the wrong repair. It also paid
 * out the full precision weight for flagging nothing, scoring 30% for no work.
 *
 * The harmonic mean fixes both by construction, at any field count: it is
 * dominated by whichever of precision and recall is worse, so buying recall by
 * flagging everything costs more than it gains. Shotgun scores 48%, four
 * careful fields score 80%, and doing nothing scores 0.
 *
 * The tests in tests/scoring-claim-review.test.ts encode the claim rather than
 * the implementation, so if a future change breaks the claim again, it fails
 * there rather than in front of a reviewer.
 */

export const DEFAULT_PASS_PCT = 70

export type ErrorClass =
  | 'DEMOGRAPHIC_MISMATCH'
  | 'DATE_LOGIC'
  | 'UNDOCUMENTED_SERVICE'
  | 'SPECIFICITY'
  | 'MISSING_ELEMENT'
  | 'ARITHMETIC'

export interface SeededError {
  id: string
  /** The claim field or line this error lives on. */
  fieldKey: string
  class: ErrorClass
  whyAr: string
  whyEn: string
  /** The block that taught this. Every miss links back to it — without that
   *  link this is a quiz with a nicer skin. */
  teachesBlockId: string
}

export interface ScoreInput {
  seededErrors: SeededError[]
  /** Every key the learner could have flagged. */
  flaggableKeys: string[]
  /** The keys the learner actually flagged. Duplicates and unknown keys are
   *  ignored rather than silently scored. */
  flagged: string[]
  passPct?: number
}

export interface ErrorOutcome {
  id: string
  fieldKey: string
  class: ErrorClass
  found: boolean
  whyAr: string
  whyEn: string
  teachesBlockId: string
}

export interface ScoreResult {
  hits: number
  misses: number
  falsePositives: number
  flagsMade: number
  totalErrors: number
  /** hits / flagsMade, 0..1. Zero when nothing was flagged. */
  precision: number
  /** hits / totalErrors, 0..1. */
  recall: number
  /** The F1 score, 0..1. */
  score: number
  /** 0..100, rounded. The number shown to the learner. */
  scorePct: number
  passed: boolean
  passPct: number
  /** Every seeded error, hit or missed, with its written explanation. */
  outcomes: ErrorOutcome[]
  /** Fields flagged that carried no seeded error. */
  falsePositiveKeys: string[]
}

export function scoreClaimReview(input: ScoreInput): ScoreResult {
  const passPct = input.passPct ?? DEFAULT_PASS_PCT
  const flaggable = new Set(input.flaggableKeys)

  // Ignore duplicates and keys that are not flaggable at all: a learner cannot
  // improve or damage a score by submitting the same field twice, and a
  // malformed payload must not be able to move the denominator.
  const flagged = new Set(input.flagged.filter((k) => flaggable.has(k)))

  const errorByKey = new Map(input.seededErrors.map((e) => [e.fieldKey, e]))

  const outcomes: ErrorOutcome[] = input.seededErrors.map((e) => ({
    id: e.id,
    fieldKey: e.fieldKey,
    class: e.class,
    found: flagged.has(e.fieldKey),
    whyAr: e.whyAr,
    whyEn: e.whyEn,
    teachesBlockId: e.teachesBlockId,
  }))

  const falsePositiveKeys = [...flagged].filter((k) => !errorByKey.has(k)).sort()

  const totalErrors = input.seededErrors.length
  const hits = outcomes.filter((o) => o.found).length
  const misses = totalErrors - hits
  const falsePositives = falsePositiveKeys.length
  const flagsMade = flagged.size

  const precision = flagsMade === 0 ? 0 : hits / flagsMade
  const recall = totalErrors === 0 ? 0 : hits / totalErrors
  // Guard the 0/0 case: no flags, or flags that found nothing, score zero
  // rather than producing NaN.
  const score =
    precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall)
  const scorePct = Math.round(score * 100)

  return {
    hits,
    misses,
    falsePositives,
    flagsMade,
    totalErrors,
    precision,
    recall,
    score,
    scorePct,
    passed: scorePct >= passPct,
    passPct,
    outcomes,
    falsePositiveKeys,
  }
}

/** Every key a learner may flag: one per claim field, one per claim line. */
export function flaggableKeysFor(claim: {
  fields: Array<{ key: string }>
  lines: Array<{ key: string }>
}): string[] {
  return [...claim.fields.map((f) => f.key), ...claim.lines.map((l) => l.key)]
}
