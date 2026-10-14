# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 4.12 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 |  |
| worked example | 4 |  |
| knowledge check | 1 ⚠ | In both items, three of the four options are nonsense distractors no learner would ever choose ("Order lunch for the team first", "Restart your computer", "Change the colour of the screen"), and their per-option feedback is merely "Not correct." — it neither names a misconception nor explains anything. Only the correct option carries real feedback. The stems and rationales are good, which makes it worse: the real misconceptions were available and unused (KC-01 should have offered "No — without names it is not personal data"; KC-02 should have offered "Delete the number yourself and send what you can" and "Reply asking the customer to put it in writing / it can wait"). As written, each item is answerable by elimination without understanding anything, so the checks certify nothing. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 4 | No images requiring alt text, no colour-dependent meaning, and no licensed code descriptors, payer policy text, or denylisted terms — the compliance floor is met. However it is only met minimally: the ⚠️ and 🚨 icons decorate the definition cards without stated text equivalents, and the constraint is never used as a teaching point (e.g., the lesson never notes it is teaching principles rather than quoting any one statute), which is what separates 3 from 5. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The teaching content is strong: natural Arabic, a worked example whose steps explain the judgement, and a wrong-recipient scenario with genuine friction. But both knowledge checks are wrecked by placeholder-grade distractors ("restart your computer") with empty feedback, which is the rubric's named failure and earns the floor score on that criterion. The lesson's checks, as written, cannot distinguish a learner who understood from one who can eliminate jokes.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
