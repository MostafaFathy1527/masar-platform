# QA gate report — writing-a-shift-handover

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
| bilingual quality | 1 ⚠ | The lesson declares bilingual: true, but all Arabic content fields (mdAr, textAr, termAr, defAr, etc.) contain English text identical to the English fields. There is no Arabic translation present. |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The instructional design is strong across all criteria, with a particularly effective worked example and scenario. However, the lesson fails the bilingual quality criterion entirely because it declares itself bilingual yet provides no Arabic translation, rendering the Arabic fields as English placeholders.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
