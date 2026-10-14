# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 3.62 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 4 |  |
| knowledge check | 1 ⚠ | Both items fail the core requirement. In CS-01-KC-01 and CS-01-KC-02 alike, three of the four options are distractors nobody would ever choose ('Order lunch for the team first', 'Restart your computer', 'Change the colour of the screen') — absurd filler unrelated to any real misconception about complaint handling, and the same three filler options are copy-pasted across both items. The correct answer is identifiable by inspection without knowing anything about the objective. Feedback on every wrong option is the empty string 'Not correct' / 'غير صحيح', which neither names a misconception nor explains why. The plausible distractors that would teach something (apologising for the feeling rather than the event; the vague close 'someone will look into it') exist in the lesson's own prose but were never used. This is the rubric's definition of a 1. |
| scenario authenticity | 4 |  |
| bilingual quality | 4 |  |
| concision | 4 |  |
| accessibility ip | 4 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.
**Mean 3.62 is below 4.0.**

Judge's summary:

> The lesson body is strong: the worked example's 'why' fields name the judgement being made, the scenario has genuine friction (no authority, the team in tomorrow, a customer who refuses to re-explain), and the Arabic reads as written in Arabic with consistent terminology. The knowledge checks are a different story — joke distractors and empty feedback on every wrong option, scored 1 and the automatic floor failure regardless of the other seven criteria. Mean 3.75; whether it passes is the gate's call, but the fix is small and obvious: replace the filler options with the real misconceptions the lesson itself already names.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
