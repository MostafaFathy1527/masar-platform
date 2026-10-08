import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { draftByCode, draftIndex, notRunNote } from '@/lib/drafts'

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()
  const ar = locale === 'ar'

  // The hero's document panel shows one real draft and what its gates said.
  // Read from the pipeline output rather than written here, so the panel can
  // never describe a run that did not happen. The first draft in the directory
  // is whichever one sorts first; nothing is hand-picked.
  const first = draftIndex()[0]
  const draft = first ? draftByCode(first.code) : null
  const notRun = draft ? notRunNote(draft.status) : null

  // The page's own header, <main> and footer are gone: the locale layout now
  // supplies all three. Keeping them produced two stacked wordmarks, a second
  // locale switch, and two <main> landmarks on one page.
  return (
    <>
      <section className="band band-lit" style={{ paddingBlock: 0 }}>
        <div className="shell hero">
          {/* Above the fold nothing animates in: the first screen is simply there. */}
          <div>
            <span className="eyebrow">{t('hero.badge')}</span>
            <h1 className="h-display">
              {ar
                ? 'دروس يتدرّب فيها المتعلّم على العمل، لا يقرأ عنه.'
                : 'Lessons in which the learner practises the work, rather than reads about it.'}
            </h1>
            <p className="lede" style={{ marginBlockStart: '1.25rem', maxInlineSize: '52ch' }}>
              {ar
                ? 'مسار منصة تعلّم قائمة على التطبيق، وخط إنتاج لا يسلّم درسًا إلا بعد أن يعبر بوابات جودة موثّقة. جرّب الدورة التجريبية، أو اقرأ ما أنتجه خط الإنتاج على مادة من خارجها.'
                : 'Masār is a practice-first learning platform and a content pipeline that delivers no lesson until it has passed documented quality gates. Try the demo course, or read what the pipeline produced on material outside it.'}
            </p>

            {/*
              Two visitors arrive here with different questions. A learner or a
              reviewer wants to try the thing; a training buyer wants to know
              what it would produce for them. A plain form for guest entry, so
              it works without JavaScript and cannot be triggered by a crawler.
            */}
            <div className="hero-actions">
              <form action="/api/demo" method="post">
                <button className="btn-primary" type="submit">
                  {t('hero.cta')}
                </button>
              </form>
              <Link className="btn-secondary" href="/samples">
                {ar ? 'اقرأ العينات' : 'Read the samples'}
              </Link>
            </div>
            <p className="hero-note">
              {ar
                ? 'بنقرة واحدة، بلا تسجيل. الدورة التجريبية في التأمين الطبي، وكل بياناتها خيالية.'
                : 'One click, no sign-up. The demo course is in medical insurance, and every record in it is fictional.'}
            </p>
          </div>

          {draft ? (
            <aside
              className="doc"
              aria-label={ar ? 'تقرير بوابات لمسودة حقيقية' : 'Gate report for a real draft'}
            >
              <div className="doc-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>pipeline/out/{draft.summary.dir}/STATUS.md</span>
              </div>
              <div className="doc-body">
                <div>
                  <div className="doc-meta" style={{ marginBlockEnd: '0.6rem' }}>
                    <span className="chip chip-accent" data-latin="true">{draft.summary.code}</span>
                    <span className="chip">{ar ? draft.summary.domainAr : draft.summary.domainEn}</span>
                    <span className="chip" data-latin="true">{draft.summary.levels.join(' + ')}</span>
                  </div>
                  <p className="doc-title">{ar ? draft.summary.titleAr : draft.summary.titleEn}</p>
                </div>
                <ul className="doc-gates">
                  <li>
                    <div>
                      <code>validate.py</code>
                      <small>{ar ? 'البنية والمحتوى الممنوع' : 'Structure and forbidden content'}</small>
                    </div>
                    <span className="status status-pass">{ar ? 'عبر' : 'passed'}</span>
                  </li>
                  <li>
                    <div>
                      <code>concept_log.py</code>
                      <small>{ar ? 'ترتيب المفاهيم' : 'Concept ordering'}</small>
                    </div>
                    <span className="status status-pass">{ar ? 'عبر' : 'passed'}</span>
                  </li>
                  <li>
                    <div>
                      <code>qa_gate.py</code>
                      <small>{ar ? 'جودة التصميم التعليمي' : 'Instructional quality'}</small>
                    </div>
                    <span className="status status-hold">{ar ? 'لم يُشغَّل' : 'not run'}</span>
                  </li>
                </ul>
                {/* The status file is written in English; the Arabic page states the
                    same fact in Arabic rather than quoting a Latin paragraph into RTL. */}
                <p className="doc-foot">
                  {ar
                    ? 'مسودة: لم تُنشر، ولم تُقيَّم بالمعيار لأن المقيِّم الوحيد المتاح هو من كتبها. التفاصيل في ملف الحالة.'
                    : (notRun ?? 'A draft. Not published and not rubric-scored.')}
                </p>
                <p>
                  <Link className="link" href={`/samples/${draft.summary.code}`}>
                    {ar ? 'اقرأ هذه المسودة' : 'Read this draft'}
                  </Link>
                </p>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      {/* ------------------------------------------------------- who are you */}
      {/*
        One question — who are you — with one destination per answer. The
        earlier version described the site; it did not tell a visitor where
        to go, and the owner, testing it as a visitor, got lost.
      */}
      <section className="band band-alt">
        <div className="shell">
          <div className="sec-head" data-reveal>
            <span className="eyebrow">{ar ? 'ابدأ من هنا' : 'Start here'}</span>
            <h2 className="h-section">{ar ? 'من أنت؟' : 'Who are you?'}</h2>
            <p>
              {ar
                ? 'ثلاثة أنواع من الزوار يصلون إلى هذه الصفحة. لكلٍّ منهم باب واحد.'
                : 'Three kinds of visitor arrive on this page. Each has one door.'}
            </p>
          </div>

          <ol className="who">
            <li data-reveal style={{ ['--i' as string]: 0 }}>
              <span className="who-num" aria-hidden="true">01</span>
              <h3 className="h-item">
                <Link className="lesson-link" href="/course">
                  {ar ? 'متعلّم أو معلّم — افتح الدورة' : 'A learner or a teacher — open the course'}
                </Link>
              </h3>
              <p className="who-body">
                {ar
                  ? 'خمسة دروس في التأمين الطبي، ومحاكاة لمراجعة مطالبة، واختبار مبني على مخطط. ادخل كزائر ولا تسجّل شيئًا.'
                  : 'Five lessons in medical insurance, a claim-review simulation and a blueprint-built exam. Enter as a guest and register nothing.'}
              </p>
            </li>
            <li data-reveal style={{ ['--i' as string]: 1 }}>
              <span className="who-num" aria-hidden="true">02</span>
              <h3 className="h-item">
                <Link className="lesson-link" href="/samples">
                  {ar ? 'مسؤول تدريب — اقرأ العينات' : 'A training lead — read the samples'}
                </Link>
              </h3>
              <p className="who-body">
                {ar
                  ? 'ثلاثة دروس من خط الإنتاج في مجالات غير التأمين. إن أعجبتك، '
                  : 'Three pipeline lessons in domains other than insurance. If they hold up, '}
                <Link className="link" href="/commission">
                  {ar ? 'أرسل درسًا من مادتك' : 'send one lesson of your material'}
                </Link>
                {ar ? ' وسيعود إليك مسودة بلا مقابل.' : ' and it comes back as a draft at no charge.'}
              </p>
            </li>
            <li data-reveal style={{ ['--i' as string]: 2 }}>
              <span className="who-num" aria-hidden="true">03</span>
              <h3 className="h-item">
                <Link className="lesson-link" href="/case-study">
                  {ar ? 'مراجع أو جهة توظيف — اقرأ دراسة الحالة' : 'A reviewer or an employer — read the case study'}
                </Link>
              </h3>
              <p className="who-body">
                {ar
                  ? 'لماذا بُنيت المنصة هكذا، وما الذي أخفق في الطريق، و'
                  : 'Why the platform was built this way, what failed on the way, and '}
                <Link className="link" href="/how-it-was-built">
                  {ar ? 'كيف يعمل خط الإنتاج' : 'how the pipeline works'}
                </Link>
                .
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------ three depths */}
      {/*
        The one idea a visitor should leave with: depth is a property of a
        lesson. Three short rows, no boxes; the comparison is in the reading.
      */}
      <section className="band">
        <div className="shell">
          <div className="sec-head" data-reveal>
            <span className="eyebrow">{t('depth.title')}</span>
            <h2 className="h-section">
              {ar ? 'العمق خاصية للدرس، لا درس منفصل' : 'Depth is a property of a lesson, not a separate lesson'}
            </h2>
            <p>
              <Link className="link" href="/depth">
                {ar ? 'انظر الفقرة نفسها بالمستويات الثلاثة' : 'See the same paragraph at all three levels'}
              </Link>
            </p>
          </div>
          <ol className="who">
            {(['l1', 'l2', 'l3'] as const).map((level, i) => (
              <li key={level} data-reveal style={{ ['--i' as string]: i }}>
                <span className="who-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="h-item">{t(`depth.${level}.name`)}</h3>
                <p className="who-body">{t(`depth.${level}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
