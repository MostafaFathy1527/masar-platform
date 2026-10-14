# Judge calibration: can each judge see a lesson broken on purpose?

Run 2026-10-15. Each sample was scored as it is and as copies broken in one way each, every defect one the rubric names and each aimed at one criterion. A judge that sees the defect should score that criterion at least 2 points lower on the broken copy. Seated panel: `moonshotai.kimi-k2.5`, `deepseek.v3.2`, `zai.glm-5`.

## Per judge and criterion

| Judge | Criterion | Defects caught | Mean drop |
|---|---|---|---|
| `minimax.minimax-m2.5` | scenario_authenticity | 0 of 4 | 0.00 |
| `mistral.mistral-large-3-675b-instruct` | scenario_authenticity | 0 of 4 | 0.00 |
| `nvidia.nemotron-super-3-120b` | scenario_authenticity | 0 of 4 | 0.25 |
| `qwen.qwen3-vl-235b-a22b` | scenario_authenticity | 0 of 4 | 0.00 |
| `us.moonshotai.kimi-k3` | knowledge_check | 8 of 8 | 3.50 |
| `us.moonshotai.kimi-k3` | scenario_authenticity | 3 of 4 | 2.00 |
| `us.moonshotai.kimi-k3` | worked_example | 4 of 4 | 2.75 |
| `zai.glm-4.7` | scenario_authenticity | 0 of 4 | 0.75 |

## Every score

| Judge | Defect | Criterion | Sample | Real | Broken | Drop |
|---|---|---|---|---|---|---|
| `minimax.minimax-m2.5` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `minimax.minimax-m2.5` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `minimax.minimax-m2.5` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `minimax.minimax-m2.5` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `mistral.mistral-large-3-675b-instruct` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `mistral.mistral-large-3-675b-instruct` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `mistral.mistral-large-3-675b-instruct` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `mistral.mistral-large-3-675b-instruct` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `nvidia.nemotron-super-3-120b` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `nvidia.nemotron-super-3-120b` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `nvidia.nemotron-super-3-120b` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 4 | 1 |
| `nvidia.nemotron-super-3-120b` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `qwen.qwen3-vl-235b-a22b` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `qwen.qwen3-vl-235b-a22b` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `qwen.qwen3-vl-235b-a22b` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `qwen.qwen3-vl-235b-a22b` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `us.moonshotai.kimi-k3` | absurd-distractors | knowledge_check | lesson-cs-01 | 5 | 1 | 4 |
| `us.moonshotai.kimi-k3` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 5 | 1 | 4 |
| `us.moonshotai.kimi-k3` | absurd-distractors | knowledge_check | lesson-prv-01 | 5 | 1 | 4 |
| `us.moonshotai.kimi-k3` | absurd-distractors | knowledge_check | lesson-sec-01 | 5 | 1 | 4 |
| `us.moonshotai.kimi-k3` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 2 | 3 |
| `us.moonshotai.kimi-k3` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 4 | 1 |
| `us.moonshotai.kimi-k3` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 3 | 2 |
| `us.moonshotai.kimi-k3` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 3 | 2 |
| `us.moonshotai.kimi-k3` | generic-feedback | knowledge_check | lesson-cs-01 | 5 | 2 | 3 |
| `us.moonshotai.kimi-k3` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 5 | 2 | 3 |
| `us.moonshotai.kimi-k3` | generic-feedback | knowledge_check | lesson-prv-01 | 5 | 2 | 3 |
| `us.moonshotai.kimi-k3` | generic-feedback | knowledge_check | lesson-sec-01 | 5 | 2 | 3 |
| `us.moonshotai.kimi-k3` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 1 | 4 |
| `us.moonshotai.kimi-k3` | reasonless-steps | worked_example | lesson-ops-01-r2 | 3 | 1 | 2 |
| `us.moonshotai.kimi-k3` | reasonless-steps | worked_example | lesson-prv-01 | 4 | 2 | 2 |
| `us.moonshotai.kimi-k3` | reasonless-steps | worked_example | lesson-sec-01 | 4 | 1 | 3 |
| `zai.glm-4.7` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 4 | 1 |
| `zai.glm-4.7` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 4 | 1 |
| `zai.glm-4.7` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `zai.glm-4.7` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 4 | 1 |

This measures whether a judge can tell a real lesson from one broken in a named way. It does not say which judge is right about the real lesson.
