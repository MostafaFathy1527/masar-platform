# OPS-01: writing a shift handover (v2)

**Status: DRAFT.** Not seeded, not published in a course. Shown under /samples as a draft.
The contract says the pipeline may not publish; a human does.

## How it was made

- **v1** came out of one command with no person in between: `pipeline/run_lesson.py` took
  [`pipeline/sources/ops-01-writing-a-shift-handover.md`](../../../sources/ops-01-writing-a-shift-handover.md)
  through every gate to a panel PASS. Generator `openai.gpt-oss-120b-1:0`, from a model
  family that sits on none of the judge seats. Run record: `../run-report.md`.
- A read of v1 against the source found five problems the panel had passed, listed in
  `../v1/STATUS.md`, and a sixth while fixing them.
- **v2** is that revision, made by hand at the owner's direction by the session that built
  the runner. It is the new baseline; v1 is kept unedited beside it. That read is not an
  independent review and not a subject-matter review.

## What v2 changed, and only that

1. **First line of a handover.** The scenario now has two open items, one with a promise
   due at 14:00 and one that arrived first with no deadline; the best opening line is the
   urgent one, marked, with the promise carried in words. Item KC-01 now asks how open
   items are ordered. The job tip states the rule the source gives: urgency orders the
   items, and the four questions order what is written about one item.
2. **Unsourced claim.** The sort card about a supplier's written confirmation is replaced
   by the source's own example, "waiting for the supplier to confirm a delivery date". The
   reason given for the "probably" card no longer invents a test nobody ran.
3. **Arabic.** The job tip's passive form is now an instruction, the takeaway's number
   agreement is fixed, and the worked example's opening sentence is rewritten.
4. **Not a concept.** The "Common failure" definition card and its declaration are gone:
   six cards, six concepts.
5. **KC-02** no longer repeats the sort cards. It shows a colleague's handover line that
   states a guess as a fact, and asks what is wrong with it.
6. **Item bank label.** The bank was labelled with the medical course's slug; it is now
   `operations`.

"Hand-over" is spelled "handover" throughout, as in the source.

## Gates on v2

| Gate | Result |
|---|---|
| `validate.py` with the denylist | PASS |
| item check | PASS |
| `concept_log.py`, as one more lesson after the course | PASS |

The revision check in `run_lesson.py` guards the automatic retry, and would flag v2 for
having one card fewer than v1. That is by design: a hand revision is a person's decision
and becomes the baseline; an automatic retry is not allowed to make that decision.

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
