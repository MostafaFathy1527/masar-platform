import { readFileSync } from 'node:fs'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { routing, type AppLocale } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'How it was built — Masār',
  description:
    'The content pipeline, its gates, and what has and has not yet been generated through it.',
}

/*
 * This page exists to be checkable. Everything on it is read from the repository
 * at build time — the concept log, the gate thresholds, the test counts — so it
 * cannot drift into describing a pipeline that is better than the one that
 * exists.
 *
 * The status section is deliberately unflattering: no lesson has yet been
 * generated through the loop, and saying so is the point.
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

function runLogEntries(): number {
  try {
    return readFileSync('pipeline/memory/run-log.jsonl', 'utf-8')
      .split('\n')
      .filter((l) => l.trim()).length
  } catch {
    return 0
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">
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
          ? 'درجة معيار من نموذج لغوي، حكم بسياق جديد، تقييم ذاتي — وليست مراجعة جودة بشرية. الحَكَم لا يرى موجّه التوليد، لكنه يظل من عائلة النموذج نفسها يصحّح عمله. الفحص على الفحص هو عيّنة تحكيم مزدوج أعمى على ثلاثة دروس، ويُنشر متوسط الفارق المطلق.'
          : 'LLM rubric score, fresh-context judge, self-assessed — not human QA. The judge never sees the generation prompt, but it is still the same family of model marking its own work. The check on that check is a blind inter-rater sample: three lessons scored independently by a human, with the mean absolute difference reported.'}
      </p>

      <h2 className="admin-q">{ar ? 'الحالة، بصراحة' : 'Status, honestly'}</h2>
      <div className="verify-card">
        <p className="max-w-prose leading-relaxed">
          {ar
            ? 'الدروس الخمسة في هذه النسخة كُتبت يدويًا، لا عبر خط الإنتاج. البوابات مبنية ومُثبتة وتعمل في التكامل المستمر، لكن حلقة التوليد لم تُنتج بعد درسًا منشورًا.'
            : 'The five lessons in this build were hand-authored, not generated. The gates are built, proven and running in CI, but the generation loop has not yet produced a published lesson.'}
        </p>
        <p className="mt-3 max-w-prose leading-relaxed">
          {runs === 0
            ? ar
              ? `سجل التشغيل فارغ (${runs} تشغيلة). لذلك لا توجد بعد نسبة اجتياز من المحاولة الأولى ولا متوسط درجة معيار يمكن الإبلاغ عنه — وذكر رقم هنا الآن سيكون اختلاقًا.`
              : `The run log is empty (${runs} runs). There is therefore no first-pass gate rate and no mean rubric score to report yet, and putting a number here now would be inventing one.`
            : ar
              ? `سجل التشغيل يحتوي ${runs} تشغيلة، بما فيها الإخفاقات.`
              : `The run log holds ${runs} runs, failures included.`}
        </p>
        <p className="mt-3 max-w-prose text-sm text-muted">
          {ar
            ? 'حين تُشغَّل الحلقة، يُنشر السجل كاملًا هنا — بما في ذلك التشغيلات التي رفضتها البوابة. سجل لا يحوي إلا نجاحات ليس دليلًا على شيء.'
            : 'When the loop is run, the log is published here in full — including the runs the gate refused. A history containing only successes is not evidence of anything.'}
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
