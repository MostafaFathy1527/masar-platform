# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 4.12 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 4 |  |
| knowledge check | 1 ⚠ | Knowledge checks contain implausible distractors (e.g., 'Order lunch for the team') and feedback for distractors only states 'Not correct' without explaining misconceptions. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 3 | Compliant but minimal; no teaching point on accessibility constraints despite being a core concept in the lesson. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> Knowledge_check scored 1, below the 3 threshold. The lesson fails the gate despite a mean score of 4.125. The knowledge checks are unusable due to fundamentally flawed distractors.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
