# Arabic lesson judge pairs

A small, open dataset for training and testing **LLM-as-a-judge** models on Arabic and bilingual (Arabic and English) instructional content. Each record pairs a real lesson with a copy of it broken in one named, rule-based way, and states which rubric criterion a judge should mark down and by how much. A second file records what real judge models actually did with these pairs.

It is built from the lessons of Masar, an open-source Arabic-first learning platform, with no model call: the broken copies are made by deterministic code, and the judge behaviour is read from verdicts already on disk.

## Files

- `pairs.jsonl`: 47 pairs from 9 source lessons.
- `judge_behaviour.jsonl`: 360 records from 24 judge models across 7 calibration runs.
- `README.md`: this card.

## How it was built

1. **Sources.** 4 lessons drafted by the project's generation pipeline (`source: pipeline-draft`, the samples `pipeline/calibrate_judges.py` uses) and 5 lessons written by hand for the demo course (`source: human-authored-course`), with their items taken from the course item bank.
2. **Defects.** Each defect in `calibrate_judges.MUTANTS` is applied to each lesson. A defect with nothing to break in a lesson (no number in its Arabic, no scenario, no worked example) produces no record.
3. **What the judge sees.** `real.items` and `broken.items` are exactly the items `pipeline/judge_bedrock.py` puts in front of a judge: the items the lesson's knowledge checks reference, in that order, resolved the same way.
4. **Judge behaviour.** For every calibration run under `pipeline/out/calibration/`, every model with a verdict on both the real copy and a broken copy of the same sample yields one record. The latest verdict per model in a folder counts. 63 verdict files were left out: 6 no real verdict from the same model, 57 rubric example handed back.

## The defects

| Defect | Target criterion | human-authored-course | pipeline-draft | Pairs |
|---|---|---|---|---|
| `generic-feedback` | knowledge_check | 5 | 4 | 9 |
| `absurd-distractors` | knowledge_check | 5 | 4 | 9 |
| `pasted-english` | bilingual_quality | 5 | 4 | 9 |
| `reasonless-steps` | worked_example | 5 | 4 | 9 |
| `empty-consequences` | scenario_authenticity | 5 | 4 | 9 |
| `mismatched-numbers` | bilingual_quality | 1 | 1 | 2 |

- `generic-feedback`: every option's feedback becomes "Correct." or "Not correct.".
- `absurd-distractors`: every wrong option becomes something no learner would pick.
- `pasted-english`: every Arabic field holds the English text while the lesson claims to be bilingual.
- `reasonless-steps`: every worked-example step's reasoning becomes "Because it is the next step.".
- `empty-consequences`: every scenario decision's consequence becomes the same empty sentence.
- `mismatched-numbers`: every number in a field written in Arabic moves one up (width and digit script kept, so 16:00 becomes 17:01 and 1,260 becomes 2,261), and the English is left as it was; the Arabic no longer says what the English says. It applied to 2 of 9 lessons.

Pairs not made, and why:

| Lesson | Defect | Reason |
|---|---|---|
| lesson-sec-01 | `mismatched-numbers` | no Arabic field carries a number |
| lesson-cs-01 | `mismatched-numbers` | no Arabic field carries a number |
| lesson-prv-01 | `mismatched-numbers` | no Arabic field carries a number |
| 01-the-insurance-transaction | `mismatched-numbers` | the lesson declares itself English-only |
| 03-eligibility-and-pre-authorisation | `mismatched-numbers` | the lesson declares itself English-only |
| 05-documentation-that-supports-the-claim | `mismatched-numbers` | the lesson declares itself English-only |
| 07-denials-cause-category-cure | `mismatched-numbers` | the lesson declares itself English-only |

## Fields

`pairs.jsonl`, one JSON object per line:

- `id`: `<lesson>__<defect>`, unique.
- `source`: `pipeline-draft` or `human-authored-course`; `source_path`: the lesson file.
- `lesson`: the lesson slug; `levels`: the depths it declares (L1, L2, L3); `bilingual`: what it declares (absent in the source means true).
- `defect`, `target_criterion`: the defect planted and the rubric criterion it targets.
- `expected`: `{"criterion", "min_drop": 2, "statement"}`: a judge that sees the defect scores `real` at least `min_drop` points higher than `broken` on the criterion.
- `real`, `broken`: `{"lesson": <lesson JSON>, "items": [<items the judge is shown>]}`.

`judge_behaviour.jsonl`:

- `run`: the calibration folder; `model_id`, `provider`: the judge, as its verdict records it.
- `lesson`, `defect`, `target_criterion`.
- `real_score`, `broken_score`, `drop`, and `caught` (`drop >= 2`).
- `real_verdict`, `broken_verdict`: the verdict files, relative to the repository root.

## Judge behaviour

| Model | Records | Caught | Runs |
|---|---|---|---|
| `AceGPT-v2-32B-Chat.Q8_0.gguf` | 1 | 0 | 1 |
| `Falcon-H1-34B-Instruct-Q8_0.gguf` | 20 | 5 | 1 |
| `Falcon-H1-7B-Instruct-Q8_0.gguf` | 20 | 1 | 1 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | 20 | 0 | 1 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | 34 | 9 | 2 |
| `GLM-4.7-Flash-Q8_0.gguf` | 19 | 10 | 1 |
| `Mistral-Small-3.2-24B-Instruct-2506-Q8_0.gguf` | 19 | 1 | 1 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | 40 | 25 | 2 |
| `amazon.nova-pro-v1:0` | 8 | 0 | 1 |
| `deepseek.v3.2` | 20 | 12 | 1 |
| `google.gemma-3-27b-it` | 1 | 0 | 1 |
| `gpt-oss-20b-Q8_0.gguf` | 20 | 15 | 1 |
| `minimax.minimax-m2.5` | 14 | 4 | 2 |
| `mistral.mistral-large-3-675b-instruct` | 16 | 1 | 2 |
| `moonshotai.kimi-k2.5` | 20 | 15 | 1 |
| `nvidia.nemotron-super-3-120b` | 8 | 0 | 2 |
| `qwen.qwen3-32b-v1:0` | 8 | 0 | 1 |
| `qwen.qwen3-next-80b-a3b` | 4 | 0 | 1 |
| `qwen.qwen3-vl-235b-a22b` | 8 | 0 | 2 |
| `us.meta.llama3-3-70b-instruct-v1:0` | 8 | 1 | 1 |
| `us.meta.llama4-maverick-17b-instruct-v1:0` | 4 | 0 | 1 |
| `us.moonshotai.kimi-k3` | 20 | 19 | 2 |
| `zai.glm-4.7` | 8 | 2 | 2 |
| `zai.glm-5` | 20 | 16 | 1 |

| Defect | Records | Caught |
|---|---|---|
| `generic-feedback` | 75 | 34 |
| `absurd-distractors` | 72 | 38 |
| `pasted-english` | 83 | 20 |
| `reasonless-steps` | 55 | 39 |
| `empty-consequences` | 75 | 5 |
| `mismatched-numbers` | 0 | 0 |

Scores are integers from 1 to 5 on the rubric in `pipeline/rubric.md`. A verdict that hands back the rubric's printed example is not counted.

## Limits

- **Few source lessons.** 9 lessons, in a handful of training domains. This is a seed set, not a benchmark.
- **Synthetic, rule-based defects.** Every broken copy is made by code. Real lessons fail in subtler and more varied ways.
- **Some broken copies are obviously broken.** Absurd distractors and one-word feedback are easy to see; they test whether a judge reads the items at all, not whether it has taste.
- **English-only lessons.** 4 `pasted-english` pairs come from lessons that declare themselves English-only, so the broken copy differs only in claiming to be bilingual.
- **No human labels.** `expected` is the direction the rubric implies, not a score a person gave. The real lessons have not been scored by a person either.
- **Model text.** The pipeline drafts were generated by a model and have not had a human review; the course lessons were written by hand.

## Licence

The lesson content is licensed under CC BY-NC 4.0 (see `LICENSE-content.md` at the repository root). The code that builds the dataset is MIT-licensed (see `LICENSE`).

## Regenerate

```
python pipeline/judge_dataset.py
```

The pairs are deterministic; the behaviour file grows as calibration runs are added.
