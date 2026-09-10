'use client'

import { useState } from 'react'
import { type BlockProps } from '@/lib/content-locale'
import { formativeItem, type ItemOption } from '@/lib/items'

type Payload = { itemRef: string }

/**
 * An in-lesson knowledge check. Never scored, never in the gradebook.
 *
 * This used to render a placeholder reading "This check renders once the item
 * bank ships (Week 4)". The bank shipped in Week 4. The text stayed, and so did
 * the placeholder, so the flagship lesson — the one the case study, /course and
 * /how-it-was-built all point at as proof the depth model works — presented
 * three "coming soon" boxes at L2 and L3 long after they had come.
 *
 * That mattered more than a stale sentence: L2 is defined as "interactive — the
 * learner answers and decides". A lesson declaring L2 while rendering nothing
 * answerable makes the level label a claim the artefact does not support.
 *
 * It is answered, not scored. Feedback is per option and always in words, so
 * correctness is never carried by colour alone.
 */
export function KnowledgeCheck({ payload, locale }: BlockProps<Payload>) {
  const ar = locale === 'ar'
  const item = formativeItem(payload.itemRef)
  const [picked, setPicked] = useState<Set<number>>(new Set())
  const [revealed, setRevealed] = useState(false)

  // A reference to an item that is missing or not formative is a content bug.
  // Say so visibly rather than rendering an empty box: a check that silently
  // disappears is indistinguishable from a lesson that never had one.
  if (!item) {
    return (
      <div className="block-placeholder" data-item-ref={payload.itemRef}>
        <span className="block-placeholder-label">
          {ar ? 'سؤال مفقود' : 'Missing check'}
        </span>
        <p>
          {ar
            ? 'هذا السؤال غير موجود في بنك الأسئلة أو ليس سؤالًا تكوينيًا.'
            : 'This item is not in the bank, or is not marked formative.'}
        </p>
        <code>{payload.itemRef}</code>
      </div>
    )
  }

  const multi = item.type === 'MULTI_SELECT'
  const text = (o: ItemOption) => (ar ? o.textAr : o.textEn)
  const feedback = (o: ItemOption) => (ar ? o.feedbackAr : o.feedbackEn)

  const toggle = (i: number) => {
    if (revealed) return
    // Functional updater: a burst of clicks in one tick must not collapse to
    // the last one. See what-failed.md on the batched-click defect.
    setPicked((prev) => {
      if (!multi) return new Set([i])
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="kcheck">
      <p className="kcheck-label">
        {ar ? 'سؤال تفاعلي — غير محتسب' : 'Knowledge check — not scored'}
      </p>
      <p className="kcheck-stem">{ar ? item.stemAr : item.stemEn}</p>
      <p className="kcheck-hint">
        {multi
          ? ar
            ? 'اختر كل ما ينطبق.'
            : 'Select all that apply.'
          : ar
            ? 'اختر إجابة واحدة.'
            : 'Select one answer.'}
      </p>

      <ul className="kcheck-options">
        {item.options.map((o, i) => {
          const selected = picked.has(i)
          return (
            <li key={i}>
              <button
                type="button"
                aria-pressed={selected}
                disabled={revealed}
                className={selected ? 'is-selected' : undefined}
                onClick={() => toggle(i)}
              >
                {text(o)}
              </button>
              {revealed ? (
                <p className={o.isCorrect ? 'kcheck-fb is-right' : 'kcheck-fb is-wrong'}>
                  {/* Stated in words. The class only reinforces it. */}
                  <strong>
                    {o.isCorrect ? (ar ? 'صحيح' : 'Correct') : ar ? 'غير صحيح' : 'Not correct'}
                    {selected ? (ar ? ' — اخترتها' : ' — you chose this') : ''}:
                  </strong>{' '}
                  {feedback(o)}
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>

      {revealed ? (
        <p className="kcheck-rationale">{ar ? item.rationaleAr : item.rationaleEn}</p>
      ) : (
        <button
          type="button"
          className="btn-secondary"
          disabled={picked.size === 0}
          onClick={() => setRevealed(true)}
        >
          {ar ? 'اعرض الشرح' : 'Check my answer'}
        </button>
      )}
    </div>
  )
}
