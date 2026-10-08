import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { DepthView } from '@/components/player/DepthView'
import { pick } from '@/lib/content-locale'
import { DRAFT_OBJECTIVES, draftByCode, draftIndex, notRunNote } from '@/lib/drafts'
import { deepestLevel } from '@/lib/lessons'
import type { AppLocale } from '@/i18n/routing'
import type { Level } from '@/lib/schema/lesson'

/**
 * A draft, readable. Same renderer as the course reader, with three
 * differences that are the point: the word DRAFT before the title, the
 * STATUS.md "not run" line quoted on the page, and no previous/next — a draft
 * belongs to no course.
 */

export const dynamic = 'force-static'

const REPO = 'https://github.com/MostafaFathy1527/masar-platform'

export function generateStaticParams() {
  return ['ar', 'en'].flatMap((locale) => draftIndex().map((d) => ({ locale, code: d.code })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>
}): Promise<Metadata> {
  const { locale, code } = await params
  const d = draftByCode(code)
  if (!d) return { title: 'Sample — Masār' }
  const title = pick(locale as AppLocale, d.summary.titleAr, d.summary.titleEn)
  return { title: `${title} (${locale === 'ar' ? 'مسودّة' : 'draft'}) — Masār` }
}

const COPY = {
  ar: {
    eyebrow: 'مسودّة من خط الإنتاج',
    objectives: 'هدف هذا الدرس',
    minutes: 'دقيقة',
    levelName: { L1: 'المستوى الأول', L2: 'المستوى الثاني', L3: 'المستوى الثالث' },
    levelWhat: {
      L1: 'نشر منظّم — يقرأ المتعلّم',
      L2: 'درس تفاعلي — يجيب ويقرّر',
      L3: 'تطبيق عملي — ينتج عملًا يُقيَّم',
    },
    cumulative: 'المستويات تراكمية',
    blockCountTemplate: '{n} كتلة معروضة',
    englishOnlyNotice: 'هذا الدرس متاح بالإنجليزية فقط.',
    draft: 'مسودّة',
    draftNote: 'هذا الدرس خرج من خط الإنتاج ولم ينشره أحد. عبر بوابتي البنية وترتيب المفاهيم؛ وما لم يُشغَّل عليه مكتوب أدناه كما في ملف حالته.',
    notRun: 'لم يُشغَّل',
    files: 'الملفات في المستودع',
    allSamples: 'كل العينات',
    commission: 'اطلب درسًا من مادتك',
    disclaimer: 'محتوى تدريبي أصلي من معرفة عامة. كل الجهات والأشخاص خياليون للتدريب فقط. ليس استشارة قانونية أو تنظيمية.',
  },
  en: {
    eyebrow: 'Pipeline draft',
    objectives: 'What this lesson is for',
    minutes: 'min',
    levelName: { L1: 'L1', L2: 'L2', L3: 'L3' },
    levelWhat: {
      L1: 'Structured publishing — the learner reads',
      L2: 'Interactive lesson — they answer and decide',
      L3: 'Applied practice — they produce work that is scored',
    },
    cumulative: 'Levels are cumulative',
    blockCountTemplate: '{n} blocks shown',
    englishOnlyNotice: 'This lesson is English-only.',
    draft: 'DRAFT',
    draftNote: 'This lesson left the pipeline and nobody published it. It passed the structure and concept-ordering gates; what was not run on it is quoted below from its status file.',
    notRun: 'Not run',
    files: 'Files in the repository',
    allSamples: 'All samples',
    commission: 'Commission one from your material',
    disclaimer: 'Original training content from public knowledge. Every organisation and person is fictional and for training only. Not legal or regulatory advice.',
  },
} as const

export default async function SamplePage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>
}) {
  const { locale, code } = await params
  setRequestLocale(locale)
  const l = locale as AppLocale
  const ar = l === 'ar'
  const t = COPY[l] ?? COPY.ar

  const d = draftByCode(code)
  if (!d) notFound()
  const { summary, lesson, status } = d
  const levels = lesson.levels as Level[]
  const notRun = notRunNote(status)

  return (
    <>
      <section className="band band-tight">
        <div className="shell">
          <p className="eyebrow">
            {t.eyebrow} · {ar ? summary.domainAr : summary.domainEn}
          </p>
          <h1 className="h-display">
            <span className="chip chip-accent" data-latin="true" style={{ verticalAlign: 'middle', marginInlineEnd: '0.6rem' }}>{t.draft}</span>
            {pick(l, lesson.titleAr, lesson.titleEn)}
          </h1>
          <div className="lesson-meta" style={{ marginBlockStart: '1.25rem' }}>
            <span className="chip">{lesson.estMinutes} {t.minutes}</span>
            {levels.map((lv) => (
              <span key={lv} className="chip chip-accent">{t.levelName[lv]}</span>
            ))}
            <span className="chip">
              {lesson.bilingual ? (ar ? 'عربي + إنجليزي' : 'AR + EN') : ar ? 'إنجليزي فقط' : 'EN only'}
            </span>
          </div>
          <p className="admin-caveat">
            {t.draftNote}
            {notRun ? (
              <>
                {' '}
                <strong>{t.notRun}:</strong> <code>{notRun.split(':')[0]}</code>
              </>
            ) : null}
          </p>
        </div>
      </section>

      <section className="band band-alt band-tight">
        <div className="shell">
          <span className="eyebrow">{t.objectives}</span>
          <ul className="lesson-objectives" style={{ marginBlockStart: '0.5rem' }}>
            {lesson.objectives.map((c) => {
              const o = DRAFT_OBJECTIVES[c]
              return (
                <li key={c}>
                  <span className="chip" data-latin="true">{c}</span>
                  <span>{o ? (ar ? o.ar : o.en) : ''}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <div className="lesson-body">
            <DepthView
              locale={l}
              levels={levels}
              initialLevel={deepestLevel(lesson.levels)}
              blocks={{ l1: lesson.blocks.l1 ?? [], l2: lesson.blocks.l2 ?? [], l3: lesson.blocks.l3 ?? [] }}
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

          <p style={{ marginBlockStart: '2rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
            {t.files}:{' '}
            <a className="link" href={`${REPO}/blob/main/pipeline/out/${summary.dir}/lesson.json`} rel="noreferrer">lesson.json</a>
            {' · '}
            <a className="link" href={`${REPO}/blob/main/pipeline/out/${summary.dir}/items.json`} rel="noreferrer">items.json</a>
            {' · '}
            <a className="link" href={`${REPO}/blob/main/pipeline/out/${summary.dir}/STATUS.md`} rel="noreferrer">STATUS.md</a>
          </p>

          <p style={{ marginBlockStart: '1rem' }}>
            <a className="btn-primary" href={`/${l}/commission`}>{t.commission}</a>
            {' '}
            <a className="link" href={`/${l}/samples`} style={{ marginInlineStart: '1rem' }}>{t.allSamples}</a>
          </p>

          <footer className="rule-top" style={{ marginBlockStart: '2rem', paddingBlockStart: '1.5rem', fontSize: '0.75rem', lineHeight: 1.65, color: 'var(--color-muted)' }}>
            {t.disclaimer}
          </footer>
        </div>
      </section>
    </>
  )
}
