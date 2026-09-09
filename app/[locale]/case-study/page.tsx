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
  // The Arabic page had an English title, which is exactly the kind of leak the
  // bilingual rules exist to stop — one layer up from the content.
  return locale === 'ar'
    ? {
        title: 'دراسة حالة — مسار',
        description:
          'كيف صُمّمت وبُنيت منصة تعلّم قائمة على التطبيق في ستة أسابيع: نموذج العمق، والقرارات، وما الذي أخفق.',
      }
    : {
        title: 'Case study — Masār',
        description:
          'How a practice-first learning platform was designed and built in six weeks: the depth model, the decisions, and what failed.',
      }
}

/*
 * Structure follows section 0.4 item 4: a source paragraph shown at all three
 * depths with the decisions annotated, decisions worth defending with what each
 * cost, and what failed — including the project's own claims that turned out to
 * be false.
 *
 * The Arabic version is a summary rather than a full translation, and says so.
 */

function Annotated({
  label,
  children,
  note,
}: {
  label: string
  children: React.ReactNode
  note: string
}) {
  return (
    <div className="cs-depth">
      <h4>{label}</h4>
      <div className="cs-render">{children}</div>
      <p className="cs-note">
        <strong>Decision:</strong> {note}
      </p>
    </div>
  )
}

function English() {
  return (
    <>
      <p className="cs-lead">
        A practice-first learning platform, built in six weeks alongside a job search, to
        answer a question a prospective client actually asked: what would you deliver, and
        how would I know it was any good?
      </p>

      <h2 className="admin-q">The problem</h2>
      <p>
        A course is not a pile of PDFs with a quiz at the end. The failure mode is
        specific: content gets published at whatever depth it happened to be written at,
        assessment is assembled from whatever questions exist, and nobody can say which
        objective any of it serves. It looks like a course and teaches like a document.
      </p>
      <p>
        Three ideas were worth building to answer that. Depth is a property of a lesson
        rather than a separate lesson. Assessment is assembled from a blueprint rather than
        a pile. And the content pipeline that produces the lessons ships in the same
        repository as the platform, with the gates that constrain it.
      </p>

      <h2 className="admin-q">One paragraph, three depths</h2>
      <p>
        This is the whole design argument in one example. The same source material,
        published at three depths, with the decision behind each one.
      </p>

      <div className="cs-source">
        <h4>The source paragraph</h4>
        <p>
          &ldquo;A claim that arrives complete and correct on the first attempt is called a
          clean claim. Claims that are not clean have to be corrected and resubmitted,
          which delays payment. The most common causes are data errors rather than clinical
          ones — a date of birth that does not match the member card, a service date
          outside the coverage period, a missing rendering provider.&rdquo;
        </p>
      </div>

      <Annotated
        label="L1 — Structured publishing"
        note={
          'Split into a definition card and a comparison table rather than left as prose. ' +
          'The definition is the thing a learner will come back for, so it gets a stable ' +
          'place on the page instead of being buried mid-paragraph. Nothing is added that ' +
          'the source did not carry — L1 is a publishing decision, not an authoring one.'
        }
      >
        <p>
          <strong>Clean claim</strong> — a claim that passes the payer&rsquo;s edits on the
          first submission, with no correction and no request for further information.
        </p>
        <p className="cs-small">
          Plus a table contrasting self-pay and insured encounters: who is billed, when
          money arrives, what can go wrong, what document is produced.
        </p>
      </Annotated>

      <Annotated
        label="L2 — Interactive lesson"
        note={
          'The learner is asked to do something with the idea before being told whether ' +
          'they are right. The worked example uses the mismatch from the source paragraph ' +
          'but makes the reasoning visible step by step, because "what to do" without ' +
          '"why" is a solution rather than a worked example. The scenario adds ' +
          'consequences: every option returns its outcome, not just the wrong ones, ' +
          'because the point is that choices have consequences rather than that there is ' +
          'a hidden right answer to guess.'
        }
      >
        <p className="cs-small">
          <strong>Worked example.</strong> A claim reaches the payer for 1,260. The date of
          birth reads 11 March 1988; the member card reads 14 March 1988. Three steps, each
          showing the action and the reason: compare against the source document, classify
          the error, correct before submission rather than after rejection.
        </p>
        <p className="cs-small">
          <strong>Scenario.</strong> The rendering provider is missing and today is the
          deadline. Three options, each with its real consequence — including the one that
          looks efficient and creates a documentation failure.
        </p>
      </Annotated>

      <Annotated
        label="L3 — Applied practice"
        note={
          'The learner produces work that is scored the way a professional would judge it. ' +
          'Six errors are seeded, one per class, and the scoring is published rather than ' +
          'hidden — because a score a learner cannot interrogate teaches nothing. Every ' +
          'miss links back to the exact block that taught it. Without that link this is a ' +
          'quiz with a nicer interface, and the link is the pedagogical argument of the ' +
          'entire project.'
        }
      >
        <p className="cs-small">
          <strong>Claim review.</strong> Nineteen flaggable fields, six seeded errors, an
          evidence panel holding the clinical record and the member card. Scored on F1:
          flagging four fields correctly scores 80% and passes; flagging all nineteen
          scores 48% and fails.
        </p>
      </Annotated>

      <h2 className="admin-q">Decisions I would defend</h2>
      <ol className="cs-decisions">
        <li>
          <strong>Lesson content is validated JSON on one row, not a relational block
          store.</strong>{' '}
          A block table plus an editor over it roughly doubles the build for no visible
          benefit. <em>What it cost:</em> no drag-and-drop authoring UI, so content is
          edited as files by someone comfortable with that.
        </li>
        <li>
          <strong>Select-then-place is the only interaction, not a fallback beside drag and
          drop.</strong>{' '}
          One code path, keyboard-native, and better on a phone — where dragging between
          columns is the worst possible affordance. <em>What it cost:</em> it looks less
          impressive in a screenshot than a drag interaction does.
        </li>
        <li>
          <strong>The seeded errors never reach the browser before submission.</strong>{' '}
          The same rule that strips answer keys from an in-progress attempt. <em>What it
          cost:</em> a round trip on submission, and scoring that cannot be done offline.
        </li>
        <li>
          <strong>Authorization reads the database row, not the session token.</strong>{' '}
          A JWT outlives the account it describes. <em>What it cost:</em> a database query
          on every authorized request, which is the correct price.
        </li>
        <li>
          <strong>The gates were built before the generation.</strong>{' '}
          A generator built first and gated afterwards is gated to whatever it already
          produces. <em>What it cost:</em> the pipeline has gates that provably refuse
          things and has not yet been run end to end — a weaker headline than the reverse
          order would have produced, and an honest one.
        </li>
      </ol>

      <h2 className="admin-q">What failed</h2>
      <p>
        Five failures, and they form a pattern worth naming:{' '}
        <strong>
          the falsifiable claims are the ones that break, and they only break when you try
          to game them.
        </strong>{' '}
        Every one of these passed code review, passed its schema, passed CI, and looked
        right on the screen.
      </p>

      <ol className="cs-failures">
        <li>
          <strong>The scoring formula failed its own published claim.</strong> The case
          study said shotgun-flagging scores worse than reading carefully. Written as a
          test, it did not: flagging all nineteen fields scored 79% and passed, against 77%
          for four careful fields. The formula only supported the claim on a form with more
          than 27 fields. Padding the form would have made the number come out right;
          switching to F1 made the claim true at any size.
        </li>
        <li>
          <strong>The item bank was trivially gameable and nothing flagged it.</strong>{' '}
          Answering the first option every time scored 89% and passed. The bank was
          authored with the correct answer first in eleven of fourteen items. The schema
          validated it, the content gate passed it, every option had proper feedback — and
          a reviewer trying &ldquo;always answer A&rdquo; would have dismantled the entire
          assessment story in five minutes. Options are now shuffled per attempt; the same
          strategy scores 22%, 28%, 11%.
        </li>
        <li>
          <strong>A panel reported itself visible and rendered nothing.</strong> The
          evidence panel — without which two of the six seeded errors are guesswork —
          rendered empty on desktop. CSS cannot reveal the children of a closed{' '}
          <code>&lt;details&gt;</code>. <code>getComputedStyle</code> said{' '}
          <code>display: block</code>; only reading the text found it.
        </li>
        <li>
          <strong>A deleted account&rsquo;s session still worked.</strong> After deleting an
          account, the same cookie returned 200 from the data-export endpoint. A JWT
          outlives the row it describes. The code comment claiming otherwise had been
          written without checking.
        </li>
        <li>
          <strong>A test file reported 16/16 while two tests never ran.</strong> Two cases
          were appended below the entry point, so the decorator registering them executed
          after the process had exited. The suite was green and measuring nothing.
        </li>
      </ol>

      <h2 className="admin-q">Disclosure</h2>
      <div className="verify-card">
        <ul className="privacy-list">
          <li>
            <strong>No practitioner reviewed this content.</strong> It was authored from
            public sources by an instructional designer. All code sets are fictional
            training codes, and a real deployment would use a deploying organisation&rsquo;s
            own payer rules and licensed code sets, reviewed by someone who works in the
            field.
          </li>
          <li>
            <strong>Self-initiated.</strong> No employer&rsquo;s or client&rsquo;s material
            was used, referenced or paraphrased, and no employer is named anywhere in the
            repository, its history, or this page.
          </li>
          <li>
            <strong>No users, no revenue, no outcomes.</strong> Any figure shown in
            analytics comes from real use of this demonstration and is deliberately sparse.
            Item statistics need roughly twenty first attempts per item before they mean
            anything, and this has nowhere near that.
          </li>
          <li>
            <strong>Payments are a mock adapter.</strong> No provider is activated, no money
            moves, and the price never renders without a test-mode banner.
          </li>
          <li>
            <strong>Not a credential.</strong> Certificate of completion for a
            self-initiated training course. Not affiliated with, or recognized by, any
            certification body.
          </li>
          <li>
            <strong>Total infrastructure cost: $0/month.</strong> Free tiers throughout, on
            an already-owned domain.
          </li>
        </ul>
      </div>

      <h2 className="admin-q">Deliberately not built</h2>
      <p>
        A second simulation, module quizzes, a mastery engine, content CRUD editors, an
        instructor role, real payment adapters, SCORM export, and a mobile app. Each was
        scoped out in writing before the build started rather than dropped when time ran
        short, and each is recorded with the reason.
      </p>
    </>
  )
}

function ArabicSummary() {
  return (
    <>
      <p className="cs-lead">
        منصة تعلّم قائمة على التطبيق، بُنيت في ستة أسابيع بالتوازي مع بحث عن عمل، للإجابة عن
        سؤال طرحه عميل محتمل فعلًا: ماذا ستُسلِّم، وكيف أعرف أنه جيد؟
      </p>
      {/* Stated up front: this is a summary, not a translation of the full page. */}
      <p className="admin-caveat">
        هذه خلاصة بالعربية، وليست ترجمة كاملة لدراسة الحالة. النسخة الإنجليزية أطول وتحتوي
        على التفاصيل الكاملة.
      </p>

      <h2 className="admin-q">الفكرة</h2>
      <p>
        ثلاث أفكار كانت تستحق البناء: العمق خاصية للدرس لا درس منفصل، والتقييم يُبنى من مخطط
        لا من كومة أسئلة، وخط إنتاج المحتوى يُنشر في المستودع نفسه مع البوابات التي تقيّده.
      </p>

      <h2 className="admin-q">فقرة واحدة، ثلاثة مستويات</h2>
      <p>
        المستوى الأول ينشر المادة منظّمة: تعريف ثابت وجدول مقارنة، دون إضافة ما لا يحمله
        المصدر. المستوى الثاني يطلب من المتعلّم أن يفعل شيئًا قبل أن يُخبَر بالصواب: مثال
        محلول تظهر فيه أسباب كل خطوة، وسيناريو لكل خيار فيه عاقبة. المستوى الثالث يُنتج عملًا
        يُقيَّم كما يقيّمه محترف: تسعة عشر حقلًا قابلًا للتعليم، وستة أخطاء مزروعة، وكل خطأ فائت
        يعود برابط إلى الكتلة التي شرحته — وهذا الرابط هو الحجة التربوية للمشروع كله.
      </p>

      <h2 className="admin-q">ما الذي أخفق</h2>
      <p>
        خمسة إخفاقات، ونمطها واحد:{' '}
        <strong>الادعاءات القابلة للدحض هي التي تنكسر، ولا تنكسر إلا حين تحاول التحايل عليها.</strong>{' '}
        صيغة التقييم أخفقت في ادعائها المنشور. بنك الأسئلة كان يُهزم بالإجابة الأولى دائمًا
        ويعطي 89٪. ولوحة الأدلة أبلغت أنها ظاهرة وهي فارغة. وجلسة حساب محذوف ظلّت تعمل.
        وملف اختبار أعلن نجاح 16 من 16 بينما لم يُنفَّذ اختباران أصلًا.
      </p>

      <h2 className="admin-q">إفصاح</h2>
      <div className="verify-card">
        <ul className="privacy-list">
          <li>
            لم يراجع هذا المحتوى أي ممارس في المطالبات أو دورة الإيرادات. كُتب من مصادر عامة
            بواسطة مصمّم تعليمي، وكل الرموز خيالية للتدريب.
          </li>
          <li>
            مشروع ذاتي المبادرة: لم تُستخدم أي مادة لجهة عمل أو عميل، ولا يُذكر اسم أي جهة
            عمل في المستودع أو تاريخه أو هذه الصفحة.
          </li>
          <li>لا مستخدمون ولا إيرادات ولا نتائج مُدّعاة. المدفوعات محاكاة فقط.</li>
          <li>
            شهادة إتمام لدورة تدريبية ذاتية المبادرة، غير تابعة لأي جهة اعتماد وغير معترف بها
            من أي منها.
          </li>
          <li>التكلفة التشغيلية: صفر شهريًا.</li>
        </ul>
      </div>
    </>
  )
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as AppLocale

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 cs">
      <h1 className="text-3xl font-bold tracking-tight">
        {l === 'ar' ? 'مسار — دراسة حالة' : 'Masār — case study'}
      </h1>
      {l === 'ar' ? <ArabicSummary /> : <English />}
    </div>
  )
}
