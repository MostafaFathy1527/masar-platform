# Swapped scenario consequences: can a judge see them?

Run 20 November 2026. New defect `swapped-consequences` in `calibrate_judges.py`: every
decision in a scenario shows the next decision's consequence. Unlike `empty-consequences`,
each consequence stays distinct and long enough, so `validate.py` passes all four copies
(checked). Only a reader can catch it.

## Arm A: the three hosted seats, full rubric (`report.md`)

| Judge | Caught (drop of 2 or more) | Real → broken |
|---|---|---|
| Kimi K3 | 4 of 4 | 5→1, 4→2, 5→1, 4→2 |
| DeepSeek V3.2 | 0 of 4 | 5→5 on all four |
| GLM-5 | 0 of 4 | 5→5 on all four |

Because Kimi K3 drops by two or more and the others stay at 5, the panel's split rule sends
every swapped copy to NEEDS HUMAN. It does not pass them, but it catches them only through
one seat.

## Arm B: one narrow question per scenario (`scenario_probe.py`, `scenario-probe.json`)

The probe sees only the situation and each option with its consequence (English side), and is asked
whether each consequence follows from its option.

| Model | Swapped copies flagged | Real lessons flagged (false alarm) |
|---|---|---|
| DeepSeek V3.2 | 4 of 4 | 1 of 4 (OPS-01: read a weak option's warning as a contradiction) |
| Nova Pro | 4 of 4 | 3 of 4 |

The same DeepSeek V3.2 that scored every swapped copy 5 under the full rubric flagged every one
when asked only this question.

## Cost (estimate, from token counts in the verdicts)

Arm A: 24 calls, 170,632 input and 30,820 output tokens (Kimi K3 wrote 27,830 of them). Arm B:
16 calls, 6,334 input and 2,470 output tokens. At no more than $1 per million input and $4 per
million output, the total is at most $0.31.

## What this does not show

Four samples and one run each. No drift check yet. The probe reads the English side only, so
an Arabic consequence that disagrees with its English is out of its scope. A false alarm
rate of 1 in 4 is too high to seat it.
