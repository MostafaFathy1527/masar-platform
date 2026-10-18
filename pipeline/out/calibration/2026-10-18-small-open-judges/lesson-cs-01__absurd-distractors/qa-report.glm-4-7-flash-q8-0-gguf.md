# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.50 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 |  |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | The distractor options (e.g., 'Order lunch for the team,' 'Restart your computer') are implausible and do not reflect common misconceptions. They function as noise rather than effective alternatives to the correct answer. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson demonstrates high quality in the worked example, scenario, and bilingual text. The knowledge checks suffer from implausible distractors, lowering the score significantly. The mean (4.5) clears the pass threshold.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
