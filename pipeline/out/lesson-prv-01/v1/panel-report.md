# Judge panel — what-counts-as-personal-data

**Panel decision: PASS**

> LLM rubric score, fresh-context judge, self-assessed — not human QA. A panel of models agreeing is still not a human review.

Rule: PASS only if every judge passes and no criterion splits them by more than 1. Any split goes to a human.

| Criterion | `deepseek.v3.2` | `zai.glm-5` | `us.moonshotai.kimi-k3` | spread |
|---|---|---|---|---|
| objective alignment | 5 | 5 | 4 | 1 |
| level fidelity | 4 | 5 | 4 | 1 |
| worked example | 5 | 5 | 5 | 0 |
| knowledge check | 4 | 5 | 5 | 1 |
| scenario authenticity | 5 | 5 | 5 | 0 |
| bilingual quality | 5 | 5 | 5 | 0 |
| concision | 4 | 5 | 5 | 1 |
| accessibility ip | 5 | 5 | 5 | 0 |
| **gate** | 4.62 PASS | 5.00 PASS | 4.75 PASS | |
