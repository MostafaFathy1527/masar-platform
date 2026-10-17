# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.12 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 |  |
| worked example | 5 |  |
| knowledge check | 3 | Two distractors restate the stem rather than naming a misconception. |
| scenario authenticity | 5 |  |
| bilingual quality | 1 ⚠ | Arabic translation follows English word order and is machine-like. |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The mean score is 4.25, but the gate fails due to the bilingual_quality scoring 1, which is below the threshold. The knowledge checks are the weakest part.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
