# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 |  |
| worked example | 5 |  |
| knowledge check | 1 ⚠ | Two of the four knowledge checks contain distractors that are completely implausible and unrelated to the content (e.g., 'Order lunch for the team first,' 'Restart your computer,' 'Change the colour of the screen.'). These are not drawn from real misconceptions and teach nothing. This is a severe failure of the criterion, warranting the lowest score. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong in most areas, with excellent objective alignment, a high-quality worked example, authentic scenarios, and natural Arabic. However, the knowledge checks are catastrophically flawed, containing nonsense distractors that no learner would ever choose, resulting in an automatic low score for that criterion.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
