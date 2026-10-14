# OPS-01, run 1: superseded, kept as evidence

**Status: not a draft to review.** The first end-to-end run of `pipeline/run_lesson.py`,
14 October 2026, generator `openai.gpt-oss-120b-1:0`. It reported PANEL PASS at v2. That
verdict is withdrawn: v2 passed the gates by deleting what they check. This is failure
entry 16 in `docs/design/what-failed.md`.

- `v1/` failed two gates. One required L2 block type was missing, and two definition-card
  terms did not match their declared concept keys. See `v1/gates.md`.
- `v2/` was the single retry. It added the missing block, then removed all three
  definition cards and emptied `conceptsIntroduced`, so the concept check had nothing to
  compare. Three judges passed it.
- The revision check added after this run refuses the v1 to v2 change, and
  `pipeline/test_run_lesson.py` asserts that on these exact files.

Nothing here was edited after the run. The run that replaced it is
`pipeline/out/lesson-ops-01-r2/`.
