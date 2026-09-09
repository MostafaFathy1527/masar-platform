# What failed

Raw material for the case study's "what failed" section. Written as the failures happened,
not reconstructed afterwards — which is the only way this section is worth reading.

Ten so far. The first five share one pattern; the sixth, seventh and eighth each break it
in a different direction, which is why they are kept separate rather than folded in. Three
of the ten are the same underlying defect wearing different clothes, and that sub-pattern
is named at the end. The ninth and tenth belong with the gate's false pass: all three are
**checks that could not do the thing they claimed** — one scanned nothing, one gated
nothing, and one could not accept the input it existed to judge.

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
testable. This is the easiest of the ten to catch.

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

## 7. The tool was wrong and the product was right

**What happened.** Capturing the 390px mobile screenshot with Chrome's
`--headless --screenshot --window-size=390,844` produced an image with the Arabic labels
sheared off the right edge. It looked exactly like a real RTL layout overflow on the single
most important shot in the set — the one whose entire job is to prove the mobile pattern
works.

**What was nearly done.** Reported as a layout defect and fixed. The "fix" would have been
changes to a layout that was already correct, chasing a bug that did not exist, and
probably breaking the thing being photographed.

**What was actually true.** Checked against a real browser at the same viewport:
`documentElement.scrollWidth === 390`, `body.scrollWidth === 390`, and a sweep of every
element for a box escaping the viewport returned zero. The measurement taken during the
Week 3 build was right all along. Chrome's headless screenshot mode silently lays RTL out
wider than `--window-size` and then clips the capture to the window. Capturing through
`Emulation.setDeviceMetricsOverride` over the DevTools protocol produces output identical
to the real browser.

**Why it inverts the pattern.** The other six say: do not trust that the code is right,
verify the artefact. This one says the artefact was right and **the instrument was lying**.
A capture that clips is pixel-for-pixel indistinguishable from a layout that overflows, so
the image cannot adjudicate between them — only a second, independent measurement can.

**The rule it argues for.** Verify your verifier. When a tool reports a defect that
contradicts an earlier direct measurement, one of the two is wrong and it is not
automatically the older one. Establish which before changing any code, because "fixing"
a phantom does real damage to something that was working.

**A second, cheaper trap in the same session.** Headless Chrome silently fails to write a
file at all if its `--user-data-dir` collides with a running profile. No error, no output,
exit code 0. Three attempts were lost to it. `scripts/shot.mjs` documents both dead ends in
its header so nobody re-derives them.

---

## 8. A check written to keep a screenshot honest found the page lying

**Why the check existed.** Two of the six screenshots needed interaction before the
capture, so the script drives the page: click four fields, submit, photograph the result.
A scripted capture has a way of going wrong that a manual one does not. If a selector
matches nothing, the clicks land nowhere, the page never changes, and the script still
produces a perfectly real screenshot of an untouched page. That image is not corrupt, not
obviously wrong, and almost impossible to catch later. So each step file was made to
assert what it had actually done and throw rather than return: sixteen items expected,
four buttons pressed, a result section present.

That was instrumentation for the honesty of a deliverable. It was not a test of the
product and it was not looking for defects.

**What it found.** The exam step asserted the item count against the blueprint in the seed
-- eight objectives at two items each, sixteen -- and stopped. The page had rendered
sixteen items while its own lead sentence told the learner there were nine, in both Arabic
and English, on production.

**Why nothing else caught it.** The blueprint grew from nine items to sixteen in Week 5,
when the bank was extended to cover every objective. The copy was a string literal written
when nine was true. Nothing was broken: assembly was correct, scoring was correct, every
test passed, and the page rendered exactly as designed. The only defect was that the page
made a false statement to its reader, and no test in the suite was in a position to
notice, because no test compares prose against data. Six weeks of looking at that page had
not caught it either -- a sentence that was true when written does not read as suspicious.

**The fix.** The lead interpolates `itemCount` and `passPct` from the assessment row
instead of restating them. The sentence can no longer drift from the blueprint, because it
no longer holds an independent copy of the fact.

**The rule it argues for.** A check written to verify that a deliverable is honest will
occasionally catch the product being dishonest, because both are the same question asked
of different artefacts. The value did not come from the check being clever. It came from
comparing the page against the source of truth rather than against the page. An assertion
that reads the product back through its own claims can only ever agree with it.

---

## 9. A conditional that was never conditional

**What was wrong.** The dark colour palette was not an alternate. It was the only palette.
Every visitor got the dark site regardless of their system setting, and the light default
it was nominally an alternate to **had never rendered anywhere** — not in a browser, not in
any of the six committed screenshots, not once in six weeks.

**Why nothing caught it.** The stylesheet looked exactly right:

```css
@media (prefers-color-scheme: dark) {
  @theme { --color-canvas: #121211; ... }
}
```

Tailwind 4 processes `@theme` at build time and hoists the variables out of whatever they
are nested in. The media query survived into the output with nothing left inside it, and
the dark values were emitted unconditionally. The source read as a conditional; the
compiled artefact contained none.

**How it was found, and the part worth keeping.** A screenshot taken with the colour scheme
forced to light came back dark. The natural reading is that the emulation did not work — so
the page was asked directly:

```js
{ dark: false, light: true, bodyBg: "rgb(18, 16, 13)" }
```

The browser said light. The page was painted dark. **The page disagreed with `matchMedia`,
and that disagreement is the whole tell.** A media query cannot be true and not-apply at the
same time, so once those two facts sat side by side the only remaining explanation was that
the rule was not in a media query at all by the time it reached the browser.

That is the transferable part, and it is not about Tailwind. Any build step that rewrites
CSS — nesting, layers, custom-property extraction, a minifier hoisting rules — can move a
declaration out of the condition the author wrote around it. **When output disagrees with a
condition, read the compiled artefact, not the source.** The source is what you meant; the
artefact is what shipped.

**Why it belongs beside the gate failure.** Both are conditionals that were never
conditional. The gate printed `clean` because a scan that never ran produced no hits, and
this stylesheet applied a dark theme because a media query that never gated produced no
constraint. In both, the absent thing looked identical to the passing thing.

**The repair.** Dark now overrides plain custom properties on `:root` inside the media
query, which Tailwind does not touch, and both schemes were verified by measuring
`bodyBg` under each. `scripts/shot.mjs` takes a colour scheme argument, because a headless
browser reports the host machine's setting — on a dark machine a light-default design
photographs dark forever and the default is never reviewed.

---

## 10. The gate could not accept its most common input

**What was wrong.** `pipeline/qa_gate.py` cannot evaluate an L1-only lesson. `CRITERIA` is a
fixed eight-tuple and the gate raises `GateError` when a verdict omits any of them. Three of
those criteria — `knowledge_check`, `worked_example`, `scenario_authenticity` — describe
block types the registry forbids at L1. **A conforming L1 lesson therefore cannot produce a
conforming verdict.**

Four of the five shipped lessons are L1-only.

**What makes it worse than an ordinary bug.** Every available response is bad. Fabricate a
score for a block type that cannot exist, and the number is invented — which criterion 8's
own standard forbids, and that standard applies to the judge as much as to the content.
Score it 1, and a compliant lesson auto-fails on the floor. Leave the lesson unjudged, and
the pipeline's central argument — that content passes a gate before it ships — quietly
stops covering most of the content.

**Why nothing caught it.** The gate has nine negative tests, and they pass. It had only ever
been run against L2/L3 fixtures and against fixtures it defined itself. Its most common real
input was the one shape never tried. The tests proved the gate refuses bad verdicts; nothing
asked whether it accepts good lessons, and a gate that refuses everything satisfies a suite
built only from refusals.

That is the specific trap in testing a mechanism whose job is to say no. **Its negative tests
constrain what it rejects; only a positive case over real inputs constrains what it can
accept.** The suite already contained two cases asserting valid content passes — and both
used the eight-criterion shape, so both encoded the same assumption as the bug.

**How it was found.** By running the thing on real content for the first time, in a fresh
session with only the lesson and the rubric. The judge scored the seven criteria that apply,
refused to score the eighth, and said why. Filling it in would have produced a verdict the
gate accepted, a run-log entry, a number on `/how-it-was-built`, and no defect — the failure
would have been laundered into a passing score by the one participant positioned to notice
it.

**Why it belongs beside the false pass and the `@theme` bug.** All three are checks that
could not do what they claimed. `gate.sh` printed `clean` over zero blobs scanned. A media
query gated nothing because the build hoisted its contents out. This gate could not accept
the input it existed to judge. In each, the mechanism looked present and did nothing, and in
each the artefact reported success in exactly the words it uses when it works.

**The repair.** A criterion may be declared inapplicable **with a reason**, and applicability
is derived from the lesson's declared levels rather than from the judge's discretion — a
judge that could excuse itself from an inconvenient criterion is a judge that sets its own
threshold. The mean and the below-3 floor are taken over the applicable set only. And a
negative test asserts that an L1 fixture carrying a fabricated `knowledge_check` score is
**rejected**: without it the fix legitimises the exact fabrication it exists to prevent,
which is the same shape as the zero-blob counter added to `gate.sh`.

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

Two more complete the set, and each breaks the pattern in a different direction.

The sixth: the code was correct and the **product** was wrong. Six weeks of work sat behind
no link, under a badge announcing it was under construction. No test could have caught it,
because nothing was broken. It was found by opening the site as a stranger.

The seventh: the product was correct and the **tool** was wrong. A screenshot utility
clipped an RTL layout and made a working page look broken, convincingly enough that the
next step was nearly to "fix" it. It was caught by re-measuring in a real browser instead
of believing the image.

The eighth came from somewhere else again. It was not a test and was not hunting for
bugs: it was an assertion added so that a screenshot could not photograph a page it had
failed to change. It caught the exam page telling learners there were nine questions while
serving sixteen. A check written to keep a deliverable honest found the product being
dishonest, because it compared the page against the blueprint rather than against the
page.

Together they bracket the discipline. Verify the artefact rather than the code; when the
artefact accuses the code, verify the instrument before believing it; and prefer checks
that compare a thing against its source of truth, because a check that reads the product
back through its own claims can only ever agree with it.

## The sub-pattern worth naming: facts that were true when written

Three of the ten are the same defect. The landing page carried a "Week 1 — under
construction" badge over a finished six-week product. the project rules file and `docs/STATUS.md`
told every new session that Week 1 was the next action, long after it shipped. The exam
page said nine questions and served sixteen.

Each was a hardcoded fact, correct on the day it was written, that silently stopped being
true. In all three cases nothing broke, no test could fail, and the system went on stating
something false to a reader — a visitor, a future session, a learner. The falsehood was
not introduced by a change to the sentence. It was created by a change *elsewhere*, to the
thing the sentence described.

**The general fix is to interpolate from the source of truth rather than restate it.** The
exam lead now reads `itemCount` from the assessment row, so it cannot disagree with the
blueprint. Where interpolation is impossible — prose in a Markdown file, a badge encoding
a judgement — the fact needs an owner and a moment when it is re-read, which is why
the project rules file now carries an instruction to keep itself current.

That is the more useful thing to say than the three incidents. Restating a fact creates a
second copy that no mechanism keeps in sync, and duplicated state drifts. It is the
argument for normalising a database, applied to sentences — and the copy that drifts is
almost always the one written for humans, because that is the copy nothing executes.

## The gate has failed twice, and caught one real thing

Worth stating plainly, because it is the sharpest thing in this document.

`.local/gate.sh` is the publish-safety gate. It scans content for the employer name, client
names and local path patterns before anything leaves the machine. It has one real catch to
its name: a `.pyc` file embedding an absolute build path, which it blocked correctly.

It has failed twice, and only one of the two was the dangerous kind.

1. **A false positive on binary blobs.** Compressed PNG bytes match the drive-letter
   pattern by chance every few hundred KB, so committing a screenshot was impossible until
   binaries were skipped explicitly and their metadata checked separately instead.
2. **A false pass, which is far worse.** An optimisation replaced the scanning call sites
   with a faster function and never defined it. Every scan errored to stderr, the hit list
   stayed empty because nothing ever ran, and the gate printed `gate: clean` over **zero
   blobs examined**. The pre-push hook runs that same sweep, so the reassurance sat
   directly in front of every push.

Two failures, one catch. That is not an argument against having the gate: an unscanned push
is exactly the kind of mistake that cannot be undone once a repository is public. It is the
sharper version of what the rest of this document says. **The code you trust most is the
code you test least, because testing it feels redundant.** A safety mechanism is the
easiest place in a codebase to accumulate untested behaviour, precisely because its output
is reassuring and its correct answer is almost always "fine".

### A third incident that was not a failure

The first draft of this section was blocked by the gate, and the reflex was to record it as
a false positive on URLs. It was not one. The pattern is anchored — a drive letter only
counts when the character before it is not alphanumeric — so a real address passes, because
the character before the `s:` is a letter. What tripped it was a bare letter-colon-slash
token, written on its own while explaining the rule, with a space in front of it.

That is the drive-letter shape the rule exists to catch, and nothing distinguishes it from
a real path without special-casing a single letter, which would blind the rule to genuine
leaks. The rule was right and the prose was path-shaped.

The operational note is more interesting than the regex would have been: **a document that
describes leak patterns will trip a leak detector, because describing a pattern means
writing something with its shape.** Security documentation is the one genre guaranteed to
look like the thing it warns about. The answer is to describe the shape rather than spell
it, which is what this section now does — not to carve an exception into the detector.

It is also a reminder about this document specifically. The claim "the gate produces false
positives on URLs" was wrong, and it was written here, in the file whose entire value is
that it reports accurately. It was corrected by someone running the real pattern against
six lines instead of trusting the write-up — which is entry 7 again, one document later.

The dangerous failure is the one that recurs in real systems. A CI secret-scanner earlier in
this project reported "no leaks" after scanning zero bytes, because it built an invalid
commit range on a root-commit push. Same shape: a green result that means nothing, which
is worse than a red one, because red gets investigated and green removes the reason to
look.

The fix is not more careful editing. It is making the null result impossible to report as
success. The gate now counts the blobs it examined and refuses to print clean when that
count is zero in any sweep mode. The count is printed on every run, which is what makes it
real rather than decorative — it read 248, 256, 261 and 265 across four successive pushes,
rising by exactly the number of blobs each commit added, and a number that tracks reality
is a number that can be checked. Verifying the fix meant planting a
forbidden string and confirming every mode blocks it, then running the gate against git's
empty tree to confirm it refuses to pass on nothing.

Anyone who has maintained CI will have met both.
