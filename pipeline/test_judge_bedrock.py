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


def test_judge_sees_the_items_its_checks_reference():
    print('the judge is shown the knowledge-check items, not just their refs')
    d = Path('pipeline/out/lesson-cs-01/v1')
    lesson = json.loads((d / 'lesson.json').read_text(encoding='utf-8'))
    items, missing = judge_bedrock.referenced_items(lesson, d)
    check(not missing and [i['key'] for i in items] == judge_bedrock.item_refs(lesson),
          'every itemRef resolves, in block order')
    prompt = judge_bedrock.build_prompt(lesson, {'L1', 'L2'}, items)
    check(items[0]['stemEn'] in prompt and items[0]['options'][0]['feedbackEn'] in prompt,
          'stem and option feedback are in the prompt')
    _, missing = judge_bedrock.referenced_items(lesson, Path('pipeline'))
    check(missing == judge_bedrock.item_refs(lesson), 'no items.json: every ref reported missing')
    code = judge_bedrock.main(['--lesson', str(Path('pipeline/out/lesson-cs-01/v1/lesson.json')),
                               '--model', 'x', '--tag', 't', '--dry-run'])
    check(code == 0, 'dry run with items present still works')


def test_served_model_uses_the_same_request():
    print('an open model behind an OpenAI-compatible endpoint')
    import os
    import urllib.request

    seen = {}

    class Reply:
        def __init__(self, payload: dict):
            self.payload = json.dumps(payload).encode('utf-8')

        def read(self):
            return self.payload

        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

    def fake_urlopen(req, timeout=None):
        seen['url'] = req.full_url
        seen['body'] = json.loads(req.data.decode('utf-8'))
        seen['auth'] = req.get_header('Authorization')
        seen['timeout'] = timeout
        return Reply({'choices': [{'message': {'content': '{"scores": {}}'}}],
                      'usage': {'prompt_tokens': 120, 'completion_tokens': 30}})

    real, had_key = urllib.request.urlopen, os.environ.pop('JUDGE_API_KEY', None)
    urllib.request.urlopen = fake_urlopen
    try:
        text, usage = judge_bedrock.call_openai_compatible('PROMPT', 'open-model', 'http://h:8080/v1/')
        check(seen['url'] == 'http://h:8080/v1/chat/completions', 'posts to <endpoint>/chat/completions')
        check(seen['body']['messages'] == [{'role': 'user', 'content': 'PROMPT'}]
              and seen['body']['temperature'] == 0 and seen['body']['model'] == 'open-model',
              'same prompt, temperature 0, the served model named')
        check(seen['auth'] is None, 'no key is sent when none is set')
        check(text == '{"scores": {}}' and usage['inputTokens'] == 120 and usage['outputTokens'] == 30,
              'text and token counts come back in the Bedrock shape')
        check(seen['timeout'] >= 600, 'a slow CPU node is given minutes, not seconds')
        os.environ['JUDGE_API_KEY'] = 'k'
        judge_bedrock.call_openai_compatible('PROMPT', 'open-model', 'http://h:8080/v1')
        check(seen['auth'] == 'Bearer k', 'the key comes from the environment')
    finally:
        urllib.request.urlopen = real
        os.environ.pop('JUDGE_API_KEY', None)
        if had_key is not None:
            os.environ['JUDGE_API_KEY'] = had_key
    verdict = judge_bedrock.make_verdict({'scores': {}}, LESSON_L1, 'open-model', usage,
                                         'openai-compatible')
    check(verdict['judge']['provider'] == 'openai-compatible', 'the verdict says how it was judged')

    import calibrate_judges
    tag = calibrate_judges.tag_for('humain-ai/ALLaM-7B-Instruct-preview', served=True)
    check(tag == 'humain-ai-allam-7b-instruct-preview', 'a served model name becomes a safe file tag')
    check(calibrate_judges.tag_for('silma-9b.Q4_K_M.gguf', served=True) == 'silma-9b-q4-k-m-gguf',
          'a GGUF file name is flattened whole, not split on its dots')


def test_a_copy_of_the_rubric_example_is_not_a_verdict(tmp: Path):
    print('a judge that hands back the rubric example has not scored the lesson')
    example = judge_bedrock.rubric_example()
    check(set(example.get('scores', {})) == set(qa_gate.CRITERIA),
          'the example is read from rubric.md and names every criterion')
    check(judge_bedrock.copies_rubric_example(dict(example)), 'the example itself is a copy')
    own_notes = dict(example, notes={'knowledge_check': 'Item 2 restates its stem.'})
    check(not judge_bedrock.copies_rubric_example(own_notes),
          'the same scores with notes about this lesson are a reading, not a copy')
    import calibrate_judges
    copy_path, real_path = tmp / 'verdict.copy.json', tmp / 'verdict.real.json'
    copy_path.write_text(json.dumps(example), encoding='utf-8')
    real_path.write_text(json.dumps(own_notes), encoding='utf-8')
    check(calibrate_judges.score(copy_path, 'bilingual_quality') is None,
          'calibration counts a copy as no score')
    check(calibrate_judges.score(real_path, 'bilingual_quality') == example['scores']['bilingual_quality'],
          'and a real reading as its score')


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
    test_judge_sees_the_items_its_checks_reference()
    test_served_model_uses_the_same_request()
    with tempfile.TemporaryDirectory() as d:
        test_a_copy_of_the_rubric_example_is_not_a_verdict(Path(d))
    print('\nFAILS:', FAILS)
    sys.exit(1 if FAILS else 0)
