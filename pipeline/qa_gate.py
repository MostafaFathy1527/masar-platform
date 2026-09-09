#!/usr/bin/env python3
"""The rubric gate: applies thresholds to a judge's scores and records the run.

The judging is done by a fresh-context pass that never sees the generation
prompt. This script does NOT call a model — no metered API sits anywhere in this
pipeline, by design. It consumes the judge's verdict, applies the gate, writes a
report, and appends the run to the log.

Separating the two matters: a judge that also decided pass/fail could move the
threshold to suit the score. Here the thresholds live in code, in version
control, and every run is appended to memory/run-log.jsonl — including failures,
because a logged history containing only successes is not evidence of anything.

    python pipeline/qa_gate.py --verdict out/lesson-05/v1/verdict.json
    python pipeline/qa_gate.py --verdict v.json --dry-run   # no log entry

Exit codes: 0 pass, 1 gate failure, 2 could not run.
"""

from __future__ import annotations

import argparse
import io
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

RUN_LOG = Path('pipeline/memory/run-log.jsonl')

CRITERIA = (
    'objective_alignment',
    'level_fidelity',
    'worked_example',
    'knowledge_check',
    'scenario_authenticity',
    'bilingual_quality',
    'concision',
    'accessibility_ip',
)

MIN_CRITERION = 3
MIN_MEAN = 4.0

# Everywhere this number is shown. Section 0.4 item 5: never presented as
# quality assurance, never in the same table or sentence as a human work figure.
SCORE_LABEL = 'LLM rubric score, fresh-context judge, self-assessed — not human QA'


class GateError(Exception):
    pass


def load_verdict(path: Path) -> dict:
    try:
        verdict = json.loads(path.read_text(encoding='utf-8'))
    except FileNotFoundError as e:
        raise GateError(f'verdict not found: {path}') from e
    except json.JSONDecodeError as e:
        raise GateError(f'verdict is not valid JSON: {e}') from e

    scores = verdict.get('scores')
    if not isinstance(scores, dict):
        raise GateError('verdict has no "scores" object')

    missing = [c for c in CRITERIA if c not in scores]
    if missing:
        # A partial verdict must not pass by averaging over fewer criteria.
        raise GateError(f'verdict is missing {len(missing)} criteria: {", ".join(missing)}')

    for name, value in scores.items():
        if name not in CRITERIA:
            raise GateError(f'unknown criterion "{name}"')
        if not isinstance(value, int) or not 1 <= value <= 5:
            raise GateError(f'{name} = {value!r}; scores must be integers 1-5')

    return verdict


def evaluate(verdict: dict) -> dict:
    scores = {c: verdict['scores'][c] for c in CRITERIA}
    mean = sum(scores.values()) / len(scores)
    below = sorted(c for c, v in scores.items() if v < MIN_CRITERION)

    # Stated separately so a report can say WHICH threshold failed. A lesson
    # that is mediocre everywhere and one that is unacceptable in a single place
    # are different problems with different fixes.
    passed = not below and mean >= MIN_MEAN

    return {
        'lesson': verdict.get('lesson', '(unnamed)'),
        'scores': scores,
        'mean': round(mean, 2),
        'below_floor': below,
        'failed_floor': bool(below),
        'failed_mean': mean < MIN_MEAN,
        'passed': passed,
        'notes': verdict.get('notes', {}),
        'verdict_notes': verdict.get('verdict_notes', ''),
    }


def report(result: dict) -> str:
    lines = [
        f'# QA gate report — {result["lesson"]}',
        '',
        f'**Result: {"PASS" if result["passed"] else "FAIL"}**',
        '',
        f'Mean {result["mean"]:.2f} (threshold {MIN_MEAN}); '
        f'lowest criterion {min(result["scores"].values())} (floor {MIN_CRITERION}).',
        '',
        f'> {SCORE_LABEL}',
        '',
        '| Criterion | Score | Note |',
        '|---|---|---|',
    ]
    for name, value in result['scores'].items():
        note = str(result['notes'].get(name, '')).replace('|', '\\|')
        flag = ' ⚠' if value < MIN_CRITERION else ''
        lines.append(f'| {name.replace("_", " ")} | {value}{flag} | {note} |')

    lines.append('')
    if result['failed_floor']:
        lines.append(f'**Below the floor:** {", ".join(result["below_floor"])}. '
                     'A single unacceptable criterion fails the gate regardless of the mean.')
    if result['failed_mean']:
        lines.append(f'**Mean {result["mean"]:.2f} is below {MIN_MEAN}.**')
    if result['verdict_notes']:
        lines.extend(['', "Judge's summary:", '', f'> {result["verdict_notes"]}'])
    if not result['passed']:
        lines.extend(['', 'The pipeline retries once with this report appended to the '
                          'prompt, then stops for a human decision.'])
    return '\n'.join(lines) + '\n'


def append_run(result: dict, verdict_path: Path) -> None:
    RUN_LOG.parent.mkdir(parents=True, exist_ok=True)
    entry = {
        'at': datetime.now(timezone.utc).isoformat(),
        'lesson': result['lesson'],
        'verdict': str(verdict_path).replace('\\', '/'),
        'scores': result['scores'],
        'mean': result['mean'],
        'passed': result['passed'],
        'below_floor': result['below_floor'],
        'score_label': SCORE_LABEL,
    }
    with io.open(RUN_LOG, 'a', encoding='utf-8', newline='\n') as fh:
        fh.write(json.dumps(entry, ensure_ascii=False) + '\n')


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--verdict', type=Path, required=True)
    ap.add_argument('--report', type=Path, help='where to write qa-report.md')
    ap.add_argument('--dry-run', action='store_true', help='do not append to the run log')
    args = ap.parse_args(argv)

    try:
        result = evaluate(load_verdict(args.verdict))
    except GateError as e:
        print(f'error: {e}', file=sys.stderr)
        return 2

    text = report(result)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        io.open(args.report, 'w', encoding='utf-8', newline='\n').write(text)
        print(f'wrote {args.report}')
    else:
        print(text)

    if not args.dry_run:
        append_run(result, args.verdict)

    return 0 if result['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
