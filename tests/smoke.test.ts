import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, LOCALES } from '@/lib/env'

// Proves the test harness runs and the "@" alias resolves, so a green
// suite means something before the real scoring tests land.
describe('harness', () => {
  it('resolves the @ alias', () => {
    expect(LOCALES).toEqual(['ar', 'en'])
  })
  it('defaults to Arabic', () => {
    expect(DEFAULT_LOCALE).toBe('ar')
  })
})
