import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { routing, type AppLocale } from '@/i18n/routing'

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
    ? {
        title: 'اطلب دروسًا — مسار',
        description:
          'نحوّل مادة خبرائكم إلى دروس تطبيقية بالعربية والإنجليزية، كل درس يعبر ثلاث بوابات جودة موثّقة قبل التسليم. السعر يُحدَّد لكل مشروع، وأول درس بلا مقابل.',
      }
    : {
        title: 'Commission lessons — Masār',
        description:
          'Your experts’ material turned into practice-first lessons in Arabic and English, each passing three documented quality gates before delivery. Priced per project; the first lesson is free.',
      }
}

/*
 * The one page on this site that sells something. It sells the pipeline, not
 * the platform: nobody needs another LMS, and training teams in the region do
 * need lessons at volume that someone can defend. Everything it promises is
 * something the repository already does, and the three sample drafts it links
 * to were produced by exactly the process it describes — each with its own
 * STATUS.md saying what was and was not run.
 *
 * There is no price table. A fixed per-lesson figure read as expensive to a
 * startup or an Egyptian company and as arbitrary to everyone else, because the
 * real price depends on depth, volume, language pair and timeline. The page
 * names what moves the price and asks for the material instead.
 */

const REPO = 'https://github.com/MostafaFathy1527/masar-platform'
const CONTACT = 'mostafafathy1503@gmail.com'

const SAMPLES = [
  {
    code: 'SEC-01',
    ar: 'كيف تتعرّف على رسالة تصيّد',
    en: 'Recognising a phishing email',
    dirAr: 'الأمن المعلوماتي',
    dirEn: 'Security awareness',
    path: 'pipeline/out/lesson-sec-01/v1',
  },
  {
    code: 'CS-01',
    ar: 'كيف تتعامل مع شكوى عميل',
    en: 'Handling a customer complaint',
    dirAr: 'خدمة العملاء',
    dirEn: 'Customer service',
    path: 'pipeline/out/lesson-cs-01/v1',
  },
  {
    code: 'PRV-01',
    ar: 'ما الذي يُعدّ بيانات شخصية',
    en: 'What counts as personal data',
    dirAr: 'الامتثال والخصوصية',
    dirEn: 'Privacy and compliance',
    path: 'pipeline/out/lesson-prv-01/v1',
  },
] as const

export default async function CommissionPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const ar = (locale as AppLocale) === 'ar'

  const subject = encodeURIComponent(ar ? 'طلب دروس — مسار' : 'Commission lessons - Masar')
  const mailto = `mailto:${CONTACT}?subject=${subject}`

  return (
    <div className="page-shell-narrow">
      <h1 className="page-title">{ar ? 'اطلب دروسًا' : 'Commission lessons'}</h1>
      <p className="mt-3 max-w-prose leading-relaxed text-muted">
        {ar
          ? 'توليد المحتوى التعليمي لم يعد صعبًا. معرفة ما إذا كان الناتج جيدًا لا تزال صعبة. هذه الصفحة تعرض الجزء الثاني: دروس تطبيقية من مادتكم، بالعربية والإنجليزية، لا يُسلَّم منها درس إلا بعد أن يعبر ثلاث بوابات جودة ومراجعة بشرية.'
          : 'Generating learning content is no longer hard. Knowing whether the output is any good still is. This page offers the second part: practice-first lessons from your material, in Arabic and English, none of which is delivered until it has passed three quality gates and a human review.'}
      </p>

      <h2 className="admin-q">{ar ? 'لمن هذا' : 'Who this is for'}</h2>
      <p className="max-w-prose leading-relaxed">
        {ar
          ? 'فرق التدريب وشركات التدريب المؤسسي ومنصات التعليم التي عندها خبراء ومادة خام — عروض تقديمية، أدلة إجراءات، تسجيلات — وتحتاج أن تتحوّل إلى دروس يتدرّب فيها المتعلم على العمل نفسه لا يقرأ عنه، وبحجم لا يستوعبه فريق كتابة يدوي.'
          : 'Training teams, corporate training providers and education platforms that have experts and raw material — slide decks, procedure manuals, recordings — and need it turned into lessons in which the learner practises the work rather than reads about it, at a volume a hand-writing team cannot absorb.'}
      </p>

      <h2 className="admin-q">{ar ? 'كيف يعمل' : 'How it works'}</h2>
      <ol className="max-w-prose list-decimal space-y-3 ps-5 leading-relaxed">
        <li>
          <strong>{ar ? 'مادتكم تصبح ملاحظة مصدر.' : 'Your material becomes a source note.'}</strong>{' '}
          {ar
            ? 'كل درس يُكتب من ملاحظة واحدة يملكها خبيركم. أي جملة ليست في المصدر لا تدخل الدرس؛ تذهب إلى قائمة «يحتاج تحققًا» ليقرّ بها إنسان أو يحذفها.'
            : 'Each lesson is written from one note your expert owns. A sentence that is not in the source does not enter the lesson; it goes to a needs-verification list for a person to confirm or cut.'}
        </li>
        <li>
          <strong>{ar ? 'المسودة تعبر ثلاث بوابات.' : 'The draft passes three gates.'}</strong>{' '}
          {ar
            ? 'البنية (هل الدرس صحيح شكلًا وخالٍ من المحتوى الممنوع)، وترتيب المفاهيم (هل يعيد تعريف شيء دُرِّس من قبل أو يستخدم شيئًا لم يُقدَّم بعد)، وجودة التصميم التعليمي (ثمانية معايير بحدٍّ أدنى لكل معيار). كل بوابة لها اختباراتها السلبية، وكلها في المستودع.'
            : 'Structure (is the lesson well formed and free of forbidden content), concept ordering (does it re-define something already taught or lean on something not yet introduced), and instructional quality (eight criteria with a floor on each). Every gate has its own negative tests, and all of it is in the repository.'}
        </li>
        <li>
          <strong>{ar ? 'إنسان يقرّر النشر.' : 'A person decides to publish.'}</strong>{' '}
          {ar
            ? 'الخط لا ينشر. يسلّم مسودة مع تقرير البوابات، ومراجع بشري — أنا — يقرأها كاملة قبل أن تصلكم.'
            : 'The pipeline does not publish. It delivers a draft with its gate report, and a human reviewer — me — reads it in full before it reaches you.'}
        </li>
        <li>
          <strong>{ar ? 'التسليم على منصتكم.' : 'Delivery to your platform.'}</strong>{' '}
          {ar
            ? 'ملفات JSON منظّمة تُستورد في مسار، أو تُحوَّل إلى أداة التأليف أو نظام إدارة التعلّم عندكم. تصدير SCORM يُتفق عليه في التجربة الأولى.'
            : 'Structured JSON that imports into Masār, or is converted for your authoring tool or LMS. SCORM export is agreed as part of the first pilot.'}
        </li>
      </ol>

      <h2 className="admin-q">{ar ? 'ما الذي تحصل عليه في كل درس' : 'What each lesson contains'}</h2>
      <p className="max-w-prose leading-relaxed">
        {ar
          ? 'هدف تعليمي معلن بصيغة سلوكية، وشرح مُحكم بالعربية والإنجليزية (لا ترجمة آلية لأحدهما)، وبطاقات تعريف للمفاهيم الجديدة فقط، ومثال محلول خطوة بخطوة بالتعليل، وسيناريو قرار بعواقب كل خيار، وفحوص معرفة كل خيار فيها يسمّي سوء الفهم الذي يمثّله. الدرس يُنشر على مستوى «قراءة منظمة» أو «تفاعلي»، ويمكن رفعه لاحقًا إلى «تطبيق عملي» من غير إعادة بناء.'
          : 'A behaviourally stated objective; tight explanation in Arabic and English (neither machine-translated from the other); definition cards for new concepts only; a worked example with the reasoning at each step; a decision scenario with the consequence of each choice; and knowledge checks in which every option names the misconception it represents. A lesson ships at the structured or the interactive depth, and can be raised to applied practice later without a rebuild.'}
      </p>

      <h2 className="admin-q">{ar ? 'ثلاث عينات، في ثلاثة مجالات' : 'Three samples, in three domains'}</h2>
      <p className="max-w-prose leading-relaxed">
        {ar
          ? 'كل عينة مسودة حقيقية من الخط نفسه، خارج مجال الدورة التجريبية، ومعها ملف حالة يقول بالضبط ما شُغِّل عليها وما لم يُشغَّل. اقرأها كما سيقرأها مديرو التدريب عندكم.'
          : 'Each sample is a real draft from the same pipeline, outside the demo course’s domain, with a status file saying exactly what was and was not run on it. Read them the way your training managers would.'}
      </p>
      <div className="block-table-scroll">
        <table className="block-table">
          <tbody>
            <tr>
              <th scope="col">{ar ? 'الدرس' : 'Lesson'}</th>
              <th scope="col">{ar ? 'المجال' : 'Domain'}</th>
              <th scope="col">{ar ? 'افتح' : 'Open'}</th>
            </tr>
            {SAMPLES.map((s) => (
              <tr key={s.code}>
                <th scope="row">
                  <code>{s.code}</code> · {ar ? s.ar : s.en}
                </th>
                <td>{ar ? s.dirAr : s.dirEn}</td>
                <td>
                  <a href={`/${locale}/samples/${s.code}`}>
                    {ar ? 'اقرأ الدرس' : 'Read the lesson'}
                  </a>
                  {' · '}
                  <a href={`${REPO}/blob/main/${s.path}/STATUS.md`} rel="noreferrer">
                    {ar ? 'ملف الحالة' : 'status file'}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 max-w-prose text-sm text-muted">
        {ar
          ? 'العينات مسودّات بالتعريف: لم تُنشر، ولم تُقيَّم بالمعيار، لأن المقيِّم الوحيد المتاح هو من كتبها. في عمل مدفوع، يقيّمها مقيِّم مستقل قبل التسليم، ويُسلَّم التقرير معها.'
          : 'The samples are drafts by definition: not published, and not rubric-scored, because the only available judge is the one who wrote them. In commissioned work an independent judge scores them before delivery, and the report ships with the lesson.'}
      </p>

      <h2 className="admin-q">{ar ? 'كيف يُحدَّد السعر' : 'How the price is set'}</h2>
      <p className="max-w-prose leading-relaxed">
        {ar
          ? 'لا توجد قائمة أسعار ثابتة، لأن ما يناسب شركة ناشئة في مصر لا يناسب جهة تدريب في الخليج، والعكس. السعر يُحدَّد لكل مشروع بحسب أربعة أشياء: عمق الدرس (قراءة منظمة، تفاعلي، أو تطبيق عملي)، وعدد الدروس، واللغات المطلوبة (لغة واحدة أم اثنتان)، والجدول الزمني. تصلك عروض السعر خلال يومي عمل من قراءة مادتكم، ويقلّ سعر الدرس كلما زاد العدد.'
          : 'There is no fixed price list, because what fits a startup in Egypt does not fit a training house in the Gulf, and the reverse. Each project is priced on four things: the depth of the lesson (structured, interactive or applied practice), how many lessons, which languages (one or both), and the timeline. A quote reaches you within two working days of reading your material, and the per-lesson price falls as the count rises.'}
      </p>

      <h2 className="admin-q">{ar ? 'ابدأ' : 'Start'}</h2>
      <p className="max-w-prose leading-relaxed">
        {ar
          ? 'أرسل درسًا واحدًا من مادتكم الحالية — عرضًا تقديميًا أو دليلًا أو تسجيلًا — وسأعيده إليكم مسودة من الخط، مع تقرير البوابات، خلال خمسة أيام عمل، من دون التزام.'
          : 'Send one lesson’s worth of your current material — a deck, a manual, a recording — and I will return it as a pipeline draft with its gate report within five working days, with no commitment.'}
      </p>
      <p className="mt-4">
        <a className="btn-primary" href={mailto}>
          {ar ? 'أرسل مادة درس واحد' : 'Send one lesson’s material'}
        </a>
      </p>
      <p className="mt-3 max-w-prose text-sm text-muted">
        {ar
          ? 'أو اكتب إلى '
          : 'Or write to '}
        <a href={mailto}>{CONTACT}</a>
        {ar ? '. المحتوى الذي ترسله لا يدخل أي نموذج لغوي إلا بموافقتكم المكتوبة على كل مصدر.' : '. Material you send enters no language model without your written consent per source.'}
      </p>
    </div>
  )
}
