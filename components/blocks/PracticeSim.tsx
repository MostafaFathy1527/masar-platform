import { type BlockProps } from '@/lib/content-locale'

type Payload = { simSlug: string }

/**
 * Mounts an L3 practice simulation by slug. The claim-review simulation ships
 * in Week 3; until then this is a visible placeholder rather than a blank.
 */
export function PracticeSim({ payload, locale }: BlockProps<Payload>) {
  return (
    <div className="block-placeholder" data-sim-slug={payload.simSlug}>
      <span className="block-placeholder-label">
        {locale === 'ar' ? 'تدريب تطبيقي' : 'Applied practice'}
      </span>
      <p>
        {locale === 'ar'
          ? 'تُشغَّل المحاكاة في الأسبوع الثالث.'
          : 'The simulation ships in Week 3.'}
      </p>
      <code>{payload.simSlug}</code>
    </div>
  )
}
