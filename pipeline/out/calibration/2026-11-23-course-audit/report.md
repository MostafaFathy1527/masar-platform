# Course audit on plain documents: 23 November 2026

**Question.** A client's course arrives as a Word file or a PDF, not as our lesson.json, so
none of our gates can read it. Can one model, reading the course as plain text with a
short defect checklist, find the defects we know how to plant, without raising false
alarms on lessons that have no planted defect?

**Set-up.** `pipeline/audit_course.py` flattens each of the four samples (SEC-01, CS-01,
PRV-01, OPS-01-r2) into a plain bilingual document: paragraphs tagged [p1]…, questions
tagged [Q1]… with options, feedback and the answer key. Copies with one planted defect each:
four from `calibrate_judges.py` (absurd distractors, generic feedback, swapped scenario
consequences, mismatched Arabic numbers) and two the generator really produced on a
banking draft: a wrong answer key, and a "which is NOT" stem left on an item whose old key
still stands. That gives 25 documents (mismatched numbers applies to OPS-01 only). A catch
is a finding whose category matches the planted defect. Every finding on a real copy was
read by hand.

## Result

| | DeepSeek V3.2 (run 1) | GLM-5 (run 1) | GLM-5 (run 2) |
|---|---|---|---|
| wrong answer key | 4 of 4 | 4 of 4 | 4 of 4 |
| negative stem | 4 of 4 | 4 of 4 | 4 of 4 |
| absurd distractors | 4 of 4 | 4 of 4 | 4 of 4 |
| swapped consequences | 4 of 4 | 4 of 4 | 3 of 4 |
| mismatched numbers | 1 of 1 | 1 of 1 | 1 of 1 |
| generic feedback | 1 of 4 | 0 of 4 | 0 of 4 |
| **all** | **18 of 21** | **17 of 21** | **16 of 21** |
| findings on the 4 real lessons | 8 | 1 | 2 |

Every catch points at the part where the defect was planted ([Q1] for item defects, the
scenario's own tag for swapped consequences).

**Findings on real lessons, read by hand.**
- GLM-5 flagged the same line in both runs: OPS-01 item 2, the right option's English
  feedback says "The second **is** written with a "guess" label", while the stem shows the
  guess written as fact, unlabelled. The Arabic (يُكتب الثاني بعلامة «تخمين») reads as
  "should be written". This is a real, minor wording defect in the English, not a false alarm.
- GLM-5 run 2, PRV-01 [p6]: says the Arabic leaves out the data-subject request; it does
  not. False alarm (1 in 8 real-lesson reads).
- DeepSeek V3.2: 8 findings on real lessons, most of them false (for example "before 4 PM"
  against "قبل 16:00" called a mismatch). Too noisy to put in front of a client.

## What this means

- Reading the lesson as a plain document with a narrow checklist, GLM-5 caught every
  swapped-consequence copy in run 1 and 3 of 4 in run 2. In the full rubric on lesson.json,
  GLM-5 caught 0 of 4 on 20 November. The format and the narrow question matter more than
  the model. Four scenarios are still too few to seat anything.
- Generic "Correct / Not correct" feedback is the one defect the audit does not see. It
  needs no model: it is a string check (validate.py already refuses it on our own lessons),
  so a client audit runs that check first.
- Recommendation: GLM-5 as the audit reader, a person reads every finding before a client
  sees it, and the string checks run first. Next: try it on a course that is not ours, in
  its own layout (a public open-licence module), to see whether flattening our own JSON
  flattered the result.

**Cost.** 75 calls, 278,553 input and 10,724 output tokens, at most $0.35 (estimate,
priced high).
