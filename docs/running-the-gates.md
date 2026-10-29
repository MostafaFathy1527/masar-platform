# Running the gates

Everything below runs from the repository root. The mechanical gates need only Python; the
judge steps call hosted models and need credentials, which are never committed.

## Setup

```bash
pip install -r pipeline/requirements.txt
pip install boto3          # only for the judge, panel and calibration steps
```

## Mechanical gates (no model, no network)

```bash
python pipeline/validate.py                      # structure, semantics, forbidden content
python pipeline/validate.py path/to/lesson.json  # one draft
python pipeline/concept_log.py --check           # no concept taught twice or too early
```

Each gate has negative tests that prove it refuses what it should:

```bash
python pipeline/test_validate.py
python pipeline/test_concept_log.py
python pipeline/test_qa_gate.py
python pipeline/test_judge_bedrock.py
python pipeline/test_panel.py
python pipeline/test_run_lesson.py
```

## Judges

The panel has five seats. Three judges run on Amazon Bedrock (`PANEL_MODELS` in
`pipeline/panel.py`); credentials come from the standard AWS environment variables or an
assumed role, and the region defaults to `us-east-1`. The fourth is an open model,
Qwen3-30B-A3B-Thinking-2507 at Q8_0, served by llama.cpp (`SERVED_JUDGES`): the panel reaches
it at the OpenAI-compatible URL in `JUDGE_QWEN3_ENDPOINT`. With that variable unset, or the
server unreachable, the seat stays empty and the lesson is NEEDS HUMAN, never PASS. The weekly
workflow rents a machine for it, serves the file and sets the variable itself. The fifth is
Command A+, reached through Cohere's own chat API (`API_JUDGES`, `--cohere`) with its thinking
held to a 6,000-token budget; its key is read from `COHERE_API_KEY`, and without it the seat
stays empty in the same way.

```bash
# one judge, one lesson (--dry-run prints the exact prompt and stops)
python pipeline/judge_bedrock.py --lesson path/to/lesson.json --model <model-id> --tag <short-name>

# the panel: score with every seated judge, then decide
python pipeline/panel.py --lesson path/to/lesson.json --run

# how far two or more verdicts disagree, criterion by criterion
python pipeline/compare_verdicts.py verdict.a.json verdict.b.json --markdown

# calibration: can a judge tell a real lesson from one broken on purpose?
python pipeline/calibrate_judges.py                    # the three hosted seats
python pipeline/calibrate_judges.py --models a,b       # candidate judges
python pipeline/calibrate_judges.py --endpoint <url> --models <served-name>   # a served model
python pipeline/calibrate_judges.py --cohere --models command-a-plus-05-2026     # the API seat
```

## The whole loop

```bash
python pipeline/run_lesson.py \
  --source pipeline/sources/<note>.md \
  --objective ABC-01 \
  --out pipeline/out/lesson-abc-01
```

It writes each version, the gate findings, the verdicts, the panel report and a run record
under `--out`, and stops for a person whatever the outcome.

## Checks that run without anyone

- Every push: the web app's checks, the pipeline's tests, and an accessibility audit.
- Daily: a read-only walk of the live site in a real browser (`scripts/learner-flow.mjs`).
- Weekly: the judge panel re-scores every sample, so a judge that changes behaviour is caught.
