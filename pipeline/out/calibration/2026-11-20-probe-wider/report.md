# Scenario probe v2, wider set (20 November 2026)

**Question.** v2 was clean on four sample lessons (GLM-5, English). Does it hold on every
other bilingual scenario we have?

**Set.** Seven more real scenarios, each with a `swapped-consequences` copy made by
`calibrate_judges.swapped_consequences`, unchanged: the five human-authored course lessons
with a scenario (rcm-foundations 01, 03, 04, 05, 07) and two earlier generated drafts
(OPS-01 v2, OPS-01-r2 v1). One run each.

| Model | Side | Swapped caught | False alarms on real |
|---|---|---|---|
| DeepSeek V3.2 | EN | 7 of 7 | 0 of 7 |
| GLM-5 | EN | 6 of 7 (missed rcm-07) | 0 of 7 |
| GLM-5 | AR | 6 of 7 (missed rcm-07) | 0 of 7 |

**With the first set (11 distinct scenarios, English, prompt v2):** DeepSeek 11 of 11
caught, 1 of 11 false alarms (SEC-01). GLM-5 10 of 11 caught, 0 of 11 false alarms.
Flagging when either one flags: 11 of 11 caught, 1 of 11 false alarms.

**Why rcm-07 is hard.** All three of its consequences explain the rule (a rejection is
not a refusal; resubmit, do not appeal) rather than describe what happens after the
choice. Shifted one place, each still reads as a plausible comment on its new option, and
GLM-5 accepted all three. A consequence written as an outcome ("the payer confirms the
claim was never processed") is tied to its option; one written as a lecture is
interchangeable. That is a writing weakness the probe exposes, as well as a probe limit.

**Recommendation.** Still not a seat or a gate. The two-model union is the best rule so
far, at about 190 output tokens a call each. Before any gate: (1) write 4 to 6 harder
planted copies where only one consequence is moved, (2) run the union twice for drift.
For lesson writing: ask that each consequence describe what happens next, not restate
the rule (to Layla, via Tarek).

**Cost.** 42 Bedrock calls, 18,462 input and 7,691 output tokens. At most $0.17
(estimate, priced high).
