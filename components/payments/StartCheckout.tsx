'use client'

import { useState } from 'react'
import type { AppLocale } from '@/i18n/routing'

export function StartCheckout({
  courseSlug,
  locale,
  signedIn,
}: {
  courseSlug: string
  locale: AppLocale
  signedIn: boolean
}) {
  const ar = locale === 'ar'
  const [busy, setBusy] = useState(false)

  if (!signedIn) {
    return (
      <form action="/api/demo" method="post" className="mt-4 assess-start">
        <button className="btn-primary" type="submit">
          {ar ? 'ادخل كزائر أولًا' : 'Enter as a guest first'}
        </button>
        <span className="text-sm text-muted">{ar ? 'بنقرة واحدة' : 'One click'}</span>
      </form>
    )
  }

  return (
    <button
      className="btn-primary mt-4"
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        try {
          // The request names the course, never a price. The amount is read
          // from the course row on the server.
          const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ courseSlug }),
          })
          const body = await res.json()
          if (body.redirectUrl) window.location.href = body.redirectUrl
        } finally {
          setBusy(false)
        }
      }}
    >
      {busy ? (ar ? 'جارٍ…' : 'Starting…') : ar ? 'ابدأ الطلب (وضع اختبار)' : 'Start order (test mode)'}
    </button>
  )
}
