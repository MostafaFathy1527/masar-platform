#!/usr/bin/env python3
"""Tests for the Bedrock judge adapter and the verdict comparison. No network:
everything here runs on fixtures, and a model call is never made.

    python pipeline/test_judge_bedrock.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import compare_verdicts  # noqa: E402
import judge_bedrock  # noqa: E402
import qa_gate  # noqa: E402

FAILS = 0


def check(cond: bool, msg: str) -> None:
    global FAILS
    if cond:
        print(f'  ok   {msg}')
    else:
        FAILS += 1
        print(f'  FAIL {msg}')


LESSON_L1 = {'slug': 'x-l1', 'levels': ['L1'], 'blocks': []}
LESSON_L2 = {'slug': 'x-l2', 'levels': ['L1', 'L2'], 'blocks': []}


def test_applicability_follows_the_gate():
    print('applicability mirrors qa_gate')
    scorable, substitute, unscorable = judge_bedrock.applicability({'L1'})
    check('knowledge_check' in unscorable, 'knowledge_check is unscorable at L1')
    check('worked_example' in substitute and 'scenario_authenticity' in substitute,
          'worked_example and scenario are substitute-evidence at L1')
    check('objective_alignment' in scorable, 'objective_alignment is scorable at L1')
    scorable2, substitute2, unscorable2 = judge_bedrock.applicability({'L1', 'L2'})
    check(not unscorable2 and not substitute2 and len(scorable2) == 8,
          'all eight criteria are scorable at L2')


def test_prompt_contains_no_generation_material():
    print('the prompt is judge + rubric + lesson, nothing else')
    p = judge_bedrock.build_prompt(LESSON_L1, {'L1'})
    check('You are scoring a lesson you did not write' in p, 'judge prompt included')
    check('## Output the judge must return' in p, 'rubric included')
    check('"slug": "x-l1"' in p, 'lesson included')
    check('generate.md' not in p.replace('pipeline/prompts/generate.md', ''),
          'generation prompt text not included')
    check('Do NOT score them' in p and 'knowledge_check' in p,
          'unscorable criteria are named as forbidden')


def test_extract_json_tolerates_fences_and_prose():
    print('model output parsing')
    body = '{"lesson": "x", "scores": {"concision": 4}}'
    check(judge_bedrock.extract_json(body)['scores']['concision'] == 4, 'bare JSON')
    check(judge_bedrock.extract_json('```json\n' + body + '\n```')['lesson'] == 'x', 'fenced JSON')
    check(judge_bedrock.extract_json('Here you go:\n' + body + '\nDone.')['lesson'] == 'x', 'JSON inside prose')
    try:
        judge_bedrock.extract_json('no json here')
        check(False, 'raises on no JSON')
    except ValueError:
        check(True, 'raises on no JSON')


def test_verdict_shape_passes_the_gate(tmp: Path):
    print('a well-formed L1 verdict passes load_verdict; a fabricated one is refused')
    raw = {
        'lesson': 'x-l1',
        'scores': {'objective_alignment': 4, 'level_fidelity': 4, 'worked_example': 4,
                   'scenario_authenticity': 4, 'bilingual_quality': 5, 'concision': 4,
                   'accessibility_ip': 4},
        'notes': {'worked_example': 'scored against the calculation in prose',
                  'scenario_authenticity': 'scored against the two job tips'},
        'not_scored': {'knowledge_check': 'no knowledge_check block can exist at L1'},
        'verdict_notes': 'fine',
    }
    verdict = judge_bedrock.make_verdict(raw, LESSON_L1, 'test-model', {'inputTokens': 1, 'outputTokens': 2})
    check(verdict['judge']['provider'] == 'amazon-bedrock' and verdict['judge']['saw_generation_prompt'] is False,
          'provenance attached')
    path = tmp / 'verdict.test.json'
    path.write_text(json.dumps(verdict), encoding='utf-8')
    loaded = qa_gate.load_verdict(path, {'L1'})
    result = qa_gate.evaluate(loaded)
    check(result['passed'] and result['mean'] == 4.14, f'gate PASS mean {result["mean"]}')

    fabricated = dict(raw)
    fabricated['scores'] = dict(raw['scores'], knowledge_check=4)
    fabricated['not_scored'] = {}
    path2 = tmp / 'verdict.bad.json'
    path2.write_text(json.dumps(judge_bedrock.make_verdict(fabricated, LESSON_L1, 'm', {})), encoding='utf-8')
    try:
        qa_gate.load_verdict(path2, {'L1'})
        check(False, 'gate refuses a knowledge_check score at L1')
    except qa_gate.GateError:
        check(True, 'gate refuses a knowledge_check score at L1')


def test_compare_reports_disagreement():
    print('compare_verdicts')
    a = {'lesson': 'x', 'scores': {'objective_alignment': 4, 'concision': 4, 'accessibility_ip': 5}}
    b = {'lesson': 'x', 'scores': {'objective_alignment': 2, 'concision': 4}}
    cmp = compare_verdicts.compare(a, b)
    check(cmp['shared']['objective_alignment']['delta'] == -2, 'delta is B minus A')
    check(cmp['mean_abs_diff'] == 1.0, 'mean absolute difference over shared criteria')
    check(cmp['only_a'] == ['accessibility_ip'], 'criteria scored by one judge only are listed')
    check(cmp['outcome_a']['passed'] is True and cmp['outcome_b']['passed'] is False,
          'outcomes differ and are reported separately')
    md = compare_verdicts.markdown('A', 'B', 'x', cmp)
    check('different outcomes' in md, 'markdown names the disagreement')


if __name__ == '__main__':
    import tempfile
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass
    test_applicability_follows_the_gate()
    test_prompt_contains_no_generation_material()
    test_extract_json_tolerates_fences_and_prose()
    with tempfile.TemporaryDirectory() as d:
        test_verdict_shape_passes_the_gate(Path(d))
    test_compare_reports_disagreement()
    print('\nFAILS:', FAILS)
    sys.exit(1 if FAILS else 0)
