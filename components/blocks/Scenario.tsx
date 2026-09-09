'use client'

import { useState } from 'react'
import { pick, type BlockProps } from '@/lib/content-locale'

type Decision = {
  id: string
  optionAr: string; optionEn: string
  consequenceAr: string; consequenceEn: string
  isBest: boolean
}
type Payload = { situationAr: string; situationEn: string; decisions: Decision[] }

/**
 * A decision with consequences. Every option returns its consequence, not only
 * the wrong ones: the point is that choices have outcomes, not that there is a
 * hidden right answer to guess.
 */
export function Scenario({ payload, locale }: BlockProps<Payload>) {
  const [chosenId, setChosenId] = useState<string | null>(null)
  const chosen = payload.decisions.find((d) => d.id === chosenId) ?? null

  return (
    <section className="block-scenario">
      <p className="block-scenario-situation">
        {pick(locale, payload.situationAr, payload.situationEn)}
      </p>
      <ul className="block-scenario-options">
        {payload.decisions.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => setChosenId(d.id)}
              aria-pressed={chosenId === d.id}
              className={chosenId === d.id ? 'is-chosen' : undefined}
            >
              {pick(locale, d.optionAr, d.optionEn)}
            </button>
          </li>
        ))}
      </ul>
      <div aria-live="polite" className="block-feedback">
        {chosen ? (
          <>
            <p>
              <strong>
                {chosen.isBest
                  ? locale === 'ar' ? 'الخيار الأفضل. ' : 'Best choice. '
                  : locale === 'ar' ? 'خيار ممكن. ' : 'A workable choice. '}
              </strong>
              {pick(locale, chosen.consequenceAr, chosen.consequenceEn)}
            </p>
            {!chosen.isBest ? (
              <button type="button" className="btn-secondary" onClick={() => setChosenId(null)}>
                {locale === 'ar' ? 'جرّب خيارًا آخر' : 'Try another option'}
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  )
}
