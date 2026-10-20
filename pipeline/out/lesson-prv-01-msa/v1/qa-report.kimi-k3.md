# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 3.62 over 8 scored criteria (threshold 4.0); lowest criterion 3 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 3 | Steps 1–2 give real reasoning (ward size as the thing that would change the call; health data sensitive regardless of provenance), but step 3's 'why' restates its conclusion, and the final answer adds same-day reporting — an action no step develops or justifies. The solution outruns the worked steps. |
| knowledge check | 3 | Distractors are mostly plausible, but the feedback convention is broken: every incorrect option's feedback states the correct reasoning prefixed with 'Misconception:' (e.g., 'Misconception: proper deletion is not a breach'), which restates the answer under the wrong label instead of naming the error a chooser of that option would actually hold. Worse, KC-01's first distractor (street address without apartment number) is marked not-personal-data on a 'missing details' rationale that contradicts the lesson's own identifiability test. KC-01 also recycles three of the six sort-bucket cards, so the check largely re-asks the sort activity. |
| scenario authenticity | 4 |  |
| bilingual quality | 3 | Arabic is accurate and mostly readable but carries repeated English calques: 'إذا طلب النموذج تاريخ الميلاد ولم يستخدمه العملية أبدًا' (gender disagreement — العملية is feminine), 'ولهذا السبب هذا هو أكثر أنواع الخروقات شيوعًا', 'القناة المريحة' for 'the convenient channel', 'فهذا الحقل مسؤولية وليس راحة' for 'liability, not convenience', 'بنفس قدر تحديد اسمه' for 'as surely as their name', and 'just in case' rendered as 'للتأكد فقط', which shifts the meaning. Terminology itself is consistent. |
| concision | 4 |  |
| accessibility ip | 4 | No images (so no alt-text failures), no colour-carried meaning, and the diagnosis code is the invented 'DX-A102' — no licensed descriptors or policy text. Compliant but does nothing to surface the constraint as a teaching point; the emoji-icon definition cards are fine but the compliance is minimal rather than exploited. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Mean 3.62 is below 4.0.**

Judge's summary:

> A solid, well-structured lesson whose L2 practice is genuine — the scenarios in particular have real friction (the approved-channel trap, the delete-vs-retention-policy tension). Its weak points are the knowledge checks, where feedback mislabels correct explanations as misconceptions and one distractor teaches against the lesson's core principle, and Arabic that is serviceable but visibly translated in the prose blocks. The worked example's answer also asserts a reporting step its reasoning never walks through.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
