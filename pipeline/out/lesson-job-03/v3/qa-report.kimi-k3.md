# QA gate report — writing-a-clear-work-message

**Result: FAIL**

Mean 3.62 over 8 scored criteria (threshold 4.0); lowest criterion 3 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 4 |  |
| knowledge check | 3 | The correct option in both checks is the worked example's answer verbatim — the learner has seen that exact message three times before KC-02, so the labelled APPLY items test recognition of the example, not transfer to a new situation. Distractors are plausible and per-option feedback does name the defect, but both checks also sample only purpose-first/ask/subject-line; tone, pre-send check, and replying are taught and never assessed. Correct answers are also the longest, most complete option in both items. |
| scenario authenticity | 3 | Plausible and recognisable, but frictionless: no competing pressure (the background context might genuinely matter, seniority, CC list, time pressure). Option d3 (split into two messages) is a strawman nobody would choose, so the real choice is binary. |
| bilingual quality | 3 | Accurate and mostly readable MSA, but carries translation artefacts: 'إذا لا يمكنك الإجابة الآن' follows English word order ('if you cannot'), 'يحقق أفضل ممارسات' is a calque of 'achieves best practices', and there is a gender-agreement error in scenario d2 ('وتظهر الطلب الواضح' — الطلب is masculine, يظهر). Terminology for the seven concepts is consistent across blocks. |
| concision | 4 |  |
| accessibility ip | 4 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Mean 3.62 is below 4.0.**

Judge's summary:

> Objective alignment, level structure, worked example, concision, and compliance are solid 4s; the lesson's weak half is assessment and polish. The knowledge checks give away their answers by lifting the worked example verbatim, the scenario is plausible but frictionless with one strawman option, and the Arabic is serviceable but marked by calques and one agreement error. Three criteria at 3, mean 3.6; the gate applies the thresholds.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
