import { readFileSync, readdirSync } from 'node:fs'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { requireUser } from '@/lib/auth-guard'
import { getDb } from '@/lib/db'
import { certificateEligibility } from '@/lib/certificates'
import { objectiveFor } from '@/lib/objectives'
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
const LESSON_DIR = 'content/courses/rcm-foundations/lessons'

// The lesson index is read from the content files rather than the database,
// because the content files are the source of truth — that is the whole
// ownership story in section 0.3, and it means this page cannot claim a lesson
// that does not exist in the repository.
type LessonCard = {
  slug: string
  titleAr: string
  titleEn: string
  estMinutes: number
  levels: string[]
  bilingual: boolean
  objectives: string[]
  blockCounts: Record<string, number>
}

function readLessons(): LessonCard[] {
  return readdirSync(LESSON_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      const d = JSON.parse(readFileSync(`${LESSON_DIR}/${f}`, 'utf-8'))
      return {
        slug: d.slug,
        titleAr: d.titleAr,
        titleEn: d.titleEn,
        estMinutes: d.estMinutes,
        levels: d.levels,
        // Absent means bilingual; the four English-only lessons say so
        // explicitly in their source. Section 0.6: the limitation is stated on
        // the page rather than left for the reader to discover.
        bilingual: d.bilingual !== false,
        objectives: d.objectives ?? [],
        blockCounts: Object.fromEntries(
          Object.entries(d.blocks ?? {}).map(([k, v]) => [k, (v as unknown[]).length]),
        ),
      }
    })
}

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

  const enrolled =
    me && course
      ? await db.enrollment.findUnique({
          where: { userId_courseId: { userId: me.id, courseId: course.id } },
        })
      : null

  const exam = course
    ? await db.assessment.findFirst({ where: { courseId: course.id, scope: 'EXAM' } })
    : null

  const gates = certificateEligibility({
    examScorePct: null,
    examPassPct: exam?.passPct ?? 75,
    simulationPassed: false,
    isDemo: false,
  }).gates

  const lessons = readLessons()
  const totalMinutes = lessons.reduce((n, x) => n + x.estMinutes, 0)
  const objectiveCount = new Set(lessons.flatMap((x) => x.objectives)).size
  const price = ((course?.priceEgp ?? 0) / 100).toFixed(2)

  const LEVEL_LABEL: Record<string, { ar: string; en: string }> = {
    l1: { ar: 'مستوى ١', en: 'L1' },
    l2: { ar: 'مستوى ٢', en: 'L2' },
    l3: { ar: 'مستوى ٣', en: 'L3' },
  }

  return (
    <>
      <section className="band">
        <div className="shell">
          <span className="eyebrow">{ar ? 'الدورة' : 'The course'}</span>
          <h1 className="h-display measure">
            {course ? (ar ? course.titleAr : course.titleEn) : ar ? 'الدورة' : 'The course'}
          </h1>
          <p className="lede measure" style={{ marginBlockStart: '1.25rem' }}>
            {course ? (ar ? course.summaryAr : course.summaryEn) : ''}
          </p>

          <div className="lesson-meta" style={{ marginBlockStart: '1.75rem' }}>
            <span className="chip">
              {lessons.length} {ar ? 'دروس' : 'lessons'}
            </span>
            <span className="chip">
              {totalMinutes} {ar ? 'دقيقة' : 'min'}
            </span>
            <span className="chip">
              {objectiveCount} {ar ? 'أهداف' : 'objectives'}
            </span>
            <span className="chip">
              {ar ? 'تطبيق واحد' : '1 simulation'}
            </span>
            <span className="chip">{ar ? 'اختبار من مخطط' : 'Blueprint exam'}</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ index */}
      <section className="band band-alt">
        <div className="shell">
          <span className="eyebrow">{ar ? 'المحتوى' : 'What is inside'}</span>
          <h2 className="h-section measure">
            {ar ? 'خمسة دروس، بعمق معلن لكل درس' : 'Five lessons, each with its depth declared'}
          </h2>
          <p className="measure" style={{ marginBlockStart: '0.85rem', color: 'var(--color-muted)' }}>
            {ar
              ? 'العمق ليس وعدًا عامًا: كل درس يذكر المستويات المنشورة فعلًا، ولغته، ومدته.'
              : 'Depth is not a general promise. Each lesson states the levels actually published, its language, and its length.'}
          </p>

          <ol className="rule-list" style={{ marginBlockStart: '2rem' }}>
            {lessons.map((lesson, i) => (
              <li key={lesson.slug} className="lesson-row">
                <span className="lesson-num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="h-item">{ar ? lesson.titleAr : lesson.titleEn}</h3>

                  <div className="lesson-meta">
                    <span className="chip">
                      {lesson.estMinutes} {ar ? 'دقيقة' : 'min'}
                    </span>
                    {/*
                      The depth badge says the depth and nothing else. It
                      previously read "L1 · 8", which needs a legend nobody
                      reads, in a row that already carries four chips. The
                      block count belongs in the lesson, not the index.
                    */}
                    {['l1', 'l2', 'l3'].map((lv) =>
                      lesson.levels.map((x) => x.toLowerCase()).includes(lv) ? (
                        <span key={lv} className="chip chip-accent">
                          {ar ? LEVEL_LABEL[lv].ar : LEVEL_LABEL[lv].en}
                        </span>
                      ) : null,
                    )}
                    {/*
                      The bilingual marker is a statement of limitation, not a
                      badge. Four of the five lessons are English-only; saying so
                      here is section 0.6's honesty requirement, and it is the
                      kind of thing a buyer should not have to discover by
                      clicking.
                    */}
                    <span className="chip">
                      {lesson.bilingual
                        ? ar
                          ? 'عربي + إنجليزي'
                          : 'AR + EN'
                        : ar
                          ? 'إنجليزي فقط'
                          : 'EN only'}
                    </span>
                  </div>

                  {/*
                    Objective codes alone are meaningless to a buyer. The
                    statement is what tells them whether the course teaches the
                    thing they need, so the code becomes a label on the
                    statement rather than a chip standing in for one.

                    On Arabic the statement still renders in English, marked as
                    such, because the Arabic objectives have not been written
                    yet — see lib/objectives.ts. Showing the code alone would
                    hide that gap instead of stating it.
                  */}
                  <ul className="lesson-objectives">
                    {lesson.objectives.map((code) => {
                      const o = objectiveFor(code)
                      return (
                        <li key={code}>
                          <span className="chip" data-latin="true">
                            {o.code}
                          </span>
                          <span lang={ar ? 'en' : undefined} dir={ar ? 'ltr' : undefined}>
                            {o.en}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          {ar ? (
            <p className="measure" style={{ marginBlockStart: '1.5rem', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
              أهداف التعلّم معروضة بالإنجليزية حتى الآن. صياغتها بالعربية عمل تصميم تعليمي
              لم يُنجز بعد، وترجمتها الحرفية كانت ستنتج أهدافًا غير مكتوبة كأهداف.
            </p>
          ) : null}

          <p className="measure" style={{ marginBlockStart: '1.5rem', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
            {ar
              ? 'الدرس الرابع هو الدرس الكامل: منشور بالمستويات الثلاثة وبالعربية والإنجليزية. البقية منشورة بالمستوى الأول بالإنجليزية. '
              : 'Lesson four is the complete one: published at all three levels, in Arabic and English. The rest are published at L1 in English. '}
            <a className="link" href={`/${l}/depth`}>
              {ar ? 'انظر نموذج العمق' : 'See the depth model'}
            </a>
          </p>
        </div>
      </section>

      {/* --------------------------------------------------------- practice */}
      <section className="band">
        <div className="shell">
          <span className="eyebrow">{ar ? 'التقييم' : 'Assessment'}</span>
          <h2 className="h-section measure">
            {ar
              ? 'تطبيق مُصحَّح، واختبار مبني على مخطط'
              : 'A scored simulation, and an exam built from a blueprint'}
          </h2>

          <div className="rule-list measure" style={{ marginBlockStart: '1.75rem' }}>
            <div>
              <h3 className="h-item">{ar ? 'مراجعة مطالبة' : 'Claim review'}</h3>
              <p style={{ marginBlockStart: '0.5rem', color: 'var(--color-muted)' }}>
                {ar
                  ? 'مطالبة بها ستة أخطاء مزروعة. الدرجة بمقياس F1، فتعليم كل الحقول يخفض النتيجة بدل أن يرفعها.'
                  : 'A claim with six seeded errors. Scored with F1, so flagging every field lowers the score rather than raising it.'}
              </p>
              <p style={{ marginBlockStart: '0.6rem' }}>
                <a className="link" href={`/${l}/practice/claim-review`}>
                  {ar ? 'جرّبه الآن — بدون تسجيل' : 'Try it now — no signup'}
                </a>
              </p>
            </div>
            <div>
              <h3 className="h-item">{ar ? 'الاختبار' : 'The exam'}</h3>
              <p style={{ marginBlockStart: '0.5rem', color: 'var(--color-muted)' }}>
                {ar
                  ? 'الأسئلة مسحوبة من مخطط يوزّعها على الأهداف، لا من كومة أسئلة. المراجعة تعرض النتيجة لكل هدف.'
                  : 'Questions are drawn from a blueprint that distributes them across objectives, not from a pile. The review reports a score per objective.'}
              </p>
              <p style={{ marginBlockStart: '0.6rem' }}>
                <a className="link" href={`/${l}/assess/exam`}>
                  {ar ? 'ابدأ الاختبار' : 'Start the exam'}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ certificate */}
      <section className="band band-alt">
        <div className="shell">
          <span className="eyebrow">{ar ? 'الشهادة' : 'Certificate'}</span>
          <h2 className="h-section measure">
            {ar ? 'شروط الشهادة، معروضة قبل الشراء' : 'What the certificate requires, before you buy'}
          </h2>
          <p className="measure" style={{ marginBlockStart: '0.85rem', color: 'var(--color-muted)' }}>
            {ar
              ? 'المعيار معروض مسبقًا لا يُكتشف لاحقًا.'
              : 'The standard is visible in advance rather than discovered afterwards.'}
          </p>
          <ul className="cert-gates measure" style={{ marginBlockStart: '1.25rem' }}>
            {gates.map((g) => (
              <li key={g.id}>{ar ? g.labelAr : g.labelEn}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------------- price */}
      <section className="band band-tight">
        <div className="shell">
          <span className="eyebrow">{ar ? 'السعر' : 'Price'}</span>
          {/*
            The banner is rendered with the price, never separately. A price
            without it would be the most misleading thing on this site: no
            payment provider is active, the hosting plan forbids commercial use,
            and no money moves. A test asserts the two appear together.

            It is also deliberately small and near the bottom. This page is
            judged by what the course contains; a large number on a portfolio
            demo argues the opposite.
          */}
          <div className="price-strip measure" style={{ marginBlockStart: '0.5rem' }}>
            <SandboxBanner locale={l} />
            <p className="price-line">
              <strong>
                {price} <span>EGP</span>
              </strong>
              <span>
                {ar ? '— مبلغ رمزي للعرض فقط' : '— a symbolic amount, for demonstration only'}
              </span>
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
              {ar
                ? 'لا يوجد مزوّد دفع مُفعَّل في هذه النسخة.'
                : 'No payment provider is activated in this build.'}
            </p>

            {enrolled ? (
              <p>
                <strong>{ar ? 'أنت مسجَّل بالفعل.' : 'You are already enrolled.'}</strong>{' '}
                <a className="link" href={`/${l}/depth`}>
                  {ar ? 'ابدأ' : 'Start'}
                </a>
              </p>
            ) : (
              <StartCheckout courseSlug={COURSE_SLUG} locale={l} signedIn={!!me} />
            )}
          </div>
        </div>
      </section>
    </>
  )
}
