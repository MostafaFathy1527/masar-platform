import { withSentryConfig } from '@sentry/nextjs/config'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {}

// Sentry wraps the outside so its build hooks see the next-intl plugin's output.
// Source-map upload only runs when SENTRY_AUTH_TOKEN is present (Vercel build);
// a local build without it stays silent instead of failing.
export default withSentryConfig(withNextIntl(nextConfig), {
  org: 'masar-2x',
  project: 'masar-web',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  // Browser events go through the app's own origin, so ad blockers that drop
  // requests to sentry.io do not hide real errors. Under /api so the next-intl
  // proxy matcher leaves it alone.
  tunnelRoute: '/api/monitoring',
})
