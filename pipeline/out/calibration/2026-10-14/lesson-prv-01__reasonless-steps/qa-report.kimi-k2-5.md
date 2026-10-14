# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 3.75 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 3 | L2 is present but thin. The worked example is the only substantial L2 element; the two knowledge checks and one scenario do not fully distinguish L2 from L1. The 'visual' elements are definition cards with icons, not true visual cards, but this is borderline. |
| worked example | 2 ⚠ | Critical failure: every step's 'why' is identical placeholder text ('Because it is the next step') in both Arabic and English. This completely defeats the purpose of a worked example. The steps show what to do but never explain the reasoning behind each decision. |
| knowledge check | 4 |  |
| scenario authenticity | 4 |  |
| bilingual quality | 4 | Generally natural Arabic, but occasional stiffness. 'لأنها الخطوة التالية' is particularly awkward as repeated filler. Some constructions like 'العدّاد بدأ منك' and 'العدّاد بدأ من يوم الوصول' are slightly telegraphic. |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.
**Mean 3.75 is below 4.0.**

Judge's summary:

> The worked example is severely compromised by placeholder reasoning text, scoring 2. Level fidelity at 3 reflects thin L2 differentiation. Knowledge checks are actually strong with plausible distractors and good feedback. Mean 3.75 with one criterion at 2.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
