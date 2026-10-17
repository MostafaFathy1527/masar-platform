# How a lesson is made

Generating learning content is no longer hard. Knowing whether the output is any good still
is. This page is the short version of how Masār answers that question; every step links to
the file that holds the detail, so nothing here can drift from it.

## The loop

```
source note → generate → mechanical gates → judge panel → one retry → stop for a person
```

1. **A source note.** One person writes what the lesson may say, in their own words. It is
   the only permitted input; a sentence the note does not support is flagged for a person to
   confirm or cut. See [the sources rule](../pipeline/sources/README.md).
2. **Generation.** A language model drafts the lesson and its quiz items against the
   [generation contract](../pipeline/CONTRACT.md). The generator always comes from a model
   family that has no seat on the judge panel, so no model scores its own family's work.
3. **Mechanical gates.** Checks that need no model run first, because they are cheap and
   cannot be argued with:
   - structure, levels and the word budget between practice blocks;
   - forbidden content, and Arabic fields that only repeat the English;
   - every quiz option carries feedback that explains, not just a verdict;
   - every scenario choice leads somewhere different;
   - no concept is taught twice, or used before it is taught.
4. **The judge panel.** Independent models score the draft against [the rubric](../pipeline/rubric.md),
   each in a fresh context that never saw the generation prompt. The panel passes a lesson
   only if every judge passes it and no criterion splits them by more than one point. A split
   goes to a person; it is never averaged away.
5. **One retry, then a person.** A failed draft gets one revision with the findings
   attached. The revision may fix what was reported; it may not pass by deleting what the
   gate checks. If the retry fails too, the run stops.

The output is a **draft** whatever happens. Nothing is published without a person.

## Judges are calibrated before they are trusted

A judge's score is a reading from an instrument, so the instrument is tested first. Each
sample lesson is copied and broken on purpose in a way the rubric names: quiz feedback that
only says "Correct", distractors no learner would pick, worked examples with the reasoning
removed, scenarios whose choices all lead to the same sentence, English pasted into the
Arabic fields. A judge earns a panel seat only if it scores the broken copies clearly lower
than the real ones.

That test retired the first panel and chose the current one. It also showed where judges
fail: seven of thirteen models gave every lesson with English pasted into its Arabic fields
full marks for Arabic quality, and of nine models tested on scenarios whose choices all lead
nowhere, the best caught three of four. The two judges that caught the pasted English every
time now sit on the panel, and both defects are also refused by mechanical checks and read
by a person. Some judges fail by not reading at all: an open Arabic model, Fanar-2-27B, run
on Kaggle's free GPUs, handed back the example verdict printed in the rubric for all 24
lessons, and Gemma 3 27B did the same on most of its verdicts. Those are now refused, and
counted as no score (what-failed entry 19). Run again at 8-bit with its thinking on, Fanar-2
read some lessons, but caught 5 of 14 defects with the example in the rubric and 4 of 20 without
it, and with the example there, 14 of its 22 verdicts borrowed the example's note. Four more
open Arabic models did no better: SILMA-9B and Jais-30B gave no verdict at all, AceGPT-v2-32B
handed back the example 18 times in 24, and Falcon-H1-7B scored every lesson but caught 1 of 20
defects. The scores are in the calibration reports for
[14 October](../pipeline/out/calibration/2026-10-14/report.md),
[15 October](../pipeline/out/calibration/2026-10-15/report.md),
[17 October](../pipeline/out/calibration/2026-10-17/report.md) and
[17 October, the four open Arabic models](../pipeline/out/calibration/2026-10-17-open-arabic-judges/report.md).

## What a person still has to do

- Read every draft against its source note before anything is published.
- Settle any criterion the panel splits on.
- Review what no model can check: whether the lesson is right for the people who will take it.

The record of everything that looked right and was not is in
[What failed](design/what-failed.md). It is the most useful document in the project.
