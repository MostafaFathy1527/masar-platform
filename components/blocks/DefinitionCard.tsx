import { pick, type BlockProps } from '@/lib/content-locale'

type Payload = {
  termAr: string; termEn: string
  defAr: string; defEn: string
  icon?: string
  exampleAr?: string; exampleEn?: string
}

export function DefinitionCard({ payload, locale }: BlockProps<Payload>) {
  const example = pick(locale, payload.exampleAr, payload.exampleEn)
  return (
    <figure className="block-card">
      <figcaption className="block-card-title">
        {payload.icon ? (
          <span aria-hidden="true" className="block-card-icon">{payload.icon}</span>
        ) : null}
        {pick(locale, payload.termAr, payload.termEn)}
      </figcaption>
      <p className="block-card-body">{pick(locale, payload.defAr, payload.defEn)}</p>
      {example ? <p className="block-card-example">{example}</p> : null}
    </figure>
  )
}
