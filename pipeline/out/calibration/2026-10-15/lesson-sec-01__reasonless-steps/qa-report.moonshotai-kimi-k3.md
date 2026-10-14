# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 | The L2 experience is structurally right (worked example, applied checks, scenario), but the worked example at its core is hollow — its reasoning fields are placeholders — so what the learner actually experiences at L2 falls short of what the level promises in that block. |
| worked example | 1 ⚠ | Every step's why field reads 'Because it is the next step' in both languages — a tautology with zero reasoning. The genuine 'why' for each signal exists elsewhere in the lesson (display name is free text, the deadline is engineered to remove the pause, a code request ends the conversation) but was never carried into the worked example. The steps show what to do and assert nothing about why; this is a printed solution, not a worked example. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 4 | Compliant: no licensed code descriptors, no payer policy text, no denylisted terms, no images requiring alt text, no meaning carried by colour. Merely compliant, however — nothing in the lesson turns the constraint into a teaching point, which is what distinguishes a 5. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** worked_example. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong almost everywhere: sharp knowledge checks whose distractors are real misconceptions, an authentic BEC scenario with genuine friction, natural Arabic, and lean prose. It is failed by one glaring defect — the worked example's why fields are all the placeholder 'Because it is the next step', which guts the block that L2 is built around. Fix those four fields with the reasoning already present elsewhere in the lesson and this is excellent material.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
