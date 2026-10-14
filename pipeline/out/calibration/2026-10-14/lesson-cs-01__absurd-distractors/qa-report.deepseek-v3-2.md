# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 | L1 is a collection of rich text, definitions, tips, and takeaways. It lacks the required 'visual card' block for L1, which is a structural requirement of the level. |
| worked example | 5 |  |
| knowledge check | 1 ⚠ | Two distractors in each question are nonsensical ('Order lunch for the team', 'Restart your computer', 'Change the colour of the screen') and nobody would ever choose them. This fails the core requirement for plausible distractors drawn from real misconceptions. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong in objective alignment, scenario authenticity, and bilingual quality. However, the knowledge checks are critically flawed with implausible distractors, and the L1 block structure does not include a visual card.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
