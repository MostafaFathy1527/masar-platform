#!/usr/bin/env python3
"""Negative tests for pipeline/concept_log.py.

The concept log is the piece of this project that claims to enforce something a
human editor cannot hold across a whole course. A checker that has only ever
returned PASS makes that claim without evidence, so each test here plants one
violation in copies of the real lessons and asserts the matching rule fires.

The first and last tests exist to catch a checker that "passes" by failing
everything: the untouched course must be clean, and legitimate reuse of an
already-taught concept must NOT be flagged.

Run:  python pipeline/test_concept_log.py
"""

from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import concept_log  # noqa: E402

LESSONS = concept_log.load_lessons()
RESULTS: list[tuple[str, bool, str]] = []


def rules(findings) -> set[str]:
    return {f.rule for f in findings}


def fresh() -> list[tuple[Path, dict]]:
    return [(p, copy.deepcopy(d)) for p, d in LESSONS]


def find(lessons, name_fragment):
    for path, doc in lessons:
        if name_fragment in path.name:
            return doc
    raise AssertionError(f'no lesson matching {name_fragment}')


def case(name: str):
    def deco(fn):
        try:
            fn(fresh())
            RESULTS.append((name, True, ''))
        except AssertionError as e:
            RESULTS.append((name, False, str(e)))
        return fn
    return deco


@case('the real course passes')
def _(lessons):
    findings = concept_log.check(lessons)
    assert not findings, f'expected clean, got: {[str(f) for f in findings]}'


@case('re-introducing an earlier concept is rejected')
def _(lessons):
    # Lesson 7 claims to introduce "clean_claim", which lesson 4 already teaches.
    find(lessons, '07-denials')['conceptsIntroduced'].append('clean_claim')
    assert 'redefines-concept' in rules(concept_log.check(lessons))


@case('re-DEFINING an earlier concept in a later lesson is rejected')
def _(lessons):
    # The declaration is left alone; only a definition block is added, so this
    # catches the failure in the content rather than in the metadata.
    doc = find(lessons, '07-denials')
    doc['blocks']['l1'].append({
        'id': 'b7_d_dupe', 'type': 'definition_card', 'objectiveId': 'MI-09',
        'payload': {'termAr': 'Clean claim', 'termEn': 'Clean claim',
                    'defAr': 'x', 'defEn': 'A claim that passes on first submission.'},
    })
    assert 'redefines-concept' in rules(concept_log.check(lessons))


@case('defining a concept without declaring it is rejected')
def _(lessons):
    doc = find(lessons, '01-the-insurance')
    doc['blocks']['l1'].append({
        'id': 'b1_d_undeclared', 'type': 'definition_card', 'objectiveId': 'MI-01',
        'payload': {'termAr': 'Coordination of benefits', 'termEn': 'Coordination of benefits',
                    'defAr': 'x', 'defEn': 'How two policies share a single cost.'},
    })
    assert 'undeclared-concept' in rules(concept_log.check(lessons))


@case('using a concept before any lesson introduces it is rejected')
def _(lessons):
    # Lesson 1 leans on a term lesson 3 introduces.
    doc = find(lessons, '01-the-insurance')
    doc['blocks']['l1'].append({
        'id': 'b1_p_forward', 'type': 'rich_text', 'objectiveId': 'MI-01',
        'payload': {'mdAr': 'x',
                    'mdEn': 'Confirm coverage active before any of this applies.'},
    })
    assert 'forward-reference' in rules(concept_log.check(lessons))


@case('a later lesson may freely USE an earlier concept')
def _(lessons):
    # The whole point of the log is that reuse is allowed; only re-teaching is
    # not. Lesson 7 mentioning "clean claim" in prose must stay clean.
    doc = find(lessons, '07-denials')
    doc['blocks']['l1'].append({
        'id': 'b7_p_reuse', 'type': 'rich_text', 'objectiveId': 'MI-09',
        'payload': {'mdAr': 'x',
                    'mdEn': 'A clean claim rarely reaches this stage at all.'},
    })
    assert not rules(concept_log.check(lessons)), 'legitimate reuse must not be flagged'


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
