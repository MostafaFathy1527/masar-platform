# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.62 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | Feedback on all distractors in both items is a generic 'Not correct' label that fails to name the misconception or explain why the option is wrong. The correct options receive only 'Correct'. This fails the criterion requirement for per-option feedback that explains why rather than restates. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The instructional content is strong, with a worked example that models the 'why' effectively and a scenario with realistic friction. However, the knowledge checks fail to provide meaningful feedback on distractors, scoring a 2 on that criterion.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
