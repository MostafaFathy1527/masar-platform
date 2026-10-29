#!/usr/bin/env python3
"""Can each judge tell a good lesson from one broken on purpose?

A judge's score is a reading from an instrument, and an instrument is calibrated
before its readings are trusted. This takes each sample, scores it as it is, and
scores copies broken in one specific way each. Every defect is one the rubric
names, and each targets one criterion:

  generic-feedback    knowledge_check        every option's feedback becomes
                                             "Correct." / "Not correct."
  absurd-distractors  knowledge_check        every wrong option becomes something
                                             no learner would pick
  pasted-english      bilingual_quality      every Arabic field holds the English
                                             text, while the lesson still claims
                                             to be bilingual
  reasonless-steps    worked_example         every step's reasoning becomes
                                             "Because it is the next step."
  empty-consequences  scenario_authenticity  every decision's consequence becomes
                                             the same empty sentence
  mismatched-numbers  bilingual_quality      every number in an Arabic field moves
                                             one up, so the Arabic no longer says
                                             what the English says; the English,
                                             the digit script and the width stay

A defect that has nothing to break in a lesson (mismatched-numbers on a lesson
whose Arabic carries no number) raises NotApplicable, and that copy is neither
written nor judged: an identical copy would read as a judge missing a defect
that was never planted.

A judge that sees the defect should score the target criterion at least two
points lower on the broken copy than on the real one, in the same run. A judge
that does not is not measuring that criterion, whatever its notes say.

Nothing here changes a threshold or the panel. It is the evidence for who sits
on it: a judge earns its seat by passing this (see PANEL_MODELS, the hosted
seats, and SERVED_JUDGES, the open seat served on rented hardware, in panel.py,
and failure entry 18).

    python pipeline/calibrate_judges.py                    # the three hosted seats
    python pipeline/calibrate_judges.py --models a,b       # candidate judges
    python pipeline/calibrate_judges.py --dry-run          # build the copies only
    python pipeline/calibrate_judges.py --endpoint http://localhost:8080/v1 --models <name>
                                                           # an open model you serve yourself,
                                                           # the served seat included
    python pipeline/calibrate_judges.py --cohere --models command-a-plus-05-2026
                                                           # a model on Cohere's own API,
                                                           # the API seat included

Writes pipeline/out/calibration/<date>/report.md and results.json. Rows for
judges not in the current run are kept from earlier runs on the same day. Each
verdict is logged to pipeline/memory/calibration-log.jsonl, not the run log.
--report-only finds each judge's verdicts by the model id they record, so a run
judged under an older tag rule still counts.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import judge_bedrock  # noqa: E402
import panel  # noqa: E402
import qa_gate  # noqa: E402

# Where the copies and their verdicts live. Every judgement made here is logged to
# the calibration log, never the run log: the copies are broken on purpose and carry
# the real lesson's slug, and the run log is what the public site reads.
CALIBRATION_ROOT = qa_gate.CALIBRATION_OUT

SAMPLES = (
    'pipeline/out/lesson-sec-01/v1',
    'pipeline/out/lesson-cs-01/v1',
    'pipeline/out/lesson-prv-01/v1',
    'pipeline/out/lesson-ops-01-r2/v2',
)
MIN_DROP = 2

ABSURD = [
    ('Order lunch for the team first.', 'اطلب الغداء للفريق أولًا.'),
    ('Restart your computer.', 'أعد تشغيل جهاز الكمبيوتر.'),
    ('Change the colour of the screen.', 'غيّر لون الشاشة.'),
    ('Go home early.', 'اذهب إلى البيت مبكرًا.'),
    ('Sing a song.', 'غنِّ أغنية.'),
]


def _blocks(lesson: dict):
    for bs in (lesson.get('blocks') or {}).values():
        for b in bs or []:
            yield b


def generic_feedback(lesson: dict, bank: dict) -> tuple[dict, dict]:
    bank = copy.deepcopy(bank)
    for item in bank['items']:
        for o in item['options']:
            o['feedbackEn'] = 'Correct.' if o['isCorrect'] else 'Not correct.'
            o['feedbackAr'] = 'صحيح.' if o['isCorrect'] else 'غير صحيح.'
    return lesson, bank


def absurd_distractors(lesson: dict, bank: dict) -> tuple[dict, dict]:
    bank = copy.deepcopy(bank)
    for item in bank['items']:
        wrong = [o for o in item['options'] if not o['isCorrect']]
        for o, (en, ar) in zip(wrong, ABSURD):
            o['textEn'], o['textAr'] = en, ar
            o['feedbackEn'], o['feedbackAr'] = 'Not correct.', 'غير صحيح.'
    return lesson, bank


def _paste_english(node):
    """Every xAr field gets its xEn sibling's value, recursively."""
    if isinstance(node, dict):
        for k in list(node):
            if k.endswith('Ar') and (k[:-2] + 'En') in node:
                node[k] = copy.deepcopy(node[k[:-2] + 'En'])
            else:
                _paste_english(node[k])
    elif isinstance(node, list):
        for v in node:
            _paste_english(v)


def pasted_english(lesson: dict, bank: dict) -> tuple[dict, dict]:
    lesson, bank = copy.deepcopy(lesson), copy.deepcopy(bank)
    lesson['bilingual'] = True
    _paste_english(lesson)
    _paste_english(bank)
    return lesson, bank


def reasonless_steps(lesson: dict, bank: dict) -> tuple[dict, dict]:
    lesson = copy.deepcopy(lesson)
    for b in _blocks(lesson):
        if b.get('type') == 'worked_example':
            for s in b['payload'].get('steps', []):
                s['whyEn'], s['whyAr'] = 'Because it is the next step.', 'لأنها الخطوة التالية.'
    return lesson, bank


def empty_consequences(lesson: dict, bank: dict) -> tuple[dict, dict]:
    lesson = copy.deepcopy(lesson)
    for b in _blocks(lesson):
        if b.get('type') == 'scenario':
            for d in b['payload'].get('decisions', []):
                d['consequenceEn'], d['consequenceAr'] = 'This choice has consequences.', 'لهذا الاختيار عواقب.'
    return lesson, bank


class NotApplicable(Exception):
    """The lesson has nothing this defect could break."""


# Western and Arabic-Indic runs are matched apart, so a run keeps its own script.
INDIC_DIGITS = ''.join(chr(0x0660 + i) for i in range(10))
NUMBER = re.compile(r'[0-9]+|[\u0660-\u0669]+')
ARABIC_LETTER = re.compile(r'[\u0621-\u064A]')
TO_INDIC = str.maketrans('0123456789', INDIC_DIGITS)
TO_WESTERN = str.maketrans(INDIC_DIGITS, '0123456789')


def _shift_number(m: re.Match) -> str:
    """One up, wrapping within the run's width: 1,260 -> 2,261 and 16:00 -> 17:01 keep
    their shape, and a wrap (9 -> 0) still differs, so no number survives unchanged."""
    run = m.group(0)
    indic = run[0] in INDIC_DIGITS
    value = (int(run.translate(TO_WESTERN)) + 1) % 10 ** len(run)
    out = str(value).zfill(len(run))
    return out.translate(TO_INDIC) if indic else out


def _shift_arabic(node, inside_ar: bool = False) -> int:
    """Shift the numbers in every string under an xAr key that is written in Arabic.
    An xAr field holding English (an English-only lesson mirrors its English there) is
    not Arabic, and changing it would plant a defect in the wrong language. Returns how
    many strings changed."""
    changed = 0
    if isinstance(node, dict):
        for k in list(node):
            v = node[k]
            if isinstance(v, str):
                if (inside_ar or k.endswith('Ar')) and ARABIC_LETTER.search(v) and NUMBER.search(v):
                    node[k] = NUMBER.sub(_shift_number, v)
                    changed += 1
            else:
                changed += _shift_arabic(v, inside_ar or k.endswith('Ar'))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            if isinstance(v, str):
                if inside_ar and ARABIC_LETTER.search(v) and NUMBER.search(v):
                    node[i] = NUMBER.sub(_shift_number, v)
                    changed += 1
            else:
                changed += _shift_arabic(v, inside_ar)
    return changed


def mismatched_numbers(lesson: dict, bank: dict) -> tuple[dict, dict]:
    if lesson.get('bilingual') is False:
        raise NotApplicable('the lesson declares itself English-only')
    lesson, bank = copy.deepcopy(lesson), copy.deepcopy(bank)
    if not _shift_arabic(lesson) + _shift_arabic(bank):
        raise NotApplicable('no Arabic field carries a number')
    return lesson, bank


# defect -> (criterion it targets, the mutation)
MUTANTS = {
    'generic-feedback': ('knowledge_check', generic_feedback),
    'absurd-distractors': ('knowledge_check', absurd_distractors),
    'pasted-english': ('bilingual_quality', pasted_english),
    'reasonless-steps': ('worked_example', reasonless_steps),
    'empty-consequences': ('scenario_authenticity', empty_consequences),
    'mismatched-numbers': ('bilingual_quality', mismatched_numbers),
}


def tag_for(model: str, served: bool = False) -> str:
    """A file-name-safe tag. Bedrock ids look like provider.model:version; a model served
    on your own hardware is named however its server names it (a Hugging Face id with a
    slash, a GGUF file name), so it is flattened whole rather than split on dots."""
    known = dict(panel.PANEL_MODELS)
    if model in known:
        return known[model]
    if served:
        return re.sub(r'[^a-z0-9]+', '-', model.lower()).strip('-')
    parts = model.split('.')
    return '-'.join(parts[1:] if len(parts) > 1 else parts).replace(':', '-').lower()


def verdicts_by_model(d: Path) -> dict[str, Path]:
    """Every verdict in one copy's folder, keyed by the model id it records, the latest
    per model. A report is rebuilt from what the verdicts say about themselves, not from a
    file name recomputed by today's tag_for: the tag rules have changed since the oldest
    runs (Kimi K3 is on disk as verdict.moonshotai-kimi-k3.json, a served GGUF as its whole
    flattened file name), and a recomputed tag that misses the file reads as no score."""
    found: dict[str, tuple[str, Path]] = {}
    for p in sorted(d.glob('verdict.*.json')):
        try:
            judge = json.loads(p.read_text(encoding='utf-8')).get('judge') or {}
        except (json.JSONDecodeError, AttributeError):
            continue
        model, at = judge.get('model_id'), str(judge.get('scored_at', ''))
        if model and (model not in found or at >= found[model][0]):
            found[model] = (at, p)
    return {m: p for m, (_, p) in found.items()}


def score(verdict_path: Path | None, criterion: str) -> int | None:
    """A verdict that hands back the rubric's example is not a reading of the lesson, so it
    counts as no score at all (what-failed entry 19)."""
    if verdict_path is None or not verdict_path.exists():
        return None
    verdict = json.loads(verdict_path.read_text(encoding='utf-8'))
    if judge_bedrock.copies_rubric_example(verdict):
        return None
    return verdict.get('scores', {}).get(criterion)


def audit_copies(root: Path) -> list[str]:
    """Every verdict under root that is the rubric's example handed back, as report lines."""
    found: dict[str, list[str]] = {}
    for p in sorted(root.glob('*/*/verdict.*.json')):
        try:
            verdict = json.loads(p.read_text(encoding='utf-8'))
        except json.JSONDecodeError:
            continue
        if judge_bedrock.copies_rubric_example(verdict):
            tag = p.name[len('verdict.'):-len('.json')]
            found.setdefault(f'{p.parent.parent.name} · {tag}', []).append(p.parent.name)
    return [f'| {k} | {len(v)} | {", ".join(v)} |' for k, v in sorted(found.items())]


def summarise(rows: list[dict], model: str) -> dict:
    mine = [r for r in rows if r['judge'] == model and r['drop'] is not None]
    caught = sum(1 for r in mine if r['drop'] >= MIN_DROP)
    mean = sum(r['drop'] for r in mine) / len(mine) if mine else 0.0
    return {'judge': model, 'caught': caught, 'of': len(mine), 'mean_drop': round(mean, 2)}


def write(d: Path, lesson: dict, bank: dict) -> None:
    d.mkdir(parents=True, exist_ok=True)
    dump = lambda o: json.dumps(o, ensure_ascii=False, indent=2) + '\n'  # noqa: E731
    (d / 'lesson.json').write_text(dump(lesson), encoding='utf-8')
    (d / 'items.json').write_text(dump(bank), encoding='utf-8')


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--region', default='us-east-1')
    ap.add_argument('--models', help='comma-separated Bedrock model ids (default: the seated panel)')
    ap.add_argument('--endpoint',
                    help='an OpenAI-compatible base URL; --models then names the served models')
    ap.add_argument('--cohere', action='store_true',
                    help="--models then names models on Cohere's own API (key in COHERE_API_KEY), "
                         'thinking within --thinking-budget')
    ap.add_argument('--thinking-budget', default='6000', dest='thinking_budget')
    ap.add_argument('--max-tokens', default='10000', dest='max_tokens',
                    help='with --cohere: the reply budget, thinking included (default 10000)')
    ap.add_argument('--defects', help=f'comma-separated subset of: {", ".join(MUTANTS)}')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--date', default=date.today().isoformat(),
                    help='the calibration folder to write or rebuild (YYYY-MM-DD; default today)')
    ap.add_argument('--audit-copies', action='store_true',
                    help='list every verdict so far that hands back the rubric example; call no model')
    ap.add_argument('--report-only', action='store_true',
                    help='rebuild the report from verdicts already on disk; call no model')
    args = ap.parse_args(argv)

    defects = args.defects.split(',') if args.defects else list(MUTANTS)
    if args.audit_copies:
        found = audit_copies(CALIBRATION_ROOT)
        print('\n'.join(found) if found else 'no verdict hands back the rubric example')
        return 0
    root = CALIBRATION_ROOT / args.date
    if args.models:
        models = args.models.split(',')
    elif args.report_only:
        # A rebuild covers every judge that left a verdict in this run.
        models = sorted({m for d in root.glob('*__*') for m in verdicts_by_model(d)})
    else:
        models = [m for m, _ in panel.PANEL_MODELS]
    rows: list[dict] = []
    built = 0
    for sample in SAMPLES:
        src = qa_gate.REPO / sample
        dirs = {'real-items': root / f'{src.parent.name}__real-items'}
        for name in defects:
            dirs[name] = root / f'{src.parent.name}__{name}'
        if not args.report_only:
            # A rebuild leaves the copies alone: they are what was judged.
            lesson = json.loads((src / 'lesson.json').read_text(encoding='utf-8'))
            bank = json.loads((src / 'items.json').read_text(encoding='utf-8'))
            write(dirs['real-items'], lesson, bank)
            built += 1
            for name in defects:
                try:
                    write(dirs[name], *MUTANTS[name][1](lesson, bank))
                    built += 1
                except NotApplicable as e:
                    print(f'{src.parent.name}: {name} not applicable ({e})')
                    del dirs[name]
        if args.dry_run:
            continue
        served = bool(args.endpoint) or args.cohere
        if args.cohere:
            transport = ['--cohere', '--thinking-budget', args.thinking_budget, '--max-tokens', args.max_tokens]
        elif args.endpoint:
            transport = ['--endpoint', args.endpoint]
        else:
            transport = ['--region', args.region]
        for d in ([] if args.report_only else dirs.values()):
            have = verdicts_by_model(d)
            for model in models:
                tag = tag_for(model, served)
                if model not in have and not (d / f'verdict.{tag}.json').exists():
                    try:
                        judge_bedrock.main(['--lesson', str(d / 'lesson.json'), '--model', model,
                                            '--tag', tag, *transport,
                                            '--log', str(qa_gate.CALIBRATION_LOG)])
                    except Exception as e:  # one refused model must not end the run for the rest
                        print(f'{model} on {d.name}: {type(e).__name__}: {str(e)[:160]}', file=sys.stderr)
        on_disk = {k: verdicts_by_model(d) for k, d in dirs.items()}
        for model in models:
            for name in defects:
                if name not in on_disk or (args.report_only and model not in on_disk[name]):
                    # Never shown this copy: earlier runs gave some judges only some
                    # defects, and an empty row here would replace a kept one.
                    continue
                criterion = MUTANTS[name][0]
                before = score(on_disk['real-items'].get(model), criterion)
                after = score(on_disk[name].get(model), criterion)
                rows.append({'sample': src.parent.name, 'defect': name, 'criterion': criterion,
                             'judge': model, 'real': before, 'broken': after,
                             'drop': None if before is None or after is None else before - after})
    if args.dry_run:
        print(f'built {built} copies (real and broken) for {len(SAMPLES)} samples '
              f'and {len(defects)} defects under {root}')
        return 0

    prev = root / 'results.json'
    if prev.exists():
        seen = {(r['judge'], r['defect']) for r in rows}
        for r in json.loads(prev.read_text(encoding='utf-8')):
            r.setdefault('criterion', MUTANTS.get(r['defect'], ('knowledge_check',))[0])
            r.setdefault('real', r.pop('real_items', None))
            r.setdefault('broken', r.pop('broken_items', None))
            if (r['judge'], r['defect']) not in seen:
                rows.append(r)
    judges = sorted({r['judge'] for r in rows})
    (root / 'results.json').write_text(json.dumps(rows, indent=2) + '\n', encoding='utf-8')

    seated = list(panel.SEATS)
    hosted = ', '.join(f'`{m}`' for m, _ in panel.PANEL_MODELS)
    served = ', '.join(f'`{m}`' for m, _, _ in panel.SERVED_JUDGES)
    seated_line = (f'Seated panel: {hosted} on Amazon Bedrock'
                   + (f', and {served} served on rented hardware' if served else '') + '.')
    lines = [
        '# Judge calibration: can each judge see a lesson broken on purpose?', '',
        f'Run {args.date}. Each sample was scored as it is and as copies broken in one '
        'way each, every defect one the rubric names and each aimed at one criterion. A judge that sees '
        f'the defect should score that criterion at least {MIN_DROP} points lower on the broken copy. '
        + seated_line,
        '', '## Per judge and criterion', '',
        '| Judge | Criterion | Defects caught | Mean drop |', '|---|---|---|---|',
    ]
    for j in judges:
        for crit in sorted({r['criterion'] for r in rows if r['judge'] == j}):
            sub = [r for r in rows if r['judge'] == j and r['criterion'] == crit]
            s = summarise(sub, j)
            lines.append(f'| `{j}`{" (seated)" if j in seated else ""} | {crit} | '
                         f'{s["caught"]} of {s["of"]} | {s["mean_drop"]:.2f} |')
    lines += ['', '## Every score', '',
              '| Judge | Defect | Criterion | Sample | Real | Broken | Drop |', '|---|---|---|---|---|---|---|']
    for r in sorted(rows, key=lambda r: (r['judge'], r['defect'], r['sample'])):
        lines.append(f'| `{r["judge"]}` | {r["defect"]} | {r["criterion"]} | {r["sample"]} | '
                     f'{r["real"]} | {r["broken"]} | {r["drop"]} |')
    copies = [line for line in audit_copies(root.parent) if line.startswith(f'| {root.name} ·')]
    if copies:
        lines += ['', "## Verdicts that hand back the rubric's example", '',
                  'The example printed in `rubric.md`, handed back: its scores, notes and closing note, or '
                  'its notes and closing note (numbers aside) with at most one score changed. They count '
                  'as no score above: the judge did not read the lesson (what-failed entry 19).',
                  '', '| Run · judge | Verdicts | Copies |', '|---|---|---|', *copies]
    lines += ['', 'This measures whether a judge can tell a real lesson from one broken in a named '
              'way. It does not say which judge is right about the real lesson.']
    (root / 'report.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    for line in lines[6:6 + 2 * len(judges) + 12]:
        if line.startswith('| `'):
            print(line)
    return 0


if __name__ == '__main__':
    sys.exit(main())
