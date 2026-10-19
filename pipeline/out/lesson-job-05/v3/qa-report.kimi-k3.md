# QA gate report — priorities-and-asking-for-help

**Result: FAIL**

Mean 3.62 over 8 scored criteria (threshold 4.0); lowest criterion 3 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 |  |
| worked example | 4 |  |
| knowledge check | 4 |  |
| scenario authenticity | 3 | The setup is genuinely recognisable — competing deadlines, a cross-team data dependency, and a manager adding scope are the awkward parts of real work. But two of the three decision options are internally incoherent: d1 says 'delay Report A, then submit Reports A and B now', and its consequence ('Report A will be missed') contradicts the option itself; d3 says 'send all reports now' yet its consequence says 'Report A will be late'. A choice nobody could coherently make is an implausible detail, and it undercuts an otherwise authentic situation. |
| bilingual quality | 3 | Accurate and mostly readable, but carries repeated English calques: 'أكثر من ما يمكن إنجازه' (for 'more than can be done'), 'تقرير A يستحق الأربعاء' (for 'due Wednesday'), 'سيُفتقد' (for 'will be missed'), 'ارفع المشكلة' (for 'raise the problem'), 'يُقلَّل من قيمته' (for 'underestimated'), and 'يقتصر على... فقط' ('limited to... only'). The rich text also drifts semantically from the English: 'اسأل صاحب المهمة إذا كان باقي العمل ضروريًا' says 'ask if the remaining work is necessary' where the English says 'ask when it is unclear'. |
| concision | 3 | The job tip restates the two-days-early guidance already made in the rich text and is removable without loss. The worked example re-walks nearly the same A/B/C, Wednesday/Friday/Monday situation the scenario just presented, so the learner reads the setup twice. Sentence-level prose is tight, but at block level there is clear redundancy. |
| accessibility ip | 3 | No violations — no images, no colour-carried meaning, no licensed code descriptors or payer text. But compliance is achieved by absence rather than design: nothing exercises alt text, and no IP constraint is used as a teaching point, so this sits at 'compliant but minimal'. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Mean 3.62 is below 4.0.**

Judge's summary:

> The lesson is well aligned and structurally honest about its levels, with a worked example whose steps explain their reasoning and knowledge checks built on real misconceptions. Its weakest point is the scenario, where two decision options contradict themselves and their own consequences, closely followed by Arabic that leans on English calques and avoidable redundancy between the tip, scenario, and worked example. Mean 3.75 with three criteria at 3; the gate decides.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
