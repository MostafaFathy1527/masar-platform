#!/usr/bin/env python3
"""An open Arabic LLM-as-a-judge dataset, built from Masar lessons without a model call.

Two files, and a card that describes them:

  pairs.jsonl            one record per (lesson, defect): the lesson as it is and a copy
                         broken in one named way, each with exactly the items a judge is
                         shown, and the score difference a judge that sees the defect gives
  judge_behaviour.jsonl  what real judges did with those pairs, read from the verdicts
                         already under pipeline/out/calibration/, never from a new call
  README.md              the dataset card; every count in it is computed from the records

The defects are calibrate_judges.MUTANTS, applied unchanged. The sources are the samples
calibrate_judges uses and the human-authored course lessons, whose items come from the
course item bank. A defect that has nothing to break in a lesson, or whose copy comes out
identical to the lesson, makes no record: a pair with no difference teaches a judge nothing.

    python pipeline/judge_dataset.py              # writes datasets/arabic-lesson-judge/
    python pipeline/judge_dataset.py --out DIR
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import calibrate_judges  # noqa: E402
import judge_bedrock  # noqa: E402
import qa_gate  # noqa: E402

REPO = qa_gate.REPO
COURSE = REPO / 'content' / 'courses' / 'rcm-foundations'
OUT = REPO / 'datasets' / 'arabic-lesson-judge'
CAL = calibrate_judges.CALIBRATION_ROOT
MIN_DROP = calibrate_judges.MIN_DROP
REAL = 'real-items'


def rel(p: Path) -> str:
    return p.resolve().relative_to(REPO).as_posix()


def expected(criterion: str) -> dict:
    return {'criterion': criterion, 'min_drop': MIN_DROP,
            'statement': f'real scores at least {MIN_DROP} points higher than broken on {criterion}'}


def sources() -> list[dict]:
    """Every source lesson with the bank its judge would read items from."""
    out = []
    for sample in calibrate_judges.SAMPLES:
        d = REPO / sample
        out.append({'source': 'pipeline-draft', 'name': d.parent.name, 'path': rel(d / 'lesson.json'),
                    'lesson': json.loads((d / 'lesson.json').read_text(encoding='utf-8')),
                    'bank': json.loads((d / 'items.json').read_text(encoding='utf-8'))})
    # The course keeps one bank across lessons; the judge only ever sees the referenced
    # items, so the merged bank gives the same items a per-lesson items.json would.
    bank = {'items': [i for f in sorted((COURSE / 'items').glob('*.json'))
                      for i in json.loads(f.read_text(encoding='utf-8')).get('items', [])]}
    for f in sorted((COURSE / 'lessons').glob('*.json')):
        out.append({'source': 'human-authored-course', 'name': f.stem, 'path': rel(f),
                    'lesson': json.loads(f.read_text(encoding='utf-8')), 'bank': bank})
    return out


def judged(lesson: dict, bank: dict) -> dict:
    items, missing = judge_bedrock.items_in_bank(lesson, bank.get('items', []))
    if missing:
        # judge_bedrock refuses such a lesson, so a record of it would be one no judge saw.
        raise ValueError(f'{lesson.get("slug")}: items not in the bank: {", ".join(missing)}')
    return {'lesson': lesson, 'items': items}


def build_pairs() -> tuple[list[dict], list[dict]]:
    """The pair records, and a row for every (lesson, defect) that made none, with why."""
    pairs, skipped = [], []
    for src in sources():
        lesson, bank = src['lesson'], src['bank']
        real = judged(lesson, bank)
        for defect, (criterion, mutate) in calibrate_judges.MUTANTS.items():
            try:
                broken = judged(*mutate(lesson, bank))
            except calibrate_judges.NotApplicable as e:
                skipped.append({'lesson': src['name'], 'defect': defect, 'reason': str(e)})
                continue
            if broken == real:
                skipped.append({'lesson': src['name'], 'defect': defect,
                                'reason': 'the copy is identical: nothing for it to break'})
                continue
            pairs.append({
                'id': f'{src["name"]}__{defect}',
                'source': src['source'],
                'source_path': src['path'],
                'lesson': lesson.get('slug'),
                'levels': lesson.get('levels'),
                'bilingual': lesson.get('bilingual', True),
                'defect': defect,
                'target_criterion': criterion,
                'expected': expected(criterion),
                'real': real,
                'broken': broken,
            })
    return pairs, skipped


def read_verdict(p: Path) -> dict | None:
    """A verdict with the model it records, or None if it cannot be read as one."""
    try:
        v = json.loads(p.read_text(encoding='utf-8'))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError):
        return None
    return v if isinstance(v, dict) and (v.get('judge') or {}).get('model_id') else None


def build_behaviour() -> tuple[list[dict], Counter]:
    """One record per (run, model, sample, defect) where both verdicts carry a score on the
    target criterion. The latest verdict per model in a folder counts, as in the report."""
    records, skipped = [], Counter()
    for run in sorted(p for p in CAL.iterdir() if p.is_dir()):
        by_folder: dict[str, dict[str, tuple[str, Path, dict]]] = {}
        for folder in sorted(run.glob('*__*')):
            latest: dict[str, tuple[str, Path, dict]] = {}
            for p in sorted(folder.glob('verdict.*.json')):
                v = read_verdict(p)
                if v is None:
                    skipped['unreadable'] += 1
                    continue
                model, at = v['judge']['model_id'], str(v['judge'].get('scored_at', ''))
                if model not in latest or at >= latest[model][0]:
                    latest[model] = (at, p, v)
            # As in calibrate_judges.score: a latest verdict that hands back the rubric's
            # example is no score, and an older verdict does not stand in for it.
            for model, (_, p, v) in list(latest.items()):
                if judge_bedrock.copies_rubric_example(v):
                    skipped['rubric example handed back'] += 1
                    del latest[model]
            by_folder[folder.name] = latest
        for name, latest in by_folder.items():
            sample, _, defect = name.partition('__')
            if defect not in calibrate_judges.MUTANTS:
                continue
            criterion = calibrate_judges.MUTANTS[defect][0]
            real = by_folder.get(f'{sample}__{REAL}', {})
            for model, (_, broken_path, broken_v) in sorted(latest.items()):
                if model not in real:
                    skipped['no real verdict from the same model'] += 1
                    continue
                _, real_path, real_v = real[model]
                a = (real_v.get('scores') or {}).get(criterion)
                b = (broken_v.get('scores') or {}).get(criterion)
                if not isinstance(a, int) or not isinstance(b, int):
                    skipped['no score on the target criterion'] += 1
                    continue
                records.append({
                    'run': run.name, 'model_id': model,
                    'provider': real_v['judge'].get('provider'),
                    'lesson': sample, 'defect': defect, 'target_criterion': criterion,
                    'real_score': a, 'broken_score': b, 'drop': a - b, 'caught': a - b >= MIN_DROP,
                    'real_verdict': rel(real_path), 'broken_verdict': rel(broken_path),
                })
    return records, skipped


def table(head: tuple[str, ...], rows: list[tuple]) -> list[str]:
    return ['| ' + ' | '.join(head) + ' |', '|' + '---|' * len(head),
            *('| ' + ' | '.join(str(c) for c in r) + ' |' for r in rows)]


def card(pairs: list[dict], skipped: list[dict], behaviour: list[dict], unread: Counter) -> str:
    by_source = Counter(p['source'] for p in pairs)
    lessons = {s: len({p['source_path'] for p in pairs if p['source'] == s}) for s in by_source}
    defects = list(calibrate_judges.MUTANTS)
    per_defect = [(f'`{d}`', calibrate_judges.MUTANTS[d][0],
                   *(sum(1 for p in pairs if p['defect'] == d and p['source'] == s) for s in sorted(by_source)),
                   sum(1 for p in pairs if p['defect'] == d)) for d in defects]
    flag_only = sum(1 for p in pairs if p['defect'] == 'pasted-english' and p['bilingual'] is False)
    models = sorted({r['model_id'] for r in behaviour})
    per_model = [(f'`{m}`', sum(1 for r in behaviour if r['model_id'] == m),
                  sum(1 for r in behaviour if r['model_id'] == m and r['caught']),
                  len({r['run'] for r in behaviour if r['model_id'] == m})) for m in models]
    per_defect_b = [(f'`{d}`', sum(1 for r in behaviour if r['defect'] == d),
                     sum(1 for r in behaviour if r['defect'] == d and r['caught'])) for d in defects]
    skip_rows = [(s['lesson'], f'`{s["defect"]}`', s['reason']) for s in skipped]
    runs = sorted({r['run'] for r in behaviour})
    mismatched = sum(1 for p in pairs if p['defect'] == 'mismatched-numbers')
    lines = [
        '# Arabic lesson judge pairs', '',
        'A small, open dataset for training and testing **LLM-as-a-judge** models on Arabic and '
        'bilingual (Arabic and English) instructional content. Each record pairs a real lesson '
        'with a copy of it broken in one named, rule-based way, and states which rubric criterion '
        'a judge should mark down and by how much. A second file records what real judge models '
        'actually did with these pairs.', '',
        'It is built from the lessons of Masar, an open-source Arabic-first learning platform, '
        'with no model call: the broken copies are made by deterministic code, and the judge '
        'behaviour is read from verdicts already on disk.', '',
        '## Files', '',
        f'- `pairs.jsonl`: {len(pairs)} pairs from {sum(lessons.values())} source lessons.',
        f'- `judge_behaviour.jsonl`: {len(behaviour)} records from {len(models)} judge models '
        f'across {len(runs)} calibration runs.',
        '- `README.md`: this card.', '',
        '## How it was built', '',
        '1. **Sources.** '
        f'{lessons.get("pipeline-draft", 0)} lessons drafted by the project\'s generation pipeline '
        '(`source: pipeline-draft`, the samples `pipeline/calibrate_judges.py` uses) and '
        f'{lessons.get("human-authored-course", 0)} lessons written by hand for the demo course '
        '(`source: human-authored-course`), with their items taken from the course item bank.',
        '2. **Defects.** Each defect in `calibrate_judges.MUTANTS` is applied to each lesson. A '
        'defect with nothing to break in a lesson (no number in its Arabic, no scenario, no worked '
        'example) produces no record.',
        '3. **What the judge sees.** `real.items` and `broken.items` are exactly the items '
        '`pipeline/judge_bedrock.py` puts in front of a judge: the items the lesson\'s knowledge '
        'checks reference, in that order, resolved the same way.',
        '4. **Judge behaviour.** For every calibration run under `pipeline/out/calibration/`, every '
        'model with a verdict on both the real copy and a broken copy of the same sample yields '
        'one record. The latest verdict per model in a folder counts. '
        f'{sum(unread.values())} verdict files were left out: '
        + (', '.join(f'{n} {why}' for why, n in sorted(unread.items())) or 'none') + '.', '',
        '## The defects', '',
        *table(('Defect', 'Target criterion', *sorted(by_source), 'Pairs'), per_defect), '',
        '- `generic-feedback`: every option\'s feedback becomes "Correct." or "Not correct.".',
        '- `absurd-distractors`: every wrong option becomes something no learner would pick.',
        '- `pasted-english`: every Arabic field holds the English text while the lesson claims to '
        'be bilingual.',
        '- `reasonless-steps`: every worked-example step\'s reasoning becomes "Because it is the '
        'next step.".',
        '- `empty-consequences`: every scenario decision\'s consequence becomes the same empty '
        'sentence.',
        '- `mismatched-numbers`: every number in a field written in Arabic moves one up (width and '
        'digit script kept, so 16:00 becomes 17:01 and 1,260 becomes 2,261), and the English is left '
        f'as it was; the Arabic no longer says what the English says. It applied to {mismatched} '
        f'of {sum(lessons.values())} lessons.', '',
        'Pairs not made, and why:', '',
        *table(('Lesson', 'Defect', 'Reason'), skip_rows), '',
        '## Fields', '',
        '`pairs.jsonl`, one JSON object per line:', '',
        '- `id`: `<lesson>__<defect>`, unique.',
        '- `source`: `pipeline-draft` or `human-authored-course`; `source_path`: the lesson file.',
        '- `lesson`: the lesson slug; `levels`: the depths it declares (L1, L2, L3); `bilingual`: '
        'what it declares (absent in the source means true).',
        '- `defect`, `target_criterion`: the defect planted and the rubric criterion it targets.',
        f'- `expected`: `{{"criterion", "min_drop": {MIN_DROP}, "statement"}}`: a judge that sees '
        'the defect scores `real` at least `min_drop` points higher than `broken` on the criterion.',
        '- `real`, `broken`: `{"lesson": <lesson JSON>, "items": [<items the judge is shown>]}`.', '',
        '`judge_behaviour.jsonl`:', '',
        '- `run`: the calibration folder; `model_id`, `provider`: the judge, as its verdict records it.',
        '- `lesson`, `defect`, `target_criterion`.',
        '- `real_score`, `broken_score`, `drop`, and `caught` (`drop >= '
        f'{MIN_DROP}`).',
        '- `real_verdict`, `broken_verdict`: the verdict files, relative to the repository root.', '',
        '## Judge behaviour', '',
        *table(('Model', 'Records', 'Caught', 'Runs'), per_model), '',
        *table(('Defect', 'Records', 'Caught'), per_defect_b), '',
        'Scores are integers from 1 to 5 on the rubric in `pipeline/rubric.md`. A verdict that hands '
        'back the rubric\'s printed example is not counted.', '',
        '## Limits', '',
        f'- **Few source lessons.** {sum(lessons.values())} lessons, in a handful of training '
        'domains. This is a seed set, not a benchmark.',
        '- **Synthetic, rule-based defects.** Every broken copy is made by code. Real lessons fail '
        'in subtler and more varied ways.',
        '- **Some broken copies are obviously broken.** Absurd distractors and one-word feedback '
        'are easy to see; they test whether a judge reads the items at all, not whether it has '
        'taste.',
        f'- **English-only lessons.** {flag_only} `pasted-english` pairs come from lessons that '
        'declare themselves English-only, so the broken copy differs only in claiming to be '
        'bilingual.',
        '- **No human labels.** `expected` is the direction the rubric implies, not a score a '
        'person gave. The real lessons have not been scored by a person either.',
        '- **Model text.** The pipeline drafts were generated by a model and have not had a human '
        'review; the course lessons were written by hand.', '',
        '## Licence', '',
        'The lesson content is licensed under CC BY-NC 4.0 (see `LICENSE-content.md` at the '
        'repository root). The code that builds the dataset is MIT-licensed (see `LICENSE`).', '',
        '## Regenerate', '',
        '```', 'python pipeline/judge_dataset.py', '```', '',
        'The pairs are deterministic; the behaviour file grows as calibration runs are added.',
    ]
    return '\n'.join(lines) + '\n'


def dump_jsonl(path: Path, records: list[dict]) -> None:
    with path.open('w', encoding='utf-8', newline='\n') as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + '\n')


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--out', type=Path, default=OUT)
    args = ap.parse_args(argv)

    pairs, skipped = build_pairs()
    behaviour, unread = build_behaviour()
    args.out.mkdir(parents=True, exist_ok=True)
    dump_jsonl(args.out / 'pairs.jsonl', pairs)
    dump_jsonl(args.out / 'judge_behaviour.jsonl', behaviour)
    (args.out / 'README.md').write_text(card(pairs, skipped, behaviour, unread), encoding='utf-8', newline='\n')
    print(f'{len(pairs)} pairs, {len(skipped)} (lesson, defect) skipped, '
          f'{len(behaviour)} behaviour records, {sum(unread.values())} verdict files left out')
    for k, n in sorted(Counter((p['source'], p['defect']) for p in pairs).items()):
        print(f'  {k[0]:22} {k[1]:20} {n}')
    for m, n in sorted(Counter(r['model_id'] for r in behaviour).items()):
        print(f'  {m:50} {n}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
