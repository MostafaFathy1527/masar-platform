import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { ClaimReviewWorkbench } from '@/components/sims/ClaimReviewWorkbench'
import { getDb } from '@/lib/db'
import type { AppLocale } from '@/i18n/routing'

// Rendered per request: it reads the simulation from the database, and the
// dataset must never be baked into a static payload alongside its answers.
export const dynamic = 'force-dynamic'

const TOUR = {
  ar: {
    banner: 'جولة المُراجِع — تبدأ بالتطبيق، لا بالقراءة.',
    next: 'المحطة التالية: نموذج العمق',
  },
  en: {
    banner: 'Reviewer tour — this starts with practice, not reading.',
    next: 'Next stop: the depth model',
  },
} as const

export default async function PracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ tour?: string }>
}) {
  const { locale, slug } = await params
  const { tour } = await searchParams
  setRequestLocale(locale)
  const l = locale as AppLocale

  const sim = await getDb().simulation.findUnique({ where: { slug } })
  if (!sim) notFound()

  // Only the claim, the note and the card cross to the client. The seeded
  // errors stay on the server until a submission is scored.
  const dataset = sim.datasetJson as Parameters<
    typeof ClaimReviewWorkbench
  >[0]['dataset']

  const t = TOUR[l] ?? TOUR.ar

  return (
    <div className="page-shell">
      {tour === '1' ? (
        <div className="tour-banner">
          <p>{t.banner}</p>
          <a className="btn-secondary" href={`/${l}/depth`}>
            {t.next}
          </a>
        </div>
      ) : null}

      <header className="mb-6">
        <p className="eyebrow">{l === 'ar' ? 'تدريب تطبيقي — المستوى الثالث' : 'Applied practice — L3'}</p>
        <h1 className="page-title">
          {l === 'ar' ? 'مراجعة مطالبة' : 'Claim review'}
        </h1>
      </header>

      <ClaimReviewWorkbench
        slug={sim.slug}
        dataset={dataset}
        locale={l}
        lessonHref={`/${l}/depth`}
      />

      <footer className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-muted">
        {l === 'ar'
          ? 'بيانات تدريبية خيالية بالكامل: المريضة والمنشأة والطرف الدافع والرموز جميعها مُختلقة. ليست استشارة طبية أو فوترية أو قانونية أو تنظيمية.'
          : 'Entirely fictional training data: the patient, facility, payer and codes are all invented. Not medical, billing, clinical, legal or regulatory advice.'}
      </footer>
    </div>
  )
}
