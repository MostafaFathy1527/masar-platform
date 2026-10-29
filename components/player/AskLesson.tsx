'use client'

import { useState, type FormEvent } from 'react'
import type { AppLocale } from '@/i18n/routing'
import type { Level } from '@/lib/schema/lesson'
import { LEVEL_EVENT } from './DepthView'

export type AskCopy = {
  title: string
  lead: string
  placeholder: string
  ask: string
  asking: string
  sources: string
  notCovered: string
  limitedVisitor: string
  limitedDay: string
  failed: string
  disclaimer: string
}

type Source = { label: string; level: Level }

type State =
  | { kind: 'idle' }
  | { kind: 'asking' }
  | { kind: 'answer'; text: string; cites: string[] }
  | { kind: 'message'; text: string }

/** Two blocks under one heading would show as two identical links; keep the first. */
function uniqueByLabel(cites: string[], sources: Record<string, Source>): string[] {
  const seen = new Set<string>()
  return cites.filter((id) => {
    const label = sources[id]?.label ?? id
    if (seen.has(label)) return false
    seen.add(label)
    return true
  })
}

/**
 * "Ask the lesson". The answer comes from this lesson's passages only (lib/ask), and
 * every source is a link to the block it came from. If that block sits at a deeper
 * level than the one on screen, the reader is switched to that level first.
 */
export function AskLesson({
  slug,
  locale,
  sources,
  copy,
}: {
  slug: string
  locale: AppLocale
  /** blockId -> where it is: the nearest heading, and the level it belongs to */
  sources: Record<string, Source>
  copy: AskCopy
}) {
  const [question, setQuestion] = useState('')
  const [state, setState] = useState<State>({ kind: 'idle' })

  async function submit(e: FormEvent) {
    e.preventDefault()
    const q = question.trim()
    if (q.length < 3 || state.kind === 'asking') return
    setState({ kind: 'asking' })
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, locale, question: q }),
      })
      const body = await res.json().catch(() => ({}))
      if (body.kind === 'answer') setState({ kind: 'answer', text: body.text, cites: body.cites ?? [] })
      else if (body.kind === 'not_covered') setState({ kind: 'message', text: copy.notCovered })
      else if (body.kind === 'limited')
        setState({ kind: 'message', text: body.limit === 'day' ? copy.limitedDay : copy.limitedVisitor })
      else setState({ kind: 'message', text: copy.failed })
    } catch {
      setState({ kind: 'message', text: copy.failed })
    }
  }

  function goTo(blockId: string) {
    const find = () => document.querySelector<HTMLElement>(`[data-block-id="${CSS.escape(blockId)}"]`)
    const show = (el: HTMLElement) => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('is-cited')
      window.setTimeout(() => el.classList.remove('is-cited'), 2400)
    }
    const el = find()
    if (el) return show(el)
    window.dispatchEvent(new CustomEvent(LEVEL_EVENT, { detail: sources[blockId]?.level }))
    window.setTimeout(() => {
      const later = find()
      if (later) show(later)
    }, 60)
  }

  return (
    <section className="ask-lesson" aria-labelledby="ask-lesson-title">
      <h2 id="ask-lesson-title" className="ask-lesson-title">
        {copy.title}
      </h2>
      <p className="ask-lesson-lead">{copy.lead}</p>
      <form onSubmit={submit} className="ask-lesson-form">
        <label htmlFor="ask-lesson-q" className="sr-only">
          {copy.title}
        </label>
        <textarea
          id="ask-lesson-q"
          className="ask-lesson-input"
          rows={2}
          dir="auto"
          maxLength={400}
          value={question}
          placeholder={copy.placeholder}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              e.currentTarget.form?.requestSubmit()
            }
          }}
        />
        <button className="btn-primary btn-sm" type="submit" disabled={state.kind === 'asking' || question.trim().length < 3}>
          {state.kind === 'asking' ? copy.asking : copy.ask}
        </button>
      </form>

      <div aria-live="polite">
        {state.kind === 'answer' ? (
          <div className="ask-lesson-answer">
            <p dir="auto">{state.text}</p>
            {state.cites.length > 0 ? (
              <div className="ask-lesson-sources">
                <span>{copy.sources}</span>
                {uniqueByLabel(state.cites, sources).map((id, i) => (
                  <button key={id} type="button" className="chip chip-accent" onClick={() => goTo(id)}>
                    <span>{i + 1}</span>
                    <bdi>{sources[id]?.label ?? id}</bdi>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        {state.kind === 'message' ? <p className="ask-lesson-message">{state.text}</p> : null}
      </div>
      <p className="ask-lesson-note">{copy.disclaimer}</p>
    </section>
  )
}
