# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | Both knowledge checks use three identical implausible distractors ('order lunch', 'restart computer', 'change screen colour') that nobody would ever choose in a customer service context. These are not drawn from real misconceptions and teach nothing. The feedback on wrong answers merely states 'Not correct' without naming any misconception. This pattern repeats across both items, suggesting placeholder distractors that were never replaced with meaningful alternatives. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The worked example and scenario are strong, with authentic friction and clear reasoning. The knowledge checks are severely compromised by nonsensical distractors that violate the core requirement of drawing from real misconceptions. The lesson would benefit from replacing these placeholder options with plausible errors an agent might actually make.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
