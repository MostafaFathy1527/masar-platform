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

export function SiteFooter({ locale }: { locale: AppLocale }) {
  const ar = locale === 'ar'
  const l = locale

  return (
    <footer className="site-footer">
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
