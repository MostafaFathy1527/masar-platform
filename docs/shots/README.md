# Screenshots

Deliverable D8. Six shots, chosen so that each one carries an argument rather than showing
a screen. **All six are captured.**

All from production, `https://masar.mostafafathy.com`. Filenames are fixed so the case
study and README can reference them before they exist.

| # | File | URL | Viewport | What it has to show |
|---|---|---|---|---|
| 1 | `01-landing-ar.png` | `/ar` | 1280×900 | Arabic-first, RTL, the Explore navigation, one-click guest entry. The first thing a Gulf reviewer sees. |
| 2 | `02-depth-switch.png` | `/en/depth` | 1280×900 | The depth switch with L1/L2/L3 and the cumulative block count. The central idea in one frame. |
| 3 | `03-claim-review-390.png` | `/ar/practice/claim-review?tour=1` | **390×844** | The mobile pattern: evidence sheet pinned to the bottom, the claim's date of birth and the card's visible **at the same time**. That simultaneity is what makes the error findable rather than guessable. |
| 4 | `04-claim-review-result.png` | same, after submitting 4 correct flags | 1280×900 | 80% pass, per-error written explanations, and the link back to the block that taught each miss. The pedagogical argument of the project. |
| 5 | `05-exam-review.png` | `/en/assess/exam`, after submitting | 1280×900 | Per-objective breakdown and weakest-objectives list. Assessment as a blueprint rather than a pile. |
| 6 | `06-how-it-was-built.png` | `/en/how-it-was-built` | 1280×900 | The gates table with negative-test counts, and the status section stating that no practitioner reviewed the content and the run log is empty. |

**Deliberately not included:** a screenshot of the price card. It exists, and the sandbox
banner is always beside it, but a price in a portfolio screenshot invites exactly the
misreading the banner exists to prevent.

## Capturing 3, 4 and 5

Three of the six need interaction, which is why they are worth the most:

- **3** — resize to 390×844 *before* loading, so the layout is not a resized desktop
  render. The evidence sheet should be open at roughly 45% of viewport height.
- **4** — flag `member_dob`, `service_date`, `line_2`, `dx_primary`, and submit. That
  produces 80%, a pass, and six written outcomes. No sign-in: `/api/sim` scores anyone
  and persists only for a signed-in learner, so the exercise is never behind a wall.
- **5** — enter as a guest, start the exam, answer every item, submit. Any answers will
  do; the shot is of the breakdown, not the score. `/api/attempt` does need a session,
  because the attempt row has to belong to someone.

## Capturing them

`scripts/shot.mjs` drives Chrome over the DevTools protocol. Start headless Chrome first,
with a **dedicated** user-data-dir:

```bash
chrome --headless=new --remote-debugging-port=9333 --user-data-dir=/tmp/masar-shots
node scripts/shot.mjs https://masar.mostafafathy.com/ar docs/shots/01-landing-ar.png 1280 900 2
```

An optional seventh argument is a step file, evaluated in the page after load and before
the capture. The ones in `scripts/steps/` do the interactions for 4 and 5:

```bash
node scripts/shot.mjs https://masar.mostafafathy.com/ar/practice/claim-review   docs/shots/04-claim-review-result.png 1280 900 2 scripts/steps/04-claim-review-result.js
node scripts/shot.mjs https://masar.mostafafathy.com/en/assess/exam   /tmp/discard.png 1280 900 1 scripts/steps/05a-guest-entry.js
node scripts/shot.mjs https://masar.mostafafathy.com/en/assess/exam   docs/shots/05-exam-review.png 1280 900 2 scripts/steps/05b-exam-review.js
```

Every step file asserts what it actually did and throws rather than returning, and
`shot.mjs` prints what came back. A step that silently matched nothing would otherwise
produce a real screenshot of an untouched page — which is the same failure as a clipped
capture, and just as hard to spot afterwards. Both assertions earned their keep: see
below.

Two dead ends are documented in that script's header so nobody re-derives them:

- **`--headless --screenshot --window-size` clips RTL.** It lays the page out wider than
  the window and crops the capture, which is indistinguishable from a layout that
  overflows. `Emulation.setDeviceMetricsOverride` matches the real browser.
- **A colliding `--user-data-dir` fails silently.** No error, no file, exit code 0.

## Status

| # | File | State |
|---|---|---|
| 1 | `01-landing-ar.png` | Captured — 1280×900 @2x |
| 2 | `02-depth-switch.png` | Captured — 1280×900 @2x |
| 3 | `03-claim-review-390.png` | Captured — 390×844 @2x |
| 4 | `04-claim-review-result.png` | Captured — 1280×900 @2x, scripted |
| 5 | `05-exam-review.png` | Captured — 1280×900 @2x, scripted |
| 6 | `06-how-it-was-built.png` | Captured — 1280×900 @2x |

Each captured shot was inspected rather than assumed present. Shot 3 in particular was
verified to show the claim's `1988-03-11` and the card's `1988-03-14` in the same frame,
with nothing clipped — the simultaneity is the reason that shot exists.

Shot 4 shows 80% with precision 100% and recall 67% (4 of 6), which is what the F1
formula predicts for four correct flags and no false positives — the score on the page
was derived independently before the shot was taken, not read off it afterwards.

Shot 5 shows all eight objectives scored out of two and the weakest-first revision list.

## What the step files found

Two defects surfaced because the steps checked the page against something other than the
page.

**The exam page said "nine questions" and served sixteen.** The blueprint is eight
objectives at two items each; it grew from nine in Week 5 when the bank was extended to
cover every objective, and the lead sentence never followed — in both locales, on a live
page. The step file asserted the item count against the seed rather than trusting the
copy, and stopped. The lead now interpolates `itemCount` and `passPct` from the assessment
row, so it cannot drift again. This is the inverse of what-failed entry 7: there the
instrument lied about a correct product; here the instrument was right and found a defect
six weeks of looking at the page had not.

**Four flags in one tick register as one.** `toggle` in both `ClaimReviewWorkbench` and
`AttemptRunner` copies the state it captured in its render closure instead of using a
functional updater, so a batch of clicks in a single task all start from the same stale
set and the last one wins. Not reachable by hand — the browser renders between discrete
click events — so it is recorded rather than fixed. The step files click one render apart,
which is what a real click sequence produces anyway.

**Guest accounts.** Shot 5 needs a session, so it creates a guest and deletes it in the
same sitting. Deletion was verified rather than assumed: `/api/me/export` returned 200
before and 401 after, with the cookie still present — which also re-proves the Week 4 fix,
since the guard reads the database row and not the token. One earlier guest was orphaned
by a step file that threw after the entry POST; it has no cookie to delete it with and is
purged by the 7-day retention policy.
