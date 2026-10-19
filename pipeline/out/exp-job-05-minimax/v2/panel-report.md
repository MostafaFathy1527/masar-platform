# Judge panel — priorities-and-asking-for-help

**Panel decision: NEEDS HUMAN**

> LLM rubric score, fresh-context judge, self-assessed — not human QA. A panel of models agreeing is still not a human review.

Rule: PASS only if every seat has scored, every judge passes and no criterion splits them by more than 1. Any split, or an empty seat, goes to a human.

| Criterion | `deepseek.v3.2` | `zai.glm-5` | `us.moonshotai.kimi-k3` | spread |
|---|---|---|---|---|
| objective alignment | 5 | 5 | 4 | 1 |
| level fidelity | 4 | 5 | 4 | 1 |
| worked example | 4 | 5 | 3 | 2 ⚠ |
| knowledge check | 5 | 4 | 3 | 2 ⚠ |
| scenario authenticity | 4 | 4 | 3 | 1 |
| bilingual quality | 5 | 5 | 3 | 2 ⚠ |
| concision | 4 | 5 | 3 | 2 ⚠ |
| accessibility ip | 5 | 5 | 4 | 1 |
| **gate** | 4.50 PASS | 4.75 PASS | 3.38 FAIL | |

Why: seat empty: Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf has not scored this lesson; the judges send the lesson to different gate outcomes; judges differ by more than 1 on: bilingual_quality, concision, knowledge_check, worked_example.

Seats with no verdict beside the lesson, so the panel can neither pass nor fail it: `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf`.
