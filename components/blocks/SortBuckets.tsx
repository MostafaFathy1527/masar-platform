'use client'

import { useState } from 'react'
import { pick, type BlockProps } from '@/lib/content-locale'

type Bucket = { id: string; labelAr: string; labelEn: string }
type Card = {
  id: string
  textAr: string; textEn: string
  bucketId: string
  whyAr: string; whyEn: string
}
type Payload = { buckets: Bucket[]; cards: Card[] }

/**
 * The mapping exercise, as select-then-place.
 *
 * The plan calls for a keyboard fallback alongside drag and drop. This ships
 * the fallback as the primary interaction: pick a card, then pick a bucket.
 * One code path, keyboard-native, and it works on a phone — where dragging
 * between columns is the worst possible affordance.
 */
export function SortBuckets({ payload, locale }: BlockProps<Payload>) {
  const [selected, setSelected] = useState<string | null>(null)
  const [placed, setPlaced] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  const place = (bucketId: string) => {
    if (!selected) return
    setPlaced({ ...placed, [selected]: bucketId })
    setSelected(null)
    setChecked(false)
  }

  const unplaced = payload.cards.filter((c) => !placed[c.id])
  const allPlaced = unplaced.length === 0
  const isRight = (c: Card) => placed[c.id] === c.bucketId

  return (
    <section className="block-sort">
      <p className="block-sort-instruction">
        {locale === 'ar'
          ? 'اختر بطاقة، ثم اختر التصنيف الذي تنتمي إليه.'
          : 'Choose a card, then choose the group it belongs to.'}
      </p>

      <ul className="block-sort-cards">
        {unplaced.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              aria-pressed={selected === c.id}
              className={selected === c.id ? 'is-selected' : undefined}
              onClick={() => setSelected(selected === c.id ? null : c.id)}
            >
              {pick(locale, c.textAr, c.textEn)}
            </button>
          </li>
        ))}
      </ul>

      <div className="block-sort-buckets">
        {payload.buckets.map((b) => {
          const inBucket = payload.cards.filter((c) => placed[c.id] === b.id)
          return (
            <div key={b.id} className="block-sort-bucket">
              <button
                type="button"
                className="bucket-target"
                disabled={!selected}
                onClick={() => place(b.id)}
              >
                {pick(locale, b.labelAr, b.labelEn)}
              </button>
              <ul>
                {inBucket.map((c) => (
                  <li key={c.id} className={checked ? (isRight(c) ? 'is-right' : 'is-wrong') : undefined}>
                    {pick(locale, c.textAr, c.textEn)}
                    {checked ? (
                      <span className="sort-why">
                        {isRight(c)
                          ? (locale === 'ar' ? ' — صحيح. ' : ' — correct. ')
                          : (locale === 'ar' ? ' — غير صحيح. ' : ' — not correct. ')}
                        {pick(locale, c.whyAr, c.whyEn)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <button type="button" className="btn-primary" disabled={!allPlaced} onClick={() => setChecked(true)}>
        {locale === 'ar' ? 'تحقّق' : 'Check'}
      </button>
      <p aria-live="polite" className="block-feedback">
        {checked
          ? payload.cards.every(isRight)
            ? locale === 'ar' ? 'كل البطاقات في مكانها.' : 'Every card is in the right group.'
            : locale === 'ar' ? 'راجع البطاقات المعلّمة والسبب بجوارها.' : 'Review the marked cards and the reason beside each.'
          : ''}
      </p>
    </section>
  )
}
