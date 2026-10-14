# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 4.12 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 | All blocks serve PRV-01, but data_subject_request is a declared introduced concept that is never taught before it is assessed: it appears only as one takeaway bullet, then KC-02 tests it. Coverage gap, not misalignment. |
| level fidelity | 4 | L1 delivers real definition cards and takeaways; L2 is genuinely decision-oriented (worked example plus consequential scenario), not an L1 with a question bolted on. Held below 5 because the L2 worked example's reasoning layer is broken, which thins the L2 experience. |
| worked example | 2 ⚠ | Every step's why-field is the identical placeholder "Because it is the next step." / "لأنها الخطوة التالية." — the reasoning slot carries no reasoning at all, the exact assert-without-why failure. The show text embeds partial justification (steps 1 and 3 name the judgement), which keeps it above a 1, but no reviewer would accept this field as written. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 4 | Arabic is natural and rhetorically strong ("العدّاد بدأ منك", "القناة المريحة هي غالباً القناة الخاطئة") with consistent terminology (إمكانية التعرّف، الاختراق المحتمل، مسؤول الخصوصية). Occasionally compressed to the point of stiffness ("الحسّاس أعلى معياراً") and the parallel EN/AR structure reads translation-derived in places; not written-in-Arabic throughout. |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson's strengths are real: both knowledge checks draw distractors from genuine misconceptions with feedback that names the error, and the autocomplete mis-send scenario at 5 pm is recognisable with authentic friction. The worked example is the weak point — its why-field is a repeated content-free placeholder on all four steps, which is the canonical worked-example failure and pulls that criterion to 2. Everything else sits at 4–5, but the worked example needs a rewrite of its reasoning layer before this lesson is what it claims to be.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
