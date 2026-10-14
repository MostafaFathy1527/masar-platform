# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 4.00 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 3 | L2 is present but thin; the worked example is poor and there are only two knowledge checks. |
| worked example | 1 ⚠ | Every 'why' step is generic and unhelpful ('Because it is the next step.'). It asserts without explaining the reasoning. |
| knowledge check | 4 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong on objective alignment, authenticity, and bilingual quality. However, the worked example is critically flawed, and the L2 level feels underdeveloped. The knowledge checks are plausible but not exceptional.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
