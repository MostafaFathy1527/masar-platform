#!/usr/bin/env python3
"""Compare two or more rubric verdicts of the same lesson, criterion by criterion.

The number this produces is the one the project was missing: how far two judges
disagree on the same page. It reports, for every criterion both judges scored,
the two scores and their difference; the mean absolute difference over the
shared criteria; the criteria only one judge scored; and whether the gate
outcome would differ. It does not say which judge is right. That is what the
blind human sample is for.

    python pipeline/compare_verdicts.py pipeline/out/lesson-02/v1/verdict.json \
        pipeline/out/lesson-02/v1/verdict.model-a.json [--markdown]
"""

from __future__ import annotations

import argparse
import json
import sys
from itertools import combinations
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qa_gate  # noqa: E402


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding='utf-8'))


def label(verdict: dict, path: Path) -> str:
    judge = verdict.get('judge') or {}
    return judge.get('model_id') or judge.get('provider') or path.name


def compare(a: dict, b: dict) -> dict:
    sa, sb = a.get('scores', {}), b.get('scores', {})
    shared = [c for c in qa_gate.CRITERIA if c in sa and c in sb]
    only_a = [c for c in qa_gate.CRITERIA if c in sa and c not in sb]
    only_b = [c for c in qa_gate.CRITERIA if c in sb and c not in sa]
    diffs = {c: sb[c] - sa[c] for c in shared}
    mad = (sum(abs(d) for d in diffs.values()) / len(diffs)) if diffs else None

    def outcome(v: dict) -> dict:
        scores = {c: v['scores'][c] for c in qa_gate.CRITERIA if c in v.get('scores', {})}
        if not scores:
            return {'mean': None, 'passed': None}
        mean = sum(scores.values()) / len(scores)
        below = [c for c, s in scores.items() if s < qa_gate.MIN_CRITERION]
        return {'mean': round(mean, 2), 'passed': (not below) and mean >= qa_gate.MIN_MEAN,
                'below_floor': below}

    return {
        'shared': {c: {'a': sa[c], 'b': sb[c], 'delta': diffs[c]} for c in shared},
        'only_a': only_a,
        'only_b': only_b,
        'mean_abs_diff': None if mad is None else round(mad, 2),
        'max_abs_diff': max((abs(d) for d in diffs.values()), default=None),
        'outcome_a': outcome(a),
        'outcome_b': outcome(b),
    }


def markdown(name_a: str, name_b: str, lesson: str, cmp: dict) -> str:
    lines = [
        f'# Judge agreement — {lesson}',
        '',
        f'A = `{name_a}`  ',
        f'B = `{name_b}`',
        '',
        f'> {qa_gate.SCORE_LABEL}. Agreement between two such judges is not evidence that either is right.',
        '',
        '| Criterion | A | B | B−A |',
        '|---|---|---|---|',
    ]
    for c, row in cmp['shared'].items():
        lines.append(f'| {c.replace("_", " ")} | {row["a"]} | {row["b"]} | {row["delta"]:+d} |')
    lines.append('')
    if cmp['mean_abs_diff'] is not None:
        lines.append(f'Mean absolute difference over {len(cmp["shared"])} shared criteria: '
                     f'**{cmp["mean_abs_diff"]}** (largest {cmp["max_abs_diff"]}).')
    if cmp['only_a'] or cmp['only_b']:
        lines.append('')
        if cmp['only_a']:
            lines.append(f'Scored only by A: {", ".join(cmp["only_a"])}.')
        if cmp['only_b']:
            lines.append(f'Scored only by B: {", ".join(cmp["only_b"])}.')
    oa, ob = cmp['outcome_a'], cmp['outcome_b']
    lines.extend(['', f'Gate outcome if run on A alone: mean {oa["mean"]}, '
                      f'{"PASS" if oa["passed"] else "FAIL"}. '
                      f'On B alone: mean {ob["mean"]}, {"PASS" if ob["passed"] else "FAIL"}.'])
    if oa['passed'] != ob['passed']:
        lines.append('')
        lines.append('**The two judges would send this lesson to different outcomes.** '
                     'That is the finding, not a tie to break.')
    return '\n'.join(lines) + '\n'


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('verdicts', nargs='+', type=Path)
    ap.add_argument('--markdown', action='store_true', help='print a markdown table instead of JSON')
    args = ap.parse_args(argv)
    if len(args.verdicts) < 2:
        print('error: give at least two verdict files', file=sys.stderr)
        return 2

    loaded = [(p, load(p)) for p in args.verdicts]
    out = []
    for (pa, va), (pb, vb) in combinations(loaded, 2):
        cmp = compare(va, vb)
        lesson = va.get('lesson') or vb.get('lesson') or pa.parent.name
        if args.markdown:
            print(markdown(label(va, pa), label(vb, pb), lesson, cmp))
        else:
            out.append({'lesson': lesson, 'a': label(va, pa), 'b': label(vb, pb), **cmp})
    if not args.markdown:
        print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main())
