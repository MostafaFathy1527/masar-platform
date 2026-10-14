# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.38 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 |  |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | Distractors are plausible, but feedback is unacceptable: 'Not correct.' and 'Correct.' with no explanation of why. This restates the answer and does not name the misconception. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong in most areas, with excellent scenario authenticity, bilingual quality, and worked examples. However, the knowledge-check feedback is severely lacking, providing no learning value. This is a critical failure in formative assessment design.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
