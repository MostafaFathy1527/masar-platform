# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 4.38 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 | The L1 content is dense, but it avoids the 'visual card as list' trap, and the level is consistent with the material presented. |
| worked example | 2 ⚠ | The 'why' sections in the worked example merely state 'Because it is the next step' rather than explaining the logic or reasoning behind the sequence. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> Mean score 4.4. The lesson fails the gate because the worked example scores a 2 (below the 3 floor).

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
