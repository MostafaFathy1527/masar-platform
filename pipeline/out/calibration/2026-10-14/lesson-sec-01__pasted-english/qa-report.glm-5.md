# QA gate report — recognising-a-phishing-email

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
| bilingual quality | 1 ⚠ | The lesson declares bilingual: true, but the Arabic content is identical to the English content in every block (headings, prose, definition cards, takeaways, worked example steps, scenario situation, and knowledge check items). The Arabic text reads as English text placed in Arabic fields, rather than translated content. This fails the criterion that Arabic must be natural and not a literal rendering or, in this case, no rendering at all. |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The instructional design is strong, with a worked example that clearly explains the reasoning for each check and a scenario with realistic friction. However, the bilingual quality scores a 1 because the Arabic fields contain untranslated English text, which fails the declared bilingual requirement.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
