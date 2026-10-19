# QA gate report — writing-a-cv

**Result: FAIL**

Mean 3.75 over 8 scored criteria (threshold 4.0); lowest criterion 3 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 4 |  |
| knowledge check | 4 |  |
| scenario authenticity | 3 | The situation is recognisable but nearly frictionless: given the lesson's own rules, d3 is obvious. Worse, the consequence for d2 ('the volunteering entry can be rewritten to show relevant skills') reads as an endorsement and never explains why rewriting-to-relevance is inferior to deleting, so the one genuinely awkward judgement in the scenario goes untaught. |
| bilingual quality | 3 | Mostly natural Arabic, but the worked example's step 1 is internally inconsistent in Arabic: the draft says «مسؤول عن حسابات العملاء» yet the step quotes «أدارت» as the insufficient verb (the English correctly quotes 'responsible for'), leaving the Arabic version of a key block not tracking its own prompt. Person agreement also drifts (feminine third-person «أدارت»/«قادت» where a CV line implies first person), and there are literal renderings such as «بنسبة ملحوظة» and «كملء مساحة». |
| concision | 4 |  |
| accessibility ip | 4 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Mean 3.75 is below 4.0.**

Judge's summary:

> Structure, checks and concision are solid: distractors name real misconceptions, feedback explains rather than restates, and nothing is padded. The lesson is dragged down by a frictionless scenario whose middle option is never argued against, and by an Arabic worked-example step that contradicts its own prompt plus person-agreement drift. Mean 3.75 with two criteria at 3 — the bilingual pass needs another revision round before this ships to Arabic readers.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
