import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { MockPaymentProvider } from '@/lib/payments/mock'

// The provider interface exists so that swapping providers is configuration
// rather than a rewrite. These test the two properties that would still matter
// with a real provider behind it — everything else is provider-specific detail
// this project deliberately does not have.

const req = { userId: 'u1', courseId: 'c1', locale: 'en' as const }

describe('mock payment provider', () => {
  it('issues a unique reference per checkout', () => {
    const p = new MockPaymentProvider()
    const a = p.createCheckout(req, 149900, 'EGP')
    const b = p.createCheckout(req, 149900, 'EGP')
    expect(a.providerRef).not.toBe(b.providerRef)
  })

  // A column, not a label. v1.0 activates no provider and no money moves.
  it('always marks the session as sandbox', () => {
    const p = new MockPaymentProvider()
    expect(p.createCheckout(req, 149900, 'EGP').isSandbox).toBe(true)
  })

  it('carries the amount it was given, and refuses a nonsensical one', () => {
    const p = new MockPaymentProvider()
    expect(p.createCheckout(req, 149900, 'EGP').amountMinor).toBe(149900)
    expect(() => p.createCheckout(req, -1, 'EGP')).toThrow()
    expect(() => p.createCheckout(req, 1.5, 'EGP')).toThrow()
  })

  // The rejection path has to be real, or the surrounding code has only ever
  // taken the happy one.
  it('refuses a completion for a reference it never issued', () => {
    const p = new MockPaymentProvider()
    expect(p.parseCompletion({ providerRef: 'mock_not_mine', paid: true })).toBeNull()
  })

  it('refuses malformed completions', () => {
    const p = new MockPaymentProvider()
    expect(p.parseCompletion(null)).toBeNull()
    expect(p.parseCompletion('paid')).toBeNull()
    expect(p.parseCompletion({})).toBeNull()
    expect(p.parseCompletion({ providerRef: 42, paid: true })).toBeNull()
    // A reference not from this provider is not this provider's business.
    expect(p.parseCompletion({ providerRef: 'stripe_abc', paid: true })).toBeNull()
  })

  it('accepts a completion for a reference it issued', () => {
    const p = new MockPaymentProvider()
    const session = p.createCheckout(req, 149900, 'EGP')
    expect(p.parseCompletion({ providerRef: session.providerRef, paid: true })).toEqual({
      providerRef: session.providerRef,
      paid: true,
    })
  })

  it('reports a declined payment as declined rather than assuming success', () => {
    const p = new MockPaymentProvider()
    const session = p.createCheckout(req, 149900, 'EGP')
    expect(p.parseCompletion({ providerRef: session.providerRef, paid: false })?.paid).toBe(false)
    // Anything that is not exactly true is not a payment.
    expect(p.parseCompletion({ providerRef: session.providerRef, paid: 'yes' })?.paid).toBe(false)
  })

  it('keeps the buyer on-site: there is no external checkout to send them to', () => {
    const p = new MockPaymentProvider()
    const session = p.createCheckout(req, 149900, 'EGP')
    expect(session.redirectUrl.startsWith('/')).toBe(true)
    expect(session.redirectUrl).not.toMatch(/^https?:/)
  })
})

describe('what the mock deliberately does not do', () => {
  it('never asks for or returns anything resembling card data', () => {
    const p = new MockPaymentProvider()
    const session = p.createCheckout(req, 149900, 'EGP')
    const serialised = JSON.stringify(session).toLowerCase()
    for (const term of ['card', 'pan', 'cvv', 'cvc', 'expiry', 'iban', 'account']) {
      expect(serialised, `session mentions "${term}"`).not.toContain(term)
    }
  })
})

describe('a price never renders without the sandbox banner', () => {
  // Section 0.5. A price with no banner would be the most misleading thing on
  // the site: no provider is active, the hosting plan forbids commercial use,
  // and no money moves. This is structural rather than visual so it cannot be
  // undone by an edit that only looks like a layout change.
  const pages = ['app/[locale]/course/page.tsx', 'app/[locale]/checkout/[ref]/page.tsx']

  it.each(pages)('%s imports and renders the banner', (file) => {
    const src = readFileSync(file, 'utf-8')
    expect(src).toContain('SandboxBanner')
    expect(src).toMatch(/<SandboxBanner\s/)
  })

  it('any page showing an amount also shows the banner', () => {
    for (const file of pages) {
      const src = readFileSync(file, 'utf-8')
      if (/price-amount|amountMinor|priceEgp/.test(src)) {
        expect(src, `${file} shows an amount without the banner`).toContain('SandboxBanner')
      }
    }
  })

  it('the banner text says plainly that nothing is processed', () => {
    const src = readFileSync('components/payments/SandboxBanner.tsx', 'utf-8')
    expect(src).toContain('No real purchases are processed')
    expect(src).toContain('no money moves')
  })
})
