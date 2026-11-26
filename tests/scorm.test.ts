import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'
import { buildScorm, mdToHtml, RUNTIME, zipStore } from '@/lib/scorm'

const DIR = 'pipeline/out/lesson-cs-01/v1'
const lesson = JSON.parse(readFileSync(`${DIR}/lesson.json`, 'utf-8'))
const items = JSON.parse(readFileSync(`${DIR}/items.json`, 'utf-8'))

/** Names of the entries in a zip, read from its central directory. */
function zipNames(buf: Buffer): string[] {
  const end = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  const count = buf.readUInt16LE(end + 10)
  let p = buf.readUInt32LE(end + 16)
  const names: string[] = []
  for (let i = 0; i < count; i++) {
    expect(buf.readUInt32LE(p)).toBe(0x02014b50)
    const n = buf.readUInt16LE(p + 28)
    const extra = buf.readUInt16LE(p + 30)
    const comment = buf.readUInt16LE(p + 32)
    names.push(buf.subarray(p + 46, p + 46 + n).toString('utf-8'))
    p += 46 + n + extra + comment
  }
  return names
}

describe('SCORM 1.2 export', () => {
  it('puts imsmanifest.xml at the root of the zip, next to the one SCO page', () => {
    const { files } = buildScorm(lesson, items, 'en')
    expect(zipNames(zipStore(files))).toEqual(['imsmanifest.xml', 'index.html'])
  })

  it('declares SCORM 1.2 and points the item at a sco resource', () => {
    const manifest = buildScorm(lesson, items, 'ar').files[0].data.toString('utf-8')
    expect(manifest).toContain('<schemaversion>1.2</schemaversion>')
    expect(manifest).toContain('adlcp:scormtype="sco" href="index.html"')
    expect(manifest).toContain(lesson.titleAr)
  })

  it('renders every knowledge check of CS-01 and leaves nothing out', () => {
    const { checks, skipped, files } = buildScorm(lesson, items, 'ar')
    expect(checks).toBe(2)
    expect(skipped).toEqual([])
    const html = files[1].data.toString('utf-8')
    expect(html).toContain('dir="rtl"')
    // Self-contained: no request leaves the LMS.
    expect(html).not.toMatch(/(src|href)="https?:/)
  })

  it('escapes content and turns **bold** into strong', () => {
    expect(mdToHtml('a <b> **c**\n\n- x\n- y')).toBe('<p>a &lt;b&gt; <strong>c</strong></p>\n<ul><li>x</li><li>y</li></ul>')
  })

  it('initialises, scores, completes and finishes against a 1.2 API', () => {
    const calls: string[] = []
    const store: Record<string, string> = { 'cmi.core.lesson_status': 'not attempted' }
    const API = {
      LMSInitialize: () => (calls.push('init'), 'true'),
      LMSGetValue: (k: string) => store[k] ?? '',
      LMSSetValue: (k: string, v: string) => ((store[k] = v), 'true'),
      LMSCommit: () => (calls.push('commit'), 'true'),
      LMSFinish: () => (calls.push('finish'), 'true'),
    }
    const handlers: Record<string, () => void> = {}
    const win: Record<string, unknown> = { API, addEventListener: (e: string, f: () => void) => (handlers[e] = f) }
    win.parent = win
    runInNewContext(RUNTIME, { window: win })
    const M = win.MasarScorm as {
      setTotal(n: number): void
      answer(k: string, c: string, r: boolean): boolean
    }
    expect(store['cmi.core.lesson_status']).toBe('incomplete')
    M.setTotal(2)
    expect(M.answer('CS-01-KC-01', '1', true)).toBe(false)
    expect(M.answer('CS-01-KC-02', '0', false)).toBe(true)
    expect(store['cmi.core.lesson_status']).toBe('completed')
    expect(store['cmi.core.score.raw']).toBe('50')
    expect(store['cmi.interactions.1.result']).toBe('wrong')
    handlers.pagehide()
    handlers.beforeunload()
    expect(store['cmi.core.session_time']).toMatch(/^\d{4}:\d{2}:\d{2}\.\d{2}$/)
    expect(calls.filter((c) => c === 'finish')).toHaveLength(1)
  })

  it('finds the API in a parent frame', () => {
    const top: Record<string, unknown> = { API: { LMSInitialize: () => 'true', LMSGetValue: () => 'incomplete', LMSSetValue: () => 'true', LMSCommit: () => 'true', LMSFinish: () => 'true' } }
    top.parent = top
    const win: Record<string, unknown> = { parent: top, addEventListener: () => {} }
    runInNewContext(RUNTIME, { window: win })
    expect((win.MasarScorm as { live(): boolean }).live()).toBe(true)
  })
})

describe('SCORM page in a browser DOM', () => {
  it('answers both checks, says right or wrong in words, and marks the lesson completed', async () => {
    // jsdom ships without types here; only the constructor is used.
    type Dom = { window: Window & typeof globalThis }
    type Ctor = new (html: string, o: { runScripts: string; beforeParse(w: Window): void }) => Dom
    const { JSDOM } = (await import(/* untyped */ 'jsdom' as string)) as { JSDOM: Ctor }
    const html = buildScorm(lesson, items, 'en').files[1].data.toString('utf-8')
    const store: Record<string, string> = {}
    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      beforeParse(w: Window) {
        ;(w as unknown as { API: unknown }).API = {
          LMSInitialize: () => 'true',
          LMSGetValue: (k: string) => store[k] ?? 'not attempted',
          LMSSetValue: (k: string, v: string) => ((store[k] = v), 'true'),
          LMSCommit: () => 'true',
          LMSFinish: () => 'true',
        }
      },
    })
    const d = dom.window.document
    expect(d.getElementById('lms')!.hidden).toBe(true)
    const checks = [...d.querySelectorAll('.kc')]
    // First check: the correct option. Second: a wrong one.
    ;(checks[0].querySelector('[data-correct="1"]') as HTMLButtonElement).click()
    ;(checks[1].querySelector('[data-correct="0"]') as HTMLButtonElement).click()
    const verdicts = [...d.querySelectorAll('.verdict')].map((v) => v.textContent)
    expect(verdicts).toEqual(['Correct answer.', 'Not the correct answer.'])
    expect(d.getElementById('done')!.hidden).toBe(false)
    expect(store['cmi.core.lesson_status']).toBe('completed')
    expect(store['cmi.core.score.raw']).toBe('50')
    // A second click on an answered check changes nothing.
    ;(checks[0].querySelector('.opt') as HTMLButtonElement).click()
    expect(d.querySelectorAll('.verdict')).toHaveLength(2)
  })
})
