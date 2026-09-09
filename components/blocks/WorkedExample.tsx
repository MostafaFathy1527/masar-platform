'use client'

import { useState } from 'react'
import { pick, type BlockProps } from '@/lib/content-locale'

type Step = { showAr: string; showEn: string; whyAr: string; whyEn: string }
type Payload = {
  promptAr: string; promptEn: string
  steps: Step[]
  answerAr: string; answerEn: string
}

/**
 * Stepped reveal. Each step shows what to do and why; the "why" is what makes
 * this a worked example rather than a printed solution.
 */
export function WorkedExample({ payload, locale }: BlockProps<Payload>) {
  const [shown, setShown] = useState(0)
  const done = shown >= payload.steps.length

  return (
    <section className="block-worked">
      <p className="block-worked-prompt">{pick(locale, payload.promptAr, payload.promptEn)}</p>
      <ol>
        {payload.steps.slice(0, shown).map((s, i) => (
          <li key={i}>
            <span className="worked-do">{pick(locale, s.showAr, s.showEn)}</span>
            <span className="worked-why">{pick(locale, s.whyAr, s.whyEn)}</span>
          </li>
        ))}
      </ol>
      {!done ? (
        <button type="button" className="btn-secondary" onClick={() => setShown(shown + 1)}>
          {shown === 0
            ? locale === 'ar' ? 'اعرض الخطوة الأولى' : 'Show the first step'
            : locale === 'ar' ? 'الخطوة التالية' : 'Next step'}
        </button>
      ) : (
        <p className="block-worked-answer" aria-live="polite">
          <strong>{locale === 'ar' ? 'الإجابة: ' : 'Answer: '}</strong>
          {pick(locale, payload.answerAr, payload.answerEn)}
        </p>
      )}
    </section>
  )
}
