import { defineRouting } from 'next-intl/routing'

// Arabic is the default locale and is served from the bare path.
// See docs/CONVENTIONS.md: Arabic-first, English as a full mirror.
export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
})

export type AppLocale = (typeof routing.locales)[number]

/** RTL is a property of the locale, not a separate stylesheet. */
export const DIR: Record<AppLocale, 'rtl' | 'ltr'> = { ar: 'rtl', en: 'ltr' }
