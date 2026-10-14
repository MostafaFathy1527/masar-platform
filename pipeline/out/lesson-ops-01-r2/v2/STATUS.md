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

## Rubric gate: the calibrated panel, 14 October 2026

Scored by the three judges that passed `pipeline/calibrate_judges.py`: shown this lesson's
real items and copies broken in ways the rubric names, each scored the broken copies at
least two points lower. Each judge saw the judge prompt, the rubric, this lesson and the
items its knowledge checks reference, in a fresh context, and its verdict went through
`qa_gate.py` unchanged. Files beside this one: `verdict.<tag>.json`, `qa-report.<tag>.md`,
`panel-report.md`.

| Judge | Mean | Criteria scored | Knowledge checks | Gate |
|---|---|---|---|---|
| deepseek.v3.2 | 4.62 | 8 | 4 | PASS |
| moonshotai.kimi-k2.5 | 4.62 | 8 | 5 | PASS |
| zai.glm-5 | 5.00 | 8 | 5 | PASS |

**Panel decision: PASS.** Every judge passes the lesson and no criterion splits them by more than one point.

Earlier the same day this lesson was scored by Qwen3-32B, Llama 3.3 70B and Nova Pro. In
calibration those three caught 0, 1 and 0 of 8 planted knowledge-check defects, so their
knowledge-check scores carried no information and they were retired from the panel
(failure entry 18). Their verdicts are kept in `retired-judges/`.

The panel is calibrated on knowledge checks and worked examples. It did not pass the same
test on scenario consequences or on Arabic quality, so its scores there are reported, not
relied on; `validate.py` guards the mechanical half of both. Two calibrated models agreeing
is still not a human review; the blind inter-rater
sample is still the open item.
