#!/usr/bin/env python3
"""Tests for pipeline/run_lesson.py. No model is called: the generator and the
judges are stand-ins, so what is tested is the loop, not any model.

    python pipeline/test_run_lesson.py
"""

from __future__ import annotations

import copy
import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qa_gate  # noqa: E402
import run_lesson  # noqa: E402

FAILS = 0
DRAFT = Path('pipeline/out/lesson-cs-01/v1')
SOURCE = Path('pipeline/sources/cs-01-handling-a-customer-complaint.md')
GOOD = {
    'lesson': json.loads((DRAFT / 'lesson.json').read_text(encoding='utf-8')),
    'items': json.loads((DRAFT / 'items.json').read_text(encoding='utf-8')),
    'needsVerification': [],
}


def check(cond: bool, msg: str) -> None:
    global FAILS
    print(f'  {"ok  " if cond else "FAIL"} {msg}')
    if not cond:
        FAILS += 1


def broken_lesson() -> dict:
    bad = copy.deepcopy(GOOD)
    l1 = bad['lesson']['blocks']['l1']
    l1[1]['id'] = l1[0]['id']  # duplicate block id: validate.py refuses it
    return bad


def generator(*outputs):
    """A stand-in model that returns each prepared output in turn and keeps the prompts."""
    queue = list(outputs)
    prompts: list[str] = []

    def call(prompt: str, model: str, region: str):
        prompts.append(prompt)
        out = queue.pop(0)
        text = out if isinstance(out, str) else json.dumps(out, ensure_ascii=False)
        return text, {'inputTokens': len(prompt) // 4, 'outputTokens': len(text) // 4}
    return call, prompts


def judges(*score_sets):
    """Stand-in judges: each score set becomes one verdict from a different model."""
    calls: list[Path] = []

    def judge(lesson_path: Path) -> None:
        calls.append(lesson_path)
        for n, scores in enumerate(score_sets):
            s = {c: 4 for c in qa_gate.CRITERIA}
            s.update(scores)
            v = {'lesson': 'x', 'judge': {'model_id': f'family{n}.judge', 'scored_at': '1'},
                 'scores': s, 'notes': {}}
            (lesson_path.parent / f'verdict.j{n}.json').write_text(json.dumps(v), encoding='utf-8')
            (lesson_path.parent / f'qa-report.j{n}.md').write_text('**Result: PASS**\n', encoding='utf-8')
    return judge, calls


def go(call, judge, generator_id='openai.gpt-oss-120b-1:0'):
    t = tempfile.TemporaryDirectory()
    out = Path(t.name) / 'lesson-x'
    rec = run_lesson.run(SOURCE, 'CS-01', out, levels=['L1', 'L2'], slug='x', generator=generator_id,
                         region='us-east-1', denylist=[], call=call, judge=judge)
    return rec, out, t


print('independence')
check(run_lesson.family('us.meta.llama3-3-70b-instruct-v1:0') == 'meta', 'geography prefix stripped')
check(run_lesson.family('qwen.qwen3-32b-v1:0') == 'qwen', 'plain id')
try:
    run_lesson.check_independence('us.meta.llama3-1-8b-instruct-v1:0')
    check(False, 'a generator from a judge family is refused')
except run_lesson.RunError:
    check(True, 'a generator from a judge family is refused')
try:
    run_lesson.check_independence('openai.gpt-oss-120b-1:0')
    check(True, 'a generator from outside the panel is accepted')
except run_lesson.RunError:
    check(False, 'a generator from outside the panel is accepted')

print('item check')
check(run_lesson.check_items(GOOD['lesson'], GOOD['items'], 'cs') == [], 'the CS-01 bank passes')
bad = copy.deepcopy(GOOD['items'])
bad['items'][0]['options'][0]['isCorrect'] = True
bad['items'][0]['options'][1]['isCorrect'] = True
check(any('exactly one correct' in f for f in run_lesson.check_items(GOOD['lesson'], bad, 'cs')),
      'two correct options on MCQ_SINGLE refused')
bad = copy.deepcopy(GOOD['items'])
bad['items'][1]['options'][2]['feedbackEn'] = ''
check(any('misconception' in f for f in run_lesson.check_items(GOOD['lesson'], bad, 'cs')),
      'an option without feedback refused')
bad = copy.deepcopy(GOOD['items'])
bad['items'] = bad['items'][:1]
check(any('lacks' in f for f in run_lesson.check_items(GOOD['lesson'], bad, 'cs')),
      'a knowledge check pointing at a missing item refused')
bad = copy.deepcopy(GOOD['items'])
bad['items'][0]['formative'] = False
check(any('disagree' in f for f in run_lesson.check_items(GOOD['lesson'], bad, 'cs')),
      'a -KC- key that is not formative refused')

print('a clean draft goes straight to the panel and passes')
call, prompts = generator(GOOD)
judge, jcalls = judges({}, {'concision': 5})
rec, out, t = go(call, judge)
check(rec['outcome'].startswith('PANEL PASS at v1'), f'outcome: {rec["outcome"]}')
check([s['step'] for s in rec['steps']] == ['generate', 'gates', 'panel'], 'three steps, in order')
check((out / 'v1/panel-report.md').exists() and (out / 'run-report.md').exists(), 'reports written')
check(not (out / 'v2').exists(), 'no second version')
check('Source note (cs-01' in prompts[0] and 'concept-log.json' in prompts[0], 'prompt carries source and log')
t.cleanup()

print('a gate failure gets one retry, with the findings, as a new version')
call, prompts = generator(broken_lesson(), GOOD)
judge, jcalls = judges({}, {})
rec, out, t = go(call, judge)
check(rec['outcome'].startswith('PANEL PASS at v2'), f'outcome: {rec["outcome"]}')
check(len(jcalls) == 1 and jcalls[0].parent.name == 'v2', 'judges are not paid for the failing v1')
check('duplicate-block-id' in prompts[1], 'the retry prompt carries the finding')
v1 = json.loads((out / 'v1/lesson.json').read_text(encoding='utf-8'))
check(v1['blocks']['l1'][0]['id'] == v1['blocks']['l1'][1]['id'], 'v1 is kept as it was, not edited')
t.cleanup()

print('a second failure stops for a human')
call, _ = generator(broken_lesson(), broken_lesson())
judge, jcalls = judges({}, {})
rec, out, t = go(call, judge)
check(rec['outcome'].startswith('STOPPED after the one retry'), f'outcome: {rec["outcome"]}')
check(not (out / 'v3').exists() and not jcalls, 'no third version, no judging')
t.cleanup()

print('a split panel goes to a human without a retry')
call, _ = generator(GOOD, GOOD)
judge, _ = judges({'concision': 5}, {'concision': 3})
rec, out, t = go(call, judge)
check(rec['outcome'].startswith('NEEDS HUMAN at v1'), f'outcome: {rec["outcome"]}')
check(not (out / 'v2').exists(), 'disagreement is not retried away')
t.cleanup()

print('a unanimous panel failure is retried once with the reports')
call, prompts = generator(GOOD, GOOD)
judge, _ = judges({'concision': 2}, {'concision': 2})
rec, out, t = go(call, judge)
check(rec['outcome'].startswith('STOPPED after the one retry') and (out / 'v2').exists(),
      f'outcome: {rec["outcome"]}')
check('Result: PASS' in prompts[1], 'the retry prompt carries the qa reports')
t.cleanup()

print('output that is not a draft stops the run')
call, _ = generator('I cannot help with that.')
judge, _ = judges({}, {})
rec, out, t = go(call, judge)
check(rec['outcome'].startswith('STOPPED: the generator') and (out / 'v1/generation.raw.txt').exists(),
      'raw output kept for a person to read')
t.cleanup()

print('a generator from a judge family never starts')
call, prompts = generator(GOOD)
try:
    go(call, judges({}, {})[0], generator_id='amazon.nova-lite-v1:0')
    check(False, 'refused before any call')
except run_lesson.RunError:
    check(not prompts, 'refused before any call')

print('\nFAILS:', FAILS)
sys.exit(1 if FAILS else 0)
