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
| knowledge check | 1 ⚠ | Both knowledge checks contain two distractors that are complete nonsense ('Order lunch for the team first', 'Restart your computer', 'Change the colour of the screen'). These are not plausible misconceptions; they are filler. A score of 1 is required for 'implausible distractors'. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson content is excellent, with a strong worked example and natural Arabic translation. However, the knowledge checks fail the most basic quality bar by including distractors that no learner would ever select, indicating a generation failure rather than a design choice.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
