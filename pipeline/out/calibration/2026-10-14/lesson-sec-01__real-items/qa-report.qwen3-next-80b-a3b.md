# QA gate report — recognising-a-phishing-email

**Result: PASS**

Mean 4.75 over 8 scored criteria (threshold 4.0); lowest criterion 3 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 3 | Two distractors restate the stem rather than naming a misconception. For KC-01, 'quality of formatting' and 'logo presence' are plausible but do not name real, common misconceptions held by users — they are generic. For KC-02, 'delete the message' and 'wait to see' are plausible, but 'reply to sender' is the only distractor that reflects a real, frequent user error — the others are too vague to be diagnostic. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.


Judge's summary:

> One criterion at 3; mean 4.6. Passes, but the knowledge checks lack diagnostic depth — distractors should reflect actual user errors, not just incorrect assumptions.
