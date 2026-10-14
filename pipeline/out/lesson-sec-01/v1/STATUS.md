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

**`qa_gate.py`: run on 14 October 2026 by the calibrated judge panel, and again on 15 October after one judge was replaced — see below.**

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

## Rubric gate: the calibrated panel, 15 October 2026

Scored by the three judges that passed `pipeline/calibrate_judges.py`: shown this lesson's
real items and copies broken in ways the rubric names, each scored the broken copies at
least two points lower. Each judge saw the judge prompt, the rubric, this lesson and the
items its knowledge checks reference, in a fresh context, and its verdict went through
`qa_gate.py` unchanged. Files beside this one: `verdict.<tag>.json`, `qa-report.<tag>.md`,
`panel-report.md`.

| Judge | Mean | Criteria scored | Knowledge checks | Gate |
|---|---|---|---|---|
| deepseek.v3.2 | 5.00 | 8 | 5 | PASS |
| us.moonshotai.kimi-k3 | 4.38 | 8 | 5 | PASS |
| zai.glm-5 | 5.00 | 8 | 5 | PASS |

**Panel decision: PASS.** Every judge passes the lesson and no criterion splits them by more than one point.

Earlier the same day this lesson was scored by Qwen3-32B, Llama 3.3 70B and Nova Pro. In
calibration those three caught 0, 1 and 0 of 8 planted knowledge-check defects, so their
knowledge-check scores carried no information and they were retired from the panel
(failure entry 18). Their verdicts are kept in `retired-judges/`.

On 15 October Kimi K3 replaced Kimi K2.5 on the panel: in calibration it was at least as
good on every defect, and with GLM-5 it is one of two judges that catch English pasted into
Arabic fields. It refuses a fixed temperature, so it runs at its own default and its verdict
records that. K2.5's verdict on this lesson is kept in `retired-judges/`.

The panel is calibrated on knowledge checks and worked examples, and two of its three judges
also on English pasted into Arabic fields. No judge is calibrated on scenario consequences or
on Arabic quality more generally, so scores there are reported, not relied on; `validate.py`
guards the mechanical half of both. Calibrated models agreeing is still not a human review;
the blind inter-rater sample is still the open item.
