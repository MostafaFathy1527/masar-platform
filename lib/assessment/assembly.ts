/**
 * Blueprint-driven item assembly.
 *
 * Pure and dependency-free (docs/CONVENTIONS.md). Assembly decides what a learner
 * is asked, so it must be testable without a database.
 *
 * Two properties matter more than the sampling itself:
 *
 *   1. It is DETERMINISTIC given a seed. The attempt stores its seed, so the
 *      same attempt always contains the same items — a reload cannot reroll a
 *      question the learner has already seen.
 *
 *   2. It FAILS LOUDLY when a pool cannot satisfy the blueprint. Silently
 *      serving four items where the blueprint asks for six produces a score
 *      out of the wrong denominator, and nobody notices until the numbers are
 *      already wrong.
 */

export interface PoolItem {
  id: string
  objectiveId: string
  formative: boolean
  status: 'DRAFT' | 'LIVE' | 'RETIRED'
}

/** How many items to draw per objective code. */
export type Blueprint = Record<string, number>

export class ThinPoolError extends Error {
  // Fields are declared and assigned explicitly rather than using TypeScript
  // parameter properties. Parameter properties require a transform, and Node's
  // strip-only type removal cannot do transforms — this module is imported by
  // the .mts seed scripts, which run under plain Node.
  readonly objectiveId: string
  readonly wanted: number
  readonly available: number

  constructor(objectiveId: string, wanted: number, available: number) {
    super(
      `Blueprint asks for ${wanted} item(s) for ${objectiveId} but only ${available} ` +
        `live, non-formative item(s) exist. Assembly fails rather than serving a ` +
        `short assessment and scoring it out of the wrong denominator.`,
    )
    this.name = 'ThinPoolError'
    this.objectiveId = objectiveId
    this.wanted = wanted
    this.available = available
  }
}

/** Deterministic PRNG (mulberry32) so a seed always yields the same draw. */
function rng(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], next: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Returns the item ids for an attempt, in a stable order.
 *
 * Only LIVE, non-formative items are eligible: a draft is not ready to be
 * scored, and a formative item is an in-lesson knowledge check that must never
 * appear in a gradebook.
 */
export function assemble(
  pool: PoolItem[],
  blueprint: Blueprint,
  seed: string,
): string[] {
  const next = rng(seed)
  const eligible = pool.filter((i) => i.status === 'LIVE' && !i.formative)
  const picked: string[] = []

  // Objectives in a fixed order so the seed alone determines the result.
  for (const objectiveId of Object.keys(blueprint).sort()) {
    const wanted = blueprint[objectiveId]
    if (wanted <= 0) continue
    const candidates = eligible
      .filter((i) => i.objectiveId === objectiveId)
      .sort((a, b) => a.id.localeCompare(b.id))

    if (candidates.length < wanted) {
      throw new ThinPoolError(objectiveId, wanted, candidates.length)
    }
    picked.push(...shuffle(candidates, next).slice(0, wanted).map((i) => i.id))
  }

  // Shuffle across objectives so an attempt is not visibly grouped by topic,
  // which would give away what each question is testing.
  return shuffle(picked, next)
}

/** Total items a blueprint asks for. */
export function blueprintSize(blueprint: Blueprint): number {
  return Object.values(blueprint).reduce((n, v) => n + Math.max(0, v), 0)
}
