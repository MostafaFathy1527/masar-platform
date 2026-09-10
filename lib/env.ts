/** Locales the platform ships. Arabic is the default; see docs/CONVENTIONS.md. */
export const LOCALES = ['ar', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'ar'
