# QA gate report — writing-a-shift-handover

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 1 ⚠ | All four steps carry the identical why-text 'Because it is the next step.' That is assertion, not reasoning — none of the steps names the judgement being made (e.g., why failed retries are recorded so they are not repeated, why the deadline is derived from the customer promise). This is the exact failure mode the criterion exists to catch. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 4 | Arabic is natural, idiomatic, and consistent in terminology, but slips once: 'وعليه علامة' in the L1 tip, where the plain choice is 'ومعه علامة'. One register break in an otherwise strong text keeps this at 4. |
| concision | 4 | Prose between acting blocks earns its space and the takeaways add the shared-record point rather than repeating. The drag is structural: six definition cards front-load vocabulary, and the L2 interactive flow re-teaches the same four questions with near-identical detail text to the L1 flow. Removable without loss. |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong almost everywhere: real misconceptions in the checks, a scenario with genuine friction, and Arabic that reads as written, not translated. The worked example is the failure — four steps whose only justification is 'because it is the next step', which is a printed solution wearing a worked example's structure. That single block drags the floor far below what the rest of the lesson earns.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
