# QA gate report — what-counts-as-personal-data

**Result: FAIL**

Mean 4.00 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | Both KC-01 and KC-02 have critical flaws. In KC-01, three of four distractors receive only 'Not correct'/'غير صحيح' feedback that restates the stem rather than naming misconceptions. The distractor 'No, because it contains no names' is a real misconception, but the feedback fails to explain why identifiability matters. The distractor 'Yes, but only if the rating is negative' is implausible—nobody holds this view. In KC-02, all three incorrect options receive only 'Not correct'/'غير صحيح' with zero explanation of why partial fulfillment, refusal, or delay are wrong. These are real errors people make, but the feedback teaches nothing. The 'Not correct'/'صحيح' pattern violates the rubric's requirement for per-option feedback that explains why rather than restating the answer. |
| scenario authenticity | 4 |  |
| bilingual quality | 4 | Arabic is generally natural and reads as written in Arabic, not translated. Minor stiffness in some constructions (e.g., 'العدّاد بدأ منك' in takeaways is slightly abrupt). The definition cards and worked example flow well. One awkward spot: 'احتياطاً' in quotes for 'just in case' is understandable but not idiomatic; 'للاحتياط' would be more natural. |
| concision | 4 |  |
| accessibility ip | 5 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> Knowledge checks are the critical weakness: feedback is minimal to absent, with three distractors per item receiving only 'Not correct' and no misconception naming. This is a systematic failure of criterion 4. Worked example is strong with genuine 'why' at each step. Scenario has authentic friction (5pm timing, autocomplete error). No licensed codes or denylisted terms detected.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
