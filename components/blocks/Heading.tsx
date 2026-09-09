import { pick, type BlockProps } from '@/lib/content-locale'

type Payload = { textAr: string; textEn: string; level: 2 | 3 }

export function Heading({ payload, locale }: BlockProps<Payload>) {
  const text = pick(locale, payload.textAr, payload.textEn)
  // The schema constrains level to 2 or 3, so heading order cannot skip from
  // the page h1 to an h4 — an accessibility rule enforced by data, not review.
  const Tag = payload.level === 2 ? 'h2' : 'h3'
  return (
    <Tag className={payload.level === 2 ? 'block-h2' : 'block-h3'}>{text}</Tag>
  )
}
