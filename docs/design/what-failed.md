# What failed

Raw material for the case study's "what failed" section. Written as the failures happened,
not reconstructed afterwards — which is the only way this section is worth reading.

Six so far. The first five form one pattern; the sixth is a different failure worth keeping separate.

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
testable. This is the easiest of the six to catch.

---

## 2. The item bank was trivially gameable, and nothing flagged it

**What was wrong.** Answering *the first option* on every exam item scored **89%** and
passed. The bank was authored with the correct answer first in 11 of 14 items.

**What makes this the worst of them.** Nothing caught it and nothing could have. The
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

---

## 4. A deleted account's session still worked

**What was wrong.** After deleting an account through the privacy page, the same cookie
still returned **200** from the data-export endpoint.

A JSON Web Token outlives the row it describes. The cookie stays cryptographically valid
until it expires, so `session.user.id` continued to identify a user who no longer existed.
Every authorized route trusted that id without asking whether the account was still there.

**What makes it worse than an ordinary bug.** The code comment in the delete route
asserted the opposite — that "every authorized path resolves the user from the database,
so it grants nothing". That sentence had been written without checking, and it was the
sentence a reviewer would have trusted instead of testing.

**The repair.** Every authorization decision now goes through a guard that resolves the row
rather than reading the token. After deletion the same cookie returns 401 from export,
attempt-start and certificate issue, and 404 from admin. A structural test fails the build
if any route reads `session.user.id` or `.role` directly again.

It also closed a second issue that had been filed as acceptable: a demoted administrator
now loses access on the next request rather than at their next sign-in.

**Why it was found.** By deleting an account and then continuing to use the session, rather
than by deleting an account and checking that the delete returned 200.

---

## 5. A test file reported 16/16 while two of its tests never ran

**What was wrong.** Two new test cases were appended to a Python test file *below* its
`main()` entry point. The decorator that registers a case runs at import time, and the file
ends with `raise SystemExit(main())` — so the process had already exited before those two
definitions were reached.

The suite printed **16/16 passed**. It was green, and it was measuring nothing about the
two rules it had just been extended to cover.

**Why it belongs here.** This is the same failure as the gitleaks step in week 1, which
scanned zero bytes, reported "no leaks found", and failed the job for an unrelated reason.
Both are checks that appear to be working while verifying nothing — the most expensive kind
of green, because it actively removes the incentive to look again.

**The repair.** Moved above `main()`; the suite now runs 18. The count is printed on every
run, which is what made the discrepancy visible at all.

**Why it was found.** Because the number was expected to change and did not. Nothing else
about the output looked wrong.

## 6. The code was correct and the product was wrong

**What was wrong.** Six weeks of work — the depth model, the course page, the case study,
the pipeline page, the privacy page — was **unreachable from the landing page**. The only
route in was the guest button, straight to the practice workbench. A reviewer who did not
guess URLs would have seen roughly a tenth of the project.

At the same time the site was still wearing its own build schedule: the hero badge read
"Under construction — Week 1", the footer read "Week 1 — placeholder", and the depth page
read "Under construction — Week 2". Those are notes to ourselves about a plan. A visitor
has no way to read them as anything but an unfinished product, on the page whose entire
job is to look finished.

**Why no test caught it.** Every page worked. Every page had tests. Every test passed.
Nothing was broken — there was simply no path to any of it, and no test asserts that a
visitor can *find* a feature. The build-week copy was equally invisible to tooling: it was
correct, current, valid text that happened to say the wrong thing to the wrong audience.

**Why it belongs in a separate category.** The other five failures were all defects in
something that looked correct. This one is different: the code was correct, and the
*product* was wrong. It was found only by opening the deployed site and looking at it as a
stranger would, which is a different activity from testing and cannot be automated into
one.

**The habit it argues for.** Look at the deployed thing, in the language a reviewer will
use, without knowing any URLs. Everything else in this list was found by attacking the
system; this was found by simply arriving at it.

---

## What to say about this in the case study

Not "we found three bugs". The point is narrower and more useful:

The project makes exactly one falsifiable claim about learning — that its simulation
rewards careful reading over indiscriminate flagging — and that claim was **false as
originally specified**. It was found in a unit test rather than by a reviewer, because it
had been written down precisely enough to test.

The others were progressively harder to see. The item-bank failure had not been written
down anywhere and only surfaced under adversarial use. The panel lied to the first tool
used to check it. The deleted session was contradicted by a code comment asserting it could
not happen. And a test file reported a passing count for tests that never executed.

Five for five, the defect was in something that already looked correct.

The sixth is the counterweight and belongs beside them: the code was correct and the
product was wrong. Six weeks of work sat behind no link, under a badge announcing it was
under construction. No test could have caught that, because nothing was broken. It was
found by opening the site as a stranger, which is a different discipline from testing and
worth naming as one.
