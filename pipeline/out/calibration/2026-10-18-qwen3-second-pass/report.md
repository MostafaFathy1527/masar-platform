# Judge calibration: can each judge see a lesson broken on purpose?

Run 2026-10-18-qwen3-second-pass. Each sample was scored as it is and as copies broken in one way each, every defect one the rubric names and each aimed at one criterion. A judge that sees the defect should score that criterion at least 2 points lower on the broken copy. Seated panel: `us.moonshotai.kimi-k3`, `deepseek.v3.2`, `zai.glm-5`.

## Per judge and criterion

| Judge | Criterion | Defects caught | Mean drop |
|---|---|---|---|
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | bilingual_quality | 1 of 4 | 1.25 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | knowledge_check | 6 of 8 | 2.25 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | scenario_authenticity | 0 of 4 | 0.00 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | worked_example | 4 of 4 | 2.50 |

## Every score

| Judge | Defect | Criterion | Sample | Real | Broken | Drop |
|---|---|---|---|---|---|---|
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | 5 | 1 | 4 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 3 | 3 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | 5 | 1 | 4 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | 5 | 1 | 4 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | 5 | 3 | 2 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 3 | 3 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | 5 | 3 | 2 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | 5 | 3 | 2 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 1 | 4 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 4 | 1 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 3 | 2 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | 5 | 3 | 2 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | reasonless-steps | worked_example | lesson-prv-01 | 5 | 1 | 4 |
| `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 3 | 2 |

This measures whether a judge can tell a real lesson from one broken in a named way. It does not say which judge is right about the real lesson.

## How this run was made, and what it shows

The same file, server settings and decoding as the first pass in `../2026-10-18-small-open-judges/`
(temperature 0.6, 12,000 tokens, reasoning kept beside each verdict), on a fresh VM with llama.cpp
built at the same commit. It is the two-run check Kimi K3 had before its seat.

The GPU time for this run was provided by [CloudRift](https://www.cloudrift.ai/). Thank you.

- **Defects caught:** 11 of 20, against 14 of 20 in the first pass. Worked examples 4 of 4 both
  times; knowledge checks 6 of 8 against 8 of 8; pasted English 1 of 4 against 2 of 4; empty
  scenarios 0 of 4 both times.
- **Scores that moved:** 12 of 192, 10 of them by two points or more. On the four real lessons, 2 of
  32 moved, both by two. Kimi K3's two runs differed by one point on 10 of 32.
- **Gate outcomes that flipped:** 4 of 24, three of them on pasted-English copies.

At temperature 0.6 this judge is steady on worked examples and mostly steady on knowledge checks,
and not steady on pasted English. On the panel that costs little: a pasted-English lesson already
splits the seated judges and goes to a person, and the two judges that catch it every time, Kimi K3
and GLM-5, still sit. The seat was the owner's decision on the first pass; this run is recorded so
the seat's limits are written down, not to reopen it.
