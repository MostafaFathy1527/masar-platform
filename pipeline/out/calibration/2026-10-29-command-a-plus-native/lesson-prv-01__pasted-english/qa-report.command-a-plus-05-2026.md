# QA gate report — what-counts-as-personal-data

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
| bilingual quality | 1 ⚠ | Arabic content is identical to English text, not translated, and reads as machine output rather than natural Arabic. |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson scores highly on objective alignment, level fidelity, worked example quality, knowledge check, scenario authenticity, concision, and accessibility, but the Arabic version is a copy of the English text, resulting in a score of 1 for bilingual quality. This low score causes a gate failure despite the overall strong quality of the lesson.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
