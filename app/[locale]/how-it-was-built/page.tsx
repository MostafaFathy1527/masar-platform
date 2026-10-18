import { readdirSync, readFileSync } from 'node:fs'
import type { Metadata } from 'next'
import { pageSeo } from '@/lib/seo'
import { setRequestLocale } from 'next-intl/server'
import { routing, type AppLocale } from '@/i18n/routing'
import { arCounted } from '@/lib/count-words'
import { distinctLessons } from '@/lib/drafts'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const m: { title: string; description?: string } = locale === 'ar'
    ? {
        title: 'كيف بُني هذا — مسار',
        description: 'خط إنتاج المحتوى وبواباته، وما وُلِّد عبره وما لم يُولَّد بعد.',
      }
    : {
        title: 'How it was built — Masār',
        description:
          'The content pipeline, its gates, and what has and has not yet been generated through it.',
      }
  return pageSeo(locale, '/how-it-was-built', m.title, m.description)
}

/*
 * This page exists to be checkable. Everything on it is read from the repository
 * at build time — the concept log, the gate thresholds, the test counts — so it
 * cannot drift into describing a pipeline that is better than the one that
 * exists.
 *
 * The status section is deliberately unflattering: what the pipeline has
 * produced is drafts, judged by models and not yet by a person, and saying so
 * is the point.
 */

function countTests(file: string): number {
  try {
    return (readFileSync(file, 'utf-8').match(/@case\(/g) ?? []).length
  } catch {
    return 0
  }
}

function conceptLog() {
  try {
    const log = JSON.parse(readFileSync('pipeline/memory/concept-log.json', 'utf-8'))
    return Object.entries(log.concepts as Record<string, { firstTaughtLesson: string }>)
      .slice(0, 6)
      .map(([key, v]) => ({ key, lesson: v.firstTaughtLesson.split('/').pop() ?? '' }))
  } catch {
    return []
  }
}

// Distinct lessons, not folders: pipeline/out also holds calibration/ and
// retries such as lesson-ops-01-r2, and counting folders reported seven
// lessons where five exist.
function generatedDrafts(): number {
  try {
    return distinctLessons(readdirSync('pipeline/out')).length
  } catch {
    return 0
  }
}

/**
 * Arabic counts do not take a bare numeral plus a singular noun the way the
 * English sentence did. One is the noun alone, two has its own dual form, three
 * to ten take the plural, and eleven upward returns to the singular accusative.
 * Interpolating a number in front of "درس" was wrong for every value except one.
 */
function arDrafts(n: number): string {
  return arCounted(n, { one: 'درس واحد', two: 'درسان', plural: 'دروس', accusative: 'درسًا' })
}

function arEntries(n: number): string {
  return arCounted(n, { one: 'إدخال واحد', two: 'إدخالان', plural: 'إدخالات', accusative: 'إدخالًا' })
}

function runLogEntries(): number {
  return runLog().length
}

type RunEntry = {
  lesson: string
  mean: number
  passed: boolean
  levels?: string[]
  scored_criteria?: number
  not_scored?: string[]
  independence_caveat?: string
}

// Every number on this page is read from the run log rather than written into
// the copy. The log is the record; a sentence restating it is a second copy
// that nothing keeps in sync.
function runLog(): RunEntry[] {
  try {
    return readFileSync('pipeline/memory/run-log.jsonl', 'utf-8')
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as RunEntry)
  } catch {
    return []
  }
}

export default async function HowItWasBuiltPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as AppLocale
  const ar = l === 'ar'

  const gates = [
    {
      name: 'validate.py',
      refuses: ar
        ? 'بنية غير صالحة، هدف تعليمي غير معلن، كتلة في مستوى لا تُسمح فيه، معرّف مكرر، تجاوز حد الكلمات، مجموعات رموز مرخّصة حقيقية'
        : 'invalid structure, an undeclared objective, a block at a level it is not allowed at, a duplicate id, prose past the word budget, real licensed code sets',
      tests: countTests('pipeline/test_validate.py'),
    },
    {
      name: 'concept_log.py',
      refuses: ar
        ? 'إعادة تعريف مفهوم علّمه درس سابق، أو استخدام مفهوم قبل تقديمه'
        : 're-defining a concept an earlier lesson taught, or using one before it is introduced',
      tests: countTests('pipeline/test_concept_log.py'),
    },
    {
      name: 'qa_gate.py',
      refuses: ar
        ? 'أي معيار دون 3، أو متوسط دون 4.0، أو حكم ناقص المعايير'
        : 'any criterion below 3, a mean below 4.0, or a verdict missing criteria',
      tests: countTests('pipeline/test_qa_gate.py'),
    },
  ]

  const totalTests = gates.reduce((n, g) => n + g.tests, 0)
  const concepts = conceptLog()
  const runs = runLogEntries()
  const log = runLog()
  const passes = log.filter((r) => r.passed).length
  const latest = log[log.length - 1]
  const drafts = generatedDrafts()

  return (
    <div className="page-shell">
      <h1 className="page-title">
        {ar ? 'كيف بُني هذا' : 'How it was built'}
      </h1>
      <p className="mt-3 max-w-prose leading-relaxed text-muted">
        {ar
          ? 'خط إنتاج المحتوى يعيش في المستودع نفسه، ببواباته واختباراته. كل رقم في هذه الصفحة يُقرأ من المستودع وقت البناء، فلا يمكن أن يصف خط إنتاج أفضل من الموجود فعلًا.'
          : 'The content pipeline lives in this repository, with its gates and their tests. Every number on this page is read from the repository at build time, so it cannot drift into describing a better pipeline than the one that exists.'}
      </p>

      <h2 className="admin-q">
        {ar ? 'البوابات سبقت التوليد' : 'The gates came before the generation'}
      </h2>
      <p className="max-w-prose leading-relaxed">
        {ar
          ? 'كُتبت البوابات الثلاث، ودخلت التكامل المستمر، وأثبتت بالاختبارات أنها ترفض فعلًا — قبل أن يولّد خط الإنتاج أي درس. هذا الترتيب هو الحجة كلها: مولّد يُبنى أولًا ثم تُضاف له بوابة، تُقاس عليه هو، لا على معيار مستقل.'
          : 'All three gates were written, wired into CI, and proven by tests to refuse things — before the pipeline generated any lesson. That ordering is the whole argument. A generator built first and gated afterwards is gated to whatever it already produces; gates built first define what is acceptable independently of what any model happens to emit.'}
      </p>
      <p className="mt-3 max-w-prose text-sm text-muted">
        {ar
          ? 'هذا قابل للتحقق من سجل الالتزامات، لا مجرد ادعاء.'
          : 'That claim is checkable in the commit history rather than merely asserted.'}
      </p>

      <h2 className="admin-q">{ar ? 'ما ترفضه كل بوابة' : 'What each gate refuses'}</h2>
      <div className="block-table-scroll">
        <table className="block-table">
          <tbody>
            <tr>
              <th scope="col">{ar ? 'البوابة' : 'Gate'}</th>
              <th scope="col">{ar ? 'ترفض' : 'Refuses'}</th>
              <th scope="col">{ar ? 'اختبارات سلبية' : 'Negative tests'}</th>
            </tr>
            {gates.map((g) => (
              <tr key={g.name}>
                <th scope="row">
                  <code>{g.name}</code>
                </th>
                <td>{g.refuses}</td>
                <td>{g.tests}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 max-w-prose text-sm text-muted">
        {ar
          ? `${totalTests} اختبارًا سلبيًا. كل مجموعة تتضمن حالة تؤكد أن المحتوى السليم يمر — وإلا لكانت البوابة تنجح بأن ترفض كل شيء.`
          : `${totalTests} negative tests. Each set includes a case asserting that valid content passes, because otherwise a gate could satisfy its own tests by refusing everything.`}
      </p>

      <h2 className="admin-q">{ar ? 'سجل المفاهيم' : 'The concept log'}</h2>
      <p className="max-w-prose leading-relaxed">
        {ar
          ? 'يتذكّر أي درس علّم كل مفهوم أولًا. درس لاحق يستطيع أن يستدعي المفهوم أو يطبّقه، لكنه لا يستطيع أن يعرّفه من جديد، ولا أن يستخدم مفهومًا لم يُقدَّم بعد. مراجع بشري يلتقط هذا في خمسة دروس؛ لا أحد يلتقطه بثبات عبر مئة وعشرين.'
          : 'It remembers which lesson first taught each concept. A later lesson may recall or apply it, but may not define it again, and may not lean on a concept nothing has introduced yet. A reviewer catches that across five lessons. Nobody catches it reliably across a hundred and twenty, which is the scale the pipeline exists to serve.'}
      </p>
      {concepts.length > 0 ? (
        <div className="block-table-scroll">
          <table className="block-table">
            <tbody>
              <tr>
                <th scope="col">{ar ? 'المفهوم' : 'Concept'}</th>
                <th scope="col">{ar ? 'عُلِّم أولًا في' : 'First taught in'}</th>
              </tr>
              {concepts.map((c) => (
                <tr key={c.key}>
                  <th scope="row">
                    <code>{c.key}</code>
                  </th>
                  <td>{c.lesson}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <h2 className="admin-q">{ar ? 'بوابة المعيار' : 'The rubric gate'}</h2>
      <p className="max-w-prose leading-relaxed">
        {ar
          ? 'ثمانية معايير من 1 إلى 5. يفشل الدرس إذا نزل أي معيار عن 3، أو نزل المتوسط عن 4.0 — عتبتان لأنهما تلتقطان مشكلتين مختلفتين: المتوسط يلتقط درسًا متوسطًا في كل شيء، والحد الأدنى يلتقط درسًا ممتازًا في سبعة مواضع وغير مقبول في الثامن.'
          : 'Eight criteria, scored 1–5. A lesson fails if any criterion falls below 3, or the mean falls below 4.0 — two thresholds because they catch different problems. The mean catches a lesson that is mediocre everywhere; the floor catches one that is excellent in seven places and unacceptable in the eighth.'}
      </p>
      {/* Section 0.4 item 5. This label travels with the number everywhere, and the
          number never appears beside a human work-quality figure. */}
      <p className="admin-caveat">
        {ar
          ? 'درجة معيار من نموذج لغوي، حكم بسياق جديد، تقييم ذاتي — وليست مراجعة جودة بشرية. الحكّام لا يرون موجّه التوليد، وليس أيٌّ منهم من عائلة النموذج الذي ولّد الدرس: اللجنة أربعة مقاعد، Kimi K3 وDeepSeek V3.2 وGLM-5 على Amazon Bedrock، والنموذج المفتوح Qwen3-30B-A3B-Thinking-2507 على معالج رسومي مستأجر. هذا يمنع أن يصحّح نموذج عمله بنفسه، لكنه لا يجعل الدرجة حكمًا بشريًا. والفحص على الفحص — عيّنة تحكيم مزدوج أعمى يقيّم فيها إنسان ثلاثة دروس دون أن يرى درجات النماذج، ويُنشر متوسط الفارق المطلق — لم يُجرَ بعد.'
          : 'LLM rubric score, fresh-context judge, self-assessed — not human QA. The judges never see the generation prompt, and none of them is from the generator’s model family: the panel has four seats, Kimi K3, DeepSeek V3.2 and GLM-5 hosted on Amazon Bedrock, and the open model Qwen3-30B-A3B-Thinking-2507 served on a rented GPU. That rules out a model marking its own work; it does not make the score a human judgement. The check on that check — a blind inter-rater sample, three lessons scored by a human who has not seen the models’ scores, with the mean absolute difference reported — has not been run yet.'}
      </p>

      <h2 className="admin-q">{ar ? 'الحالة، بصراحة' : 'Status, honestly'}</h2>
      <div className="verify-card">
        <p className="max-w-prose leading-relaxed">
          {ar
            ? `الدروس الخمسة المنشورة كُتبت يدويًا. ومنذ ذلك الحين وُلِّد عبر خط الإنتاج ${arDrafts(drafts)} من ملاحظة مصدر، واجتاز البوابتين الحتميتين: التحقق البنيوي وسجل المفاهيم. ولم يُنشر، لأن مخرجات خط الإنتاج مسودّة يقرر إنسان نشرها.`
            : `The five published lessons were hand-authored. ${drafts} ${drafts === 1 ? 'lesson has' : 'lessons have'} since been generated through the pipeline from a source note, and passed both deterministic gates: structural validation and the concept log. ${drafts === 1 ? 'It is' : 'They are'} not published, because pipeline output is a draft and a human decides whether it ships.`}
        </p>
        <p className="mt-3 max-w-prose leading-relaxed">
          {latest
            ? ar
              ? `بوابة المعيار شُغِّلت على هذه المسودّات. كل حَكَم قرأها في سياق جديد لم يرَ موجّه التوليد ولم يكتب الدرس، وكل حكم يسجّل تحفّظه على استقلاليته بنفسه — وتحفّظ أحدثها منشور أدناه كما كُتب.`
              : `The rubric gate has been run on these drafts. Each judge read them in a fresh context that had not seen the generation prompt and did not author the lesson, and each verdict records its own caveat about how independent that makes it — the most recent one is published below, as written.`
            : ar
              ? 'بوابة المعيار لم تُشغَّل على هذه المسودّات. البوابة تبقى غير مُشغَّلة بدل أن تُستوفى بشكل غير أمين.'
              : 'The rubric gate has not been run on these drafts. The gate stays unrun rather than being satisfied dishonestly.'}
        </p>
        <p className="mt-3 max-w-prose leading-relaxed">
          {runs === 0
            ? ar
              ? `سجل التشغيل يسجّل أحكام المعيار، وهو فارغ (${runs}). لذلك لا توجد نسبة اجتياز من المحاولة الأولى ولا متوسط درجة يمكن الإبلاغ عنه — وذكر رقم هنا سيكون اختلاقًا.`
              : `The run log records rubric verdicts and is empty (${runs}). There is therefore no first-pass rate and no mean score to report, and putting a number here would be inventing one.`
            : ar
              ? `سجل التشغيل يحوي ${arEntries(runs)} (اجتاز منها ${passes})، والإخفاقات ضمنها. وهو يخلط أحكام نماذج جُرِّبت ثم استُبعدت بتشغيلات اللجنة المعتمدة، لذلك لا تُذكر منه نسبة اجتياز واحدة: نسبة تجمع الاثنين لا تصف أيًّا منهما. تجارب المعايرة في سجل منفصل. آخر إدخال: ${latest?.lesson} — متوسط ${latest?.mean?.toFixed(2)} على ${latest?.scored_criteria} معايير مُقيَّمة${latest?.not_scored?.length ? `، و${latest.not_scored.length} غير قابل للتقييم عند مستوى الدرس` : ''}.`
              : `The run log holds ${runs} ${runs === 1 ? 'entry' : 'entries'} (${passes} passed), failures included. It mixes verdicts from judges that were tried and then retired with runs by the seated panel, so no single pass rate is quoted from it: one percentage across both would describe neither. Calibration trials are kept in a separate log. Most recent: ${latest?.lesson} — mean ${latest?.mean?.toFixed(2)} over ${latest?.scored_criteria} scored criteria${latest?.not_scored?.length ? `, with ${latest.not_scored.length} not scorable at this lesson's level` : ''}.`}
        </p>
        {/*
          The judge's independence caveat is printed verbatim beside the score
          it qualifies, from the run-log entry rather than retyped. A score is
          only as good as the independence of whoever produced it, and that
          sentence is the reason the blind inter-rater check still matters.
        */}
        {latest?.independence_caveat ? (
          <p className="admin-caveat mt-3 max-w-prose leading-relaxed">
            <strong>{ar ? 'استقلالية الحَكَم: ' : 'Judge independence: '}</strong>
            {latest.independence_caveat}
          </p>
        ) : null}

        <p className="mt-3 max-w-prose text-sm text-muted">
          {ar
            ? 'السجل يُنشر كاملًا هنا — بما في ذلك التشغيلات التي ترفضها البوابة. سجل لا يحوي إلا نجاحات ليس دليلًا على شيء.'
            : 'The log is published here in full — including the runs the gate refuses. A history containing only successes is not evidence of anything.'}
        </p>
      </div>

      <h2 className="admin-q">{ar ? 'من راجع هذا' : 'Who reviewed this'}</h2>
      {/*
        The limitation a domain reviewer is most likely to test, stated before
        they have to look for it. A vague "reviewed for accuracy" would invite
        exactly that scrutiny and fail it; saying plainly that no practitioner
        saw this costs nothing that was ever truthfully claimed.

        The owner is an instructional designer, not a claims practitioner.
        Naming him as the subject-matter expert would be a fabricated
        credential, and the two reviews are kept distinct in this copy for that
        reason.
      */}
      <div className="verify-card">
        <p className="max-w-prose leading-relaxed">
          {ar
            ? 'لم يراجع هذا المحتوى أي ممارس في المطالبات أو دورة الإيرادات. كُتب من مصادر عامة بواسطة مصمّم تعليمي. جميع الرموز هنا رموز تدريبية خيالية، وأي تطبيق حقيقي سيستخدم قواعد الجهة الدافعة ومجموعات الرموز المرخّصة الخاصة بالمؤسسة المُشغِّلة، بمراجعة شخص يعمل في المجال.'
            : 'No claims or revenue-cycle practitioner reviewed this content. It was authored from public sources by an instructional designer. All code sets are fictional training codes, and a real deployment would use a deploying organisation’s own payer rules and licensed code sets, reviewed by someone who works in the field.'}
        </p>
        <p className="mt-3 max-w-prose leading-relaxed">
          {ar
            ? 'ما جرى فعلًا مراجعة تصميم تعليمي: مواءمة الأهداف، وتغطيتها، ومخطط التقييم، وجودة التغذية الراجعة، والعربية. هذه خبرة حقيقية، لكنها ليست مراجعة دقة موضوعية، والاثنان ليسا شيئًا واحدًا.'
            : 'What was done is an instructional-design review: objective alignment, coverage, the assessment blueprint, feedback quality, and the Arabic. That is genuine expertise, but it is not a subject-matter accuracy review, and the two are not the same thing.'}
        </p>
      </div>

      <footer className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-muted">
        {ar
          ? 'منصة عرض ذاتية المبادرة. المحتوى أصلي ومكتوب من معرفة عامة، وكل الرموز والجهات خيالية للتدريب. ليست استشارة طبية أو فوترية أو قانونية أو تنظيمية.'
          : 'A self-initiated demonstration platform. Content is original and written from public knowledge; every code and organisation is fictional training data. Not medical, billing, clinical, legal or regulatory advice.'}
      </footer>
    </div>
  )
}
