import { createHash } from 'node:crypto'

/**
 * Certificate eligibility, serials and hashing.
 *
 * One pure function decides eligibility and both the UI and the issue endpoint
 * call it, so a certificate can never be issued on a rule the page did not
 * show — or withheld on a rule it did.
 *
 * The wording below is fixed and must not be paraphrased. This is a
 * self-initiated training course; it is not a credential, and nothing in the
 * product may name or imply a real certification.
 */
export const CERTIFICATE_DISCLAIMER =
  'Certificate of completion for a self-initiated training course. ' +
  'Not affiliated with, or recognized by, any certification body.'

export const CERTIFICATE_DISCLAIMER_AR =
  'شهادة إتمام لدورة تدريبية ذاتية المبادرة. ' +
  'غير تابعة لأي جهة اعتماد وغير معترف بها من أي منها.'

export interface EligibilityInput {
  /** Best exam score so far, 0..100, or null if never attempted. */
  examScorePct: number | null
  examPassPct: number
  /** Whether the L3 simulation has been passed. */
  simulationPassed: boolean
  /** Guest accounts bypass the gates behind a visible badge, so a visitor with
   *  three minutes can still see a certificate issue and verify. */
  isDemo: boolean
}

export interface Gate {
  id: string
  labelAr: string
  labelEn: string
  met: boolean
}

export interface Eligibility {
  gates: Gate[]
  /** True when every gate is met. */
  earned: boolean
  /** True when access is granted by the demo shortcut rather than by the
   *  gates. Always surfaced in the UI and stamped on the record. */
  viaDemoShortcut: boolean
  eligible: boolean
}

/**
 * v1.0 gates. The mastery engine, module quizzes and the mock/final split are
 * out of scope, so eligibility rests on the two things a learner actually does:
 * pass the exam, and complete the applied practice.
 */
export function certificateEligibility(input: EligibilityInput): Eligibility {
  const gates: Gate[] = [
    {
      id: 'exam',
      labelAr: `اجتياز الاختبار بنسبة ${input.examPassPct}٪ أو أعلى`,
      labelEn: `Pass the exam at ${input.examPassPct}% or above`,
      met: input.examScorePct !== null && input.examScorePct >= input.examPassPct,
    },
    {
      id: 'simulation',
      labelAr: 'اجتياز تدريب مراجعة المطالبة',
      labelEn: 'Pass the claim-review practice',
      met: input.simulationPassed,
    },
  ]

  const earned = gates.every((g) => g.met)
  const viaDemoShortcut = !earned && input.isDemo

  return { gates, earned, viaDemoShortcut, eligible: earned || viaDemoShortcut }
}

/** `MF-RCM-2026-0001`. Sequence is per year, allocated by the issuer. */
export function certificateSerial(year: number, sequence: number): string {
  return `MF-RCM-${year}-${String(sequence).padStart(4, '0')}`
}

export interface HashPayload {
  serial: string
  holderName: string
  courseSlug: string
  issuedAtIso: string
  finalScorePct: number
}

/**
 * Deterministic hash over the identifying fields, so a printed copy can be
 * checked against the record. The verify URL is the source of truth; the hash
 * only detects a doctored printout, it does not replace verification.
 */
export function certificatePayloadHash(p: HashPayload): string {
  const canonical = [
    p.serial,
    p.holderName,
    p.courseSlug,
    p.issuedAtIso,
    String(p.finalScorePct),
  ].join('|')
  return createHash('sha256').update(canonical, 'utf8').digest('hex')
}
