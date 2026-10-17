# Judge calibration: can each judge see a lesson broken on purpose?

Run 2026-10-17-no-values-in-example. Each sample was scored as it is and as copies broken in one way each, every defect one the rubric names and each aimed at one criterion. A judge that sees the defect should score that criterion at least 2 points lower on the broken copy. Seated panel: `us.moonshotai.kimi-k3`, `deepseek.v3.2`, `zai.glm-5`.

## Per judge and criterion

| Judge | Criterion | Defects caught | Mean drop |
|---|---|---|---|
| `Fanar-2-27B-Instruct.Q8_0.gguf` | bilingual_quality | 0 of 4 | 0.00 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | knowledge_check | 0 of 8 | 0.00 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | scenario_authenticity | 0 of 4 | 0.00 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | worked_example | 0 of 4 | 0.00 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | bilingual_quality | 0 of 4 | 0.00 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | knowledge_check | 3 of 8 | 1.00 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | scenario_authenticity | 0 of 4 | 0.00 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | worked_example | 1 of 4 | 0.50 |

## Every score

| Judge | Defect | Criterion | Sample | Real | Broken | Drop |
|---|---|---|---|---|---|---|
| `Fanar-2-27B-Instruct.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-cs-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-prv-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | absurd-distractors | knowledge_check | lesson-sec-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-cs-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-prv-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | generic-feedback | knowledge_check | lesson-sec-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | reasonless-steps | worked_example | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | reasonless-steps | worked_example | lesson-prv-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | absurd-distractors | knowledge_check | lesson-cs-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | absurd-distractors | knowledge_check | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | absurd-distractors | knowledge_check | lesson-prv-01 | 5 | 1 | 4 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | absurd-distractors | knowledge_check | lesson-sec-01 | 5 | 3 | 2 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | empty-consequences | scenario_authenticity | lesson-cs-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | empty-consequences | scenario_authenticity | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | empty-consequences | scenario_authenticity | lesson-prv-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | empty-consequences | scenario_authenticity | lesson-sec-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | generic-feedback | knowledge_check | lesson-cs-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | generic-feedback | knowledge_check | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | generic-feedback | knowledge_check | lesson-prv-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | generic-feedback | knowledge_check | lesson-sec-01 | 5 | 3 | 2 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | pasted-english | bilingual_quality | lesson-cs-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | pasted-english | bilingual_quality | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | pasted-english | bilingual_quality | lesson-prv-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | pasted-english | bilingual_quality | lesson-sec-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | reasonless-steps | worked_example | lesson-cs-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | reasonless-steps | worked_example | lesson-ops-01-r2 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | reasonless-steps | worked_example | lesson-prv-01 | 5 | 5 | 0 |
| `Fanar-2-27B-Instruct.Q8_0.gguf+thinking` | reasonless-steps | worked_example | lesson-sec-01 | 5 | 3 | 2 |

This measures whether a judge can tell a real lesson from one broken in a named way. It does not say which judge is right about the real lesson.

## How this run was made

The same model, server and settings as `../2026-10-17/` (its `environment.json` has them), with
one difference: the rubric the judge saw was `rubric-used.md`, the committed rubric with the
example verdict's values replaced by placeholders such as `<integer 1-5>`, so there was nothing
to hand back. The rest of the prompt was identical. This is not the rubric any seated judge uses.

- **Thinking off**: 24 verdicts, every one 5 on all eight criteria, so 0 of 20 defects caught.
  Its closing notes praised the Arabic of all four lessons whose Arabic fields held English; on
  SEC-01 it wrote "The Arabic translation is natural and consistent."
- **Thinking on**: 24 verdicts, 20 of them 5 on every criterion. 4 of 20 defects caught, each
  with a note about what was changed in that copy, and none of the four pasted-English copies or
  the four empty-consequence copies. Two verdicts gave a 1 for something the copy did not have:
  missing alt text on the definition cards' icons, which are decorative and hidden from screen
  readers, and a "literal translation" in Arabic that was the real lesson's, which the same
  judge scored 5 there.
