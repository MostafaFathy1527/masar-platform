# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.12 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 |  |
| worked example | 4 |  |
| knowledge check | 4 |  |
| scenario authenticity | 1 ⚠ | The consequence texts are rotated one position off the options they belong to. d1 ('transfer and end the chat') carries the consequence for promising an outcome you cannot deliver — which is d2's action. d2 ('promise the waiver and let the other team sort it out') carries the warm-handover praise that belongs to d3. d3 (marked isBest) carries the consequence describing the customer re-explaining everything after a transfer without handover — which is the failure of d1, and reads as negative feedback on the correct answer. The situation itself is authentic and the options are plausible, but as written the scenario would punish the right choice and reward the wrong ones; it is internally broken, not merely frictionless. |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** scenario_authenticity. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> Seven of eight criteria are strong: the prose is tight, the Arabic is native and precise, the worked example reasons rather than asserts, and both knowledge checks use distractors drawn from real agent behaviour with feedback that names the misconception. The scenario block, however, has its consequence texts misassigned — the option flagged best is given the failure consequence of the transfer option, and the worst option is given the praise — which breaks the block's teaching logic and scores 1. That single criterion sits below the floor of 3 regardless of the high mean elsewhere.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
