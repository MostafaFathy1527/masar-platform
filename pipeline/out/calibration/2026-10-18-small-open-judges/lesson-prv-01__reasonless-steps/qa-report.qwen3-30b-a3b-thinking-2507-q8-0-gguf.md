# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 4.50 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 1 ⚠ | The 'why' column provides no meaningful reasoning and repeats a placeholder ('Because it is the next step.') for every step instead of explaining the judgment. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> One criterion at 1; mean 4.5. The worked example fails to provide any reasoning for the steps, making it a printed solution rather than a learning tool.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
