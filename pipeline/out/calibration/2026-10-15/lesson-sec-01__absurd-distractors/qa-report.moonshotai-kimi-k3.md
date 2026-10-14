# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.00 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 | Both levels are honestly delivered and the L2 is genuinely applied, but the worked example performs the checks on a message whose incriminating details (the actual sender address, the link destination) are never shown, so the learner watches the method rather than fully exercising it. |
| worked example | 4 | Every step has a real 'why' and step 3 explicitly calibrates the judgement ('urgency alone is not evidence'). Held at 4 because the steps ask the learner to read an address and reveal a link destination that the prompt never supplies — the core checks are asserted as performed rather than demonstrated on concrete evidence. |
| knowledge check | 1 ⚠ | Both items fail the rubric's named failure mode. The three distractors are identical across KC-01 and KC-02 ('Order lunch for the team first', 'Restart your computer', 'Change the colour of the screen') — joke options nobody would choose, so they name no real misconception. Feedback on every wrong option is the bare 'Not correct.' with no explanation, against stems that were otherwise well-constructed. A plausible distractor set exists in embryo in the lesson itself (trusting the display name, calling the number in the signature, waiting to see if anything happens, deleting the message) and was not used. |
| scenario authenticity | 5 |  |
| bilingual quality | 4 | The Arabic reads as written in Arabic, not rendered from English — idioms like 'يمسح بعينه بدل أن يقرأ' are natural. Held at 4 for inconsistent terminology for the one-time code ('رمز المرة الواحدة' in the definition card, 'رمز مرة واحدة' elsewhere, 'رمز التحقق' in the worked example) and for 'هذه هي النتيجة' as a slightly calqued rendering of 'that is the finding'. |
| concision | 5 |  |
| accessibility ip | 4 | Compliant: no licensed code descriptors, no payer policy text, no denylisted terms, no colour-dependent meaning, and the only icons are decorative emoji adjacent to full text. Held at 4 rather than 5 because nothing in the lesson converts the constraint into a teaching point — it is simply clean. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> A well-built lesson carried down by its knowledge checks: both items reuse the same three absurd distractors with 'Not correct.' as the only feedback, which is a floor-level failure on that criterion whatever the other seven do. The prose, Arabic, worked example, and scenario are genuinely strong — the scenario's decision consequences in particular do the misconception-naming work the knowledge checks refused to do. The fix is small and obvious; the gap between the scenario's quality and the items' quality is the story of this lesson.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
