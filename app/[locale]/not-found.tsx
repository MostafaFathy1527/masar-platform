import { getLocale } from 'next-intl/server'

/*
 * Rendered inside the locale layout, so the header, footer and direction all
 * apply. A not-found page receives no params, so the locale comes from
 * next-intl's request config rather than the URL segment.
 */
export default async function NotFound() {
  const locale = await getLocale().catch(() => 'ar')
  const ar = locale !== 'en'
  const prefix = ar ? '/ar' : '/en'

  return (
    <div className="page-shell-narrow">
      <h1 className="page-title">{ar ? 'هذه الصفحة غير موجودة' : 'This page does not exist'}</h1>
      <p className="mt-3 max-w-prose leading-relaxed text-muted">
        {ar
          ? 'العنوان لا يطابق أي صفحة في مسار. ربما تغيّر الرابط، أو فيه خطأ في الكتابة.'
          : 'The address does not match any page on Masār. The link may have changed, or it may contain a typo.'}
      </p>
      <ul className="mt-6 flex flex-wrap gap-3">
        <li>
          <a className="btn-primary" href={prefix}>
            {ar ? 'الصفحة الرئيسية' : 'Home'}
          </a>
        </li>
        <li>
          <a className="btn-secondary" href={`${prefix}/course`}>
            {ar ? 'الدورة' : 'The course'}
          </a>
        </li>
      </ul>
    </div>
  )
}
