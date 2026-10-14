# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 4.00 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 4 |  |
| knowledge check | 2 ⚠ | Distractors are genuinely drawn from real misconceptions (no-names-equals-not-personal, internal-employee-data-exempt, DIY fulfilment, parking the request), but the per-option feedback on every option of both items is literally 'Correct.' / 'Not correct.' — it names no misconception and explains nothing. The per-item rationale partially compensates for KC-02 ('neither partially fulfilled nor parked' covers two distractors) but never addresses, e.g., the internal-data-exemption distractor in KC-01 or the security-refusal distractor in KC-02. Empty per-option feedback is the specific failure this criterion exists to catch. |
| scenario authenticity | 5 |  |
| bilingual quality | 4 |  |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> A strong lesson undermined by hollow knowledge-check feedback: the scenarios, worked example, and prose are authentic and disciplined, but every option's feedback is a bare 'Correct/Not correct', which wastes well-built distractors. One criterion below the floor; mean 4.0. The gate decides.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
