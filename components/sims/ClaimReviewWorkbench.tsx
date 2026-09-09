'use client'

import { useState } from 'react'
import type { AppLocale } from '@/i18n/routing'
import { pick } from '@/lib/content-locale'

type Field = { key: string; labelAr: string; labelEn: string; value: string }
type Line = {
  key: string
  code: string
  descAr: string
  descEn: string
  units: number
  charge: number
}
type Dataset = {
  claim: { fields: Field[]; lines: Line[]; total: number }
  note: { mdAr: string; mdEn: string }
  card: Record<string, string>
}

type Outcome = {
  id: string
  fieldKey: string
  class: string
  found: boolean
  whyAr: string
  whyEn: string
  teachesBlockId: string
}
type Result = {
  hits: number
  misses: number
  falsePositives: number
  flagsMade: number
  totalErrors: number
  precision: number
  recall: number
  scorePct: number
  passed: boolean
  passPct: number
  outcomes: Outcome[]
  falsePositiveKeys: string[]
}

const COPY = {
  ar: {
    instruction:
      'راجع المطالبة وعلّم كل حقل ترى أنه سيمنع سدادها. الدقة تُحتسب: تعليم كل شيء يخفض نتيجتك.',
    flag: 'علّم',
    unflag: 'أزل التعليم',
    flagged: 'مُعلَّم',
    evidence: 'الأدلة: السجل وبطاقة العضو',
    note: 'السجل',
    card: 'بطاقة العضو',
    lines: 'سطور المطالبة',
    total: 'الإجمالي المعلن',
    submit: 'أرسل المراجعة',
    submitting: 'جارٍ التقييم…',
    flaggedCount: (n: number) => `${n} حقل مُعلَّم`,
    result: 'النتيجة',
    pass: 'ناجح',
    fail: 'غير ناجح',
    found: 'وجدته',
    missed: 'فاتك',
    falsePositive: 'علّمت حقولًا سليمة',
    teaches: 'راجع الكتلة التي شرحت هذا',
    formula: 'الصيغة: F1 = 2 × الدقة × الاسترجاع ÷ (الدقة + الاسترجاع). النجاح عند 70٪.',
    precision: 'الدقة',
    recall: 'الاسترجاع',
    retry: 'حاول مرة أخرى',
    cardLabels: {
      memberNameOnCard: 'الاسم على البطاقة',
      memberDobOnCard: 'تاريخ الميلاد على البطاقة',
      policyEffective: 'سريان الوثيقة من',
      policyNumberOnCard: 'رقم الوثيقة على البطاقة',
      payerOnCard: 'الطرف الدافع على البطاقة',
    } as Record<string, string>,
  },
  en: {
    instruction:
      'Review the claim and flag every field you think would stop it being paid. Precision counts: flagging everything lowers your score.',
    flag: 'Flag',
    unflag: 'Remove flag',
    flagged: 'Flagged',
    evidence: 'Evidence: the record and the member card',
    note: 'Clinical record',
    card: 'Member card',
    lines: 'Claim lines',
    total: 'Stated total',
    submit: 'Submit review',
    submitting: 'Scoring…',
    flaggedCount: (n: number) => `${n} field${n === 1 ? '' : 's'} flagged`,
    result: 'Result',
    pass: 'Pass',
    fail: 'Not yet',
    found: 'You found this',
    missed: 'You missed this',
    falsePositive: 'You flagged fields that were correct',
    teaches: 'Revisit the block that taught this',
    formula: 'Formula: F1 = 2 × precision × recall ÷ (precision + recall). Pass at 70%.',
    precision: 'Precision',
    recall: 'Recall',
    retry: 'Try again',
    cardLabels: {
      memberNameOnCard: 'Name on card',
      memberDobOnCard: 'Date of birth on card',
      policyEffective: 'Policy effective from',
      policyNumberOnCard: 'Policy number on card',
      payerOnCard: 'Payer on card',
    } as Record<string, string>,
  },
} as const

export function ClaimReviewWorkbench({
  slug,
  dataset,
  locale,
  lessonHref,
}: {
  slug: string
  dataset: Dataset
  locale: AppLocale
  lessonHref: string
}) {
  const t = COPY[locale] ?? COPY.ar
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)

  const toggle = (key: string) => {
    if (result) return
    const next = new Set(flagged)
    next.has(key) ? next.delete(key) : next.add(key)
    setFlagged(next)
  }

  async function submit() {
    setBusy(true)
    try {
      const res = await fetch('/api/sim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, flagged: [...flagged] }),
      })
      setResult(await res.json())
    } finally {
      setBusy(false)
    }
  }

  const outcomeFor = (key: string) => result?.outcomes.find((o) => o.fieldKey === key)
  const isFalsePositive = (key: string) => !!result?.falsePositiveKeys.includes(key)

  // Correctness is always stated in words; the class only reinforces it.
  function mark(key: string) {
    if (!result) return null
    const o = outcomeFor(key)
    if (o?.found) return <span className="sim-mark is-right">{t.found}</span>
    if (isFalsePositive(key)) return <span className="sim-mark is-wrong">{t.falsePositive}</span>
    if (o) return <span className="sim-mark is-wrong">{t.missed}</span>
    return null
  }

  return (
    <div className="sim">
      <p className="sim-instruction">{t.instruction}</p>

      <div className="sim-body">
        <section className="sim-claim" aria-label="Claim">
          <ul className="sim-fields">
            {dataset.claim.fields.map((f) => (
              <li key={f.key} className={outcomeFor(f.key)?.found ? 'is-right' : undefined}>
                <button
                  type="button"
                  onClick={() => toggle(f.key)}
                  aria-pressed={flagged.has(f.key)}
                  disabled={!!result}
                  className={flagged.has(f.key) ? 'is-flagged' : undefined}
                >
                  <span className="sim-field-label">{pick(locale, f.labelAr, f.labelEn)}</span>
                  <span className="sim-field-value">{f.value || '—'}</span>
                  {flagged.has(f.key) ? <span className="sim-flag-state">{t.flagged}</span> : null}
                </button>
                {mark(f.key)}
              </li>
            ))}
          </ul>

          <h3 className="sim-subhead">{t.lines}</h3>
          <ul className="sim-fields">
            {dataset.claim.lines.map((l) => (
              <li key={l.key}>
                <button
                  type="button"
                  onClick={() => toggle(l.key)}
                  aria-pressed={flagged.has(l.key)}
                  disabled={!!result}
                  className={flagged.has(l.key) ? 'is-flagged' : undefined}
                >
                  <span className="sim-field-label">
                    {l.code} · {pick(locale, l.descAr, l.descEn)}
                  </span>
                  <span className="sim-field-value">
                    {l.units} × {l.charge.toFixed(2)}
                  </span>
                  {flagged.has(l.key) ? <span className="sim-flag-state">{t.flagged}</span> : null}
                </button>
                {mark(l.key)}
              </li>
            ))}
          </ul>
          <p className="sim-total">
            {t.total}: <strong>{dataset.claim.total.toFixed(2)}</strong>
          </p>
        </section>

        {/*
          One element, two presentations. On a phone this is a bottom sheet the
          learner opens; from 768px up, CSS reveals the content and hides the
          toggle so it reads as a side panel. No JS, no second code path, and it
          is keyboard-native because <details> already is.
        */}
        {/* `open` by default: a closed <details> hides its children no matter
            what CSS says, so forcing the desktop panel visible with CSS alone
            silently rendered an empty box. Open + a hidden summary IS the
            panel; on a phone the same element is an expanded sheet the learner
            can collapse. */}
        <details className="sim-evidence" open>
          <summary>{t.evidence}</summary>
          <div className="sim-evidence-body">
            <h3>{t.note}</h3>
            <p>{pick(locale, dataset.note.mdAr, dataset.note.mdEn)}</p>
            <h3>{t.card}</h3>
            <dl>
              {Object.entries(dataset.card).map(([k, v]) => (
                <div key={k}>
                  {/* Human labels: raw camelCase keys are an artefact of the
                      data shape, not something a learner should have to read. */}
                  <dt>{t.cardLabels[k] ?? k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </details>
      </div>

      {!result ? (
        <div className="sim-actions">
          <button type="button" className="btn-primary" onClick={submit} disabled={busy}>
            {busy ? t.submitting : t.submit}
          </button>
          <span className="sim-count" aria-live="polite">
            {t.flaggedCount(flagged.size)}
          </span>
        </div>
      ) : (
        <section className="sim-result" aria-live="polite">
          <h2>
            {t.result}: {result.scorePct}% — {result.passed ? t.pass : t.fail}
          </h2>
          <p className="sim-metrics">
            {t.precision} {Math.round(result.precision * 100)}% · {t.recall}{' '}
            {Math.round(result.recall * 100)}% · {result.hits}/{result.totalErrors} ·{' '}
            {result.falsePositives} false positive{result.falsePositives === 1 ? '' : 's'}
          </p>
          <p className="sim-formula">{t.formula}</p>

          <ul className="sim-outcomes">
            {result.outcomes.map((o) => (
              <li key={o.id} className={o.found ? 'is-right' : 'is-wrong'}>
                <strong>{o.found ? t.found : t.missed}</strong> · {o.class}
                <p>{pick(locale, o.whyAr, o.whyEn)}</p>
                {/* The link back to the teaching block is the pedagogical
                    argument of the project, so it appears on every outcome. */}
                <a href={`${lessonHref}#${o.teachesBlockId}`}>{t.teaches}</a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setResult(null)
              setFlagged(new Set())
            }}
          >
            {t.retry}
          </button>
        </section>
      )}
    </div>
  )
}
