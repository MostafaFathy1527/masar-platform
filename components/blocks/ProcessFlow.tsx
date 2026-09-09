'use client'

import { useState } from 'react'
import { pick, type BlockProps } from '@/lib/content-locale'

type Step = { id: string; labelAr: string; labelEn: string; detailAr: string; detailEn: string }
type Payload = { steps: Step[]; interactive: boolean }

export function ProcessFlow(props: BlockProps<Payload>) {
  if (!props.payload.interactive) {
    return (
      <ol className="block-flow">
        {props.payload.steps.map((s) => (
          <li key={s.id}>
            <strong>{pick(props.locale, s.labelAr, s.labelEn)}</strong>
            <span>{pick(props.locale, s.detailAr, s.detailEn)}</span>
          </li>
        ))}
      </ol>
    )
  }
  return <OrderingExercise {...props} />
}

/**
 * The workflow-ordering exercise.
 *
 * Reordering uses move-up / move-down buttons rather than drag and drop. That
 * is the keyboard path the accessibility rule requires, and making it the only
 * path means there is no second, untested code path. A drag affordance can be
 * layered on later without changing the model.
 */
function OrderingExercise({ payload, locale }: BlockProps<Payload>) {
  // Reversed rather than randomised: a learner who reloads sees the same
  // starting point, and the test suite sees a deterministic one.
  const [order, setOrder] = useState(() => [...payload.steps].reverse())
  const [checked, setChecked] = useState(false)

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return
    const next = [...order]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setOrder(next)
    setChecked(false)
  }

  const correctAt = (i: number) => order[i].id === payload.steps[i].id
  const allCorrect = order.every((_, i) => correctAt(i))
  const label = (s: Step) => pick(locale, s.labelAr, s.labelEn)

  return (
    <div className="block-flow-exercise">
      <ol>
        {order.map((s, i) => (
          <li key={s.id} className={checked ? (correctAt(i) ? 'is-right' : 'is-wrong') : undefined}>
            <span className="flow-step-label">
              {label(s)}
              {/* Correctness is stated in text, never carried by colour alone. */}
              {checked ? (
                <span className="flow-step-mark">
                  {correctAt(i)
                    ? locale === 'ar' ? ' — في موضعه' : ' — correct position'
                    : locale === 'ar' ? ' — ليس في موضعه' : ' — wrong position'}
                </span>
              ) : null}
            </span>
            <span className="flow-step-controls">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label={locale === 'ar' ? 'حرّك ' + label(s) + ' لأعلى' : 'Move ' + label(s) + ' up'}
              >
                &uarr;
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === order.length - 1}
                aria-label={locale === 'ar' ? 'حرّك ' + label(s) + ' لأسفل' : 'Move ' + label(s) + ' down'}
              >
                &darr;
              </button>
            </span>
          </li>
        ))}
      </ol>
      <button type="button" className="btn-primary" onClick={() => setChecked(true)}>
        {locale === 'ar' ? 'تحقّق' : 'Check'}
      </button>
      <p aria-live="polite" className="block-feedback">
        {checked
          ? allCorrect
            ? locale === 'ar' ? 'الترتيب صحيح.' : 'The order is correct.'
            : locale === 'ar' ? 'ليس بعد — راجع الخطوات المعلّمة.' : 'Not yet — review the marked steps.'
          : ''}
      </p>
    </div>
  )
}
