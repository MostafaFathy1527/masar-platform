# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.62 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | The feedback for all incorrect options in both checks is a bare 'Not correct' (or 'غير صحيح') that restates the answer status without naming the underlying misconception or explaining why the option is wrong. The correct option feedback is merely 'Correct'. This fails the rubric requirement for per-option feedback that explains 'why' rather than restating the answer. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson's instructional design, worked example, and Arabic translation are all of high quality and tightly aligned to the objective. However, the knowledge checks are a significant weakness, scoring a 2 because the feedback is mechanically thin and fails to teach from the wrong answers.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
