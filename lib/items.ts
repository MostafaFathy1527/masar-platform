import bank1 from '@/content/courses/rcm-foundations/items/mi-01-04-09-10-13.json'
import bank2 from '@/content/courses/rcm-foundations/items/mi-05-06-07.json'
// The pipeline drafts' formative items, so a draft read under /samples renders
// its knowledge checks. Every item in these files is formative; the gate that
// keeps scored items out of the browser still holds because none exist here.
import draftSec from '@/pipeline/out/lesson-sec-01/v1/items.json'
import draftCs from '@/pipeline/out/lesson-cs-01/v1/items.json'
import draftPrv from '@/pipeline/out/lesson-prv-01/v1/items.json'

/**
 * The item bank, as static content.
 *
 * Imported rather than read from the database, for the same reason the lesson
 * reader is: a knowledge check that only renders when a port is open is a check
 * that cannot be reviewed. The bank is committed content, so bundling it is
 * both correct and the simplest thing that works inside the client-rendered
 * block tree.
 *
 * Only FORMATIVE items are exposed here. Scored items must never reach the
 * browser as content — that is the same rule that strips answer keys from an
 * in-progress attempt, and importing the whole bank into a client bundle would
 * break it wholesale.
 */

export type ItemOption = {
  textAr: string
  textEn: string
  isCorrect: boolean
  feedbackAr: string
  feedbackEn: string
}

export type Item = {
  key: string
  objectiveId: string
  type: 'MCQ_SINGLE' | 'MULTI_SELECT'
  bloom: string
  formative?: boolean
  stemAr: string
  stemEn: string
  rationaleAr: string
  rationaleEn: string
  options: ItemOption[]
}

const ALL = [
  ...(bank1.items as Item[]),
  ...(bank2.items as Item[]),
  ...(draftSec.items as Item[]),
  ...(draftCs.items as Item[]),
  ...(draftPrv.items as Item[]),
]

const FORMATIVE = new Map<string, Item>(
  ALL.filter((i) => i.formative === true).map((i) => [i.key, i]),
)

export function formativeItem(key: string): Item | null {
  return FORMATIVE.get(key) ?? null
}

/** Every formative key, for the test that asserts no lesson references a missing one. */
export function formativeKeys(): string[] {
  return [...FORMATIVE.keys()].sort()
}
