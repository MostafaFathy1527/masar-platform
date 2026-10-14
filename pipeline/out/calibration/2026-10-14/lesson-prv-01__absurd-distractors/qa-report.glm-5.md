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
| knowledge check | 1 ⚠ | Three of the four distractors across the two items are absurd non-sequiturs ('Order lunch for the team first', 'Restart your computer', 'Change the colour of the screen') that no learner would select. This fails the basic requirement that distractors must be drawn from real misconceptions. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The instructional content is excellent, with a realistic scenario and a worked example that clearly explains the reasoning for each step. However, the knowledge checks are critically flawed by distractors that are random noise rather than plausible errors, which makes the assessment component ineffective.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
