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
| knowledge check | 2 ⚠ | Both knowledge checks have three distractors that are completely implausible (ordering lunch, restarting computer, changing screen colour) — these are not real misconceptions anyone would hold. The feedback merely restates the correct answer without explaining the misconception. This is the weakest part of the lesson. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> Four criteria scored at 5, one at 2, mean 4.0. The knowledge checks are the significant weakness — they use implausible distractors that teach nothing, and the feedback does not name misconceptions. The scenario and worked example are strong. Passes the floor but barely misses the mean threshold due to knowledge_check.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
