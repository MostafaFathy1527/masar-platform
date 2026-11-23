# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 | Every block serves PRV-01, but the L1 takeaways assert points L1 never teaches: data-subject requests (takeaway 5) and need-to-know sharing (takeaway 4) have no L1 content — only sensitive data and potential breach get definition cards. An L1-only learner is told to remember things they were not taught. |
| level fidelity | 5 |  |
| worked example | 4 | Steps show what and why, and step 3 names the test (does it serve the task). But step 4's 'why' (preventing the colleague asking someone else tomorrow) justifies the explanation, not the withholding itself, and the steps stop short of what would change the decision — a true need for names, a larger team where aggregation fails. Meets the letter of the rubric, not its full depth. |
| knowledge check | 5 |  |
| scenario authenticity | 1 ⚠ | The situation itself is excellent (autocomplete wrong-recipient, 5 pm), but the consequences are miswired. d1 ('recall and watch', marked wrong) carries the consequence that begins 'The correct action. A fast report is containable...' — text that belongs to d2. d2 (the correct option) carries the rebuttal to d3's 'not sensitive' reasoning ('personal data even if not sensitive... fixing the send does not undo the disclosure'). d3 carries the rebuttal to d1 ('recall rarely works outside your organisation... waiting hides that the clock started'). As shipped, choosing the wrong answer is praised as correct and choosing the right answer is answered with a rebuttal to an option the learner did not pick. The scored experience is broken regardless of how authentic the setup is. |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** scenario_authenticity. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The scenario block's consequence payloads are rotated across the three decisions: the incorrect recall option is congratulated as 'the correct action', and the correct report option receives the rebuttal meant for the resend option. That is an automatic 1 on scenario authenticity and a gate failure on the floor criterion. Everything else is strong — the knowledge checks are the best part, with distractors drawn from real misconceptions — but this lesson cannot ship until the consequence mapping is fixed.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
