# Scenario probe v4: reading both languages at once (21 November 2026)

**Hypothesis.** v3 caught 9 of 11 weak-for-weak swaps on the English side but only 5 of 11
on the Arabic side. The lessons are bilingual, so a probe that reads each option's English
and Arabic together (`--prompt v4 --lang Both`) should (a) lift the Arabic catch rate with
English beside it, and (b) catch a defect no one-side probe can see: an Arabic consequence
that says something different from its English one.

**Set.** 33 copies, one scenario each. The 11 real copies and the 11 `weak-swap` copies
from the v3 run (read through links, removed before commit), plus 11 new `ar-only-swap`
copies in this folder: each real copy with the Arabic consequences of its first two weak
options traded and the English left alone. One run per model, DeepSeek V3.2 and GLM-5.

| | DeepSeek V3.2 | GLM-5 | either one |
|---|---|---|---|
| weak swaps (both sides) caught | 2 of 11 | 2 of 11 | 3 of 11 |
| Arabic-only swaps caught | 11 of 11 | 11 of 11 | 11 of 11 |
| false alarms on real | 0 of 11 | 0 of 11 | 0 of 11 |

For comparison, v3 on the same weak swaps: English side 9 of 11, Arabic side 5 of 11.
The Arabic-only swaps were caught mostly by `sides_agree` (22 and 21 of 22 swapped options
flagged), and also by `ar_follows` (17 and 15 of 22).

**Result.** Half of the hypothesis is wrong. Reading both sides did not help the match
check: it fell from 9 (English v3) to 3 of 11, below even the Arabic-only v3. With three
checks per option and twice the text, the models stop testing whether each consequence
follows from its own option. Part (b) held: a cross-language mismatch was caught every
time by both models, with no false alarm. That defect is invisible to every seated judge
and to v3, which reads one side only. The Arabic-only swap is a crude drift (a whole
consequence from another option); a subtle translation drift is still untested.

**Recommendation.** Keep the two questions apart. If an advisory line ships, it runs v3 on
the English side for the match and a separate, narrow "do the two sides say the same
thing?" check for translation drift. Do not use v4 for the match. Next test: subtle drift
(one changed fact or a negation in the Arabic only) with a sides-agree-only prompt.

**Cost.** 66 Bedrock calls, 54,336 input and 29,414 output tokens, at most $0.60
(estimate, priced high like the v3 runs).
