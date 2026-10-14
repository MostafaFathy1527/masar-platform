# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 | L1 is a strong concept introduction, but L2's scenario and worked example are excellent, making the level fidelity high overall. Minor point: L1 is primarily declarative, but the rubric's concern about 'visual card as bulleted list' does not apply here. |
| worked example | 5 |  |
| knowledge check | 1 ⚠ | Distractors are implausible and teach nothing (e.g., 'Order lunch for the team first', 'Change the colour of the screen'). Feedback is minimal and does not name a misconception. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong in most areas, with excellent objective alignment, scenario authenticity, and bilingual quality. However, the knowledge checks are catastrophically poor, with distractors no one would choose and feedback that fails to teach. This results in an automatic gate failure due to the floor threshold.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
