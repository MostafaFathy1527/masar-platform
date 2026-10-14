# QA gate report — handling-a-customer-complaint

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 | All blocks serve CS-01. The L1 blocks establish concepts; L2 applies them. One minor stretch: the job_tip about 'What do you want to happen now?' is excellent but sits in L1 without a knowledge check to reinforce it before L2's worked example assumes mastery of it. |
| level fidelity | 4 | L1 has definition cards, a job tip, and takeaways—appropriate for concept introduction. L2 has worked example, scenario, and knowledge checks. The 'visual cards' are actual definition cards with terms and definitions, not bulleted lists with borders. However, L1 lacks any interactive element; it's entirely presentational. The level distinction is clear but L1 is thinner than ideal. |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | Both knowledge checks have critical failures. KC-01: three distractors receive only 'Not correct'/'غير صحيح' feedback that restates the stem rather than naming misconceptions. The distractors represent real errors (apologizing for feelings, premature transfer, over-promising) but the feedback explains nothing. KC-02: same problem—all three incorrect options get only 'Not correct'/'غير صحيح' with no explanation of why vague closes fail. The correct answers get only 'Correct'/'صحيح' with no reinforcement. This is feedback that repeats the answer, not explains the misconception. Additionally, distractors are plausible but the feedback teaches nothing. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 | Generally tight, but the intro rich_text block in L1 is dense and could be tightened. The 'first minute decides the next twenty' framing is effective but the prose is slightly ornate in both languages. |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> Knowledge check is the critical failure at 2, with feedback that merely labels answers correct/incorrect rather than explaining misconceptions. This violates the rubric's explicit warning about feedback that restates the answer. Worked example and scenario are strong. Mean would be 4.25 without the KC failure; with it, the floor threshold is failed.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
