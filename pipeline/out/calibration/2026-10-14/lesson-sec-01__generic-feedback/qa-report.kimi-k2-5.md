# QA gate report — recognising-a-phishing-email

**Result: FAIL**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 2 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 5 |  |
| level fidelity | 4 | L1 is solid. L2 adds the worked example and scenarios as required, but the knowledge checks are shared weak points that drag down the level experience. The 'visual card' requirement is met by actual definition cards with icons, not bulleted lists with borders. |
| worked example | 5 |  |
| knowledge check | 2 ⚠ | Both knowledge checks have critical failures. KC-01: three distractors (formatting quality, logo presence, work vs personal inbox) are implausible misconceptions — no one who understands phishing would think these outrank the actual sender address. The feedback on all options merely states 'Correct'/'Not correct' without naming any misconception. KC-02: 'Wait and see' and 'Reply to ask if genuine' are plausible, but 'Delete so nobody else clicks' is a distractor nobody would choose (deletion doesn't prevent others from already having it). Feedback again restates rather than explains. This is a pattern of feedback that repeats the answer, not naming the misconception. |
| scenario authenticity | 5 |  |
| bilingual quality | 5 |  |
| concision | 4 | The prose is generally tight, but the L1 rich_text block and some 'why' explanations in the worked example could be tighter without loss. 'Very close to it' in step 3's 'why' is slightly wordy. |
| accessibility ip | 4 | No licensed code descriptors or denylisted terms detected. Icons (🔎, 🔐) lack explicit alt text in the JSON structure — the 'icon' field carries emoji but no descriptive text for screen readers. This is minimal compliance rather than using the constraint as a teaching point. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Below the floor:** knowledge_check. A single unacceptable criterion fails the gate regardless of the mean.

Judge's summary:

> One criterion at 2 (knowledge_check), which fails the floor threshold. The knowledge checks are the critical weakness: implausible distractors and feedback that restates rather than educates. Mean would be 4.0 without the floor failure. The lesson is strong elsewhere — authentic scenario, excellent worked example with genuine 'why' reasoning, natural Arabic.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
