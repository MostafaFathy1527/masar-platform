/** Locales the platform ships. Arabic is the default; see the project conventions. */
export const LOCALES = ['ar', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'ar'
