# QA gate report — writing-a-shift-handover

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
| bilingual quality | 1 ⚠ | Arabic content uses English terms and word order (e.g., 'Shift handover' as termAr, English sentences in mdAr) instead of natural Arabic. |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> Criterion 6 (bilingual_quality) scored 1, below the 3 threshold. The mean score is 4.5.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
