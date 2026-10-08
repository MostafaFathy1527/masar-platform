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

  const depths = ['l1', 'l2', 'l3'] as const

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
          <div className="cs-depths" style={{ marginBlockStart: '2rem' }}>
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
                  ? 'نفس خط الإنتاج، على مادة خبرائكم: دروس تطبيقية بالعربية والإنجليزية، كل درس بتقرير بواباته، بسعر ثابت للدرس. اقرأ ثلاث عينات حقيقية أولًا.'
                  : 'The same pipeline on your experts’ material: practice-first lessons in Arabic and English, each with its gate report, at a fixed price per lesson. Read three real samples first.'}
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

      {/* ------------------------------------------------------ three depths */}
      <section className="band band-alt">
        <div className="shell">
          <span className="eyebrow">{t('depth.title')}</span>
          <h2 className="h-section">
            {ar ? 'العمق خاصية للدرس، لا درس منفصل' : 'Depth is a property of a lesson, not a separate lesson'}
          </h2>

          <div className="cs-depths" style={{ marginBlockStart: '1.75rem' }}>
            {depths.map((level) => (
              <div key={level} className="cs-depth">
                <h4>{t(`depth.${level}.name`)}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-2)' }}>
                  {t(`depth.${level}.body`)}
                </p>
              </div>
            ))}
          </div>

          <p style={{ marginBlockStart: '1.25rem' }}>
            <Link className="link" href="/depth">
              {ar ? 'انظر الفقرة نفسها بالمستويات الثلاثة' : 'See the same paragraph at all three levels'}
            </Link>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ index */}
      <section className="band">
        <div className="shell">
          <span className="eyebrow">{t('explore')}</span>
          <h2 className="h-section">{ar ? 'ما بداخل هذا العرض' : "What is inside this demo"}</h2>

          {/*
            Without a real index, a reviewer arriving here can reach the practice
            workbench and nothing else. The guest button is the fast path, not
            the only one.
          */}
          <ul className="rule-list" style={{ marginBlockStart: '1.75rem' }}>
            <li>
              <h3 className="h-item">
                <Link href="/course">{t('nav.course')}</Link>
              </h3>
              <p style={{ marginBlockStart: '0.4rem', color: 'var(--color-muted)' }}>
                {ar
                  ? 'خمسة دروس، كل درس بعمقه ولغته ومدته المعلنة.'
                  : 'Five lessons, each with its depth, language and length declared.'}
              </p>
            </li>
            <li>
              <h3 className="h-item">
                <Link href="/practice/claim-review">{ar ? 'مراجعة مطالبة' : 'Claim review'}</Link>
              </h3>
              <p style={{ marginBlockStart: '0.4rem', color: 'var(--color-muted)' }}>
                {ar
                  ? 'ستة أخطاء مزروعة، ودرجة بمقياس F1 تعاقب التعليم العشوائي.'
                  : 'Six seeded errors, scored with F1 so indiscriminate flagging is penalised.'}
              </p>
            </li>
            <li>
              <h3 className="h-item">
                <Link href="/samples">{ar ? 'عينات من خط الإنتاج' : 'Pipeline samples'}</Link>
              </h3>
              <p style={{ marginBlockStart: '0.4rem', color: 'var(--color-muted)' }}>
                {ar
                  ? 'ثلاثة دروس مسودّة في ثلاثة مجالات خارج الدورة، كما خرجت من البوابات.'
                  : 'Three draft lessons in three domains outside the course, as they left the gates.'}
              </p>
            </li>
            <li>
              <h3 className="h-item">
                <Link href="/case-study">{t('nav.caseStudy')}</Link>
              </h3>
              <p style={{ marginBlockStart: '0.4rem', color: 'var(--color-muted)' }}>
                {ar
                  ? 'القرارات التي أدافع عنها، وما الذي أخفق أثناء البناء.'
                  : 'The decisions worth defending, and what failed along the way.'}
              </p>
            </li>
            <li>
              <h3 className="h-item">
                <Link href="/how-it-was-built">{t('nav.built')}</Link>
              </h3>
              <p style={{ marginBlockStart: '0.4rem', color: 'var(--color-muted)' }}>
                {ar
                  ? 'خط إنتاج المحتوى وبواباته، وما لم يُشغَّل بعد.'
                  : 'The content pipeline, its gates, and what has not been run yet.'}
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
