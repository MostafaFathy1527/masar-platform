# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 3 | Feedback for incorrect options is thin, lacking explanation of misconceptions. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 1 ⚠ | Missing alt text on images (e.g., icons in definition cards). This is an automatic 1. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** accessibility_ip. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson effectively teaches phishing recognition with concise, authentic content. However, it fails due to missing alt text for icons, resulting in an automatic 1 on Accessibility and IP.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
