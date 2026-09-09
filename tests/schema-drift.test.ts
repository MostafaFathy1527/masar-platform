import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  buildLessonJsonSchema,
  LESSON_SCHEMA_PATH,
  serialiseSchema,
} from '@/lib/schema/export'

// The project rules: lib/schema/lesson.ts is the single source of truth, and
// the JSON Schema must be regenerated after any change. This makes that
// mechanical rather than remembered — if someone edits the Zod schema and
// forgets `npm run schema:export`, CI fails here instead of the Python
// pipeline silently validating against a stale contract.
describe('generated JSON Schema', () => {
  it('matches the committed file', () => {
    const committed = readFileSync(LESSON_SCHEMA_PATH, 'utf-8')
    expect(committed).toBe(serialiseSchema(buildLessonJsonSchema()))
  })
})
