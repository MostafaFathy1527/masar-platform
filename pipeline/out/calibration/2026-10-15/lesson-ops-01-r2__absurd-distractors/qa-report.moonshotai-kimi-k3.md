# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 3.50 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 4 | Each step shows what and why, and two whys name the judgment (status as fact not feeling; deadline protects the promise), but two are generic restatements ('lets the receiver locate the ticket quickly', 'prevents repeating the same attempts') and none state what would change the judgment. |
| knowledge check | 1 ⚠ | In both items, three of four options are joke distractors nobody would choose ('Order lunch for the team first', 'Restart your computer', 'Change the colour of the screen') — identical across both stems and unrelated to either. Their feedback is bare 'Not correct.' with no misconception named. Only the correct option carries real feedback. This is the rubric's named failure: implausible distractors and feedback that restates the verdict. |
| scenario authenticity | 4 |  |
| bilingual quality | 3 | Mostly natural Arabic, but contains a number–gender agreement error ('ثلاث سطور' for masculine سطر; should be 'ثلاثة سطور') and several calques of English phrasing: 'وقد يقرأ الزميل الأول ويظن أن لا شيء عاجل' (for 'a reader who stops at the first assumes nothing is urgent'), 'هذا من الأخطاء الشائعة بعينه' (failing to carry 'word for word'), and 'تعلن افتراضًا' (for 'announces an assumption'). Reads as accurate translation, not as written in Arabic. |
| concision | 4 |  |
| accessibility ip | 4 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.
**Mean 3.50 is below 4.0.**

Judge's summary:

> The lesson body is competent — aligned blocks, genuine L1/L2 separation, a worked example with real if uneven reasoning, and a scenario with authentic friction (arrival order versus urgency). It is failed by its knowledge checks, where every distractor is a throwaway joke option with empty feedback, the exact failure this rubric names. The Arabic is serviceable but shows translation artefacts and at least one grammatical error.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
