# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.50 over 8 scored criteria (threshold 4.0); lowest criterion 1 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 1 ⚠ | Both knowledge checks (SEC-01-KC-01 and SEC-01-KC-02) contain three implausible distractors each ('Order lunch', 'Restart computer', 'Change screen colour') that have no semantic relation to the security context. These are not plausible misconceptions; they are fillers that a learner would never choose, which makes the checks useless for diagnosing understanding. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> The instructional content, worked example, and scenario are excellent and authentic. However, the knowledge checks fail completely due to distractors that are random nonsense rather than plausible errors, resulting in a floor score of 1 on that criterion.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
