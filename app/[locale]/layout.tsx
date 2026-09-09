import type { Metadata } from 'next'
import { Archivo, Cairo, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { DIR, routing, type AppLocale } from '@/i18n/routing'
import '../globals.css'

// next/font downloads the OFL faces at build time and serves them from this
// origin, so there is no third-party request at runtime and no layout shift.
// Each exposes a CSS variable that app/globals.css maps onto a role.
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-archivo',
  display: 'swap',
})
const spaceGrotesk = Space_Grotesk({
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
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
})

const FONTS = `${archivo.variable} ${spaceGrotesk.variable} ${jetbrains.variable} ${cairo.variable}`

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
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
