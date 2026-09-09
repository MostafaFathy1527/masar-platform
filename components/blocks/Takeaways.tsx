import { type BlockProps } from '@/lib/content-locale'

type Payload = { itemsAr: string[]; itemsEn: string[] }

export function Takeaways({ payload, locale }: BlockProps<Payload>) {
  // The schema guarantees both arrays are the same length, so this cannot
  // silently render a shorter list in one language.
  const items = locale === 'ar' ? payload.itemsAr : payload.itemsEn
  return (
    <section className="block-takeaways">
      <h3>{locale === 'ar' ? 'الخلاصة' : 'Key takeaways'}</h3>
      <ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </section>
  )
}
