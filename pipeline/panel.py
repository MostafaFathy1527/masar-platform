#!/usr/bin/env python3
"""The judge panel: several independent verdicts on one lesson, one decision.

A single judge's score is partly a fact about the judge. Failure entry 15 is the
proof: one of three judges skipped a rubric clause and failed a lesson the other
two passed. The panel turns that into a rule instead of an anecdote.

Every verdict beside the lesson (`verdict.<tag>.json`) is loaded and evaluated by
`qa_gate.py`, unchanged; the panel never re-scores and never moves a threshold.
It then decides:

- **PASS**        every seat has scored, every judge passes, and no criterion
                  splits them by more than MAX_SPREAD points.
- **NEEDS HUMAN** the judges send the lesson to different outcomes, or any one
                  criterion splits them by more than MAX_SPREAD, or a seat is
                  empty: a seated model has no verdict beside the lesson.
                  Disagreement is the signal; it is not averaged away, and a
                  judge that has not scored is not a judge that agreed.
- **FAIL**        every seat has scored and every judge fails it.

When the same model has scored the lesson more than once (for instance after a
prompt fix), only its latest verdict counts, and the report says which were
superseded. Fewer than MIN_JUDGES distinct models is refused: one judge is not a
panel.

The seats are PANEL_MODELS, hosted on Amazon Bedrock, and SERVED_JUDGES, open
models served behind an OpenAI-compatible endpoint whose URL is read from the
environment variable each seat names. With that variable unset, or the endpoint
out of reach, the seat stays empty and the panel says so.

    python pipeline/panel.py --lesson pipeline/out/lesson-sec-01/v1/lesson.json
    python pipeline/panel.py --lesson ... --run      # score with every seat first

Exit codes: 0 PASS, 1 NEEDS HUMAN or FAIL, 2 could not run.
"""

from __future__ import annotations

import argparse
import http.client
import json
import os
import sys
import urllib.error
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qa_gate  # noqa: E402

MIN_JUDGES = 2
MAX_SPREAD = 1

# A judge earns its seat by passing pipeline/calibrate_judges.py: shown a
# sample's real items and copies broken in ways the rubric names, it must score
# the broken ones at least two points lower. On 14 October 2026 these two caught
# 8 of 8 and 7 of 8 planted defects. The first panel (Qwen3-32B, Llama 3.3 70B,
# Nova Pro) caught 0, 1 and 0, and was retired: see failure entry 18. Two
# families, neither the generator's, so agreement is not one model agreeing
# with itself.
#
# GLM-5 joined on the same date, after the same test: 16 of 16 on knowledge
# checks and worked examples, and the first judge to catch English pasted into
# the Arabic fields (4 of 4, every broken copy scored 1). The two seated judges
# caught 1 of 4 each, and nine other candidates 0 of 4. Like every judge tested,
# it misses scenario choices that all lead nowhere, which validate.py guards.
#
# On 15 October Kimi K3 replaced Kimi K2.5 in the same family's seat: at least as
# good on every defect (knowledge checks 8 of 8, worked examples 4 of 4, pasted
# English 4 of 4 against 1, empty scenarios 3 of 4 against 2). It refuses a fixed
# temperature, so it runs at its own default and its verdicts say so; two runs on
# identical lessons differed by one point on 10 of 32 scores. K2.5's verdicts
# are kept in each sample's retired-judges/.
#
# On 18 October five small open models were calibrated on rented V100 cards, each
# served by llama.cpp at Q8_0. Qwen3-30B-A3B-Thinking-2507 caught 14 of 20
# (knowledge checks 8 of 8, worked examples 4 of 4, pasted English 2 of 4, empty
# scenarios 0 of 4), the bar the hosted judges cleared, and takes the fourth
# seat: the one open judge on the panel, served on rented hardware rather than
# hosted. gpt-oss-20b caught 15 of 20 but shares the generator's family, so it
# cannot sit. The open seat runs at the model's own temperature 0.6 with 12,000
# tokens, since its reasoning counts against the budget, and its verdicts record
# the temperature. Apache-2.0; 30B parameters with 3B active, and one 32 GB card
# at Q6_K, though the file seated is the Q8_0 that passed calibration: a
# different quantisation is a different judge. Its two-run drift check, the one
# K3 had, is recorded in docs/STATUS.md.
PANEL_MODELS = (
    ('us.moonshotai.kimi-k3', 'kimi-k3'),
    ('deepseek.v3.2', 'deepseek-v3-2'),
    ('zai.glm-5', 'glm-5'),
)

# The served seats: (model, tag, spec). The model is the exact file that passed
# calibration, named as llama.cpp names it. The tag is the one the calibration
# folder uses, so a verdict here and a verdict there can be cross-referenced by
# file name. The spec names the environment variable that holds the endpoint
# URL, the seat's own decoding, and the family it belongs to: run_lesson.py's
# independence check reads it from here, because a GGUF file name carries no
# provider the way a Bedrock id does.
SERVED_JUDGES = (
    ('Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf', 'qwen3-30b-a3b-thinking-2507-q8-0-gguf',
     {'endpoint_env': 'JUDGE_QWEN3_ENDPOINT', 'temperature': 0.6, 'max_tokens': 12000,
      'family': 'qwen'}),
)

# Every seated model, hosted then served. decide() wants a verdict from each.
SEATS = tuple(m for m, _ in PANEL_MODELS) + tuple(m for m, _, _ in SERVED_JUDGES)


class PanelError(Exception):
    pass


def collect(lesson_dir: Path, levels: set[str]) -> tuple[list[dict], list[str]]:
    """Every tagged verdict beside the lesson, evaluated by the gate. Returns the
    latest result per model and the list of superseded verdict files."""
    by_model: dict[str, dict] = {}
    superseded: list[str] = []
    for path in sorted(lesson_dir.glob('verdict.*.json')):
        tag = path.name[len('verdict.'):-len('.json')]
        raw = json.loads(path.read_text(encoding='utf-8'))
        judge = raw.get('judge') or {}
        model = judge.get('model_id') or tag
        try:
            result = qa_gate.evaluate(qa_gate.load_verdict(path, levels))
        except qa_gate.GateError as e:
            raise PanelError(f'{path.name}: the gate refused this verdict: {e}') from e
        entry = {'tag': tag, 'model': model, 'at': judge.get('scored_at', ''), 'result': result,
                 'file': path.name}
        prev = by_model.get(model)
        if prev is None or entry['at'] > prev['at']:
            if prev is not None:
                superseded.append(prev['file'])
            by_model[model] = entry
        else:
            superseded.append(entry['file'])
    return list(by_model.values()), sorted(superseded)


def decide(entries: list[dict], seats: tuple[str, ...] = SEATS) -> dict:
    if len(entries) < MIN_JUDGES:
        raise PanelError(f'{len(entries)} distinct judge(s); a panel needs at least {MIN_JUDGES}')
    present = {e['model'] for e in entries}
    empty = [s for s in seats if s not in present]
    outcomes = {e['model']: e['result']['passed'] for e in entries}
    per_criterion: dict[str, dict[str, int]] = {}
    for e in entries:
        for c, v in e['result']['scores'].items():
            per_criterion.setdefault(c, {})[e['model']] = v
    spreads = {c: max(v.values()) - min(v.values()) for c, v in per_criterion.items() if len(v) > 1}
    split = sorted(c for c, s in spreads.items() if s > MAX_SPREAD)

    if empty:
        # A seat with no verdict is neither a pass nor a fail from that judge, so
        # the panel can be neither. The judges that did score are still reported.
        decision = 'NEEDS HUMAN'
    elif all(outcomes.values()) and not split:
        decision = 'PASS'
    elif not any(outcomes.values()):
        decision = 'FAIL'
    else:
        decision = 'NEEDS HUMAN'
    reasons = [f'seat empty: {s} has not scored this lesson' for s in empty]
    if len(set(outcomes.values())) > 1:
        reasons.append('the judges send the lesson to different gate outcomes')
    if split:
        reasons.append(f'judges differ by more than {MAX_SPREAD} on: {", ".join(split)}')
    return {
        'decision': decision,
        'reasons': reasons,
        'outcomes': outcomes,
        'per_criterion': per_criterion,
        'spreads': spreads,
        'split': split,
        'empty_seats': empty,
    }


def report(lesson: str, entries: list[dict], verdict: dict, superseded: list[str]) -> str:
    models = [e['model'] for e in entries]
    lines = [
        f'# Judge panel — {lesson}',
        '',
        f'**Panel decision: {verdict["decision"]}**',
        '',
        f'> {qa_gate.SCORE_LABEL}. A panel of models agreeing is still not a human review.',
        '',
        f'Rule: PASS only if every seat has scored, every judge passes and no criterion splits '
        f'them by more than {MAX_SPREAD}. Any split, or an empty seat, goes to a human.',
        '',
        '| Criterion | ' + ' | '.join(f'`{m}`' for m in models) + ' | spread |',
        '|---|' + '---|' * len(models) + '---|',
    ]
    for c in qa_gate.CRITERIA:
        row = verdict['per_criterion'].get(c)
        if not row:
            continue
        cells = [str(row.get(m, '—')) for m in models]
        spread = verdict['spreads'].get(c, 0)
        flag = ' ⚠' if spread > MAX_SPREAD else ''
        lines.append(f'| {c.replace("_", " ")} | ' + ' | '.join(cells) + f' | {spread}{flag} |')
    lines.append('| **gate** | ' + ' | '.join(
        f'{e["result"]["mean"]:.2f} {"PASS" if e["result"]["passed"] else "FAIL"}' for e in entries) + ' | |')
    if verdict['reasons']:
        lines.extend(['', 'Why: ' + '; '.join(verdict['reasons']) + '.'])
    empty = verdict.get('empty_seats') or []
    if empty:
        lines.extend(['', 'Seats with no verdict beside the lesson, so the panel can neither pass nor '
                      'fail it: ' + ', '.join(f'`{s}`' for s in empty) + '.'])
    if superseded:
        lines.extend(['', 'Superseded by a later verdict from the same model, and not counted: '
                      + ', '.join(f'`{s}`' for s in superseded) + '.'])
    return '\n'.join(lines) + '\n'


def run_judges(lesson_path: Path, region: str) -> list[str]:
    """Score the lesson with every seat: the hosted seats on Bedrock in `region`,
    exactly as before; the served seats through the endpoint each one's
    environment variable names, at the seat's own temperature and token budget.

    A served seat whose variable is unset, or whose endpoint cannot be reached,
    is named on stderr and left empty; nothing is raised, because the hosted
    verdicts are still worth writing and the panel reports the empty seat.

    Returns the served seats that did not score in this run. A verdict an earlier
    run left beside the lesson must not stand in for them, so the caller treats
    those seats as empty. A served verdict the gate refuses is moved to
    refused-verdicts/ rather than left to stop the whole panel."""
    import judge_bedrock
    doc = json.loads(lesson_path.read_text(encoding='utf-8'))
    levels = {str(x).upper() for x in doc.get('levels', [])}
    not_scored: list[str] = []
    for model, tag in PANEL_MODELS:
        judge_bedrock.main(['--lesson', str(lesson_path), '--model', model, '--tag', tag,
                            '--region', region])
    for model, tag, spec in SERVED_JUDGES:
        endpoint = os.environ.get(spec['endpoint_env'], '').strip()
        if not endpoint:
            print(f'{tag}: {spec["endpoint_env"]} is not set; the seat stays empty', file=sys.stderr)
            not_scored.append(model)
            continue
        path = lesson_path.parent / f'verdict.{tag}.json'
        before = path.stat().st_mtime_ns if path.exists() else None
        try:
            judge_bedrock.main(['--lesson', str(lesson_path), '--model', model, '--tag', tag,
                                '--endpoint', endpoint,
                                '--temperature', str(spec['temperature']),
                                '--max-tokens', str(spec['max_tokens'])])
        except (urllib.error.URLError, ConnectionError, TimeoutError, http.client.HTTPException) as e:
            print(f'{tag}: {spec["endpoint_env"]} could not be reached ({e}); the seat stays empty',
                  file=sys.stderr)
            not_scored.append(model)
            continue
        except (ValueError, KeyError, IndexError, TypeError) as e:
            # Reachable but not an OpenAI-compatible reply (a proxy's HTML page, a body
            # without "choices"). The hosted verdicts are already written and paid for.
            print(f'{tag}: {spec["endpoint_env"]} answered with something that is not a chat '
                  f'completion ({type(e).__name__}: {e}); the seat stays empty', file=sys.stderr)
            not_scored.append(model)
            continue
        if not path.exists() or path.stat().st_mtime_ns == before:
            # The model answered but wrote no new verdict (unparseable, or the
            # rubric's example handed back): the old file, if any, is last run's.
            print(f'{tag}: no new verdict this run; the seat stays empty', file=sys.stderr)
            not_scored.append(model)
            continue
        try:
            qa_gate.load_verdict(path, levels)
        except qa_gate.GateError as e:
            refused = lesson_path.parent / 'refused-verdicts'
            refused.mkdir(exist_ok=True)
            path.replace(refused / path.name)
            print(f'{tag}: the gate refused the verdict ({e}); moved to refused-verdicts/, '
                  f'the seat stays empty', file=sys.stderr)
            not_scored.append(model)
    return not_scored


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--lesson', type=Path, required=True)
    ap.add_argument('--run', action='store_true', help='score the lesson with every seat first')
    ap.add_argument('--region', default='us-east-1')
    args = ap.parse_args(argv)

    doc = json.loads(args.lesson.read_text(encoding='utf-8'))
    levels = {str(x).upper() for x in doc.get('levels', [])}
    if not levels or not levels <= {'L1', 'L2', 'L3'}:
        print(f'error: lesson declares no usable levels: {sorted(levels) or "[]"}', file=sys.stderr)
        return 2

    not_scored: list[str] = []
    if args.run:
        not_scored = run_judges(args.lesson, args.region)

    try:
        entries, superseded = collect(args.lesson.parent, levels)
        # A served seat that did not score in this run is empty, whatever an
        # earlier run left beside the lesson.
        entries = [e for e in entries if e['model'] not in not_scored]
        verdict = decide(entries)
    except PanelError as e:
        print(f'error: {e}', file=sys.stderr)
        return 2

    text = report(doc.get('slug', args.lesson.parent.name), entries, verdict, superseded)
    (args.lesson.parent / 'panel-report.md').write_text(text, encoding='utf-8')
    print(f'{verdict["decision"]} — {len(entries)} judges'
          + (f'; {"; ".join(verdict["reasons"])}' if verdict['reasons'] else ''))
    return 0 if verdict['decision'] == 'PASS' else 1


if __name__ == '__main__':
    sys.exit(main())
