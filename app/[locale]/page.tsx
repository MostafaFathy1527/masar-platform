import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { routing, type AppLocale } from '@/i18n/routing'

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()

  const other: AppLocale = locale === 'ar' ? 'en' : 'ar'
  const depths = ['l1', 'l2', 'l3'] as const

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold tracking-wide">
          {t('hero.title')}
        </span>
        <nav className="flex items-center gap-4 text-sm">
          <a className="link" href="https://github.com" rel="noreferrer">
            {t('nav.repo')}
          </a>
          {/* Locale switch keeps the reader on the same route. */}
          <Link className="link" href="/" locale={other} hrefLang={other}>
            {other === 'ar' ? 'العربية' : 'English'}
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col justify-center py-16">
        <p className="badge">{t('hero.badge')}</p>

        <h1 className="mt-6 text-5xl font-bold tracking-tight">
          {t('hero.title')}
        </h1>
        <p className="mt-2 text-xl text-muted">{t('hero.tagline')}</p>
        <p className="mt-6 max-w-prose text-base leading-relaxed text-muted">
          {t('hero.body')}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {/*
            Week 1 stub. The intended destination is the claim-review
            simulation (SPEC.md §7) — practice before reading. That ships in
            Week 3; until then the tour parameter rides along so the entry
            point and its analytics exist from the start.
          */}
          <Link className="btn-primary" href="/?tour=1">
            {t('hero.cta')}
          </Link>
          <span className="text-sm text-muted">{t('hero.ctaNote')}</span>
        </div>

        <section className="mt-16">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            {t('depth.title')}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {depths.map((level) => (
              <li key={level} className="card">
                <h3 className="text-sm font-semibold">{t(`depth.${level}.name`)}</h3>
                <p className="mt-2 text-sm text-muted">{t(`depth.${level}.body`)}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-line pt-6 text-xs leading-relaxed text-muted">
        <p>{t('disclaimer')}</p>
        <p className="mt-3">
          {t('footer.status')} · {t('footer.rights')}
        </p>
      </footer>
    </div>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
