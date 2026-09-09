// @vitest-environment jsdom
//
// Two clicks in a single tick must both register.
//
// Both toggle handlers used to compute the next state from the value captured
// in their render closure — `new Set(flagged)` in the workbench, and the worse
// `{ ...responses, [id]: next }` in the attempt runner. React batches updates,
// so several clicks processed in one task all start from the same stale value
// and only the last survives. In the workbench that loses flags; in the runner
// it discards a whole item's answer, because the spread rebuilds the map from
// a snapshot that never saw the earlier click.
//
// This was found by a screenshot step file: four scripted clicks produced one
// flagged field. The tempting conclusion was that a person cannot click that
// fast and it therefore does not matter. This project has falsified that shape
// of assumption repeatedly, and the mobile pattern is a shipped deliverable —
// fast tapping is the case, not a hypothetical.
//
// The test drives the real components and clicks inside one act() batch, which
// is the same batching a burst of real events gets. It fails against the old
// handlers, which is the point: a version that tested only the extracted pure
// functions would still pass if the handler were reverted, and a test that
// cannot fail for the bug it names is what-failed entry 5.
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AttemptRunner } from '@/components/assess/AttemptRunner'
import { ClaimReviewWorkbench } from '@/components/sims/ClaimReviewWorkbench'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const field = (key: string, value: string) => ({
  key,
  labelAr: key,
  labelEn: key,
  value,
})

const DATASET = {
  claim: {
    fields: [
      field('member_name', 'Layla Hassan'),
      field('member_dob', '1988-03-11'),
      field('service_date', '2026-01-20'),
      field('dx_primary', 'DX-A100'),
    ],
    lines: [
      {
        key: 'line_1',
        code: 'PRC-1042',
        descAr: 'زيارة',
        descEn: 'Visit',
        units: 1,
        charge: 420,
      },
    ],
    total: 420,
  },
  note: { mdAr: 'ملاحظة', mdEn: 'Note' },
  card: { memberDobOnCard: '1988-03-14' },
}

const pressedCount = () => container.querySelectorAll('button[aria-pressed="true"]').length

describe('ClaimReviewWorkbench', () => {
  it('registers every flag when several clicks land in one batch', () => {
    act(() => {
      root.render(
        <ClaimReviewWorkbench
          slug="claim-review"
          dataset={DATASET}
          locale="en"
          lessonHref="/en/course"
        />,
      )
    })

    const buttons = [...container.querySelectorAll<HTMLButtonElement>('.sim-claim button')]
    expect(buttons.length).toBeGreaterThanOrEqual(4)

    // One act() call: every click is processed before React re-renders, which
    // is exactly what a burst of real taps produces.
    act(() => {
      buttons[1].click()
      buttons[2].click()
      buttons[3].click()
    })

    expect(pressedCount()).toBe(3)
  })

  it('still toggles a flag off', () => {
    act(() => {
      root.render(
        <ClaimReviewWorkbench
          slug="claim-review"
          dataset={DATASET}
          locale="en"
          lessonHref="/en/course"
        />,
      )
    })
    const buttons = [...container.querySelectorAll<HTMLButtonElement>('.sim-claim button')]

    act(() => {
      buttons[1].click()
      buttons[1].click()
    })

    expect(pressedCount()).toBe(0)
  })
})

const ITEMS = [
  {
    id: 'i1',
    type: 'MCQ_SINGLE' as const,
    stemAr: 'س1',
    stemEn: 'Q1',
    isScenario: false,
    options: [
      { id: 'i1a', order: 1, textAr: 'أ', textEn: 'A' },
      { id: 'i1b', order: 2, textAr: 'ب', textEn: 'B' },
    ],
  },
  {
    id: 'i2',
    type: 'MULTI_SELECT' as const,
    stemAr: 'س2',
    stemEn: 'Q2',
    isScenario: false,
    options: [
      { id: 'i2a', order: 1, textAr: 'أ', textEn: 'A' },
      { id: 'i2b', order: 2, textAr: 'ب', textEn: 'B' },
    ],
  },
]

describe('AttemptRunner', () => {
  async function startedRunner() {
    const original = globalThis.fetch
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({ attemptId: 'a1', passPct: 75, timeLimitSec: null, items: ITEMS }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )) as typeof fetch
    try {
      await act(async () => {
        root.render(<AttemptRunner scope="EXAM" locale="en" />)
      })
      const startBtn = container.querySelector<HTMLButtonElement>('.assess-start button')
      if (!startBtn) throw new Error('no start button rendered')
      await act(async () => {
        startBtn.click()
      })
    } finally {
      globalThis.fetch = original
    }
  }

  it('keeps answers to different items when both land in one batch', async () => {
    await startedRunner()

    const items = [...container.querySelectorAll('section.assess > ol.assess-items > li')]
    expect(items).toHaveLength(2)

    const first = items[0].querySelector<HTMLButtonElement>('ul li button')!
    const second = items[1].querySelector<HTMLButtonElement>('ul li button')!

    // The old handler spread a stale `responses`, so answering item 2 in the
    // same batch erased the answer to item 1 entirely.
    act(() => {
      first.click()
      second.click()
    })

    expect(pressedCount()).toBe(2)
    expect(container.textContent).toContain('2 of 2')
  })

  it('replaces the choice on a single-answer item and accumulates on multi-select', async () => {
    await startedRunner()

    const items = [...container.querySelectorAll('section.assess > ol.assess-items > li')]
    const singleOpts = [...items[0].querySelectorAll<HTMLButtonElement>('ul li button')]
    const multiOpts = [...items[1].querySelectorAll<HTMLButtonElement>('ul li button')]

    act(() => {
      singleOpts[0].click()
      singleOpts[1].click()
    })
    // MCQ_SINGLE keeps one, and it is the later click rather than the earlier.
    expect(items[0].querySelectorAll('button[aria-pressed="true"]')).toHaveLength(1)
    expect(singleOpts[1].getAttribute('aria-pressed')).toBe('true')

    act(() => {
      multiOpts[0].click()
      multiOpts[1].click()
    })
    expect(items[1].querySelectorAll('button[aria-pressed="true"]')).toHaveLength(2)
  })
})
