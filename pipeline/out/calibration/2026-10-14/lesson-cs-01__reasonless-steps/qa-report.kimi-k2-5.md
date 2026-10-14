# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.12 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 3 | The L2 worked example is structurally present but its 'why' fields are completely hollow ('Because it is the next step' repeated four times). This is an L1 lesson with a worked example bolted on that fails to deliver the promised reasoning depth. The visual distinction between L1 and L2 is minimal beyond this one broken block. |
| worked example | 2 ⚠ | Every single 'why' field contains only 'لأنها الخطوة التالية' / 'Because it is the next step'. This is not reasoning — it is assertion masquerading as explanation. The worked example promises to show 'what to do and why' but delivers only the former. This is a printed solution, not a worked example. The final answer paragraph is excellent, but the steps themselves fail the criterion entirely. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> Two criteria below 4, with worked_example at 2 due to completely hollow reasoning fields. The knowledge checks are genuinely strong with plausible distractors and specific misconception-naming feedback. The scenario is authentic with real friction. The bilingual quality is natural Arabic throughout. The worked example failure is severe and central to what L2 promises.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
