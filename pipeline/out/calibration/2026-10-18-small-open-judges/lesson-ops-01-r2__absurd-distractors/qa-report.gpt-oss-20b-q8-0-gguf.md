# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 4.38 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 1 ⚠ | All distractors are implausible (e.g., "order lunch for the team") and feedback for incorrect options merely restates "not correct" without addressing misconceptions. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson scores highly overall, but the knowledge checks are poorly designed, scoring 1. The mean is 4.38, above the 4.0 threshold, yet the low knowledge-check score will cause the gate to fail.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
