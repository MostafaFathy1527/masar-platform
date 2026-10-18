# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 4 |  |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 1 ⚠ | All Arabic fields contain English text rather than natural Arabic, indicating a missing or literal translation. |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson excels in most areas, but fails dramatically on bilingual quality, resulting in a low overall score. The missing Arabic translation must be addressed to meet the rubric.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
