// Browser-side Sentry. Next 15.3+ loads this file before the app hydrates; it
// replaces the older sentry.client.config.ts convention.
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  // Off outside production so a local dev session does not fill the project
  // with half-written code. The DSN is public by design; the key is in env.
  enabled: process.env.NODE_ENV === 'production',
  // One in five page loads carries a performance trace. Enough to see slow
  // routes without burning the credit on a quiet site.
  tracesSampleRate: 0.2,
  // Replay only when an error happened, never for a healthy session, and with
  // Sentry's default masking: all text and inputs are masked before they leave
  // the browser, so a learner's answers are never recorded.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
  // "Object Not Found Matching Id" is thrown by Microsoft's link scanner
  // (Outlook SafeLinks) when it opens a page, never by a real browser. It was
  // the second issue the project ever received; dropping it keeps the quota
  // for errors a learner could actually hit.
  ignoreErrors: [/Object Not Found Matching Id/],
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
