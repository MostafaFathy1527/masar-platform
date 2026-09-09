# Prompt: revise

Used for the single retry after a gate failure. Read `pipeline/CONTRACT.md` first.

---

A previous draft failed a gate. You are given:

- the draft, at `pipeline/out/<lesson>/vN/lesson.json`
- the failure output: a `validate.py` finding list, a `concept_log.py` finding list, or a
  `qa-report.md` from the rubric gate
- the same inputs the generator had

**Produce `vN+1`.** Never edit `vN` in place: the previous version is evidence of what
happened, and the diff between versions is the record of what the gate changed.

**Fix what was reported, and only what was reported.** A revision that also rewrites
untouched sections makes it impossible to tell whether the gate caused the improvement.

**If you disagree with a finding**, still comply, and note the disagreement in
`pipeline/out/<lesson>/vN+1/notes.md`. Disagreements are useful signal about the gate's
own quality — a rule that is frequently wrong should be changed deliberately, not
overridden case by case.

**If the failure was `needs-verification`**, do not invent support. Remove the claim or
narrow it to what the source note actually carries.

This is the only automatic retry. If `vN+1` fails, the pipeline stops and a human decides.
