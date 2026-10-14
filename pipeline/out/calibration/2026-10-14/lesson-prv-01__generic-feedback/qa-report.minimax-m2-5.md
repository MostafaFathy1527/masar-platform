# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 4.62 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | Both knowledge checks use feedback that only says 'Correct' or 'Not correct' without explaining the misconception behind each distractor. For example, KC01 option 1 ('No, because it contains no names') reflects a real misconception about the identifiability test, but the feedback 'Not correct' doesn't tell the learner WHY that reasoning is wrong. Same issue in KC02. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> One criterion scores 2 (knowledge_check) due to feedback that merely restates correctness rather than naming the misconception. The mean is 4.625, which passes, but the knowledge checks are significantly weaker than the rest of the lesson.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
