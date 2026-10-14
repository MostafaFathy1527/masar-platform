# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 4.00 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 | L1 and L2 are genuinely experienced as understand-then-apply, but the L2 interactive process_flow is largely the L1 flow restated as imperatives; its added value is thin beyond the worked example that follows. |
| worked example | 4 | Each step has a 'why' and several name the judgement being made (fact not feeling, keeping the promise), but the reasoning is one short line per step and never addresses what would change the judgement — between 'generic' and 'names the judgement'. |
| knowledge check | 2 ⚠ | Distractors are plausible real misconceptions (order-by-arrival, short-is-fine, delete-the-mention overcorrection), but per-option feedback on both items is literally 'Correct.' / 'Not correct.' on every option — it names no misconception and explains nothing. The teaching content exists only in the rationale field, which is not what the learner sees per option. Thin on all options, not some, so below the 3 anchor; plausible distractors keep it off the 1 anchor. |
| scenario authenticity | 5 |  |
| bilingual quality | 4 | Arabic is natural and idiomatic in the prose blocks ('الوعد الآن عليك', 'الطول ليس المعيار'), with consistent terminology (عنصر مفتوح، عنصر عاجل، سجل مشترك). Minor stiffness in a few definition cards ('ما هو مجرد افتراض') reads as calqued on the English, keeping this short of a 5. |
| concision | 4 | Prose earns its space, but the four-step content appears three times in near-identical form (L1 flow, L2 flow, worked example); one pass could be trimmed without loss. |
| accessibility ip | 4 | Compliant: no licensed code descriptors, no payer policy text, no denylisted terms, meaning never carried by colour alone. Minimal rather than exemplary — compliance is not used as a teaching point and the icon-bearing definition cards carry no stated decorative-informative handling. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> A well-built lesson: coherent objective coverage, a genuinely recognisable scenario with real friction, and natural Arabic. Its clear weak point is the knowledge checks — plausible distractors undermined by feedback that says only 'Correct.' or 'Not correct.' on every option, which is exactly the failure mode this rubric exists to catch. Mean 4.0 with one criterion at 2; the gate decides the outcome.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
