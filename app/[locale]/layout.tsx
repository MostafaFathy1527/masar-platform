import type { Metadata } from 'next'
import { IBM_Plex_Sans_Arabic, Instrument_Sans, JetBrains_Mono, Newsreader } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Reveal } from '@/components/site/Reveal'
import { DIR, routing, type AppLocale } from '@/i18n/routing'
import '../globals.css'

// next/font downloads the OFL faces at build time and serves them from this
// origin, so there is no third-party request at runtime and no layout shift.
// Each exposes a CSS variable that app/globals.css maps onto a role.
// Newsreader carries the display voice: a text serif, set tight, which is what
// separates a document from a dashboard. Instrument Sans is the body and UI
// face. IBM Plex Sans Arabic replaces Cairo: Cairo is rounded and heavy and
// made every Arabic heading shout; Plex sits at the same optical weight as the
// Latin and has a true 500/600 for labels.
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
})
const instrument = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-face',
  display: 'swap',
})
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-arabic',
  display: 'swap',
})

const FONTS = `${newsreader.variable} ${instrument.variable} ${jetbrains.variable} ${plexArabic.variable}`

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('title'), description: t('description') }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // Next 16: params is a promise and must be awaited.
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Required for static rendering of a [locale] segment.
  setRequestLocale(locale)
  const l = locale as AppLocale

  return (
    <html lang={locale} dir={DIR[l]} className={FONTS} suppressHydrationWarning>
      <body className="min-h-dvh bg-canvas text-ink antialiased">
        <NextIntlClientProvider>
          {/* Furniture wraps every page, so no route can ship without a way in
              or out. The main landmark is what a skip link and a screen reader
              rotor both look for. */}
          <SiteHeader locale={l} />
          <main id="main">{children}</main>
          <SiteFooter locale={l} />
          <Reveal />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
