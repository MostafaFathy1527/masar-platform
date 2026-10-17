# Judge calibration: can each judge see a lesson broken on purpose?

Run 2026-10-15. Each sample was scored as it is and as copies broken in one way each, every defect one the rubric names and each aimed at one criterion. A judge that sees the defect should score that criterion at least 2 points lower on the broken copy. Seated panel: `us.moonshotai.kimi-k3`, `deepseek.v3.2`, `zai.glm-5`.

## Per judge and criterion

| Judge | Criterion | Defects caught | Mean drop |
|---|---|---|---|
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | bilingual_quality | 0 of 0 | 0.00 |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | knowledge_check | 0 of 0 | 0.00 |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | scenario_authenticity | 0 of 0 | 0.00 |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | worked_example | 0 of 0 | 0.00 |
| `gemma-3-27b-it-Q4_K_M.gguf` | bilingual_quality | 0 of 0 | 0.00 |
| `gemma-3-27b-it-Q4_K_M.gguf` | knowledge_check | 0 of 0 | 0.00 |
| `gemma-3-27b-it-Q4_K_M.gguf` | scenario_authenticity | 0 of 0 | 0.00 |
| `gemma-3-27b-it-Q4_K_M.gguf` | worked_example | 0 of 0 | 0.00 |
| `minimax.minimax-m2.5` | scenario_authenticity | 0 of 4 | 0.00 |
| `mistral.mistral-large-3-675b-instruct` | scenario_authenticity | 0 of 4 | 0.00 |
| `nvidia.nemotron-super-3-120b` | scenario_authenticity | 0 of 4 | 0.25 |
| `qwen.qwen3-vl-235b-a22b` | scenario_authenticity | 0 of 4 | 0.00 |
| `us.moonshotai.kimi-k3` (seated) | knowledge_check | 8 of 8 | 3.50 |
| `us.moonshotai.kimi-k3` (seated) | scenario_authenticity | 3 of 4 | 2.00 |
| `us.moonshotai.kimi-k3` (seated) | worked_example | 4 of 4 | 2.75 |
| `zai.glm-4.7` | scenario_authenticity | 0 of 4 | 0.75 |

## Every score

| Judge | Defect | Criterion | Sample | Real | Broken | Drop |
|---|---|---|---|---|---|---|
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | reasonless-steps | worked_example | lesson-cs-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | reasonless-steps | worked_example | lesson-prv-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q4_K_M.gguf` | reasonless-steps | worked_example | lesson-sec-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | None | 5 | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | reasonless-steps | worked_example | lesson-cs-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | reasonless-steps | worked_example | lesson-prv-01 | None | None | None |
| `gemma-3-27b-it-Q4_K_M.gguf` | reasonless-steps | worked_example | lesson-sec-01 | None | None | None |
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

## Verdicts that hand back the rubric's example

Scores, notes and closing note identical to the example printed in `rubric.md`. They count as no score above: the judge did not read the lesson (what-failed entry 19).

| Run · judge | Verdicts | Copies |
|---|---|---|
| 2026-10-15 · fanar-2-27b-instruct-q4-k-m-gguf | 24 | lesson-cs-01__absurd-distractors, lesson-cs-01__empty-consequences, lesson-cs-01__generic-feedback, lesson-cs-01__pasted-english, lesson-cs-01__real-items, lesson-cs-01__reasonless-steps, lesson-ops-01-r2__absurd-distractors, lesson-ops-01-r2__empty-consequences, lesson-ops-01-r2__generic-feedback, lesson-ops-01-r2__pasted-english, lesson-ops-01-r2__real-items, lesson-ops-01-r2__reasonless-steps, lesson-prv-01__absurd-distractors, lesson-prv-01__empty-consequences, lesson-prv-01__generic-feedback, lesson-prv-01__pasted-english, lesson-prv-01__real-items, lesson-prv-01__reasonless-steps, lesson-sec-01__absurd-distractors, lesson-sec-01__empty-consequences, lesson-sec-01__generic-feedback, lesson-sec-01__pasted-english, lesson-sec-01__real-items, lesson-sec-01__reasonless-steps |
| 2026-10-15 · gemma-3-27b-it-q4-k-m-gguf | 23 | lesson-cs-01__absurd-distractors, lesson-cs-01__empty-consequences, lesson-cs-01__generic-feedback, lesson-cs-01__pasted-english, lesson-cs-01__real-items, lesson-cs-01__reasonless-steps, lesson-ops-01-r2__absurd-distractors, lesson-ops-01-r2__empty-consequences, lesson-ops-01-r2__generic-feedback, lesson-ops-01-r2__pasted-english, lesson-ops-01-r2__real-items, lesson-ops-01-r2__reasonless-steps, lesson-prv-01__absurd-distractors, lesson-prv-01__empty-consequences, lesson-prv-01__generic-feedback, lesson-prv-01__pasted-english, lesson-prv-01__real-items, lesson-prv-01__reasonless-steps, lesson-sec-01__absurd-distractors, lesson-sec-01__empty-consequences, lesson-sec-01__generic-feedback, lesson-sec-01__real-items, lesson-sec-01__reasonless-steps |

This measures whether a judge can tell a real lesson from one broken in a named way. It does not say which judge is right about the real lesson.
