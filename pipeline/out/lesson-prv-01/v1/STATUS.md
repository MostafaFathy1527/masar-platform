# PRV-01 — third pipeline run outside the medical-insurance domain

**Status: DRAFT.** Not seeded, not published, not on the site. The contract says the
pipeline may not publish; a human does.

## Why this run exists

Privacy awareness is among the most commonly commissioned compliance courses, and it is
usually delivered as definitions on slides. This run asks whether the pipeline can turn
the same ground into a lesson where the learner decides, case by case, whether something
is personal data and what that obliges them to do. It is the second of two sample lessons
made for the commissioning page.

- **Source note:** [`pipeline/sources/prv-01-what-counts-as-personal-data.md`](../../../sources/prv-01-what-counts-as-personal-data.md)
- **Objective:** PRV-01 — given a piece of information encountered at work, decide whether
  it is personal data, whether it is sensitive, and what handling that requires.
- **Output:** `lesson.json` (11 blocks, L1 + L2), `items.json` (2 formative items).

## Gate results

| Gate | Result |
|---|---|
| `validate.py --denylist` | PASS — no findings |
| `concept_log.py --check` | PASS — the five course lessons; the new concepts (`personal_data`, `identifiability`, `sensitive_data`, `need_to_know`, `data_subject_request`, `potential_breach`) collide with nothing in the log |
| Item references | Both `knowledge_check` blocks resolve to formative items |
| L2 prose budget | 4 words between acting blocks, against a ceiling of 180 |
| Authored answer position | Varied deliberately (positions 2 and 4) |

**`qa_gate.py`: run on 14 October 2026 by the calibrated judge panel, and again on 15 October after one judge was replaced — see below.**

## A deliberate constraint

The source note **names no law, article or regulator.** Privacy regimes differ in their
deadlines and definitions, and a lesson that quoted one would be wrong in the next
country. The lesson teaches the habits every modern regime expects of an employee —
identifiability as the test, a higher bar for sensitive data, need-to-know sharing,
same-day reporting of requests and breaches — and leaves the jurisdiction's specifics to
the buyer's own policy. A commissioned version would take that policy as a second source
note.

## Limitations, stated rather than left to be found

- "Most regimes" is as specific as the lesson gets, on purpose. It is training material,
  not legal advice, and the footer disclaimer applies.
- One lesson is a sample of the method, not evidence that it produces good content in
  every compliance topic.

## Rubric gate: the calibrated panel, 15 October 2026

Scored by the three judges that passed `pipeline/calibrate_judges.py`: shown this lesson's
real items and copies broken in ways the rubric names, each scored the broken copies at
least two points lower. Each judge saw the judge prompt, the rubric, this lesson and the
items its knowledge checks reference, in a fresh context, and its verdict went through
`qa_gate.py` unchanged. Files beside this one: `verdict.<tag>.json`, `qa-report.<tag>.md`,
`panel-report.md`.

| Judge | Mean | Criteria scored | Knowledge checks | Gate |
|---|---|---|---|---|
| deepseek.v3.2 | 4.62 | 8 | 4 | PASS |
| us.moonshotai.kimi-k3 | 4.75 | 8 | 5 | PASS |
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

Kimi K2.5's first verdict on this lesson used a criterion name the rubric does not have, and the gate refused it. It was run once more; that second verdict counted until K2.5 was retired and is now in `retired-judges/`. The refused one is kept in `refused-verdicts/`.

The panel is calibrated on knowledge checks and worked examples, and two of its three judges
also on English pasted into Arabic fields. No judge is calibrated on scenario consequences or
on Arabic quality more generally, so scores there are reported, not relied on; `validate.py`
guards the mechanical half of both. Calibrated models agreeing is still not a human review;
the blind inter-rater sample is still the open item.
