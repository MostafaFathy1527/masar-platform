/**
 * The banner that must accompany any price shown anywhere in this product.
 *
 * Section 0.5: the hosting plan used for this demo forbids commercial use, no
 * payment provider is activated, and no money moves. A price with no banner
 * would be the single most misleading thing on the site, so the price card and
 * this component are used together and a test asserts it.
 */
export function SandboxBanner({ locale }: { locale: 'ar' | 'en' }) {
  return (
    <p className="sandbox-banner" role="note">
      {locale === 'ar'
        ? 'عرض توضيحي — وضع اختبار. لا تتم أي عملية شراء حقيقية ولا يتحرك أي مال.'
        : 'Demo — test mode. No real purchases are processed and no money moves.'}
    </p>
  )
}
