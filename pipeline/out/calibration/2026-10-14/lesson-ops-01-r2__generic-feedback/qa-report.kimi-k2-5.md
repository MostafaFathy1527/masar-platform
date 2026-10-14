# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 | L2 has the required interactive elements (process_flow, worked_example, scenario, sort_buckets, knowledge_checks), but the process_flow in L2 is thin—it's the same four questions from L1 with no additional depth or complexity. The level distinction exists but is minimal. |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | Both KC-01 and KC-02 have feedback that merely states 'Correct'/'Not correct' without naming misconceptions. The distractors in KC-01 (oldest first, hardest first, ticket number) are plausible errors someone might make, but the feedback explains nothing. In KC-02, the distractor 'nothing wrong' and 'needs more history' are real misconceptions that go unexplained. The 'delete the card mention' distractor is weak—nobody would think that—but the bigger failure is feedback that restates rather than teaches. |
| scenario authenticity | 5 |  |
| bilingual quality | 4 | Arabic is generally natural, but some constructions follow English patterns. 'الاختبار البسيط لتسليم ناجح' (the simple test of a successful handover) reads slightly English-ordered; 'اختبار بسيط لنجاح التسليم' would be more natural. 'الوعد الآن عليك' (the promise is now yours) is vivid and good. Some definitional phrasing like 'اللحظة التي ينتقل فيها' is textbook-accurate but stiff. |
| concision | 4 | The L1 definition cards are six in number and feel repetitive—each follows identical structure with no variation in depth. The rich_text intro is excellent and tight, but the block sequence could be condensed. The 'job_tip' block largely repeats the urgency point already made in the flow_questions detail. |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> Knowledge checks are the critical weakness: feedback restates answers rather than naming misconceptions, which is a recurring failure pattern. Level fidelity is acceptable but L2's process_flow adds little. Bilingual quality is competent but not fully natural. Mean score is 4.25, but the floor at 2 on knowledge_check will trigger gate failure.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
