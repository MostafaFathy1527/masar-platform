# CS-01 — second pipeline run outside the medical-insurance domain

**Status: DRAFT.** Not seeded, not published, not on the site. The contract says the
pipeline may not publish; a human does.

## Why this run exists

SEC-01 showed the pipeline is not locked to one domain. This run asks a different
question: can it produce a lesson in a subject that corporate training buyers actually
commission at volume — customer service — that a training manager could put in front of a
team. It is one of two sample lessons made for the commissioning page, so a prospect can
read a real draft rather than a description of one.

- **Source note:** [`pipeline/sources/cs-01-handling-a-customer-complaint.md`](../../../sources/cs-01-handling-a-customer-complaint.md)
- **Objective:** CS-01 — given a customer complaint, de-escalate it, establish the facts,
  and close it with an agreed next step the customer can hold you to.
- **Output:** `lesson.json` (11 blocks, L1 + L2), `items.json` (2 formative items).

## Gate results

| Gate | Result |
|---|---|
| `validate.py --denylist` | PASS — no findings |
| `concept_log.py --check` | PASS — the five course lessons; the new concepts (`acknowledgement`, `establishing_the_facts`, `complaint_ownership`, `warm_handover`, `agreed_next_step`) collide with nothing in the log |
| Item references | Both `knowledge_check` blocks resolve to formative items |
| L2 prose budget | 7 words between acting blocks, against a ceiling of 180 |
| Authored answer position | Varied deliberately (positions 2 and 3), so the bank is not keyed to one slot |

**`qa_gate.py`: run on 14 October 2026 by the calibrated judge panel, and again on 15 October after one judge was replaced — see below.**

## What is different from the earlier runs

- **Domain with no codes at all.** The RCM lessons lean on fictional code sets; SEC-01 on
  technical signals. This one is entirely behavioural, which exercises the worked-example
  and scenario blocks on dialogue rather than data.
- **Arabic written for a Gulf service floor**, not translated from the English: the
  acknowledgement lines in the worked example are phrased as an agent would say them.

## Limitations, stated rather than left to be found

- One lesson is a sample of the method, not evidence that the method produces good
  content in every service context. A buyer should judge it as a draft.
- The content is authored from public knowledge of frontline service work. It names no
  organisation, product or real incident.

## Rubric gate: the calibrated panel, 15 October 2026

Scored by the three judges that passed `pipeline/calibrate_judges.py`: shown this lesson's
real items and copies broken in ways the rubric names, each scored the broken copies at
least two points lower. Each judge saw the judge prompt, the rubric, this lesson and the
items its knowledge checks reference, in a fresh context, and its verdict went through
`qa_gate.py` unchanged. Files beside this one: `verdict.<tag>.json`, `qa-report.<tag>.md`,
`panel-report.md`.

| Judge | Mean | Criteria scored | Knowledge checks | Gate |
|---|---|---|---|---|
| deepseek.v3.2 | 4.88 | 8 | 5 | PASS |
| us.moonshotai.kimi-k3 | 4.62 | 8 | 5 | PASS |
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
