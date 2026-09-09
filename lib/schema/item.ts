import { z } from 'zod'

/**
 * Assessment item schema. The rules here are the ones a human reviewer cannot
 * hold across a whole bank:
 *
 *  - every option carries feedback, correct or not. A distractor whose
 *    rationale does not name the misconception it represents is a QA failure,
 *    and the cheapest way to enforce that is to make a missing one unloadable.
 *  - MCQ_SINGLE has exactly one correct option; MULTI_SELECT has at least two,
 *    and never all of them — an item where every option is correct cannot
 *    discriminate and gives partial credit for indiscriminate selection.
 */

const bilingual = (min = 1) => z.string().min(min)

export const ItemOptionDoc = z.object({
  textAr: bilingual(),
  textEn: bilingual(),
  isCorrect: z.boolean(),
  feedbackAr: bilingual(4),
  feedbackEn: bilingual(4),
})

export const ItemDoc = z
  .object({
    key: z.string().regex(/^MI-\d{2}(-KC)?-\d{2}$/, 'key looks like MI-06-03 or MI-06-KC-01'),
    objectiveId: z.string().regex(/^MI-\d{2}$/),
    type: z.enum(['MCQ_SINGLE', 'MULTI_SELECT']),
    bloom: z.enum(['RECALL', 'APPLY', 'ANALYZE']),
    isScenario: z.boolean().default(false),
    formative: z.boolean().default(false),
    stemAr: bilingual(),
    stemEn: bilingual(),
    rationaleAr: bilingual(10),
    rationaleEn: bilingual(10),
    options: z.array(ItemOptionDoc).min(2).max(6),
  })
  .superRefine((item, ctx) => {
    const correct = item.options.filter((o) => o.isCorrect).length
    if (item.type === 'MCQ_SINGLE' && correct !== 1) {
      ctx.addIssue({ code: 'custom', path: ['options'], message: `MCQ_SINGLE needs exactly one correct option, found ${correct}` })
    }
    if (item.type === 'MULTI_SELECT') {
      if (correct < 2) {
        ctx.addIssue({ code: 'custom', path: ['options'], message: `MULTI_SELECT needs at least two correct options, found ${correct}` })
      }
      if (correct === item.options.length) {
        ctx.addIssue({ code: 'custom', path: ['options'], message: 'every option is correct, so the item cannot discriminate' })
      }
    }
    // The key encodes whether an item is a knowledge check; the flag must agree,
    // or a formative item can be drawn into a scored assessment.
    const keySaysFormative = item.key.includes('-KC-')
    if (keySaysFormative !== item.formative) {
      ctx.addIssue({ code: 'custom', path: ['formative'], message: `key "${item.key}" and formative=${item.formative} disagree` })
    }
    if (!item.key.startsWith(item.objectiveId)) {
      ctx.addIssue({ code: 'custom', path: ['key'], message: `key "${item.key}" does not match objective ${item.objectiveId}` })
    }
  })

export type ItemDoc = z.infer<typeof ItemDoc>

export const ItemBankDoc = z
  .object({
    courseSlug: z.string().min(1),
    note: z.string().optional(),
    items: z.array(ItemDoc).min(1),
  })
  .superRefine((bank, ctx) => {
    const seen = new Set<string>()
    for (const item of bank.items) {
      if (seen.has(item.key)) {
        ctx.addIssue({ code: 'custom', path: ['items'], message: `duplicate item key "${item.key}"` })
      }
      seen.add(item.key)
    }
  })

export type ItemBankDoc = z.infer<typeof ItemBankDoc>
