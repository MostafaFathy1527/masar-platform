import { setRequestLocale } from 'next-intl/server'
import { requireUser } from '@/lib/auth-guard'
import { getDb } from '@/lib/db'
import {
  CERTIFICATE_DISCLAIMER,
  CERTIFICATE_DISCLAIMER_AR,
  certificateEligibility,
} from '@/lib/certificates'
import { IssueCertificate } from '@/components/assess/IssueCertificate'
import type { AppLocale } from '@/i18n/routing'

export const dynamic = 'force-dynamic'

const COPY = {
  ar: {
    title: 'الشهادة',
    gates: 'الشروط، معروضة قبل المحاولة لا بعدها',
    met: 'مستوفى',
    notMet: 'غير مستوفى',
    signedOut: 'ادخل كزائر لعرض حالتك.',
    guestNote: 'بنقرة واحدة — بدون تسجيل',
    have: 'شهادتك',
    verifyAt: 'صفحة التحقق',
    demoBadge: 'صدرت عبر اختصار العرض التوضيحي.',
  },
  en: {
    title: 'Certificate',
    gates: 'The conditions, shown before the attempt rather than after',
    met: 'met',
    notMet: 'not met',
    signedOut: 'Enter as a guest to see your status.',
    guestNote: 'One click — no signup',
    have: 'Your certificate',
    verifyAt: 'Verification page',
    demoBadge: 'Issued through the demonstration shortcut.',
  },
} as const

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as AppLocale
  const t = COPY[l] ?? COPY.ar

  const me = await requireUser()
  const userId = me?.id
  const db = getDb()

  const course = await db.course.findFirst({ where: { status: 'PUBLISHED' } })
  const examAssessment = course
    ? await db.assessment.findFirst({ where: { courseId: course.id, scope: 'EXAM' } })
    : null

  let eligibility = certificateEligibility({
    examScorePct: null,
    examPassPct: examAssessment?.passPct ?? 75,
    simulationPassed: false,
    isDemo: false,
  })
  let existingSerial: string | null = null
  let existingIsDemo = false

  if (userId) {
    const bestExam = examAssessment
      ? await db.attempt.findFirst({
          where: { userId, assessmentId: examAssessment.id, scorePct: { not: null } },
          orderBy: { scorePct: 'desc' },
        })
      : null
    const simPassed = await db.simSubmission.findFirst({ where: { userId, passed: true } })
    eligibility = certificateEligibility({
      examScorePct: bestExam?.scorePct ?? null,
      examPassPct: examAssessment?.passPct ?? 75,
      simulationPassed: !!simPassed,
      isDemo: me?.isDemo ?? false,
    })
    const cert = await db.certificate.findFirst({ where: { userId, revokedAt: null } })
    existingSerial = cert?.serial ?? null
    existingIsDemo = cert?.isDemo ?? false
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-widest text-muted">
        {t.gates}
      </h2>
      <ul className="cert-gates mt-3">
        {eligibility.gates.map((g) => (
          <li key={g.id} className={g.met ? 'is-right' : 'is-wrong'}>
            {/* Stated in words so the list reads correctly without colour. */}
            <strong>{g.met ? t.met : t.notMet}</strong> — {l === 'ar' ? g.labelAr : g.labelEn}
          </li>
        ))}
      </ul>

      {!userId ? (
        <form action="/api/demo" method="post" className="mt-6 assess-start">
          <button className="btn-primary" type="submit">
            {t.signedOut}
          </button>
          <span className="text-sm text-muted">{t.guestNote}</span>
        </form>
      ) : existingSerial ? (
        <div className="mt-6">
          <p>
            <strong>{t.have}:</strong> {existingSerial}
          </p>
          {existingIsDemo ? <p className="verify-demo">{t.demoBadge}</p> : null}
          <p className="mt-2">
            <a className="link" href={`/${l}/verify/${existingSerial}`}>
              {t.verifyAt}
            </a>
          </p>
        </div>
      ) : (
        <IssueCertificate locale={l} eligible={eligibility.eligible} viaDemo={eligibility.viaDemoShortcut} />
      )}

      <footer className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-muted">
        {l === 'ar' ? CERTIFICATE_DISCLAIMER_AR : CERTIFICATE_DISCLAIMER}
      </footer>
    </div>
  )
}
