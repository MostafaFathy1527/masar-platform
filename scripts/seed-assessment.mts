import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { getDb } from '../lib/db.ts'
import { ItemBankDoc } from '../lib/schema/item.ts'
import { assemble, blueprintSize, type PoolItem } from '../lib/assessment/assembly.ts'

// Loads the item bank from git into the database, and defines the two
// assessments v1.0 ships: a lesson quiz and one blueprint-sampled exam.
// Content stays in git; the database is a load target, not the source.

const BANKS = [
  'content/courses/rcm-foundations/items/mi-05-06-07.json',
  'content/courses/rcm-foundations/items/mi-01-04-09-10-13.json',
]
const COURSE_SLUG = 'rcm-foundations'
const LESSON_SLUG = 'anatomy-of-a-claim'

const bank = {
  items: BANKS.flatMap((f) => ItemBankDoc.parse(JSON.parse(readFileSync(f, 'utf-8'))).items),
}
const db = getDb()

const course = await db.course.findUnique({ where: { slug: COURSE_SLUG } })
if (!course) throw new Error(`Course ${COURSE_SLUG} not found — run seed-simulation first`)

// Items are keyed by their content key so re-running updates rather than
// duplicating. Prisma has no upsert on a non-unique pair here, so options are
// replaced wholesale: an item's options are a unit, and a partial update would
// leave a stale distractor with no feedback.
let created = 0
for (const item of bank.items) {
  const existing = await db.item.findFirst({
    where: { courseId: course.id, stemEn: item.stemEn },
    select: { id: true },
  })
  const data = {
    courseId: course.id,
    objectiveId: item.objectiveId,
    type: item.type,
    stemAr: item.stemAr,
    stemEn: item.stemEn,
    bloom: item.bloom,
    formative: item.formative,
    rationaleAr: item.rationaleAr,
    rationaleEn: item.rationaleEn,
    // Authored by hand and reviewed, so these go straight to LIVE. Pipeline
    // output will arrive as DRAFT and require a human to publish.
    status: 'LIVE' as const,
    authoredBy: 'HUMAN' as const,
  }
  const row = existing
    ? await db.item.update({ where: { id: existing.id }, data })
    : await db.item.create({ data })
  if (!existing) created++

  await db.itemOption.deleteMany({ where: { itemId: row.id } })
  await db.itemOption.createMany({
    data: item.options.map((o, i) => ({
      itemId: row.id,
      order: i + 1,
      textAr: o.textAr,
      textEn: o.textEn,
      isCorrect: o.isCorrect,
      feedbackAr: o.feedbackAr,
      feedbackEn: o.feedbackEn,
    })),
  })
}

// Blueprints are checked against the real pool here rather than discovered to
// be impossible when a learner starts an attempt.
// The lesson quiz stays on the flagship's objectives; the exam samples across
// every objective the course teaches, which is what makes it blueprint-driven
// rather than a pile of questions.
const QUIZ_BLUEPRINT = { 'MI-05': 2, 'MI-06': 3 }
const EXAM_BLUEPRINT = {
  'MI-01': 2, 'MI-04': 2, 'MI-05': 2, 'MI-06': 2,
  'MI-07': 2, 'MI-09': 2, 'MI-10': 2, 'MI-13': 2,
}

const pool: PoolItem[] = (
  await db.item.findMany({
    where: { courseId: course.id },
    select: { id: true, objectiveId: true, formative: true, status: true },
  })
).map((i) => ({ ...i, status: i.status as PoolItem['status'] }))

for (const [name, bp] of [
  ['lesson quiz', QUIZ_BLUEPRINT],
  ['exam', EXAM_BLUEPRINT],
] as const) {
  assemble(pool, bp, 'seed-check') // throws ThinPoolError if the bank is short
  console.log(`${name} blueprint is satisfiable: ${blueprintSize(bp)} items`)
}

const quiz = await db.assessment.upsert({
  where: { id: (await db.assessment.findFirst({ where: { courseId: course.id, scope: 'LESSON', scopeId: LESSON_SLUG } }))?.id ?? '' },
  update: { itemCount: blueprintSize(QUIZ_BLUEPRINT), assemblyJson: QUIZ_BLUEPRINT, passPct: 70 },
  create: {
    courseId: course.id,
    scope: 'LESSON',
    scopeId: LESSON_SLUG,
    itemCount: blueprintSize(QUIZ_BLUEPRINT),
    passPct: 70,
    assemblyJson: QUIZ_BLUEPRINT,
  },
})

const exam = await db.assessment.upsert({
  where: { id: (await db.assessment.findFirst({ where: { courseId: course.id, scope: 'EXAM' } }))?.id ?? '' },
  update: { itemCount: blueprintSize(EXAM_BLUEPRINT), assemblyJson: EXAM_BLUEPRINT, passPct: 75, timeLimitSec: 60 * 30 },
  create: {
    courseId: course.id,
    scope: 'EXAM',
    itemCount: blueprintSize(EXAM_BLUEPRINT),
    passPct: 75,
    timeLimitSec: 60 * 30,
    assemblyJson: EXAM_BLUEPRINT,
  },
})

const counts = await db.item.groupBy({
  by: ['formative'],
  where: { courseId: course.id },
  _count: true,
})
console.log(`items: ${counts.map((c) => `${c._count} ${c.formative ? 'formative' : 'scored'}`).join(', ')} (${created} new)`)
console.log(`quiz ${quiz.id} pass ${quiz.passPct}%  ·  exam ${exam.id} pass ${exam.passPct}%`)
await db.$disconnect()
