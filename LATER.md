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

## Sentry (installed 13 Oct 2026, live)
Error monitoring is live: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN` are
set on Vercel (13 Oct) and production reports to Sentry (see `docs/STATUS.md`). Uptime
monitors exist (13 Oct): `masar.mostafafathy.com` and the HF Space, every minute, email on 3
consecutive failures. Seer Autofix is on for masar-web (repo linked 13 Oct), set to stop after
the plan so it never pushes a PR; the owner applies any fix by hand, which keeps the
attribution rule. Still open:
- A cron monitor on the weekly judge panel (`judge-panel.yml`, every Monday), so a run that
  never starts is reported rather than only a run that fails.
- Surface real error/uptime numbers on the case study instead of the unmeasured "99% uptime" line,
  once a month of data exists.

- **Run the rubric judge on open Arabic-capable models** (Jais / Falcon / Qwen) inside the
  Space and publish the comparison with the hosted judge. Needs GPU hardware the Space does
  not have today; it is deliberately CPU-only until then.
  - **Done outside the Space, 15–18 October,** on Kaggle and on rented V100 cards: Fanar-2,
    Gemma 3 27B, SILMA, Falcon-H1 7B and 34B, AceGPT, Jais, Mistral Small 3.2, gpt-oss-20b,
    GLM-4.7-Flash and Qwen3-30B-A3B-Thinking (reports under `pipeline/out/calibration/`). One
    candidate came out of it, Qwen3-30B-A3B-Thinking-2507, seated on 18 October as the panel's
    fourth judge: three hosted judges and one open judge served on rented hardware
    (`SERVED_JUDGES` in `pipeline/panel.py`). The weekly run rents one machine with two V100
    cards, serves the seated file there, sets `JUDGE_QWEN3_ENDPOINT` itself and terminates the
    machine; the first full run was on 18 October. The Space itself stays CPU-only.
