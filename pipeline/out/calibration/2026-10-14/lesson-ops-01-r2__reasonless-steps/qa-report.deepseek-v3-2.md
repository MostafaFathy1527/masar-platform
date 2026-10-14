# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 4.12 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 |  |
| worked example | 2 ⚠ | Every 'why' step simply repeats 'Because it is the next step.' This asserts the answer with no reasoning about the judgement being made or what would change it. |
| knowledge check | 4 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 4 | The Arabic is accurate and clear, but occasionally reads as a direct translation (e.g., 'لأنها الخطوة التالية' in the worked example). It is not consistently fluid as if written natively. |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The worked example is a critical failure, scoring 2. The knowledge checks are strong, and the scenario is highly authentic. The Arabic is functional but occasionally stiff.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
