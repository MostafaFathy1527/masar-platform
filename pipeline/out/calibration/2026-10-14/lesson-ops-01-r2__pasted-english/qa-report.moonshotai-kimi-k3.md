# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 3.38 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 3 | Each step has a 'why', but the reasons are the lesson's rules restated rather than the judgement being made. Step 2's why ('shows the status as a fact, not a feeling') is circular, and no step addresses what would change the call — e.g., why 4 PM specifically (the customer's end-of-day request is in the prompt but never connected), or why a call rather than a message. |
| knowledge check | 5 |  |
| scenario authenticity | 4 |  |
| bilingual quality | 1 ⚠ | The lesson declares bilingual: true, but every Arabic field (textAr, mdAr, defAr, labelAr, detailAr, promptAr, showAr, whyAr, answerAr, optionAr, consequenceAr, feedbackAr, stemAr, rationaleAr, itemsAr, titleAr) contains identical English text. There is no Arabic anywhere in the lesson. Scored against its own declaration, this is a total failure of the criterion — worse than literal translation, since no Arabic rendering exists at all. |
| concision | 3 | The prose itself is lean, but content is duplicated: the four-question process flow appears in L1 and again in L2 with near-identical steps, and the definition card for 'shift handover' restates the intro's definition almost verbatim. That material is removable without loss. |
| accessibility ip | 3 | Compliant: no licensed code descriptors, payer policy text, or denylisted terms; no colour-dependent meaning. But the lesson contains no images, so the alt-text requirement is never exercised, and the constraint is not used as a teaching point. Minimal compliance. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** bilingual_quality. A single unacceptable criterion fails the gate regardless of the mean.
**Mean 3.38 is below 4.0.**

Judge's summary:

> The instructional core is sound: the knowledge checks are the strongest element, with distractors drawn from real, recognisable misconceptions and feedback that names the error rather than restating the answer. The decisive failure is bilingual_quality: the lesson declares itself bilingual yet ships English in every Arabic field, which is an automatic gate failure on the floor threshold regardless of the other scores. The worked example's reasoning and the duplicated process flow are secondary weaknesses worth fixing on the same pass.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
