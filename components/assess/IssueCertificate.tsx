'use client'

import { useState } from 'react'
import type { AppLocale } from '@/i18n/routing'

const COPY = {
  ar: {
    issue: 'أصدر الشهادة',
    issuing: 'جارٍ الإصدار…',
    blocked: 'استوفِ الشرطين أعلاه لإصدار الشهادة.',
    demoNote: 'ستصدر عبر اختصار العرض التوضيحي، وسيُذكر ذلك على صفحة التحقق.',
    issued: 'صدرت الشهادة',
    verify: 'صفحة التحقق',
    failed: 'تعذّر الإصدار.',
  },
  en: {
    issue: 'Issue certificate',
    issuing: 'Issuing…',
    blocked: 'Meet both conditions above to issue a certificate.',
    demoNote:
      'This will be issued through the demonstration shortcut, and the verification page will say so.',
    issued: 'Certificate issued',
    verify: 'Verification page',
    failed: 'Could not issue.',
  },
} as const

export function IssueCertificate({
  locale,
  eligible,
  viaDemo,
}: {
  locale: AppLocale
  eligible: boolean
  viaDemo: boolean
}) {
  const t = COPY[locale] ?? COPY.ar
  const [serial, setSerial] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  if (serial) {
    return (
      <div className="mt-6" aria-live="polite">
        <p>
          <strong>{t.issued}:</strong> {serial}
        </p>
        <p className="mt-2">
          <a className="link" href={`/${locale}/verify/${serial}`}>
            {t.verify}
          </a>
        </p>
      </div>
    )
  }

  if (!eligible) return <p className="mt-6 text-muted">{t.blocked}</p>

  return (
    <div className="mt-6">
      {/* The shortcut is never silent: a guest is told before issuing, and the
          verification page repeats it afterwards. */}
      {viaDemo ? <p className="verify-demo">{t.demoNote}</p> : null}
      <button
        className="btn-primary"
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError(false)
          try {
            const res = await fetch('/api/certificate', { method: 'POST' })
            const body = await res.json()
            if (body.serial) setSerial(body.serial)
            else setError(true)
          } finally {
            setBusy(false)
          }
        }}
      >
        {busy ? t.issuing : t.issue}
      </button>
      {error ? <p className="mt-2 is-wrong">{t.failed}</p> : null}
    </div>
  )
}
