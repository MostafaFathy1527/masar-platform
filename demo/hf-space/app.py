"""Masār quality gates — Gradio front end for a local run.

Three checks the content pipeline applies before a lesson may be published.
Nothing here calls a model: the validator and the concept log are pure rules,
and the rubric gate consumes a judge's verdict that was produced elsewhere.
That split is deliberate and is explained on each tab.
"""

from __future__ import annotations

import sys

import gradio as gr

from gates_core import (LESSONS, VERDICTS, read_sample, read_verdict_sample,
                        run_concept_log as _concept_log, run_gate as _gate,
                        run_validator as _validator)

REPO = "https://github.com/MostafaFathy1527/masar-platform"
SITE = "https://masar.mostafafathy.com"


def run_validator(choice: str, pasted: str):
    r = _validator(choice, pasted)
    return r["summary"], r["rows"]


def run_concept_log():
    r = _concept_log()
    return r["summary"], r["rows"]


def run_gate(choice: str, pasted_verdict: str, pasted_lesson: str):
    r = _gate(choice, pasted_verdict, pasted_lesson)
    return r["report"], r["result"]


load_sample = read_sample
load_verdict_sample = read_verdict_sample


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

if __name__ == "__main__" or sys.platform == "emscripten":
    demo.launch()
