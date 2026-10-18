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
| knowledge check | 5 |  |
| scenario authenticity | 4 | The scenario is generic and lacks specific friction points, making it less authentic for real workers. |
| bilingual quality | 1 ⚠ | Arabic content is a literal copy of English, not natural Arabic, violating the bilingual quality requirement. |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> One criterion scored a 1 (bilingual_quality). The mean score is 4.375. The lesson does not meet the threshold for a pass due to the bilingual quality failure.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
