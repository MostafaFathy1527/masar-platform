import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { LessonDoc } from '@/lib/schema/lesson'

/**
 * Pipeline drafts, read from `pipeline/out` so a prospect can open one on the
 * site instead of in a JSON file on GitHub.
 *
 * These are not course content and are never seeded: the contract says the
 * pipeline may not publish, and this reader does not change that. A draft is
 * rendered with the word DRAFT on it, with its STATUS.md beside it saying what
 * was and was not run, and it sits under /samples rather than /lesson so the
 * two are never confused.
 *
 * Read from the files rather than restated anywhere: the list of samples on
 * /commission and /samples is whatever is in the directory, so adding a run
 * adds a page and nothing can describe a sample that does not exist.
 */

export const DRAFT_DIR = 'pipeline/out'

export type DraftSummary = {
  /** Objective code, e.g. SEC-01 — the URL segment. */
  code: string
  dir: string
  slug: string
  titleAr: string
  titleEn: string
  estMinutes: number
  levels: string[]
  bilingual: boolean
  objectives: string[]
  domainAr: string
  domainEn: string
}

/**
 * Objective statements for the drafts. Course objectives live in
 * lib/objectives.ts; these are kept apart because they belong to no course.
 * Each pair was authored, not translated — same rule as the course set.
 */
export const DRAFT_OBJECTIVES: Record<string, { en: string; ar: string; domainEn: string; domainAr: string }> = {
  'SEC-01': {
    en: 'Given an email, identify the signals that distinguish a phishing attempt from a legitimate message, and take the correct action',
    ar: 'يميّز، أمام رسالة بريد، الإشارات التي تفصل محاولة التصيّد عن الرسالة الحقيقية، ويتّخذ الإجراء الصحيح',
    domainEn: 'Security awareness',
    domainAr: 'الأمن المعلوماتي',
  },
  'CS-01': {
    en: 'Given a customer complaint, de-escalate it, establish the facts, and close it with an agreed next step the customer can hold you to',
    ar: 'يهدّئ شكوى عميل، ويثبّت الحقائق، ويغلقها بخطوة تالية متفق عليها يستطيع العميل محاسبته عليها',
    domainEn: 'Customer service',
    domainAr: 'خدمة العملاء',
  },
  'PRV-01': {
    en: 'Given a piece of information encountered at work, decide whether it is personal data, whether it is sensitive, and what handling that requires',
    ar: 'يقرّر، أمام معلومة يصادفها في العمل، هل هي بيانات شخصية، وهل هي حسّاسة، وما الذي يفرضه ذلك على التعامل معها',
    domainEn: 'Privacy and compliance',
    domainAr: 'الامتثال والخصوصية',
  },
}

function latestVersion(dir: string): string | null {
  const versions = readdirSync(`${DRAFT_DIR}/${dir}`).filter((v) => /^v\d+$/.test(v)).sort()
  return versions.length ? versions[versions.length - 1] : null
}

function draftDirs(): string[] {
  if (!existsSync(DRAFT_DIR)) return []
  // Only the runs made outside the demo course: lesson-02 is a regeneration of
  // a course lesson and belongs to /course, not here.
  return readdirSync(DRAFT_DIR)
    .filter((d) => d.startsWith('lesson-') && d !== 'lesson-02')
    .sort()
}

function summarise(dir: string): DraftSummary | null {
  const v = latestVersion(dir)
  if (!v) return null
  const raw = JSON.parse(readFileSync(`${DRAFT_DIR}/${dir}/${v}/lesson.json`, 'utf-8'))
  const code = String(raw.objectives?.[0] ?? '').toUpperCase()
  if (!code) return null
  const o = DRAFT_OBJECTIVES[code]
  // A run lands in pipeline/out the moment it finishes, reviewed or not. Only a
  // draft whose objective statement has been written by hand is listed: that is
  // the step that says a person decided to show it, and without it the page would
  // render knowledge checks whose items were never imported.
  if (!o) return null
  return {
    code,
    dir: `${dir}/${v}`,
    slug: raw.slug,
    titleAr: raw.titleAr,
    titleEn: raw.titleEn,
    estMinutes: raw.estMinutes,
    levels: raw.levels,
    bilingual: raw.bilingual !== false,
    objectives: raw.objectives ?? [],
    domainAr: o?.domainAr ?? '',
    domainEn: o?.domainEn ?? '',
  }
}

export function draftIndex(): DraftSummary[] {
  return draftDirs().map(summarise).filter((d): d is DraftSummary => d !== null)
}

export function draftByCode(code: string) {
  const summary = draftIndex().find((d) => d.code === code.toUpperCase())
  if (!summary) return null
  const raw = JSON.parse(readFileSync(`${DRAFT_DIR}/${summary.dir}/lesson.json`, 'utf-8'))
  const statusPath = `${DRAFT_DIR}/${summary.dir}/STATUS.md`
  const status = existsSync(statusPath) ? readFileSync(statusPath, 'utf-8') : ''
  return { summary, lesson: LessonDoc.parse(raw), status }
}

/**
 * The "Not run" line from a draft's STATUS.md, so the page can say what the
 * file says instead of restating it. Returns null when the file has no such
 * line — which would itself be worth noticing.
 */
export function notRunNote(status: string): string | null {
  const m = status.match(/\*\*Not run: `([^`]+)`\.\*\*\s*([^\n]+(?:\n[^\n#]+)*)/)
  return m ? `${m[1]}: ${m[2].replace(/\s+/g, ' ').trim()}` : null
}

export type JudgeResult = {
  /** Model id as recorded in the verdict's own provenance block. */
  model: string
  mean: number
  scored: number
  passed: boolean
}

export type DraftRubric = {
  judges: JudgeResult[]
  allPassed: boolean
  minMean: number
  maxMean: number
  /** Largest gap between any two judges on any single criterion. */
  maxSpread: number
}

/**
 * The rubric results for a draft, read from the judge verdicts and the gate
 * reports beside it. Pass or fail is taken from the gate's own report
 * (`qa-report.<tag>.md`), not recomputed here, so this file never restates the
 * thresholds that live in `pipeline/qa_gate.py`. Returns null when no judge has
 * scored the draft, and the pages then say so.
 *
 * These pages used to say "not rubric-scored" as a fixed sentence. It was true
 * when written and stopped being true the day three judges scored the drafts:
 * failure entry 13 again, which is why the status is now derived.
 */
export function draftRubric(dir: string): DraftRubric | null {
  const base = `${DRAFT_DIR}/${dir}`
  if (!existsSync(base)) return null
  const tags = readdirSync(base)
    .map((f) => /^verdict\.([a-z0-9.-]+)\.json$/.exec(f)?.[1])
    .filter((t): t is string => Boolean(t))
    .sort()
  const judges: JudgeResult[] = []
  const perCriterion: Record<string, number[]> = {}
  for (const tag of tags) {
    const reportPath = `${base}/qa-report.${tag}.md`
    if (!existsSync(reportPath)) continue
    const verdict = JSON.parse(readFileSync(`${base}/verdict.${tag}.json`, 'utf-8'))
    const scores: Record<string, number> = verdict.scores ?? {}
    const values = Object.values(scores)
    if (!values.length) continue
    const report = readFileSync(reportPath, 'utf-8')
    judges.push({
      model: String(verdict.judge?.model_id ?? tag),
      mean: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
      scored: values.length,
      passed: /\*\*Result: PASS\*\*/.test(report),
    })
    for (const [c, v] of Object.entries(scores)) (perCriterion[c] ??= []).push(v)
  }
  if (!judges.length) return null
  const means = judges.map((j) => j.mean)
  const maxSpread = Math.max(0, ...Object.values(perCriterion).map((v) => Math.max(...v) - Math.min(...v)))
  return {
    judges,
    allPassed: judges.every((j) => j.passed),
    minMean: Math.min(...means),
    maxMean: Math.max(...means),
    maxSpread,
  }
}
