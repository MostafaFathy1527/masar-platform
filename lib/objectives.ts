/**
 * Objective statements, keyed by code.
 *
 * A code on its own — "MI-05" — tells a buyer nothing. The statement is what
 * says whether the course teaches the thing they need.
 *
 * The English statements are the ones already written in `BUILD.md` section 5,
 * reproduced verbatim rather than re-worded, so the page and the brief cannot
 * drift apart.
 *
 * THE ARABIC IS DELIBERATELY ABSENT. Objectives are written, not translated —
 * an objective is a claim about observable behaviour, and rendering that into
 * Arabic is instructional-design work, not a translation pass. Inventing them
 * here would put fabricated learning objectives on a public page. Until they
 * are written by the owner, the Arabic page shows the code with the English
 * statement beneath it and says so: visibly incomplete beats silently
 * meaningless.
 */

export type Objective = {
  code: string
  en: string
  /** Written by the owner. See the note above; do not fill these in. */
  ar?: string
}

export const OBJECTIVES: Record<string, Objective> = {
  'MI-01': {
    code: 'MI-01',
    en: 'Identify the parties in an insurance transaction and the money flow between them',
  },
  'MI-04': {
    code: 'MI-04',
    en: 'Perform an eligibility check and decide proceed / pre-auth / self-pay',
  },
  'MI-05': {
    code: 'MI-05',
    en: 'Sequence the claim lifecycle and name the artefact produced at each stage',
  },
  'MI-06': {
    code: 'MI-06',
    en: "Complete a claim's required data elements and identify missing or contradictory fields",
  },
  'MI-07': {
    code: 'MI-07',
    en: 'Judge whether documentation supports the services billed',
  },
  'MI-09': {
    code: 'MI-09',
    en: 'Distinguish a rejection from a denial and classify a denial by root cause',
  },
  'MI-10': {
    code: 'MI-10',
    en: 'Choose the correct corrective action for a denial',
  },
  // MI-13 is the one objective with no row in BUILD.md section 5, which still
  // says "Twelve objectives, MI-01…MI-12". It was added in Week 5 and the brief
  // was never extended. This statement is taken from the description in
  // docs/STATUS.md — "MI-13 covers fraud, waste and abuse" — and is the topic
  // rather than a behavioural objective, because no behavioural statement for
  // it has ever been written down.
  'MI-13': {
    code: 'MI-13',
    en: 'Recognise fraud, waste and abuse in claims and documentation',
  },
}

export function objectiveFor(code: string): Objective {
  return OBJECTIVES[code] ?? { code, en: '' }
}
