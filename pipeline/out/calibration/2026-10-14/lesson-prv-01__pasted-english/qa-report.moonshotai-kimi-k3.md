# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 4.00 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 5 |  |
| worked example | 4 |  |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 1 ⚠ | The lesson declares bilingual: true, but every *Ar field — title, body, definition cards, worked example, scenario, takeaways, and both knowledge-check items with all feedback — contains the identical English text as the *En field. There is no Arabic on the page to assess; this is below even 'a literal rendering of English word order'. Scored 1 against the lesson's own bilingual declaration, per the applicability note. |
| concision | 5 |  |
| accessibility ip | 3 | Compliant on IP: no licensed code descriptors, payer policy text, or denylisted terms, and no colour-only meaning. Held at 3 because there is nothing beyond compliance — no images or alt text present, and the opportunity to use the regime-neutral drafting ('in most regimes') as an explicit teaching point about jurisdiction-dependence is left implicit. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> In English this is a strong lesson: the worked example reasons through a real decision, the knowledge-check distractors are drawn from live misconceptions, and the autocomplete scenario has genuine friction. But the bilingual declaration is unmet in the most literal sense — every Arabic field is English — so bilingual_quality is a 1. Mean 4.0 with one criterion below the floor; the gate decides.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
