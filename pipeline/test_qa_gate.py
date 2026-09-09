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


ALL_LEVELS = {'L1', 'L2', 'L3'}
L1_ONLY = {'L1'}

# At L1 the registry forbids knowledge_check, worked_example and scenario, so
# criterion 4 has no evidence at all and criteria 3 and 5 must say what they were
# scored against instead.
L1_SKIP_REASON = 'INAPPLICABLE. The lesson declares levels: [L1]; the registry permits ' \
                 'knowledge_check only at L2 and L3, so there is nothing to score.'
L1_SUBSTITUTE_NOTE = 'Scored against the calculation in prose, since the block type itself ' \
                     'is unavailable at L1.'


def verdict(**overrides) -> dict:
    scores = {c: 4 for c in qa_gate.CRITERIA}
    scores.update(overrides.pop('scores', {}))
    return {'lesson': 'test-lesson', 'scores': scores, **overrides}


def l1_verdict(**overrides) -> dict:
    """A conforming L1-only verdict: seven scored, knowledge_check declared."""
    scores = {c: 4 for c in qa_gate.CRITERIA if c != 'knowledge_check'}
    scores.update(overrides.pop('scores', {}))
    notes = {'worked_example': L1_SUBSTITUTE_NOTE, 'scenario_authenticity': L1_SUBSTITUTE_NOTE}
    notes.update(overrides.pop('notes', {}))
    return {
        'lesson': 'l1-lesson',
        'scores': scores,
        'not_scored': overrides.pop('not_scored', {'knowledge_check': L1_SKIP_REASON}),
        'notes': notes,
        **overrides,
    }


def load(v: dict, levels: set[str]):
    """Write a verdict to a temp file and run it through load_verdict."""
    with tempfile.TemporaryDirectory() as d:
        p = Path(d) / 'v.json'
        p.write_text(json.dumps(v), encoding='utf-8')
        return qa_gate.load_verdict(p, levels)


def refuses(v: dict, levels: set[str], fragment: str) -> None:
    try:
        load(v, levels)
    except qa_gate.GateError as e:
        assert fragment in str(e), f'wrong reason: {e}'
    else:
        raise AssertionError(f'must have been refused ({fragment})')


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
            qa_gate.load_verdict(p, ALL_LEVELS)
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
            qa_gate.load_verdict(p, ALL_LEVELS)
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



# ---------------------------------------------------------------- L1 lessons
# The gate could not evaluate an L1-only lesson at all: CRITERIA was a fixed
# eight-tuple and three of them describe blocks the registry forbids at L1. Four
# of the five shipped lessons are L1-only. See what-failed.md entry 10.


@case('an L1 lesson is judgeable at all')
def _():
    r = qa_gate.evaluate(load(l1_verdict(), L1_ONLY))
    assert r['passed'], r
    assert len(r['scores']) == 7, r['scores']
    assert 'knowledge_check' in r['not_scored']


@case('the mean is taken over scored criteria only, not over all eight')
def _():
    # Seven 4s. Averaged over eight with the skipped one as zero this is 3.5 and
    # fails; over the seven that were scored it is 4.0 and passes.
    r = qa_gate.evaluate(load(l1_verdict(), L1_ONLY))
    assert r['mean'] == 4.0, r['mean']
    assert r['passed']


@case('an L1 verdict with a fabricated knowledge_check score is refused')
def _():
    # The trap in the repair. Permitting a criterion to be skipped is only safe
    # if scoring it anyway is refused; otherwise the fix legitimises the exact
    # fabrication it exists to prevent.
    v = l1_verdict()
    v['scores']['knowledge_check'] = 5
    v['not_scored'] = {}
    refuses(v, L1_ONLY, 'invented')


@case('a fabricated knowledge_check score is refused even alongside a reason')
def _():
    # Scoring it AND declaring it not scored is a contradiction, not a hedge.
    v = l1_verdict()
    v['scores']['knowledge_check'] = 5
    refuses(v, L1_ONLY, 'both scored and declared')


@case('an inapplicable criterion cannot be silently omitted')
def _():
    refuses(l1_verdict(not_scored={}), L1_ONLY, 'must be declared')


@case('a reason that is blank is not a reason')
def _():
    refuses(l1_verdict(not_scored={'knowledge_check': '   '}), L1_ONLY, 'no reason given')


@case('the judge cannot excuse itself from a criterion the lesson can satisfy')
def _():
    # concision applies at every level. Declaring it not scored is the judge
    # setting its own threshold, which is what deriving applicability prevents.
    v = l1_verdict()
    del v['scores']['concision']
    v['not_scored']['concision'] = 'I would rather not.'
    refuses(v, L1_ONLY, 'missing concision')


@case('scoring a substitute-evidence criterion requires saying what was scored')
def _():
    # worked_example may be scored at L1 from a prose calculation — but without
    # a note, "scored anyway" is indistinguishable from invented.
    refuses(l1_verdict(notes={'worked_example': ''}), L1_ONLY, 'must say what')


@case('an L2 lesson must still score all eight')
def _():
    # The escape hatch is derived from levels, so it must not open at L2.
    refuses(l1_verdict(), {'L2', 'L3'}, 'missing knowledge_check')


@case('the report names the skipped criterion and carries the independence caveat')
def _():
    caveat = 'weaker independence than the rubric assumes'
    v = l1_verdict(judge={'independence_caveat': caveat})
    text = qa_gate.report(qa_gate.evaluate(load(v, L1_ONLY)))
    assert 'Not scored' in text, text
    assert 'knowledge check' in text
    assert caveat in text, 'the caveat must travel with the score'
    assert '7 scored criteria' in text


@case('a lesson whose levels cannot be read is refused rather than assumed')
def _():
    with tempfile.TemporaryDirectory() as d:
        try:
            qa_gate.lesson_levels(Path(d) / 'v.json', None)
        except qa_gate.GateError as e:
            assert 'lesson not found' in str(e), e
        else:
            raise AssertionError('a missing lesson must not default to "everything applies"')


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
