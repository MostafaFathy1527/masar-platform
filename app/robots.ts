import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

// Served at /robots.txt. The proxy matcher skips any path with a dot in it, so
// the locale middleware never rewrites this or /sitemap.xml.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Endpoints, an admin screen and per-order checkout pages: nothing a
      // search result should point at.
      disallow: ['/api/', '/ar/admin', '/en/admin', '/ar/checkout/', '/en/checkout/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
