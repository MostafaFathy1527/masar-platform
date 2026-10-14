# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.62 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | Distractors are plausible, but feedback is extremely thin ('Not correct.'/'صحيح.'). It restates correctness rather than naming the misconception. This is a recurring failure mentioned in the rubric. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong on most criteria, with excellent alignment, level fidelity, and authentic scenarios. However, the knowledge-check feedback fails to explain why distractors are wrong, which is a core requirement. This is a significant weakness in an otherwise high-quality lesson.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
