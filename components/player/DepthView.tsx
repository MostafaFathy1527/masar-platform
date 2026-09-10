'use client'

import { useState } from 'react'
import type { AppLocale } from '@/i18n/routing'
import type { Block, Level } from '@/lib/schema/lesson'
import { BlockList } from '@/components/blocks/BlockRenderer'

type Copy = {
  levelName: Record<Level, string>
  levelWhat: Record<Level, string>
  cumulative: string
  /** Shown when the lesson is English-only and the reader is in Arabic. */
  englishOnlyNotice: string
  /** Contains the literal token {n}, replaced with the visible block count.
   *  A string rather than a function: functions cannot cross the server /
   *  client component boundary. */
  blockCountTemplate: string
}

/**
 * The depth switch.
 *
 * L2 and L3 are cumulative: a lesson at L3 is everything at L1, plus L2, plus
 * the applied practice. Showing them cumulatively is the honest rendering —
 * depth is a property of one lesson, not three separate lessons — and it is
 * also what makes the difference between levels visible at a glance, which is
 * the entire point of this page.
 */
export function DepthView({
  blocks,
  levels,
  locale,
  copy,
  bilingual = true,
  initialLevel,
}: {
  blocks: { l1: Block[]; l2: Block[]; l3: Block[] }
  levels: Level[]
  locale: AppLocale
  copy: Copy
  bilingual?: boolean
  /**
   * Which level to open on. /depth opens at L1, because its argument is the
   * progression from one level to the next. A lesson reader opens at the
   * deepest level the lesson declares, because there the argument is the
   * lesson: opening a three-level lesson at L1 would hide two thirds of it
   * behind a control the reader has no reason to touch.
   */
  initialLevel?: Level
}) {
  const [level, setLevel] = useState<Level>(initialLevel ?? levels[0])

  const shown: Block[] = [
    ...blocks.l1,
    ...(level === 'L2' || level === 'L3' ? blocks.l2 : []),
    ...(level === 'L3' ? blocks.l3 : []),
  ]

  return (
    <div>
      {/* Said on the lesson's own page, not buried in a blanket claim
          elsewhere. A reader in Arabic learns this before reading, not by
          discovering English text halfway down. */}
      {!bilingual && locale === 'ar' ? (
        <p className="lesson-english-only">{copy.englishOnlyNotice}</p>
      ) : null}

      {/*
        A control with one option is not a control. Four of the five lessons
        declare L1 only; rendering a single-tab tablist for them would suggest a
        choice that does not exist, and would read as a broken switch rather
        than as an honest statement of the lesson's depth.
      */}
      {levels.length > 1 ? (
      <div className="depth-switch" role="tablist" aria-label="Depth">
        {levels.map((l) => (
          <button
            key={l}
            role="tab"
            type="button"
            aria-selected={level === l}
            className={level === l ? 'is-active' : undefined}
            onClick={() => setLevel(l)}
          >
            <span className="depth-switch-name">{copy.levelName[l]}</span>
            <span className="depth-switch-what">{copy.levelWhat[l]}</span>
          </button>
        ))}
      </div>
      ) : null}

      {/* "Levels are cumulative" says nothing about a lesson with one level,
          and a line that does not apply is a line a reader has to discount. */}
      <p className="depth-meta" aria-live="polite">
        {levels.length > 1 ? `${copy.cumulative} · ` : ''}
        {copy.blockCountTemplate.replace('{n}', String(shown.length))}
      </p>

      <BlockList blocks={shown} locale={locale} />
    </div>
  )
}
