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

A judge that sees the defect should score the target criterion at least two
points lower on the broken copy than on the real one, in the same run. A judge
that does not is not measuring that criterion, whatever its notes say.

Nothing here changes a threshold or the panel. It is the evidence for who sits
on it: a judge earns its seat by passing this (see PANEL_MODELS in panel.py and
failure entry 18).

    python pipeline/calibrate_judges.py                    # the seated panel
    python pipeline/calibrate_judges.py --models a,b       # candidate judges
    python pipeline/calibrate_judges.py --dry-run          # build the copies only

Writes pipeline/out/calibration/<date>/report.md and results.json. Rows for
judges not in the current run are kept from earlier runs on the same day.
"""

from __future__ import annotations

import argparse
import copy
import json
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import judge_bedrock  # noqa: E402
import panel  # noqa: E402

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


# defect -> (criterion it targets, the mutation)
MUTANTS = {
    'generic-feedback': ('knowledge_check', generic_feedback),
    'absurd-distractors': ('knowledge_check', absurd_distractors),
    'pasted-english': ('bilingual_quality', pasted_english),
    'reasonless-steps': ('worked_example', reasonless_steps),
    'empty-consequences': ('scenario_authenticity', empty_consequences),
}


def tag_for(model: str) -> str:
    known = dict(panel.PANEL_MODELS)
    if model in known:
        return known[model]
    parts = model.split('.')
    return '-'.join(parts[1:] if len(parts) > 1 else parts).replace(':', '-').lower()


def score(verdict_path: Path, criterion: str) -> int | None:
    if not verdict_path.exists():
        return None
    return json.loads(verdict_path.read_text(encoding='utf-8')).get('scores', {}).get(criterion)


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
    ap.add_argument('--defects', help=f'comma-separated subset of: {", ".join(MUTANTS)}')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--report-only', action='store_true',
                    help='rebuild the report from verdicts already on disk; call no model')
    args = ap.parse_args(argv)

    models = args.models.split(',') if args.models else [m for m, _ in panel.PANEL_MODELS]
    defects = args.defects.split(',') if args.defects else list(MUTANTS)
    root = Path('pipeline/out/calibration') / date.today().isoformat()
    rows: list[dict] = []
    for sample in SAMPLES:
        src = Path(sample)
        lesson = json.loads((src / 'lesson.json').read_text(encoding='utf-8'))
        bank = json.loads((src / 'items.json').read_text(encoding='utf-8'))
        dirs = {'real-items': root / f'{src.parent.name}__real-items'}
        write(dirs['real-items'], lesson, bank)
        for name in defects:
            dirs[name] = root / f'{src.parent.name}__{name}'
            write(dirs[name], *MUTANTS[name][1](lesson, bank))
        if args.dry_run:
            continue
        for d in ([] if args.report_only else dirs.values()):
            for model in models:
                if not (d / f'verdict.{tag_for(model)}.json').exists():
                    try:
                        judge_bedrock.main(['--lesson', str(d / 'lesson.json'), '--model', model,
                                            '--tag', tag_for(model), '--region', args.region])
                    except Exception as e:  # one refused model must not end the run for the rest
                        print(f'{model} on {d.name}: {type(e).__name__}: {str(e)[:160]}', file=sys.stderr)
        for model in models:
            for name in defects:
                criterion = MUTANTS[name][0]
                before = score(dirs['real-items'] / f'verdict.{tag_for(model)}.json', criterion)
                after = score(dirs[name] / f'verdict.{tag_for(model)}.json', criterion)
                rows.append({'sample': src.parent.name, 'defect': name, 'criterion': criterion,
                             'judge': model, 'real': before, 'broken': after,
                             'drop': None if before is None or after is None else before - after})
    if args.dry_run:
        print(f'built copies for {len(SAMPLES)} samples x {len(defects) + 1} variants under {root}')
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

    seated = [m for m, _ in panel.PANEL_MODELS]
    lines = [
        '# Judge calibration: can each judge see a lesson broken on purpose?', '',
        f'Run {date.today().isoformat()}. Each sample was scored as it is and as copies broken in one '
        'way each, every defect one the rubric names and each aimed at one criterion. A judge that sees '
        f'the defect should score that criterion at least {MIN_DROP} points lower on the broken copy. '
        'Seated panel: ' + ', '.join(f'`{m}`' for m in seated) + '.',
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
    lines += ['', 'This measures whether a judge can tell a real lesson from one broken in a named '
              'way. It does not say which judge is right about the real lesson.']
    (root / 'report.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    for line in lines[6:6 + 2 * len(judges) + 12]:
        if line.startswith('| `'):
            print(line)
    return 0


if __name__ == '__main__':
    sys.exit(main())
