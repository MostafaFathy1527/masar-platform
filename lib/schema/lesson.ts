import { z } from 'zod'

/**
 * The lesson document schema — the single source of truth for lesson content.
 *
 * content/schema/lesson.schema.json is GENERATED from this file, so the Python
 * content pipeline and the TypeScript renderer cannot drift apart. Never edit
 * the JSON Schema by hand; run `npm run schema:export`.
 *
 * Depth is a property of a lesson, not a separate lesson: one document carries
 * up to three block arrays, so adding L2 to an L1 lesson is an additive diff —
 * no URL change, no re-enrolment, no progress reset.
 *
 * The plan caps the registry at 16 block types. Twelve are defined here; the
 * remaining headroom is deliberate and unallocated.
 */

export const LEVELS = ['L1', 'L2', 'L3'] as const
export const Level = z.enum(LEVELS)
export type Level = z.infer<typeof Level>

/** Objective codes are the spine: every block carries one. */
const ObjectiveId = z
  .string()
  .regex(/^MI-\d{2}$/, 'objectiveId must look like MI-04')

const BlockId = z.string().min(1).max(64)

/** A bilingual pair. Arabic is not optional — it is the default locale. */
const bilingual = <K extends string>(ar: K, en: K) =>
  z.object({ [ar]: z.string().min(1), [en]: z.string().min(1) })

// ---------------------------------------------------------------- payloads

const HeadingPayload = z.object({
  textAr: z.string().min(1),
  textEn: z.string().min(1),
  level: z.union([z.literal(2), z.literal(3)]),
})

const RichTextPayload = z.object({
  mdAr: z.string().min(1),
  mdEn: z.string().min(1),
})

const DefinitionCardPayload = z.object({
  termAr: z.string().min(1),
  termEn: z.string().min(1),
  defAr: z.string().min(1),
  defEn: z.string().min(1),
  icon: z.string().optional(),
  exampleAr: z.string().optional(),
  exampleEn: z.string().optional(),
})

const CompareTablePayload = z
  .object({
    captionAr: z.string().min(1),
    captionEn: z.string().min(1),
    columns: z.array(z.string().min(1)).min(2),
    rows: z.array(z.array(z.string())).min(1),
  })
  .refine(
    (p) => p.rows.every((r) => r.length === p.columns.length),
    'every row must have exactly as many cells as there are columns',
  )

const ProcessFlowPayload = z.object({
  steps: z
    .array(
      z.object({
        id: z.string().min(1),
        labelAr: z.string().min(1),
        labelEn: z.string().min(1),
        detailAr: z.string().min(1),
        detailEn: z.string().min(1),
      }),
    )
    .min(2),
  /** true turns this into the workflow-ordering exercise. */
  interactive: z.boolean().default(false),
})

const JobTipPayload = RichTextPayload

const TakeawaysPayload = z
  .object({
    itemsAr: z.array(z.string().min(1)).min(1),
    itemsEn: z.array(z.string().min(1)).min(1),
  })
  .refine(
    (p) => p.itemsAr.length === p.itemsEn.length,
    'takeaways must have the same number of items in both languages',
  )

const WorkedExamplePayload = z.object({
  promptAr: z.string().min(1),
  promptEn: z.string().min(1),
  steps: z
    .array(
      z.object({
        showAr: z.string().min(1),
        showEn: z.string().min(1),
        whyAr: z.string().min(1),
        whyEn: z.string().min(1),
      }),
    )
    .min(1),
  answerAr: z.string().min(1),
  answerEn: z.string().min(1),
})

/** Points at an Item marked formative. Never scored, never in the gradebook. */
const KnowledgeCheckPayload = z.object({ itemRef: z.string().min(1) })

const ScenarioPayload = z
  .object({
    situationAr: z.string().min(1),
    situationEn: z.string().min(1),
    decisions: z
      .array(
        z.object({
          id: z.string().min(1),
          optionAr: z.string().min(1),
          optionEn: z.string().min(1),
          consequenceAr: z.string().min(1),
          consequenceEn: z.string().min(1),
          isBest: z.boolean(),
        }),
      )
      .min(2),
  })
  .refine(
    (p) => p.decisions.filter((d) => d.isBest).length === 1,
    'a scenario must have exactly one best decision',
  )

const SortBucketsPayload = z
  .object({
    buckets: z
      .array(
        z.object({
          id: z.string().min(1),
          labelAr: z.string().min(1),
          labelEn: z.string().min(1),
        }),
      )
      .min(2),
    cards: z
      .array(
        z.object({
          id: z.string().min(1),
          textAr: z.string().min(1),
          textEn: z.string().min(1),
          bucketId: z.string().min(1),
          whyAr: z.string().min(1),
          whyEn: z.string().min(1),
        }),
      )
      .min(2),
  })
  .refine(
    (p) => p.cards.every((c) => p.buckets.some((b) => b.id === c.bucketId)),
    'every card must name a bucket that exists',
  )

const PracticeSimPayload = z.object({ simSlug: z.string().min(1) })

// ------------------------------------------------------------------ blocks

/** Which levels each block type may appear at. Enforced by the QA gate. */
export const BLOCK_LEVELS = {
  heading: ['L1', 'L2', 'L3'],
  rich_text: ['L1', 'L2', 'L3'],
  definition_card: ['L1', 'L2', 'L3'],
  compare_table: ['L1', 'L2', 'L3'],
  process_flow: ['L1', 'L2', 'L3'],
  job_tip: ['L1', 'L2', 'L3'],
  takeaways: ['L1', 'L2', 'L3'],
  worked_example: ['L2', 'L3'],
  knowledge_check: ['L2', 'L3'],
  scenario: ['L2', 'L3'],
  sort_buckets: ['L2', 'L3'],
  practice_sim: ['L3'],
} as const satisfies Record<string, readonly Level[]>

export type BlockType = keyof typeof BLOCK_LEVELS

const block = <T extends BlockType, P extends z.ZodTypeAny>(type: T, payload: P) =>
  z.object({
    id: BlockId,
    type: z.literal(type),
    objectiveId: ObjectiveId,
    payload,
  })

export const Block = z.discriminatedUnion('type', [
  block('heading', HeadingPayload),
  block('rich_text', RichTextPayload),
  block('definition_card', DefinitionCardPayload),
  block('compare_table', CompareTablePayload),
  block('process_flow', ProcessFlowPayload),
  block('job_tip', JobTipPayload),
  block('takeaways', TakeawaysPayload),
  block('worked_example', WorkedExamplePayload),
  block('knowledge_check', KnowledgeCheckPayload),
  block('scenario', ScenarioPayload),
  block('sort_buckets', SortBucketsPayload),
  block('practice_sim', PracticeSimPayload),
])
export type Block = z.infer<typeof Block>

// ---------------------------------------------------------------- document

const BlockArray = z.array(Block)

export const LessonDoc = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case'),
    titleAr: z.string().min(1),
    titleEn: z.string().min(1),
    estMinutes: z.number().int().positive().max(300),
    levels: z.array(Level).min(1),
    objectives: z.array(ObjectiveId).min(1),
    conceptsIntroduced: z.array(z.string().min(1)).default([]),
    blocks: z.object({
      l1: BlockArray.optional(),
      l2: BlockArray.optional(),
      l3: BlockArray.optional(),
    }),
  })
  // A declared level must actually have blocks, and blocks must not exist for
  // a level the lesson does not declare. Either mismatch means the renderer
  // and the depth switch would disagree about what is publishable.
  .superRefine((doc, ctx) => {
    for (const level of LEVELS) {
      const key = level.toLowerCase() as 'l1' | 'l2' | 'l3'
      const declared = doc.levels.includes(level)
      const present = (doc.blocks[key]?.length ?? 0) > 0
      if (declared && !present) {
        ctx.addIssue({
          code: 'custom',
          path: ['blocks', key],
          message: `level ${level} is declared but has no blocks`,
        })
      }
      if (!declared && present) {
        ctx.addIssue({
          code: 'custom',
          path: ['levels'],
          message: `blocks exist for ${level} but the level is not declared`,
        })
      }
    }

    // Block ids must be unique across the whole document, not just per level:
    // BlockInteraction rows key on them, so a duplicate silently merges two
    // different blocks' analytics.
    const seen = new Map<string, string>()
    for (const key of ['l1', 'l2', 'l3'] as const) {
      for (const b of doc.blocks[key] ?? []) {
        const prior = seen.get(b.id)
        if (prior) {
          ctx.addIssue({
            code: 'custom',
            path: ['blocks', key],
            message: `duplicate block id "${b.id}" (also in ${prior})`,
          })
        }
        seen.set(b.id, key)
      }
    }

    // A block may only appear at a level its type allows.
    for (const key of ['l1', 'l2', 'l3'] as const) {
      const level = key.toUpperCase() as Level
      for (const b of doc.blocks[key] ?? []) {
        const allowed: readonly Level[] = BLOCK_LEVELS[b.type]
        if (!allowed.includes(level)) {
          ctx.addIssue({
            code: 'custom',
            path: ['blocks', key],
            message: `block type "${b.type}" is not allowed at ${level}`,
          })
        }
      }
    }
  })

export type LessonDoc = z.infer<typeof LessonDoc>
