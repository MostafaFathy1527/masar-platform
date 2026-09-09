import { pick, type BlockProps } from '@/lib/content-locale'

type Payload = { mdAr: string; mdEn: string }

/** Blank-line paragraph break. */
const PARAGRAPH_BREAK = /\n{2,}/

/**
 * Markdown rendering is deliberately not wired up yet. Pulling in a markdown
 * pipeline means deciding a sanitisation policy, and that decision is worth
 * making once the content pipeline exists to constrain what it emits.
 * Paragraph splitting covers the current content; recorded here rather than
 * hidden behind a TODO.
 */
export function RichText({ payload, locale }: BlockProps<Payload>) {
  const md = pick(locale, payload.mdAr, payload.mdEn)
  return (
    <div className="block-prose">
      {md.split(PARAGRAPH_BREAK).map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  )
}
