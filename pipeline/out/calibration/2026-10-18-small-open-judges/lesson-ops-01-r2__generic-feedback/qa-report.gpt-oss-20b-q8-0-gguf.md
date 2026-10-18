# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 4.38 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 1 ⚠ | Each option’s feedback simply repeats the answer label (e.g., "Correct" or "Incorrect") and does not explain why an option is right or wrong, missing the required misconception‑based explanation. The distractors also fail to represent real misconceptions. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 | Several explanatory passages, such as the introductory definition and some tip sections, could be shortened without changing the instructional intent, indicating mild redundancy. |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson scores highly on alignment, level, worked example, scenario, bilingual quality, and accessibility, but the knowledge checks are insufficient (score 1) and the concision is somewhat wordy. The mean score is 4.38, yet the presence of a criterion below 3 means it would fail the gate.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
