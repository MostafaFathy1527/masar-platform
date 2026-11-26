import { crc32 } from 'node:zlib'
import { LessonDoc, type Block } from './schema/lesson.ts'

/**
 * SCORM 1.2 export, prototype.
 *
 * One lesson becomes one SCO: a single self-contained index.html (no network,
 * no fonts fetched, so it runs inside an LMS that blocks outside requests) plus
 * imsmanifest.xml at the root of the zip. The page finds the LMS API the way
 * SCORM 1.2 says (walk window.parent, then window.opener), calls LMSInitialize,
 * marks the lesson "incomplete", and once every knowledge check is answered
 * writes the score and sets "completed", then LMSCommit. LMSFinish runs on
 * pagehide. Without an LMS the page still works and says it is in preview.
 *
 * One package per language: an LMS course usually has one language, and the
 * manifest's title and the page's dir follow it.
 */

export type ScormLocale = 'ar' | 'en'

/**
 * A knowledge-check item as the pipeline writes it. ItemDoc in lib/schema/item.ts
 * only accepts the demo course's MI-* keys, so draft items are checked here for
 * the fields the export reads.
 */
type ItemDoc = {
  key: string
  type: string
  formative?: boolean
  stemAr: string
  stemEn: string
  rationaleAr?: string
  rationaleEn?: string
  options: { textAr: string; textEn: string; isCorrect: boolean; feedbackAr?: string; feedbackEn?: string }[]
}

function readItems(json: unknown): ItemDoc[] {
  const items = (json as { items?: unknown })?.items
  if (!Array.isArray(items) || items.length === 0) throw new Error('items.json has no items')
  return items.map((raw) => {
    const it = raw as ItemDoc
    if (typeof it.key !== 'string' || !Array.isArray(it.options) || it.options.length < 2) {
      throw new Error(`item ${String(it?.key)} is missing a key or options`)
    }
    // A package is content handed to someone else's LMS: a scored item would
    // leave with its answer key in the page. Only formative checks go.
    if (it.formative !== true) throw new Error(`item ${it.key} is not formative; scored items are never exported`)
    if (it.type === 'MCQ_SINGLE' && it.options.filter((o) => o.isCorrect).length !== 1) {
      throw new Error(`item ${it.key} needs exactly one correct option`)
    }
    return it
  })
}

export type ScormFile = { name: string; data: Buffer }

export type ScormResult = { files: ScormFile[]; skipped: string[]; checks: number }

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** The small markdown subset the pipeline emits: paragraphs, "- " lists, **bold**. */
export function mdToHtml(md: string): string {
  const inline = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  return md
    .split(/\n{2,}/)
    .map((para) => {
      const lines = para.split('\n')
      if (lines.every((l) => /^\s*[-*] /.test(l))) {
        return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*] /, ''))}</li>`).join('')}</ul>`
      }
      return `<p>${lines.map(inline).join('<br>')}</p>`
    })
    .join('\n')
}

const T = {
  ar: {
    l1: 'المستوى الأول', l2: 'المستوى الثاني', l3: 'المستوى الثالث',
    tip: 'نصيحة عملية', takeaways: 'الخلاصة', example: 'مثال محلول', why: 'لماذا',
    answer: 'الخلاصة', check: 'سؤال للتحقق', scenario: 'موقف', minutes: 'دقيقة',
    preview: 'معاينة: لم يُعثر على نظام إدارة تعلّم، فلن يُسجَّل التقدّم.',
    done: 'أنهيت الأسئلة. سُجِّل الدرس مكتملاً.',
    right: 'إجابة صحيحة.', wrong: 'ليست الإجابة الصحيحة.',
  },
  en: {
    l1: 'Level 1', l2: 'Level 2', l3: 'Level 3',
    tip: 'On the job', takeaways: 'Takeaways', example: 'Worked example', why: 'Why',
    answer: 'Answer', check: 'Knowledge check', scenario: 'Scenario', minutes: 'min',
    preview: 'Preview: no LMS found, so progress is not recorded.',
    done: 'All questions answered. The lesson is recorded as completed.',
    right: 'Correct answer.', wrong: 'Not the correct answer.',
  },
} as const

function renderCheck(item: ItemDoc, loc: ScormLocale, t: (typeof T)[ScormLocale]): string {
  const pick = (ar: string, en: string) => (loc === 'ar' ? ar : en)
  const opts = item.options
    .map(
      (o, i) =>
        `<li><button type="button" class="opt" data-i="${i}" data-correct="${o.isCorrect ? 1 : 0}">${esc(
          pick(o.textAr, o.textEn),
        )}</button><div class="fb" hidden>${esc(pick(o.feedbackAr ?? '', o.feedbackEn ?? ''))}</div></li>`,
    )
    .join('')
  return `<section class="kc" data-key="${esc(item.key)}" data-right="${esc(t.right)}" data-wrong="${esc(t.wrong)}"><h3>${t.check}</h3><p class="stem">${esc(
    pick(item.stemAr, item.stemEn),
  )}</p><ol class="opts">${opts}</ol><p class="why" hidden>${esc(pick(item.rationaleAr ?? '', item.rationaleEn ?? ''))}</p></section>`
}

function renderBlock(
  b: Block,
  loc: ScormLocale,
  items: Map<string, ItemDoc>,
  skipped: string[],
): string {
  const t = T[loc]
  const pick = (ar: string, en: string) => (loc === 'ar' ? ar : en)
  switch (b.type) {
    case 'heading': {
      const lvl = Math.min(Math.max(b.payload.level, 2), 4)
      return `<h${lvl}>${esc(pick(b.payload.textAr, b.payload.textEn))}</h${lvl}>`
    }
    case 'rich_text':
      return `<div class="prose">${mdToHtml(pick(b.payload.mdAr, b.payload.mdEn))}</div>`
    case 'definition_card':
      return `<dl class="card"><dt>${esc(pick(b.payload.termAr, b.payload.termEn))}</dt><dd>${esc(
        pick(b.payload.defAr, b.payload.defEn),
      )}</dd></dl>`
    case 'job_tip':
      return `<aside class="card tip"><strong>${t.tip}</strong>${mdToHtml(pick(b.payload.mdAr, b.payload.mdEn))}</aside>`
    case 'takeaways':
      return `<section class="card"><h3>${t.takeaways}</h3><ul>${(loc === 'ar'
        ? b.payload.itemsAr
        : b.payload.itemsEn
      )
        .map((s) => `<li>${esc(s)}</li>`)
        .join('')}</ul></section>`
    case 'worked_example':
      return `<section class="card"><h3>${t.example}</h3><p>${esc(pick(b.payload.promptAr, b.payload.promptEn))}</p><ol>${b.payload.steps
        .map(
          (s) =>
            `<li>${esc(pick(s.showAr, s.showEn))}<br><small><strong>${t.why}:</strong> ${esc(pick(s.whyAr, s.whyEn))}</small></li>`,
        )
        .join('')}</ol><p><strong>${t.answer}:</strong> ${esc(pick(b.payload.answerAr, b.payload.answerEn))}</p></section>`
    case 'scenario':
      return `<section class="card scn"><h3>${t.scenario}</h3><p>${esc(
        pick(b.payload.situationAr, b.payload.situationEn),
      )}</p><ol class="opts">${b.payload.decisions
        .map(
          (d) =>
            `<li><button type="button" class="dec">${esc(pick(d.optionAr, d.optionEn))}</button><div class="fb" hidden>${esc(
              pick(d.consequenceAr, d.consequenceEn),
            )}</div></li>`,
        )
        .join('')}</ol></section>`
    case 'knowledge_check': {
      const item = items.get(b.payload.itemRef)
      if (!item) throw new Error(`knowledge_check ${b.id} points at ${b.payload.itemRef}, which is not in items.json`)
      if (item.type !== 'MCQ_SINGLE') {
        skipped.push(`${b.id} (${item.type})`)
        return ''
      }
      return renderCheck(item, loc, t)
    }
    default:
      // compare_table, process_flow, sort_buckets, practice_sim: not in the
      // prototype. Listed in the result so the CLI says what was left out.
      skipped.push(`${b.id} (${b.type})`)
      return ''
  }
}

const CSS = `
:root{color-scheme:light;--ink:#1d1d1b;--muted:#5b5b57;--line:#d9d6cf;--bg:#fbfaf7;--card:#fff;--ok:#1f6f43;--no:#9b2c2c;--acc:#2b4c7e}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.65 system-ui,-apple-system,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif}
main{max-width:720px;margin:0 auto;padding:24px 16px 64px}h1{font-size:1.6rem;line-height:1.3;margin:.2em 0}
.meta{color:var(--muted);font-size:.9rem}.level{margin-top:2.2rem;border-top:2px solid var(--ink);padding-top:.6rem;font-size:.85rem;letter-spacing:.04em;color:var(--muted)}
.card,.kc{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin:16px 0}.card dt{font-weight:700}.card dd{margin:4px 0 0}
.tip strong:first-child{display:block;color:var(--acc)}h3{font-size:1rem;margin:0 0 6px}
.opts{list-style:none;padding:0;margin:8px 0}.opts li{margin:6px 0}
button{font:inherit;text-align:start;width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:#fff;color:inherit;cursor:pointer}
button:focus-visible{outline:3px solid var(--acc);outline-offset:2px}button[disabled]{cursor:default}
.right{border-color:var(--ok);border-inline-start-width:5px}.wrong{border-color:var(--no);border-inline-start-width:5px}
.verdict{font-weight:700;margin-inline-end:.4em}
.fb{padding:6px 12px;color:var(--muted);font-size:.95rem}.why{font-size:.95rem}
#lms{font-size:.85rem;color:var(--muted);border:1px dashed var(--line);padding:6px 10px;border-radius:6px}
`

/**
 * The SCORM 1.2 runtime. Kept as a plain string with no DOM work at the top
 * level beyond wiring, so tests can run it against a fake window and API.
 */
export const RUNTIME = `
(function (w) {
  function findAPI(win) {
    var n = 0;
    while (win && !win.API && win.parent && win.parent !== win && n < 10) { win = win.parent; n++; }
    return win && win.API ? win.API : null;
  }
  var api = findAPI(w) || (w.opener ? findAPI(w.opener) : null);
  var started = Date.now(), finished = false, live = false;
  function call(fn, a, b) { try { return api ? String(api[fn](a === undefined ? '' : a, b)) : ''; } catch (e) { return ''; } }
  function pad(n, l) { n = String(n); while (n.length < l) n = '0' + n; return n; }
  function span(ms) { var s = ms / 1000, h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return pad(h, 4) + ':' + pad(m, 2) + ':' + (r < 10 ? '0' : '') + r.toFixed(2); }
  if (api) {
    live = call('LMSInitialize', '') === 'true';
    if (live) {
      var st = call('LMSGetValue', 'cmi.core.lesson_status');
      if (st === 'not attempted' || st === '') call('LMSSetValue', 'cmi.core.lesson_status', 'incomplete');
      call('LMSCommit', '');
    }
  }
  var total = 0, answered = 0, correct = 0, n = 0;
  var M = w.MasarScorm = {
    live: function () { return live; },
    setTotal: function (t) { total = t; },
    answer: function (key, choice, isRight) {
      answered++; if (isRight) correct++;
      if (live) {
        var p = 'cmi.interactions.' + (n++) + '.';
        call('LMSSetValue', p + 'id', key);
        call('LMSSetValue', p + 'type', 'choice');
        call('LMSSetValue', p + 'student_response', String(choice));
        call('LMSSetValue', p + 'result', isRight ? 'correct' : 'wrong');
      }
      if (answered >= total && total > 0) {
        if (live) {
          call('LMSSetValue', 'cmi.core.score.min', '0');
          call('LMSSetValue', 'cmi.core.score.max', '100');
          call('LMSSetValue', 'cmi.core.score.raw', String(Math.round((100 * correct) / total)));
          call('LMSSetValue', 'cmi.core.lesson_status', 'completed');
          call('LMSCommit', '');
        }
        return true;
      }
      if (live) call('LMSCommit', '');
      return false;
    },
    finish: function () {
      if (!live || finished) return; finished = true;
      call('LMSSetValue', 'cmi.core.session_time', span(Date.now() - started));
      call('LMSSetValue', 'cmi.core.exit', '');
      call('LMSCommit', ''); call('LMSFinish', '');
    },
    span: span
  };
  w.addEventListener('pagehide', M.finish);
  w.addEventListener('beforeunload', M.finish);
})(window);
`

const WIRING = `
(function (d, M) {
  var lms = d.getElementById('lms');
  if (!M.live()) lms.hidden = false;
  var checks = d.querySelectorAll('.kc');
  M.setTotal(checks.length);
  Array.prototype.forEach.call(checks, function (kc) {
    var btns = kc.querySelectorAll('.opt');
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function () {
        var right = b.getAttribute('data-correct') === '1';
        Array.prototype.forEach.call(btns, function (x) { x.disabled = true; if (x.getAttribute('data-correct') === '1') x.classList.add('right'); });
        if (!right) b.classList.add('wrong');
        var fb = b.parentNode.querySelector('.fb'), v = d.createElement('span');
        v.className = 'verdict'; v.textContent = kc.getAttribute(right ? 'data-right' : 'data-wrong');
        fb.insertBefore(v, fb.firstChild); fb.hidden = false; fb.setAttribute('role', 'status');
        kc.querySelector('.why').hidden = false;
        if (M.answer(kc.getAttribute('data-key'), b.getAttribute('data-i'), right)) d.getElementById('done').hidden = false;
      });
    });
  });
  Array.prototype.forEach.call(d.querySelectorAll('.dec'), function (b) {
    b.addEventListener('click', function () { b.parentNode.querySelector('.fb').hidden = false; b.setAttribute('aria-expanded', 'true'); });
  });
})(document, window.MasarScorm);
`

export function buildScorm(lessonJson: unknown, itemsJson: unknown, loc: ScormLocale): ScormResult {
  const lesson = LessonDoc.parse(lessonJson)
  const items = new Map(readItems(itemsJson).map((i) => [i.key, i]))
  const t = T[loc]
  const skipped: string[] = []
  const title = loc === 'ar' ? lesson.titleAr : lesson.titleEn
  const code = String(lesson.objectives[0] ?? lesson.slug).toLowerCase()

  const levels = (['l1', 'l2', 'l3'] as const)
    .filter((k) => lesson.blocks[k]?.length)
    .map(
      (k) =>
        `<p class="level">${t[k]}</p>\n${lesson.blocks[k]!.map((b) => renderBlock(b, loc, items, skipped)).join('\n')}`,
    )
    .join('\n')
  const checks = (levels.match(/class="kc"/g) ?? []).length

  const html = `<!doctype html>
<html lang="${loc}" dir="${loc === 'ar' ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>${CSS}</style></head>
<body><main>
<p id="lms" hidden>${t.preview}</p>
<h1>${esc(title)}</h1>
<p class="meta">${lesson.estMinutes} ${t.minutes} · ${esc(lesson.objectives.join(', '))}</p>
${levels}
<p id="done" class="card" hidden>${t.done}</p>
</main>
<script>${RUNTIME}</script>
<script>${WIRING}</script>
</body></html>
`

  const id = `masar-${code}-${loc}`
  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${id}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
  <organizations default="org-${id}">
    <organization identifier="org-${id}">
      <title>${esc(title)}</title>
      <item identifier="item-${id}" identifierref="res-${id}" isvisible="true">
        <title>${esc(title)}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res-${id}" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>
`
  return {
    // imsmanifest.xml first and at the root: some LMSs only look there.
    files: [
      { name: 'imsmanifest.xml', data: Buffer.from(manifest, 'utf-8') },
      { name: 'index.html', data: Buffer.from(html, 'utf-8') },
    ],
    skipped,
    checks,
  }
}

/**
 * A stored (uncompressed) zip. The package is two small text files, so
 * compression buys nothing and this avoids a dependency. Fixed DOS time
 * (1980-01-01) keeps the bytes the same for the same input.
 */
export function zipStore(files: ScormFile[]): Buffer {
  const locals: Buffer[] = []
  const centrals: Buffer[] = []
  let offset = 0
  for (const f of files) {
    const name = Buffer.from(f.name, 'utf-8')
    const crc = crc32(f.data) >>> 0
    const lh = Buffer.alloc(30)
    lh.writeUInt32LE(0x04034b50, 0)
    lh.writeUInt16LE(20, 4) // version needed
    lh.writeUInt16LE(0x0800, 6) // UTF-8 names
    lh.writeUInt16LE(0, 8) // stored
    lh.writeUInt16LE(0, 10) // time
    lh.writeUInt16LE(0x21, 12) // date 1980-01-01
    lh.writeUInt32LE(crc, 14)
    lh.writeUInt32LE(f.data.length, 18)
    lh.writeUInt32LE(f.data.length, 22)
    lh.writeUInt16LE(name.length, 26)
    lh.writeUInt16LE(0, 28)
    locals.push(lh, name, f.data)

    const ch = Buffer.alloc(46)
    ch.writeUInt32LE(0x02014b50, 0)
    ch.writeUInt16LE(20, 4)
    ch.writeUInt16LE(20, 6)
    ch.writeUInt16LE(0x0800, 8)
    ch.writeUInt16LE(0, 10)
    ch.writeUInt16LE(0, 12)
    ch.writeUInt16LE(0x21, 14)
    ch.writeUInt32LE(crc, 16)
    ch.writeUInt32LE(f.data.length, 20)
    ch.writeUInt32LE(f.data.length, 24)
    ch.writeUInt16LE(name.length, 28)
    ch.writeUInt32LE(offset, 42)
    centrals.push(ch, name)
    offset += 30 + name.length + f.data.length
  }
  const cd = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(cd.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, cd, end])
}
