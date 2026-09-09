/**
 * Attempt scoring and the client payload boundary.
 *
 * Pure and dependency-free. This module decides grades, so
 * it is unit-tested rather than exercised through a route.
 *
 * The payload builder lives here on purpose, next to the scoring it protects:
 * whoever changes how an item is scored is looking at the function that decides
 * what a learner is allowed to see while answering it.
 */

export interface ScoredOption {
  id: string
  order: number
  textAr: string
  textEn: string
  isCorrect: boolean
  feedbackAr: string
  feedbackEn: string
}

export interface ScoredItem {
  id: string
  objectiveId: string
  type: 'MCQ_SINGLE' | 'MULTI_SELECT'
  stemAr: string
  stemEn: string
  isScenario: boolean
  rationaleAr: string
  rationaleEn: string
  options: ScoredOption[]
}

/** What the learner selected, per item id. */
export type Responses = Record<string, string[]>

// ------------------------------------------------------------------ payload

/** An option as the learner sees it DURING an attempt: text only. */
export interface PublicOption {
  id: string
  order: number
  textAr: string
  textEn: string
}

/** An item as the learner sees it DURING an attempt. */
export interface PublicItem {
  id: string
  type: 'MCQ_SINGLE' | 'MULTI_SELECT'
  stemAr: string
  stemEn: string
  isScenario: boolean
  options: PublicOption[]
}

/**
 * Strips an item down to what may cross to the client during an attempt.
 *
 * Removes `isCorrect`, every option's feedback, the item rationale, and the
 * objective code — the last because knowing which objective an item tests is
 * itself a hint. Anything not explicitly copied here does not travel, so a
 * field added to the model later is excluded by default rather than leaking
 * because someone forgot to update a blocklist.
 */
export function toPublicItem(item: ScoredItem): PublicItem {
  return {
    id: item.id,
    type: item.type,
    stemAr: item.stemAr,
    stemEn: item.stemEn,
    isScenario: item.isScenario,
    options: item.options
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((o) => ({ id: o.id, order: o.order, textAr: o.textAr, textEn: o.textEn })),
  }
}

export const toPublicItems = (items: ScoredItem[]): PublicItem[] =>
  items.map(toPublicItem)

// ------------------------------------------------------------------ scoring

export interface ItemScore {
  itemId: string
  objectiveId: string
  /** 0..1. Partial credit is possible for MULTI_SELECT. */
  credit: number
  correct: boolean
  selectedOptionIds: string[]
  correctOptionIds: string[]
}

export interface AttemptScore {
  itemScores: ItemScore[]
  /** 0..100, rounded. */
  scorePct: number
  passed: boolean
  passPct: number
  /** Per-objective percentage, for the breakdown shown after submission. */
  byObjective: Array<{ objectiveId: string; credit: number; outOf: number; pct: number }>
  /** Lowest-scoring objectives first. The v1.0 stand-in for a mastery engine:
   *  the weakest objectives from this attempt, not a longitudinal model. */
  weakestObjectives: string[]
}

/**
 * MULTI_SELECT uses `max(0, correct - incorrect) / required`, so guessing every
 * option scores zero rather than full marks. MCQ_SINGLE is all-or-nothing.
 */
export function scoreItem(item: ScoredItem, selected: string[]): ItemScore {
  const correctIds = item.options.filter((o) => o.isCorrect).map((o) => o.id)
  const validIds = new Set(item.options.map((o) => o.id))
  // Ignore duplicates and unknown option ids: a malformed payload must not be
  // able to move a score.
  const picked = [...new Set(selected.filter((id) => validIds.has(id)))]

  let credit: number
  if (item.type === 'MCQ_SINGLE') {
    credit = picked.length === 1 && correctIds.includes(picked[0]) ? 1 : 0
  } else {
    const hits = picked.filter((id) => correctIds.includes(id)).length
    const wrong = picked.length - hits
    credit = correctIds.length === 0 ? 0 : Math.max(0, hits - wrong) / correctIds.length
  }

  return {
    itemId: item.id,
    objectiveId: item.objectiveId,
    credit,
    correct: credit === 1,
    selectedOptionIds: picked,
    correctOptionIds: correctIds,
  }
}

export function scoreAttempt(
  items: ScoredItem[],
  responses: Responses,
  passPct: number,
): AttemptScore {
  const itemScores = items.map((i) => scoreItem(i, responses[i.id] ?? []))

  const total = itemScores.reduce((n, s) => n + s.credit, 0)
  const scorePct = items.length === 0 ? 0 : Math.round((total / items.length) * 100)

  const grouped = new Map<string, { credit: number; outOf: number }>()
  for (const s of itemScores) {
    const g = grouped.get(s.objectiveId) ?? { credit: 0, outOf: 0 }
    g.credit += s.credit
    g.outOf += 1
    grouped.set(s.objectiveId, g)
  }

  const byObjective = [...grouped.entries()]
    .map(([objectiveId, g]) => ({
      objectiveId,
      credit: g.credit,
      outOf: g.outOf,
      pct: Math.round((g.credit / g.outOf) * 100),
    }))
    .sort((a, b) => a.objectiveId.localeCompare(b.objectiveId))

  const weakestObjectives = [...byObjective]
    .sort((a, b) => a.pct - b.pct || a.objectiveId.localeCompare(b.objectiveId))
    .filter((o) => o.pct < 100)
    .map((o) => o.objectiveId)

  return {
    itemScores,
    scorePct,
    passed: scorePct >= passPct,
    passPct,
    byObjective,
    weakestObjectives,
  }
}
