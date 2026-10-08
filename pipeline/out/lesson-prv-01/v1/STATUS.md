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

**Not run: `qa_gate.py`.** Same reason as SEC-01 and CS-01: the only available judge
authored the content.

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
