#!/usr/bin/env python3
"""Tests for the judge dataset builder. No model call: the pairs are built from the
lessons on disk and the behaviour from the verdicts already there.

    python pipeline/test_judge_dataset.py
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
os.chdir(Path(__file__).resolve().parent.parent)
import calibrate_judges  # noqa: E402
import judge_bedrock  # noqa: E402
import judge_dataset  # noqa: E402

FAILS = 0


def check(cond: bool, msg: str) -> None:
    global FAILS
    if cond:
        print(f'  ok   {msg}')
    else:
        FAILS += 1
        print(f'  FAIL {msg}')


def test_pairs(pairs: list[dict]):
    print('every pair is a real lesson and a copy that differs from it')
    check(len(pairs) > 0, f'{len(pairs)} pairs built')
    ids = [p['id'] for p in pairs]
    check(len(ids) == len(set(ids)), 'ids are unique')
    check(all(p['real'] != p['broken'] for p in pairs), 'real and broken differ in every pair')
    check(all(p['source'] in ('pipeline-draft', 'human-authored-course') for p in pairs),
          'every source is one of the two named')
    check({p['source'] for p in pairs} == {'pipeline-draft', 'human-authored-course'},
          'both sources contribute')
    check(all(p['target_criterion'] == calibrate_judges.MUTANTS[p['defect']][0] for p in pairs),
          'the target criterion is the one the defect aims at')
    check(all(p['expected']['criterion'] == p['target_criterion']
              and p['expected']['min_drop'] == calibrate_judges.MIN_DROP
              and p['target_criterion'] in p['expected']['statement'] for p in pairs),
          'expected agrees with the target criterion and the calibration threshold')
    check(any(p['defect'] == 'mismatched-numbers' for p in pairs), 'the new defect is in the data')


def test_items_are_what_the_judge_sees(pairs: list[dict]):
    print('real items are exactly what judge_bedrock shows a judge')
    with tempfile.TemporaryDirectory() as d:
        ok = True
        for p in pairs:
            if p['source'] != 'pipeline-draft':
                continue
            folder = Path(d) / p['id']
            folder.mkdir()
            src = Path(p['source_path']).parent
            (folder / 'items.json').write_text((src / 'items.json').read_text(encoding='utf-8'), encoding='utf-8')
            items, missing = judge_bedrock.referenced_items(p['real']['lesson'], folder)
            ok = ok and not missing and items == p['real']['items']
    check(ok, 'pipeline drafts: identical to referenced_items on the items.json beside the lesson')
    refs_ok = all([i['key'] for i in p[side]['items']] == judge_bedrock.item_refs(p[side]['lesson'])
                  for p in pairs for side in ('real', 'broken'))
    check(refs_ok, 'every side carries one item per knowledge check, in order')


def test_behaviour(records: list[dict]):
    print("judge behaviour: 'caught' follows the scores")
    check(len(records) > 0, f'{len(records)} behaviour records read')
    check(all(r['drop'] == r['real_score'] - r['broken_score'] for r in records), 'drop is real minus broken')
    check(all(r['caught'] == (r['real_score'] - r['broken_score'] >= calibrate_judges.MIN_DROP)
              for r in records), 'caught means a drop of at least the threshold')
    check(all(Path(r['real_verdict']).exists() and Path(r['broken_verdict']).exists() for r in records),
          'every verdict path exists')
    keys = [(r['run'], r['model_id'], r['lesson'], r['defect']) for r in records]
    check(len(keys) == len(set(keys)), 'one record per run, model, lesson and defect')


def test_unreadable_verdicts_are_counted():
    print('an unreadable verdict is skipped and counted, not fatal')
    real_root = judge_dataset.CAL
    with tempfile.TemporaryDirectory() as d:
        run = Path(d) / 'run'
        for variant in ('real-items', 'generic-feedback'):
            (run / f'lesson-x__{variant}').mkdir(parents=True)
        (run / 'lesson-x__real-items' / 'verdict.a.json').write_text('{not json', encoding='utf-8')
        (run / 'lesson-x__generic-feedback' / 'verdict.a.json').write_text(
            json.dumps({'judge': {'model_id': 'm'}, 'scores': {'knowledge_check': 1}}), encoding='utf-8')
        judge_dataset.CAL = Path(d)
        try:
            records, skipped = judge_dataset.build_behaviour()
        finally:
            judge_dataset.CAL = real_root
    check(records == [] and skipped['unreadable'] == 1 and sum(skipped.values()) == 2,
          f'no record, and both files counted ({dict(skipped)})')


def test_written_files_are_current(pairs: list[dict]):
    print('the published pairs are the ones the sources build today')
    path = judge_dataset.OUT / 'pairs.jsonl'
    if not path.exists():
        check(True, 'no dataset written yet')
        return
    raw = path.read_bytes()
    check(b'\r\n' not in raw, 'LF line endings')
    on_disk = [json.loads(line) for line in raw.decode('utf-8').splitlines()]
    check(on_disk == pairs, 'pairs.jsonl matches a fresh build (rerun pipeline/judge_dataset.py)')


if __name__ == '__main__':
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass
    pairs, _ = judge_dataset.build_pairs()
    records, _ = judge_dataset.build_behaviour()
    test_pairs(pairs)
    test_items_are_what_the_judge_sees(pairs)
    test_behaviour(records)
    test_unreadable_verdicts_are_counted()
    test_written_files_are_current(pairs)
    print('\nFAILS:', FAILS)
    sys.exit(1 if FAILS else 0)
