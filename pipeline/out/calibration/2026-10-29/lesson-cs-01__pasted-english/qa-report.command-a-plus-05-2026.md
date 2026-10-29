# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.50 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 1 ⚠ | Arabic text is a literal translation of English, following English word order rather than reading as natural Arabic. |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson scores highly on all criteria except bilingual quality, where the Arabic content is a direct literal rendering, earning a 1. This critical issue causes the gate to fail despite an overall mean of 4.5. The Arabic needs to be rewritten to read naturally.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
