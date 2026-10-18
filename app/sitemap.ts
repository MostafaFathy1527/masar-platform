import type { MetadataRoute } from 'next'
import { draftIndex } from '@/lib/drafts'
import { lessonIndex } from '@/lib/lessons'
import { publicPaths, sitemapEntries } from '@/lib/seo'

// The lessons and samples are read from their folders, so adding one adds its
// pages here in both languages and nothing has to be remembered.
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(
    publicPaths(
      lessonIndex().map((l) => l.slug),
      draftIndex().map((d) => d.code),
    ),
  )
}
