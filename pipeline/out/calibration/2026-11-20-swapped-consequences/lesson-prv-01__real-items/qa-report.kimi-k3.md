# QA gate report — what-counts-as-personal-data

**Result: PASS**

Mean 4.88 over 8 scored criteria (threshold 4.0); lowest criterion 4 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 4 | Arabic is fluent, idiomatic MSA with strong economy (إصلاح الإرسال لا يُلغي ما أُفصح عنه) and consistent terminology (إمكانية التعرّف, البيانات الحسّاسة, العدّاد, طلب صاحب البيانات). Held at 4 for a handful of slight constructions: the cognate السؤال الذي تسأله where تطرحه would be more idiomatic, بيقين where بكل تأكيد reads more naturally in register, and the heavy chaining of مع in مسمّى وظيفي مع قسم مع تاريخ التحاق. English renderings like handle it are looser than the Arabic يتعامل معها. Nothing approaches machine-translation word order; the Arabic clearly leads rather than follows the English. |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.


Judge's summary:

> Every block earns its objective, the L2 is a genuine apply-and-decide level (worked example with real 'why' reasoning, an autocomplete-wrong-recipient scenario with authentic friction including the 5 pm pull to wait), and both knowledge checks use distractors drawn from misconceptions people actually hold, with feedback that names the error rather than restating the answer. No licensed code sets or payer text anywhere, so no automatic floor hit on criterion 8. The only sub-5 is bilingual quality at 4: the Arabic is natural and terminology-consistent, with a few mildly stiff constructions keeping it short of 'would not change a word'.
