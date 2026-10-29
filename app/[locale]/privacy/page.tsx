import type { Metadata } from 'next'
import { pageSeo } from '@/lib/seo'
import { setRequestLocale } from 'next-intl/server'
import { requireUser } from '@/lib/auth-guard'
import { GUEST_RETENTION_DAYS } from '@/lib/retention'
import { ASK_RETENTION_DAYS } from '@/lib/ask/limits'
import type { AppLocale } from '@/i18n/routing'

// The export and delete controls act on the visitor's own account, so the page
// reads the session and cannot be prerendered once for everyone.
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const m: { title: string; description?: string } = locale === 'ar'
    ? {
        title: 'الخصوصية — مسار',
        description:
          'ما الذي تخزّنه هذه المنصة، وإلى متى، وكيف تستعيده أو تحذفه.',
      }
    : {
        title: 'Privacy — Masār',
        description:
          'What this platform stores, for how long, and how to take it back or remove it.',
      }
  return pageSeo(locale, '/privacy', m.title, m.description)
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
      'أسئلة «اسأل الدرس»: نص السؤال، والدرس، والأجزاء التي استشهدت بها الإجابة، ورمز زائر يومي هو بصمة مُشفّرة لعنوان الشبكة واليوم، لا العنوان نفسه، ويتغيّر كل يوم. يُستخدم الرمز لتحديد عدد الأسئلة فقط، وتُحذف الأسئلة بعد {askDays} يومًا. يُرسَل السؤال ونصوص الدرس إلى Cohere لكتابة الإجابة.',
    ],
    notStoredTitle: 'ما الذي لا يُخزَّن',
    notStored: [
      'لا عناوين IP ولا سجلات وصول من صنع هذا التطبيق. رمز «اسأل الدرس» بصمة لا يمكن عكسها إلى العنوان.',
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
    noSession:
      'التصدير والحذف يعملان على حسابك أنت، فيظهران هنا حين يكون لك حساب. زر «ادخل كزائر» أعلى الصفحة يُنشئ واحدًا، ويُحذف مع كل بياناته بعد {days} أيام.',
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
      '“Ask the lesson” questions: the question, the lesson, the parts the answer cited, and a daily visitor code, a keyed hash of the network address and the day rather than the address, which changes every day. The code is used only to cap how many questions one visitor asks, and questions are deleted after {askDays} days. The question and the lesson text are sent to Cohere to write the answer.',
    ],
    notStoredTitle: 'What is not stored',
    notStored: [
      'No IP addresses and no access logs created by this application. The “Ask the lesson” code is a hash that cannot be turned back into the address.',
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
    noSession:
      'Export and deletion act on your own account, so they appear here once you have one. “Enter as guest” at the top of the page creates one, and it is deleted with all its data after {days} days.',
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
  // Shown only to someone with an account: for an anonymous visitor the export
  // link answered 401 and the browser saved the error body as the download.
  const user = await requireUser().catch(() => null)

  return (
    <div className="page-shell-narrow">
      <h1 className="page-title">{t.title}</h1>
      <p className="mt-2 text-muted">{t.lead}</p>

      <h2 className="admin-q">{t.storedTitle}</h2>
      <ul className="privacy-list">
        {t.stored.map((line) => (
          <li key={line}>{line.replace('{askDays}', String(ASK_RETENTION_DAYS))}</li>
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
      {user ? (
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
      ) : (
        <p>{t.noSession.replace('{days}', String(GUEST_RETENTION_DAYS))}</p>
      )}
      <p className="mt-2 text-sm text-muted">{t.rightsNote}</p>

      <h2 className="admin-q">{t.contactTitle}</h2>
      <p className="text-muted">{t.contactBody}</p>
    </div>
  )
}
