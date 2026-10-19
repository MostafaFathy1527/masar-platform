# QA gate report — writing-a-clear-work-message

**Result: FAIL**

Mean 3.38 over 8 scored criteria (threshold 4.0); lowest criterion 3 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 3 | Every step has a show/why pair, but the whys for steps 1 and 3 restate the definition cards almost verbatim ('subject line describes content for easy searching') rather than naming the judgment in this case or what would change it; only step 2 anchors the reasoning to the specific message. Reasoning present but largely generic. |
| knowledge check | 3 | Two structural problems. First, the correct options in both KC-01 and KC-02 are lifted nearly verbatim from the worked example (same Sara/March-order email; the exact subject line 'Confirmation of March order delivery date — please reply by Thursday'), so APPLY-level items can be answered by recognition rather than transfer to a new situation. Second, KC-01 option 2 is marked incorrect for containing 'two requests without numbering' — a numbering rule the lesson never teaches, and 'review section 2 and send feedback' reads as a single ask, so the distractor's incorrectness is contestable and its feedback asserts rather than names a real misconception. Distractors based on vague subjects and missing deadlines are plausible and their feedback is adequate. |
| scenario authenticity | 3 | The underlying situation (buried request, busy reader) is recognisable, but the framing is internally incoherent: the situation says 'You receive an email' and calls the reader busy, yet the decisions are about sending, rewriting, or splitting the message — actions that only make sense for the sender. The point-of-view slip makes the scenario read as unedited, and it is otherwise thin on concrete friction. |
| bilingual quality | 3 | Arabic is accurate and mostly readable MSA, not English word order throughout, but stiffness recurs: 'فقرة طويلة من المقدمة' (calque for 'long introductory paragraph'), 'الطلب المتعلق بشهر مارس' (calque; the subject line elsewhere uses the natural 'طلب مارس'), 'تحتاج إلى طلب تأكيد سارة' (ambiguous English-ordered phrasing), 'إذا لا يمكنك' (should be 'إن لم تتمكن'), plus a gender agreement error: 'أحد الرسائل' should be 'إحدى الرسالتين'. More than 'occasionally stiff' for a lesson this short. |
| concision | 3 | The job_tip 'Summary' and the takeaways block restate the same six rules back to back; one is removable without loss. The second paragraph of the overview ('Applying these rules ensures...') is also filler. Otherwise prose is tight, but this duplicated summary is clear padding. |
| accessibility ip | 4 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Mean 3.38 is below 4.0.**

Judge's summary:

> Level structure is genuine — L1 defines, L2 applies — and everything aligns to the objective, with a compliant IP/accessibility posture. The weaknesses cluster in L2's acting blocks: a worked example whose reasoning restates definitions, knowledge checks whose correct answers are given away by that example (plus one contestable distractor), a scenario with a sender/receiver framing error, and recurring Arabic stiffness with a grammar slip. No criterion below 3; mean 3.5.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
