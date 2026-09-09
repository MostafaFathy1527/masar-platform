import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import {
  buildLessonJsonSchema,
  LESSON_SCHEMA_PATH,
  serialiseSchema,
} from '../lib/schema/export.ts'

mkdirSync(dirname(LESSON_SCHEMA_PATH), { recursive: true })
writeFileSync(LESSON_SCHEMA_PATH, serialiseSchema(buildLessonJsonSchema()), 'utf-8')
console.log(`wrote ${LESSON_SCHEMA_PATH}`)
