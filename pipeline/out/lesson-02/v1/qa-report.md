# QA gate report — plans-benefits-and-member-liability

**Result: PASS**

Mean 4.14 over 7 scored criteria (threshold 4.0); lowest criterion 4 (floor 3).

Lesson levels: L1.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 | Eleven of twelve blocks earn their declared objective. b2_take declares MI-02 but two of its four takeaways are MI-03 material (the benefit-schedule states, and 'limited' misread as 'covered'). One block stretching is within the rubric's 4. |
| level fidelity | 4 | Genuinely a structured read rather than an L2 with the interaction removed — and the cost-sharing calculation is placed in prose rather than a worked_example block, which is the correct choice given worked_example is L2+. Held at 4 rather than 5 because five of twelve blocks are definition_card; the lesson leans glossary-shaped. |
| worked example | 4 | Scored against the calculation in b2_p_worked, since the block type itself is unavailable at L1. It names the judgement that would change the answer — 'unless that 1,760 would carry them past their out-of-pocket maximum' — which is the rubric's 5 behaviour. Held at 4 because the ordering rule it depends on (deductible before coinsurance) is asserted two blocks earlier and not restated where it is applied. |
| scenario authenticity | 4 | No scenario block is available at L1; scored against the two job_tip blocks. 'Nothing on the card or in an eligibility response shows this — it requires checking accumulated use' and 'Covered is the word members hear as free' are both recognisable, including the awkward part. Held at 4 because they are observations rather than situations. |
| bilingual quality | 5 | Declares bilingual: false and behaves consistently — Arabic fields carry the English text with no pretence otherwise. The rubric scores an English-only lesson against its own declaration, and this declaration is honest and machine-enforced. |
| concision | 4 | Prose is tight throughout. Held at 4 because takeaway 1 restates the intro's ordering sentence and takeaway 4 restates b2_tip_limited almost verbatim — removable without loss, which is the criterion's own test. |
| accessibility ip | 4 | No images, so no alt text is owed. No meaning carried by colour: each icon sits beside its term. No CPT, HCPCS, CDT, ICD or DRG references; monetary figures are labelled 'Training figures only'. Held at 4 rather than 5 because the constraint is respected but not turned into a teaching point. Minor: the icon '☷' may not resolve in every font stack, though nothing depends on it. |

**Not scored at this lesson's levels:**

- `knowledge check` — INAPPLICABLE. The lesson declares levels: ['L1']. The block registry permits knowledge_check only at L2 and L3, so a conforming L1 lesson cannot contain one. There is nothing to score. Any number here would be invented, and criterion 8's own standard — no fabricated evidence — applies to the judge as much as to the content.

**Judge independence:**

> This judge did not read pipeline/prompts/generate.md and did not author the lesson, so it cannot mark against intent. It is not fully naive: the same session directed the project at a scope level and set several of its constraints. That is weaker independence than the rubric assumes, and is stated here rather than left for a reader to discover.


Judge's summary:

> Seven criteria scored, mean 4.14, none below 4. On the seven that apply this lesson passes comfortably. It cannot be submitted to pipeline/qa_gate.py as it stands: the gate requires all eight criteria and raises GateError on any missing one, so an L1-only lesson is unjudgeable without fabricating a knowledge_check score. That is a defect in the gate and rubric, not in this lesson, and it affects four of the five shipped lessons. See the gate-defect note below.
