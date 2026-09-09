import { pick, type BlockProps } from '@/lib/content-locale'

type Payload = { mdAr: string; mdEn: string }

export function JobTip({ payload, locale }: BlockProps<Payload>) {
  return (
    <aside className="block-tip">
      {/* The label carries the meaning, not the colour. */}
      <span className="block-tip-label">{locale === 'ar' ? 'من الميدان' : 'From the job'}</span>
      <p>{pick(locale, payload.mdAr, payload.mdEn)}</p>
    </aside>
  )
}
