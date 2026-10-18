# Judge calibration: can each judge see a lesson broken on purpose?

Run 2026-10-18-small-open-judges. Each sample was scored as it is and as copies broken in one way each, every defect one the rubric names and each aimed at one criterion. A judge that sees the defect should score that criterion at least 2 points lower on the broken copy. Seated panel: `us.moonshotai.kimi-k3`, `deepseek.v3.2`, `zai.glm-5`.

## Per judge and criterion

| Judge | Criterion | Defects caught | Mean drop |
|---|---|---|---|
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | bilingual_quality | 1 of 4 | 0.50 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | knowledge_check | 0 of 8 | 0.38 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | scenario_authenticity | 0 of 4 | 0.25 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | worked_example | 4 of 4 | 2.00 |
| `GLM-4.7-Flash-Q8_0.gguf` | bilingual_quality | 0 of 3 | 0.00 |
| `GLM-4.7-Flash-Q8_0.gguf` | knowledge_check | 6 of 8 | 1.88 |
| `GLM-4.7-Flash-Q8_0.gguf` | scenario_authenticity | 0 of 4 | 0.00 |
| `GLM-4.7-Flash-Q8_0.gguf` | worked_example | 4 of 4 | 2.25 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | bilingual_quality | 0 of 4 | 0.00 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | knowledge_check | 0 of 7 | 0.43 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | scenario_authenticity | 0 of 4 | 0.00 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | worked_example | 1 of 4 | 1.25 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | bilingual_quality | 2 of 4 | 2.00 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | knowledge_check | 8 of 8 | 3.00 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | scenario_authenticity | 0 of 4 | 0.00 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | worked_example | 4 of 4 | 2.50 |
| `gpt-oss-20b-Q8_0.gguf` | bilingual_quality | 3 of 4 | 3.00 |
| `gpt-oss-20b-Q8_0.gguf` | knowledge_check | 8 of 8 | 3.75 |
| `gpt-oss-20b-Q8_0.gguf` | scenario_authenticity | 0 of 4 | 0.00 |
| `gpt-oss-20b-Q8_0.gguf` | worked_example | 4 of 4 | 2.00 |

## Every score

| Judge | Defect | Criterion | Sample | Real | Broken | Drop |
|---|---|---|---|---|---|---|
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | 3 | 3 | 0 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 3 | 3 | 0 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | 4 | 3 | 1 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | 4 | 3 | 1 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 4 | 1 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | 3 | 3 | 0 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 3 | 3 | 0 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | 4 | 3 | 1 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | 4 | 4 | 0 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 3 | 2 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 3 | 2 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | 5 | 3 | 2 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | reasonless-steps | worked_example | lesson-prv-01 | 5 | 3 | 2 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 3 | 2 |
| `GLM-4.7-Flash-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | 5 | 2 | 3 |
| `GLM-4.7-Flash-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 5 | 3 | 2 |
| `GLM-4.7-Flash-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | 3 | 3 | 0 |
| `GLM-4.7-Flash-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | 5 | 1 | 4 |
| `GLM-4.7-Flash-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `GLM-4.7-Flash-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `GLM-4.7-Flash-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `GLM-4.7-Flash-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `GLM-4.7-Flash-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | 5 | 3 | 2 |
| `GLM-4.7-Flash-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 5 | 3 | 2 |
| `GLM-4.7-Flash-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | 3 | 3 | 0 |
| `GLM-4.7-Flash-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | 5 | 3 | 2 |
| `GLM-4.7-Flash-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `GLM-4.7-Flash-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | None | None |
| `GLM-4.7-Flash-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `GLM-4.7-Flash-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `GLM-4.7-Flash-Q8_0.gguf` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 3 | 2 |
| `GLM-4.7-Flash-Q8_0.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | 5 | 2 | 3 |
| `GLM-4.7-Flash-Q8_0.gguf` | reasonless-steps | worked_example | lesson-prv-01 | 5 | 3 | 2 |
| `GLM-4.7-Flash-Q8_0.gguf` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 3 | 2 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | 4 | 3 | 1 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 4 | 4 | 0 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | 4 | 3 | 1 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | 4 | None | None |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | 4 | 3 | 1 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 4 | 4 | 0 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | 4 | 4 | 0 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | 4 | 4 | 0 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 4 | 1 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | 5 | 4 | 1 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | reasonless-steps | worked_example | lesson-prv-01 | 5 | 4 | 1 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 3 | 2 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | 5 | 1 | 4 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 5 | 1 | 4 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | 5 | 1 | 4 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | 5 | 1 | 4 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | 5 | 3 | 2 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 5 | 3 | 2 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | 5 | 3 | 2 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | 5 | 3 | 2 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 1 | 4 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 1 | 4 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 3 | 2 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | 5 | 3 | 2 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | reasonless-steps | worked_example | lesson-prv-01 | 5 | 1 | 4 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 3 | 2 |
| `gpt-oss-20b-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | 5 | 1 | 4 |
| `gpt-oss-20b-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 5 | 1 | 4 |
| `gpt-oss-20b-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | 5 | 1 | 4 |
| `gpt-oss-20b-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | 5 | 1 | 4 |
| `gpt-oss-20b-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `gpt-oss-20b-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `gpt-oss-20b-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `gpt-oss-20b-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `gpt-oss-20b-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | 5 | 1 | 4 |
| `gpt-oss-20b-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 5 | 1 | 4 |
| `gpt-oss-20b-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | 5 | 1 | 4 |
| `gpt-oss-20b-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | 5 | 3 | 2 |
| `gpt-oss-20b-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 1 | 4 |
| `gpt-oss-20b-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `gpt-oss-20b-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 1 | 4 |
| `gpt-oss-20b-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 1 | 4 |
| `gpt-oss-20b-Q8_0.gguf` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 3 | 2 |
| `gpt-oss-20b-Q8_0.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | 5 | 3 | 2 |
| `gpt-oss-20b-Q8_0.gguf` | reasonless-steps | worked_example | lesson-prv-01 | 5 | 3 | 2 |
| `gpt-oss-20b-Q8_0.gguf` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 3 | 2 |

This measures whether a judge can tell a real lesson from one broken in a named way. It does not say which judge is right about the real lesson.

## How this run was made, and what the rows above cannot show

The question behind this run: can a judge that fits on one or two rented 32 GB cards be seated? Five
open models were served by llama.cpp on two V100 cards with the chat template each ships with, and
each ran at its own documented default decoding where it has one, otherwise at the project's
temperature 0. The files, their hashes, the server commands and the decoding settings are in
`environment.json`. Each server was checked with `/apply-template` and a one-line reply before any
judgement, and every prompt was counted with the model's own tokenizer.

The GPU time for this run was provided by [CloudRift](https://www.cloudrift.ai/). Thank you.

- **`Mistral-Small-3.2-24B-Instruct-2506.Q8_0`** (temperature 0.15, Mistral's own): 23 verdicts and one
  copy of the rubric's example, refused. 1 of 19 defects caught, the reasonless steps in SEC-01. It gave
  the Arabic 5 in all 23 verdicts, the three pasted-English copies included, and its means ran from 4.38
  to 4.88 whatever it was shown.
- **`Falcon-H1-34B-Instruct.Q8_0`** (temperature 0): 24 verdicts, no copies, 5 of 20 caught. All four
  reasonless worked examples, 5 to 3 each, with notes that quote the planted "because it is the next
  step"; one of four pasted-English copies (SEC-01, 5 to 3, "occasionally stiff"); none of the knowledge
  checks or empty scenarios. Where its 7B sibling caught 1 of 20 the night before, the 34B reads the
  worked examples and nothing else reliably.
- **`gpt-oss-20b.Q8_0`** (temperature 1.0, OpenAI's default, reasoning at its default effort): 24
  verdicts, no copies, **15 of 20 caught**: all eight knowledge-check defects (seven of the broken copies
  scored 1), all four reasonless worked examples (5 to 3), three of four pasted-English copies (5 to 1,
  the fourth, OPS-01, passed with "No concerns were identified"), and none of the four empty scenarios.
  Its notes are its own. On the real lessons it is lenient: means of 4.88 to 5.0, with no note on the two
  Arabic slips in OPS-01 that Kimi K3 named on 15 October. **It cannot be seated as the pipeline stands:**
  the generator is gpt-oss-120b, the same family, and a judge must come from outside the generator's
  family. Seating it would mean changing the generator.
- **`GLM-4.7-Flash.Q8_0`** (temperature 1.0, Z.ai's own; reasoning kept beside each verdict): 23
  verdicts, no copies; the 24th reply held unescaped quotation marks inside a JSON string and could not
  be read (its text had noticed "translationese" in that pasted-English copy). 10 of 19 caught: six of
  eight knowledge-check defects (PRV-01's real items already scored 3, leaving no room to drop), all four
  reasonless worked examples, none of the three readable pasted-English copies (5 each) and none of the
  empty scenarios. Its reasoning ran 2,400 to 6,700 tokens a verdict.
- **`Qwen3-30B-A3B-Thinking-2507.Q8_0`** (temperature 0.6, Qwen's own; reasoning kept): 24
  verdicts, no copies, **14 of 20 caught**: all eight knowledge-check defects (absurd distractors 5 to 1,
  generic feedback 5 to 3), all four reasonless worked examples, two of four pasted-English copies (OPS-01
  and SEC-01, 5 to 1, with notes that name the English left in `mdAr` and `termAr`; CS-01 and PRV-01
  passed at 5), and none of the four empty scenarios. Its notes are its own; its reasoning ran 3,200 to
  8,800 tokens a verdict. On the real lessons: 5.0 three times and 4.75 once, the one note being about
  accessibility, not the Arabic slips in OPS-01. It is Apache-2.0, 30 billion parameters with 3 billion
  active, 32.5 GB at Q8_0 (25 GB at Q6_K, which fits one 32 GB card), and it is not the generator's
  family. On 14 October the dense Qwen3-32B on Bedrock, thinking off, caught 0 of 8 knowledge-check
  defects; this is the 2507 release with its reasoning on, and the two are not the same judge.

Two of the five read the lessons: gpt-oss-20b and Qwen3-30B-A3B-Thinking-2507 clear the bar the seated
judges cleared on 14 and 15 October (the knowledge checks and the worked examples), and both catch more
of the pasted English than DeepSeek V3.2 or Kimi K2.5 did (1 of 4 each). Neither sees an empty scenario,
and no judge tested so far does reliably. gpt-oss-20b is ruled out by the generator's family. Whether
Qwen3-30B-A3B-Thinking-2507 takes a seat is the owner's decision, as Kimi K3's was; nothing here seats
it.

Judgements were sent four at a time to one server; each is still its own `judge_bedrock.py` call, with
the same prompt, parsing and gate.
