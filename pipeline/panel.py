#!/usr/bin/env python3
"""The judge panel: several independent verdicts on one lesson, one decision.

A single judge's score is partly a fact about the judge. Failure entry 15 is the
proof: one of three judges skipped a rubric clause and failed a lesson the other
two passed. The panel turns that into a rule instead of an anecdote.

Every verdict beside the lesson (`verdict.<tag>.json`) is loaded and evaluated by
`qa_gate.py`, unchanged; the panel never re-scores and never moves a threshold.
It then decides:

- **PASS**        every judge passes, and no criterion splits them by more than
                  MAX_SPREAD points.
- **NEEDS HUMAN** the judges send the lesson to different outcomes, or any one
                  criterion splits them by more than MAX_SPREAD. Disagreement is
                  the signal; it is not averaged away.
- **FAIL**        every judge fails it.

When the same model has scored the lesson more than once (for instance after a
prompt fix), only its latest verdict counts, and the report says which were
superseded. Fewer than MIN_JUDGES distinct models is refused: one judge is not a
panel.

    python pipeline/panel.py --lesson pipeline/out/lesson-sec-01/v1/lesson.json
    python pipeline/panel.py --lesson ... --run      # score with PANEL_MODELS first

Exit codes: 0 PASS, 1 NEEDS HUMAN or FAIL, 2 could not run.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qa_gate  # noqa: E402

MIN_JUDGES = 2
MAX_SPREAD = 1

# A judge earns its seat by passing pipeline/calibrate_judges.py: shown a
# sample's real items and copies broken in ways the rubric names, it must score
# the broken ones at least two points lower. On 14 October 2026 these two caught
# 8 of 8 and 7 of 8 planted defects. The first panel (Qwen3-32B, Llama 3.3 70B,
# Nova Pro) caught 0, 1 and 0, and was retired: see failure entry 18. Two
# families, neither the generator's, so agreement is not one model agreeing
# with itself.
PANEL_MODELS = (
    ('moonshotai.kimi-k2.5', 'kimi-k2-5'),
    ('deepseek.v3.2', 'deepseek-v3-2'),
)


class PanelError(Exception):
    pass


def collect(lesson_dir: Path, levels: set[str]) -> tuple[list[dict], list[str]]:
    """Every tagged verdict beside the lesson, evaluated by the gate. Returns the
    latest result per model and the list of superseded verdict files."""
    by_model: dict[str, dict] = {}
    superseded: list[str] = []
    for path in sorted(lesson_dir.glob('verdict.*.json')):
        tag = path.name[len('verdict.'):-len('.json')]
        raw = json.loads(path.read_text(encoding='utf-8'))
        judge = raw.get('judge') or {}
        model = judge.get('model_id') or tag
        try:
            result = qa_gate.evaluate(qa_gate.load_verdict(path, levels))
        except qa_gate.GateError as e:
            raise PanelError(f'{path.name}: the gate refused this verdict: {e}') from e
        entry = {'tag': tag, 'model': model, 'at': judge.get('scored_at', ''), 'result': result,
                 'file': path.name}
        prev = by_model.get(model)
        if prev is None or entry['at'] > prev['at']:
            if prev is not None:
                superseded.append(prev['file'])
            by_model[model] = entry
        else:
            superseded.append(entry['file'])
    return list(by_model.values()), sorted(superseded)


def decide(entries: list[dict]) -> dict:
    if len(entries) < MIN_JUDGES:
        raise PanelError(f'{len(entries)} distinct judge(s); a panel needs at least {MIN_JUDGES}')
    outcomes = {e['model']: e['result']['passed'] for e in entries}
    per_criterion: dict[str, dict[str, int]] = {}
    for e in entries:
        for c, v in e['result']['scores'].items():
            per_criterion.setdefault(c, {})[e['model']] = v
    spreads = {c: max(v.values()) - min(v.values()) for c, v in per_criterion.items() if len(v) > 1}
    split = sorted(c for c, s in spreads.items() if s > MAX_SPREAD)

    if all(outcomes.values()) and not split:
        decision = 'PASS'
    elif not any(outcomes.values()):
        decision = 'FAIL'
    else:
        decision = 'NEEDS HUMAN'
    reasons = []
    if len(set(outcomes.values())) > 1:
        reasons.append('the judges send the lesson to different gate outcomes')
    if split:
        reasons.append(f'judges differ by more than {MAX_SPREAD} on: {", ".join(split)}')
    return {
        'decision': decision,
        'reasons': reasons,
        'outcomes': outcomes,
        'per_criterion': per_criterion,
        'spreads': spreads,
        'split': split,
    }


def report(lesson: str, entries: list[dict], verdict: dict, superseded: list[str]) -> str:
    models = [e['model'] for e in entries]
    lines = [
        f'# Judge panel — {lesson}',
        '',
        f'**Panel decision: {verdict["decision"]}**',
        '',
        f'> {qa_gate.SCORE_LABEL}. A panel of models agreeing is still not a human review.',
        '',
        f'Rule: PASS only if every judge passes and no criterion splits them by more than '
        f'{MAX_SPREAD}. Any split goes to a human.',
        '',
        '| Criterion | ' + ' | '.join(f'`{m}`' for m in models) + ' | spread |',
        '|---|' + '---|' * len(models) + '---|',
    ]
    for c in qa_gate.CRITERIA:
        row = verdict['per_criterion'].get(c)
        if not row:
            continue
        cells = [str(row.get(m, '—')) for m in models]
        spread = verdict['spreads'].get(c, 0)
        flag = ' ⚠' if spread > MAX_SPREAD else ''
        lines.append(f'| {c.replace("_", " ")} | ' + ' | '.join(cells) + f' | {spread}{flag} |')
    lines.append('| **gate** | ' + ' | '.join(
        f'{e["result"]["mean"]:.2f} {"PASS" if e["result"]["passed"] else "FAIL"}' for e in entries) + ' | |')
    if verdict['reasons']:
        lines.extend(['', 'Why: ' + '; '.join(verdict['reasons']) + '.'])
    if superseded:
        lines.extend(['', 'Superseded by a later verdict from the same model, and not counted: '
                      + ', '.join(f'`{s}`' for s in superseded) + '.'])
    return '\n'.join(lines) + '\n'


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--lesson', type=Path, required=True)
    ap.add_argument('--run', action='store_true', help='score the lesson with PANEL_MODELS first')
    ap.add_argument('--region', default='us-east-1')
    args = ap.parse_args(argv)

    doc = json.loads(args.lesson.read_text(encoding='utf-8'))
    levels = {str(x).upper() for x in doc.get('levels', [])}
    if not levels or not levels <= {'L1', 'L2', 'L3'}:
        print(f'error: lesson declares no usable levels: {sorted(levels) or "[]"}', file=sys.stderr)
        return 2

    if args.run:
        import judge_bedrock
        for model, tag in PANEL_MODELS:
            judge_bedrock.main(['--lesson', str(args.lesson), '--model', model, '--tag', tag,
                                '--region', args.region])

    try:
        entries, superseded = collect(args.lesson.parent, levels)
        verdict = decide(entries)
    except PanelError as e:
        print(f'error: {e}', file=sys.stderr)
        return 2

    text = report(doc.get('slug', args.lesson.parent.name), entries, verdict, superseded)
    (args.lesson.parent / 'panel-report.md').write_text(text, encoding='utf-8')
    print(f'{verdict["decision"]} — {len(entries)} judges'
          + (f'; {"; ".join(verdict["reasons"])}' if verdict['reasons'] else ''))
    return 0 if verdict['decision'] == 'PASS' else 1


if __name__ == '__main__':
    sys.exit(main())
