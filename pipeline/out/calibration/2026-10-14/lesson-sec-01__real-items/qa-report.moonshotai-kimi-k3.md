# QA gate report — recognising-a-phishing-email

**Result: PASS**

Mean 4.38 over 8 scored criteria (threshold 4.0); lowest criterion 4 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 | Levels are real and distinct (L1 concepts, L2 application), but L1 treats link_destination and engineered_urgency only through the job tip and takeaways rather than a dedicated block, so L1 coverage of the declared concepts is slightly uneven. |
| worked example | 4 | Step whys are strong (step 3 explicitly names what would change the judgement), but the prompt never supplies the artifacts the steps instruct the learner to examine — no actual sender address to read, no revealed link destination — so the checks are asserted rather than performable. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 4 | Arabic is idiomatic and consistently voiced, but the one-time-code concept drifts across three renderings (رمز المرة الواحدة / رمز التحقق / رمز مرة واحدة), and a few calques show ('قناة تملكها من قبل', 'التوقيت هو كل شيء'). |
| concision | 5 |  |
| accessibility ip | 4 | Compliant: no licensed descriptors, payer text, or denylisted terms, and no colour-carried meaning; but the 🔎 and 🔐 icons carry no text alternative or declared decorative status, so compliance is minimal rather than used as a teaching point. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.


Judge's summary:

> Strong, coherent lesson: knowledge checks and the BEC scenario are the standouts, with every distractor drawn from a real behaviour. The worked example would be improved by embedding the evidence it asks the learner to inspect, and the Arabic — while natural — should standardise its term for the one-time code. Mean 4.25, floor 4.
