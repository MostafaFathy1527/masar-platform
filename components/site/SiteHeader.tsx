'use client'

import { usePathname } from 'next/navigation'
import type { AppLocale } from '@/i18n/routing'

// Page furniture. Before this existed a visitor could not tell where they were
// or move anywhere except through the landing page's list of links, which is
// most of what made a finished product read as unfinished.
//
// The guest CTA is the only filled button anywhere in the chrome. One filled
// button per screen is what makes it mean "start here".

const NAV = [
  { href: 'course', ar: 'الدورة', en: 'Course' },
  { href: 'depth', ar: 'نموذج العمق', en: 'Depth' },
  { href: 'practice/claim-review', ar: 'التطبيق', en: 'Practice' },
  { href: 'case-study', ar: 'دراسة الحالة', en: 'Case study' },
  { href: 'how-it-was-built', ar: 'كيف بُني', en: 'How it was built' },
] as const

export function SiteHeader({ locale }: { locale: AppLocale }) {
  const pathname = usePathname()
  const ar = locale === 'ar'
  const other: AppLocale = ar ? 'en' : 'ar'

  // Swap only the leading locale segment, so the switch keeps the reader on the
  // page they are actually reading rather than sending them home.
  const rest = pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || ''
  const otherHref = `/${other}${rest}`

  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <a className="wordmark" href={`/${locale}`}>
          <span className="wordmark-ar">مسار</span>
          <span>Masār</span>
        </a>

        <nav className="site-nav" aria-label={ar ? 'أقسام الموقع' : 'Sections'}>
          {NAV.map((item) => {
            const href = `/${locale}/${item.href}`
            const current = pathname === href || pathname.startsWith(href + '/')
            return (
              <a key={item.href} href={href} aria-current={current ? 'page' : undefined}>
                {ar ? item.ar : item.en}
              </a>
            )
          })}
        </nav>

        <div className="header-end">
          {/*
            The label names the language it switches TO, written in that
            language, and is the same shape in both directions. A bare "ع" in a
            small square on the English header was neither self-evident nor the
            same control as the "EN" on the Arabic one.
            lang on the link so a screen reader switches voice for the label.
          */}
          <a className="locale-switch" href={otherHref} lang={other} hrefLang={other}>
            {ar ? 'English' : 'العربية'}
          </a>
          <form action="/api/demo" method="post">
            <button className="btn-primary btn-sm" type="submit">
              {ar ? 'ادخل كزائر' : 'Enter as guest'}
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
