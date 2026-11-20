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

# v2 (20 November): v1 read a weak option's honest warning as a consequence that
# "does not follow" (OPS-01, real lesson, d1 and d3). A weak option is SUPPOSED to
# get a bad outcome; the defect is a consequence about another option's action.
# So the model first says, in its own words, what each consequence is about, then
# matches it to the option, and only then looks at tone.
PROMPT_V2 = """You check one branching scenario from a training lesson. A learner reads the situation,
picks an option, and is then shown the consequence written under that option.

Weak options are meant to get consequences that describe a bad outcome or name the
mistake. That is correct, not a defect. Judge only these two things, for each option:
1. Match: is the consequence about THIS option's action (what the learner just chose),
   and not about what a different option does?
2. Tone: a best option's consequence should not warn against it, and a weak option's
   consequence should not praise it as best.

For each option, first write in a few words what action the consequence is reacting
to, then decide.

Situation:
{situation}

Options:
{options}

Reply with JSON only, no other text:
{{"decisions": [{{"id": "<option id>", "consequence_reacts_to": "<a few words>", "follows": true or false, "reason": "<one short sentence>"}}],
 "scenario_ok": true or false}}
scenario_ok is false if any option's consequence fails the match or the tone check."""

# v3 (20 November): v2 caught every full swap but about half of a weak-for-weak swap,
# where the tone stays right. v3 makes the model join each option to its consequence
# in one sentence, "Because you <option>, <consequence>", and judge whether that
# sentence is true to the situation: a consequence about another action makes a
# sentence that does not hold together.
PROMPT_V3 = """You check one branching scenario from a training lesson. A learner reads the situation,
picks an option, and is then shown the consequence written under that option.

For each option, write ONE sentence of the form
  "Because you <the option, in a few words>, <what the consequence says happens or is true>."
Then judge that sentence: is the second half something that actually follows from the
first half, in this situation? If the consequence is really about a different action
(for example another option's), the sentence will not hold together: mark it false.

Weak options are meant to get consequences that describe a bad outcome or name the
mistake; that is correct, not a defect. A best option's consequence should not warn
against it, and a weak option's should not praise it.

Situation:
{situation}

Options:
{options}

Reply with JSON only, no other text:
{{"decisions": [{{"id": "<option id>", "because": "<your one sentence>", "follows": true or false, "reason": "<one short sentence>"}}],
 "scenario_ok": true or false}}
scenario_ok is false if any option's sentence does not hold together."""

PROMPTS = {'v1': PROMPT, 'v2': PROMPT_V2, 'v3': PROMPT_V3}


def scenarios(lesson: dict):
    for bs in (lesson.get('blocks') or {}).values():
        for b in bs or []:
            if b.get('type') == 'scenario' and len(b['payload'].get('decisions', [])) >= 2:
                yield b


def build(b: dict, prompt: str = 'v1', lang: str = 'En') -> str:
    p = b['payload']
    opts = '\n'.join(
        f"- id {d['id']}{' (marked best)' if d.get('isBest') else ''}\n"
        f"  option: {d['option' + lang]}\n  consequence: {d['consequence' + lang]}"
        for d in p['decisions'])
    return PROMPTS[prompt].format(situation=p['situation' + lang], options=opts)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', required=True)
    ap.add_argument('--models', required=True)
    ap.add_argument('--region', default='us-east-1')
    ap.add_argument('--prompt', choices=sorted(PROMPTS), default='v1')
    ap.add_argument('--lang', choices=('En', 'Ar'), default='En',
                    help='which side of the bilingual scenario the probe reads')
    ap.add_argument('--tag', default='', help='a suffix for the results file, e.g. v2-run1')
    args = ap.parse_args(argv)
    root = Path(args.root)
    out = root / (f'scenario-probe-{args.tag}.json' if args.tag else 'scenario-probe.json')
    rows = json.loads(out.read_text()) if out.exists() else []
    done = {(r['copy'], r['block'], r['model']) for r in rows}
    for d in sorted(root.glob('*__*')):
        lesson = json.loads((d / 'lesson.json').read_text(encoding='utf-8'))
        for b in scenarios(lesson):
            for m in args.models.split(','):
                if (d.name, b['id'], m) in done:
                    continue
                text, usage = judge_bedrock.call_bedrock(build(b, args.prompt, args.lang), m, args.region, max_tokens=6000 if 'kimi' in m else 1500)
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
