# Judge calibration: can each judge see a lesson broken on purpose?

Run 2026-10-17. Each sample was scored as it is and as copies broken in one way each, every defect one the rubric names and each aimed at one criterion. A judge that sees the defect should score that criterion at least 2 points lower on the broken copy. Seated panel: `us.moonshotai.kimi-k3`, `deepseek.v3.2`, `zai.glm-5`.

## Per judge and criterion

| Judge | Criterion | Defects caught | Mean drop |
|---|---|---|---|
| `Fanar-2-27B-Instruct.Q8_0.gguf` | bilingual_quality | 0 of 0 | 0.00 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | knowledge_check | 0 of 0 | 0.00 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | scenario_authenticity | 0 of 0 | 0.00 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | worked_example | 0 of 0 | 0.00 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | bilingual_quality | 1 of 2 | 2.00 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | knowledge_check | 4 of 6 | 1.33 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | scenario_authenticity | 0 of 3 | 0.00 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | worked_example | 0 of 3 | 0.33 |

## Every score

| Judge | Defect | Criterion | Sample | Real | Broken | Drop |
|---|---|---|---|---|---|---|
| `Fanar-2-27B-Instruct.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | reasonless-steps | worked_example | lesson-cs-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | reasonless-steps | worked_example | lesson-prv-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | reasonless-steps | worked_example | lesson-sec-01 | None | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | absurd-distractors | knowledge_check | lesson-cs-01 | None | 3 | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 5 | 3 | 2 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | absurd-distractors | knowledge_check | lesson-prv-01 | 3 | 1 | 2 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | absurd-distractors | knowledge_check | lesson-sec-01 | 3 | 3 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | empty-consequences | scenario_authenticity | lesson-cs-01 | None | 5 | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | generic-feedback | knowledge_check | lesson-cs-01 | None | 3 | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 5 | 3 | 2 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | generic-feedback | knowledge_check | lesson-prv-01 | 3 | 3 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | generic-feedback | knowledge_check | lesson-sec-01 | 3 | 1 | 2 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | pasted-english | bilingual_quality | lesson-cs-01 | None | 5 | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | None | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 1 | 4 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | reasonless-steps | worked_example | lesson-cs-01 | None | 5 | None |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | reasonless-steps | worked_example | lesson-ops-01-r2 | 5 | 4 | 1 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | reasonless-steps | worked_example | lesson-prv-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 5 | 0 |

This measures whether a judge can tell a real lesson from one broken in a named way. It does not say which judge is right about the real lesson.

## How this run was made, and what the rows above cannot show

QCRI's Fanar-2-27B-Instruct at Q8_0 (8-bit), served by llama.cpp on two V100 32 GB cards. The
model file's hash, the server command and both chat templates are in `environment.json`.

- **`Fanar-2-27B-Instruct.Q8_0.gguf`**: thinking off, temperature 0, 4,000 tokens, as on Kaggle on
  15 October. All 24 verdicts were the rubric's example and were refused, so every row for it is
  empty; each refused reply is kept as `verdict.<tag>.raw.txt`. At Q4_K_M it was 24 of 24 too, so
  the 4-bit quantisation was not the cause.
- **`Fanar-2-27B-Instruct.Q8_0.gguf+thinking`**: thinking on, which is QCRI's default, at
  temperature 0.7, the value in QCRI's own usage example (greedy decoding can loop inside a
  reasoning trace), with 12,000 tokens. The whole reply, reasoning included, is beside each
  verdict as `verdict.<tag>.output.txt`. No verdict was a copy, and 2 of the 24 replies held no
  parseable JSON. But 14 of its 22 verdicts carry the example's knowledge-check note word for word,
  "Two distractors restate the stem rather than naming a misconception.", and 5 of its traces
  consult the example while scoring the lesson in front of them, one calling it "the user's
  note". Of its 5 caught defects, 2 rest on the borrowed note alone, 1 on the borrowed note with a
  sentence about that copy's feedback added, 1 on a bilingual note that calls English text a
  machine-like Arabic translation, and 1 on a note that names the defect.

The same two runs, with the example in the rubric emptied of its values, are in
`../2026-10-17-no-values-in-example/`. Judgements were sent eight at a time to one server; each
is still its own `judge_bedrock.py` call, with the same prompt, parsing and gate.
