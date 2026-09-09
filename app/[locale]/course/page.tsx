import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { requireUser } from '@/lib/auth-guard'
import { getDb } from '@/lib/db'
import { certificateEligibility } from '@/lib/certificates'
import { SandboxBanner } from '@/components/payments/SandboxBanner'
import { StartCheckout } from '@/components/payments/StartCheckout'
import type { AppLocale } from '@/i18n/routing'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'The course — Masār',
  description:
    'A practice-first course on medical insurance and revenue cycle work. Demo pricing, test mode only.',
}

const COURSE_SLUG = 'rcm-foundations'

export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as AppLocale
  const ar = l === 'ar'

  const db = getDb()
  const course = await db.course.findUnique({ where: { slug: COURSE_SLUG } })
  const me = await requireUser()

  const enrolled = me && course
    ? await db.enrollment.findUnique({
        where: { userId_courseId: { userId: me.id, courseId: course.id } },
      })
    : null

  const exam = course
    ? await db.assessment.findFirst({ where: { courseId: course.id, scope: 'EXAM' } })
    : null

  // Section 4.4: the certificate conditions are printed on the course page
  // BEFORE purchase, so the standard is visible in advance rather than
  // discovered afterwards.
  const gates = certificateEligibility({
    examScorePct: null,
    examPassPct: exam?.passPct ?? 75,
    simulationPassed: false,
    isDemo: false,
  }).gates

  const price = ((course?.priceEgp ?? 0) / 100).toFixed(2)

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">
        {course ? (ar ? course.titleAr : course.titleEn) : ar ? 'الدورة' : 'The course'}
      </h1>
      <p className="mt-3 max-w-prose leading-relaxed text-muted">
        {course ? (ar ? course.summaryAr : course.summaryEn) : ''}
      </p>

      <h2 className="admin-q">{ar ? 'شروط الشهادة' : 'What the certificate requires'}</h2>
      <p className="max-w-prose text-sm text-muted">
        {ar
          ? 'معروضة قبل الشراء لا بعده.'
          : 'Shown before purchase rather than discovered afterwards.'}
      </p>
      <ul className="cert-gates mt-3">
        {gates.map((g) => (
          <li key={g.id}>{ar ? g.labelAr : g.labelEn}</li>
        ))}
      </ul>

      <h2 className="admin-q">{ar ? 'السعر' : 'Price'}</h2>
      {/*
        The banner is rendered with the price, never separately. A price without
        it would be the most misleading thing on this site: no payment provider
        is active, the hosting plan forbids commercial use, and no money moves.
        A test asserts the two appear together.
      */}
      <div className="price-card">
        <SandboxBanner locale={l} />
        <p className="price-amount">
          {price} <span>EGP</span>
        </p>
        <p className="text-sm text-muted">
          {ar
            ? 'مبلغ رمزي لأغراض العرض. لا يوجد مزوّد دفع مُفعَّل في هذه النسخة.'
            : 'A symbolic amount for demonstration. No payment provider is activated in this build.'}
        </p>

        {enrolled ? (
          <p className="mt-4">
            <strong>{ar ? 'أنت مسجَّل بالفعل.' : 'You are already enrolled.'}</strong>{' '}
            <a className="link" href={`/${l}/depth`}>
              {ar ? 'ابدأ' : 'Start'}
            </a>
          </p>
        ) : (
          <StartCheckout courseSlug={COURSE_SLUG} locale={l} signedIn={!!me} />
        )}
      </div>

      <footer className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-muted">
        {ar
          ? 'شهادة إتمام لدورة تدريبية ذاتية المبادرة. غير تابعة لأي جهة اعتماد وغير معترف بها من أي منها. ليست استشارة طبية أو فوترية أو قانونية أو تنظيمية.'
          : 'Certificate of completion for a self-initiated training course. Not affiliated with, or recognized by, any certification body. Not medical, billing, clinical, legal or regulatory advice.'}
      </footer>
    </div>
  )
}
