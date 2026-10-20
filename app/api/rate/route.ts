import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { CRITERIA, isComplete, mayRate, raterFor } from '@/lib/rating/raters'

// The blind rating form (public/rate/index.html) reads and writes here. A rater is
// known only by the private code in the request; the response never carries another
// rater's scores, any model's scores, or where a sample came from.

const score = z.number().int().min(1).max(5)
const Body = z.object({
  k: z.string(),
  sampleId: z.string(),
  lang: z.enum(['ar', 'en']),
  scores: z.object(Object.fromEntries(CRITERIA.map((c) => [c, score.optional()]))).strict(),
  notes: z.object(Object.fromEntries(CRITERIA.map((c) => [c, z.string().max(2000).optional()]))).strict(),
  overall: z.string().max(4000).default(''),
  seconds: z.number().int().min(0).max(86400).default(0),
})

const denied = () => NextResponse.json({ error: 'This access code is not recognised.' }, { status: 403 })

export async function GET(req: Request) {
  const rater = raterFor(new URL(req.url).searchParams.get('k'))
  if (!rater) return denied()
  const rows = await getDb().humanRating.findMany({ where: { rater: rater.id } })
  return NextResponse.json({
    rater: rater.id,
    scope: rater.scope,
    ratings: rows.map((r) => ({ sampleId: r.sampleId, lang: r.lang, scores: r.scores, notes: r.notes, overall: r.overall, seconds: r.seconds })),
  })
}

export async function PUT(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
  const b = parsed.data
  const rater = raterFor(b.k)
  if (!rater) return denied()
  if (!mayRate(rater, b.sampleId, b.lang)) return NextResponse.json({ error: 'Not a sample for this rater' }, { status: 403 })
  const data = {
    scores: b.scores,
    notes: b.notes,
    overall: b.overall,
    seconds: b.seconds,
    complete: isComplete(b.scores, b.notes),
  }
  await getDb().humanRating.upsert({
    where: { rater_sampleId_lang: { rater: rater.id, sampleId: b.sampleId, lang: b.lang } },
    create: { rater: rater.id, sampleId: b.sampleId, lang: b.lang, ...data },
    update: data,
  })
  return NextResponse.json({ ok: true, complete: data.complete })
}
