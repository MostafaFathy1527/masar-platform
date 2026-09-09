import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { AttemptRunner } from '@/components/assess/AttemptRunner'
import { getDb } from '@/lib/db'
import type { AppLocale } from '@/i18n/routing'

export const dynamic = 'force-dynamic'

const LESSON_SLUG = 'anatomy-of-a-claim'

// The item count and the pass mark are read from the assessment row rather
// than written into this copy. They were hardcoded, and they drifted: the exam
// blueprint grew from nine items to sixteen in Week 5 when the bank was
// extended to cover every objective, and both locales went on telling the
// learner it was nine. Nothing was broken, and no test could fail — the page
// simply made a false statement about the product, in the same way the landing
// page once announced it was under construction over a finished site.
const COPY = {
  ar: {
    quiz: { title: 'اختبار الدرس', lead: (n: number, p: number) => `${n} أسئلة من بنك مرتبط بأهداف هذا الدرس. النجاح عند ${p}٪.` },
    exam: { title: 'الاختبار', lead: (n: number, p: number) => `${n} سؤالًا مسحوبة من مخطط يوزّعها على الأهداف. النجاح عند ${p}٪.` },
    disclaimer:
      'تقييم تدريبي ضمن دورة ذاتية المبادرة. لا يمثل شهادة مهنية ولا يرتبط بأي جهة اعتماد.',
  },
  en: {
    quiz: { title: 'Lesson quiz', lead: (n: number, p: number) => `${n} questions drawn from a bank tied to this lesson’s objectives. Pass at ${p}%.` },
    exam: { title: 'Exam', lead: (n: number, p: number) => `${n} questions drawn from a blueprint that distributes them across objectives. Pass at ${p}%.` },
    disclaimer:
      'A training assessment within a self-initiated course. It is not a professional credential and is not connected to any certification body.',
  },
} as const

export default async function AssessPage({
  params,
}: {
  params: Promise<{ locale: string; kind: string }>
}) {
  const { locale, kind } = await params
  setRequestLocale(locale)
  const l = locale as AppLocale
  if (kind !== 'quiz' && kind !== 'exam') notFound()

  const t = (COPY[l] ?? COPY.ar)[kind]

  // If the row is missing the page still renders; the lead is the only thing
  // that depends on it, and a lead that says nothing beats a lead that lies.
  const assessment = await getDb().assessment.findFirst({
    where: kind === 'quiz' ? { scope: 'LESSON', scopeId: LESSON_SLUG } : { scope: 'EXAM' },
    select: { itemCount: true, passPct: true },
  })

  return (
    <div className="page-shell">
      <header className="mb-6">
        <p className="eyebrow">{l === 'ar' ? 'تقييم' : 'Assessment'}</p>
        <h1 className="page-title">{t.title}</h1>
        {assessment ? (
          <p className="mt-2 max-w-prose text-muted">
            {t.lead(assessment.itemCount, assessment.passPct)}
          </p>
        ) : null}
      </header>

      <AttemptRunner
        scope={kind === 'quiz' ? 'LESSON' : 'EXAM'}
        scopeId={kind === 'quiz' ? LESSON_SLUG : undefined}
        locale={l}
      />

      <footer className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-muted">
        {(COPY[l] ?? COPY.ar).disclaimer}
      </footer>
    </div>
  )
}
