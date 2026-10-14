# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 3.88 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 4 |  |
| knowledge check | 5 |  |
| scenario authenticity | 2 ⚠ | The situations themselves are authentic and full of friction (double charge plus an ignored four-day email; a fee waiver you cannot authorise, the owning team in tomorrow, a customer refusing to re-explain). But every one of the three decision options in the L2 scenario carries identical placeholder consequence text — 'لهذا الاختيار عواقب' / 'This choice has consequences' — so the decision exercise as shipped has no consequences in it. The learner chooses and receives nothing. That is unfinished content at the heart of the lesson's only decision block, and it caps this criterion low however good the setups are. |
| bilingual quality | 4 | Arabic is natural, idiomatic and concise throughout (e.g. 'الصمت على المكالمة يُقرأ تخلّياً', 'الحل الذي لم يطلبه العميل هو شكوى ثانية'), with consistent terminology and no English word order. Not a 5 only because the quality of what is written cannot offset that some of it is placeholder — see scenario note. |
| concision | 4 |  |
| accessibility ip | 4 | No licensed code descriptors, payer policy text, or denylisted terms; no images requiring alt text; the definition-card icons are decorative and no meaning is carried by colour alone. Compliant, but minimal — the lesson does nothing to turn the constraint into a teaching point, which is what distinguishes a 5. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** scenario_authenticity. A single unacceptable criterion fails the gate regardless of the mean.
**Mean 3.88 is below 4.0.**

Judge's summary:

> Strong lesson on substance: worked-example steps each carry a real 'why', and both knowledge checks use distractors drawn from genuine agent behaviour with feedback that names the misconception rather than restating the stem. The decisive failure is the L2 scenario, whose decision consequences are placeholder strings on all three options, leaving the lesson's only practice decision with no feedback loop. One criterion below the floor at 2; mean 3.9 — the gate, not this judge, decides what that means.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
