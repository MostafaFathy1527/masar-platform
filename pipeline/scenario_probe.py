#!/usr/bin/env python3
"""Does each scenario consequence follow from the choice it sits under?

An experiment, not a panel seat. The full-rubric judges have never caught a scenario
whose consequences are wrong (calibration 14 and 15 October; what-failed entry 18), and
validate.py only checks that consequences are distinct and long enough. This asks one
narrow question per scenario, with nothing else in the prompt: the situation, then each
option with its consequence, and whether the option is marked best.

A probe that sees the defect flags the swapped copies and leaves the real ones alone.

    python pipeline/scenario_probe.py --root pipeline/out/calibration/2026-11-20-swapped-consequences \
        --models deepseek.v3.2,us.amazon.nova-pro-v1:0
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import judge_bedrock  # noqa: E402

PROMPT = """You check one branching scenario from a training lesson. A learner reads the situation,
picks an option, and is shown the consequence written under that option.

Check each option on its own: does the consequence describe what would plausibly happen
because of THAT option, and does it fit whether the option is marked best? A consequence
that describes a different option's action, or praises a weak option, or warns against
the best one, does not follow.

Situation:
{situation}

Options:
{options}

Reply with JSON only, no other text:
{{"decisions": [{{"id": "<option id>", "follows": true or false, "reason": "<one short sentence>"}}],
 "scenario_ok": true or false}}
scenario_ok is false if any option's consequence does not follow."""


def scenarios(lesson: dict):
    for bs in (lesson.get('blocks') or {}).values():
        for b in bs or []:
            if b.get('type') == 'scenario' and len(b['payload'].get('decisions', [])) >= 2:
                yield b


def build(b: dict) -> str:
    p = b['payload']
    opts = '\n'.join(
        f"- id {d['id']}{' (marked best)' if d.get('isBest') else ''}\n"
        f"  option: {d['optionEn']}\n  consequence: {d['consequenceEn']}"
        for d in p['decisions'])
    return PROMPT.format(situation=p['situationEn'], options=opts)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', required=True)
    ap.add_argument('--models', required=True)
    ap.add_argument('--region', default='us-east-1')
    args = ap.parse_args(argv)
    root = Path(args.root)
    out = root / 'scenario-probe.json'
    rows = json.loads(out.read_text()) if out.exists() else []
    done = {(r['copy'], r['block'], r['model']) for r in rows}
    for d in sorted(root.glob('*__*')):
        lesson = json.loads((d / 'lesson.json').read_text(encoding='utf-8'))
        for b in scenarios(lesson):
            for m in args.models.split(','):
                if (d.name, b['id'], m) in done:
                    continue
                text, usage = judge_bedrock.call_bedrock(build(b), m, args.region, max_tokens=1500)
                try:
                    v = judge_bedrock.extract_json(text)
                    ok = bool(v.get('scenario_ok'))
                except Exception:
                    v, ok = {'raw': text[:500]}, None
                rows.append({'copy': d.name, 'block': b['id'], 'model': m,
                             'broken': not d.name.endswith('__real-items'),
                             'scenario_ok': ok, 'verdict': v, 'usage': usage})
                out.write_text(json.dumps(rows, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
                print(f'{d.name} {b["id"]} {m}: scenario_ok={ok}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
