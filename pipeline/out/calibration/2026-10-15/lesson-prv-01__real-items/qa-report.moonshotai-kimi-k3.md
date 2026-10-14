# QA gate report — what-counts-as-personal-data

**Result: PASS**

Mean 4.62 over 8 scored criteria (threshold 4.0); lowest criterion 4 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 | Every block earns PRV-01, but the data-subject request is tested in KC-02 without ever being taught: it appears only as one line in the L1 takeaways, so the learner first meets the concept as a term inside an assessment. One definition card or a worked-example step would close the gap. |
| level fidelity | 5 |  |
| worked example | 4 | Each why is case-specific and names the principle being applied (identifiability, irreversible harm, need-to-know, convenient channel), but no step states what would change the judgement — e.g., what to do if planning genuinely required the reasons. The hinge conditions are implied by the case facts rather than articulated, which is what separates this from a 5. |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 | Nothing is padded and the takeaways earn their space by adding the DSR and just-in-case-copy points, but the intro rich text carries two sentences of list (name, employee number, email, phone, photo, plate, device ID, home address) that would tighten without loss. |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.


Judge's summary:

> A strong lesson: both knowledge checks use distractors drawn from real, common misconceptions with per-option feedback that names the error, and the scenario has genuine friction (autocomplete same-name misfire, 5 pm, probably-unopened) rather than a textbook story. The Arabic reads as written in Arabic, not translated, and there is no licensed or colour-dependent content. The real weaknesses are that KC-02 tests a concept the lesson never teaches, and the worked example's reasoning leaves the decision hinges implicit.
