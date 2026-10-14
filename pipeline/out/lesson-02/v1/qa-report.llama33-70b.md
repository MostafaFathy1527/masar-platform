# QA gate report — plans-benefits-and-member-liability

**Result: FAIL**

Mean 4.00 over 5 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| bilingual quality | 1 ⚠ | The lesson is declared as not bilingual, but this criterion is scored because the lesson contains some Arabic text. However, the Arabic text is not consistent and appears to be a literal translation of the English text in some places. |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Not scored at this lesson's levels:**

- `worked example` — The lesson contains a block of type 'rich_text' that explains how to calculate a member's liability, but it does not provide a step-by-step example with reasoning. However, the lesson is at level L1, and this criterion is not applicable at this level.
- `knowledge check` — The lesson does not contain a knowledge check, and this criterion is not applicable at level L1.
- `scenario authenticity` — The lesson does not contain a scenario, and this criterion is not applicable at level L1.

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson scores well on most criteria, but the bilingual quality is low due to inconsistent Arabic text. The lesson is at level L1, and some criteria are not applicable at this level.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
