# SEC-01 — pipeline run outside the medical-insurance domain

**Status: DRAFT.** Not seeded, not published, not on the site. The contract says the
pipeline may not publish; a human does. Leaving this as a draft output is the correct
end state for it, not an unfinished one.

## Why this run exists

Every other lesson in this repository is medical insurance and revenue-cycle management.
The README claims the method is not tied to that domain. That claim was worth nothing
until the pipeline had actually been pointed at something else, so it was — at a subject
chosen to be about as far from claims adjudication as a corporate training topic gets.

- **Source note:** [`pipeline/sources/sec-01-recognising-a-phishing-email.md`](../../../sources/sec-01-recognising-a-phishing-email.md)
- **Objective:** SEC-01 — given an email, identify the signals that distinguish a phishing
  attempt from a legitimate message, and take the correct action.
- **Output:** `lesson.json` (11 blocks, L1 + L2), `items.json` (2 formative items).

## What the run found

**The validator was domain-locked and the method it enforces was not.**

`ObjectiveId` was `^MI-\d{2}$` — hardcoded to a medical-insurance prefix — in three places:
the Zod source of truth, the generated JSON Schema, and the Python mirror in
`validate.py`. The first valid lesson from outside the domain was refused by the project's
own gate, for a reason that had nothing to do with the lesson.

Fixed by treating the prefix as a course namespace: `^[A-Z]{2,4}-\d{2}$`, changed in
`lib/schema/lesson.ts`, regenerated into the JSON Schema, and mirrored in `validate.py`.
`MI-04` still validates; `SEC-01` now does too.

This is the kind of thing that only surfaces by running the thing rather than describing
it. A gate that has only ever seen one domain is not a general gate — it is a gate shaped
like its first input.

## Gate results

| Gate | Result |
|---|---|
| `validate.py` | PASS — no findings |
| `concept_log.py --check` | PASS — 5 lessons, no collisions |
| `test_validate.py` | 18/18 |
| `test_concept_log.py` | 6/6 |
| `test_qa_gate.py` | 20/20 |
| `npm run check` | 134/134, including the schema drift test |

**`qa_gate.py`: run on 14 October 2026 by three independent judges; the panel sends a split to a human — see below.**

## What is genuinely different from the RCM lessons

- **`bilingual: true` with real Arabic.** The five course lessons are English-only and
  declare it. This one carries independently written Arabic, so it exercises
  `check_bilingual_honesty` for the first time against content that should pass rather
  than content that should fail.
- **A new concept namespace** — `display_name`, `look_alike_domain`, `link_destination`,
  `one_time_code`, `engineered_urgency`. No collision with the RCM concept log.

## Limitations, stated rather than left to be found

- One lesson is evidence that the pipeline is not *locked* to one domain. It is not
  evidence that it produces good content in any domain. That would need more runs and a
  judge that did not write the lesson.
- The content is authored from public knowledge about phishing. It is training material,
  not a security policy, and it names no product, organisation or real incident.

## Rubric gate, re-run 14 October 2026 with the items visible

Scored by three judges from three model families, each in a fresh context that saw the
judge prompt, the rubric, this lesson and the items its knowledge checks reference
(`pipeline/judge_bedrock.py`), then passed through `qa_gate.py` unchanged. Files beside
this one: `verdict.<tag>.json`, `qa-report.<tag>.md`, `panel-report.md`.

| Judge | Mean | Criteria scored | Knowledge checks | Gate |
|---|---|---|---|---|
| us.meta.llama3-3-70b-instruct-v1:0 | 5.00 | 8 | 5 | PASS |
| amazon.nova-pro-v1:0 | 4.88 | 8 | 4 | PASS |
| qwen.qwen3-32b-v1:0 | 4.75 | 8 | 3 | PASS |

**Panel decision: NEEDS HUMAN.** Every judge passes the lesson, but they differ by more than one point on knowledge check, and the panel sends any split to a human rather than averaging it.

The earlier scoring the same day showed the judges the lesson only. A knowledge-check
block carries just a reference to its item, so those knowledge-check scores were given
without the question, options or feedback (failure entry 17). They are replaced here;
git history keeps them.

The split has the same shape on all four samples (5, 4 and 3, always from the same
three judges), which says more about the judges than about these items. That is for the
human reviewer to settle. Agreement or disagreement between models is not a human
review; the blind inter-rater sample is still the open item.
