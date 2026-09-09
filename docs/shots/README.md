# Screenshots

Deliverable D8. Six shots, chosen so that each one carries an argument rather than showing
a screen. Not yet captured — see "Status" below.

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
- **4** — enter as a guest, flag `member_dob`, `service_date`, `line_2`, `dx_primary`, and
  submit. That produces 80%, a pass, and six written outcomes.
- **5** — enter as a guest, start the exam, answer, submit. Any answers will do; the shot
  is of the breakdown, not the score.

## Status

**Not captured.** The available browser tooling can render and verify these pages — every
one has been checked at these viewports — but cannot write an image file into this
repository.

Two ways to close it:

1. **Manually**, following the table above. Roughly ten minutes.
2. **With Playwright**, which would also unlock the three end-to-end journeys the plan asks
   for and which are currently untested. That is a dependency install and a scope decision,
   not something to add quietly.

Until they exist, nothing in the README or the case study points at an image that is not
there — the table above is the specification, not a claim that the files are present.
