# Judge calibration: can each judge see a lesson broken on purpose?

Run 2026-11-20-swapped-consequences. Each sample was scored as it is and as copies broken in one way each, every defect one the rubric names and each aimed at one criterion. A judge that sees the defect should score that criterion at least 2 points lower on the broken copy. Seated panel: `us.moonshotai.kimi-k3`, `deepseek.v3.2`, `zai.glm-5` on Amazon Bedrock, and `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` served on rented hardware.

## Per judge and criterion

| Judge | Criterion | Defects caught | Mean drop |
|---|---|---|---|
| `deepseek.v3.2` (seated) | scenario_authenticity | 0 of 4 | 0.00 |
| `us.moonshotai.kimi-k3` (seated) | scenario_authenticity | 4 of 4 | 3.00 |
| `zai.glm-5` (seated) | scenario_authenticity | 0 of 4 | 0.00 |

## Every score

| Judge | Defect | Criterion | Sample | Real | Broken | Drop |
|---|---|---|---|---|---|---|
| `deepseek.v3.2` | swapped-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `deepseek.v3.2` | swapped-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `deepseek.v3.2` | swapped-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `deepseek.v3.2` | swapped-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `us.moonshotai.kimi-k3` | swapped-consequences | scenario_authenticity | lesson-cs-01 | 5 | 1 | 4 |
| `us.moonshotai.kimi-k3` | swapped-consequences | scenario_authenticity | lesson-ops-01-r2 | 4 | 2 | 2 |
| `us.moonshotai.kimi-k3` | swapped-consequences | scenario_authenticity | lesson-prv-01 | 5 | 1 | 4 |
| `us.moonshotai.kimi-k3` | swapped-consequences | scenario_authenticity | lesson-sec-01 | 4 | 2 | 2 |
| `zai.glm-5` | swapped-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `zai.glm-5` | swapped-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `zai.glm-5` | swapped-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `zai.glm-5` | swapped-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |

This measures whether a judge can tell a real lesson from one broken in a named way. It does not say which judge is right about the real lesson.
