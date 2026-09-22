import type { AppLocale } from '@/i18n/routing'

// The disclaimer and the not-advice line are reproduced verbatim from the hard
// rules. They are not paraphrased here and must not be edited for tone or
// length: the wording is the commitment.

const DISCLAIMER = {
  ar: 'شهادة إتمام لدورة تدريبية ذاتية المبادرة. غير تابعة لأي جهة اعتماد وغير معترف بها من أي منها.',
  en: 'Certificate of completion for a self-initiated training course. Not affiliated with, or recognized by, any certification body.',
} as const

const NOT_ADVICE = {
  ar: 'ليست استشارة طبية أو فوترية أو إكلينيكية أو قانونية أو تنظيمية.',
  en: 'Not medical, billing, clinical, legal or regulatory advice.',
} as const

const SYNTHETIC = {
  ar: 'كل الأكواد والجهات الدافعة والمرضى في هذا العرض خيالية ومُعدّة للتدريب.',
  en: 'Every code, payer, clinic and patient in this demo is fictional and authored for training.',
} as const

// Masār is a community partner of Techne Summit 2026. The partnership asks for a
// link back on the partner's site; putting it in the footer rather than in a page
// body means it is present everywhere without interrupting a lesson.
const PARTNER = {
  ar: {
    eyebrow: 'شريك مجتمعي',
    body: 'مسار شريك مجتمعي في قمة تكني 2026، في الإسكندرية والقاهرة.',
    link: 'موقع القمة',
    alt: 'شعار قمة تكني',
  },
  en: {
    eyebrow: 'Community partner',
    body: 'Masār is a community partner of Techne Summit 2026, in Alexandria and Cairo.',
    link: 'Summit website',
    alt: 'Techne Summit logo',
  },
} as const

export function SiteFooter({ locale }: { locale: AppLocale }) {
  const ar = locale === 'ar'
  const l = locale

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="partner-strip">
          {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size
              local mark; next/image would add a runtime for no benefit here. */}
          <img src="/partners/techne-summit.webp" alt={PARTNER[l].alt} width={500} height={140} />
          <div className="partner-copy">
            <span className="eyebrow">{PARTNER[l].eyebrow}</span>
            <p>{PARTNER[l].body}</p>
          </div>
          <a className="partner-link" href="https://technesummit.com" rel="noreferrer">
            {PARTNER[l].link}
          </a>
        </div>
      </div>

      <div className="shell site-footer-grid">
        <div>
          <h2>{ar ? 'مسار' : 'Masār'}</h2>
          <p className="legal">
            {DISCLAIMER[l]} {NOT_ADVICE[l]}
          </p>
          <p className="legal" style={{ marginBlockStart: '0.75rem' }}>
            {SYNTHETIC[l]}
          </p>
        </div>

        <div>
          <h2>{ar ? 'تصفح' : 'Explore'}</h2>
          <ul>
            <li>
              <a href={`/${l}/course`}>{ar ? 'الدورة' : 'The course'}</a>
            </li>
            <li>
              <a href={`/${l}/depth`}>{ar ? 'نموذج العمق' : 'The depth model'}</a>
            </li>
            <li>
              <a href={`/${l}/practice/claim-review`}>{ar ? 'مراجعة مطالبة' : 'Claim review'}</a>
            </li>
            <li>
              <a href={`/${l}/assess/exam`}>{ar ? 'الاختبار' : 'The exam'}</a>
            </li>
          </ul>
        </div>

        <div>
          <h2>{ar ? 'عن المشروع' : 'About'}</h2>
          <ul>
            <li>
              <a href={`/${l}/case-study`}>{ar ? 'دراسة الحالة' : 'Case study'}</a>
            </li>
            <li>
              <a href={`/${l}/how-it-was-built`}>{ar ? 'كيف بُني' : 'How it was built'}</a>
            </li>
            <li>
              <a href={`/${l}/privacy`}>{ar ? 'الخصوصية والبيانات' : 'Privacy and data'}</a>
            </li>
            <li>
              <a href="https://github.com/MostafaFathy1527/masar-platform" rel="noreferrer">
                {ar ? 'المستودع' : 'Repository'}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
