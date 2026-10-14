# Judge panel — what-counts-as-personal-data

**Panel decision: NEEDS HUMAN**

> LLM rubric score, fresh-context judge, self-assessed — not human QA. A panel of models agreeing is still not a human review.

Rule: PASS only if every judge passes and no criterion splits them by more than 1. Any split goes to a human.

| Criterion | `us.meta.llama3-3-70b-instruct-v1:0` | `amazon.nova-pro-v1:0` | `qwen.qwen3-32b-v1:0` | spread |
|---|---|---|---|---|
| objective alignment | 5 | 5 | 5 | 0 |
| level fidelity | 5 | 5 | 4 | 1 |
| worked example | 5 | 5 | 5 | 0 |
| knowledge check | 5 | 4 | 3 | 2 ⚠ |
| scenario authenticity | 5 | 5 | 5 | 0 |
| bilingual quality | 5 | 5 | 5 | 0 |
| concision | 5 | 5 | 4 | 1 |
| accessibility ip | 5 | 5 | 5 | 0 |
| **gate** | 5.00 PASS | 4.88 PASS | 4.50 PASS | |

Why: judges differ by more than 1 on: knowledge_check.
