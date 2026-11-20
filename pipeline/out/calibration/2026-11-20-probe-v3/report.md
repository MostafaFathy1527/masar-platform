# Scenario probe v3: "Because you <option>, ..." (20 November 2026)

**Hypothesis.** v2 caught every full swap but only 6 of 11 weak-for-weak swaps, where
the tone stays right and only the match is wrong. If the model must join each option to
its consequence in one sentence ("Because you <option>, <consequence>") before judging,
a consequence about another action makes a sentence that visibly does not hold together.

**Set.** The 11 `weak-swap` copies (`../2026-11-20-probe-weak-swap/`) and the 11 real
copies they came from (`../2026-11-20-probe-wider/*__real-items`,
`../2026-11-20-swapped-consequences/*__real-items`). The run read them through links,
removed before commit; the copy names in each results file say which is which. English
side, `--prompt v3`, two runs each.

| | DeepSeek V3.2 | GLM-5 | either one |
|---|---|---|---|
| weak swaps caught, run 1 | 8 of 11 | 6 of 11 | 9 of 11 |
| weak swaps caught, run 2 | 8 of 11 | 7 of 11 | 9 of 11 |
| false alarms on real, run 1 | 0 of 11 | 0 of 11 | 0 of 11 |
| false alarms on real, run 2 | 0 of 11 | 0 of 11 | 0 of 11 |

v2 on the same weak swaps: DeepSeek 5, GLM-5 3, either 6 of 11; and DeepSeek's steady
SEC-01 false alarm is gone under v3. 3 of 44 verdicts changed between the two runs.
rcm-03 was never caught.

**Result.** The forced restatement works: the two-model rule went from 6 to 9 of 11 on
the realistic defect with no false alarm in 44 real-lesson verdicts, and it held over two
runs. Still a small set: 11 scenarios, one planted defect type.

**Recommendation.** v3 with "either DeepSeek V3.2 or GLM-5 flags" is good enough to try
as an advisory line in the panel report (never a seat, never a PASS/FAIL input) once
Tarek agrees. Before that: more scenarios (each new lesson adds one) and an Arabic-side
run of v3.

**Cost.** 88 Bedrock calls, 39,684 input and 21,434 output tokens. At most $0.44
(estimate, priced high), on AWS credits.
