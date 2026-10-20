import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

// The rating form is a static page (public/rate/index.html). People type /rate, and the
// locale proxy turns that into /ar/rate or /en/rate, so both land here and go on to the
// form with the private code kept.

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function RateRedirect({ searchParams }: { searchParams: Promise<{ k?: string | string[] }> }) {
  const { k } = await searchParams
  const code = Array.isArray(k) ? k[0] : k
  redirect(code ? `/rate/index.html?k=${encodeURIComponent(code)}` : '/rate/index.html')
}
