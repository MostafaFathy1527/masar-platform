# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.38 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 1 ⚠ | Distractors are implausible and feedback is minimal, not explaining misconceptions. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> One criterion scored below 3; mean 4.38. The lesson meets objective alignment, level fidelity, worked example quality, scenario authenticity, bilingual quality, and accessibility. Concision is acceptable. Knowledge checks are weak due to implausible distractors and minimal feedback.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
