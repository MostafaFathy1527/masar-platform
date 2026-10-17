# Judge calibration: can each judge see a lesson broken on purpose?

Run 2026-10-17-open-arabic-judges. Each sample was scored as it is and as copies broken in one way each, every defect one the rubric names and each aimed at one criterion. A judge that sees the defect should score that criterion at least 2 points lower on the broken copy. Seated panel: `us.moonshotai.kimi-k3`, `deepseek.v3.2`, `zai.glm-5`.

## Per judge and criterion

| Judge | Criterion | Defects caught | Mean drop |
|---|---|---|---|
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | bilingual_quality | 0 of 1 | 0.00 |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | knowledge_check | 0 of 1 | 0.00 |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | scenario_authenticity | 0 of 1 | 0.00 |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | worked_example | 0 of 1 | 0.00 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | bilingual_quality | 0 of 4 | 0.00 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | knowledge_check | 0 of 8 | 0.12 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | scenario_authenticity | 0 of 4 | 0.00 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | worked_example | 1 of 4 | 0.75 |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | bilingual_quality | 0 of 0 | 0.00 |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | knowledge_check | 0 of 0 | 0.00 |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | scenario_authenticity | 0 of 0 | 0.00 |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | worked_example | 0 of 0 | 0.00 |
| `jais-family-30b-16k-chat.Q6_K.gguf` | bilingual_quality | 0 of 0 | 0.00 |
| `jais-family-30b-16k-chat.Q6_K.gguf` | knowledge_check | 0 of 0 | 0.00 |
| `jais-family-30b-16k-chat.Q6_K.gguf` | scenario_authenticity | 0 of 0 | 0.00 |
| `jais-family-30b-16k-chat.Q6_K.gguf` | worked_example | 0 of 0 | 0.00 |

## Every score

| Judge | Defect | Criterion | Sample | Real | Broken | Drop |
|---|---|---|---|---|---|---|
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | 4 | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | None | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | None | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | None | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | 4 | 4 | 0 |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | None | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | None | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | None | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | 4 | 4 | 0 |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | None | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | None | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | None | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | None | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | None | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | None | 5 | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | reasonless-steps | worked_example | lesson-cs-01 | 4 | 4 | 0 |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | None | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | reasonless-steps | worked_example | lesson-prv-01 | None | None | None |
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | reasonless-steps | worked_example | lesson-sec-01 | None | None | None |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | 3 | 3 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 3 | 3 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | 3 | 3 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | 4 | 4 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | 3 | 3 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 3 | 3 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | 3 | 3 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | 4 | 3 | 1 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 4 | 1 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | reasonless-steps | worked_example | lesson-prv-01 | 4 | 4 | 0 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 3 | 2 |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | reasonless-steps | worked_example | lesson-cs-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | reasonless-steps | worked_example | lesson-prv-01 | None | None | None |
| `SILMA-9B-Instruct-v1.0.Q8_0.gguf` | reasonless-steps | worked_example | lesson-sec-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | reasonless-steps | worked_example | lesson-cs-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | reasonless-steps | worked_example | lesson-prv-01 | None | None | None |
| `jais-family-30b-16k-chat.Q6_K.gguf` | reasonless-steps | worked_example | lesson-sec-01 | None | None | None |

This measures whether a judge can tell a real lesson from one broken in a named way. It does not say which judge is right about the real lesson.

## How this run was made, and what the rows above cannot show

Four open Arabic models, each served by llama.cpp on two V100 32 GB cards with the chat template
it ships with, at temperature 0 and 4,000 tokens: every judge's default here, and each model's own,
since none of their generation configs sets sampling. The files, their hashes, the server commands
and the rendered templates are in `environment.json`. Before any judgement, each server was checked
with `/apply-template` and a one-line reply, and every prompt was counted with the model's own
tokenizer, so that no slot was too short for it.

The GPU time for this run was provided by [CloudRift](https://www.cloudrift.ai/). Thank you.

- **`SILMA-9B-Instruct-v1.0.Q8_0.gguf`**: no verdict in 24. Fourteen replies were «هو رأي سلبي»
  ("it is a negative opinion"), five stopped after `{`, four were empty, and one began the
  example's scores and stopped before the closing brace. Each reply is kept as
  `verdict.<tag>.raw.txt`. The server is not the cause: after the same SEC-01 prompt it named the
  lesson's subject when asked, it returns JSON to a short request, and after `{` its own odds
  favour ending the reply (0.57) over a new line (0.43). Its slots were its trained context, 8,192
  tokens; no reply came near the limit.
- **`Falcon-H1-7B-Instruct-Q8_0.gguf`**: a verdict for all 24, and 1 of 20 defects caught: the
  reasonless steps in SEC-01, 5 to 3, with a note that the "why" steps add no reasoning.
  Two more are described in a note while the score falls by only 1 (the reasonless steps in CS-01,
  the generic feedback in SEC-01). It gave the Arabic 5 in all 24, the four copies with English in
  their Arabic fields included. Twenty of its 24 knowledge-check scores are the example's 3, and 7
  verdicts carry the example's knowledge-check note word for word.
- **`AceGPT-v2-32B-Chat.Q8_0.gguf`**: 18 of 24 replies were the example and were refused. Four of
  the other six are the example with one score changed, knowledge check 3 to 4, its note kept word
  for word and its closing note with one digit changed, "mean 4.1" included, beside scores whose
  mean is 4.25. The copy check refuses only an exact copy, so those four were scored, and the
  AceGPT rows above compare them: they are not readings. Its two other verdicts, CS-01 as written
  and CS-01 with pasted English, are not copies; it gave the pasted English 5.
- **`jais-family-30b-16k-chat.Q6_K.gguf`**: no verdict in 24. Sixteen replies were "I'm sorry, but
  as an AI, I can't provide the information you're looking for.", seven described the rubric
  instead of scoring the lesson, and one declined and then wrote unscored prose about it. It read
  the prompt: after the same SEC-01 prompt it named the lesson's subject when asked, and it returns
  JSON to a short request. On that prompt its first word is "I" at 0.33, against `{` at 0.06.

None is seated. Judgements were sent as many at a time as each server had slots (8, 8, 4 and 2);
each is still its own `judge_bedrock.py` call, with the same prompt, parsing and gate.
