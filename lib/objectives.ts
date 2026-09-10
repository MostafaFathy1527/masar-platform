/**
 * Objective statements, keyed by code.
 *
 * A code on its own — "MI-05" — tells a buyer nothing. The statement is what
 * says whether the course teaches the thing they need.
 *
 * The English statements are the ones written in `BUILD.md` section 5,
 * reproduced verbatim rather than re-worded, so the page and the brief cannot
 * drift apart. The Arabic statements were written by the owner, not translated
 * from the English: an objective is a claim about observable behaviour, and
 * rendering that into Arabic is instructional-design work.
 *
 * TWO AUTHORING DECISIONS, recorded so they are not "corrected" later.
 *
 * 1. `rejection` and `denial` keep their English terms beside the Arabic in
 *    MI-09. They are distinct operational states — one is a submission refused
 *    before adjudication, the other a decision made after it — and Arabic RCM
 *    practice does not reliably separate them. Practitioners say the English
 *    words. Replacing them with a single Arabic term would collapse the
 *    distinction the objective exists to teach.
 *
 * 2. Every statement is a present-tense observable behaviour — يحدّد, يُجري,
 *    يحكم, يرتّب, يختار — and never يفهم. "Understands" cannot be observed and
 *    therefore cannot be assessed; a rubric written against it has nothing to
 *    mark. This is the same rule the English statements follow, and it is why
 *    neither set reads as a translation of the other.
 */

export type Objective = {
  code: string
  en: string
  ar: string
}

export const OBJECTIVES: Record<string, Objective> = {
  'MI-01': {
    code: 'MI-01',
    en: 'Identify the parties in an insurance transaction and the money flow between them',
    ar: 'يحدّد أطراف المعاملة التأمينية ويتتبّع مسار المال بينهم',
  },
  'MI-04': {
    code: 'MI-04',
    en: 'Perform an eligibility check and decide proceed / pre-auth / self-pay',
    ar: 'يُجري فحص الأهلية ويقرّر بين: المتابعة، أو طلب موافقة مسبقة، أو التحويل للدفع الذاتي',
  },
  'MI-05': {
    code: 'MI-05',
    en: 'Sequence the claim lifecycle and name the artefact produced at each stage',
    ar: 'يرتّب مراحل دورة حياة المطالبة ويسمّي المستند الناتج عن كل مرحلة',
  },
  'MI-06': {
    code: 'MI-06',
    en: "Complete a claim's required data elements and identify missing or contradictory fields",
    ar: 'يستكمل عناصر بيانات المطالبة المطلوبة، ويكتشف الحقول الناقصة أو المتعارضة',
  },
  'MI-07': {
    code: 'MI-07',
    en: 'Judge whether documentation supports the services billed',
    ar: 'يحكم على ما إذا كان التوثيق يدعم الخدمات المطالَب بها',
  },
  'MI-09': {
    code: 'MI-09',
    en: 'Distinguish a rejection from a denial and classify a denial by root cause',
    ar: 'يميّز بين الرد الشكلي (rejection) والرفض بعد المراجعة (denial)، ويصنّف الرفض حسب سببه الجذري',
  },
  'MI-10': {
    code: 'MI-10',
    en: 'Choose the correct corrective action for a denial',
    ar: 'يختار الإجراء التصحيحي الصحيح لكل حالة رفض',
  },
  // MI-13 was added in Week 5 and had no behavioural statement in either
  // language — only a topic, "fraud, waste and abuse", which names a subject
  // rather than something a learner can be observed doing. It now states the
  // behaviour in both, and BUILD.md section 5 carries the same English.
  'MI-13': {
    code: 'MI-13',
    en: 'Recognise indicators of fraud, waste and abuse in claims and documentation, and state the record-based response',
    ar: 'يتعرّف على مؤشّرات الاحتيال والهدر وسوء الاستخدام في المطالبات والتوثيق، ويحدّد الاستجابة المستنِدة إلى السجل',
  },
}

export function objectiveFor(code: string): Objective {
  return OBJECTIVES[code] ?? { code, en: '', ar: '' }
}
