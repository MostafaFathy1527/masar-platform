# Mismatched numbers: can a judge see that the Arabic says a different number?

Run 2026-10-19, on Amazon Bedrock, from the on-demand calibration workflow
(`.github/workflows/calibrate.yml`, Actions run 39219326348). The verdicts are in that run's
`calibration` artifact (30 days); they are not copied here. The table below is the run's own
report.

The defect, `mismatched-numbers`, moves every number in the Arabic fields by one (width and digit
script kept) and leaves the English as it was, so the two languages no longer say the same thing.
It targets `bilingual_quality`. Of the samples, only `lesson-ops-01-r2` has numbers in its Arabic,
so each judge saw **one** real-versus-broken pair. One pair is a signal, not a rate.

| Judge | Real | Broken | Drop | Caught (drop of 2 or more) |
|---|---|---|---|---|
| us.moonshotai.kimi-k3 (seated) | 4 | 1 | 3 | yes |
| deepseek.v3.2 (seated) | 5 | 5 | 0 | no |
| zai.glm-5 (seated) | 5 | 5 | 0 | no |
| mistral.mistral-large-3-675b-instruct | 5 | 5 | 0 | no |
| nvidia.nemotron-super-3-120b | 5 | 5 | 0 | no |
| qwen.qwen3-next-80b-a3b | 5 | 5 | 0 | no |
| qwen.qwen3-vl-235b-a22b | 5 | 5 | 0 | no |
| us.meta.llama4-maverick-17b-instruct-v1:0 | 5 | 5 | 0 | no |
| zai.glm-4.7 | 5 | 5 | 0 | no |
| minimax.minimax-m2.5 | — | 5 | — | no usable verdict on the real lesson |

**One of nine** judges with both verdicts noticed that the Arabic and the English disagree on
every number, and eight gave the broken copy full marks for bilingual quality. Seated judges
included: the panel catches this only because Kimi K3 sits on it, and a split on this criterion
already sends a lesson to a person. The open seat (Qwen3-30B-A3B-Thinking) was not in this run;
it needs the rented GPU.
