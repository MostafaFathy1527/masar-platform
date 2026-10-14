# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.50 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 |  |
| worked example | 2 ⚠ | The worked example steps fail to explain the reasoning behind the actions. Every step's 'why' is a circular restatement ('Because it is the next step') rather than naming the specific judgement or evidence being evaluated, reducing the example to a procedure list rather than a teaching tool. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong on content, scenario authenticity, and bilingual quality, but the worked example fails to meet the rubric's core requirement of showing *why* each step is taken. This single criterion pulls down an otherwise excellent lesson.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
