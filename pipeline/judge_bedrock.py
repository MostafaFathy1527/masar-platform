#!/usr/bin/env python3
"""A second judge: score a lesson against the rubric with a model on Amazon Bedrock.

This exists to answer one question the project could not answer before: how much
of a lesson's rubric score belongs to the lesson, and how much to the particular
model that scored it. The original verdicts were produced by one hosted model in
one session. Running the same rubric, on the same lesson, through a different
model in a fresh context gives a second opinion that can be compared criterion
by criterion (see compare_verdicts.py).

What this script deliberately does NOT do:

- It does not decide pass or fail. The verdict it writes goes through
  `qa_gate.py` like any other; the thresholds stay in code.
- It does not see the generation prompt, the source note, or any earlier
  verdict. The prompt it sends is the judge prompt plus the rubric plus the
  lesson, nothing else.
- It does not let the model decide which criteria apply. Applicability is
  derived from the lesson's declared levels, exactly as the gate does it, and
  the model is told which criteria it must declare `not_scored`.
- It is not part of any request path. It is an offline, by-hand experiment, run
  from the command line with credentials that live outside the repository.

    python pipeline/judge_bedrock.py --lesson pipeline/out/lesson-sec-01/v1/lesson.json \
        --model <bedrock model id> --tag model-a

writes `verdict.<tag>.json` and `qa-report.<tag>.md` beside the lesson. Credentials
come from the standard AWS environment (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
/ AWS_DEFAULT_REGION, or a profile). Nothing is read from the repository.

An open model that runs on your own hardware is judged the same way. Serve it behind
any OpenAI-compatible endpoint (llama.cpp's server, vLLM and Ollama all speak it) and
pass the endpoint instead of a region:

    python pipeline/judge_bedrock.py --lesson pipeline/out/lesson-sec-01/v1/lesson.json \
        --endpoint http://localhost:8080/v1 --model <served model name> --tag model-b

The prompt, the parsing and the gate are identical; only the transport differs. If the
server wants a key, it is read from JUDGE_API_KEY in the environment, never from a file.
With JUDGE_KEEP_OUTPUT set, the model's whole reply, any reasoning included, is kept
beside the verdict as `verdict.<tag>.output.txt`.

Decoding defaults to temperature 0 and a 4,000-token reply. Kimi K3 refuses a fixed
temperature and runs at its own default; the open seat runs at its own 0.6. A reasoning model's thinking counts against that budget and can loop when decoding is
greedy, so `--temperature` and `--max-tokens` set a seat's own values (panel.py passes
them for the open seat). Without them a served model reads JUDGE_TEMPERATURE and
JUDGE_MAX_TOKENS from the environment, and without those the defaults apply. The
verdict records the temperature actually used.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qa_gate  # noqa: E402

HERE = Path(__file__).resolve().parent
RUBRIC = HERE / 'rubric.md'
JUDGE_PROMPT = HERE / 'prompts' / 'judge.md'

SCORE_LABEL = qa_gate.SCORE_LABEL


def applicability(levels: set[str]) -> tuple[list[str], list[str], list[str]]:
    """Split the criteria the way the gate will: fully scorable, scorable only
    from substitute evidence (note required), and unscorable (must be declared)."""
    scorable, substitute, unscorable = [], [], []
    for c in qa_gate.CRITERIA:
        if qa_gate.block_available(c, levels):
            scorable.append(c)
        elif c in qa_gate.UNSCORABLE_WITHOUT_BLOCK:
            unscorable.append(c)
        else:
            substitute.append(c)
    return scorable, substitute, unscorable


def item_refs(lesson: dict) -> list[str]:
    return [str((b.get('payload') or {}).get('itemRef', ''))
            for bs in (lesson.get('blocks') or {}).values() for b in bs or []
            if b.get('type') == 'knowledge_check']


def referenced_items(lesson: dict, lesson_dir: Path) -> tuple[list[dict], list[str]]:
    """The items the lesson's knowledge checks point at, from items.json beside it.

    A knowledge_check block carries only an itemRef. Until 14 October 2026 the
    judge was shown the lesson alone, so every knowledge-check score was given
    without the question, the options or the feedback: one judge said so, and
    another criticised distractors it had never seen. Returns the items found
    and the refs that could not be resolved."""
    path = lesson_dir / 'items.json'
    bank = json.loads(path.read_text(encoding='utf-8')).get('items', []) if path.exists() else []
    return items_in_bank(lesson, bank)


def items_in_bank(lesson: dict, bank: list) -> tuple[list[dict], list[str]]:
    """referenced_items without the file: judge_dataset.py builds its records from banks
    that do not sit beside the lesson, and must show exactly what a judge would see."""
    refs = item_refs(lesson)
    by_key = {i.get('key'): i for i in bank if isinstance(i, dict)}
    return [by_key[r] for r in refs if r in by_key], [r for r in refs if r not in by_key]


def build_prompt(lesson: dict, levels: set[str], items: list[dict] | None = None) -> str:
    """The exact text the judge sees. Rubric + judge prompt + lesson + the items
    its knowledge checks reference, and the applicability rules spelled out so
    the model cannot excuse itself."""
    scorable, substitute, unscorable = applicability(levels)
    level_text = ', '.join(sorted(levels))
    # Absent means bilingual, as in the schema (lib/schema/lesson.ts defaults it to
    # true); reading absent as false told the judge to excuse pasted English.
    bilingual = lesson.get('bilingual', True)
    rules = [
        f'The lesson declares levels: {level_text}.',
        (f'The lesson declares bilingual: {str(bilingual).lower()}. '
         + ('Score Arabic quality against that claim.' if bilingual else
            'It is English-only by its own declaration: the rubric says this is NOT penalised on '
            'bilingual quality, and Arabic fields that mirror the English are expected, not a fault.')),
        'Score these criteria with an integer 1-5: ' + ', '.join(scorable) + '.',
    ]
    if substitute:
        rules.append(
            'These criteria describe a block type the lesson cannot contain at its levels, '
            'but the quality they ask about can appear in prose or job tips. Score each of '
            'them ONLY if you can point at the evidence you scored, and put that evidence in '
            '"notes" under the criterion name; otherwise put the criterion in "not_scored" '
            'with a reason: ' + ', '.join(substitute) + '.'
        )
    if unscorable:
        rules.append(
            'These criteria have no evidence of any kind at these levels. Do NOT score them. '
            'Put each in "not_scored" with a one-sentence reason: ' + ', '.join(unscorable) + '.'
        )
    rules.append(
        'Return ONE JSON object and nothing else: keys "lesson" (the slug), "scores" '
        '(criterion -> integer 1-5), "notes" (criterion -> string; required for every '
        'criterion scored below 4 and for every substitute-evidence criterion you scored), '
        '"not_scored" (criterion -> reason), and "verdict_notes" (two or three sentences). '
        'No markdown fences, no prose before or after the JSON.'
    )
    parts = [
        JUDGE_PROMPT.read_text(encoding='utf-8'),
        '---\n\n# The rubric\n\n' + RUBRIC.read_text(encoding='utf-8'),
        '---\n\n# Applicability (derived from the lesson, not negotiable)\n\n' + '\n'.join(f'- {r}' for r in rules),
        '---\n\n# The lesson\n\n```json\n' + json.dumps(lesson, ensure_ascii=False, indent=1) + '\n```',
    ]
    if items:
        parts.append(
            '---\n\n# The items its knowledge checks reference\n\nEach knowledge_check block above '
            'shows only an itemRef. These are those items, in full: stem, options, which option is '
            'correct, the feedback on every option, and the rationale. Score knowledge_check on '
            'them.\n\n```json\n' + json.dumps(items, ensure_ascii=False, indent=1) + '\n```')
    return '\n\n'.join(parts)


def rubric_example() -> dict:
    """The example verdict printed in the rubric's output section. An example written
    with placeholders instead of values is not JSON, has nothing to copy, and so turns
    the copy check off rather than breaking every judgement."""
    text = RUBRIC.read_text(encoding='utf-8')
    m = re.search(r'## Output the judge must return.*?```json\s*(\{.*?\})\s*```', text, re.S)
    if not m:
        return {}
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError:
        return {}


def copies_rubric_example(verdict: dict) -> bool:
    """True when the verdict is the rubric's example handed back: the scores, the notes and
    the closing note all match it, or the notes match, the closing note matches but for its
    numbers, and at most one score differs. A judge that hands the example back has not scored
    the lesson in front of it (what-failed entry 19). Scores alone can match by chance; the
    example's words with its scores all but unchanged cannot. A verdict with scores of its own
    and a borrowed note is still partly a reading, so it is not refused here."""
    example = rubric_example()
    if not example:
        return False
    if all(verdict.get(k) == example.get(k) for k in ('scores', 'notes', 'verdict_notes')):
        return True
    def numbers_aside(text) -> str:
        return re.sub(r'\d+(?:\.\d+)?', '#', str(text or ''))
    scores, theirs = verdict.get('scores') or {}, example.get('scores') or {}
    changed = sum(1 for k in theirs if scores.get(k) != theirs[k])
    return (verdict.get('notes') == example.get('notes')
            and numbers_aside(verdict.get('verdict_notes')) == numbers_aside(example.get('verdict_notes'))
            and changed <= 1)


def extract_json(text: str) -> dict:
    """Models sometimes wrap JSON in fences or a sentence, and a reasoning model may
    think aloud first. Drop any think block, then take the outermost object."""
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.S).strip()
    fenced = re.search(r'```(?:json)?\s*(\{.*\})\s*```', text, re.S)
    if fenced:
        text = fenced.group(1)
    start, end = text.find('{'), text.rfind('}')
    if start < 0 or end < 0:
        raise ValueError('no JSON object in the model output')
    return json.loads(text[start:end + 1])


def call_bedrock(prompt: str, model_id: str, region: str, max_tokens: int | None = None,
                 temperature: float | None = None) -> tuple[str, dict]:
    import boto3  # imported here so the tests never need it

    if max_tokens is None:
        max_tokens = 4000
    if temperature is None:
        temperature = 0
    client = boto3.client('bedrock-runtime', region_name=region)
    messages = [{'role': 'user', 'content': [{'text': prompt}]}]
    used: float | None = temperature
    try:
        resp = client.converse(modelId=model_id, messages=messages,
                               inferenceConfig={'maxTokens': max_tokens, 'temperature': temperature})
    except client.exceptions.ValidationException as e:
        # Some models refuse the field outright; they run at their own default, and the
        # verdict records that rather than claiming the temperature asked for.
        if 'temperature' not in str(e):
            raise
        used = None
        resp = client.converse(modelId=model_id, messages=messages,
                               inferenceConfig={'maxTokens': max_tokens})
    text = ''.join(part.get('text', '') for part in resp['output']['message']['content'])
    usage = dict(resp.get('usage', {}))
    usage['temperature'] = used
    return text, usage


def call_openai_compatible(prompt: str, model: str, endpoint: str, max_tokens: int | None = None,
                           timeout: float = 1800, temperature: float | None = None) -> tuple[str, dict]:
    """The same judgement from a model served on your own hardware. The timeout is
    long on purpose: an open model on a CPU node can take minutes per lesson.

    JUDGE_MAX_TOKENS and JUDGE_TEMPERATURE (environment) exist for reasoning models,
    whose thinking counts against the token budget and can loop when decoding is greedy;
    an explicit max_tokens or temperature (the --max-tokens and --temperature options)
    overrides them. The defaults are the ones every other judge runs with, and the
    verdict records the temperature actually used."""
    if max_tokens is None:
        max_tokens = int(os.environ.get('JUDGE_MAX_TOKENS', '4000'))
    if temperature is None:
        temperature = float(os.environ.get('JUDGE_TEMPERATURE', '0'))
    body = json.dumps({
        'model': model,
        'messages': [{'role': 'user', 'content': prompt}],
        'max_tokens': max_tokens,
        'temperature': temperature,
    }).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    key = os.environ.get('JUDGE_API_KEY')
    if key:
        headers['Authorization'] = f'Bearer {key}'
    req = urllib.request.Request(endpoint.rstrip('/') + '/chat/completions', data=body,
                                 headers=headers, method='POST')
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    text = data['choices'][0]['message'].get('content') or ''
    raw_usage = data.get('usage') or {}
    usage = {'inputTokens': raw_usage.get('prompt_tokens'),
             'outputTokens': raw_usage.get('completion_tokens'),
             'temperature': temperature}
    return text, usage


def make_verdict(raw: dict, lesson: dict, model_id: str, usage: dict,
                 provider: str = 'amazon-bedrock') -> dict:
    """Attach the provenance the gate and the report expect. The caveat is
    honest about what this judge is and is not."""
    verdict = {
        'lesson': raw.get('lesson') or lesson.get('slug', '(unnamed)'),
        'judge': {
            'label': SCORE_LABEL + '.',
            'provider': provider,
            'model_id': model_id,
            'saw_generation_prompt': False,
            'saw_source_note': False,
            'saw_previous_verdicts': False,
            'authored_lesson': False,
            'temperature': usage.get('temperature', 0),
            'scored_at': datetime.now(timezone.utc).isoformat(),
            'usage': {k: usage.get(k) for k in ('inputTokens', 'outputTokens') if k in usage},
            'independence_caveat': (
                'This judge is a different model family and a fresh context: it saw only the '
                'judge prompt, the rubric and the lesson. It did not direct the project and '
                'did not author anything in it. It is still a language model scoring a '
                "language model's output, so the label applies: not human QA."
            ),
        },
        'scores': raw.get('scores', {}),
        'not_scored': raw.get('not_scored', {}),
        'notes': raw.get('notes', {}),
        'verdict_notes': raw.get('verdict_notes', ''),
    }
    return verdict


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass

    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--lesson', type=Path, required=True)
    ap.add_argument('--model', required=True,
                    help='Bedrock model id (or inference profile id), or the served model name '
                         'when --endpoint is given')
    ap.add_argument('--tag', required=True, help='short name used in the output file names')
    ap.add_argument('--region', default='us-east-1')
    ap.add_argument('--endpoint',
                    help='an OpenAI-compatible base URL (e.g. http://localhost:8080/v1) '
                         'instead of Bedrock')
    ap.add_argument('--temperature', type=float,
                    help='decoding temperature for this judge; default 0 (a served model: '
                         'JUDGE_TEMPERATURE, then 0)')
    ap.add_argument('--max-tokens', type=int, dest='max_tokens',
                    help='reply budget, reasoning included; default 4000 (a served model: '
                         'JUDGE_MAX_TOKENS, then 4000)')
    ap.add_argument('--dry-run', action='store_true',
                    help='print the prompt and stop; no model call, nothing written')
    ap.add_argument('--log', type=Path,
                    help='the log the gate appends this verdict to (default: the run log; '
                         'calibrate_judges.py passes the calibration log)')
    args = ap.parse_args(argv)

    lesson = json.loads(args.lesson.read_text(encoding='utf-8'))
    levels = {str(x).upper() for x in lesson.get('levels', [])}
    if not levels or not levels <= {'L1', 'L2', 'L3'}:
        print(f'error: lesson declares no usable levels: {sorted(levels) or "[]"}', file=sys.stderr)
        return 2

    items, missing = referenced_items(lesson, args.lesson.parent)
    if missing:
        # A score for a question the judge cannot see is an invented score.
        print(f'error: knowledge checks reference items not found beside the lesson: '
              f'{", ".join(missing)}', file=sys.stderr)
        return 2
    prompt = build_prompt(lesson, levels, items)
    if args.dry_run:
        print(prompt)
        return 0

    if args.endpoint:
        text, usage = call_openai_compatible(prompt, args.model, args.endpoint,
                                             max_tokens=args.max_tokens, temperature=args.temperature)
        provider = 'openai-compatible'
    else:
        text, usage = call_bedrock(prompt, args.model, args.region,
                                   max_tokens=args.max_tokens, temperature=args.temperature)
        provider = 'amazon-bedrock'
    if os.environ.get('JUDGE_KEEP_OUTPUT'):
        # A reasoning judge's trace is the evidence of whether it read the lesson; the
        # verdict alone keeps only the JSON it ended with.
        (args.lesson.parent / f'verdict.{args.tag}.output.txt').write_text(text, encoding='utf-8')
    try:
        raw = extract_json(text)
    except (ValueError, json.JSONDecodeError) as e:
        print(f'error: could not parse the model output as JSON: {e}', file=sys.stderr)
        (args.lesson.parent / f'verdict.{args.tag}.raw.txt').write_text(text, encoding='utf-8')
        return 2
    if copies_rubric_example(raw):
        print("error: the judge returned the rubric's example verdict unchanged, not a score "
              'for this lesson', file=sys.stderr)
        (args.lesson.parent / f'verdict.{args.tag}.raw.txt').write_text(text, encoding='utf-8')
        return 2

    verdict = make_verdict(raw, lesson, args.model, usage, provider)
    out = args.lesson.parent / f'verdict.{args.tag}.json'
    out.write_text(json.dumps(verdict, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'wrote {out}')

    # Run it through the gate exactly as any verdict is run. The gate decides.
    try:
        loaded = qa_gate.load_verdict(out, levels)
    except qa_gate.GateError as e:
        print(f'gate refused the verdict: {e}', file=sys.stderr)
        return 2
    result = qa_gate.evaluate(loaded)
    report_path = args.lesson.parent / f'qa-report.{args.tag}.md'
    report_path.write_text(qa_gate.report(result), encoding='utf-8')
    try:
        qa_gate.append_run(result, out, args.log)
    except qa_gate.GateError as e:
        print(f'gate could not log the verdict: {e}', file=sys.stderr)
        return 2
    print(f'{"PASS" if result["passed"] else "FAIL"} mean {result["mean"]} over '
          f'{len(result["scores"])} criteria; report {report_path}')
    return 0 if result['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
