import { readFileSync } from 'node:fs'

/**
 * How many failures are recorded in `docs/design/what-failed.md`.
 *
 * The count is read from the document rather than restated on the pages that
 * cite it. Both case-study locales, and anything else that wants the number,
 * derive it from the one file that actually holds the entries.
 *
 * This is the same repair as the exam lead reading `itemCount` from the
 * assessment row. The exam page said "nine questions" and served sixteen; the
 * Arabic case study said "ستة إخفاقات" while the document held nine. Both were
 * hardcoded facts that were true when written, and in both cases the falsehood
 * was created by a change somewhere else.
 *
 * The Arabic one is the more instructive of the two. Every count check run on
 * this project — by the agent and by the owner — had been run against English
 * text. The Arabic summary is hand-written prose that no test reads and no grep
 * pattern was written for, which made it the one surface where a stale number
 * could sit indefinitely. A number that is derived cannot sit stale in any
 * language.
 */

const DOC = 'docs/design/what-failed.md'

/** Matches the numbered entry headings: `## 1.` … `## 12.` */
const ENTRY_HEADING = /^## \d+\./gm

export function failureCount(): number {
  const src = readFileSync(DOC, 'utf-8')
  const n = src.match(ENTRY_HEADING)?.length ?? 0
  if (n === 0) {
    // Refusing to render a zero is deliberate. A count that silently reads 0
    // because a heading style changed would be the same class of quiet
    // wrongness this function exists to remove.
    throw new Error(`${DOC}: found no numbered entries — the heading format changed`)
  }
  return n
}
