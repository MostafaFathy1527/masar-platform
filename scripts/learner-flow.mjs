// The learner's path through the live site, walked by a real browser.
//
// Unit tests prove the parts; this proves the joins, on the deployment people
// actually open. The site once shipped five lessons that were listed on /course
// and could not be opened (see the lesson route's header comment); every part
// was tested and nothing tested the walk. This is that walk, run daily.
//
// Read-only on purpose: it creates no account, starts no attempt and writes no
// row, so it can run against production every day without leaving anything
// behind. The knowledge check it answers is formative and lives in the browser.
//
// No dependencies: Chrome over the DevTools protocol, like scripts/shot.mjs.
//   node scripts/learner-flow.mjs https://masar.mostafafathy.com
//   CHROME_PATH=/usr/bin/google-chrome node scripts/learner-flow.mjs http://localhost:3000
// Exit 0 when every step passes, 1 when any fails, 2 when it could not run.

import { spawn } from 'node:child_process'
import { appendFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = (process.argv[2] || '').replace(/\/$/, '')
if (!/^https?:\/\//.test(BASE)) {
  console.error('usage: node scripts/learner-flow.mjs <base-url>')
  process.exit(2)
}
const LESSON = 'anatomy-of-a-claim'

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // Windows installs, located from the environment rather than spelled out.
    ...['PROGRAMFILES', 'PROGRAMFILES(X86)', 'LOCALAPPDATA']
      .filter((v) => process.env[v])
      .map((v) => join(process.env[v], 'Google', 'Chrome', 'Application', 'chrome.exe')),
  ]
  return candidates.find((p) => p && existsSync(p))
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function launch() {
  const chrome = findChrome()
  if (!chrome) throw new Error('no Chrome found; set CHROME_PATH')
  const profile = mkdtempSync(join(tmpdir(), 'learner-flow-'))
  const proc = spawn(chrome, [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--no-sandbox',
    'about:blank',
  ], { stdio: 'ignore' })
  const portFile = join(profile, 'DevToolsActivePort')
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100)
  if (!existsSync(portFile)) throw new Error('Chrome did not open a debugging port')
  const port = readFileSync(portFile, 'utf-8').split('\n')[0].trim()
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  const page = list.find((t) => t.type === 'page')
  return {
    ws: page.webSocketDebuggerUrl,
    close() {
      proc.kill()
      try { rmSync(profile, { recursive: true, force: true }) } catch { /* Windows may hold it briefly */ }
    },
  }
}

function connect(url) {
  const ws = new WebSocket(url)
  let id = 0
  const pending = new Map()
  const listeners = []
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m)
      pending.delete(m.id)
    } else if (m.method) {
      for (const l of listeners) l(m)
    }
  }
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const i = ++id
      pending.set(i, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)))
      ws.send(JSON.stringify({ id: i, method, params }))
      setTimeout(() => pending.has(i) && (pending.delete(i), reject(new Error(`timeout: ${method}`))), 45000)
    })
  const opened = new Promise((r) => ws.addEventListener('open', r, { once: true }))
  return { send, on: (fn) => listeners.push(fn), opened, close: () => ws.close() }
}

// --------------------------------------------------------------------- run

const results = []
let cdp, browser

async function step(name, fn) {
  const t0 = Date.now()
  try {
    const detail = await fn()
    results.push({ name, ok: true, detail: detail || '', ms: Date.now() - t0 })
  } catch (e) {
    // First line only: a stack trace would break the summary table.
    const detail = String(e.message || e).split(/\r?\n/)[0].replace(/^Error: /, '')
    results.push({ name, ok: false, detail, ms: Date.now() - t0 })
  }
}

async function evaluate(expression) {
  const r = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
  return r.result.value
}

let docStatus = 0
let pageErrors = []
const consoleErrors = []

async function open(path, width = 1280, height = 800) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: width < 768, screenWidth: width, screenHeight: height,
  })
  docStatus = 0
  pageErrors = []
  const loaded = new Promise((resolve) => {
    const off = (m) => m.method === 'Page.loadEventFired' && resolve()
    cdp.on(off)
  })
  await cdp.send('Page.navigate', { url: BASE + path })
  await Promise.race([loaded, sleep(30000)])
  // Hydration runs after load; give the client a moment before reading it.
  await sleep(800)
  if (docStatus >= 400 || docStatus === 0) throw new Error(`${path} answered HTTP ${docStatus || 'nothing'}`)
  if (pageErrors.length) throw new Error(`${path} threw: ${pageErrors[0]}`)
}

// Runs in the page: wait for a selector, up to a few seconds.
const waitFor = (sel) => `await (async () => {
  for (let i = 0; i < 50; i++) { if (document.querySelector(${JSON.stringify(sel)})) return; await new Promise(r => setTimeout(r, 100)) }
  throw new Error('never appeared: ' + ${JSON.stringify(sel)})
})();`

const noOverflow = `(() => {
  const el = document.scrollingElement
  const over = el.scrollWidth - window.innerWidth
  if (over > 1) throw new Error('page scrolls sideways by ' + over + 'px at ' + window.innerWidth + 'px')
  return 'no sideways scroll at ' + window.innerWidth + 'px'
})()`

try {
  browser = await launch()
  cdp = connect(browser.ws)
  await cdp.opened
  cdp.on((m) => {
    if (m.method === 'Network.responseReceived' && m.params.type === 'Document') docStatus = m.params.response.status
    if (m.method === 'Runtime.exceptionThrown') {
      pageErrors.push(m.params.exceptionDetails.exception?.description?.split('\n')[0] || m.params.exceptionDetails.text)
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      consoleErrors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200))
    }
  })
  await Promise.all([cdp.send('Page.enable'), cdp.send('Runtime.enable'), cdp.send('Network.enable')])
} catch (e) {
  console.error('could not start the browser:', e.message)
  browser?.close()
  process.exit(2)
}

await step('Home page, English', async () => {
  await open('/en')
  return evaluate(`(() => {
    if (document.documentElement.lang !== 'en') throw new Error('lang is ' + document.documentElement.lang)
    const h1 = document.querySelector('h1')?.textContent.trim()
    if (!h1) throw new Error('no h1')
    return h1.slice(0, 80)
  })()`)
})

await step('Home page, Arabic, phone width', async () => {
  await open('/ar', 390, 844)
  return evaluate(`(() => {
    if (document.documentElement.dir !== 'rtl') throw new Error('dir is ' + document.documentElement.dir)
    return ${noOverflow}
  })()`)
})

await step('The course lists the lesson and the link opens it', async () => {
  await open('/en/course')
  const href = await evaluate(`(() => {
    const a = document.querySelector('a[href="/en/lesson/${LESSON}"]')
    if (!a) throw new Error('no link to /en/lesson/${LESSON} on /en/course')
    return a.getAttribute('href')
  })()`)
  await open(href)
  return evaluate(`document.querySelector('h1')?.textContent.trim() || (() => { throw new Error('lesson has no h1') })()`)
})

await step('A knowledge check answers and explains', async () => {
  // Still on the lesson page. Pick the interactive depth if the lesson offers it.
  return evaluate(`(async () => {
    const tabs = [...document.querySelectorAll('[role="tab"]')]
    const l2 = tabs.find(t => /2/.test(t.textContent))
    if (l2 && l2.getAttribute('aria-selected') !== 'true') l2.click()
    ${waitFor('.kcheck .kcheck-options button')}
    const box = document.querySelector('.kcheck')
    box.querySelector('.kcheck-options button').click()
    await new Promise(r => setTimeout(r, 100))
    const check = [...box.querySelectorAll('button')].find(b => /Check my answer/.test(b.textContent))
    if (!check) throw new Error('no "Check my answer" button')
    if (check.disabled) throw new Error('"Check my answer" stayed disabled after choosing an option')
    check.click()
    for (let i = 0; i < 30 && !box.querySelector('.kcheck-fb'); i++) await new Promise(r => setTimeout(r, 100))
    const fb = box.querySelector('.kcheck-fb')?.textContent || ''
    if (!/^(Correct|Not correct)/.test(fb.trim())) throw new Error('no worded feedback after checking: ' + fb.slice(0, 60))
    if (!box.querySelector('.kcheck-rationale')?.textContent.trim()) throw new Error('no rationale shown')
    return fb.trim().slice(0, 60)
  })()`)
})

await step('The same lesson in Arabic, phone width', async () => {
  await open(`/ar/lesson/${LESSON}`, 390, 844)
  return evaluate(noOverflow)
})

await step('A pipeline draft opens from /samples, marked as a draft', async () => {
  await open('/en/samples')
  const href = await evaluate(`(() => {
    const a = [...document.querySelectorAll('a[href^="/en/samples/"]')][0]
    if (!a) throw new Error('no draft linked from /en/samples')
    return a.getAttribute('href')
  })()`)
  await open(href)
  return evaluate(`(() => {
    if (!/DRAFT/i.test(document.body.innerText)) throw new Error('the draft page does not say DRAFT')
    return location.pathname
  })()`)
})

await step('The commissioning page', async () => {
  await open('/en/commission')
  return evaluate(`document.querySelector('h1')?.textContent.trim().slice(0, 80) || (() => { throw new Error('no h1') })()`)
})

cdp.close()
browser.close()

// ------------------------------------------------------------------ report

const failed = results.filter((r) => !r.ok)
const lines = [
  `## Learner flow: ${failed.length ? `${failed.length} of ${results.length} steps failed` : `all ${results.length} steps passed`}`,
  '',
  `Against ${BASE}, ${new Date().toISOString()}`,
  '',
  '| Step | Result | ms |',
  '|---|---|---|',
  ...results.map((r) => `| ${r.name} | ${r.ok ? 'PASS' : 'FAIL'}: ${r.detail.replace(/\|/g, '/')} | ${r.ms} |`),
]
if (consoleErrors.length) {
  lines.push('', `Console errors (reported, not failed on): ${consoleErrors.length}`, '')
  lines.push(...[...new Set(consoleErrors)].slice(0, 10).map((c) => `- ${c.replace(/\n/g, ' ')}`))
}
const text = lines.join('\n') + '\n'
console.log(text)
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text)
process.exit(failed.length ? 1 : 0)
