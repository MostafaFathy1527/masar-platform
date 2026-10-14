#!/usr/bin/env python3
"""Can each judge tell a good knowledge check from a broken one?

On all four samples the three panel judges split 5, 4 and 3 on knowledge
checks, the same way every time. That pattern says more about the judges than
about the items, but "says more about the judges" is a hunch until it is
measured. This measures it.

For each sample, the real item bank is copied three times: unchanged, and broken
in one of two ways the rubric names explicitly (criterion 4):

  generic-feedback   every option's feedback becomes "Correct." / "Not correct.",
                     so no option names the misconception it represents
  absurd-distractors every wrong option becomes something no learner would pick

Each judge scores all three copies in fresh contexts, through the same gate, and
its knowledge_check score on each broken copy is compared with its score on the
real one from the same run. A judge that sees the defect should drop by at least
two points. A judge that does not drop is not discriminating on that criterion,
whatever its notes say.

Nothing here changes a threshold or the panel. It produces evidence for whoever
decides which judges sit on it: a judge earns its seat by passing this.

    python pipeline/calibrate_judges.py                       # the panel judges
    python pipeline/calibrate_judges.py --models a,b          # candidate judges
    python pipeline/calibrate_judges.py --dry-run             # build the copies only

Writes pipeline/out/calibration/<date>/report.md and results.json. Rows for
judges not in the current run are kept from earlier runs on the same day.
"""

from __future__ import annotations

import argparse
import copy
import json
import shutil
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


def generic_feedback(bank: dict) -> dict:
    out = copy.deepcopy(bank)
    for item in out['items']:
        for o in item['options']:
            o['feedbackEn'] = 'Correct.' if o['isCorrect'] else 'Not correct.'
            o['feedbackAr'] = 'صحيح.' if o['isCorrect'] else 'غير صحيح.'
    return out


def absurd_distractors(bank: dict) -> dict:
    out = copy.deepcopy(bank)
    for item in out['items']:
        wrong = [o for o in item['options'] if not o['isCorrect']]
        for o, (en, ar) in zip(wrong, ABSURD):
            o['textEn'], o['textAr'] = en, ar
            o['feedbackEn'], o['feedbackAr'] = 'Not correct.', 'غير صحيح.'
    return out


MUTANTS = {'generic-feedback': generic_feedback, 'absurd-distractors': absurd_distractors}
VARIANTS = {'real-items': copy.deepcopy, **MUTANTS}


def tag_for(model: str) -> str:
    known = dict(panel.PANEL_MODELS)
    if model in known:
        return known[model]
    parts = model.split('.')
    return '-'.join(parts[1:] if len(parts) > 1 else parts).replace(':', '-').lower()


def kc_score(verdict_path: Path) -> int | None:
    if not verdict_path.exists():
        return None
    return json.loads(verdict_path.read_text(encoding='utf-8')).get('scores', {}).get('knowledge_check')


def summarise(rows: list[dict], model: str) -> dict:
    mine = [r for r in rows if r['judge'] == model and r['drop'] is not None]
    caught = sum(1 for r in mine if r['drop'] >= MIN_DROP)
    mean = sum(r['drop'] for r in mine) / len(mine) if mine else 0.0
    return {'judge': model, 'caught': caught, 'of': len(mine), 'mean_drop': round(mean, 2)}


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--region', default='us-east-1')
    ap.add_argument('--models', help='comma-separated Bedrock model ids (default: the panel)')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args(argv)

    models = args.models.split(',') if args.models else [m for m, _ in panel.PANEL_MODELS]
    root = Path('pipeline/out/calibration') / date.today().isoformat()
    rows: list[dict] = []
    for sample in SAMPLES:
        src = Path(sample)
        bank = json.loads((src / 'items.json').read_text(encoding='utf-8'))
        dirs = {}
        for name, make in VARIANTS.items():
            d = dirs[name] = root / f'{src.parent.name}__{name}'
            d.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src / 'lesson.json', d / 'lesson.json')
            (d / 'items.json').write_text(json.dumps(make(bank), ensure_ascii=False, indent=2) + '\n',
                                          encoding='utf-8')
            if args.dry_run:
                continue
            for model in models:
                if not (d / f'verdict.{tag_for(model)}.json').exists():
                    judge_bedrock.main(['--lesson', str(d / 'lesson.json'), '--model', model,
                                        '--tag', tag_for(model), '--region', args.region])
        for model in models:
            before = kc_score(dirs['real-items'] / f'verdict.{tag_for(model)}.json')
            for name in MUTANTS:
                after = kc_score(dirs[name] / f'verdict.{tag_for(model)}.json')
                rows.append({'sample': src.parent.name, 'defect': name, 'judge': model,
                             'real_items': before, 'broken_items': after,
                             'drop': None if before is None or after is None else before - after})
    if args.dry_run:
        print(f'built {len(VARIANTS) * len(SAMPLES)} copies under {root}')
        return 0

    prev = root / 'results.json'
    if prev.exists():
        rows += [r for r in json.loads(prev.read_text(encoding='utf-8'))
                 if r['judge'] not in models and 'sample' in r]
    judges = sorted({r['judge'] for r in rows})
    (root / 'results.json').write_text(json.dumps(rows, indent=2) + '\n', encoding='utf-8')

    lines = [
        '# Judge calibration: can each judge see a broken knowledge check?', '',
        f'Run {date.today().isoformat()}. Each sample\'s real item bank was scored as it is and '
        'broken in one of two ways rubric criterion 4 names; each judge scored all three copies in '
        f'fresh contexts. A judge that sees the defect should drop its knowledge_check score by at '
        f'least {MIN_DROP}. Panel judges: '
        + ', '.join(f'`{m}`' for m, _ in panel.PANEL_MODELS) + '.',
        '', '## Per judge', '',
        '| Judge | Defects caught | Mean drop |', '|---|---|---|',
    ]
    for j in judges:
        s = summarise(rows, j)
        lines.append(f'| `{j}` | {s["caught"]} of {s["of"]} | {s["mean_drop"]:.2f} |')
    lines += ['', '## Every score', '',
              '| Judge | Defect | Sample | Real items | Broken items | Drop |', '|---|---|---|---|---|---|']
    for r in sorted(rows, key=lambda r: (r['judge'], r['defect'], r['sample'])):
        lines.append(f'| `{r["judge"]}` | {r["defect"]} | {r["sample"]} | {r["real_items"]} | '
                     f'{r["broken_items"]} | {r["drop"]} |')
    lines += ['', 'This measures discrimination on one criterion with two kinds of defect. It does '
              'not say which judge is right about the real items; it says which judges can tell '
              'real items from broken ones.']
    (root / 'report.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    for j in judges:
        s = summarise(rows, j)
        print(f'{j}: caught {s["caught"]} of {s["of"]}, mean drop {s["mean_drop"]:.2f}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
