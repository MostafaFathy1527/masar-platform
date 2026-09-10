import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LessonDoc } from '@/lib/schema/lesson'

// A hand-rolled walk. fs.globSync is available now that the types match the
// runtime, but this stays explicit and dependency-free.
function walk(dir: string): string[] {
  let out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out = out.concat(walk(full))
    else if (entry.endsWith('.json')) out.push(full)
  }
  return out
}

// Only lesson documents. content/courses also holds simulations, which are a
// different shape and are validated by their own tests. Checked by path
// segment rather than by regex, so it works with either path separator.
const files = walk('content/courses').filter((f) =>
  f.split(sep).includes('lessons'),
)

// Forbidden licensed code sets (docs/CONVENTIONS.md). Everything in the demo course is a
// fictional training code, and this keeps that true as content grows — a rule
// enforced by a machine rather than remembered at 1am.
const FORBIDDEN: Array<[string, RegExp]> = [
  ['CPT', /\bCPT\b/i],
  ['HCPCS', /\bHCPCS\b/i],
  ['CDT', /\bCDT\b/i],
  ['DRG', /\bDRG\b/i],
  ['X12 adjustment code', /(^|[^A-Za-z])(CO|PR|OA|PI|CR)-?\d{1,3}\b/],
  ['X12 remark code N', /\bN\d{3}\b/],
  ['X12 remark code M', /\bM\d{2,3}\b/],
]

describe('authored lesson content', () => {
  it('finds lesson files to check', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const file of files) {
    describe(file, () => {
      const raw = readFileSync(file, 'utf-8')

      it('validates against the LessonDoc schema', () => {
        const result = LessonDoc.safeParse(JSON.parse(raw))
        if (!result.success) {
          throw new Error(`${file}\n${JSON.stringify(result.error.issues, null, 2)}`)
        }
        expect(result.success).toBe(true)
      })

      it('uses no real licensed code set', () => {
        for (const [name, pattern] of FORBIDDEN) {
          expect(raw, `matched forbidden ${name}`).not.toMatch(pattern)
        }
      })

      it('ships blocks for every level it declares', () => {
        const doc = LessonDoc.parse(JSON.parse(raw))
        for (const level of doc.levels) {
          const key = level.toLowerCase() as 'l1' | 'l2' | 'l3'
          expect(doc.blocks[key]?.length ?? 0).toBeGreaterThan(0)
        }
      })
    })
  }
})
