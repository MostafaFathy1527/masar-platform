# QA gate report — what-counts-as-personal-data

**Result: PASS**

Mean 4.75 over 8 scored criteria (threshold 4.0); lowest criterion 4 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 | The L1 takeaways list includes 'a data-subject request is reported the same day', but no L1 block teaches what a data-subject request is; it is only exercised in L2 (KC-02). An L1-only learner meets a takeaway with no supporting content. |
| level fidelity | 5 |  |
| worked example | 5 |  |
| knowledge check | 5 |  |
| scenario authenticity | 5 |  |
| bilingual quality | 4 | Arabic is idiomatic throughout (verbless equational sentences, correct tamyiz in 'أعلى معياراً', natural compressed conditionals like 'إن كانت الإجابة نعم... فهي بيانات شخصية'), but a few phrases sit slightly close to the English: 'عمّن تتحدث هذه المعلومة' for 'who this is about' and the elliptical 'أو يمكن تحديدها' in the opening definition. Natural, not flawless. |
| concision | 5 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.


Judge's summary:

> A strong lesson: the worked example's whys name the actual judgements, both knowledge checks draw distractors from live misconceptions with per-option feedback that explains rather than restates, and the autocomplete wrong-recipient scenario carries real friction. The two soft spots are an L1 takeaway that outruns L1 content (data-subject requests appear only in L2) and a handful of Arabic phrases that lean toward the English source. Mean 4.75 with no criterion below 4; the gate applies the thresholds.
