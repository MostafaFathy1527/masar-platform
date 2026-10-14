# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 4.62 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 2 ⚠ | The 'why' field for every step in the worked example is identical boilerplate ('Because it is the next step') that explains nothing. A proper worked example must justify the reasoning for each step (e.g., why state the status as a fact?) rather than asserting the step with circular logic. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is precise, well-structured, and the Arabic is natural, but the worked example fails to teach because its reasoning steps are empty placeholders. The knowledge checks and scenario are strong, but the gate will likely fail on the worked example score.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
