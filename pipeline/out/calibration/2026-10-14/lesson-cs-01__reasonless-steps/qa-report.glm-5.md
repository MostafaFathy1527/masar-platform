# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.62 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 2 ⚠ | Every step in the worked example provides the same justification — 'Because it is the next step' — which asserts that the action is correct without explaining the underlying judgement or principle. This fails to distinguish the worked example from a printed solution. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong on authenticity, bilingual quality, and knowledge-check design, but the worked example fails to teach because its reasoning is circular and generic. The mean is dragged down significantly by the worked example score.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
