# What failed

Raw material for the case study's "what failed" section. Written as the failures happened,
not reconstructed afterwards — which is the only way this section is worth reading.

Three so far, and they form a pattern worth naming:

> **The falsifiable claims are the ones that break, and they only break when you try to
> game them.** Every one of these passed code review, passed its schema, passed CI, and
> looked right on the screen. Each was caught by attacking the thing rather than reading
> it.

---

## 1. The scoring formula failed its own published claim

**The claim.** The case study says shotgun-flagging every field in the claim-review
simulation scores *worse* than reading four fields carefully. The specified formula was
`(hits/6) × 0.7 + (1 − falsePositives/flagsMade) × 0.3`.

**What was actually true.** Written as a test, the claim failed:

| strategy | score |
|---|---|
| flag all 19 fields | **79%**, passes |
| flag four fields, all correct | 77%, passes |
| flag nothing | **30%** |

Flagging everything maxes recall, and the recall weight alone (0.70) already reaches the
pass mark. Algebraically the claim only holds when the form has **more than 27 flaggable
fields**; this one has 19. Flagging nothing scored 30% because with zero flags there are
no false positives, so the precision term paid out in full for doing no work.

**The repair, and the one rejected.** Padding the claim form to 28 fields would have made
the numbers come out right — and would have been designing the artefact to flatter the
metric, while making the 390px panel worse. Instead scoring moved to **F1**, the harmonic
mean, which is dominated by whichever of precision and recall is worse and therefore
delivers the claim at any field count: shotgun 48%, four careful 80%, nothing 0%.

**Why it was found.** Because the claim was written down, and writing it down made it
testable. This is the easiest of the three to catch.

---

## 2. The item bank was trivially gameable, and nothing flagged it

**What was wrong.** Answering *the first option* on every exam item scored **89%** and
passed. The bank was authored with the correct answer first in 11 of 14 items.

**What makes this the worst of the three.** Nothing caught it and nothing could have. The
content read well. The Zod schema validated it. `pipeline/validate.py` passed it. The
forbidden-code-set scan passed it. Every option had feedback naming its misconception. The
item bank was, by every check the project had, correct — and a reviewer who tried "always
answer A" would have dismantled the entire assessment story in about five minutes.

**The repair.** Options are shuffled deterministically per attempt and per item, seeded by
the attempt. The same strategy now scores 22%, 28% and 11% across three live attempts.

Two details of the repair matter as much as the repair:

- **Seeded by the attempt**, so a reload shows the same order. Options that move under a
  learner mid-exam are a different and worse bug.
- **Answers match by option id, not position**, so scoring never had to change and cannot
  drift out of step with display order.

And one test exists purely to protect the fix: it asserts the authored bank *is*
position-biased. Without it, someone finds the shuffle in six months, sees a bank that
looks fine, and deletes it as redundant.

**Why it was found.** By playing the item bank as an adversary rather than reading it.
There was no claim to test here — the failure was in territory nobody had described.

---

## 3. A panel that reported itself visible and rendered nothing

**What was wrong.** The simulation's evidence panel — the clinical record and the member
card, without which two of the six seeded errors are guesswork — rendered **empty on
desktop**.

The panel is a single `<details>` element: a bottom sheet on a phone, a side panel from
768px up, where CSS reveals the content and hides the toggle. Except CSS cannot reveal the
children of a *closed* `<details>`. Forcing `display: block` on the body did nothing.

**What makes it interesting.** `getComputedStyle` reported the body as `display: block` —
visible. Only `innerText` returning an empty string exposed it. A check that asked the
browser the obvious question got the wrong answer.

**The repair.** `open` by default with the summary hidden *is* the desktop panel; on a
phone the same element is a sheet the learner can collapse.

**Why it was found.** Because the verification asked whether the text was *there*, not
whether the element was styled to be visible.

---

## What to say about this in the case study

Not "we found three bugs". The point is narrower and more useful:

The project makes exactly one falsifiable claim about learning — that its simulation
rewards careful reading over indiscriminate flagging — and that claim was **false as
originally specified**. It was found in a unit test rather than by a reviewer, because it
had been written down precisely enough to test. The item-bank failure had not been written
down anywhere, and only surfaced under adversarial use. The panel failure lied to the
first tool used to check it.

Three for three, the defect was in something that already looked correct.
