# QA gate report — writing-a-clear-work-message

**Result: FAIL**

Mean 3.75 over 8 scored criteria (threshold 4.0); lowest criterion 3 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 3 | Every step has a show and a why, but the whys mostly restate the rule's benefit ('leaves no guesswork', 'avoid a cold tone') rather than name the judgement being made in this situation. Only the subject-line step gives a concrete reason (inbox and search visibility). No step ties a choice to the specifics of the prompt, e.g. why the Friday deadline belongs in the subject line rather than the body, or what would change the wording if the deadline were soft. |
| knowledge check | 3 | Scored on the two referenced items. JOB-03-KC-02 is strong: the vague asks ('Can you send the figures?') are exactly what learners actually write, and feedback names what is missing (which figures, by when). JOB-03-KC-01 has one distractor nobody would choose ('to leave the reader guessing'), and the feedback on that option and on the correct option restates the stem rather than teaching. The apology and background distractors are genuine misconceptions and are handled well. |
| scenario authenticity | 4 |  |
| bilingual quality | 4 |  |
| concision | 4 |  |
| accessibility ip | 4 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Mean 3.75 is below 4.0.**

Judge's summary:

> A coherent, on-level lesson: real definition cards rather than bordered lists, a genuine L2 practice set, and Arabic that reads as written in Arabic with only minor calques ('يقرأ على هاتف'). The weak points are the worked example, whose step reasoning is generic rather than situational, and the first knowledge check, which carries one implausible distractor with restating feedback. JOB-03-KC-02 and the two scenarios (especially admitting your own error in the tone scenario) are the strongest elements.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
