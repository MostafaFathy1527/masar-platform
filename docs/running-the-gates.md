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

The judges run on Amazon Bedrock. Credentials come from the standard AWS environment
variables or an assumed role; the region defaults to `us-east-1`.

```bash
# one judge, one lesson (--dry-run prints the exact prompt and stops)
python pipeline/judge_bedrock.py --lesson path/to/lesson.json --model <model-id> --tag <short-name>

# the panel: score with every seated judge, then decide
python pipeline/panel.py --lesson path/to/lesson.json --run

# how far two or more verdicts disagree, criterion by criterion
python pipeline/compare_verdicts.py verdict.a.json verdict.b.json --markdown

# calibration: can a judge tell a real lesson from one broken on purpose?
python pipeline/calibrate_judges.py                    # the seated panel
python pipeline/calibrate_judges.py --models a,b       # candidate judges
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
