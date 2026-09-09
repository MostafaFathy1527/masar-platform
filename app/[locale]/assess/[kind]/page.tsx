import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { AttemptRunner } from '@/components/assess/AttemptRunner'
import type { AppLocale } from '@/i18n/routing'

export const dynamic = 'force-dynamic'

const LESSON_SLUG = 'anatomy-of-a-claim'

const COPY = {
  ar: {
    quiz: { title: 'اختبار الدرس', lead: 'خمسة أسئلة من بنك مرتبط بأهداف هذا الدرس. النجاح عند 70٪.' },
    exam: { title: 'الاختبار', lead: 'تسعة أسئلة مسحوبة من مخطط يوزّعها على الأهداف. النجاح عند 75٪.' },
    disclaimer:
      'تقييم تدريبي ضمن دورة ذاتية المبادرة. لا يمثل شهادة مهنية ولا يرتبط بأي جهة اعتماد.',
  },
  en: {
    quiz: { title: 'Lesson quiz', lead: 'Five questions drawn from a bank tied to this lesson’s objectives. Pass at 70%.' },
    exam: { title: 'Exam', lead: 'Nine questions drawn from a blueprint that distributes them across objectives. Pass at 75%.' },
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-6">
        <p className="badge">{l === 'ar' ? 'تقييم' : 'Assessment'}</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 max-w-prose text-muted">{t.lead}</p>
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
