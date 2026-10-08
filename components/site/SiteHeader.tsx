'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { AppLocale } from '@/i18n/routing'

// Page furniture. Before this existed a visitor could not tell where they were
// or move anywhere except through the landing page's list of links, which is
// most of what made a finished product read as unfinished.
//
// The guest CTA is the only filled button anywhere in the chrome. One filled
// button per screen is what makes it mean "start here".
//
// Ordered by who arrives: a learner (course, practice), then a buyer (samples,
// commission), then a reviewer (case study, how it was built). /depth is
// reached from the landing page and the course; it earned no header slot.
const NAV = [
  { href: 'course', ar: 'الدورة', en: 'Course' },
  { href: 'practice/claim-review', ar: 'التطبيق', en: 'Practice' },
  { href: 'samples', ar: 'العينات', en: 'Samples' },
  { href: 'commission', ar: 'اطلب دروسًا', en: 'Commission' },
  { href: 'case-study', ar: 'دراسة الحالة', en: 'Case study' },
  { href: 'how-it-was-built', ar: 'كيف بُني', en: 'How it was built' },
] as const

export function SiteHeader({ locale }: { locale: AppLocale }) {
  const pathname = usePathname()
  const ar = locale === 'ar'
  const other: AppLocale = ar ? 'en' : 'ar'

  // Below the desktop breakpoint the inline nav is hidden, and for a long time
  // nothing replaced it: a phone visitor saw the wordmark, the language switch
  // and the guest button, and could reach nothing else except by guessing
  // URLs. This panel is that replacement. It is a real disclosure — button
  // with aria-expanded, Escape closes it, focus returns to the button — rather
  // than a hover menu, because there is no hover on a phone.
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Every link in the panel is a plain anchor, so a navigation unloads the
  // page and the open state with it. Closing on click as well costs nothing
  // and keeps the panel honest if a client-side transition is ever introduced.
  const close = () => setOpen(false)

  // Swap only the leading locale segment, so the switch keeps the reader on the
  // page they are actually reading rather than sending them home.
  const rest = pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || ''
  const otherHref = `/${other}${rest}`

  const items = NAV.map((item) => {
    const href = `/${locale}/${item.href}`
    const current = pathname === href || pathname.startsWith(href + '/')
    return { ...item, href, current }
  })

  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <a className="wordmark" href={`/${locale}`}>
          <span className="wordmark-ar">مسار</span>
          <span>Masār</span>
        </a>

        <nav className="site-nav" aria-label={ar ? 'أقسام الموقع' : 'Sections'}>
          {items.map((item) => (
            <a key={item.href} href={item.href} aria-current={item.current ? 'page' : undefined}>
              {ar ? item.ar : item.en}
            </a>
          ))}
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
          <form action="/api/demo" method="post" className="header-guest">
            <button className="btn-primary btn-sm" type="submit">
              {ar ? 'ادخل كزائر' : 'Enter as guest'}
            </button>
          </form>
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            {/* Two bars that become a cross: the state is also announced, so the icon is decorative. */}
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 8h16M4 16h16" />
              )}
            </svg>
            <span>{open ? (ar ? 'إغلاق' : 'Close') : (ar ? 'القائمة' : 'Menu')}</span>
          </button>
        </div>
      </div>

      <div id={panelId} className="site-menu" hidden={!open}>
        <nav className="shell" aria-label={ar ? 'أقسام الموقع' : 'Sections'}>
          <ul>
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href} aria-current={item.current ? 'page' : undefined} onClick={close}>
                  {ar ? item.ar : item.en}
                </a>
              </li>
            ))}
          </ul>
          <div className="site-menu-end">
            <form action="/api/demo" method="post">
              <button className="btn-primary" type="submit">
                {ar ? 'ادخل كزائر' : 'Enter as guest'}
              </button>
            </form>
            <a className="locale-switch" href={otherHref} lang={other} hrefLang={other}>
              {ar ? 'English' : 'العربية'}
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
