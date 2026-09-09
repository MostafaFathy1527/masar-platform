import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { failureCount } from '@/lib/failures'

const PAGE = 'app/[locale]/case-study/page.tsx'
const DOC = 'docs/design/what-failed.md'

describe('the failure count is derived, not restated', () => {
  it('reads the number of entries from the document', () => {
    const headings = readFileSync(DOC, 'utf-8').match(/^## \d+\./gm) ?? []
    expect(failureCount()).toBe(headings.length)
    expect(failureCount()).toBeGreaterThan(0)
  })

  it('throws rather than reporting zero if the heading format changes', () => {
    // failureCount refuses to return 0, because a count that silently read zero
    // would be the same quiet wrongness this whole mechanism exists to remove.
    const src = readFileSync('lib/failures.ts', 'utf-8')
    expect(src).toMatch(/throw new Error/)
  })

  // The regression this file exists for. The Arabic summary said "ستة إخفاقات"
  // — six — for as long as the document held nine, because every count check
  // ever run on this project was run against English text. Hand-written Arabic
  // prose that no test reads is the one surface where a stale number can sit
  // indefinitely, so the guard has to cover both locales.
  it('states no hardcoded failure count in either locale', () => {
    const src = readFileSync(PAGE, 'utf-8')
    // Strip comments: the explanation of the old bug quotes the stale string.
    const code = src.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\/.*$/gm, '')

    const englishLiteral = /\b(five|six|seven|eight|nine|ten|eleven|twelve|\d+)\s+so far/i
    expect(code, 'English states a literal failure count').not.toMatch(englishLiteral)

    const arabicLiteral =
      /(واحد|اثنان|ثلاثة|أربعة|خمسة|ستة|سبعة|ثمانية|تسعة|عشرة)\s*(إخفاق|اخفاق)/
    expect(code, 'Arabic states a literal failure count').not.toMatch(arabicLiteral)
  })

  it('renders the derived count in both locales', () => {
    const src = readFileSync(PAGE, 'utf-8')
    const code = src.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

    // Both the English intro and the Arabic summary interpolate it.
    expect(code).toMatch(/\{failures\}\s*so far/)
    expect(code).toMatch(/\{failures\}\s*إخفاقات/)
  })
})
