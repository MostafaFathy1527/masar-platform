# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 3.75 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 3 | The L2 interactive process_flow is thin—it's the same four questions from L1 with no additional depth. The 'interactive' flag is set but the steps are identical to the non-interactive L1 version, making this L2 feel like L1 with a scenario bolted on rather than a genuine level progression. |
| worked example | 2 ⚠ | Every 'why' in the worked example is identical: 'Because it is the next step.' This is assertion without reasoning—it does not explain the judgment being made or what would change it. The 'why' field exists but carries no explanatory weight. |
| knowledge check | 4 |  |
| scenario authenticity | 4 |  |
| bilingual quality | 4 | The Arabic is generally natural and idiomatic, but occasional stiffness appears: 'الاختبار البسيط لتسليم ناجح' reads slightly literal, and 'الوعد الآن عليك' in the scenario is contextually clear but not how a native speaker would typically phrase transferred responsibility. Solid but not flawless. |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.
**Mean 3.75 is below 4.0.**

Judge's summary:

> The worked example is the critical weakness—repeated placeholder 'why' text defeats the purpose of the block. Level fidelity suffers because L2's interactive element adds no new cognitive demand. Knowledge checks are strong with plausible distractors naming real misconceptions. Mean 3.75 with one criterion at 2.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
