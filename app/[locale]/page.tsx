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
            {t('hero.tagline')}
          </p>
          <p className="measure" style={{ marginBlockStart: '1.25rem', color: 'var(--color-muted)' }}>
            {t('hero.body')}
          </p>

          <div
            style={{
              marginBlockStart: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            {/*
              A plain form, so guest entry works without JavaScript and cannot be
              triggered by a crawler following a link. The endpoint creates the
              guest, signs them in, and redirects.
            */}
            <form action="/api/demo" method="post">
              <button className="btn-primary" type="submit">
                {t('hero.cta')}
              </button>
            </form>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
              {t('hero.ctaNote')}
            </span>
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
