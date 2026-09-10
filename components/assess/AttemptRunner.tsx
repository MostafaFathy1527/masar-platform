'use client'

import { useState } from 'react'
import type { AppLocale } from '@/i18n/routing'
import { pick } from '@/lib/content-locale'

type PublicOption = { id: string; order: number; textAr: string; textEn: string }
type PublicItem = {
  id: string
  type: 'MCQ_SINGLE' | 'MULTI_SELECT'
  stemAr: string
  stemEn: string
  options: PublicOption[]
}
type Started = {
  attemptId: string
  passPct: number
  timeLimitSec: number | null
  items: PublicItem[]
}
type ReviewOption = PublicOption & {
  isCorrect: boolean
  selected: boolean
  feedbackAr: string
  feedbackEn: string
}
type Review = {
  scorePct: number
  passed: boolean
  passPct: number
  expired: boolean
  byObjective: Array<{ objectiveId: string; pct: number; credit: number; outOf: number }>
  weakestObjectives: string[]
  review: Array<{
    itemId: string
    objectiveId: string
    stemAr: string
    stemEn: string
    correct: boolean
    credit: number
    rationaleAr: string
    rationaleEn: string
    options: ReviewOption[]
  }>
}

const COPY = {
  ar: {
    start: 'ابدأ',
    starting: 'جارٍ التحضير…',
    needGuest: 'ادخل كزائر لبدء المحاولة',
    guestNote: 'بنقرة واحدة — بدون تسجيل',
    submit: 'أرسل الإجابات',
    submitting: 'جارٍ التصحيح…',
    single: 'اختر إجابة واحدة',
    multi: 'اختر كل ما ينطبق',
    result: 'النتيجة',
    pass: 'ناجح',
    fail: 'غير ناجح',
    expired: 'انتهى الوقت — صُحّح ما أُرسل.',
    byObjective: 'حسب الهدف التعليمي',
    weakest: 'راجع هذه الأهداف أولًا',
    yourAnswer: 'إجابتك',
    correctAnswer: 'الإجابة الصحيحة',
    rationale: 'التفسير',
    answered: (a: number, n: number) => `${a} من ${n} مُجاب`,
    retake: 'حاول مرة أخرى',
  },
  en: {
    start: 'Start',
    starting: 'Preparing…',
    needGuest: 'Enter as a guest to start',
    guestNote: 'One click — no signup',
    submit: 'Submit answers',
    submitting: 'Scoring…',
    single: 'Choose one answer',
    multi: 'Select all that apply',
    result: 'Result',
    pass: 'Pass',
    fail: 'Not yet',
    expired: 'Time expired — what was submitted has been scored.',
    byObjective: 'By objective',
    weakest: 'Revise these objectives first',
    yourAnswer: 'Your answer',
    correctAnswer: 'Correct answer',
    rationale: 'Why',
    answered: (a: number, n: number) => `${a} of ${n} answered`,
    retake: 'Try again',
  },
} as const

// Pure and exported for the same reason as toggleFlag in the claim-review
// workbench, and the failure here was worse: the handler spread the `responses`
// object it captured at render, so two answers registered in one tick dropped
// the first item's answer entirely rather than merely one option.
export function applyResponse(
  prev: Readonly<Record<string, string[]>>,
  itemId: string,
  optionId: string,
  single: boolean,
): Record<string, string[]> {
  const current = prev[itemId] ?? []
  const next = single
    ? [optionId]
    : current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId]
  return { ...prev, [itemId]: next }
}

export function AttemptRunner({
  scope,
  scopeId,
  locale,
}: {
  scope: 'LESSON' | 'EXAM'
  scopeId?: string
  locale: AppLocale
}) {
  const t = COPY[locale] ?? COPY.ar
  const [started, setStarted] = useState<Started | null>(null)
  const [responses, setResponses] = useState<Record<string, string[]>>({})
  const [review, setReview] = useState<Review | null>(null)
  const [busy, setBusy] = useState(false)
  const [needGuest, setNeedGuest] = useState(false)

  async function start() {
    setBusy(true)
    try {
      const res = await fetch('/api/attempt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ scope, scopeId }),
      })
      if (res.status === 401) return setNeedGuest(true)
      setStarted(await res.json())
      setResponses({})
      setReview(null)
    } finally {
      setBusy(false)
    }
  }

  async function submit() {
    if (!started) return
    setBusy(true)
    try {
      const res = await fetch(`/api/attempt/${started.attemptId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ responses }),
      })
      setReview(await res.json())
    } finally {
      setBusy(false)
    }
  }

  const toggle = (item: PublicItem, optionId: string) => {
    setResponses((prev) => applyResponse(prev, item.id, optionId, item.type === 'MCQ_SINGLE'))
  }

  if (needGuest) {
    return (
      <form action="/api/demo" method="post" className="assess-start">
        <button className="btn-primary" type="submit">
          {t.needGuest}
        </button>
        <span className="text-sm text-muted">{t.guestNote}</span>
      </form>
    )
  }

  if (!started) {
    return (
      <div className="assess-start">
        <button className="btn-primary" type="button" onClick={start} disabled={busy}>
          {busy ? t.starting : t.start}
        </button>
      </div>
    )
  }

  if (review) {
    return (
      <section className="assess-review" aria-live="polite">
        <h2>
          {t.result}: {review.scorePct}% — {review.passed ? t.pass : t.fail}
        </h2>
        {review.expired ? <p className="assess-expired">{t.expired}</p> : null}

        <h3>{t.byObjective}</h3>
        <ul className="assess-objectives">
          {review.byObjective.map((o) => (
            <li key={o.objectiveId}>
              <span>{o.objectiveId}</span>
              {/* The number carries the meaning; the bar only reinforces it. */}
              <span className="assess-bar" aria-hidden="true">
                <span style={{ inlineSize: `${o.pct}%` }} />
              </span>
              <span>
                {o.pct}% ({o.credit}/{o.outOf})
              </span>
            </li>
          ))}
        </ul>

        {review.weakestObjectives.length > 0 ? (
          <p className="assess-weakest">
            <strong>{t.weakest}:</strong> {review.weakestObjectives.join(', ')}
          </p>
        ) : null}

        <ol className="assess-items">
          {review.review.map((r) => (
            <li key={r.itemId} className={r.correct ? 'is-right' : 'is-wrong'}>
              <p className="assess-stem">{pick(locale, r.stemAr, r.stemEn)}</p>
              <ul>
                {r.options.map((o) => (
                  <li key={o.id}>
                    <span className="assess-opt-text">{pick(locale, o.textAr, o.textEn)}</span>
                    {/* State in words, never colour alone. */}
                    {o.selected ? <em> — {t.yourAnswer}</em> : null}
                    {o.isCorrect ? <em> — {t.correctAnswer}</em> : null}
                    <span className="assess-feedback">
                      {pick(locale, o.feedbackAr, o.feedbackEn)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="assess-rationale">
                <strong>{t.rationale}: </strong>
                {pick(locale, r.rationaleAr, r.rationaleEn)}
              </p>
            </li>
          ))}
        </ol>

        <button className="btn-secondary" type="button" onClick={start} disabled={busy}>
          {t.retake}
        </button>
      </section>
    )
  }

  const answered = started.items.filter((i) => (responses[i.id] ?? []).length > 0).length

  return (
    <section className="assess">
      <ol className="assess-items">
        {started.items.map((item) => (
          <li key={item.id}>
            <p className="assess-stem">{pick(locale, item.stemAr, item.stemEn)}</p>
            <p className="assess-hint">
              {item.type === 'MCQ_SINGLE' ? t.single : t.multi}
            </p>
            <ul>
              {item.options.map((o) => {
                const selected = (responses[item.id] ?? []).includes(o.id)
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      className={selected ? 'is-selected' : undefined}
                      onClick={() => toggle(item, o.id)}
                    >
                      {pick(locale, o.textAr, o.textEn)}
                    </button>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ol>

      <div className="assess-actions">
        <button className="btn-primary" type="button" onClick={submit} disabled={busy}>
          {busy ? t.submitting : t.submit}
        </button>
        <span className="text-sm text-muted" aria-live="polite">
          {t.answered(answered, started.items.length)}
        </span>
      </div>
    </section>
  )
}
