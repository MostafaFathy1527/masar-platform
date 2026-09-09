import { readFileSync } from 'node:fs'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { DepthView } from '@/components/player/DepthView'
import { pick } from '@/lib/content-locale'
import { routing, type AppLocale } from '@/i18n/routing'
import { LessonDoc, type Level } from '@/lib/schema/lesson'

const LESSON_PATH = 'content/courses/rcm-foundations/lessons/04-anatomy-of-a-claim.json'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'The depth model — Masār',
  description:
    'One lesson published at three defined depths: structured publishing, an interactive lesson, and applied practice.',
}

/** Parsed at build time, so invalid content fails the build rather than a page view. */
function loadLesson() {
  return LessonDoc.parse(JSON.parse(readFileSync(LESSON_PATH, 'utf-8')))
}

const COPY = {
  ar: {
    title: 'نموذج العمق',
    lead: 'الدرس نفسه، منشورًا على ثلاثة مستويات. العمق خاصية للدرس وليس درسًا منفصلًا: إضافة المستوى الثاني إلى درس قائم فرقٌ إضافي، بلا تغيير في الرابط ولا إعادة تسجيل ولا فقدان تقدّم.',
    levelName: { L1: 'المستوى الأول', L2: 'المستوى الثاني', L3: 'المستوى الثالث' },
    levelWhat: {
      L1: 'نشر منظّم — يقرأ المتعلّم',
      L2: 'درس تفاعلي — يجيب ويقرّر',
      L3: 'تطبيق عملي — ينتج عملًا يُقيَّم',
    },
    cumulative: 'المستويات تراكمية',
    englishOnlyNotice:
      'هذا الدرس متاح بالإنجليزية فقط في هذه النسخة. واجهة المنصة والدروس التفاعلية بالعربية بالكامل.',
    blockCountTemplate: '{n} كتلة معروضة',
    disclaimer:
      'محتوى تدريبي أصلي. كل الرموز والجهات في هذا الدرس خيالية للتدريب فقط. ليست استشارة طبية أو فوترية أو قانونية أو تنظيمية.',
  },
  en: {
    title: 'The depth model',
    lead: 'The same lesson, published at three depths. Depth is a property of a lesson rather than a separate lesson: adding L2 to an existing L1 lesson is an additive diff — no URL change, no re-enrolment, no progress reset.',
    levelName: { L1: 'L1', L2: 'L2', L3: 'L3' },
    levelWhat: {
      L1: 'Structured publishing — the learner reads',
      L2: 'Interactive lesson — they answer and decide',
      L3: 'Applied practice — they produce work that is scored',
    },
    cumulative: 'Levels are cumulative',
    englishOnlyNotice: 'This lesson is English-only in this build.',
    blockCountTemplate: '{n} blocks shown',
    disclaimer:
      'Original training content. Every code and organisation in this lesson is fictional and for training only. Not medical, billing, clinical, legal or regulatory advice.',
  },
} as const

export default async function DepthPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as AppLocale
  const t = COPY[l] ?? COPY.ar
  const lesson = loadLesson()

  return (
    <div className="page-shell">
      <header>
        <p className="eyebrow">{l === 'ar' ? 'نموذج العمق' : 'The depth model'}</p>
        <h1 className="page-title">{t.title}</h1>
        <p className="mt-3 max-w-prose leading-relaxed text-muted">{t.lead}</p>
      </header>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">
          {pick(l, lesson.titleAr, lesson.titleEn)}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {lesson.estMinutes} {l === 'ar' ? 'دقيقة' : 'min'} ·{' '}
          {lesson.objectives.join(', ')}
        </p>
      </section>

      <div className="mt-6">
        <DepthView
          locale={l}
          levels={lesson.levels as Level[]}
          blocks={{
            l1: lesson.blocks.l1 ?? [],
            l2: lesson.blocks.l2 ?? [],
            l3: lesson.blocks.l3 ?? [],
          }}
          bilingual={lesson.bilingual}
          copy={{
            levelName: t.levelName,
            levelWhat: t.levelWhat,
            cumulative: t.cumulative,
            blockCountTemplate: t.blockCountTemplate,
            englishOnlyNotice: t.englishOnlyNotice,
          }}
        />
      </div>

      <footer className="mt-12 border-t border-line pt-6 text-xs leading-relaxed text-muted">
        {t.disclaimer}
      </footer>
    </div>
  )
}
