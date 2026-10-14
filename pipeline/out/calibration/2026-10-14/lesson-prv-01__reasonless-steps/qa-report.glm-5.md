# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 4.50 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 |  |
| worked example | 2 ⚠ | The worked example fails to explain the reasoning behind its steps. Every step in both Arabic and English offers the same circular justification ('Because it is the next step'), which provides no pedagogical value and fails to show the learner *why* a decision is made, rendering the block a printed solution rather than a worked example. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong in authenticity, bilingual quality, and knowledge-check design, with distractors that target specific misconceptions. However, the worked example is a critical failure; it asserts the correct steps without providing any reasoning, offering only a circular 'because it is the next step' explanation.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
