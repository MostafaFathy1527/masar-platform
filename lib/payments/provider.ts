/**
 * The payment provider interface.
 *
 * v1.0 ships one implementation: a mock. No payment provider is activated, no
 * real money moves, and the hosting plan used for the demo forbids commercial
 * use — so the price card never appears without a banner saying so.
 *
 * The interface exists because the interesting part of payments, for a client
 * conversation, is not the integration. It is that swapping a provider is a
 * configuration change rather than a rewrite, and that what going live actually
 * requires is stated rather than glossed. SPEC.md carries that.
 *
 * Two properties are worth more than any provider-specific code:
 *
 *   PRICES ARE SERVER-COMPUTED. A checkout request names a course, never an
 *   amount. A client that could name its own price is a client that will.
 *
 *   COMPLETION IS IDEMPOTENT ON providerRef. Webhooks are retried by every real
 *   provider, so "the same reference twice" is normal traffic rather than an
 *   error case, and it must produce one order and one enrolment.
 */

export interface CheckoutRequest {
  userId: string
  courseId: string
  locale: 'ar' | 'en'
}

export interface CheckoutSession {
  /** Where to send the buyer. The mock keeps them on-site. */
  redirectUrl: string
  /** The provider's identifier for this attempt. Idempotency key. */
  providerRef: string
  amountMinor: number
  currency: string
  /** Always true in v1.0. A column, not a label. */
  isSandbox: boolean
}

export interface CompletionEvent {
  providerRef: string
  paid: boolean
}

export interface PaymentProviderAdapter {
  readonly name: 'MOCK'
  /** Creates a checkout attempt. The amount comes from the course, never the caller. */
  createCheckout(req: CheckoutRequest, priceMinor: number, currency: string): CheckoutSession
  /** Parses a provider callback into a decision. Must not trust unsigned input. */
  parseCompletion(raw: unknown): CompletionEvent | null
}
