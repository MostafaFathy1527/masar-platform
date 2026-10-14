# Judge calibration: can each judge see a lesson broken on purpose?

Run 2026-10-14. Each sample was scored as it is and as copies broken in one way each, every defect one the rubric names and each aimed at one criterion. A judge that sees the defect should score that criterion at least 2 points lower on the broken copy. Seated panel: `moonshotai.kimi-k2.5`, `deepseek.v3.2`, `zai.glm-5`.

## Per judge and criterion

| Judge | Criterion | Defects caught | Mean drop |
|---|---|---|---|
| `amazon.nova-pro-v1:0` | knowledge_check | 0 of 8 | 0.75 |
| `deepseek.v3.2` (seated) | bilingual_quality | 1 of 4 | 1.00 |
| `deepseek.v3.2` (seated) | knowledge_check | 7 of 8 | 2.75 |
| `deepseek.v3.2` (seated) | scenario_authenticity | 0 of 4 | 0.00 |
| `deepseek.v3.2` (seated) | worked_example | 4 of 4 | 2.75 |
| `google.gemma-3-27b-it` | bilingual_quality | 0 of 4 | 0.00 |
| `minimax.minimax-m2.5` | bilingual_quality | 0 of 4 | 0.00 |
| `minimax.minimax-m2.5` | knowledge_check | 4 of 5 | 1.60 |
| `mistral.mistral-large-3-675b-instruct` | bilingual_quality | 0 of 4 | 0.00 |
| `mistral.mistral-large-3-675b-instruct` | knowledge_check | 1 of 8 | 1.12 |
| `moonshotai.kimi-k2.5` (seated) | bilingual_quality | 1 of 4 | 0.75 |
| `moonshotai.kimi-k2.5` (seated) | knowledge_check | 8 of 8 | 2.62 |
| `moonshotai.kimi-k2.5` (seated) | scenario_authenticity | 2 of 4 | 1.25 |
| `moonshotai.kimi-k2.5` (seated) | worked_example | 4 of 4 | 2.75 |
| `nvidia.nemotron-super-3-120b` | bilingual_quality | 0 of 4 | 0.00 |
| `qwen.qwen3-32b-v1:0` | knowledge_check | 0 of 8 | 0.00 |
| `qwen.qwen3-next-80b-a3b` | bilingual_quality | 0 of 4 | 0.00 |
| `qwen.qwen3-vl-235b-a22b` | bilingual_quality | 0 of 4 | 0.00 |
| `us.deepseek.r1-v1:0` | bilingual_quality | 0 of 0 | 0.00 |
| `us.meta.llama3-3-70b-instruct-v1:0` | knowledge_check | 1 of 8 | 0.62 |
| `us.meta.llama4-maverick-17b-instruct-v1:0` | bilingual_quality | 0 of 4 | 0.00 |
| `us.moonshotai.kimi-k3` | bilingual_quality | 4 of 4 | 3.00 |
| `zai.glm-4.7` | bilingual_quality | 2 of 4 | 2.00 |
| `zai.glm-5` (seated) | bilingual_quality | 4 of 4 | 4.00 |
| `zai.glm-5` (seated) | knowledge_check | 8 of 8 | 3.50 |
| `zai.glm-5` (seated) | scenario_authenticity | 0 of 4 | 0.25 |
| `zai.glm-5` (seated) | worked_example | 4 of 4 | 3.00 |

## Every score

| Judge | Defect | Criterion | Sample | Real | Broken | Drop |
|---|---|---|---|---|---|---|
| `amazon.nova-pro-v1:0` | absurd-distractors | knowledge_check | lesson-cs-01 | 4 | 3 | 1 |
| `amazon.nova-pro-v1:0` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 4 | 3 | 1 |
| `amazon.nova-pro-v1:0` | absurd-distractors | knowledge_check | lesson-prv-01 | 4 | 3 | 1 |
| `amazon.nova-pro-v1:0` | absurd-distractors | knowledge_check | lesson-sec-01 | 4 | 3 | 1 |
| `amazon.nova-pro-v1:0` | generic-feedback | knowledge_check | lesson-cs-01 | 4 | 3 | 1 |
| `amazon.nova-pro-v1:0` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 4 | 4 | 0 |
| `amazon.nova-pro-v1:0` | generic-feedback | knowledge_check | lesson-prv-01 | 4 | 3 | 1 |
| `amazon.nova-pro-v1:0` | generic-feedback | knowledge_check | lesson-sec-01 | 4 | 4 | 0 |
| `deepseek.v3.2` | absurd-distractors | knowledge_check | lesson-cs-01 | 5 | 1 | 4 |
| `deepseek.v3.2` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 5 | 2 | 3 |
| `deepseek.v3.2` | absurd-distractors | knowledge_check | lesson-prv-01 | 5 | 1 | 4 |
| `deepseek.v3.2` | absurd-distractors | knowledge_check | lesson-sec-01 | 4 | 1 | 3 |
| `deepseek.v3.2` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `deepseek.v3.2` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `deepseek.v3.2` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `deepseek.v3.2` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `deepseek.v3.2` | generic-feedback | knowledge_check | lesson-cs-01 | 5 | 2 | 3 |
| `deepseek.v3.2` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 5 | 3 | 2 |
| `deepseek.v3.2` | generic-feedback | knowledge_check | lesson-prv-01 | 5 | 3 | 2 |
| `deepseek.v3.2` | generic-feedback | knowledge_check | lesson-sec-01 | 4 | 3 | 1 |
| `deepseek.v3.2` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 3 | 2 |
| `deepseek.v3.2` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 4 | 1 |
| `deepseek.v3.2` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 4 | 1 |
| `deepseek.v3.2` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `deepseek.v3.2` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 3 | 2 |
| `deepseek.v3.2` | reasonless-steps | worked_example | lesson-ops-01-r2 | 4 | 2 | 2 |
| `deepseek.v3.2` | reasonless-steps | worked_example | lesson-prv-01 | 5 | 1 | 4 |
| `deepseek.v3.2` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 2 | 3 |
| `google.gemma-3-27b-it` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `google.gemma-3-27b-it` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `google.gemma-3-27b-it` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `google.gemma-3-27b-it` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `minimax.minimax-m2.5` | absurd-distractors | knowledge_check | lesson-cs-01 | None | None | None |
| `minimax.minimax-m2.5` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 5 | 3 | 2 |
| `minimax.minimax-m2.5` | absurd-distractors | knowledge_check | lesson-prv-01 | 4 | 2 | 2 |
| `minimax.minimax-m2.5` | absurd-distractors | knowledge_check | lesson-sec-01 | 3 | None | None |
| `minimax.minimax-m2.5` | generic-feedback | knowledge_check | lesson-cs-01 | None | 3 | None |
| `minimax.minimax-m2.5` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 5 | 3 | 2 |
| `minimax.minimax-m2.5` | generic-feedback | knowledge_check | lesson-prv-01 | 4 | 2 | 2 |
| `minimax.minimax-m2.5` | generic-feedback | knowledge_check | lesson-sec-01 | 3 | 3 | 0 |
| `minimax.minimax-m2.5` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `minimax.minimax-m2.5` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `minimax.minimax-m2.5` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `minimax.minimax-m2.5` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `mistral.mistral-large-3-675b-instruct` | absurd-distractors | knowledge_check | lesson-cs-01 | 4 | 3 | 1 |
| `mistral.mistral-large-3-675b-instruct` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 4 | 3 | 1 |
| `mistral.mistral-large-3-675b-instruct` | absurd-distractors | knowledge_check | lesson-prv-01 | 4 | 3 | 1 |
| `mistral.mistral-large-3-675b-instruct` | absurd-distractors | knowledge_check | lesson-sec-01 | 4 | 2 | 2 |
| `mistral.mistral-large-3-675b-instruct` | generic-feedback | knowledge_check | lesson-cs-01 | 4 | 3 | 1 |
| `mistral.mistral-large-3-675b-instruct` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 4 | 3 | 1 |
| `mistral.mistral-large-3-675b-instruct` | generic-feedback | knowledge_check | lesson-prv-01 | 4 | 3 | 1 |
| `mistral.mistral-large-3-675b-instruct` | generic-feedback | knowledge_check | lesson-sec-01 | 4 | 3 | 1 |
| `mistral.mistral-large-3-675b-instruct` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `mistral.mistral-large-3-675b-instruct` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `mistral.mistral-large-3-675b-instruct` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `mistral.mistral-large-3-675b-instruct` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `moonshotai.kimi-k2.5` | absurd-distractors | knowledge_check | lesson-cs-01 | 5 | 2 | 3 |
| `moonshotai.kimi-k2.5` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 4 | 2 | 2 |
| `moonshotai.kimi-k2.5` | absurd-distractors | knowledge_check | lesson-prv-01 | 5 | 1 | 4 |
| `moonshotai.kimi-k2.5` | absurd-distractors | knowledge_check | lesson-sec-01 | 4 | 2 | 2 |
| `moonshotai.kimi-k2.5` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 3 | 2 |
| `moonshotai.kimi-k2.5` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 4 | 4 | 0 |
| `moonshotai.kimi-k2.5` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 3 | 2 |
| `moonshotai.kimi-k2.5` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 4 | 1 |
| `moonshotai.kimi-k2.5` | generic-feedback | knowledge_check | lesson-cs-01 | 5 | 2 | 3 |
| `moonshotai.kimi-k2.5` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 4 | 2 | 2 |
| `moonshotai.kimi-k2.5` | generic-feedback | knowledge_check | lesson-prv-01 | 5 | 2 | 3 |
| `moonshotai.kimi-k2.5` | generic-feedback | knowledge_check | lesson-sec-01 | 4 | 2 | 2 |
| `moonshotai.kimi-k2.5` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 3 | 2 |
| `moonshotai.kimi-k2.5` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 4 | 3 | 1 |
| `moonshotai.kimi-k2.5` | pasted-english | bilingual_quality | lesson-prv-01 | 4 | 5 | -1 |
| `moonshotai.kimi-k2.5` | pasted-english | bilingual_quality | lesson-sec-01 | 4 | 3 | 1 |
| `moonshotai.kimi-k2.5` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 2 | 3 |
| `moonshotai.kimi-k2.5` | reasonless-steps | worked_example | lesson-ops-01-r2 | 4 | 2 | 2 |
| `moonshotai.kimi-k2.5` | reasonless-steps | worked_example | lesson-prv-01 | 5 | 2 | 3 |
| `moonshotai.kimi-k2.5` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 2 | 3 |
| `nvidia.nemotron-super-3-120b` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `nvidia.nemotron-super-3-120b` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `nvidia.nemotron-super-3-120b` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `nvidia.nemotron-super-3-120b` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `qwen.qwen3-32b-v1:0` | absurd-distractors | knowledge_check | lesson-cs-01 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | absurd-distractors | knowledge_check | lesson-prv-01 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | absurd-distractors | knowledge_check | lesson-sec-01 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | generic-feedback | knowledge_check | lesson-cs-01 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | generic-feedback | knowledge_check | lesson-prv-01 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | generic-feedback | knowledge_check | lesson-sec-01 | 3 | 3 | 0 |
| `qwen.qwen3-next-80b-a3b` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `qwen.qwen3-next-80b-a3b` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `qwen.qwen3-next-80b-a3b` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `qwen.qwen3-next-80b-a3b` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `qwen.qwen3-vl-235b-a22b` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `qwen.qwen3-vl-235b-a22b` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `qwen.qwen3-vl-235b-a22b` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `qwen.qwen3-vl-235b-a22b` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `us.deepseek.r1-v1:0` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | None | None |
| `us.deepseek.r1-v1:0` | pasted-english | bilingual_quality | lesson-ops-01-r2 | None | None | None |
| `us.deepseek.r1-v1:0` | pasted-english | bilingual_quality | lesson-prv-01 | None | None | None |
| `us.deepseek.r1-v1:0` | pasted-english | bilingual_quality | lesson-sec-01 | None | None | None |
| `us.meta.llama3-3-70b-instruct-v1:0` | absurd-distractors | knowledge_check | lesson-cs-01 | 5 | 5 | 0 |
| `us.meta.llama3-3-70b-instruct-v1:0` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 5 | 4 | 1 |
| `us.meta.llama3-3-70b-instruct-v1:0` | absurd-distractors | knowledge_check | lesson-prv-01 | 5 | 2 | 3 |
| `us.meta.llama3-3-70b-instruct-v1:0` | absurd-distractors | knowledge_check | lesson-sec-01 | 5 | 4 | 1 |
| `us.meta.llama3-3-70b-instruct-v1:0` | generic-feedback | knowledge_check | lesson-cs-01 | 5 | 5 | 0 |
| `us.meta.llama3-3-70b-instruct-v1:0` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 5 | 5 | 0 |
| `us.meta.llama3-3-70b-instruct-v1:0` | generic-feedback | knowledge_check | lesson-prv-01 | 5 | 5 | 0 |
| `us.meta.llama3-3-70b-instruct-v1:0` | generic-feedback | knowledge_check | lesson-sec-01 | 5 | 5 | 0 |
| `us.meta.llama4-maverick-17b-instruct-v1:0` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `us.meta.llama4-maverick-17b-instruct-v1:0` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `us.meta.llama4-maverick-17b-instruct-v1:0` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `us.meta.llama4-maverick-17b-instruct-v1:0` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `us.moonshotai.kimi-k3` | pasted-english | bilingual_quality | lesson-cs-01 | 4 | 1 | 3 |
| `us.moonshotai.kimi-k3` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 4 | 1 | 3 |
| `us.moonshotai.kimi-k3` | pasted-english | bilingual_quality | lesson-prv-01 | 4 | 1 | 3 |
| `us.moonshotai.kimi-k3` | pasted-english | bilingual_quality | lesson-sec-01 | 4 | 1 | 3 |
| `zai.glm-4.7` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 1 | 4 |
| `zai.glm-4.7` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `zai.glm-4.7` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `zai.glm-4.7` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 1 | 4 |
| `zai.glm-5` | absurd-distractors | knowledge_check | lesson-cs-01 | 5 | 1 | 4 |
| `zai.glm-5` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 5 | 1 | 4 |
| `zai.glm-5` | absurd-distractors | knowledge_check | lesson-prv-01 | 5 | 1 | 4 |
| `zai.glm-5` | absurd-distractors | knowledge_check | lesson-sec-01 | 5 | 1 | 4 |
| `zai.glm-5` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `zai.glm-5` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `zai.glm-5` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 4 | 1 |
| `zai.glm-5` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `zai.glm-5` | generic-feedback | knowledge_check | lesson-cs-01 | 5 | 2 | 3 |
| `zai.glm-5` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 5 | 2 | 3 |
| `zai.glm-5` | generic-feedback | knowledge_check | lesson-prv-01 | 5 | 2 | 3 |
| `zai.glm-5` | generic-feedback | knowledge_check | lesson-sec-01 | 5 | 2 | 3 |
| `zai.glm-5` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 1 | 4 |
| `zai.glm-5` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 1 | 4 |
| `zai.glm-5` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 1 | 4 |
| `zai.glm-5` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 1 | 4 |
| `zai.glm-5` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 2 | 3 |
| `zai.glm-5` | reasonless-steps | worked_example | lesson-ops-01-r2 | 5 | 2 | 3 |
| `zai.glm-5` | reasonless-steps | worked_example | lesson-prv-01 | 5 | 2 | 3 |
| `zai.glm-5` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 2 | 3 |

This measures whether a judge can tell a real lesson from one broken in a named way. It does not say which judge is right about the real lesson.
