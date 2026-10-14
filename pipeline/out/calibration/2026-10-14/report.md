# Judge calibration: can each judge see a broken knowledge check?

Run 2026-10-14. Each sample's real item bank was scored as it is and broken in one of two ways rubric criterion 4 names; each judge scored all three copies in fresh contexts. A judge that sees the defect should drop its knowledge_check score by at least 2. Panel judges: `qwen.qwen3-32b-v1:0`, `us.meta.llama3-3-70b-instruct-v1:0`, `amazon.nova-pro-v1:0`.

## Per judge

| Judge | Defects caught | Mean drop |
|---|---|---|
| `amazon.nova-pro-v1:0` | 0 of 8 | 0.75 |
| `deepseek.v3.2` | 7 of 8 | 2.75 |
| `minimax.minimax-m2.5` | 4 of 5 | 1.60 |
| `mistral.mistral-large-3-675b-instruct` | 1 of 8 | 1.12 |
| `moonshotai.kimi-k2.5` | 8 of 8 | 2.62 |
| `qwen.qwen3-32b-v1:0` | 0 of 8 | 0.00 |
| `us.meta.llama3-3-70b-instruct-v1:0` | 1 of 8 | 0.62 |

## Every score

| Judge | Defect | Sample | Real items | Broken items | Drop |
|---|---|---|---|---|---|
| `amazon.nova-pro-v1:0` | absurd-distractors | lesson-cs-01 | 4 | 3 | 1 |
| `amazon.nova-pro-v1:0` | absurd-distractors | lesson-ops-01-r2 | 4 | 3 | 1 |
| `amazon.nova-pro-v1:0` | absurd-distractors | lesson-prv-01 | 4 | 3 | 1 |
| `amazon.nova-pro-v1:0` | absurd-distractors | lesson-sec-01 | 4 | 3 | 1 |
| `amazon.nova-pro-v1:0` | generic-feedback | lesson-cs-01 | 4 | 3 | 1 |
| `amazon.nova-pro-v1:0` | generic-feedback | lesson-ops-01-r2 | 4 | 4 | 0 |
| `amazon.nova-pro-v1:0` | generic-feedback | lesson-prv-01 | 4 | 3 | 1 |
| `amazon.nova-pro-v1:0` | generic-feedback | lesson-sec-01 | 4 | 4 | 0 |
| `deepseek.v3.2` | absurd-distractors | lesson-cs-01 | 5 | 1 | 4 |
| `deepseek.v3.2` | absurd-distractors | lesson-ops-01-r2 | 5 | 2 | 3 |
| `deepseek.v3.2` | absurd-distractors | lesson-prv-01 | 5 | 1 | 4 |
| `deepseek.v3.2` | absurd-distractors | lesson-sec-01 | 4 | 1 | 3 |
| `deepseek.v3.2` | generic-feedback | lesson-cs-01 | 5 | 2 | 3 |
| `deepseek.v3.2` | generic-feedback | lesson-ops-01-r2 | 5 | 3 | 2 |
| `deepseek.v3.2` | generic-feedback | lesson-prv-01 | 5 | 3 | 2 |
| `deepseek.v3.2` | generic-feedback | lesson-sec-01 | 4 | 3 | 1 |
| `minimax.minimax-m2.5` | absurd-distractors | lesson-cs-01 | None | None | None |
| `minimax.minimax-m2.5` | absurd-distractors | lesson-ops-01-r2 | 5 | 3 | 2 |
| `minimax.minimax-m2.5` | absurd-distractors | lesson-prv-01 | 4 | 2 | 2 |
| `minimax.minimax-m2.5` | absurd-distractors | lesson-sec-01 | 3 | None | None |
| `minimax.minimax-m2.5` | generic-feedback | lesson-cs-01 | None | 3 | None |
| `minimax.minimax-m2.5` | generic-feedback | lesson-ops-01-r2 | 5 | 3 | 2 |
| `minimax.minimax-m2.5` | generic-feedback | lesson-prv-01 | 4 | 2 | 2 |
| `minimax.minimax-m2.5` | generic-feedback | lesson-sec-01 | 3 | 3 | 0 |
| `mistral.mistral-large-3-675b-instruct` | absurd-distractors | lesson-cs-01 | 4 | 3 | 1 |
| `mistral.mistral-large-3-675b-instruct` | absurd-distractors | lesson-ops-01-r2 | 4 | 3 | 1 |
| `mistral.mistral-large-3-675b-instruct` | absurd-distractors | lesson-prv-01 | 4 | 3 | 1 |
| `mistral.mistral-large-3-675b-instruct` | absurd-distractors | lesson-sec-01 | 4 | 2 | 2 |
| `mistral.mistral-large-3-675b-instruct` | generic-feedback | lesson-cs-01 | 4 | 3 | 1 |
| `mistral.mistral-large-3-675b-instruct` | generic-feedback | lesson-ops-01-r2 | 4 | 3 | 1 |
| `mistral.mistral-large-3-675b-instruct` | generic-feedback | lesson-prv-01 | 4 | 3 | 1 |
| `mistral.mistral-large-3-675b-instruct` | generic-feedback | lesson-sec-01 | 4 | 3 | 1 |
| `moonshotai.kimi-k2.5` | absurd-distractors | lesson-cs-01 | 5 | 2 | 3 |
| `moonshotai.kimi-k2.5` | absurd-distractors | lesson-ops-01-r2 | 4 | 2 | 2 |
| `moonshotai.kimi-k2.5` | absurd-distractors | lesson-prv-01 | 5 | 1 | 4 |
| `moonshotai.kimi-k2.5` | absurd-distractors | lesson-sec-01 | 4 | 2 | 2 |
| `moonshotai.kimi-k2.5` | generic-feedback | lesson-cs-01 | 5 | 2 | 3 |
| `moonshotai.kimi-k2.5` | generic-feedback | lesson-ops-01-r2 | 4 | 2 | 2 |
| `moonshotai.kimi-k2.5` | generic-feedback | lesson-prv-01 | 5 | 2 | 3 |
| `moonshotai.kimi-k2.5` | generic-feedback | lesson-sec-01 | 4 | 2 | 2 |
| `qwen.qwen3-32b-v1:0` | absurd-distractors | lesson-cs-01 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | absurd-distractors | lesson-ops-01-r2 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | absurd-distractors | lesson-prv-01 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | absurd-distractors | lesson-sec-01 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | generic-feedback | lesson-cs-01 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | generic-feedback | lesson-ops-01-r2 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | generic-feedback | lesson-prv-01 | 3 | 3 | 0 |
| `qwen.qwen3-32b-v1:0` | generic-feedback | lesson-sec-01 | 3 | 3 | 0 |
| `us.meta.llama3-3-70b-instruct-v1:0` | absurd-distractors | lesson-cs-01 | 5 | 5 | 0 |
| `us.meta.llama3-3-70b-instruct-v1:0` | absurd-distractors | lesson-ops-01-r2 | 5 | 4 | 1 |
| `us.meta.llama3-3-70b-instruct-v1:0` | absurd-distractors | lesson-prv-01 | 5 | 2 | 3 |
| `us.meta.llama3-3-70b-instruct-v1:0` | absurd-distractors | lesson-sec-01 | 5 | 4 | 1 |
| `us.meta.llama3-3-70b-instruct-v1:0` | generic-feedback | lesson-cs-01 | 5 | 5 | 0 |
| `us.meta.llama3-3-70b-instruct-v1:0` | generic-feedback | lesson-ops-01-r2 | 5 | 5 | 0 |
| `us.meta.llama3-3-70b-instruct-v1:0` | generic-feedback | lesson-prv-01 | 5 | 5 | 0 |
| `us.meta.llama3-3-70b-instruct-v1:0` | generic-feedback | lesson-sec-01 | 5 | 5 | 0 |

This measures discrimination on one criterion with two kinds of defect. It does not say which judge is right about the real items; it says which judges can tell real items from broken ones.
