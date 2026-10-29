import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { lessonBySlug } from '@/lib/lessons'
import { lessonPassages } from '@/lib/ask/passages'
import { askLesson } from '@/lib/ask/cohere'
import {
  ASK_RETENTION_DAYS,
  QUESTION_MAX,
  QUESTION_MIN,
  checkLimits,
  clientIp,
  startOfUtcDay,
  visitorCode,
} from '@/lib/ask/limits'

// "Ask the lesson": a learner's question, answered from the lesson's own passages
// (lib/ask/cohere.ts). The caps are read from the questions already stored, so they
// hold across every server instance rather than per process.

export const maxDuration = 30

const Body = z.object({
  slug: z.string().min(1).max(120),
  locale: z.enum(['ar', 'en']),
  question: z.string().trim().min(QUESTION_MIN).max(QUESTION_MAX),
})

export async function POST(req: Request) {
  const key = process.env.COHERE_API_KEY
  if (!key) return NextResponse.json({ error: 'off' }, { status: 503 })

  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const { slug, locale, question } = parsed.data

  const lesson = lessonBySlug(slug)
  if (!lesson) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const db = getDb()
  const now = new Date()
  const visitor = visitorCode(clientIp(req.headers), now, process.env.AUTH_SECRET ?? key)

  // Retention runs on the event that produces the data, as guest retention does.
  await db.askQuestion
    .deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - ASK_RETENTION_DAYS * 86_400_000) } } })
    .catch(() => null)

  const [visitorLastHour, today] = await Promise.all([
    db.askQuestion.count({ where: { visitor, createdAt: { gte: new Date(now.getTime() - 3_600_000) } } }),
    db.askQuestion.count({ where: { createdAt: { gte: startOfUtcDay(now) } } }),
  ])
  const limit = checkLimits({ visitorLastHour, today })
  if (limit !== 'ok') return NextResponse.json({ kind: 'limited', limit }, { status: 429 })

  const started = Date.now()
  const record = (outcome: 'ANSWERED' | 'NOT_COVERED' | 'FAILED', cites: string[] = []) =>
    db.askQuestion
      .create({ data: { lessonSlug: slug, locale, question, outcome, cites, ms: Date.now() - started, visitor } })
      .catch(() => null)

  try {
    const answer = await askLesson(question, lessonPassages(lesson, locale), key, AbortSignal.timeout(25_000))
    await record(answer.kind === 'answer' ? 'ANSWERED' : 'NOT_COVERED', answer.kind === 'answer' ? answer.cites : [])
    return NextResponse.json(answer)
  } catch {
    await record('FAILED')
    return NextResponse.json({ error: 'failed' }, { status: 502 })
  }
}
