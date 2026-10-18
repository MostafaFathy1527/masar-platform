# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 1 ⚠ | Distractors are implausible (e.g., 'Order lunch for the team first') and nobody would choose them, with minimal feedback ('Not correct.') for incorrect options. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 3 | Compliant but without using the constraint as a teaching point. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> Knowledge_check scored 1 due to implausible distractors. Accessibility_ip scored 3 as the lesson is compliant but lacks the constraint teaching point. Mean score 4.25.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
