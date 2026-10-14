# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.12 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 3 | L2 worked example is thin and its steps lack substantive reasoning; it feels like an L1 with a question appended. |
| worked example | 2 ⚠ | Steps assert actions ('Because it is the next step') with no explanation of the *why* — the reasoning is generic and circular. |
| knowledge check | 4 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong on objective alignment, scenario authenticity, and bilingual quality. However, the L2 worked example is critically weak, providing no real reasoning. The knowledge checks are plausible but could be stronger on misconception naming. The floor score on worked example triggers a gate failure.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
