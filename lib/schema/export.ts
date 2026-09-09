import { z } from 'zod'
import { LessonDoc } from './lesson'

/**
 * Builds the JSON Schema published to the Python content pipeline.
 *
 * Shared by scripts/export-schema.mts and by the drift test, so the test
 * cannot pass against different options than the generator uses.
 *
 * Zod's cross-field rules (.refine / .superRefine) have no JSON Schema
 * equivalent and are dropped. The Python side therefore treats this file as
 * structural validation only; the semantic rules live in lib/schema/lesson.ts
 * and in pipeline/validate.py.
 */
export function buildLessonJsonSchema(): Record<string, unknown> {
  const schema = z.toJSONSchema(LessonDoc, {
    target: 'draft-2020-12',
    unrepresentable: 'any',
    io: 'input',
  })
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://masar.mostafafathy.com/schema/lesson.schema.json',
    title: 'Masar LessonDoc',
    description:
      'GENERATED from lib/schema/lesson.ts by scripts/export-schema.mts. Do not edit by hand. Structural rules only; cross-field rules live in the Zod schema and pipeline/validate.py.',
    ...schema,
  }
}

export const LESSON_SCHEMA_PATH = 'content/schema/lesson.schema.json'
export const serialiseSchema = (s: Record<string, unknown>) =>
  JSON.stringify(s, null, 2) + '\n'
