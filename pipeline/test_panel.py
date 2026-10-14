#!/usr/bin/env python3
"""Tests for pipeline/panel.py. Fixtures only; no model is called.

    python pipeline/test_panel.py
"""

from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import panel  # noqa: E402
import qa_gate  # noqa: E402

FAILS = 0
L2 = {'L1', 'L2'}


def check(cond: bool, msg: str) -> None:
    global FAILS
    print(f'  {"ok  " if cond else "FAIL"} {msg}')
    if not cond:
        FAILS += 1


def write(d: Path, tag: str, model: str, at: str, **scores) -> None:
    s = {c: 4 for c in qa_gate.CRITERIA}
    s.update(scores)
    v = {'lesson': 'x', 'judge': {'model_id': model, 'scored_at': at}, 'scores': s, 'notes': {}}
    (d / f'verdict.{tag}.json').write_text(json.dumps(v), encoding='utf-8')


def run(build) -> tuple[dict | None, str]:
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        build(d)
        try:
            entries, superseded = panel.collect(d, L2)
            return panel.decide(entries) | {'n': len(entries), 'superseded': superseded}, ''
        except panel.PanelError as e:
            return None, str(e)


print('agreement passes')
v, _ = run(lambda d: (write(d, 'a', 'm1', '1'), write(d, 'b', 'm2', '1', concision=5)))
check(v['decision'] == 'PASS', 'two judges, all pass, spread 1 -> PASS')

print('a split of two points goes to a human, even when both pass')
v, _ = run(lambda d: (write(d, 'a', 'm1', '1', concision=5), write(d, 'b', 'm2', '1', concision=3)))
check(v['decision'] == 'NEEDS HUMAN' and v['split'] == ['concision'], 'spread 2 on concision -> NEEDS HUMAN')

print('different gate outcomes go to a human')
v, _ = run(lambda d: (write(d, 'a', 'm1', '1'), write(d, 'b', 'm2', '1', concision=2)))
check(v['decision'] == 'NEEDS HUMAN' and v['outcomes'] == {'m1': True, 'm2': False},
      'one PASS, one FAIL -> NEEDS HUMAN')

print('unanimous failure fails')
v, _ = run(lambda d: (write(d, 'a', 'm1', '1', concision=2), write(d, 'b', 'm2', '1', concision=2)))
check(v['decision'] == 'FAIL', 'both FAIL -> FAIL')

print('one judge is not a panel')
v, err = run(lambda d: write(d, 'a', 'm1', '1'))
check(v is None and 'at least' in err, 'single judge refused')

print('the same model twice counts once, latest wins')
v, _ = run(lambda d: (write(d, 'a', 'm1', '1', concision=2), write(d, 'a2', 'm1', '2'),
                      write(d, 'b', 'm2', '1')))
check(v['n'] == 2 and v['decision'] == 'PASS' and v['superseded'] == ['verdict.a.json'],
      'earlier verdict from m1 superseded; panel PASS')

print('a verdict the gate refuses stops the panel')
def bad(d: Path):
    write(d, 'a', 'm1', '1')
    (d / 'verdict.b.json').write_text(json.dumps({'judge': {'model_id': 'm2'}, 'scores': {'concision': 9}}),
                                      encoding='utf-8')
v, err = run(bad)
check(v is None and 'refused' in err, 'malformed verdict -> panel refuses to decide')

print('\nFAILS:', FAILS)
sys.exit(1 if FAILS else 0)
