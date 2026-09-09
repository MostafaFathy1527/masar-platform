#!/usr/bin/env python3
"""Negative tests for pipeline/qa_gate.py.

The gate's whole value is that it refuses things. A gate that has only ever
passed is a rubber stamp, so most of these plant a failing verdict and assert it
is refused — and two assert the opposite, so the gate cannot pass these tests by
failing everything.

Run:  python pipeline/test_qa_gate.py
"""

from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import qa_gate  # noqa: E402

RESULTS: list[tuple[str, bool, str]] = []


def verdict(**overrides) -> dict:
    scores = {c: 4 for c in qa_gate.CRITERIA}
    scores.update(overrides.pop('scores', {}))
    return {'lesson': 'test-lesson', 'scores': scores, **overrides}


def case(name: str):
    def deco(fn):
        try:
            fn()
            RESULTS.append((name, True, ''))
        except AssertionError as e:
            RESULTS.append((name, False, str(e)))
        return fn
    return deco


@case('a solid verdict passes')
def _():
    r = qa_gate.evaluate(verdict())
    assert r['passed'], r


@case('one criterion below the floor fails, even with a high mean')
def _():
    # Seven fives and a two averages 4.6 — comfortably over the mean threshold.
    r = qa_gate.evaluate(verdict(scores={**{c: 5 for c in qa_gate.CRITERIA}, 'knowledge_check': 2}))
    assert r['mean'] > qa_gate.MIN_MEAN, 'the mean should be high here'
    assert not r['passed'], 'a single unacceptable criterion must fail the gate'
    assert r['failed_floor'] and not r['failed_mean']


@case('a mediocre-everywhere lesson fails on the mean, with no criterion below the floor')
def _():
    r = qa_gate.evaluate(verdict(scores={c: 3 for c in qa_gate.CRITERIA}))
    assert not r['below_floor'], 'nothing is below the floor'
    assert not r['passed'], 'mean 3.0 is below the 4.0 threshold'
    assert r['failed_mean'] and not r['failed_floor']


@case('exactly at both thresholds passes')
def _():
    # Mean exactly 4.0, floor exactly 3: the boundary must be inclusive, or
    # the published thresholds are not the real ones.
    scores = {c: 4 for c in qa_gate.CRITERIA}
    scores['knowledge_check'] = 3
    scores['bilingual_quality'] = 5
    r = qa_gate.evaluate(verdict(scores=scores))
    assert r['mean'] == 4.0, r['mean']
    assert r['passed'], 'exactly at threshold must pass'


@case('an IP failure fails the gate on its own')
def _():
    # Section 0.5: a licensed code set or denylisted term is an automatic 1.
    r = qa_gate.evaluate(verdict(scores={**{c: 5 for c in qa_gate.CRITERIA}, 'accessibility_ip': 1}))
    assert not r['passed'], 'an IP failure must fail regardless of everything else'


@case('a verdict missing criteria is refused, not averaged over what is left')
def _():
    with tempfile.TemporaryDirectory() as d:
        p = Path(d) / 'v.json'
        partial = verdict()
        del partial['scores']['knowledge_check']
        del partial['scores']['concision']
        p.write_text(json.dumps(partial), encoding='utf-8')
        try:
            qa_gate.load_verdict(p)
        except qa_gate.GateError as e:
            assert 'missing' in str(e), e
        else:
            raise AssertionError('a partial verdict must not be accepted')


@case('an out-of-range score is refused')
def _():
    with tempfile.TemporaryDirectory() as d:
        p = Path(d) / 'v.json'
        p.write_text(json.dumps(verdict(scores={'concision': 9})), encoding='utf-8')
        try:
            qa_gate.load_verdict(p)
        except qa_gate.GateError as e:
            assert 'must be integers' in str(e), e
        else:
            raise AssertionError('a score of 9 must not be accepted')


@case('the report always carries the self-assessment label')
def _():
    text = qa_gate.report(qa_gate.evaluate(verdict()))
    assert qa_gate.SCORE_LABEL in text, 'the label must appear on every report'
    assert 'not human QA' in text


@case('a failing report says which threshold failed and what happens next')
def _():
    text = qa_gate.report(qa_gate.evaluate(verdict(scores={'knowledge_check': 2})))
    assert 'FAIL' in text
    assert 'Below the floor' in text
    assert 'retries once' in text, 'the report should say what the pipeline does next'


def main() -> int:
    passed = sum(1 for _, ok, _ in RESULTS if ok)
    for name, ok, err in RESULTS:
        print(('  ok   ' if ok else '  FAIL ') + name)
        if not ok:
            print('         ' + err[:300])
    print(f'\n{passed}/{len(RESULTS)} passed')
    return 0 if passed == len(RESULTS) else 1


if __name__ == '__main__':
    raise SystemExit(main())
