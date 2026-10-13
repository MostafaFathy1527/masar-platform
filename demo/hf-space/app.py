"""Masār quality gates, runnable in a browser.

Three checks the content pipeline applies before a lesson may be published.
Nothing here calls a model: the validator and the concept log are pure rules,
and the rubric gate consumes a judge's verdict that was produced elsewhere.
That split is deliberate and is explained on each tab.
"""

from __future__ import annotations

import io
import json
import sys
from pathlib import Path

import gradio as gr

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / "pipeline"))

import concept_log  # noqa: E402
import qa_gate  # noqa: E402
import validate  # noqa: E402

SCHEMA = json.loads((HERE / "pipeline" / "lesson.schema.json").read_text(encoding="utf-8"))
COURSES = HERE / "samples" / "courses"
DRAFTS = HERE / "samples" / "drafts"

REPO = "https://github.com/MostafaFathy1527/masar-platform"
SITE = "https://masar.mostafafathy.com"


# ----------------------------------------------------------------- samples


def sample_lessons() -> dict[str, Path]:
    out: dict[str, Path] = {}
    for p in sorted(COURSES.glob("*/*.json")):
        out[f"course · {p.parent.name} · {p.stem}"] = p
    for p in sorted(DRAFTS.glob("*/lesson.json")):
        out[f"pipeline draft · {p.parent.name}"] = p
    return out


def sample_verdicts() -> dict[str, Path]:
    return {f"pipeline draft · {p.parent.name}": p for p in sorted(DRAFTS.glob("*/verdict.json"))}


LESSONS = sample_lessons()
VERDICTS = sample_verdicts()


# ----------------------------------------------------------------- validator


def run_validator(choice: str, pasted: str):
    if pasted.strip():
        name, raw = "pasted lesson", pasted
    elif choice in LESSONS:
        name, raw = choice, LESSONS[choice].read_text(encoding="utf-8")
    else:
        return "Pick a sample or paste a lesson JSON.", raw_rows([])

    try:
        doc = json.loads(raw)
    except json.JSONDecodeError as e:
        return f"**FAIL** — not valid JSON: `{e}`", raw_rows([])

    findings = validate.check_structure(doc, SCHEMA, name)
    layer = "structure"
    if not findings:
        findings += validate.check_semantics(doc, name)
        layer = "semantics"
    findings += validate.check_content(doc, name, [])

    if not findings:
        summary = (
            f"**PASS** — `{name}` survived all three layers "
            "(structure, semantics, content). Name denylist: none loaded on this Space, "
            "so that part of layer 3 is skipped and this run proves less than a local one."
        )
    else:
        stopped = " Semantic rules were skipped because structure failed." if layer == "structure" and any(
            f.rule == "structure" for f in findings) else ""
        summary = f"**FAIL** — {len(findings)} finding(s).{stopped}"
    return summary, raw_rows(findings)


def raw_rows(findings) -> list[list[str]]:
    return [[f.rule, f.message] for f in findings]


def load_sample(choice: str) -> str:
    if choice in LESSONS:
        return LESSONS[choice].read_text(encoding="utf-8")
    return ""


# ----------------------------------------------------------------- concept log


def run_concept_log():
    paths = sorted(COURSES.glob("*/*.json"), key=concept_log.lesson_order)
    lessons = [(p, json.loads(p.read_text(encoding="utf-8"))) for p in paths]
    findings = concept_log.check(lessons)
    order = "\n".join(f"{i+1}. `{p.parent.name}/{p.name}`" for i, (p, _) in enumerate(lessons))
    if not findings:
        head = f"**PASS** — {len(lessons)} lessons, no re-definitions and no forward references."
    else:
        head = f"**FAIL** — {len(findings)} finding(s) across {len(lessons)} lessons."
    rows = [[Path(f.file).name, f.rule, f.message] for f in findings]
    return head + "\n\nLesson order checked:\n" + order, rows


# ----------------------------------------------------------------- rubric gate


def run_gate(choice: str, pasted_verdict: str, pasted_lesson: str):
    try:
        if pasted_verdict.strip():
            verdict_doc = json.loads(pasted_verdict)
            lesson_doc = json.loads(pasted_lesson) if pasted_lesson.strip() else None
            if lesson_doc is None:
                return ("A verdict needs the lesson it judged, because which criteria apply "
                        "is derived from the lesson's declared levels, never from the judge."), ""
            levels = {str(x).upper() for x in lesson_doc.get("levels", [])}
            if not levels or not levels <= {"L1", "L2", "L3"}:
                raise qa_gate.GateError(f"lesson declares no usable levels: {sorted(levels) or '[]'}")
            tmp = HERE / "_pasted_verdict.json"
            io.open(tmp, "w", encoding="utf-8").write(json.dumps(verdict_doc))
            try:
                verdict = qa_gate.load_verdict(tmp, levels)
            finally:
                tmp.unlink(missing_ok=True)
        elif choice in VERDICTS:
            vpath = VERDICTS[choice]
            levels = qa_gate.lesson_levels(vpath, None)
            verdict = qa_gate.load_verdict(vpath, levels)
        else:
            return "Pick a sample verdict or paste one with its lesson.", ""
    except (qa_gate.GateError, json.JSONDecodeError) as e:
        return f"**Could not run** — {e}", ""

    result = qa_gate.evaluate(verdict)
    return qa_gate.report(result), json.dumps(result, ensure_ascii=False, indent=2)


def load_verdict_sample(choice: str):
    if choice in VERDICTS:
        v = VERDICTS[choice]
        lesson = v.parent / "lesson.json"
        return v.read_text(encoding="utf-8"), lesson.read_text(encoding="utf-8") if lesson.exists() else ""
    return "", ""


# ----------------------------------------------------------------- ui

INTRO = f"""
# Masār — the quality gates, live

[Masār]({SITE}) is an open-source, practice-first learning platform. Its content pipeline
produces Arabic/English lessons and **refuses to publish any lesson until it passes three gates**.
This Space runs those gates on the real lesson files from the repository, or on anything you paste.

| Gate | Refuses |
|---|---|
| `validate.py` | schema violations, a lesson claiming bilingual support while repeating its English, forbidden real-world code sets |
| `concept_log.py` | a lesson that re-teaches a concept an earlier lesson introduced, or uses one before it is taught |
| `qa_gate.py` | a judge's verdict below the rubric thresholds (mean ≥ 4.0, every criterion ≥ 3) |

No model is called on this page. The judge that produces a verdict runs separately and never sees the
generation prompt; the gate only applies thresholds that live in version control. Source, tests and the
public record of what failed while building this: [{REPO.replace('https://', '')}]({REPO}).
"""

with gr.Blocks(title="Masār quality gates") as demo:
    gr.Markdown(INTRO)

    with gr.Tab("1 · Validator"):
        gr.Markdown(
            "Three layers, deliberately separated: **structure** (JSON Schema generated from the "
            "renderer's Zod schema), **semantics** (level completeness, prose budget between acting "
            "blocks, objective references), **content** (forbidden licensed code sets). "
            "Try a sample, then break it: delete a level's blocks, paste English into an Arabic field, "
            "or add a real CPT code."
        )
        choice = gr.Dropdown(list(LESSONS), label="Sample lesson", value=next(iter(LESSONS), None))
        pasted = gr.Code(label="Lesson JSON (edit or paste; takes precedence over the sample)", language="json", lines=18)
        choice.change(load_sample, choice, pasted)
        run = gr.Button("Run validator", variant="primary")
        summary = gr.Markdown()
        table = gr.Dataframe(headers=["rule", "finding"], datatype=["str", "str"], wrap=True)
        run.click(run_validator, [choice, pasted], [summary, table])
        demo.load(load_sample, choice, pasted)

    with gr.Tab("2 · Concept log"):
        gr.Markdown(
            "A course-level invariant no editor can hold in their head: across the authored course, "
            "each concept may be *introduced* once, by the earliest lesson, and only *recalled* or "
            "*applied* afterwards. Checked mechanically over every lesson in sequence."
        )
        run2 = gr.Button("Check the course", variant="primary")
        out2 = gr.Markdown()
        table2 = gr.Dataframe(headers=["lesson", "rule", "finding"], datatype=["str", "str", "str"], wrap=True)
        run2.click(run_concept_log, None, [out2, table2])

    with gr.Tab("3 · Rubric gate"):
        gr.Markdown(
            "The judge scores a draft against the instructional-design rubric in a fresh context. "
            "This gate consumes that verdict and applies the thresholds. Which criteria *apply* is "
            "derived from the lesson's declared levels, never from the judge, so a judge cannot "
            "excuse itself from a criterion. Paste your own verdict to see it accepted or refused."
        )
        vchoice = gr.Dropdown(list(VERDICTS), label="Sample verdict", value=next(iter(VERDICTS), None))
        with gr.Row():
            vpasted = gr.Code(label="Verdict JSON", language="json", lines=16)
            lpasted = gr.Code(label="Lesson JSON it judged (for declared levels)", language="json", lines=16)
        vchoice.change(load_verdict_sample, vchoice, [vpasted, lpasted])
        run3 = gr.Button("Apply the gate", variant="primary")
        report3 = gr.Markdown()
        raw3 = gr.Code(label="Result object", language="json")
        run3.click(run_gate, [vchoice, vpasted, lpasted], [report3, raw3])
        demo.load(load_verdict_sample, vchoice, [vpasted, lpasted])

    gr.Markdown(
        "Built by Mostafa Fathy, Alexandria. The demo course (medical insurance claims) is a test "
        "fixture: every code, payer, clinic and patient in it is fictional. The pipeline was also run on an "
        "unrelated topic (recognising a phishing email) to check the method is not shaped like its first input."
    )

if __name__ == "__main__":
    demo.launch()
