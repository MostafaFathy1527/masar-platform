# Judge panel — writing-a-shift-handover

**Panel decision: NEEDS HUMAN**

> LLM rubric score, fresh-context judge, self-assessed — not human QA. A panel of models agreeing is still not a human review.

Rule: PASS only if every seat has scored, every judge passes and no criterion splits them by more than 1. Any split, or an empty seat, goes to a human.

| Criterion | `deepseek.v3.2` | `zai.glm-5` | `us.moonshotai.kimi-k3` | `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | spread |
|---|---|---|---|---|---|
| objective alignment | 5 | 5 | 5 | 5 | 0 |
| level fidelity | 4 | 5 | 5 | 5 | 1 |
| worked example | 5 | 5 | 4 | 5 | 1 |
| knowledge check | 4 | 5 | 4 | 5 | 1 |
| scenario authenticity | 5 | 5 | 5 | 5 | 0 |
| bilingual quality | 5 | 5 | 3 | 5 | 2 ⚠ |
| concision | 4 | 5 | 4 | 5 | 1 |
| accessibility ip | 5 | 5 | 4 | 5 | 1 |
| **gate** | 4.62 PASS | 5.00 PASS | 4.25 PASS | 5.00 PASS | |

Why: judges differ by more than 1 on: bilingual_quality.
