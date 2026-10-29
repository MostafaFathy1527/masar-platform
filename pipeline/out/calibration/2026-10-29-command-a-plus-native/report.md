# Judge calibration: can each judge see a lesson broken on purpose?

Run 2026-10-29-command-a-plus-native. Each sample was scored as it is and as copies broken in one way each, every defect one the rubric names and each aimed at one criterion. A judge that sees the defect should score that criterion at least 2 points lower on the broken copy. Seated panel: `us.moonshotai.kimi-k3`, `deepseek.v3.2`, `zai.glm-5` on Amazon Bedrock, and `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` served on rented hardware.

## Per judge and criterion

| Judge | Criterion | Defects caught | Mean drop |
|---|---|---|---|
| `command-a-plus-05-2026` (seated) | bilingual_quality | 4 of 5 | 3.20 |
| `command-a-plus-05-2026` (seated) | knowledge_check | 8 of 8 | 3.00 |
| `command-a-plus-05-2026` (seated) | scenario_authenticity | 0 of 4 | 0.00 |
| `command-a-plus-05-2026` (seated) | worked_example | 4 of 4 | 2.50 |

## Every score

| Judge | Defect | Criterion | Sample | Real | Broken | Drop |
|---|---|---|---|---|---|---|
| `command-a-plus-05-2026` | absurd-distractors | knowledge_check | lesson-cs-01 | 5 | 1 | 4 |
| `command-a-plus-05-2026` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 5 | 1 | 4 |
| `command-a-plus-05-2026` | absurd-distractors | knowledge_check | lesson-prv-01 | 5 | 1 | 4 |
| `command-a-plus-05-2026` | absurd-distractors | knowledge_check | lesson-sec-01 | 5 | 1 | 4 |
| `command-a-plus-05-2026` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `command-a-plus-05-2026` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `command-a-plus-05-2026` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `command-a-plus-05-2026` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `command-a-plus-05-2026` | generic-feedback | knowledge_check | lesson-cs-01 | 5 | 3 | 2 |
| `command-a-plus-05-2026` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 5 | 3 | 2 |
| `command-a-plus-05-2026` | generic-feedback | knowledge_check | lesson-prv-01 | 5 | 3 | 2 |
| `command-a-plus-05-2026` | generic-feedback | knowledge_check | lesson-sec-01 | 5 | 3 | 2 |
| `command-a-plus-05-2026` | mismatched-numbers | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `command-a-plus-05-2026` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 1 | 4 |
| `command-a-plus-05-2026` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 1 | 4 |
| `command-a-plus-05-2026` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 1 | 4 |
| `command-a-plus-05-2026` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 1 | 4 |
| `command-a-plus-05-2026` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 3 | 2 |
| `command-a-plus-05-2026` | reasonless-steps | worked_example | lesson-ops-01-r2 | 5 | 3 | 2 |
| `command-a-plus-05-2026` | reasonless-steps | worked_example | lesson-prv-01 | 5 | 1 | 4 |
| `command-a-plus-05-2026` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 3 | 2 |

This measures whether a judge can tell a real lesson from one broken in a named way. It does not say which judge is right about the real lesson.
