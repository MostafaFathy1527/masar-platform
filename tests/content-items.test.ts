import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ItemBankDoc } from '@/lib/schema/item'

function walk(dir: string): string[] {
  let out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out = out.concat(walk(full))
    else if (entry.endsWith('.json')) out.push(full)
  }
  return out
}

const files = walk('content/courses').filter((f) => f.split(sep).includes('items'))

const FORBIDDEN: Array<[string, RegExp]> = [
  ['CPT', /\bCPT\b/i],
  ['HCPCS', /\bHCPCS\b/i],
  ['CDT', /\bCDT\b/i],
  ['DRG', /\bDRG\b/i],
  ['X12 adjustment code', /(^|[^A-Za-z])(CO|PR|OA|PI|CR)-?\d{1,3}\b/],
  ['X12 remark code (N)', /\bN\d{3}\b/],
  ['X12 remark code (M)', /\bM\d{2,3}\b/],
]

describe('authored item banks', () => {
  it('finds item files to check', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const file of files) {
    describe(file, () => {
      const raw = readFileSync(file, 'utf-8')

      it('validates against the ItemBankDoc schema', () => {
        const r = ItemBankDoc.safeParse(JSON.parse(raw))
        if (!r.success) throw new Error(`${file}\n${JSON.stringify(r.error.issues, null, 2)}`)
        expect(r.success).toBe(true)
      })

      it('uses no real licensed code set', () => {
        for (const [name, pattern] of FORBIDDEN) {
          expect(raw, `matched forbidden ${name}`).not.toMatch(pattern)
        }
      })

      it('supplies every knowledge check the lessons reference', () => {
        const bank = ItemBankDoc.parse(JSON.parse(raw))
        const keys = new Set(bank.items.map((i) => i.key))
        const lessons = walk('content/courses').filter((f) => f.split(sep).includes('lessons'))
        for (const lessonFile of lessons) {
          const lesson = JSON.parse(readFileSync(lessonFile, 'utf-8'))
          for (const level of ['l1', 'l2', 'l3'] as const) {
            for (const b of lesson.blocks[level] ?? []) {
              if (b.type === 'knowledge_check') {
                expect(keys, `${lessonFile} references ${b.payload.itemRef}`).toContain(b.payload.itemRef)
              }
            }
          }
        }
      })
    })
  }
})
