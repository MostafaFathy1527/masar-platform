import { randomUUID } from 'node:crypto'
import type {
  CheckoutRequest,
  CheckoutSession,
  CompletionEvent,
  PaymentProviderAdapter,
} from './provider'

/**
 * The only adapter that runs in v1.0.
 *
 * It is a real implementation of the interface rather than a stub that returns
 * true: it issues a reference, requires that reference back, and refuses a
 * completion it never issued. That means the surrounding code — order
 * creation, idempotency, enrolment — is exercised for real, and swapping in a
 * live provider changes this file and nothing else.
 *
 * It deliberately does NOT simulate a payment page, take card details, or
 * pretend to authorise anything. Handling card details is precisely what this
 * project must not do.
 */
export class MockPaymentProvider implements PaymentProviderAdapter {
  readonly name = 'MOCK' as const

  // References this adapter has issued. A completion for a reference it never
  // issued is refused rather than accepted, so the happy path is not the only
  // path the code has ever taken.
  private issued = new Set<string>()

  createCheckout(
    req: CheckoutRequest,
    priceMinor: number,
    currency: string,
  ): CheckoutSession {
    if (!Number.isInteger(priceMinor) || priceMinor < 0) {
      throw new Error('price must be a non-negative integer in minor units')
    }
    const providerRef = `mock_${randomUUID()}`
    this.issued.add(providerRef)
    return {
      // Stays on-site: there is no external checkout to send anyone to, and
      // pretending otherwise would be theatre.
      redirectUrl: `/${req.locale}/checkout/${providerRef}`,
      providerRef,
      amountMinor: priceMinor,
      currency,
      isSandbox: true,
    }
  }

  parseCompletion(raw: unknown): CompletionEvent | null {
    if (typeof raw !== 'object' || raw === null) return null
    const body = raw as Record<string, unknown>
    const providerRef = body.providerRef
    if (typeof providerRef !== 'string' || !providerRef.startsWith('mock_')) return null
    // A real provider verifies a signature here. The mock verifies that it
    // issued the reference, which exercises the same rejection path.
    if (!this.issued.has(providerRef)) return null
    return { providerRef, paid: body.paid === true }
  }

  /** Test seam: lets a caller assert that an unknown reference is refused. */
  hasIssued(ref: string): boolean {
    return this.issued.has(ref)
  }
}

/** One instance per process. Swapping providers happens here and nowhere else. */
export const paymentProvider: PaymentProviderAdapter & { hasIssued(r: string): boolean } =
  new MockPaymentProvider()
