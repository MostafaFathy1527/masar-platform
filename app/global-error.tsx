'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import './globals.css'

// Rendered only when the root layout itself throws, so it has to provide its
// own <html> and <body>. Nothing from the locale layout is available here,
// which is why the copy is inlined in both languages instead of coming from
// next-intl.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="ar" dir="rtl">
      <body>
        <main style={{ maxInlineSize: '36rem', marginInline: 'auto', paddingBlock: '4rem', paddingInline: '1rem' }}>
          <h1>حصل خطأ غير متوقع</h1>
          <p>تم تسجيل الخطأ تلقائياً. جرّب تحميل الصفحة مرة أخرى.</p>
          <p lang="en" dir="ltr">
            Something went wrong. The error has been recorded automatically. Try loading the page again.
          </p>
          {error.digest ? (
            <p>
              <code>{error.digest}</code>
            </p>
          ) : null}
          <button type="button" onClick={reset}>
            إعادة المحاولة · Try again
          </button>
        </main>
      </body>
    </html>
  )
}
