# Scenario probe v2, the harder defect: two weak options swapped (20 November 2026)

**Question.** `swapped-consequences` moves every consequence, so the best option always
ends up with a weak option's warning, and the tone gives it away. What if only the two
weak options trade consequences? The tone stays right; only the match is wrong.

**Set.** All 11 bilingual scenarios used in the two earlier probe runs, each with its
first two weak options' consequences swapped (English and Arabic together). The real
copies were already probed (0 of 11 false alarms for GLM-5, 1 of 11 for DeepSeek V3.2).
Prompt v2, English side, one run.

| Copy | DeepSeek V3.2 | GLM-5 |
|---|---|---|
| cs-01 | caught | missed |
| ops-01-r2 (v2) | missed | missed |
| ops-01-r2 (v1) | missed | missed |
| ops-01 v2 | caught | missed |
| prv-01 | caught | caught |
| sec-01 | caught | missed |
| rcm-01 | caught | caught |
| rcm-03 | missed | missed |
| rcm-04 | missed | missed |
| rcm-05 | missed | caught |
| rcm-07 | missed | missed |

**Result.** DeepSeek 5 of 11, GLM-5 3 of 11, either one 6 of 11. When the swap leaves the
tone right, the probe catches about half, against 11 of 11 for the full swap. The full
swap measured mostly the tone check, not the match.

**Recommendation.** The probe is not a gate. It catches crude defects (a best option
warned against) and misses about half of the realistic one (a weak option shown another
weak option's outcome). For the realistic defect the cheapest strong guard is probably at
writing time, not judging time: each consequence names the action it follows from. Next
experiment: ask the probe model to rewrite each consequence's first clause as "Because you
<option>, ..." and check whether that forced restatement catches the weak swap.

**Cost.** 22 Bedrock calls, 9,734 input and 4,087 output tokens. At most $0.10 (estimate,
priced high), on AWS credits.
