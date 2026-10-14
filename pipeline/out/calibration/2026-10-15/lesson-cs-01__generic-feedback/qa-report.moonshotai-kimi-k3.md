# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 3.75 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 4 |  |
| knowledge check | 2 ⚠ | Distractors are plausible and drawn from real agent failure modes (apologising for the feeling, cold transfer, over-promising, vague close, pushing the follow-up onto the customer), but per-option feedback is literally 'صحيح.'/'غير صحيح.' — 'Correct.'/'Not correct.' — on every option of both items. That names no misconception and teaches nothing; it is worse than restating the stem. The rationales do the explanatory work the feedback refuses to do, but the rubric scores per-option feedback, and it is uniformly empty. |
| scenario authenticity | 4 |  |
| bilingual quality | 4 |  |
| concision | 4 |  |
| accessibility ip | 4 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.
**Mean 3.75 is below 4.0.**

Judge's summary:

> A strong, coherent lesson: every block serves the complaint-handling objective, the worked example's why-fields name the actual judgement being made, the scenario carries genuine friction (no authority, team unavailable tomorrow, a customer refusing to re-explain), and the Arabic is largely idiomatic with only occasional calques ('تجعله يحدث', 'هو حيث'). The one serious defect is the knowledge checks: plausible distractors paired with feedback that says nothing beyond Correct/Not correct, which is exactly the failure mode this criterion exists to catch. Mean 3.75 with one criterion at 2 — the gate will do what it does, but the checks need per-option feedback that names the misconception before this lesson is what it appears to be.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
