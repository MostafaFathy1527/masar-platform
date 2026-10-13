"""The three Masār quality gates, callable from any UI.

Pure functions over the files in this folder. `app.py` wraps them in Gradio for a
local run; `index.html` (built by build_static.py) calls them from Pyodide in the
browser. Neither UI holds any gate logic of its own, so the two cannot drift.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent if "__file__" in globals() else Path.cwd()
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import concept_log  # noqa: E402
import qa_gate  # noqa: E402
import validate  # noqa: E402

SCHEMA = json.loads((HERE / "lesson.schema.json").read_text(encoding="utf-8"))


# ----------------------------------------------------------------- samples


def course_lessons() -> list[Path]:
    """Authored course lessons, in the order a learner meets them."""
    paths = sorted(HERE.glob("sample__course__*__*.json"))
    return sorted(paths, key=lambda p: concept_log.lesson_order(Path(p.name.split("__")[-1])))


def sample_lessons() -> dict[str, Path]:
    out: dict[str, Path] = {}
    for p in course_lessons():
        _, _, course, fname = p.name.split("__", 3)
        out[f"course · {course} · {Path(fname).stem}"] = p
    for p in sorted(HERE.glob("sample__draft__*__lesson.json")):
        out[f"pipeline draft · {p.name.split('__')[2]}"] = p
    return out


def sample_verdicts() -> dict[str, Path]:
    return {f"pipeline draft · {p.name.split('__')[2]}": p
            for p in sorted(HERE.glob("sample__draft__*__verdict.json"))}


def lesson_for_verdict(vpath: Path) -> Path:
    return vpath.with_name(vpath.name.replace("__verdict.json", "__lesson.json"))


LESSONS = sample_lessons()
VERDICTS = sample_verdicts()


def read_sample(choice: str) -> str:
    return LESSONS[choice].read_text(encoding="utf-8") if choice in LESSONS else ""


def read_verdict_sample(choice: str) -> tuple[str, str]:
    if choice not in VERDICTS:
        return "", ""
    v = VERDICTS[choice]
    lesson = lesson_for_verdict(v)
    return v.read_text(encoding="utf-8"), lesson.read_text(encoding="utf-8") if lesson.exists() else ""


# ----------------------------------------------------------------- validator


def run_validator(choice: str, pasted: str) -> dict:
    """Returns {"summary": markdown, "rows": [[rule, finding], ...]}."""
    if pasted.strip():
        raw = pasted
        name = choice if choice in LESSONS and pasted == read_sample(choice) else "pasted lesson"
    elif choice in LESSONS:
        name, raw = choice, LESSONS[choice].read_text(encoding="utf-8")
    else:
        return {"summary": "Pick a sample or paste a lesson JSON.", "rows": []}

    try:
        doc = json.loads(raw)
    except json.JSONDecodeError as e:
        return {"summary": f"**FAIL** — not valid JSON: `{e}`", "rows": []}

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
        stopped = (" Semantic rules were skipped because structure failed."
                   if layer == "structure" and any(f.rule == "structure" for f in findings) else "")
        summary = f"**FAIL** — {len(findings)} finding(s).{stopped}"
    return {"summary": summary, "rows": [[f.rule, f.message] for f in findings]}


# ----------------------------------------------------------------- concept log


def run_concept_log() -> dict:
    """Returns {"summary": markdown, "rows": [[lesson, rule, finding], ...]}."""
    lessons = [(Path(p.name.split("__")[-1]), json.loads(p.read_text(encoding="utf-8")))
               for p in course_lessons()]
    findings = concept_log.check(lessons)
    order = "\n".join(f"{i + 1}. `{p.name}`" for i, (p, _) in enumerate(lessons))
    if not findings:
        head = f"**PASS** — {len(lessons)} lessons, no re-definitions and no forward references."
    else:
        head = f"**FAIL** — {len(findings)} finding(s) across {len(lessons)} lessons."
    return {"summary": head + "\n\nLesson order checked:\n\n" + order,
            "rows": [[Path(f.file).name, f.rule, f.message] for f in findings]}


# ----------------------------------------------------------------- rubric gate


def run_gate(choice: str, pasted_verdict: str, pasted_lesson: str) -> dict:
    """Returns {"report": markdown, "result": json-string-or-empty}."""
    try:
        if pasted_verdict.strip():
            verdict_doc = json.loads(pasted_verdict)
            lesson_doc = json.loads(pasted_lesson) if pasted_lesson.strip() else None
            if lesson_doc is None:
                return {"report": ("A verdict needs the lesson it judged, because which criteria apply "
                                   "is derived from the lesson's declared levels, never from the judge."),
                        "result": ""}
            levels = {str(x).upper() for x in lesson_doc.get("levels", [])}
            if not levels or not levels <= {"L1", "L2", "L3"}:
                raise qa_gate.GateError(f"lesson declares no usable levels: {sorted(levels) or '[]'}")
            tmp = HERE / "_pasted_verdict.json"
            tmp.write_text(json.dumps(verdict_doc), encoding="utf-8")
            try:
                verdict = qa_gate.load_verdict(tmp, levels)
            finally:
                tmp.unlink(missing_ok=True)
        elif choice in VERDICTS:
            vpath = VERDICTS[choice]
            levels = qa_gate.lesson_levels(vpath, lesson_for_verdict(vpath))
            verdict = qa_gate.load_verdict(vpath, levels)
        else:
            return {"report": "Pick a sample verdict or paste one with its lesson.", "result": ""}
    except (qa_gate.GateError, json.JSONDecodeError) as e:
        return {"report": f"**Could not run** — {e}", "result": ""}

    result = qa_gate.evaluate(verdict)
    return {"report": qa_gate.report(result),
            "result": json.dumps(result, ensure_ascii=False, indent=2)}
