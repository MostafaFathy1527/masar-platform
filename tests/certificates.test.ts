import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  CERTIFICATE_DISCLAIMER,
  CERTIFICATE_DISCLAIMER_AR,
  certificateEligibility,
  certificatePayloadHash,
  certificateSerial,
} from '@/lib/certificates'

const base = {
  examScorePct: 80,
  examPassPct: 70,
  simulationPassed: true,
  isDemo: false,
}

describe('eligibility', () => {
  it('is earned when every gate is met', () => {
    const e = certificateEligibility(base)
    expect(e.earned).toBe(true)
    expect(e.eligible).toBe(true)
    expect(e.viaDemoShortcut).toBe(false)
  })

  it('is refused when the exam is below the pass mark', () => {
    const e = certificateEligibility({ ...base, examScorePct: 69 })
    expect(e.earned).toBe(false)
    expect(e.eligible).toBe(false)
    expect(e.gates.find((g) => g.id === 'exam')?.met).toBe(false)
  })

  it('is refused when the exam was never attempted', () => {
    expect(certificateEligibility({ ...base, examScorePct: null }).earned).toBe(false)
  })

  it('is refused when the practice has not been passed', () => {
    const e = certificateEligibility({ ...base, simulationPassed: false })
    expect(e.earned).toBe(false)
    expect(e.gates.find((g) => g.id === 'simulation')?.met).toBe(false)
  })

  // The shortcut must be visible, never silent: a certificate a guest did not
  // earn has to be distinguishable from one a learner did.
  it('lets a guest through, but flags it as the demo shortcut', () => {
    const e = certificateEligibility({ ...base, examScorePct: 0, simulationPassed: false, isDemo: true })
    expect(e.eligible).toBe(true)
    expect(e.earned).toBe(false)
    expect(e.viaDemoShortcut).toBe(true)
  })

  it('does not flag the shortcut when a guest genuinely earned it', () => {
    const e = certificateEligibility({ ...base, isDemo: true })
    expect(e.earned).toBe(true)
    expect(e.viaDemoShortcut).toBe(false)
  })

  it('states every gate in both languages, met or not', () => {
    for (const g of certificateEligibility({ ...base, examScorePct: null }).gates) {
      expect(g.labelAr.length).toBeGreaterThan(5)
      expect(g.labelEn.length).toBeGreaterThan(5)
    }
  })
})

describe('serials and hashing', () => {
  it('formats a serial', () => {
    expect(certificateSerial(2026, 1)).toBe('MF-RCM-2026-0001')
    expect(certificateSerial(2026, 4213)).toBe('MF-RCM-2026-4213')
  })

  const payload = {
    serial: 'MF-RCM-2026-0001',
    holderName: 'A Learner',
    courseSlug: 'rcm-foundations',
    issuedAtIso: '2026-09-09T10:00:00.000Z',
    finalScorePct: 80,
  }

  it('is deterministic', () => {
    expect(certificatePayloadHash(payload)).toBe(certificatePayloadHash(payload))
  })

  it('changes when any identifying field changes', () => {
    const h = certificatePayloadHash(payload)
    expect(certificatePayloadHash({ ...payload, holderName: 'Someone Else' })).not.toBe(h)
    expect(certificatePayloadHash({ ...payload, finalScorePct: 95 })).not.toBe(h)
    expect(certificatePayloadHash({ ...payload, serial: 'MF-RCM-2026-0002' })).not.toBe(h)
  })
})

// A hard rule (docs/CONVENTIONS.md). This wording is fixed; paraphrasing it is the failure
// mode, and it is easy to do accidentally while editing copy.
describe('honesty constraints', () => {
  it('uses the required disclaimer wording verbatim', () => {
    expect(CERTIFICATE_DISCLAIMER).toBe(
      'Certificate of completion for a self-initiated training course. ' +
        'Not affiliated with, or recognized by, any certification body.',
    )
    expect(CERTIFICATE_DISCLAIMER_AR).toContain('ذاتية المبادرة')
    expect(CERTIFICATE_DISCLAIMER_AR).toContain('غير معترف بها')
  })

  it('names no real credential anywhere in the certificate or verify surfaces', () => {
    const NAMED_CREDENTIALS = [
      /\bCPC\b/, /\bCPB\b/, /\bCCS\b/, /\bCPMA\b/, /\bAAPC\b/, /\bAHIMA\b/,
      /\bHFMA\b/, /\bcertified\s+professional\b/i, /\baccredited\b/i,
      /\bcertification\s+prep/i,
    ]
    const surfaces = [
      'lib/certificates.ts',
      'app/[locale]/verify/[serial]/page.tsx',
      'app/[locale]/certificate/page.tsx',
    ]
    for (const file of surfaces) {
      let text = ''
      try {
        text = readFileSync(file, 'utf-8')
      } catch {
        continue // surface not built yet
      }
      for (const pattern of NAMED_CREDENTIALS) {
        expect(text, `${file} matched ${pattern}`).not.toMatch(pattern)
      }
    }
  })
})
