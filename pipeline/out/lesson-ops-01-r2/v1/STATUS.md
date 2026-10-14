# OPS-01: writing a shift handover

**Status: DRAFT.** Not seeded, not published, not listed on the site. The contract says
the pipeline may not publish; a human does.

## How it was made

One command, no person in between: `pipeline/run_lesson.py` took
[`pipeline/sources/ops-01-writing-a-shift-handover.md`](../../../sources/ops-01-writing-a-shift-handover.md)
to this draft on 14 October 2026. The generator was `openai.gpt-oss-120b-1:0`, from a model
family that sits on none of the judge seats. The run record is `../run-report.md`.

| Step | Result |
|---|---|
| generate | v1, 7 concepts, 2 formative items |
| `validate.py` with the denylist | PASS |
| item check | PASS |
| `concept_log.py`, as a sixth lesson after the course | PASS |
| panel of three judges | PASS: 4.75, 4.75, 4.62; no criterion split above 1 |

The panel score is an LLM rubric score, not human QA.

## What a read found that the panel did not

One careful read of the draft against the source note, by the session that built the
runner. That is not an independent reviewer and not a subject-matter review.

1. **The first-line advice contradicts the source.** The scenario and item KC-01 teach
   that a handover's first line is "What is it?". The source says to lead with what is
   urgent. The four questions are the order within one item; urgency orders the items.
2. **An unsourced claim, undeclared.** The sort card "Supplier promised delivery tomorrow"
   is filed as a fact because "the supplier sent a written confirmation", which the source
   does not say. The generator declared no unsourced sentences.
3. **Arabic.** The job tip opens with a passive form where an instruction is meant. All
   three judges gave bilingual quality a 5.
4. **A card that is not a concept.** "Common failure" is defined as if it were a term.
   Seven definition cards in L1 is a glossary before the lesson starts.
5. Item KC-02 restates two of the sort cards word for word, so it checks recall of the
   previous block rather than the judgement.

## Before this could ship

A human fixes the five points above as v2 by hand, which then becomes the baseline. Its
objective statement is written in both languages, its items are imported in
`lib/items.ts`, and only then does it appear under /samples.
