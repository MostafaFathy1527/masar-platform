# Run status — lesson 02, v1

Generated from `pipeline/sources/02-plans-and-member-liability.md` following
`pipeline/prompts/generate.md`.

## Gates

| Gate | Result | What it checked |
|---|---|---|
| `validate.py` | **PASS** | Structure against the generated JSON Schema; every block's objective declared by the lesson; block types legal at L1; unique ids; no real licensed code set; no denylisted term. |
| `concept_log.py` | **PASS** | Run with the draft inserted at sequence position 02, so "earlier" means what a learner would actually meet first. No concept re-defined, no forward reference, nothing defined without being declared. |
| `qa_gate.py` | **NOT RUN** | Requires a judge verdict. See below. |

Five new concepts are introduced and none collide with the eighteen already in
`memory/concept-log.json`: `copay`, `deductible`, `coinsurance`,
`out_of_pocket_maximum`, `benefit_schedule`.

## Why the rubric gate has not run

`pipeline/prompts/judge.md` requires a **fresh context that has never seen the generation
prompt**. The agent that generated this lesson wrote that prompt and this content, and
would be scoring its own work with full knowledge of what it was reaching for.

A number produced that way looks like evidence and is self-assessment. Section 0.4 item 5
exists precisely to stop that, so the gate stays unrun rather than being satisfied
dishonestly.

**What running it needs:** a separate session, given only this lesson and
`pipeline/rubric.md`, returning the verdict JSON. Then:

```bash
python pipeline/qa_gate.py --verdict pipeline/out/lesson-02/v1/verdict.json \
                           --report  pipeline/out/lesson-02/v1/qa-report.md
```

`qa_gate.py` applies the thresholds and appends the run to `memory/run-log.jsonl`,
including a failure. Until that happens the run log is empty, and
`/how-it-was-built` says so.

## Status

- [x] Source note written
- [x] Generated to `v1`
- [x] `validate.py` — passed
- [x] `concept_log.py` — passed
- [x] Judge verdict — original session, then three further judges (see below)
- [x] `qa_gate.py` — run on all four verdicts; one FAIL, three PASS
- [ ] Human publish decision — the pipeline has no publish permission

## Not published

This lesson is **not** in `content/courses/`. Pipeline output is a draft, and a human
decides whether it ships. That boundary is the point of the whole arrangement, so it is
not being crossed here for the sake of a tidier demonstration.

## Nothing needing verification

The lesson asserts nothing the source note does not carry, so there is no
`needs-verification.md` for this run. That is a claim worth checking rather than trusting:
every figure in the worked example, the four schedule states, and the ordering of
deductible before coinsurance all appear in the source.

## Judged again, 14 October 2026

Three judges from three model families, each in a fresh context (judge prompt + rubric +
lesson only), via `pipeline/judge_bedrock.py`; every verdict went through `qa_gate.py`
unchanged. Files beside this one: `verdict.<tag>.json` and `qa-report.<tag>.md`.

| Judge | Mean | Criteria scored | Gate |
|---|---|---|---|
| original session | 4.14 | 7 | PASS |
| qwen.qwen3-32b-v1:0 | 5.00 | 5 | PASS |
| us.meta.llama3-3-70b-instruct-v1:0 | 4.00 | 5 | **FAIL** |
| amazon.nova-pro-v1:0 | 4.80 | 5 | PASS |

The FAIL is a single score: Llama gave bilingual quality a 1 on a lesson that declares
`bilingual: false`, which the rubric says is not penalised. The gate applied the rule to
the verdict it was given, which is its job. The three new judges also declined the two
substitute-evidence criteria the original judge scored from prose, so their means are over
five criteria, not seven. `pipeline/compare_verdicts.py` on any pair prints the deltas.
