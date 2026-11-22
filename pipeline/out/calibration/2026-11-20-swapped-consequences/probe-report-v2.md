# Scenario probe, prompt v2 (20 November 2026)

**Hypothesis.** v1's one false alarm (OPS-01, real lesson) came from reading a weak
option's honest warning as a consequence that "does not follow". A prompt that says weak
options are meant to get bad outcomes, and asks the model first to name what action each
consequence reacts to, keeps the catches and drops that false alarm.

**Run.** `scenario_probe.py --prompt v2`, the same 8 copies (4 real, 4 with swapped
consequences), one scenario each. English: DeepSeek V3.2 twice, GLM-5 twice, Kimi K3
once. Arabic side (`--lang Ar`): DeepSeek V3.2 and GLM-5 once.

| Model | Side | Runs | Swapped copies caught | False alarms on real lessons |
|---|---|---|---|---|
| Kimi K3 | EN | 1 | 4 of 4 | 0 of 4 |
| GLM-5 | EN | 2 | 4 of 4, both runs | 0 of 4, both runs |
| DeepSeek V3.2 | EN | 2 | 4 of 4, both runs | 1 of 4, both runs (SEC-01 d3) |
| GLM-5 | AR | 1 | 4 of 4 | 1 of 4 (SEC-01 d3) |
| DeepSeek V3.2 | AR | 1 | 4 of 4 | 1 of 4 (SEC-01 d3) |

v1 for comparison: DeepSeek 4 of 4 with 1 false alarm (OPS-01 d1/d3).

**Result.** The OPS-01 false alarm is gone in every run. A new one appears on SEC-01's
best option ("The correct action. 'Cannot take calls' is precisely the part engineered to
stop you making this one check."): DeepSeek, on both sides, and GLM-5 on the Arabic side,
read the explanation of the trap as a warning against the option. Same answer in both
DeepSeek runs, so this is a steady misreading, not noise.

Kimi K3 is clean but writes about 1,100 output tokens a call against about 190 for the
other two, and it already catches this defect inside the full rubric (4 of 4, v1 report).
The cheap candidate is GLM-5 on the English side: 8 of 8 catches, 0 of 8 false alarms
over two runs.

**Limits.** Four real scenarios is a tiny sample: one false alarm moves the rate by 25
points. No result here is enough to seat anything.

**Recommendation.** Keep it an experiment. Next: run GLM-5 v2 (English) on every scenario
in the course lessons and samples, real and swapped, before deciding whether it can be a
cheap gate in front of the panel.

**Cost.** 48 Bedrock calls: 28,384 input and 18,400 output tokens in all. At most $0.33
(estimate, priced high).
