import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { GUEST_RETENTION_DAYS } from '@/lib/retention'
import { routing, type AppLocale } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Privacy — Masār',
  description: 'What this platform stores, for how long, and how to take it back or remove it.',
}

/*
 * Every sentence on this page describes behaviour that exists. The retention
 * claim points at lib/retention.ts and /api/retention; export and deletion
 * point at /api/me/export and /api/me/delete. Nothing here is aspirational —
 * a privacy page with no mechanism behind it is worse than no page.
 */

const COPY = {
  ar: {
    title: 'الخصوصية',
    lead: 'كل ما هو مكتوب هنا مطبَّق فعلًا. لا توجد وعود بلا آلية خلفها.',
    storedTitle: 'ما الذي يُخزَّن',
    stored: [
      'بريد إلكتروني واسم. حسابات الزوار تحصل على بريد مُولَّد على نطاق غير قابل للتسليم واسم «زائر» — لا تُجمع أي بيانات شخصية حقيقية منهم.',
      'بصمة كلمة المرور (bcrypt)، لا كلمة المرور نفسها.',
      'بيانات التعلّم: التسجيل في الدورة، تقدّم الدروس، محاولات التقييم والإجابات المُرسلة، ومحاولات التدريب التطبيقي ونتائجها.',
      'الشهادات: الرقم التسلسلي وتاريخ الإصدار والنتيجة والأهداف التي أُثبتت.',
    ],
    notStoredTitle: 'ما الذي لا يُخزَّن',
    notStored: [
      'لا عناوين IP ولا سجلات وصول من صنع هذا التطبيق.',
      'لا تتبّع من طرف ثالث على صفحات المتعلّم — إطلاقًا. بيانات التعلّم صفوف في قاعدة بيانات هذا المشروع، وهذه هي نقطة الملكية.',
      'لا بيانات دفع: لا يوجد مزوّد دفع مُفعَّل في هذه النسخة.',
    ],
    retentionTitle: 'مدة الاحتفاظ',
    retentionBody:
      'تُحذف حسابات الزوار وكل بياناتها بعد {days} أيام. التنفيذ يجري عند إنشاء أي زائر جديد، فالحدث الذي يُنشئ البيانات هو نفسه الذي يمسح المنتهية منها.',
    checkIt: 'يمكن التحقق من الأعداد مباشرة',
    rightsTitle: 'حقوقك',
    export: 'تصدير بياناتك (JSON)',
    delete: 'حذف الحساب وكل بياناته',
    rightsNote:
      'الحذف حذف فعلي لا تعطيل: كل جدول يحمل بيانات المتعلّم مرتبط بالحساب بحذف متسلسل، ويوجد اختبار يمنع إضافة جدول بلا هذا الارتباط.',
    contactTitle: 'التواصل',
    contactBody:
      'هذه منصة عرض ذاتية المبادرة وليست منتجًا تجاريًا. للأسئلة، راجع المستودع العام.',
  },
  en: {
    title: 'Privacy',
    lead: 'Everything written here is implemented. There are no promises without a mechanism behind them.',
    storedTitle: 'What is stored',
    stored: [
      'An email address and a name. Guest accounts get a generated address on an undeliverable domain and the name “Guest” — no real personal data is collected from them.',
      'A password hash (bcrypt), never the password.',
      'Learning data: course enrolment, lesson progress, assessment attempts and the answers submitted, and applied-practice attempts and their scores.',
      'Certificates: serial, issue date, score, and the objectives demonstrated.',
    ],
    notStoredTitle: 'What is not stored',
    notStored: [
      'No IP addresses and no access logs created by this application.',
      'No third-party tracking on learner pages, ever. Learning data is rows in this project’s own database, which is the whole ownership argument.',
      'No payment data: no payment provider is active in this build.',
    ],
    retentionTitle: 'Retention',
    retentionBody:
      'Guest accounts and all their data are deleted after {days} days. The purge runs whenever a new guest is created, so the event that produces the data is the event that clears the expired data.',
    checkIt: 'The counts can be checked directly',
    rightsTitle: 'Your rights',
    export: 'Export your data (JSON)',
    delete: 'Delete your account and all its data',
    rightsNote:
      'Deletion is a real delete, not a deactivation flag: every table holding learner data cascades from the account, and a test prevents adding one that does not.',
    contactTitle: 'Contact',
    contactBody:
      'This is a self-initiated demonstration platform, not a commercial product. For questions, see the public repository.',
  },
} as const

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as AppLocale
  const t = COPY[l] ?? COPY.ar

  return (
    <div className="page-shell-narrow">
      <h1 className="page-title">{t.title}</h1>
      <p className="mt-2 text-muted">{t.lead}</p>

      <h2 className="admin-q">{t.storedTitle}</h2>
      <ul className="privacy-list">
        {t.stored.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h2 className="admin-q">{t.notStoredTitle}</h2>
      <ul className="privacy-list">
        {t.notStored.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h2 className="admin-q">{t.retentionTitle}</h2>
      <p>{t.retentionBody.replace('{days}', String(GUEST_RETENTION_DAYS))}</p>
      <p className="mt-2 text-sm">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="link" href="/api/retention">
          {t.checkIt}
        </a>
      </p>

      <h2 className="admin-q">{t.rightsTitle}</h2>
      <ul className="privacy-list">
        <li>
          {/* An API endpoint that returns a file, not a page. <Link> would
              client-side navigate instead of downloading, so the Next rule
              does not apply here — and because it does not apply, it never
              fires, which made the disable directive that used to sit here
              dead code that lint reported on every run. */}
          <a className="link" href="/api/me/export" download>
            {t.export}
          </a>
        </li>
        <li>
          {/* A plain form, so account deletion works without JavaScript. */}
          <form action="/api/me/delete" method="post">
            <button className="btn-secondary" type="submit">
              {t.delete}
            </button>
          </form>
        </li>
      </ul>
      <p className="mt-2 text-sm text-muted">{t.rightsNote}</p>

      <h2 className="admin-q">{t.contactTitle}</h2>
      <p className="text-muted">{t.contactBody}</p>
    </div>
  )
}
