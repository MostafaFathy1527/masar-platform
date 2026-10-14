# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.50 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 1 ⚠ | The lesson declares bilingual: true, but the Arabic content is entirely identical to the English content. The Arabic text follows English word order, uses English punctuation conventions, and appears to be an untranslated copy-paste of the English source. This fails the criterion that Arabic must read as though written in Arabic. |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The instructional content is excellent, with a worked example that models the 'why' behind each step and a scenario with genuine friction. However, the bilingual quality is a critical failure: the Arabic text is not a translation but a duplicate of the English, which constitutes a false claim on the lesson's bilingual declaration.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
