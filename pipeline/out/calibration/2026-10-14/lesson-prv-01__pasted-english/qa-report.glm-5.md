# QA gate report — what-counts-as-personal-data

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
| bilingual quality | 1 ⚠ | The lesson declares bilingual: true, but the Arabic content is a 100% identical copy of the English content (e.g., 'The question is not "is there a name on it?"' appears verbatim in the Arabic field). This is not translation; it is English text in an Arabic field, which is a total failure of the bilingual criterion. |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The instructional design is strong, with a worked example that clearly explains the 'why' and knowledge checks with plausible distractors. However, the lesson fails completely on bilingual quality because the Arabic fields contain untranslated English text, which scores a 1.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
