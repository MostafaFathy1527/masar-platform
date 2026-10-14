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
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 1 ⚠ | The lesson declares bilingual: true, but every Ar field (titleAr, textAr, mdAr, termAr, defAr, itemsAr, promptAr, showAr, whyAr, answerAr, situationAr, optionAr, consequenceAr, and every stemAr/feedbackAr in both referenced items) contains the English text verbatim. There is no Arabic on the page, so the declared Arabic channel delivers English to the learner. Scored against its own declaration, this is a total failure of the criterion — below even the floor anchor of a literal rendering. |
| concision | 5 |  |
| accessibility ip | 3 | No IP problem: no licensed code descriptors, payer text, or denylisted terms (generic security vocabulary only), and no images or colour-carried meaning, so nothing is inaccessible. But the rubric reserves 4 for a lesson that teaches the learner to write safely within the constraint, and this lesson does not engage the constraint at all — it is merely compliant. Compliant-but-minimal is a 3. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> On the English craft this is strong: the worked example's whys name the judgement and what would change it, both knowledge checks use distractors drawn from real, common misconceptions with explanatory feedback, and the scenario is a recognisable BEC attempt with genuine friction (spoofed tone, pre-empted phone channel, end-of-day pressure). The lesson nonetheless fails at the floor: it declares bilingual: true and ships English in every Arabic field, which is an automatic 1 on bilingual quality. The language-channel failure is the whole story here — everything else on the page earns its place.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
