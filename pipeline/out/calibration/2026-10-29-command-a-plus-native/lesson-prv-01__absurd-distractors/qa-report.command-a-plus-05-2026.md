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
| knowledge check | 1 ⚠ | All distractors are implausible nonsense options, and feedback for incorrect answers simply states "Not correct" without naming the misconception. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson scores 5 on seven criteria, with only knowledge_check scoring 1 due to implausible distractors and generic feedback. The mean score is 4.5, exceeding the 4.0 threshold, and no criterion falls below 3, so it passes the gate.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
