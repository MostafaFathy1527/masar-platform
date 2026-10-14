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

**`qa_gate.py`: run on 14 October 2026 by three independent judges; the panel sends a split to a human — see below.**

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

## Rubric gate, re-run 14 October 2026 with the items visible

Scored by three judges from three model families, each in a fresh context that saw the
judge prompt, the rubric, this lesson and the items its knowledge checks reference
(`pipeline/judge_bedrock.py`), then passed through `qa_gate.py` unchanged. Files beside
this one: `verdict.<tag>.json`, `qa-report.<tag>.md`, `panel-report.md`.

| Judge | Mean | Criteria scored | Knowledge checks | Gate |
|---|---|---|---|---|
| us.meta.llama3-3-70b-instruct-v1:0 | 5.00 | 8 | 5 | PASS |
| amazon.nova-pro-v1:0 | 4.88 | 8 | 4 | PASS |
| qwen.qwen3-32b-v1:0 | 4.50 | 8 | 3 | PASS |

**Panel decision: NEEDS HUMAN.** Every judge passes the lesson, but they differ by more than one point on knowledge check, and the panel sends any split to a human rather than averaging it.

The earlier scoring the same day showed the judges the lesson only. A knowledge-check
block carries just a reference to its item, so those knowledge-check scores were given
without the question, options or feedback (failure entry 17). They are replaced here;
git history keeps them.

The split has the same shape on all four samples (5, 4 and 3, always from the same
three judges), which says more about the judges than about these items. That is for the
human reviewer to settle. Agreement or disagreement between models is not a human
review; the blind inter-rater sample is still the open item.
