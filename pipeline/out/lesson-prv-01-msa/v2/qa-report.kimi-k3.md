# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 3.88 over 8 scored criteria (threshold 4.0); lowest criterion 3 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 4 |  |
| knowledge check | 3 | KC-01 has a validity problem: the street-address distractor's own feedback states it 'may be sufficient to identify a person', which partially validates a wrong choice in a single-correct item whose stem does not restrict to unconditional identifiability; 'patient in room 3' is likewise context-dependent. The 'Misconception:' prefixes are formulaic — several state facts about the option rather than naming the learner's actual wrong belief (e.g., KC-02's deletion option never names the 'deleting records feels like destroying evidence' belief). Distractors are plausible and there is no 'all of the above', which keeps this at 3 rather than lower. |
| scenario authenticity | 4 |  |
| bilingual quality | 4 |  |
| concision | 4 |  |
| accessibility ip | 4 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Mean 3.88 is below 4.0.**

Judge's summary:

> A solid bilingual lesson: L1 builds the identifiability test through real definition cards, a compare table, and tips, and L2 delivers genuine application through a worked example with real reasoning, two scenarios with authentic friction (the approved-channel option that is still over-disclosure is a highlight), and a sorting task. The Arabic is fluent MSA with only occasional calques, and the fabricated diagnosis code shows IP discipline. The weak point is the knowledge checks: KC-01's distractor feedback undermines its own single-correct key, and the 'Misconception:' labels often restate facts rather than naming the belief a learner actually holds.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
