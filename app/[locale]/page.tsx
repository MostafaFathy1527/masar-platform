import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()
  const ar = locale === 'ar'

  // The page's own header, <main> and footer are gone: the locale layout now
  // supplies all three. Keeping them produced two stacked wordmarks, a second
  // locale switch, and two <main> landmarks on one page.
  return (
    <>
      <section className="band">
        <div className="shell">
          <span className="eyebrow">{t('hero.badge')}</span>
          <h1 className="h-display">{t('hero.title')}</h1>
          <p className="lede measure" style={{ marginBlockStart: '1rem' }}>
            {ar
              ? 'دروس يتدرّب فيها المتعلّم على العمل نفسه، لا يقرأ عنه — وخط إنتاج لا يسلّم درسًا إلا بعد أن يعبر بوابات جودة.'
              : 'Lessons in which the learner practises the work rather than reads about it — and a pipeline that delivers no lesson until it has passed quality gates.'}
          </p>

          {/*
            Two visitors arrive here with different questions. A learner or a
            reviewer wants to try the thing; a training buyer wants to know
            what it would produce for them. Before this split, the only door was
            the guest button, and a buyer saw an unexplained demo.
          */}
          <div className="cs-depths cs-paths" style={{ marginBlockStart: '2rem' }}>
            <div className="cs-depth">
              <h4>{ar ? 'جرّب المنصة' : 'Try the platform'}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-2)' }}>
                {ar
                  ? 'دورة تجريبية كاملة في التأمين الطبي: خمسة دروس بثلاثة أعماق، ومحاكاة لمراجعة مطالبة، واختبار مبني على مخطط. بنقرة واحدة، بلا تسجيل.'
                  : 'A complete demo course in medical insurance: five lessons at three depths, a claim-review simulation, and a blueprint-built exam. One click, no sign-up.'}
              </p>
              {/*
                A plain form, so guest entry works without JavaScript and cannot
                be triggered by a crawler following a link.
              */}
              <form action="/api/demo" method="post" style={{ marginBlockStart: '1rem' }}>
                <button className="btn-primary" type="submit">
                  {t('hero.cta')}
                </button>
              </form>
            </div>
            <div className="cs-depth">
              <h4>{ar ? 'اطلب دروسًا من مادتك' : 'Commission lessons from your material'}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-2)' }}>
                {ar
                  ? 'نفس خط الإنتاج، على مادة خبرائكم: دروس تطبيقية بالعربية والإنجليزية، كل درس بتقرير بواباته، والسعر يُحدَّد لكل مشروع. اقرأ ثلاث عينات حقيقية أولًا.'
                  : 'The same pipeline on your experts’ material: practice-first lessons in Arabic and English, each with its gate report, priced per project. Read three real samples first.'}
              </p>
              <p style={{ marginBlockStart: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <Link className="btn-secondary" href="/samples">
                  {ar ? 'اقرأ العينات' : 'Read the samples'}
                </Link>
                <Link className="link" href="/commission">
                  {ar ? 'الأسعار وكيف يعمل' : 'Pricing and how it works'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- who are you */}
      {/*
        The old second and third sections were a depth comparison and a list of
        every page. Both described the site; neither told a visitor where to go.
        Testing it on himself, the owner got lost. One question — who are you —
        with one destination per answer replaces them. The depth model and the
        practice workbench are still reachable, from the course and the footer.
      */}
      <section className="band band-alt">
        <div className="shell">
          <span className="eyebrow">{ar ? 'ابدأ من هنا' : 'Start here'}</span>
          <h2 className="h-section">{ar ? 'من أنت؟' : 'Who are you?'}</h2>

          <ul className="rule-list" style={{ marginBlockStart: '1.75rem' }}>
            <li>
              <h3 className="h-item">
                <Link href="/course">{ar ? 'متعلّم أو معلّم: افتح الدورة' : 'A learner or a teacher: open the course'}</Link>
              </h3>
              <p style={{ marginBlockStart: '0.4rem', color: 'var(--color-muted)' }}>
                {ar
                  ? 'خمسة دروس في التأمين الطبي، ومحاكاة لمراجعة مطالبة، واختبار. ادخل كزائر ولا تسجّل شيئًا.'
                  : 'Five lessons in medical insurance, a claim-review simulation and an exam. Enter as a guest and register nothing.'}
              </p>
            </li>
            <li>
              <h3 className="h-item">
                <Link href="/samples">{ar ? 'مسؤول تدريب: اقرأ العينات' : 'A training lead: read the samples'}</Link>
              </h3>
              <p style={{ marginBlockStart: '0.4rem', color: 'var(--color-muted)' }}>
                {ar
                  ? 'ثلاثة دروس من خط الإنتاج في مجالات غير التأمين. إن أعجبتك، '
                  : 'Three pipeline lessons in domains other than insurance. If they hold up, '}
                <Link className="link" href="/commission">
                  {ar ? 'أرسل درسًا من مادتك' : 'send one lesson of your material'}
                </Link>
                {ar ? ' وسيعود إليك مسودة بلا مقابل.' : ' and it comes back as a draft at no charge.'}
              </p>
            </li>
            <li>
              <h3 className="h-item">
                <Link href="/case-study">{ar ? 'مراجع أو جهة توظيف: اقرأ دراسة الحالة' : 'A reviewer or an employer: read the case study'}</Link>
              </h3>
              <p style={{ marginBlockStart: '0.4rem', color: 'var(--color-muted)' }}>
                {ar
                  ? 'لماذا بُنيت المنصة هكذا، وما الذي أخفق في الطريق، و'
                  : 'Why the platform was built this way, what failed on the way, and '}
                <Link className="link" href="/how-it-was-built">
                  {ar ? 'كيف يعمل خط الإنتاج' : 'how the pipeline works'}
                </Link>
                .
              </p>
            </li>
          </ul>
        </div>
      </section>

    </>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
