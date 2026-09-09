'use client'

import { useState } from 'react'
import type { AppLocale } from '@/i18n/routing'

export function CompleteCheckout({
  providerRef,
  locale,
}: {
  providerRef: string
  locale: AppLocale
}) {
  const ar = locale === 'ar'
  const [state, setState] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function complete(paid: boolean) {
    setBusy(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ providerRef, paid }),
      })
      const body = await res.json()
      setState(body.status ?? body.error ?? 'ERROR')
    } finally {
      setBusy(false)
    }
  }

  if (state) {
    return (
      <div className="mt-6" aria-live="polite">
        <p>
          <strong>{state === 'PAID' ? (ar ? 'تم' : 'Enrolled') : (ar ? 'لم يتم' : 'Not completed')}</strong>
          {' — '}
          {state}
        </p>
        {state === 'PAID' ? (
          <p className="mt-2">
            <a className="link" href={`/${locale}/depth`}>
              {ar ? 'ابدأ الدرس' : 'Start the lesson'}
            </a>
          </p>
        ) : (
          <button className="btn-secondary mt-3" type="button" onClick={() => setState(null)}>
            {ar ? 'حاول مرة أخرى' : 'Try again'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button className="btn-primary" type="button" disabled={busy} onClick={() => complete(true)}>
        {ar ? 'محاكاة دفع ناجح' : 'Simulate a successful payment'}
      </button>
      {/* The declining path is a real path, not a decoration: it is what makes
          the success path something other than the only code ever executed. */}
      <button className="btn-secondary" type="button" disabled={busy} onClick={() => complete(false)}>
        {ar ? 'محاكاة دفع مرفوض' : 'Simulate a declined payment'}
      </button>
    </div>
  )
}
