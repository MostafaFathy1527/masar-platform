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

**`qa_gate.py`: run on 14 October 2026 by three independent judges — see below.**

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

## Rubric gate, run 14 October 2026

Scored by three judges from three model families, each in a fresh context that saw only
the judge prompt, the rubric and this lesson (`pipeline/judge_bedrock.py`), then passed
through `qa_gate.py` unchanged. Files beside this one: `verdict.<tag>.json`,
`qa-report.<tag>.md`.

| Judge | Mean over 8 criteria | Gate |
|---|---|---|
| qwen.qwen3-32b-v1:0 | 4.62 | PASS |
| us.meta.llama3-3-70b-instruct-v1:0 | 4.75 | PASS |
| amazon.nova-pro-v1:0 | 4.88 | PASS |

No pair of judges disagrees by more than one point on any criterion. That is agreement
between models, not a human review; the blind inter-rater sample is still the open item.
