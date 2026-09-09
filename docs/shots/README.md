# Screenshots

Deliverable D8. Six shots, chosen so that each one carries an argument rather than showing
a screen. **Four are captured**; two need interaction — see "Status".

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

## Capturing them

`scripts/shot.mjs` drives Chrome over the DevTools protocol. Start headless Chrome first,
with a **dedicated** user-data-dir:

```bash
chrome --headless=new --remote-debugging-port=9333 --user-data-dir=/tmp/masar-shots
node scripts/shot.mjs https://masar.mostafafathy.com/ar docs/shots/01-landing-ar.png 1280 900 2
```

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
| 4 | `04-claim-review-result.png` | **Not captured** — needs interaction |
| 5 | `05-exam-review.png` | **Not captured** — needs interaction |
| 6 | `06-how-it-was-built.png` | Captured — 1280×900 @2x |

Each captured shot was inspected rather than assumed present. Shot 3 in particular was
verified to show the claim's `1988-03-11` and the card's `1988-03-14` in the same frame,
with nothing clipped — the simultaneity is the reason that shot exists.

**4 and 5 need a few interactions before the capture.** `scripts/shot.mjs` can be extended
to drive them over the same connection (`Runtime.evaluate` plus `Input` events), or they
can be taken by hand in about five minutes. Both are honest; neither is done.

Nothing in the README or the case study points at 4 or 5.
