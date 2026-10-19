# QA gate report — priorities-and-asking-for-help

**Result: FAIL**

Mean 4.50 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | KC-02 contains a significant error in the answer key. Option C ('Reply to an email asking for general information, due today') is marked as correct, but the lesson explicitly teaches that 'Urgent, not important' tasks should be 'handled quickly or delegated', not done 'first' (which is reserved for 'Urgent and important'). This contradicts the lesson's own framework. Additionally, the feedback for the incorrect options in both checks tends to restate the rule rather than diagnosing the specific misconception a learner might hold (e.g., confusing urgency with importance). |
| scenario authenticity | 4 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong in structure, bilingual quality, and worked examples, but fails on knowledge check quality due to a marking error in KC-02 that contradicts the core instructional content. The mean is 4.5, but the floor is breached.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
