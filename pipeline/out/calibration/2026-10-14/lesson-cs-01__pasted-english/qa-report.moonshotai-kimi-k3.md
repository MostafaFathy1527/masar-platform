# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.00 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 |  |
| worked example | 4 |  |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 1 ⚠ | The lesson declares bilingual: true, but every Ar field (titleAr, mdAr, defAr, itemsAr, showAr, whyAr, situationAr, optionAr, consequenceAr, and both knowledge checks' stemAr/feedbackAr/options) contains the English text verbatim. There is no Arabic anywhere — not translated Arabic, not machine Arabic, none. Scored against its own declaration per the applicability note: an Arabic-channel learner receives English, which fails the claim more severely than the 1-anchor of literal word-for-word rendering. |
| concision | 5 |  |
| accessibility ip | 3 | Compliant but minimal — the 3 anchor exactly. No licensed content, denylisted terms, or colour-carried meaning, but the two definition cards carry decorative icons (🗣️, 📌) with no alt text or aria-label, and there is no evidence of any accessibility consideration beyond absence of violations. No teaching use is made of the constraints. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> Pedagogically this is strong: plausible misconception-driven distractors with feedback that names the error, a worked example whose whys carry real judgement, and a scenario with genuine friction. But the bilingual declaration is false — every Arabic field is English text, which scores 1 against the declared bilingual: true claim and trips the floor regardless of the other scores. Accessibility is bare-minimum compliant with unlabelled decorative icons.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
