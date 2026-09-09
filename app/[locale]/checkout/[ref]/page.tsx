import { setRequestLocale } from 'next-intl/server'
import { SandboxBanner } from '@/components/payments/SandboxBanner'
import { CompleteCheckout } from '@/components/payments/CompleteCheckout'
import type { AppLocale } from '@/i18n/routing'

export const dynamic = 'force-dynamic'

// Where the mock provider sends the buyer. There is no external checkout and no
// card form: handling card details is exactly what this project must not do.
export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string; ref: string }>
}) {
  const { locale, ref } = await params
  setRequestLocale(locale)
  const l = locale as AppLocale
  const ar = l === 'ar'

  return (
    <div className="page-shell-narrow">
      <h1 className="page-title">
        {ar ? 'إتمام الطلب' : 'Complete your order'}
      </h1>
      <SandboxBanner locale={l} />
      <p className="mt-4 max-w-prose leading-relaxed text-muted">
        {ar
          ? 'لا توجد صفحة دفع ولا يُطلب منك أي بيانات بطاقة. اضغط لمحاكاة نتيجة الدفع؛ كلا المسارين حقيقي في الكود، والنجاح يُنشئ تسجيلًا فعليًا في الدورة.'
          : 'There is no payment page and you are not asked for card details. Choose an outcome to simulate; both paths are real in the code, and success creates a genuine enrolment.'}
      </p>
      <CompleteCheckout providerRef={ref} locale={l} />
    </div>
  )
}
