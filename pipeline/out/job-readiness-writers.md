# Job-readiness drafts: which writer, which prompt (19 October 2026)

Kimi K3 is the strictest seated judge on these lessons. DeepSeek V3.2 and GLM-5 passed
every version below, so the table shows K3's mean (pass mark 4.0). The open seat was empty
for all of these runs, so every lesson stops for a person whatever the scores.

| Lesson | gpt-oss-120b, old prompt | + revised from judge reports | Mistral Large 3, new prompt (final version) |
|---|---|---|---|
| JOB-01 | 4.00 | not revised | 4.12 (v2) |
| JOB-02 | 3.50 | 3.75 | 4.12 (v2) |
| JOB-03 | 3.38 | 3.62 | 3.75 (v2) |
| JOB-04 | 3.38 | 3.62 | 4.38 (v1) |
| JOB-05 | 3.38 | 3.62 | 3.75 (v4: v2 scored 4.12 but carried a wrong answer key two judges caught; v3 fixed the key and broke the item type; v4 is a one-field hand edit, see its notes.md) |
| JOB-06 | 3.88 | 3.88 | 4.25 (v2) |

On JOB-05 alone, revising the same version from the same reports: gpt-oss 3.62,
MiniMax M2.5 3.75, Mistral Large 3 3.88 (`exp-job-05-*`). Mistral's Arabic was the only one
K3 scored 4 on bilingual quality; the other two kept the calques it had named.

Two changes made the difference, and they were separate:

1. **The writer.** Mistral Large 3 writes Arabic that reads as written rather than
   translated. It is outside every judge family, as `run_lesson.py` requires.
2. **The prompt.** The generation prompt still described a medical-insurance course. It is
   now course-neutral and lists what K3 kept failing drafts for (a worked example that
   re-walks the scenario, generic reasons, a lesson that breaks its own definitions,
   repetition, named calques).

What K3 still marks down on JOB-03 and JOB-05 is small and specific (one dual/singular
slip, an exemplar repeated verbatim in two blocks): the kind of edit a reviewer makes, not
a reason for another generation. The `lesson-job-0N` folders (gpt-oss) stay as the record.
