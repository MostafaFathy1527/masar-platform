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


def run(build, seats=('m1', 'm2')) -> tuple[dict | None, str]:
    """`seats` are the models the panel expects; the fixtures above name their own,
    so the decision rules are tested without an empty seat unless a test wants one."""
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        build(d)
        try:
            entries, superseded = panel.collect(d, L2)
            return panel.decide(entries, seats) | {'n': len(entries), 'superseded': superseded}, ''
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

HOSTED = [m for m, _ in panel.PANEL_MODELS]
SERVED_MODEL, SERVED_TAG, SERVED_SPEC = panel.SERVED_JUDGES[0]
API_MODEL, API_TAG, API_SPEC = panel.API_JUDGES[0]


def seat_all(d: Path, **scores) -> None:
    for n, m in enumerate(panel.SEATS):
        write(d, f's{n}', m, '1', **scores)


def seat_hosted_only(d: Path, **scores) -> None:
    """Every seat but the open one: the Bedrock seats and the API seat."""
    for m, tag in panel.PANEL_MODELS:
        write(d, tag, m, '1', **scores)
    write(d, API_TAG, API_MODEL, '1', **scores)


print('every seat present and passing -> PASS')
v, _ = run(seat_all, seats=panel.SEATS)
check(v['decision'] == 'PASS' and v['empty_seats'] == [] and len(v['outcomes']) == 5,
      'three Bedrock seats, the open seat and the API seat, all pass -> PASS')

print('an empty seat goes to a human, whatever the present judges say')
reason = f'seat empty: {SERVED_MODEL} has not scored this lesson'
v, _ = run(seat_hosted_only, seats=panel.SEATS)
check(v['decision'] == 'NEEDS HUMAN' and v['empty_seats'] == [SERVED_MODEL] and reason in v['reasons'],
      'hosted judges all pass, open seat empty -> NEEDS HUMAN, naming the seat')
v, _ = run(lambda d: seat_hosted_only(d, concision=2), seats=panel.SEATS)
check(v['decision'] == 'NEEDS HUMAN' and not any(v['outcomes'].values()) and reason in v['reasons'],
      'hosted judges all fail, open seat empty -> NEEDS HUMAN, not FAIL')
with tempfile.TemporaryDirectory() as t:
    seat_hosted_only(Path(t))
    entries, superseded = panel.collect(Path(t), L2)
    text = panel.report('x', entries, panel.decide(entries, panel.SEATS), superseded)
check('Seats with no verdict beside the lesson' in text and f'`{SERVED_MODEL}`' in text,
      'the report lists the empty seat in a line of its own')

print('the served seat is the file that passed calibration, under the calibration tag')
import calibrate_judges  # noqa: E402
check(SERVED_MODEL == 'Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf',
      'the exact Q8_0 file; another quantisation is another judge')
check(SERVED_TAG == 'qwen3-30b-a3b-thinking-2507-q8-0-gguf'
      and calibrate_judges.tag_for(SERVED_MODEL, served=True) == SERVED_TAG,
      'the tag is the one the calibration folder uses')
check((Path('pipeline/out/calibration/2026-10-18-small-open-judges/lesson-sec-01__real-items')
       / f'verdict.{SERVED_TAG}.json').exists(), 'and that folder holds verdicts under it')
check(SERVED_SPEC == {'endpoint_env': 'JUDGE_QWEN3_ENDPOINT', 'temperature': 0.6, 'max_tokens': 12000,
                      'family': 'qwen'}, 'endpoint variable, decoding and family as calibrated')
check(panel.SEATS == tuple(HOSTED) + (SERVED_MODEL, API_MODEL),
      'SEATS is every Bedrock seat, then the served one, then the API one')

print('the API seat is the model that passed calibration, under the calibration tag')
check(API_MODEL == 'command-a-plus-05-2026' and calibrate_judges.tag_for(API_MODEL, served=True) == API_TAG,
      'the dated model id, under the tag the calibration folder uses')
check((Path('pipeline/out/calibration/2026-10-29-command-a-plus-native/lesson-sec-01__real-items')
       / f'verdict.{API_TAG}.json').exists(), 'and that folder holds verdicts under it')
check(API_SPEC == {'key_env': 'COHERE_API_KEY', 'temperature': 0, 'thinking_budget': 6000,
                   'max_tokens': 10000, 'family': 'cohere'},
      'key variable, decoding and family as calibrated')

print("run_judges scores every seat, and only this run's verdicts count")
import io  # noqa: E402
import os  # noqa: E402
import urllib.error  # noqa: E402
from datetime import datetime, timezone  # noqa: E402
import judge_bedrock  # noqa: E402

TAGS = {m: t for m, t in panel.PANEL_MODELS}
TAGS[SERVED_MODEL] = SERVED_TAG
TAGS[API_MODEL] = API_TAG
calls: list[list[str]] = []
real_main, real_err = judge_bedrock.main, sys.stderr
had = os.environ.pop(SERVED_SPEC['endpoint_env'], None)
had_key = os.environ.pop(API_SPEC['key_env'], None)


def fresh_judge(argv):
    """A stand-in that writes a passing verdict, scored now, for the seat it is asked for."""
    calls.append(list(argv))
    model = argv[argv.index('--model') + 1]
    lesson_dir = Path(argv[argv.index('--lesson') + 1]).parent
    write(lesson_dir, TAGS[model], model, datetime.now(timezone.utc).isoformat())
    return 0


def lesson_in(d: Path) -> Path:
    lesson = d / 'lesson.json'
    lesson.write_text(json.dumps({'levels': ['L1', 'L2'], 'slug': 'x'}), encoding='utf-8')
    return lesson


def quiet(fn):
    sys.stderr = io.StringIO()
    try:
        out = fn()
        return out, sys.stderr.getvalue()
    finally:
        sys.stderr = real_err


try:
    with tempfile.TemporaryDirectory() as t:
        lesson = lesson_in(Path(t))
        judge_bedrock.main = fresh_judge
        _, said = quiet(lambda: panel.run_judges(lesson, 'us-east-1'))
        models = [a[a.index('--model') + 1] for a in calls]
        check(models == HOSTED and all('--region' in a and '--endpoint' not in a for a in calls),
              'without the endpoint variable the hosted seats are scored and the open seat is skipped')
        check(SERVED_SPEC['endpoint_env'] in said and 'empty' in said, 'stderr names the unset variable')
        check(API_SPEC['key_env'] in said, 'and the API seat without its key is named too')
        k3 = next(a for a in calls if a[a.index('--model') + 1] == 'us.moonshotai.kimi-k3')
        check(k3[k3.index('--max-tokens') + 1] == '8000', 'Kimi K3 gets room for its reasoning')

        os.environ[SERVED_SPEC['endpoint_env']] = 'http://h:8080/v1'
        calls.clear()
        quiet(lambda: panel.run_judges(lesson, 'us-east-1'))
        last = calls[-1]
        check(len(calls) == 4 and last[last.index('--model') + 1] == SERVED_MODEL
              and last[last.index('--endpoint') + 1] == 'http://h:8080/v1'
              and last[last.index('--temperature') + 1] == '0.6'
              and last[last.index('--max-tokens') + 1] == '12000',
              'with the variable set, the open seat is scored at its own temperature and budget')

        os.environ[API_SPEC['key_env']] = 'k'
        calls.clear()
        quiet(lambda: panel.run_judges(lesson, 'us-east-1'))
        last = calls[-1]
        check(len(calls) == 5 and last[last.index('--model') + 1] == API_MODEL
              and '--cohere' in last and '--endpoint' not in last and '--region' not in last
              and last[last.index('--key-env') + 1] == 'COHERE_API_KEY'
              and last[last.index('--thinking-budget') + 1] == '6000'
              and last[last.index('--max-tokens') + 1] == '10000'
              and 'k' not in last,
              "with its key set, the API seat is scored on its maker's API, the key named, never passed")
        del os.environ[API_SPEC['key_env']]

    print('a seat whose call fails this run is empty, whatever an earlier run left')
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        lesson = lesson_in(d)
        for model, tag in TAGS.items():
            write(d, tag, model, '2026-01-01T00:00:00+00:00')  # last week's verdicts, all passing

        judge_bedrock.main = lambda argv: 2  # every call fails without writing
        code, said = quiet(lambda: panel.main(['--lesson', str(lesson), '--run']))
        check(code == 2 and 'a panel needs at least' in said and not (d / 'panel-report.md').exists(),
              'no seat scored this run: the old verdicts do not make a PASS, the panel could not run')

        def throttled_hosted(argv):
            if '--region' in argv and 'deepseek' in ' '.join(argv):
                raise RuntimeError('ThrottlingException: Too many requests')
            return fresh_judge(argv)
        judge_bedrock.main = throttled_hosted
        calls.clear()
        code, said = quiet(lambda: panel.main(['--lesson', str(lesson), '--run']))
        report = (d / 'panel-report.md').read_text(encoding='utf-8')
        check('ThrottlingException' in said and len(calls) == 3 and code == 1
              and 'deepseek.v3.2' in report.split('Seats with no verdict')[-1],
              'a hosted seat that raises is named and left empty; the other seats still score')

        judge_bedrock.main = fresh_judge
        os.environ[API_SPEC['key_env']] = 'k'
        code, _ = quiet(lambda: panel.main(['--lesson', str(lesson), '--run']))
        del os.environ[API_SPEC['key_env']]
        check(code == 0, 'every seat scoring this run, all passing and agreeing -> PASS')

    print('a served seat that cannot be reached, or answers badly, is empty and nothing is raised')
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        lesson = lesson_in(d)

        def refused(argv):
            if '--endpoint' in argv:
                raise urllib.error.URLError(ConnectionRefusedError(111, 'Connection refused'))
            return fresh_judge(argv)
        judge_bedrock.main = refused
        _, said = quiet(lambda: panel.run_judges(lesson, 'us-east-1'))
        check('Connection refused' in said and not (d / f'verdict.{SERVED_TAG}.json').exists(),
              'an endpoint that refuses the connection is reported on stderr, not raised')

        def not_a_completion(argv):
            if '--endpoint' in argv:
                raise ValueError('Expecting value: line 1 column 1 (char 0)')
            return fresh_judge(argv)
        judge_bedrock.main = not_a_completion
        _, said = quiet(lambda: panel.run_judges(lesson, 'us-east-1'))
        check('ValueError' in said and 'empty' in said,
              'an endpoint that answers with something other than JSON leaves the seat empty')

        def bad_verdict(argv):
            if '--endpoint' in argv:
                (d / f'verdict.{SERVED_TAG}.json').write_text(json.dumps(
                    {'judge': {'model_id': SERVED_MODEL, 'scored_at': datetime.now(timezone.utc).isoformat()},
                     'scores': {'concision': 9}}), encoding='utf-8')
                return 0
            return fresh_judge(argv)
        judge_bedrock.main = bad_verdict
        quiet(lambda: panel.run_judges(lesson, 'us-east-1'))
        check((d / 'refused-verdicts' / f'verdict.{SERVED_TAG}.json').exists()
              and not (d / f'verdict.{SERVED_TAG}.json').exists(),
              'a fresh verdict the gate refuses is moved aside, not left to stop the panel')

    print('a corrupt verdict file is a panel that could not run, not a crash')
    with tempfile.TemporaryDirectory() as t:
        d = Path(t)
        write(d, 'a', 'm1', '1')
        (d / 'verdict.b.json').write_text('{"judge": {"model_id": "m2"', encoding='utf-8')
        try:
            panel.collect(d, L2)
            check(False, 'truncated JSON raises PanelError')
        except panel.PanelError as e:
            check('not valid JSON' in str(e), 'truncated JSON raises PanelError')
finally:
    sys.stderr = real_err
    judge_bedrock.main = real_main
    os.environ.pop(SERVED_SPEC['endpoint_env'], None)
    if had is not None:
        os.environ[SERVED_SPEC['endpoint_env']] = had
    os.environ.pop(API_SPEC['key_env'], None)
    if had_key is not None:
        os.environ[API_SPEC['key_env']] = had_key

print('\nFAILS:', FAILS)
sys.exit(1 if FAILS else 0)
