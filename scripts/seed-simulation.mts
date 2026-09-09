import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { getDb } from '../lib/db.ts'

// Upserts the claim-review simulation from its content file. Content lives in
// git and is loaded into the database, rather than the database being the
// source of truth — which is what makes the content exportable and the
// ownership story real.
const SIM_PATH = 'content/courses/rcm-foundations/simulations/claim-review.json'
const COURSE_SLUG = 'rcm-foundations'

const sim = JSON.parse(readFileSync(SIM_PATH, 'utf-8'))
const db = getDb()

const course = await db.course.upsert({
  where: { slug: COURSE_SLUG },
  update: {},
  create: {
    slug: COURSE_SLUG,
    titleAr: 'أساسيات التأمين الطبي ودورة الإيرادات',
    titleEn: 'Medical Insurance and Revenue Cycle Foundations',
    summaryAr: 'مقدمة تطبيقية لكيفية عمل المطالبات ودورة الإيرادات.',
    summaryEn: 'A practice-first introduction to how claims and the revenue cycle work.',
    status: 'PUBLISHED',
    // Symbolic, for demonstration only. No provider is activated and the
    // hosting plan forbids commercial use; the price never renders without
    // the sandbox banner beside it.
    priceEgp: 149900,
    priceUsd: 4900,
  },
})

const row = await db.simulation.upsert({
  where: { slug: sim.slug },
  update: {
    kind: sim.kind,
    objectiveIds: sim.objectiveIds,
    datasetJson: sim.dataset,
    seededErrorsJson: sim.seededErrors,
    scoringMode: sim.scoringMode,
    passPct: sim.passPct,
  },
  create: {
    courseId: course.id,
    slug: sim.slug,
    kind: sim.kind,
    objectiveIds: sim.objectiveIds,
    datasetJson: sim.dataset,
    seededErrorsJson: sim.seededErrors,
    scoringMode: sim.scoringMode,
    passPct: sim.passPct,
  },
})

console.log(`course   ${course.slug} (${course.id})`)
console.log(`sim      ${row.slug} (${row.id}) - ${sim.seededErrors.length} seeded errors`)
await db.$disconnect()
