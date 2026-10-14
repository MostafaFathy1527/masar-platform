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
| knowledge check | 1 ⚠ | Both knowledge checks contain distractors that are completely irrelevant to the lesson content (e.g., 'Order lunch for the team,' 'Restart your computer,' 'Change the colour of the screen'). These are not plausible misconceptions; they are nonsensical fillers that teach nothing. The feedback on these distractors merely restates 'Not correct' without explaining why or what the misconception is. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson content is strong, with a worked example that clearly explains the reasoning behind each step and a scenario with recognisable friction. However, the knowledge checks fail entirely, populated by distractors no learner would ever choose, which renders the assessment useless.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
