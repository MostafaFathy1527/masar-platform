# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.38 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 |  |
| worked example | 5 |  |
| knowledge check | 1 ⚠ | Distractors are implausible and teach nothing (e.g., 'Order lunch for the team first', 'Restart your computer', 'Change the colour of the screen'). Feedback for incorrect options is just 'Not correct' with no explanation of misconception. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong in most areas, with clear objectives, excellent worked examples, authentic scenarios, and natural bilingual prose. However, the knowledge checks are critically flawed with distractors nobody would ever choose and feedback that fails to teach.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
