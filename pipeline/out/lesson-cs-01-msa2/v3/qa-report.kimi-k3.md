# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 3.88 over 8 scored criteria (threshold 4.0); lowest criterion 3 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 4 |  |
| knowledge check | 3 | KC-01 has genuinely good distractors (premature apology, policy-defence, blaming the customer) with feedback that names each misconception, but its correct answer is near-verbatim the worked example's answer, so it rewards recognition over transfer. KC-02 is weaker: its three correct options are the three clauses of the L1 definition card's example split apart, there is only one distractor, and per-option feedback ('This is a specific action') restates the classification rather than explaining why. Plausible distractors, feedback thin on one of two items. |
| scenario authenticity | 4 |  |
| bilingual quality | 4 |  |
| concision | 4 |  |
| accessibility ip | 4 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Mean 3.88 is below 4.0.**

Judge's summary:

> Seven criteria at 4 and one at 3; mean 3.875. The lesson is aligned, lean, and mostly natural in Arabic, with an authentic record-vs-customer dispute at its centre. The knowledge checks are the weakest element: both lean on recycled lesson language, and KC-02's feedback asserts rather than explains.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
