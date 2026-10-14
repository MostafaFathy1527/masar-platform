# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.62 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | Per-option feedback on both items is empty: the correct option gets "Correct." and every distractor gets "Not correct." — nothing names the misconception each distractor represents (e.g., that formatting and logos are copyable, or that deleting the message destroys evidence and protects no one). The item-level rationale explains the correct principle but cannot substitute for per-option feedback. The distractors themselves are plausible and drawn from real behaviour, which is the only thing keeping this above 1. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson body is strong: the worked example's step rationales name the judgement and what would change it, the scenario is a recognisable BEC setup with real friction and consequence text that pinpoints the engineered pressure, and the Arabic reads as written in Arabic rather than translated. The single weak criterion is knowledge check quality — both items ship with placeholder-grade per-option feedback ("Correct." / "Not correct.") that teaches nothing. Everything else I would leave unchanged.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
