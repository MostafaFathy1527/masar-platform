# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 4.62 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | Feedback on distractors is thin and unhelpful ('Not correct.'), failing to explain the misconception behind each wrong choice. The correct answer feedback merely restates 'Correct.' without reinforcing the rationale. This represents a significant missed opportunity to teach through the check. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson content is strong, with a realistic scenario and a worked example that clearly explains the reasoning behind each step. However, the knowledge checks fail to provide meaningful feedback for incorrect answers, scoring a 2 on that criterion.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
