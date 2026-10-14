# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 3.75 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 3 | L2 is present with worked example and scenario, but the knowledge checks are broken — three of four distractors in each are nonsense options (order lunch, restart computer, change screen color). This makes L2's assessment component non-functional. |
| worked example | 5 |  |
| knowledge check | 1 ⚠ | Both knowledge checks have three distractors that are absurd non-sequiturs ('order lunch for the team', 'restart your computer', 'change the colour of the screen'). These are not drawn from real misconceptions; nobody would choose them. The feedback on wrong answers is 'Not correct' with no explanation. This is a catastrophic failure of the knowledge-check construct. |
| scenario authenticity | 4 |  |
| bilingual quality | 4 | Arabic is generally natural, but occasional stiffness appears in phrases like 'العدّاد بدأ منك' and 'الحسّاس أعلى معياراً'. The 'why' explanations in the worked example flow better in English than Arabic. |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.
**Mean 3.75 is below 4.0.**

Judge's summary:

> Knowledge check scores 1 due to absurd distractors and useless feedback. Level fidelity scores 3 because L2's assessment mechanism is broken despite other blocks functioning. Mean would be 3.43; with a floor of 1, automatic gate failure.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
