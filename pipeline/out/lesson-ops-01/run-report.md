# Pipeline run: OPS-01

**Outcome: PANEL PASS at v2: a draft for human review**

- source: `pipeline/sources/ops-01-writing-a-shift-handover.md`
- generator: `openai.gpt-oss-120b-1:0`, from a model family outside the panel
- judges: `qwen.qwen3-32b-v1:0`, `us.meta.llama3-3-70b-instruct-v1:0`, `amazon.nova-pro-v1:0`
- started 2026-10-14T10:02:09.036001+00:00, finished 2026-10-14T10:03:10.840092+00:00
- generation tokens: 46393 in, 7771 out; judge usage is in each verdict

No person edited anything between the source note and this report. The lesson is a DRAFT either way: the pipeline may not publish, and model judges agreeing is not a human review.

| Version | Step | Result | Seconds |
|---|---|---|---|
| v1 | generate | ok | 26.9 |
| v1 | gates | FAIL: validate (1), concept_log (2) | 0.2 |
| v2 | generate | ok | 25.8 |
| v2 | gates | PASS | 0.1 |
| v2 | panel | PASS | 8.8 |
