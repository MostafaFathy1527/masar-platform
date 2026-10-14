# QA gate report — what-counts-as-personal-data

**Result: PASS**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 3 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 | Data-subject requests are assessed in KC-02 (including identity verification and partial fulfilment) but taught only in a single takeaway bullet — the set slightly under-covers what it tests. |
| level fidelity | 4 | Both levels are genuinely what they claim and the definition cards are real cards, but the L2 experience is undercut by a scenario whose consequence fields are unfinished. |
| worked example | 4 | Each step shows the what and the why, but the whys do not consistently name what would change the judgement — step 2 explains the higher bar rather than the conditional, and step 1's why partly restates its show. |
| knowledge check | 5 |  |
| scenario authenticity | 3 | The setup is excellent — autocomplete mis-send to a same-named customer, unopened, at 5 pm is recognisable with real friction. But all three decision consequences read 'This choice has consequences' — placeholder text where the scenario's teaching content should be, which breaks the block on the page. |
| bilingual quality | 5 |  |
| concision | 4 | The prose earns its space, with slight redundancy between the intro's identifiability statement, worked-example step 1, and takeaway bullet 1. |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.


Judge's summary:

> A strong, natural bilingual lesson with knowledge checks whose distractors name real misconceptions and per-option feedback that explains why. Its one serious defect is the scenario: an authentic, high-friction situation shipped with placeholder consequences on every decision. The worked example and coverage of data-subject requests are good but a step short of excellent.
