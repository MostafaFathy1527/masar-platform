#!/usr/bin/env python3
"""One command from a source note to a judged draft, with no hand in between.

This is the loop in CONTRACT.md, run end to end:

    source note -> generate -> validate.py + item check -> concept_log.py
                -> panel of judges (judge_bedrock.py, qa_gate.py, panel.py)
                -> one retry with the findings appended -> stop for a human

Every gate is the existing gate, called unchanged; this file only orders them and
keeps the record. Cheapest first: there is no point paying three judges to score
a document that does not parse.

The generator must come from a model family that sits on none of the judge
seats. A model grading its own family's work is the conflict the panel exists to
avoid, so the run refuses to start rather than warn.

Outputs, under --out:
    v1/  lesson.json  items.json  needs-verification.md  generation.json
         gates.md     verdict.<tag>.json  qa-report.<tag>.md  panel-report.md
    v2/  the same, only if v1 failed a gate (never an in-place edit of v1)
    run.json        machine record of every step: result, seconds, tokens
    run-report.md   the same, for a person

The lesson is a DRAFT whatever the outcome. The pipeline may not publish.

    python pipeline/run_lesson.py \\
        --source pipeline/sources/ops-01-writing-a-shift-handover.md \\
        --objective OPS-01 --out pipeline/out/lesson-ops-01 \\
        --denylist .local/denylist.txt
    python pipeline/run_lesson.py ... --dry-run   # print the generation prompt only

Exit codes: 0 panel PASS, 1 stopped for a human, 2 could not run.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

sys.path.insert(0, str(Path(__file__).resolve().parent))
import concept_log  # noqa: E402
import judge_bedrock  # noqa: E402
import panel  # noqa: E402
import validate  # noqa: E402

PIPELINE = Path('pipeline')
SOURCES = PIPELINE / 'sources'
REFERENCE_LESSON = Path('content/courses/rcm-foundations/lessons/04-anatomy-of-a-claim.json')
DEFAULT_GENERATOR = 'openai.gpt-oss-120b-1:0'
MAX_TOKENS = 16000
OBJECTIVE_RE = re.compile(r'^[A-Z]{2,4}-\d{2}$')
GEO_PREFIXES = {'us', 'eu', 'apac', 'global', 'us-gov', 'jp', 'au', 'ca'}

ModelCall = Callable[[str, str, str], tuple[str, dict]]


class RunError(Exception):
    pass


# --------------------------------------------------------------- independence


def family(model_id: str) -> str:
    """'us.meta.llama3-3-70b-instruct-v1:0' -> 'meta'. Cross-region inference
    profiles carry a geography prefix that says nothing about who made the model."""
    parts = model_id.split('.')
    if len(parts) > 1 and parts[0] in GEO_PREFIXES:
        parts = parts[1:]
    return parts[0]


def check_independence(generator: str, judges=panel.PANEL_MODELS) -> None:
    taken = {family(m) for m, _ in judges}
    if family(generator) in taken:
        raise RunError(
            f'the generator ({generator}) is from the "{family(generator)}" family, which also '
            f'sits on the judge panel. Pick a generator from outside: {sorted(taken)}.')


# -------------------------------------------------------------------- prompts


def _after_rule(text: str) -> str:
    """Prompt files carry a note for the human above a '---' line; the model
    gets what is below it."""
    return text.split('\n---\n', 1)[1].strip() if '\n---\n' in text else text.strip()


ITEM_RULES = """\
items.json is an item bank: {"courseSlug": str, "note": str, "items": [item, ...]}.
Each item: key, objectiveId, type ("MCQ_SINGLE" or "MULTI_SELECT"), bloom ("RECALL",
"APPLY" or "ANALYZE"), formative, stemAr, stemEn, rationaleAr, rationaleEn, options.
- Every knowledge_check block's payload.itemRef must equal the key of one item here.
- Knowledge-check items are formative: key "<OBJECTIVE>-KC-NN" and formative true.
- MCQ_SINGLE has exactly one correct option. MULTI_SELECT has at least two, never all.
- 2 to 6 options. Every option has textAr, textEn, isCorrect, feedbackAr, feedbackEn, and
  the feedback names the misconception the option represents.
- Vary the authored position of the correct option across items."""

OUTPUT_SHAPE = """\
Return ONE JSON object and nothing else, with exactly these keys:
{
  "lesson": { ...the lesson document, valid against the schema above... },
  "items":  { ...the item bank for this lesson's knowledge checks... },
  "needsVerification": [ {"sentence": "...", "why": "..."} ]
}
needsVerification lists every sentence you wrote that the source note does not carry.
An empty list is a claim that every sentence is sourced; make it only if it is true."""


def build_generation_prompt(source: Path, objective: str, levels: list[str], slug: str) -> str:
    generate = _after_rule((PIPELINE / 'prompts/generate.md').read_text(encoding='utf-8'))
    parts = [
        generate,
        '## The contract\n\n' + (PIPELINE / 'CONTRACT.md').read_text(encoding='utf-8'),
        '## Schema (content/schema/lesson.schema.json)\n\n'
        + Path(validate.SCHEMA_PATH).read_text(encoding='utf-8'),
        f'## Reference lesson, for shape and tone only ({REFERENCE_LESSON.name})\n\n'
        + REFERENCE_LESSON.read_text(encoding='utf-8'),
        '## Concept log (pipeline/memory/concept-log.json)\n\n'
        + concept_log.LOG_PATH.read_text(encoding='utf-8'),
        '## Items\n\n' + ITEM_RULES,
        f'## Source note ({source.name}): the ONLY permitted source of fact\n\n'
        + source.read_text(encoding='utf-8'),
        '## This run\n\n'
        f'- objective code: {objective} (the lesson declares exactly this objective)\n'
        f'- levels: {", ".join(levels)}\n'
        f'- slug: {slug}\n'
        '- the lesson is new: its conceptsIntroduced must not repeat any key in the concept log\n'
        '- every definition_card termEn, lowercased with each run of characters other than a-z '
        'and 0-9 replaced by one underscore, must appear in conceptsIntroduced exactly as that '
        'key: "Fact / Guess" is fact_guess. Use plain ASCII hyphens in terms.\n',
        OUTPUT_SHAPE,
    ]
    return '\n\n'.join(parts)


def build_revision_prompt(base_prompt: str, previous: dict, findings: str) -> str:
    revise = _after_rule((PIPELINE / 'prompts/revise.md').read_text(encoding='utf-8'))
    return '\n\n'.join([
        revise,
        '## The previous draft\n\n' + json.dumps(previous, ensure_ascii=False, indent=2),
        '## What the gate reported\n\n' + findings,
        '## The inputs the generator had, unchanged\n\n' + base_prompt,
        'Produce the next version in the same output shape. If you disagree with a finding, '
        'comply anyway and add a top-level "notes" string saying so.',
    ])


# ---------------------------------------------------------------------- gates


def check_items(lesson: dict, bank: dict, name: str) -> list[str]:
    """The item rules lib/schema/item.ts enforces, with the objective prefix
    opened up the same way validate.py's was. Items have no Python gate of their
    own, so without this a generated bank would first be checked by the site."""
    out: list[str] = []
    items = bank.get('items') if isinstance(bank, dict) else None
    if not isinstance(items, list) or not items:
        return [f'{name}: no items']
    keys: dict[str, dict] = {}
    for i, it in enumerate(items):
        where = f'{name}: items[{i}]'
        if not isinstance(it, dict):
            out.append(f'{where}: not an object')
            continue
        key, obj = str(it.get('key', '')), str(it.get('objectiveId', ''))
        if key in keys:
            out.append(f'{where}: duplicate key "{key}"')
        keys[key] = it
        if not OBJECTIVE_RE.match(obj):
            out.append(f'{where}: objectiveId "{obj}" is not shaped like ABC-01')
        if not key.startswith(obj + '-'):
            out.append(f'{where}: key "{key}" does not start with its objective {obj}')
        if ('-KC-' in key) != (it.get('formative') is True):
            out.append(f'{where}: key "{key}" and formative={it.get("formative")} disagree')
        if it.get('type') not in ('MCQ_SINGLE', 'MULTI_SELECT'):
            out.append(f'{where}: type "{it.get("type")}"')
        if it.get('bloom') not in ('RECALL', 'APPLY', 'ANALYZE'):
            out.append(f'{where}: bloom "{it.get("bloom")}"')
        for f, n in (('stemAr', 1), ('stemEn', 1), ('rationaleAr', 10), ('rationaleEn', 10)):
            if len(str(it.get(f, '')).strip()) < n:
                out.append(f'{where}: {f} missing or too short')
        opts = it.get('options') or []
        if not 2 <= len(opts) <= 6:
            out.append(f'{where}: {len(opts)} options; 2 to 6 allowed')
        correct = sum(1 for o in opts if isinstance(o, dict) and o.get('isCorrect') is True)
        if it.get('type') == 'MCQ_SINGLE' and correct != 1:
            out.append(f'{where}: MCQ_SINGLE needs exactly one correct option, found {correct}')
        if it.get('type') == 'MULTI_SELECT' and (correct < 2 or correct == len(opts)):
            out.append(f'{where}: MULTI_SELECT needs at least two correct options and not all')
        for j, o in enumerate(opts):
            if not isinstance(o, dict):
                out.append(f'{where}.options[{j}]: not an object')
                continue
            for f in ('textAr', 'textEn'):
                if not str(o.get(f, '')).strip():
                    out.append(f'{where}.options[{j}]: {f} missing')
            for f in ('feedbackAr', 'feedbackEn'):
                if len(str(o.get(f, '')).strip()) < 4:
                    out.append(f'{where}.options[{j}]: {f} missing; every option names its misconception')
    for level in ('l1', 'l2', 'l3'):
        for b in (lesson.get('blocks') or {}).get(level) or []:
            if b.get('type') == 'knowledge_check':
                ref = str((b.get('payload') or {}).get('itemRef', ''))
                if ref not in keys:
                    out.append(f'{name}: block {b.get("id")} references item "{ref}", which the bank lacks')
                elif keys[ref].get('objectiveId') != b.get('objectiveId'):
                    out.append(f'{name}: block {b.get("id")} and item {ref} serve different objectives')
    return out


ACTING = set(validate.ACTING_BLOCKS)


def _count(doc: dict, types: set[str]) -> int:
    return sum(1 for bs in (doc.get('blocks') or {}).values() for b in bs or [] if b.get('type') in types)


def check_revision(before: dict, after: dict) -> list[str]:
    """A retry may fix what was reported. It may not pass by deleting what the
    gate examines.

    Found on the first real run: v1 failed concept_log because two definition-card
    terms did not match their declared keys. The repair was to rename two keys.
    v2 instead deleted all three definition cards and emptied conceptsIntroduced,
    so the check had nothing left to check, and three judges then passed it. Each
    gate was satisfied. None of them could see the difference between versions,
    so this compares them."""
    out = []
    pairs = (
        ('conceptsIntroduced', len(before.get('conceptsIntroduced') or []),
         len(after.get('conceptsIntroduced') or [])),
        ('definition cards', _count(before, {'definition_card'}), _count(after, {'definition_card'})),
        ('acting blocks', _count(before, ACTING), _count(after, ACTING)),
        ('items', len(before.get('_items') or []), len(after.get('_items') or [])),
    )
    for what, b, a in pairs:
        if a < b:
            out.append(f'the revision has fewer {what} than the version it revises ({b} -> {a}). '
                       f'Fix what the gate reported; do not remove what it checks.')
    return out


def mechanical_gates(lesson_path: Path, items_path: Path, denylist: list,
                     previous: dict | None = None) -> dict:
    """validate.py, the item check and concept_log.py, in that order, and on a
    retry the comparison with the version it revises. Returns the findings per
    gate; an empty list is a pass."""
    name = str(lesson_path).replace('\\', '/')
    schema = json.loads(Path(validate.SCHEMA_PATH).read_text(encoding='utf-8'))
    try:
        doc = json.loads(lesson_path.read_text(encoding='utf-8'))
    except json.JSONDecodeError as e:
        return {'validate': [f'{name}: not JSON: {e}'], 'items': [], 'concept_log': []}
    structural = validate.check_structure(doc, schema, name)
    found = structural + ([] if structural else validate.check_semantics(doc, name))
    found += validate.check_content(doc, name, denylist)
    results = {'validate': [str(f) for f in found]}

    try:
        bank = json.loads(items_path.read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError) as e:
        results['items'] = [f'{items_path}: unreadable: {e}']
    else:
        item_findings = check_items(doc, bank, str(items_path).replace('\\', '/'))
        item_findings += [str(f) for f in validate.check_content(bank, str(items_path), denylist)]
        results['items'] = item_findings

    # The draft is checked as one more lesson at the end of the course. Only the
    # findings it adds count: the course's own state is not this run's to fix.
    course = concept_log.load_lessons()
    before = {str(f) for f in concept_log.check(course)}
    after = [str(f) for f in concept_log.check(course + [(lesson_path, doc)])]
    results['concept_log'] = [f for f in after if f not in before]

    if previous is not None:
        current = dict(doc)
        try:
            current['_items'] = json.loads(items_path.read_text(encoding='utf-8')).get('items')
        except (OSError, json.JSONDecodeError, AttributeError):
            current['_items'] = []
        results['revision'] = check_revision(previous, current)
    return results


# ------------------------------------------------------------------------ run


def next_version(out: Path) -> int:
    existing = [int(p.name[1:]) for p in out.glob('v*') if p.is_dir() and p.name[1:].isdigit()]
    return max(existing, default=0) + 1


def write_draft(vdir: Path, raw: dict, model: str, usage: dict, seconds: float, prompt: str) -> None:
    lesson, items = raw.get('lesson'), raw.get('items')
    if not isinstance(lesson, dict) or not isinstance(items, dict):
        raise RunError('the generator did not return both "lesson" and "items" objects')
    vdir.mkdir(parents=True, exist_ok=False)
    dump = lambda o: json.dumps(o, ensure_ascii=False, indent=2) + '\n'  # noqa: E731
    (vdir / 'lesson.json').write_text(dump(lesson), encoding='utf-8')
    (vdir / 'items.json').write_text(dump(items), encoding='utf-8')
    nv = [n for n in (raw.get('needsVerification') or []) if isinstance(n, dict)]
    lines = ['# Needs verification', '',
             'Sentences the generator wrote that it says the source note does not carry. '
             'A human confirms or cuts each one before anything is published.', '']
    if nv:
        lines += [f'- **{n.get("sentence", "")}** ({n.get("why", "")})' for n in nv]
    else:
        lines.append("_None declared. That is the generator's claim, not a check; a reviewer "
                     'still reads the lesson against the source._')
    (vdir / 'needs-verification.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    if raw.get('notes'):
        (vdir / 'notes.md').write_text(str(raw['notes']) + '\n', encoding='utf-8')
    (vdir / 'generation.json').write_text(dump({
        'model_id': model, 'temperature': 0, 'usage': usage, 'seconds': round(seconds, 1),
        'prompt_chars': len(prompt), 'at': datetime.now(timezone.utc).isoformat(),
        'needs_verification': len(nv),
    }), encoding='utf-8')


def gates_markdown(results: dict) -> str:
    lines = ['# Mechanical gates', '']
    for gate, found in results.items():
        lines.append(f'## {gate}: {"PASS" if not found else f"FAIL ({len(found)})"}')
        lines += [''] + [f'- {f}' for f in found] + ['']
    return '\n'.join(lines)


def run(source: Path, objective: str, out: Path, *, levels: list[str], slug: str,
        generator: str, region: str, denylist: list, call: ModelCall,
        judge: Callable[[Path], None]) -> dict:
    check_independence(generator)
    record: dict = {'source': str(source).replace('\\', '/'), 'objective': objective,
                    'generator': generator, 'judges': [m for m, _ in panel.PANEL_MODELS],
                    'started': datetime.now(timezone.utc).isoformat(), 'steps': []}
    base_prompt = build_generation_prompt(source, objective, levels, slug)
    prompt, retried = base_prompt, False
    previous_doc: dict | None = None

    def step(version: str, name: str, result: str, t0: float, **extra) -> None:
        record['steps'].append({'version': version, 'step': name, 'result': result,
                                'seconds': round(time.monotonic() - t0, 1), **extra})
        print(f'  {version} {name:<9} {result}')

    while True:
        v = next_version(out)
        vdir = out / f'v{v}'
        tag = f'v{v}'

        t0 = time.monotonic()
        text, usage = call(prompt, generator, region)
        try:
            raw = judge_bedrock.extract_json(text)
            write_draft(vdir, raw, generator, usage, time.monotonic() - t0, prompt)
        except (ValueError, json.JSONDecodeError, RunError) as e:
            vdir.mkdir(parents=True, exist_ok=True)
            (vdir / 'generation.raw.txt').write_text(text, encoding='utf-8')
            step(tag, 'generate', f'unusable output: {e}', t0, usage=usage)
            record['outcome'] = 'STOPPED: the generator did not return a usable draft'
            break
        step(tag, 'generate', 'ok', t0, usage=usage,
             needs_verification=len(raw.get('needsVerification') or []))

        t0 = time.monotonic()
        gates = mechanical_gates(vdir / 'lesson.json', vdir / 'items.json', denylist, previous_doc)
        (vdir / 'gates.md').write_text(gates_markdown(gates), encoding='utf-8')
        failed = {g: f for g, f in gates.items() if f}
        step(tag, 'gates', 'PASS' if not failed else
             'FAIL: ' + ', '.join(f'{g} ({len(f)})' for g, f in failed.items()), t0)

        if not failed:
            t0 = time.monotonic()
            judge(vdir / 'lesson.json')
            lesson = json.loads((vdir / 'lesson.json').read_text(encoding='utf-8'))
            lv = {str(x).upper() for x in lesson.get('levels', [])}
            try:
                entries, superseded = panel.collect(vdir, lv)
                decision = panel.decide(entries)
            except panel.PanelError as e:
                step(tag, 'panel', f'could not decide: {e}', t0)
                record['outcome'] = 'STOPPED: the panel could not decide'
                break
            (vdir / 'panel-report.md').write_text(
                panel.report(lesson.get('slug', slug), entries, decision, superseded), encoding='utf-8')
            means = {e['model']: e['result']['mean'] for e in entries}
            step(tag, 'panel', decision['decision'], t0, means=means, split=decision['split'])
            if decision['decision'] == 'PASS':
                record['outcome'] = f'PANEL PASS at v{v}: a draft for human review'
                break
            if decision['decision'] == 'NEEDS HUMAN':
                record['outcome'] = f'NEEDS HUMAN at v{v}: ' + '; '.join(decision['reasons'])
                break
            findings = '\n\n'.join(p.read_text(encoding='utf-8')
                                   for p in sorted(vdir.glob('qa-report.*.md')))
        else:
            findings = gates_markdown(gates)

        if retried:
            record['outcome'] = f'STOPPED after the one retry: v{v} still fails; a human decides'
            break
        retried = True
        previous = {'lesson': json.loads((vdir / 'lesson.json').read_text(encoding='utf-8')),
                    'items': json.loads((vdir / 'items.json').read_text(encoding='utf-8'))}
        prompt = build_revision_prompt(base_prompt, previous, findings)
        previous_doc = dict(previous['lesson'], _items=(previous['items'] or {}).get('items'))

    record['finished'] = datetime.now(timezone.utc).isoformat()
    out.mkdir(parents=True, exist_ok=True)
    (out / 'run.json').write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (out / 'run-report.md').write_text(run_markdown(record), encoding='utf-8')
    return record


def run_markdown(record: dict) -> str:
    gen = [s for s in record['steps'] if s['step'] == 'generate']
    tokens_in = sum((s.get('usage') or {}).get('inputTokens', 0) for s in gen)
    tokens_out = sum((s.get('usage') or {}).get('outputTokens', 0) for s in gen)
    lines = [
        f'# Pipeline run: {record["objective"]}', '',
        f'**Outcome: {record.get("outcome", "unfinished")}**', '',
        f'- source: `{record["source"]}`',
        f'- generator: `{record["generator"]}`, from a model family outside the panel',
        '- judges: ' + ', '.join(f'`{j}`' for j in record['judges']),
        f'- started {record["started"]}, finished {record.get("finished", "")}',
        f'- generation tokens: {tokens_in} in, {tokens_out} out; judge usage is in each verdict', '',
        'No person edited anything between the source note and this report. The lesson is a '
        'DRAFT either way: the pipeline may not publish, and model judges agreeing is not a '
        'human review.', '',
        '| Version | Step | Result | Seconds |', '|---|---|---|---|',
    ]
    for s in record['steps']:
        lines.append(f'| {s["version"]} | {s["step"]} | {s["result"]} | {s["seconds"]} |')
    return '\n'.join(lines) + '\n'


def judge_with_panel(region: str) -> Callable[[Path], None]:
    def judge(lesson_path: Path) -> None:
        for model, tag in panel.PANEL_MODELS:
            judge_bedrock.main(['--lesson', str(lesson_path), '--model', model, '--tag', tag,
                                '--region', region])
    return judge


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--source', type=Path, required=True)
    ap.add_argument('--objective', required=True)
    ap.add_argument('--out', type=Path, required=True)
    ap.add_argument('--levels', default='L1,L2')
    ap.add_argument('--slug')
    ap.add_argument('--generator', default=DEFAULT_GENERATOR)
    ap.add_argument('--region', default='us-east-1')
    ap.add_argument('--denylist', type=Path)
    ap.add_argument('--dry-run', action='store_true', help='print the generation prompt and stop')
    args = ap.parse_args(argv)

    if SOURCES.resolve() not in args.source.resolve().parents:
        print(f'error: {args.source} is outside {SOURCES}/, the only permitted input', file=sys.stderr)
        return 2
    if not OBJECTIVE_RE.match(args.objective):
        print(f'error: objective "{args.objective}" is not shaped like ABC-01', file=sys.stderr)
        return 2
    levels = [x.strip().upper() for x in args.levels.split(',') if x.strip()]
    slug = args.slug or re.sub(r'^[a-z]+-\d+-', '', args.source.stem)
    try:
        check_independence(args.generator)
    except RunError as e:
        print(f'error: {e}', file=sys.stderr)
        return 2

    if args.dry_run:
        print(build_generation_prompt(args.source, args.objective, levels, slug))
        return 0
    if args.out.exists() and any(args.out.glob('v*')):
        print(f'error: {args.out} already holds a run; a new run gets a new directory', file=sys.stderr)
        return 2

    denylist = validate.load_denylist(args.denylist) if args.denylist else []

    def call(p: str, m: str, r: str) -> tuple[str, dict]:
        return judge_bedrock.call_bedrock(p, m, r, max_tokens=MAX_TOKENS)

    try:
        record = run(args.source, args.objective, args.out, levels=levels, slug=slug,
                     generator=args.generator, region=args.region, denylist=denylist,
                     call=call, judge=judge_with_panel(args.region))
    except RunError as e:
        print(f'error: {e}', file=sys.stderr)
        return 2
    print(record['outcome'])
    return 0 if record['outcome'].startswith('PANEL PASS') else 1


if __name__ == '__main__':
    sys.exit(main())
