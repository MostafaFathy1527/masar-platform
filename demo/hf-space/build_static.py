#!/usr/bin/env python3
"""Emit index.html: the whole Space as one static page that runs Python in the browser.

Hugging Face serves Static Spaces for free; Gradio Spaces need a paid plan, and
Gradio-Lite (Gradio on Pyodide) currently fails at start-up because its worker
mocks `os.link` in a way the newest `filelock` rejects. So the page loads Pyodide
directly, mounts the gate scripts and the sample files, and drives `gates_core`
from a small hand-written UI. No Gradio in the browser, no server anywhere.

Run after sync.py, from anywhere:

    python demo/hf-space/build_static.py
"""

from __future__ import annotations

import base64
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent

CODE = ["gates_core.py", "validate.py", "concept_log.py", "qa_gate.py"]
DATA = ["lesson.schema.json"] + sorted(p.name for p in HERE.glob("sample__*"))

PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.27.3/full/"
MARKED = "https://cdnjs.cloudflare.com/ajax/libs/marked/15.0.7/marked.min.js"

REPO = "https://github.com/MostafaFathy1527/masar-platform"
SITE = "https://masar.mostafafathy.com"

PAGE = r"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Masār quality gates</title>
  <meta name="description" content="The three gates a lesson must pass before Masār publishes it, running in your browser on the real lesson files." />
  <script src="__PYODIDE__pyodide.js"></script>
  <script src="__MARKED__"></script>
  <style>
    :root {
      --bg: #f7f5f0; --surface: #ffffff; --ink: #1f1b16; --muted: #6b645a; --line: #e4dfd5;
      --accent: #8a5a19; --accent-ink: #ffffff; --pass: #1f6f43; --fail: #a23b2a; --code-bg: #f1ede4;
      --radius: 10px;
    }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        --bg: #17150f; --surface: #211e17; --ink: #f1ece2; --muted: #a79e90; --line: #3a352c;
        --accent: #d9a24a; --accent-ink: #1a1408; --pass: #6fc48f; --fail: #f08a79; --code-bg: #2a261e;
      }
    }
    :root[data-theme="dark"] {
      --bg: #17150f; --surface: #211e17; --ink: #f1ece2; --muted: #a79e90; --line: #3a352c;
      --accent: #d9a24a; --accent-ink: #1a1408; --pass: #6fc48f; --fail: #f08a79; --code-bg: #2a261e;
    }
    * { box-sizing: border-box; }
    html { font-size: 16px; }
    body { margin: 0; background: var(--bg); color: var(--ink); font: 1rem/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
    main { max-width: 1040px; margin: 0 auto; padding: 24px 16px 64px; }
    h1 { font-size: 1.75rem; line-height: 1.2; margin: 0 0 8px; letter-spacing: -0.01em; }
    h1 small { display: block; font-size: 1rem; font-weight: 400; color: var(--muted); margin-top: 6px; }
    p { margin: 0 0 12px; }
    a { color: var(--accent); }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.92em; background: var(--code-bg); padding: 1px 5px; border-radius: 4px; }
    pre { background: var(--code-bg); padding: 12px; border-radius: var(--radius); overflow: auto; font-size: 0.85rem; line-height: 1.45; }
    table { border-collapse: collapse; width: 100%; font-size: 0.93rem; }
    th, td { text-align: start; padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
    th { color: var(--muted); font-weight: 600; }
    .intro table { margin: 12px 0 16px; }
    .intro td:first-child { white-space: nowrap; }

    #status { display: flex; gap: 10px; align-items: center; padding: 10px 14px; border: 1px solid var(--line); background: var(--surface); border-radius: var(--radius); margin: 16px 0; color: var(--muted); font-size: 0.93rem; }
    #status[data-state="ready"] { color: var(--pass); }
    #status[data-state="error"] { color: var(--fail); }
    .spinner { width: 14px; height: 14px; border: 2px solid var(--line); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.9s linear infinite; flex: none; }
    #status[data-state="ready"] .spinner, #status[data-state="error"] .spinner { display: none; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }

    .tabs { display: flex; gap: 6px; border-bottom: 1px solid var(--line); margin: 20px 0 16px; overflow-x: auto; }
    .tabs button { appearance: none; background: none; border: 0; border-bottom: 3px solid transparent; padding: 10px 14px; min-height: 44px; font: inherit; font-weight: 600; color: var(--muted); cursor: pointer; white-space: nowrap; }
    .tabs button[aria-selected="true"] { color: var(--ink); border-bottom-color: var(--accent); }
    .tabs button:focus-visible, button:focus-visible, select:focus-visible, textarea:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
    section[role="tabpanel"] { display: none; }
    section[role="tabpanel"].active { display: block; }

    .panel { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; }
    .panel + .panel { margin-top: 12px; }
    label { display: block; font-weight: 600; font-size: 0.93rem; margin: 0 0 6px; }
    select, textarea { width: 100%; font: inherit; color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 10px; }
    textarea { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.85rem; line-height: 1.45; min-height: 260px; resize: vertical; }
    .row { display: grid; gap: 12px; grid-template-columns: 1fr; }
    @media (min-width: 760px) { .row.two { grid-template-columns: 1fr 1fr; } }
    .field { margin-bottom: 12px; }
    .hint { color: var(--muted); font-size: 0.88rem; margin-top: 4px; }
    .run { appearance: none; border: 0; border-radius: 8px; background: var(--accent); color: var(--accent-ink); font: inherit; font-weight: 700; padding: 11px 18px; min-height: 44px; cursor: pointer; }
    .run[disabled] { opacity: 0.5; cursor: not-allowed; }
    .out { margin-top: 16px; }
    .out:empty { display: none; }
    .out h1 { font-size: 1.2rem; }
    .verdict-pass strong:first-child { color: var(--pass); }
    .verdict-fail strong:first-child { color: var(--fail); }
    blockquote { margin: 8px 0; padding: 4px 12px; border-inline-start: 3px solid var(--line); color: var(--muted); }
    footer { margin-top: 32px; color: var(--muted); font-size: 0.9rem; border-top: 1px solid var(--line); padding-top: 16px; }
  </style>
</head>
<body>
<main>
  <header>
    <h1>Masār — the quality gates, live
      <small>Three checks a lesson must pass before <a href="__SITE__">Masār</a> publishes it. They run here, in your browser, on the real files from the repository.</small>
    </h1>
  </header>

  <div class="intro">
    <table>
      <thead><tr><th>Gate</th><th>Refuses</th></tr></thead>
      <tbody>
        <tr><td><code>validate.py</code></td><td>schema violations, a lesson claiming bilingual support while repeating its English, forbidden real-world code sets</td></tr>
        <tr><td><code>concept_log.py</code></td><td>a lesson that re-teaches a concept an earlier lesson introduced, or uses one before it is taught</td></tr>
        <tr><td><code>qa_gate.py</code></td><td>a judge's verdict below the rubric thresholds (mean ≥ 4.0, every criterion ≥ 3)</td></tr>
      </tbody>
    </table>
    <p>No model is called on this page. The judge that produces a verdict runs separately and never sees the generation prompt; the gate only applies thresholds that live in version control. Source, tests and the public record of what failed while building this: <a href="__REPO__">__REPO_SHORT__</a>.</p>
  </div>

  <div id="status" role="status" aria-live="polite" data-state="loading"><span class="spinner" aria-hidden="true"></span><span id="status-text">Loading Python in your browser (Pyodide, about 10 MB). Nothing is sent to a server.</span></div>

  <div class="tabs" role="tablist" aria-label="Gates">
    <button role="tab" aria-selected="true" aria-controls="tab-validate" id="tabbtn-validate">1 · Validator</button>
    <button role="tab" aria-selected="false" aria-controls="tab-concepts" id="tabbtn-concepts">2 · Concept log</button>
    <button role="tab" aria-selected="false" aria-controls="tab-gate" id="tabbtn-gate">3 · Rubric gate</button>
  </div>

  <section role="tabpanel" id="tab-validate" aria-labelledby="tabbtn-validate" class="active">
    <div class="panel">
      <p>Three layers, deliberately separated: <strong>structure</strong> (JSON Schema generated from the renderer's Zod schema), <strong>semantics</strong> (level completeness, prose budget between acting blocks, objective references), <strong>content</strong> (forbidden licensed code sets). Try a sample, then break it: delete a level's blocks, paste English into an Arabic field, or add a real CPT code.</p>
      <div class="field">
        <label for="v-choice">Sample lesson</label>
        <select id="v-choice" disabled><option>loading…</option></select>
      </div>
      <div class="field">
        <label for="v-text">Lesson JSON (edit or paste; this box is what gets checked)</label>
        <textarea id="v-text" spellcheck="false" disabled></textarea>
      </div>
      <button class="run" id="v-run" disabled>Run validator</button>
      <div class="out" id="v-out"></div>
    </div>
  </section>

  <section role="tabpanel" id="tab-concepts" aria-labelledby="tabbtn-concepts">
    <div class="panel">
      <p>A course-level invariant no editor can hold in their head: across the authored course, each concept may be <em>introduced</em> once, by the earliest lesson, and only <em>recalled</em> or <em>applied</em> afterwards. Checked mechanically over every lesson in sequence.</p>
      <button class="run" id="c-run" disabled>Check the course</button>
      <div class="out" id="c-out"></div>
    </div>
  </section>

  <section role="tabpanel" id="tab-gate" aria-labelledby="tabbtn-gate">
    <div class="panel">
      <p>The judge scores a draft against the instructional-design rubric in a fresh context. This gate consumes that verdict and applies the thresholds. Which criteria <em>apply</em> is derived from the lesson's declared levels, never from the judge, so a judge cannot excuse itself from a criterion. Edit the verdict's scores to see it accepted or refused.</p>
      <div class="field">
        <label for="g-choice">Sample verdict</label>
        <select id="g-choice" disabled><option>loading…</option></select>
      </div>
      <div class="row two">
        <div class="field">
          <label for="g-verdict">Verdict JSON</label>
          <textarea id="g-verdict" spellcheck="false" disabled></textarea>
        </div>
        <div class="field">
          <label for="g-lesson">Lesson JSON it judged (for declared levels)</label>
          <textarea id="g-lesson" spellcheck="false" disabled></textarea>
        </div>
      </div>
      <button class="run" id="g-run" disabled>Apply the gate</button>
      <div class="out" id="g-out"></div>
      <div class="out" id="g-raw"></div>
    </div>
  </section>

  <footer>
    Built by Mostafa Fathy, Alexandria. The demo course (medical insurance claims) is a test fixture: every code, payer, clinic and patient in it is fictional. The pipeline was also run on an unrelated topic (recognising a phishing email) to check the method is not shaped like its first input. The name denylist that the local validator also applies is not loaded here, so a PASS on this page proves slightly less than a local one.
  </footer>
</main>

<script type="text/plain" id="space-files">__FILES__</script>
<script>
(async function () {
  const $ = (id) => document.getElementById(id);
  const status = $("status"), statusText = $("status-text");
  const setStatus = (state, text) => { status.dataset.state = state; statusText.textContent = text; };
  const md = (s) => window.marked ? marked.parse(s) : "<pre>" + s.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])) + "</pre>";
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const table = (headers, rows) => rows.length
    ? "<table><thead><tr>" + headers.map(h => "<th>" + esc(h) + "</th>").join("") + "</tr></thead><tbody>"
      + rows.map(r => "<tr>" + r.map(c => "<td>" + esc(c) + "</td>").join("") + "</tr>").join("") + "</tbody></table>"
    : "";
  const verdictClass = (s) => s.startsWith("**PASS") ? "verdict-pass" : (s.startsWith("**FAIL") || s.startsWith("**Could") ? "verdict-fail" : "");

  // tabs
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const select = (btn) => {
    tabs.forEach(b => { const on = b === btn; b.setAttribute("aria-selected", on); $(b.getAttribute("aria-controls")).classList.toggle("active", on); });
    btn.focus();
  };
  tabs.forEach((b, i) => {
    b.addEventListener("click", () => select(b));
    b.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") select(tabs[(i + 1) % tabs.length]);
      if (e.key === "ArrowLeft") select(tabs[(i - 1 + tabs.length) % tabs.length]);
    });
  });

  // python
  let py;
  try {
    py = await loadPyodide({ indexURL: "__PYODIDE__" });
    setStatus("loading", "Python is up. Installing jsonschema and mounting the gate scripts…");
    await py.loadPackage(["jsonschema"]);
    const b64 = $("space-files").textContent.trim();
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const files = JSON.parse(new TextDecoder("utf-8").decode(bytes));
    py.FS.mkdirTree("/space");
    for (const [name, body] of Object.entries(files)) py.FS.writeFile("/space/" + name, body);
    py.runPython(`
import sys, os, json
os.chdir("/space")
sys.path.insert(0, "/space")
import gates_core as g
    `);
  } catch (e) {
    console.error(e);
    setStatus("error", "Could not start Python in this browser: " + (e && e.message ? e.message : e));
    return;
  }

  const call = (expr, args) => {
    for (const [k, v] of Object.entries(args || {})) py.globals.set(k, v);
    return JSON.parse(py.runPython("json.dumps(" + expr + ")"));
  };

  const lessons = call("list(g.LESSONS)");
  const verdicts = call("list(g.VERDICTS)");
  const fill = (sel, items) => { sel.innerHTML = items.map(x => "<option>" + esc(x) + "</option>").join(""); sel.disabled = false; };
  fill($("v-choice"), lessons);
  fill($("g-choice"), verdicts);

  const loadLesson = () => { $("v-text").value = call("g.read_sample(_c)", { _c: $("v-choice").value }); $("v-out").innerHTML = ""; };
  const loadVerdict = () => {
    const [v, l] = call("g.read_verdict_sample(_c)", { _c: $("g-choice").value });
    $("g-verdict").value = v; $("g-lesson").value = l; $("g-out").innerHTML = ""; $("g-raw").innerHTML = "";
  };
  $("v-choice").addEventListener("change", loadLesson);
  $("g-choice").addEventListener("change", loadVerdict);
  loadLesson(); loadVerdict();

  $("v-run").addEventListener("click", () => {
    const r = call("g.run_validator(_c, _t)", { _c: $("v-choice").value, _t: $("v-text").value });
    $("v-out").innerHTML = '<div class="' + verdictClass(r.summary) + '">' + md(r.summary) + "</div>" + table(["rule", "finding"], r.rows);
  });
  $("c-run").addEventListener("click", () => {
    const r = call("g.run_concept_log()");
    $("c-out").innerHTML = '<div class="' + verdictClass(r.summary) + '">' + md(r.summary) + "</div>" + table(["lesson", "rule", "finding"], r.rows);
  });
  $("g-run").addEventListener("click", () => {
    const r = call("g.run_gate(_c, _v, _l)", { _c: $("g-choice").value, _v: $("g-verdict").value, _l: $("g-lesson").value });
    const cls = r.report.includes("**Result: PASS**") ? "verdict-pass" : "verdict-fail";
    $("g-out").innerHTML = '<div class="' + cls + '">' + md(r.report) + "</div>";
    $("g-raw").innerHTML = r.result ? "<details><summary>Result object</summary><pre>" + esc(r.result) + "</pre></details>" : "";
  });

  ["v-text", "g-verdict", "g-lesson", "v-run", "c-run", "g-run"].forEach(id => $(id).disabled = false);
  setStatus("ready", "Ready. " + lessons.length + " sample lessons and " + verdicts.length + " verdict mounted; everything runs locally.");
})();
</script>
</body>
</html>
"""


def main() -> None:
    files = {name: (HERE / name).read_text(encoding="utf-8") for name in CODE + DATA}
    # Base64, not raw JSON: raw JSON would need "</" escaped, and its escaped
    # newlines ("e:" + backslash-n) read like drive paths to the publish gate.
    payload = base64.b64encode(json.dumps(files, ensure_ascii=False).encode("utf-8")).decode("ascii")
    page = (PAGE
            .replace("__PYODIDE__", PYODIDE)
            .replace("__MARKED__", MARKED)
            .replace("__REPO_SHORT__", REPO.replace("https://", ""))
            .replace("__REPO__", REPO)
            .replace("__SITE__", SITE)
            .replace("__FILES__", payload))
    out = HERE / "index.html"
    out.write_text(page, encoding="utf-8", newline="\n")
    print(f"wrote {out} ({out.stat().st_size // 1024} KB, {len(files)} files inlined)")


if __name__ == "__main__":
    main()
