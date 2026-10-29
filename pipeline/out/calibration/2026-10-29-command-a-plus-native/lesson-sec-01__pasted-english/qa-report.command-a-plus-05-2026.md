# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 3 | The worked example provides reasoning for each step, but it does not explicitly name the judgement being made and what would change it, which is required for a 5. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 1 ⚠ | Arabic text is a literal copy of the English text, not a translation, and reads as machine output rather than natural Arabic. |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson performs strongly on objective alignment, level fidelity, knowledge checks, scenario authenticity, concision, and accessibility, but its bilingual quality is a literal rendering and its worked example lacks explicit judgement naming. These issues result in scores below 3 on two criteria, causing the gate to fail.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
