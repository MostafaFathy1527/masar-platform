# QA gate report — recognising-a-phishing-email

**Result: PASS**

Mean 4.38 over 8 scored criteria (threshold 4.0); lowest criterion 4 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 | Every block serves SEC-01, but link_destination is listed as an introduced concept yet never gets the mechanics of how to reveal a destination — it appears only as an instruction in the worked example and a takeaway line, thinner than the treatment display_name and one_time_code receive. |
| level fidelity | 4 | L1/L2 split is real — concepts then application with a worked example and a decision scenario — but L1 asserts the checks without ever showing one being performed, leaving L2 to carry the entire demonstration load. |
| worked example | 4 | Reasoning is genuinely explanatory (step 3 even names what would change the judgement: urgency alone versus urgency plus an off-route request), but 'reveal where the button goes' never tells the learner how — no hover, no long-press — so a step asserts an action some learners cannot perform. |
| knowledge check | 5 |  |
| scenario authenticity | 4 | The BEC setup is recognisable and the engineered unavailability is a real, named friction, but the scene is compressed to three lines; the awkward part (verifying upward against a manager's apparent instruction, phone possibly unanswered) is stated rather than experienced. |
| bilingual quality | 4 |  |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.


Judge's summary:

> Strong, lean lesson: knowledge checks are the best element, with distractors drawn from real beliefs and per-option feedback that corrects rather than restates. Arabic is natural with only minor register variation in terminology. The recurring weakness is the same gap in three places — the lesson tells learners to reveal a link destination without ever showing how — and the scenario, though authentic, stays compressed where it could let the learner feel the friction.
