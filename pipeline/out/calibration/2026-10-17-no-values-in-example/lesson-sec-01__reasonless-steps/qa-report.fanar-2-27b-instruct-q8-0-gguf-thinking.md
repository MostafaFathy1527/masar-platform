# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 3 | Reasoning in the worked example is generic and does not explain the judgment being made, merely restates the step. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 1 ⚠ | Arabic is a literal translation of English word order, lacks natural phrasing. |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson generally meets most criteria, but the worked example's reasoning is generic and the Arabic translation lacks natural phrasing, leading to a gate failure due to the bilingual quality score below 3.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
