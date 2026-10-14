# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 4.12 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | Both knowledge checks contain three implausible distractors that are completely unrelated to the domain (ordering lunch, restarting computer, changing screen color). These are not drawn from real misconceptions and would never be chosen by anyone with basic reading comprehension. The feedback on incorrect options is merely 'Not correct' with no explanation of why the choice is wrong or what misconception it represents. This fails the criterion that distractors should name actual misconceptions someone holds. |
| scenario authenticity | 5 |  |
| bilingual quality | 4 | Arabic is generally natural and reads as written in Arabic, not translated. Minor stiffness in some phrases like 'الاختبار البسيط' for 'simple test' and 'صفحة من السرد' for 'page of narrative', but overall competent. The four-question framework translates well. |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> Knowledge check criterion scores 2, which is below the floor of 3. This is an automatic gate failure. The worked example and scenario are strong, but the knowledge checks are essentially broken—three of four options are absurd non-sequiturs, making them useless for formative assessment.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
