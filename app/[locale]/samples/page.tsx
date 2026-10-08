import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { routing, type AppLocale } from '@/i18n/routing'
import { draftIndex } from '@/lib/drafts'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return locale === 'ar'
    ? { title: 'عينات من خط الإنتاج — مسار', description: 'دروس مسودّة ولّدها خط الإنتاج خارج مجال الدورة التجريبية، معروضة كما خرجت من البوابات.' }
    : { title: 'Pipeline samples — Masār', description: 'Draft lessons the pipeline produced outside the demo course’s domain, shown as they left the gates.' }
}

export default async function SamplesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as AppLocale
  const ar = l === 'ar'
  const drafts = draftIndex()

  return (
    <div className="page-shell-narrow">
      <h1 className="page-title">{ar ? 'عينات من خط الإنتاج' : 'Pipeline samples'}</h1>
      <p className="mt-3 max-w-prose leading-relaxed text-muted">
        {ar
          ? 'كل درس هنا مسودّة حقيقية ولّدها خط الإنتاج من ملاحظة مصدر واحدة، في مجال غير مجال الدورة التجريبية، وعبر بوابتي البنية وترتيب المفاهيم. لم يُنشر أي منها في دورة، ولم يُقيَّم بالمعيار، وكل صفحة تقول ذلك في أولها. اقرأها كما سيقرأها مدير تدريب يقرّر هل يطلب عشرين مثلها.'
          : 'Every lesson here is a real draft the pipeline produced from one source note, in a domain other than the demo course’s, and passed through the structure and concept-ordering gates. None is published in a course, none is rubric-scored, and each page says so at the top. Read them the way a training manager deciding whether to commission twenty would.'}
      </p>

      <ul className="rule-list" style={{ marginBlockStart: '1.75rem' }}>
        {drafts.map((d) => (
          <li key={d.code}>
            <h3 className="h-item">
              <a href={`/${l}/samples/${d.code}`}>
                <span className="chip" data-latin="true" style={{ marginInlineEnd: '0.5rem' }}>{d.code}</span>
                {ar ? d.titleAr : d.titleEn}
              </a>
            </h3>
            <p style={{ marginBlockStart: '0.4rem', color: 'var(--color-muted)' }}>
              {ar ? d.domainAr : d.domainEn} · {d.estMinutes} {ar ? 'دقيقة' : 'min'} · {d.levels.join(' + ')} ·{' '}
              {d.bilingual ? (ar ? 'عربي + إنجليزي' : 'AR + EN') : ar ? 'إنجليزي فقط' : 'EN only'}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-prose leading-relaxed">
        {ar ? 'تريد درسًا من مادتك أنت؟ ' : 'Want one from your own material? '}
        <a className="link" href={`/${l}/commission`}>{ar ? 'اطلب دروسًا' : 'Commission lessons'}</a>
      </p>
    </div>
  )
}
