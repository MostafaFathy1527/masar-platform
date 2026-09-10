import type { AppLocale } from '@/i18n/routing'

/**
 * Content is stored as xAr / xEn pairs (docs/CONVENTIONS.md). This picks the
 * right side for the active locale.
 *
 * Arabic is the default locale and is never optional in the schema, so there is
 * always something to render; English falls back to Arabic rather than to an
 * empty string, because a blank block is a worse failure than a wrong-language
 * one — it looks like the lesson is broken.
 */
export function pick(
  locale: AppLocale,
  ar: string | undefined,
  en: string | undefined,
): string {
  return (locale === 'ar' ? ar : (en ?? ar)) ?? ''
}

export type BlockProps<P> = { payload: P; locale: AppLocale; blockId: string }
