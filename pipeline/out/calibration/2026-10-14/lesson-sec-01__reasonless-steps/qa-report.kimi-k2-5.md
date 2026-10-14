# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 3.75 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 3 | The L2 worked_example is structurally present but the 'why' steps are completely generic ('Because it is the next step'), making this thin L2 content. The level has the required blocks but the worked example fails to deliver on its promise. |
| worked example | 2 ⚠ | Every single 'why' step restates 'Because it is the next step' in both languages. This is not reasoning — it is placeholder text. A worked example must explain the judgement being made at each step; this asserts without explaining why. |
| knowledge check | 4 |  |
| scenario authenticity | 4 |  |
| bilingual quality | 4 | Generally natural Arabic, but some constructions follow English patterns closely (e.g., 'الاسم الظاهر للمُرسِل' where 'المرسل الظاهر' would be more idiomatic). Occasional stiffness in technical phrasing. |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.
**Mean 3.75 is below 4.0.**

Judge's summary:

> The worked example is the critical failure: four steps, all with identical vacuous 'why' explanations. This is a recurring pattern where structure is present but content is missing. Level fidelity suffers because L2 promises worked-example quality it does not deliver. Knowledge checks are actually strong with plausible distractors and good feedback.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
