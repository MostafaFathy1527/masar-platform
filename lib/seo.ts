import type { Metadata } from 'next'

/**
 * Search and link-preview metadata, in one place so every public page states
 * its canonical URL and its other-language twin the same way.
 *
 * Paths are locale-relative ('' for the home page, '/course', …) and are made
 * absolute by `metadataBase` in the locale layout. Arabic is the default
 * locale, so it is also the x-default.
 */

export const SITE_URL = 'https://masar.mostafafathy.com'

const LOCALES = ['ar', 'en'] as const

export function siteName(locale: string): string {
  return locale === 'ar' ? 'مسار' : 'Masār'
}

/** hreflang map for one page: each locale's URL, plus x-default. */
export function languageAlternates(path: string): Record<string, string> {
  return {
    ar: `/ar${path}`,
    en: `/en${path}`,
    'x-default': `/ar${path}`,
  }
}

/**
 * Title, description, canonical, hreflang, Open Graph and Twitter card for a
 * public page. A child's `openGraph` replaces the layout's rather than merging
 * with it, so this returns the whole block every time.
 */
export function pageSeo(
  locale: string,
  path: string,
  title: string,
  description?: string,
): Metadata {
  const ar = locale === 'ar'
  return {
    title,
    ...(description ? { description } : {}),
    alternates: {
      canonical: `/${locale}${path}`,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: 'website',
      siteName: siteName(locale),
      locale: ar ? 'ar_AR' : 'en_GB',
      alternateLocale: ar ? 'en_GB' : 'ar_AR',
      url: `/${locale}${path}`,
      title,
      ...(description ? { description } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      ...(description ? { description } : {}),
    },
  }
}

/**
 * Every public page, as locale-relative paths. Pure, so the sitemap's contents
 * are tested without the disk: the lesson slugs and sample codes are passed in
 * by the caller, which reads them from the content and pipeline folders.
 */
export function publicPaths(lessonSlugs: string[], sampleCodes: string[]): string[] {
  return [
    '',
    '/course',
    ...lessonSlugs.map((s) => `/lesson/${s}`),
    '/samples',
    ...sampleCodes.map((c) => `/samples/${c}`),
    '/depth',
    '/how-it-was-built',
    '/case-study',
    '/commission',
    '/privacy',
  ]
}

/** One sitemap entry per page per locale, each naming its other-language twin. */
export function sitemapEntries(paths: string[]) {
  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])),
      },
    })),
  )
}
