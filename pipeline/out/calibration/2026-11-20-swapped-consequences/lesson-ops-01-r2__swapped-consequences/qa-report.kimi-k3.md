# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 3.88 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 4 |  |
| knowledge check | 5 |  |
| scenario authenticity | 2 ⚠ | The decision consequences are misassigned to options. d2 (the urgent-first line, flagged isBest) carries the consequence text describing the 'nothing major' failure, which belongs to d3. d3 ('All good, nothing major') carries the 'you ordered by arrival' text, which describes d1. d1 (supplier order first) is told 'Best'. As shipped, a learner who picks the correct answer is told it is a classic failure, and a learner who picks the weak answer is praised. The situation itself is authentic with real friction (arrival order vs deadline), but the scrambled feedback makes the block actively teach the wrong lesson. |
| bilingual quality | 4 |  |
| concision | 4 |  |
| accessibility ip | 4 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** scenario_authenticity. A single unacceptable criterion fails the gate regardless of the mean.
**Mean 3.88 is below 4.0.**

Judge's summary:

> Knowledge checks are excellent — every distractor is a live misconception and the feedback names it. The lesson is badly damaged by the scenario block, whose consequence texts are rotated one option off from their isBest flags, delivering wrong feedback to every choice. Fix that mapping and this is a solid lesson; as submitted, criterion 5 sits below the floor.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
