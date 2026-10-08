# LATER — deliberately out of v1.0

Not promised in the README, the case study, LinkedIn, or the newsletter until built.

## Simulations
- `mapping` (generic across subjects — the reusable-for-clients argument)
- `rcm_ordering`, `denial_analysis` — documented design patterns in `SPEC.md`, not code

## Assessment
- Module quizzes, mock-vs-final split, attempt cooldowns, seen-item exclusion
- Mastery engine (`ObjectiveScore`, readiness index, recompute cron)
- The wider item types: `MATCHING` (per-pair credit), `ORDERING` (Kendall-tau partial credit),
  `SCENARIO_MCQ` (a 60–120-word vignette, then a decision) and `CASE_SET` (a shared stimulus with
  3–5 linked items, kept together in assembly). v1.0 ships `MCQ_SINGLE` and `MULTI_SELECT` only.
  The Prisma schema said these were listed here long before they were; they now are.
- A scenario-led share of the bank, if it returns, measured from the item type rather than from a
  hand-set flag. The v1.0 bar was withdrawn — see `BUILD.md` §4.4.

## Platform
- Real payment adapters (Stripe, Paymob live), orders, refunds
- Admin CRUD editors, blueprint editor, certificate registry, INSTRUCTOR role
- Multi-course / multi-instructor, subscriptions, B2B reporting
- Dockerfile, backup scripts, restore rehearsal

## Content
- Remaining lessons beyond the 5 in v1.0; full bilingual coverage of every lesson
- Video lessons

## Added 8 October 2026
- **SCORM 1.2 / 2004 export** of a lesson, for buyers who will not import JSON. Build it
  against the first commissioned pilot, not before; `/commission` says it is agreed there.
- **Render pipeline drafts in the lesson reader** (read from `pipeline/out`), so a prospect
  can open a sample on the site instead of on GitHub. Only worth it once drafts are
  rubric-scored by an independent judge.
