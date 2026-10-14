# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.38 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 | L2 is genuinely more advanced than L1 with a proper worked example and scenario, but the knowledge check blocks are identical in structure and equally weak at both levels, slightly dragging down what would otherwise be a 5. |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | Both knowledge checks contain three identical implausible distractors ('order lunch for the team first', 'restart your computer', 'change the colour of the screen') that nobody would ever choose in a phishing context. These are not drawn from real misconceptions about phishing — they appear to be placeholder nonsense. The feedback on incorrect options is purely 'Not correct' with no explanation of why someone might think that way or what misconception it represents. This is a severe failure of the knowledge check criterion. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 | The prose is generally tight, but some redundancy exists between the L1 takeaways and the worked example steps in L2 — the same points about display names, urgency, and verification codes appear in both places with only slight rephrasing. |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The lesson is strong in most areas — excellent worked example with genuine 'why' at each step, authentic scenario with real friction, and natural Arabic. However, the knowledge checks are catastrophically weak with placeholder distractors that teach nothing and feedback that merely restates correctness. This is a recurring failure pattern of implausible distractors.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
