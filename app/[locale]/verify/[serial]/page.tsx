import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getDb } from '@/lib/db'
import {
  CERTIFICATE_DISCLAIMER,
  CERTIFICATE_DISCLAIMER_AR,
} from '@/lib/certificates'
import type { AppLocale } from '@/i18n/routing'

// Public and unauthenticated. This page is the source of truth for a
// certificate — never a printed copy.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Verify a certificate — Masār',
  robots: { index: false },
}

const COPY = {
  ar: {
    title: 'التحقق من الشهادة',
    notFound: 'لا توجد شهادة بهذا الرقم.',
    revoked: 'أُلغيت هذه الشهادة.',
    valid: 'شهادة سارية',
    holder: 'الحاصل عليها',
    course: 'الدورة',
    issued: 'تاريخ الإصدار',
    score: 'نتيجة الاختبار',
    objectives: 'الأهداف التي أثبتها',
    serial: 'الرقم التسلسلي',
    hash: 'بصمة السجل',
    demoBadge: 'أُصدرت عبر اختصار العرض التوضيحي، لا باستيفاء الشروط.',
    sourceOfTruth: 'هذه الصفحة هي المرجع. أي نسخة مطبوعة ليست دليلًا بذاتها.',
    reason: 'السبب',
  },
  en: {
    title: 'Certificate verification',
    notFound: 'No certificate exists with that serial.',
    revoked: 'This certificate has been revoked.',
    valid: 'Valid certificate',
    holder: 'Holder',
    course: 'Course',
    issued: 'Issued',
    score: 'Exam score',
    objectives: 'Objectives demonstrated',
    serial: 'Serial',
    hash: 'Record fingerprint',
    demoBadge: 'Issued through the demonstration shortcut, not by meeting the gates.',
    sourceOfTruth: 'This page is the record. A printed copy is not evidence on its own.',
    reason: 'Reason',
  },
} as const

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ locale: string; serial: string }>
}) {
  const { locale, serial } = await params
  setRequestLocale(locale)
  const l = locale as AppLocale
  const t = COPY[l] ?? COPY.ar

  const cert = await getDb().certificate.findUnique({
    where: { serial },
    include: { user: { select: { name: true } } },
  })
  const course = cert
    ? await getDb().course.findUnique({ where: { id: cert.courseId } })
    : null

  return (
    <div className="page-shell-narrow">
      <h1 className="page-title">{t.title}</h1>

      {!cert ? (
        <p className="mt-6 verify-status is-wrong">{t.notFound}</p>
      ) : (
        <article className="verify-card mt-6">
          {/* Status is stated in words; nothing here depends on colour. */}
          <p className={`verify-status ${cert.revokedAt ? 'is-wrong' : 'is-right'}`}>
            {cert.revokedAt ? t.revoked : t.valid}
          </p>
          {cert.revokedAt && cert.revokeReason ? (
            <p className="verify-reason">
              {t.reason}: {cert.revokeReason}
            </p>
          ) : null}

          {cert.isDemo ? <p className="verify-demo">{t.demoBadge}</p> : null}

          <dl className="verify-fields">
            <div>
              <dt>{t.holder}</dt>
              <dd>{cert.user.name}</dd>
            </div>
            <div>
              <dt>{t.course}</dt>
              <dd>{course ? (l === 'ar' ? course.titleAr : course.titleEn) : '—'}</dd>
            </div>
            <div>
              <dt>{t.issued}</dt>
              <dd>{cert.issuedAt.toISOString().slice(0, 10)}</dd>
            </div>
            <div>
              <dt>{t.score}</dt>
              <dd>{cert.finalScorePct}%</dd>
            </div>
            <div>
              <dt>{t.objectives}</dt>
              <dd>{cert.objectivesMet.length ? cert.objectivesMet.join(', ') : '—'}</dd>
            </div>
            <div>
              <dt>{t.serial}</dt>
              <dd>{cert.serial}</dd>
            </div>
            <div>
              <dt>{t.hash}</dt>
              <dd className="verify-hash">{cert.payloadHash.slice(0, 16)}…</dd>
            </div>
          </dl>

          <p className="verify-note">{t.sourceOfTruth}</p>
        </article>
      )}

      <footer className="mt-8 border-t border-line pt-6 text-xs leading-relaxed text-muted">
        {l === 'ar' ? CERTIFICATE_DISCLAIMER_AR : CERTIFICATE_DISCLAIMER}
      </footer>
    </div>
  )
}
