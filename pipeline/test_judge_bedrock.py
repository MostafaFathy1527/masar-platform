#!/usr/bin/env python3
"""Tests for the Bedrock judge adapter and the verdict comparison. No network:
everything here runs on fixtures, and a model call is never made.

    python pipeline/test_judge_bedrock.py
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
# The fixtures are named from the repository root; this makes the file runnable
# from inside pipeline/ as well.
os.chdir(Path(__file__).resolve().parent.parent)
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
    thinking = '<think>The shape is {"scores": {...}}; item 2 looks weak.</think>\n' + body
    check(judge_bedrock.extract_json(thinking)['lesson'] == 'x',
          'a think block with braces in it is dropped before the JSON is read')
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
        check(seen['body']['max_tokens'] == 4000, 'the default token budget is the one every judge uses')
        os.environ['JUDGE_MAX_TOKENS'], os.environ['JUDGE_TEMPERATURE'] = '12000', '0.6'
        _, usage = judge_bedrock.call_openai_compatible('PROMPT', 'open-model', 'http://h:8080/v1')
        check(seen['body']['max_tokens'] == 12000 and seen['body']['temperature'] == 0.6,
              'a reasoning model can be given a larger budget and a non-greedy temperature')
        check(usage['temperature'] == 0.6, 'and the verdict records the temperature actually used')
    finally:
        urllib.request.urlopen = real
        for var in ('JUDGE_API_KEY', 'JUDGE_MAX_TOKENS', 'JUDGE_TEMPERATURE'):
            os.environ.pop(var, None)
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
    one_changed = dict(example, scores=dict(example['scores'], knowledge_check=4),
                       verdict_notes=example['verdict_notes'].replace('at 3', 'at 4', 1))
    check(judge_bedrock.copies_rubric_example(one_changed),
          'the example with one score and its closing number changed is still a copy')
    two_changed = dict(one_changed, scores=dict(one_changed['scores'], concision=5))
    check(not judge_bedrock.copies_rubric_example(two_changed),
          "scores of its own with the example's words are a borrowed note, not refused")
    own_close = dict(one_changed, verdict_notes='Item 2 is the weakest part of this lesson.')
    check(not judge_bedrock.copies_rubric_example(own_close),
          'one score changed with a closing note of its own is not a copy')
    import calibrate_judges
    copy_path, real_path = tmp / 'verdict.copy.json', tmp / 'verdict.real.json'
    copy_path.write_text(json.dumps(example), encoding='utf-8')
    real_path.write_text(json.dumps(own_notes), encoding='utf-8')
    check(calibrate_judges.score(copy_path, 'bilingual_quality') is None,
          'calibration counts a copy as no score')
    check(calibrate_judges.score(real_path, 'bilingual_quality') == example['scores']['bilingual_quality'],
          'and a real reading as its score')


def test_explicit_decoding_overrides_the_environment(tmp: Path):
    print('--temperature and --max-tokens override JUDGE_TEMPERATURE and JUDGE_MAX_TOKENS')
    import os
    import urllib.request

    seen: dict = {}

    class Reply:
        payload = json.dumps({'choices': [{'message': {'content': '{"scores": {}}'}}],
                              'usage': {}}).encode('utf-8')

        def read(self):
            return self.payload

        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

    def fake_urlopen(req, timeout=None):
        seen['body'] = json.loads(req.data.decode('utf-8'))
        return Reply()

    real_open = urllib.request.urlopen
    saved = {v: os.environ.pop(v, None) for v in ('JUDGE_MAX_TOKENS', 'JUDGE_TEMPERATURE')}
    urllib.request.urlopen = fake_urlopen
    try:
        os.environ['JUDGE_MAX_TOKENS'], os.environ['JUDGE_TEMPERATURE'] = '4000', '0'
        _, usage = judge_bedrock.call_openai_compatible('PROMPT', 'm', 'http://h:8080/v1',
                                                        max_tokens=12000, temperature=0.6)
        check(seen['body']['max_tokens'] == 12000 and seen['body']['temperature'] == 0.6,
              'explicit arguments win over the environment')
        check(usage['temperature'] == 0.6, 'and the verdict records the temperature used')
        judge_bedrock.call_openai_compatible('PROMPT', 'm', 'http://h:8080/v1')
        check(seen['body']['max_tokens'] == 4000 and seen['body']['temperature'] == 0,
              'without them the environment still decides')
    finally:
        urllib.request.urlopen = real_open
        for v, had in saved.items():
            os.environ.pop(v, None)
            if had is not None:
                os.environ[v] = had

    # Through main(): the options arrive at call_openai_compatible as arguments. The
    # reply is the rubric example, so main() refuses it before the gate and nothing is
    # appended to the run log.
    got: dict = {}
    reply = json.dumps(judge_bedrock.rubric_example())

    def fake_call(prompt, model, endpoint, max_tokens=None, timeout=1800, temperature=None):
        got.update(model=model, endpoint=endpoint, max_tokens=max_tokens, temperature=temperature)
        return reply, {'temperature': temperature}

    lesson = tmp / 'lesson.json'
    lesson.write_text(json.dumps(LESSON_L1), encoding='utf-8')
    real_call = judge_bedrock.call_openai_compatible
    judge_bedrock.call_openai_compatible = fake_call
    try:
        judge_bedrock.main(['--lesson', str(lesson), '--model', 'open-model', '--tag', 'opt',
                            '--endpoint', 'http://h:8080/v1', '--temperature', '0.6',
                            '--max-tokens', '12000'])
        check(got == {'model': 'open-model', 'endpoint': 'http://h:8080/v1', 'max_tokens': 12000,
                      'temperature': 0.6}, '--temperature 0.6 and --max-tokens 12000 arrive as arguments')
        got.clear()
        judge_bedrock.main(['--lesson', str(lesson), '--model', 'open-model', '--tag', 'opt',
                            '--endpoint', 'http://h:8080/v1'])
        check(got['max_tokens'] is None and got['temperature'] is None,
              'without the options nothing is forced, so the environment defaults apply')
    finally:
        judge_bedrock.call_openai_compatible = real_call


def test_the_whole_reply_is_kept_on_request(tmp: Path):
    print("a reasoning judge's whole reply can be kept beside its verdict")
    import os
    lesson = tmp / 'lesson.json'
    lesson.write_text(json.dumps(LESSON_L1), encoding='utf-8')
    # The reply is the rubric example handed back, so main() refuses it before the gate
    # and nothing is appended to the run log.
    reply = '<think>The example in the rubric looks right.</think>\n' + json.dumps(judge_bedrock.rubric_example())
    real = judge_bedrock.call_openai_compatible
    judge_bedrock.call_openai_compatible = lambda *a, **k: (reply, {'temperature': 0})
    try:
        os.environ['JUDGE_KEEP_OUTPUT'] = '1'
        code = judge_bedrock.main(['--lesson', str(lesson), '--model', 'm', '--tag', 'kept',
                                   '--endpoint', 'http://h:8080/v1'])
        kept = tmp / 'verdict.kept.output.txt'
        check(code == 2 and kept.exists() and kept.read_text(encoding='utf-8') == reply,
              'with JUDGE_KEEP_OUTPUT the reply, reasoning included, is written even when it is refused')
        os.environ.pop('JUDGE_KEEP_OUTPUT')
        judge_bedrock.main(['--lesson', str(lesson), '--model', 'm', '--tag', 'plain',
                            '--endpoint', 'http://h:8080/v1'])
        check(not (tmp / 'verdict.plain.output.txt').exists(), 'without it, nothing extra is written')
    finally:
        judge_bedrock.call_openai_compatible = real
        os.environ.pop('JUDGE_KEEP_OUTPUT', None)


def l1_reply(lesson_slug: str, kc: int = 4) -> dict:
    """A judge reply the gate accepts for an L1 lesson."""
    return {
        'lesson': lesson_slug,
        'scores': {'objective_alignment': 4, 'level_fidelity': 4, 'worked_example': 4,
                   'scenario_authenticity': 4, 'bilingual_quality': kc, 'concision': 4,
                   'accessibility_ip': 4},
        'notes': {'worked_example': 'the calculation in prose',
                  'scenario_authenticity': 'the two job tips'},
        'not_scored': {'knowledge_check': 'no knowledge_check block can exist at L1'},
        'verdict_notes': 'A test reply.',
    }


def run_log_lines() -> int:
    return len(qa_gate.RUN_LOG.read_text(encoding='utf-8').splitlines())


def test_log_option_keeps_a_judgement_out_of_the_run_log():
    print('--log sends the gate entry to the named log, and the run log is untouched')
    before = run_log_lines()
    real = judge_bedrock.call_bedrock
    judge_bedrock.call_bedrock = lambda *a, **k: (json.dumps(l1_reply('x-l1')), {'temperature': 0})
    # Inside the repository, because the gate refuses to log a path outside it.
    with tempfile.TemporaryDirectory(dir=qa_gate.REPO / 'pipeline' / 'out') as d, \
            tempfile.TemporaryDirectory() as logs:
        lesson = Path(d) / 'lesson.json'
        lesson.write_text(json.dumps(LESSON_L1), encoding='utf-8')
        log = Path(logs) / 'elsewhere.jsonl'
        try:
            code = judge_bedrock.main(['--lesson', str(lesson), '--model', 'm', '--tag', 't',
                                       '--log', str(log)])
        finally:
            judge_bedrock.call_bedrock = real
        entries = [json.loads(x) for x in log.read_text(encoding='utf-8').splitlines()] if log.exists() else []
        check(code == 0 and len(entries) == 1, 'one entry in the named log')
        check(entries and entries[0]['verdict'] == f'pipeline/out/{Path(d).name}/verdict.t.json',
              'and its verdict path is relative to the repository')
    check(run_log_lines() == before, 'nothing appended to the run log')


def test_calibration_logs_to_the_calibration_log():
    print('calibrate_judges sends every judgement to the calibration log')
    import calibrate_judges
    seen: list[list[str]] = []
    real_main, real_root = judge_bedrock.main, calibrate_judges.CALIBRATION_ROOT
    judge_bedrock.main = lambda argv: seen.append(list(argv)) or 2
    before = run_log_lines()
    with tempfile.TemporaryDirectory() as d:
        calibrate_judges.CALIBRATION_ROOT = Path(d)
        try:
            calibrate_judges.main(['--models', 'zai.glm-5', '--defects', 'generic-feedback',
                                   '--date', 'test'])
        finally:
            judge_bedrock.main, calibrate_judges.CALIBRATION_ROOT = real_main, real_root
    check(seen and all('--log' in a and a[a.index('--log') + 1] == str(qa_gate.CALIBRATION_LOG)
                       for a in seen), f'all {len(seen)} judge calls name the calibration log')
    check(qa_gate.log_for(qa_gate.CALIBRATION_OUT / 'x' / 'y' / 'verdict.t.json') == qa_gate.CALIBRATION_LOG,
          'and a calibration verdict judged by hand goes there too')
    check(run_log_lines() == before, 'nothing appended to the run log')


def test_report_only_reads_the_model_from_the_verdict():
    print('--report-only finds verdicts saved under an older tag rule')
    import calibrate_judges
    # As on disk from 14 and 15 October: Kimi K3 under its whole Bedrock id, and a served
    # GGUF judged without --endpoint, whose name today's tag_for would collapse.
    judges = {'us.moonshotai.kimi-k3': 'moonshotai-kimi-k3',
              'Fanar-2-27B-Instruct.Q4_K_M.gguf': 'fanar-2-27b-instruct-q4-k-m-gguf'}
    check(all(calibrate_judges.tag_for(m) != t for m, t in judges.items()),
          'the tags on disk are not the ones tag_for gives today')
    real_root = calibrate_judges.CALIBRATION_ROOT
    with tempfile.TemporaryDirectory() as d:
        run = Path(d) / 'old-run'
        for variant, kc in (('real-items', 5), ('generic-feedback', 1)):
            folder = run / f'lesson-cs-01__{variant}'
            folder.mkdir(parents=True)
            for model, tag in judges.items():
                reply = l1_reply('cs-01')
                reply['scores'].pop('bilingual_quality')
                reply['scores'].update(knowledge_check=kc, bilingual_quality=4)
                reply['not_scored'] = {}
                v = judge_bedrock.make_verdict(reply, {'slug': 'cs-01'}, model, {'temperature': 0})
                (folder / f'verdict.{tag}.json').write_text(json.dumps(v), encoding='utf-8')
        calibrate_judges.CALIBRATION_ROOT = Path(d)
        try:
            calibrate_judges.main(['--date', 'old-run', '--report-only', '--defects', 'generic-feedback'])
        finally:
            calibrate_judges.CALIBRATION_ROOT = real_root
        report = (run / 'report.md').read_text(encoding='utf-8')
        rows = json.loads((run / 'results.json').read_text(encoding='utf-8'))
        check(not (run / 'lesson-cs-01__real-items' / 'lesson.json').exists(),
              'a rebuild does not rewrite the copies that were judged')
    for model in judges:
        line = next((x for x in report.splitlines() if x.startswith(f'| `{model}`')), '')
        check(line.endswith('| knowledge_check | 1 of 1 | 4.00 |'), f'{model}: 1 of 1, not 0 of 0')
    check(all(r['sample'] == 'lesson-cs-01' for r in rows) and len(rows) == 2,
          'no empty rows for samples and defects the judges were never shown')


def test_mismatched_numbers_moves_only_the_arabic():
    print('mismatched-numbers changes every number in the Arabic, and nothing else')
    import calibrate_judges as cj
    indic = cj.INDIC_DIGITS
    lesson = {'slug': 'n', 'levels': ['L1'], 'bilingual': True,
              'titleAr': 'التسليم قبل 16:00', 'titleEn': 'Hand over before 16:00',
              'blocks': {'l1': [{'type': 'takeaways', 'payload': {
                  'itemsAr': ['المبلغ 1,260 جنيهًا', 'التذكرة ' + indic[4] + indic[5] + indic[9]],
                  'itemsEn': ['The amount is 1,260', 'Ticket 459']}},
                  {'type': 'rich_text', 'payload': {'mdAr': 'Copied English 99', 'mdEn': 'Copied English 99'}}]}}
    bank = {'items': [{'key': 'K', 'stemAr': 'خلال 9 أيام', 'stemEn': 'Within 9 days', 'options': []}]}
    before_lesson, before_bank = json.dumps(lesson, ensure_ascii=False), json.dumps(bank, ensure_ascii=False)
    broken, broken_bank = cj.mismatched_numbers(lesson, bank)
    check(json.dumps(lesson, ensure_ascii=False) == before_lesson and json.dumps(bank, ensure_ascii=False) == before_bank,
          'the real lesson and bank are not touched')

    def fields(node, out, path=''):
        if isinstance(node, dict):
            for k, v in node.items():
                fields(v, out, f'{path}.{k}')
        elif isinstance(node, list):
            for i, v in enumerate(node):
                fields(v, out, f'{path}[{i}]')
        else:
            out[path] = node
        return out
    real_f = {**fields(lesson, {}), **fields(bank, {}, '#')}
    broken_f = {**fields(broken, {}), **fields(broken_bank, {}, '#')}
    changed = {k for k in real_f if real_f[k] != broken_f[k]}
    check(changed and all('Ar' in k.rsplit('.', 1)[-1] for k in changed),
          f'only Arabic fields changed ({len(changed)})')
    check(all(real_f[k] == broken_f[k] for k in real_f if k.rsplit('.', 1)[-1].split('[')[0].endswith('En')),
          'every English field is unchanged')
    check(broken['blocks']['l1'][1]['payload']['mdAr'] == 'Copied English 99',
          'an Arabic field holding English is left alone')
    for k in changed:
        old, new = cj.NUMBER.findall(real_f[k]), cj.NUMBER.findall(broken_f[k])
        check(len(old) == len(new) and all(a != b for a, b in zip(old, new)),
              f'{k}: every number differs ({old} -> {new})')
        check(all(len(a) == len(b) and (a[0] in indic) == (b[0] in indic) for a, b in zip(old, new)),
              f'{k}: digit script and width kept')
        check(cj.NUMBER.sub('#', real_f[k]) == cj.NUMBER.sub('#', broken_f[k]),
              f'{k}: only the numbers changed')
    check(broken['titleAr'].endswith('17:01') and broken_bank['items'][0]['stemAr'] == 'خلال 0 أيام',
          'a time keeps its shape, and a wrap still differs')
    check(broken['blocks']['l1'][0]['payload']['itemsAr'][1].endswith(indic[4] + indic[6] + indic[0]),
          'Arabic-Indic digits stay Arabic-Indic')

    plain = {'slug': 'p', 'levels': ['L1'], 'bilingual': True, 'titleAr': 'بلا أرقام', 'titleEn': 'No numbers 5',
             'blocks': {}}
    for label, case in (('a lesson with no number in its Arabic', plain),
                        ('an English-only lesson', {**lesson, 'bilingual': False})):
        try:
            cj.mismatched_numbers(case, {'items': []})
            check(False, f'{label} is reported not applicable')
        except cj.NotApplicable:
            check(True, f'{label} is reported not applicable')
    check(cj.MUTANTS['mismatched-numbers'][0] == 'bilingual_quality', 'it targets bilingual_quality')


def test_calibration_skips_a_defect_with_nothing_to_break():
    print('calibrate_judges builds no copy for a defect that does not apply, and reports without it')
    import calibrate_judges
    seen: list[list[str]] = []
    real_main, real_root = judge_bedrock.main, calibrate_judges.CALIBRATION_ROOT
    judge_bedrock.main = lambda argv: seen.append(list(argv)) or 2
    with tempfile.TemporaryDirectory() as d:
        calibrate_judges.CALIBRATION_ROOT = Path(d)
        try:
            code = calibrate_judges.main(['--models', 'zai.glm-5', '--defects', 'mismatched-numbers',
                                          '--date', 'test'])
            dry = calibrate_judges.main(['--dry-run', '--date', 'dry'])
        finally:
            judge_bedrock.main, calibrate_judges.CALIBRATION_ROOT = real_main, real_root
        run = Path(d) / 'test'
        built = sorted(p.name for p in run.glob('*__mismatched-numbers'))
        rows = json.loads((run / 'results.json').read_text(encoding='utf-8'))
        report_ok = (run / 'report.md').exists()
        dry_copies = len(list((Path(d) / 'dry').glob('*__*')))
    check(code == 0 and report_ok, 'a run with no verdicts at all still writes its report')
    check(built == ['lesson-ops-01-r2__mismatched-numbers'],
          f'only the sample with numbers in its Arabic gets a copy ({built})')
    check(not any('__mismatched-numbers' in a[a.index('--lesson') + 1] and 'ops-01-r2' not in a[a.index('--lesson') + 1]
                  for a in seen), 'no judge is shown a copy that was not built')
    check({r['sample'] for r in rows} == {'lesson-ops-01-r2'} and all(r['drop'] is None for r in rows),
          'rows exist only where the defect applied, and an unscored row has no drop')
    check(dry == 0 and dry_copies == len(calibrate_judges.SAMPLES) * (len(calibrate_judges.MUTANTS) + 1) - 3,
          f'the dry run builds every applicable copy, the new defect included ({dry_copies})')


def test_an_absent_bilingual_flag_means_bilingual():
    print('a lesson without a bilingual key is judged as bilingual, as the schema reads it')
    lesson = {'slug': 'b', 'levels': ['L1'], 'titleAr': 'عنوان', 'titleEn': 'Title', 'blocks': []}
    prompt = judge_bedrock.build_prompt(lesson, {'L1'})
    check('declares bilingual: true' in prompt and 'English-only by its own declaration' not in prompt,
          'absent flag: the judge scores Arabic quality, it is not told to excuse pasted English')
    prompt = judge_bedrock.build_prompt({**lesson, 'bilingual': False}, {'L1'})
    check('English-only by its own declaration' in prompt, 'an explicit false still reads as English-only')


if __name__ == '__main__':
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
    with tempfile.TemporaryDirectory() as d:
        test_explicit_decoding_overrides_the_environment(Path(d))
    with tempfile.TemporaryDirectory() as d:
        test_the_whole_reply_is_kept_on_request(Path(d))
    test_log_option_keeps_a_judgement_out_of_the_run_log()
    test_calibration_logs_to_the_calibration_log()
    test_report_only_reads_the_model_from_the_verdict()
    test_mismatched_numbers_moves_only_the_arabic()
    test_calibration_skips_a_defect_with_nothing_to_break()
    test_an_absent_bilingual_flag_means_bilingual()
    print('\nFAILS:', FAILS)
    sys.exit(1 if FAILS else 0)
