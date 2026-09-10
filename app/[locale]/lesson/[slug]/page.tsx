import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { DepthView } from '@/components/player/DepthView'
import { pick } from '@/lib/content-locale'
import { deepestLevel, lessonBySlug, lessonIndex, lessonNeighbours } from '@/lib/lessons'
import { objectiveFor } from '@/lib/objectives'
import type { AppLocale } from '@/i18n/routing'
import type { Level } from '@/lib/schema/lesson'

/**
 * The lesson reader.
 *
 * This route did not exist until a reviewer opened the product and tried to
 * read a lesson. The renderer, the block registry, the schema, the validator
 * and /depth were all built and all correct; nothing joined them to a URL a
 * learner could open. The five lessons were listed on /course with their
 * objectives and durations, and none of them opened.
 *
 * Read from the content files rather than the database, deliberately. See
 * lib/lessons.ts.
 *
 * A reader, not a player: no progress tracking, no completion state, no
 * block-viewed marking. Those belong to a version of this product that has a
 * learner in it; this one has a reviewer in it.
 */

export const dynamic = 'force-static'

export function generateStaticParams() {
  // Both locales × every lesson, so a missing lesson is a build-time 404
  // rather than a runtime surprise.
  return ['ar', 'en'].flatMap((locale) =>
    lessonIndex().map((lesson) => ({ locale, slug: lesson.slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const lesson = lessonBySlug(slug)
  if (!lesson) return { title: 'Lesson — Masār' }
  const title = pick(locale as AppLocale, lesson.titleAr, lesson.titleEn)
  return { title: `${title} — Masār` }
}

const COPY = {
  ar: {
    eyebrow: 'درس',
    objectives: 'أهداف هذا الدرس',
    minutes: 'دقيقة',
    backToCourse: 'كل الدروس',
    previous: 'السابق',
    next: 'التالي',
    ofTotal: (n: number, total: number) => `الدرس ${n} من ${total}`,
    levelName: { L1: 'المستوى الأول', L2: 'المستوى الثاني', L3: 'المستوى الثالث' },
    levelWhat: {
      L1: 'نشر منظّم — يقرأ المتعلّم',
      L2: 'درس تفاعلي — يجيب ويقرّر',
      L3: 'تطبيق عملي — ينتج عملًا يُقيَّم',
    },
    cumulative: 'المستويات تراكمية',
    blockCountTemplate: '{n} كتلة معروضة',
    englishOnlyNotice:
      'هذا الدرس متاح بالإنجليزية فقط في هذه النسخة. واجهة المنصة والدرس الرابع بالعربية بالكامل.',
    onlyLevel: 'منشور بالمستوى الأول فقط',
    disclaimer:
      'محتوى تدريبي أصلي. كل الرموز والجهات في هذا الدرس خيالية للتدريب فقط. ليست استشارة طبية أو فوترية أو إكلينيكية أو قانونية أو تنظيمية.',
  },
  en: {
    eyebrow: 'Lesson',
    objectives: 'What this lesson is for',
    minutes: 'min',
    backToCourse: 'All lessons',
    previous: 'Previous',
    next: 'Next',
    ofTotal: (n: number, total: number) => `Lesson ${n} of ${total}`,
    levelName: { L1: 'L1', L2: 'L2', L3: 'L3' },
    levelWhat: {
      L1: 'Structured publishing — the learner reads',
      L2: 'Interactive lesson — they answer and decide',
      L3: 'Applied practice — they produce work that is scored',
    },
    cumulative: 'Levels are cumulative',
    blockCountTemplate: '{n} blocks shown',
    englishOnlyNotice: 'This lesson is English-only in this build.',
    onlyLevel: 'Published at L1 only',
    disclaimer:
      'Original training content. Every code and organisation in this lesson is fictional and for training only. Not medical, billing, clinical, legal or regulatory advice.',
  },
} as const

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const l = locale as AppLocale
  const ar = l === 'ar'
  const t = COPY[l] ?? COPY.ar

  const lesson = lessonBySlug(slug)
  if (!lesson) notFound()

  const { previous, next, position, total } = lessonNeighbours(slug)
  const levels = lesson.levels as Level[]
  const opensAt = deepestLevel(lesson.levels)

  return (
    <>
      <section className="band band-tight">
        <div className="shell">
          <p className="eyebrow">
            {t.eyebrow}
            {position ? ` · ${t.ofTotal(position, total)}` : ''}
          </p>
          <h1 className="h-display">{pick(l, lesson.titleAr, lesson.titleEn)}</h1>

          <div className="lesson-meta" style={{ marginBlockStart: '1.25rem' }}>
            <span className="chip">
              {lesson.estMinutes} {t.minutes}
            </span>
            {levels.map((lv) => (
              <span key={lv} className="chip chip-accent">
                {t.levelName[lv]}
              </span>
            ))}
            {levels.length === 1 ? <span className="chip">{t.onlyLevel}</span> : null}
            <span className="chip">
              {lesson.bilingual ? (ar ? 'عربي + إنجليزي' : 'AR + EN') : ar ? 'إنجليزي فقط' : 'EN only'}
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- objectives */}
      <section className="band band-alt band-tight">
        <div className="shell">
          <span className="eyebrow">{t.objectives}</span>
          {/*
            The objectives are the spine — every block carries one. Stating them
            before the body is what lets a reviewer judge whether the lesson
            teaches what it claims, which is the whole point of the blind
            inter-rater check this page exists to unblock.
          */}
          <ul className="lesson-objectives" style={{ marginBlockStart: '0.5rem' }}>
            {lesson.objectives.map((code) => {
              const o = objectiveFor(code)
              return (
                <li key={code}>
                  <span className="chip" data-latin="true">
                    {o.code}
                  </span>
                  <span>{ar ? o.ar : o.en}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------- body */}
      <section className="band">
        <div className="shell">
          <div className="lesson-body">
            <DepthView
              locale={l}
              levels={levels}
              initialLevel={opensAt}
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

          <nav className="lesson-nav" aria-label={ar ? 'التنقل بين الدروس' : 'Lesson navigation'}>
            <div>
              {previous ? (
                <a className="lesson-nav-link" href={`/${l}/lesson/${previous.slug}`}>
                  <span className="lesson-nav-dir">← {t.previous}</span>
                  <span className="lesson-nav-title">
                    {pick(l, previous.titleAr, previous.titleEn)}
                  </span>
                </a>
              ) : null}
            </div>
            <div className="lesson-nav-end">
              {next ? (
                <a className="lesson-nav-link is-next" href={`/${l}/lesson/${next.slug}`}>
                  <span className="lesson-nav-dir">{t.next} →</span>
                  <span className="lesson-nav-title">{pick(l, next.titleAr, next.titleEn)}</span>
                </a>
              ) : null}
            </div>
          </nav>

          <p style={{ marginBlockStart: '1.5rem' }}>
            <a className="link" href={`/${l}/course`}>
              {t.backToCourse}
            </a>
          </p>

          <footer className="rule-top" style={{ marginBlockStart: '2rem', paddingBlockStart: '1.5rem', fontSize: '0.75rem', lineHeight: 1.65, color: 'var(--color-muted)' }}>
            {t.disclaimer}
          </footer>
        </div>
      </section>
    </>
  )
}
