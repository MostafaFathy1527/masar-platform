#!/usr/bin/env python3
"""The rubric gate: applies thresholds to a judge's scores and records the run.

The judging is done by a fresh-context pass that never sees the generation
prompt. This script does NOT call a model — no metered API sits anywhere in this
pipeline, by design. It consumes the judge's verdict, applies the gate, writes a
report, and appends the run to the log.

Separating the two matters: a judge that also decided pass/fail could move the
threshold to suit the score. Here the thresholds live in code, in version
control, and every run is appended to memory/run-log.jsonl — including failures,
because a logged history containing only successes is not evidence of anything.

    python pipeline/qa_gate.py --verdict out/lesson-05/v1/verdict.json
    python pipeline/qa_gate.py --verdict v.json --dry-run   # no log entry

Exit codes: 0 pass, 1 gate failure, 2 could not run.
"""

from __future__ import annotations

import argparse
import io
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate import BLOCK_LEVELS  # noqa: E402  single source of the level rules

RUN_LOG = Path('pipeline/memory/run-log.jsonl')

CRITERIA = (
    'objective_alignment',
    'level_fidelity',
    'worked_example',
    'knowledge_check',
    'scenario_authenticity',
    'bilingual_quality',
    'concision',
    'accessibility_ip',
)

# Which block type each criterion is written about. BLOCK_LEVELS is imported
# from validate.py rather than restated here, so the gate and the content
# validator cannot disagree about what a level permits.
CRITERION_BLOCK = {
    'worked_example': 'worked_example',
    'knowledge_check': 'knowledge_check',
    'scenario_authenticity': 'scenario',
}

# When a criterion's block is unavailable at the lesson's levels, there are two
# different situations, and collapsing them loses real signal.
#
# Criterion 4 asks whether distractors come from real misconceptions and whether
# per-option feedback explains rather than restates. Nothing but a
# knowledge_check block carries distractors or per-option feedback, so at L1
# there is no evidence of any kind and any score is invented.
#
# Criteria 3 and 5 ask about qualities, not containers: whether reasoning names
# the judgement being made, and whether a situation is recognisable. Those can
# appear in prose and in job tips. A judge that assesses them from substitute
# evidence is doing more work, not less, and refusing that score would discard a
# real finding — so it is allowed, provided the note says what was scored.
UNSCORABLE_WITHOUT_BLOCK = frozenset({'knowledge_check'})

MIN_CRITERION = 3
MIN_MEAN = 4.0


def block_available(criterion: str, levels: set[str]) -> bool:
    """Can this criterion's own block type appear in a lesson at these levels?"""
    block = CRITERION_BLOCK.get(criterion)
    return block is None or bool(levels & BLOCK_LEVELS[block])


def lesson_levels(verdict_path: Path, lesson_path: Path | None) -> set[str]:
    """The declared levels of the lesson this verdict is about.

    Applicability is derived from these, never from the judge's discretion. A
    judge able to declare a criterion inapplicable at will is a judge setting
    its own threshold, which is the thing splitting scoring from pass/fail was
    meant to prevent.

    Defaults to lesson.json beside the verdict. A missing lesson is a hard error
    rather than an assumption that everything applies: guessing here would
    quietly restore the behaviour this change exists to remove.
    """
    path = lesson_path or verdict_path.parent / 'lesson.json'
    try:
        doc = json.loads(path.read_text(encoding='utf-8'))
    except FileNotFoundError as e:
        raise GateError(
            f'lesson not found: {path}. The gate derives which criteria apply from the '
            f"lesson's declared levels; pass --lesson if it is not beside the verdict."
        ) from e
    except json.JSONDecodeError as e:
        raise GateError(f'lesson is not valid JSON: {e}') from e

    levels = {str(x).upper() for x in doc.get('levels', [])}
    if not levels or not levels <= {'L1', 'L2', 'L3'}:
        raise GateError(f'lesson declares no usable levels: {sorted(levels) or "[]"}')
    return levels

# Everywhere this number is shown. Section 0.4 item 5: never presented as
# quality assurance, never in the same table or sentence as a human work figure.
SCORE_LABEL = 'LLM rubric score, fresh-context judge, self-assessed — not human QA'


class GateError(Exception):
    pass


def load_verdict(path: Path, levels: set[str]) -> dict:
    try:
        verdict = json.loads(path.read_text(encoding='utf-8'))
    except FileNotFoundError as e:
        raise GateError(f'verdict not found: {path}') from e
    except json.JSONDecodeError as e:
        raise GateError(f'verdict is not valid JSON: {e}') from e

    scores = verdict.get('scores')
    if not isinstance(scores, dict):
        raise GateError('verdict has no "scores" object')

    for name, value in scores.items():
        if name not in CRITERIA:
            raise GateError(f'unknown criterion "{name}"')
        if not isinstance(value, int) or not 1 <= value <= 5:
            raise GateError(f'{name} = {value!r}; scores must be integers 1-5')

    not_scored = verdict.get('not_scored') or {}
    if not isinstance(not_scored, dict):
        raise GateError('"not_scored" must be an object mapping criterion to reason')
    unknown = [c for c in not_scored if c not in CRITERIA]
    if unknown:
        raise GateError(f'"not_scored" names unknown criteria: {", ".join(sorted(unknown))}')

    notes = verdict.get('notes') or {}
    level_text = ', '.join(sorted(levels))
    skipped = []

    for criterion in CRITERIA:
        scored = criterion in scores
        reason = not_scored.get(criterion)
        declared = isinstance(reason, str) and bool(reason.strip())

        if criterion in not_scored and not declared:
            raise GateError(f'{criterion} is in "not_scored" with no reason given')
        if scored and declared:
            raise GateError(f'{criterion} is both scored and declared not scored')

        if block_available(criterion, levels):
            # Nothing here excuses a criterion the lesson can actually satisfy.
            if not scored:
                raise GateError(
                    f'verdict is missing {criterion}, which applies at levels {level_text}'
                )
            continue

        if criterion in UNSCORABLE_WITHOUT_BLOCK:
            # THE TRAP THIS CLOSES. Permitting a criterion to be skipped is only
            # safe if scoring it anyway is refused. Otherwise the repair
            # legitimises the fabrication it exists to prevent.
            if scored:
                raise GateError(
                    f'verdict scores {criterion} for a lesson at levels {level_text}, where '
                    f'the registry forbids the block it describes. There is no evidence of '
                    f'any kind to score, so the score is invented.'
                )
            if not declared:
                raise GateError(
                    f'{criterion} cannot be scored at levels {level_text} and must be '
                    f'declared in "not_scored" with a reason'
                )
            skipped.append(criterion)
            continue

        # Scorable from substitute evidence — but the note has to say what was
        # actually read, or "scored anyway" is indistinguishable from invented.
        if scored:
            note = notes.get(criterion)
            if not isinstance(note, str) or not note.strip():
                raise GateError(
                    f'{criterion} is scored at levels {level_text}, where its own block type '
                    f'is unavailable. That is allowed, but "notes.{criterion}" must say what '
                    f'evidence was scored instead.'
                )
        elif declared:
            skipped.append(criterion)
        else:
            raise GateError(
                f'{criterion} is neither scored nor declared in "not_scored"'
            )

    verdict['_scored'] = tuple(c for c in CRITERIA if c in scores)
    verdict['_skipped'] = tuple(skipped)
    verdict['_levels'] = sorted(levels)
    return verdict


def evaluate(verdict: dict) -> dict:
    # Both thresholds are taken over the scored set only. Averaging a skipped
    # criterion as zero would fail every compliant L1 lesson; averaging it as
    # anything else would be inventing the number by another route.
    scored = verdict.get('_scored') or tuple(c for c in CRITERIA if c in verdict['scores'])
    scores = {c: verdict['scores'][c] for c in scored}
    mean = sum(scores.values()) / len(scores)
    below = sorted(c for c, v in scores.items() if v < MIN_CRITERION)

    # Stated separately so a report can say WHICH threshold failed. A lesson
    # that is mediocre everywhere and one that is unacceptable in a single place
    # are different problems with different fixes.
    passed = not below and mean >= MIN_MEAN

    return {
        'lesson': verdict.get('lesson', '(unnamed)'),
        'scores': scores,
        'mean': round(mean, 2),
        'below_floor': below,
        'failed_floor': bool(below),
        'failed_mean': mean < MIN_MEAN,
        'passed': passed,
        'notes': verdict.get('notes', {}),
        'verdict_notes': verdict.get('verdict_notes', ''),
        'levels': verdict.get('_levels', []),
        'not_scored': {c: (verdict.get('not_scored') or {}).get(c, '')
                       for c in (verdict.get('_skipped') or ())},
        # The judge's own statement of how independent it was, carried into the
        # result so it travels with the number instead of staying in a file
        # nobody opens beside the score.
        'judge': verdict.get('judge', {}),
    }


def report(result: dict) -> str:
    lines = [
        f'# QA gate report — {result["lesson"]}',
        '',
        f'**Result: {"PASS" if result["passed"] else "FAIL"}**',
        '',
        f'Mean {result["mean"]:.2f} over {len(result["scores"])} scored criteria '
        f'(threshold {MIN_MEAN}); '
        f'lowest criterion {min(result["scores"].values())} (floor {MIN_CRITERION}).',
        '',
        f'Lesson levels: {", ".join(result["levels"]) or "unknown"}.',
        '',
        f'> {SCORE_LABEL}',
        '',
        '| Criterion | Score | Note |',
        '|---|---|---|',
    ]
    for name, value in result['scores'].items():
        note = str(result['notes'].get(name, '')).replace('|', '\\|')
        flag = ' ⚠' if value < MIN_CRITERION else ''
        lines.append(f'| {name.replace("_", " ")} | {value}{flag} | {note} |')

    if result['not_scored']:
        lines.extend(['', '**Not scored at this lesson\'s levels:**', ''])
        for name, reason in result['not_scored'].items():
            lines.append(f'- `{name.replace("_", " ")}` — {reason}')

    caveat = (result.get('judge') or {}).get('independence_caveat')
    if caveat:
        lines.extend(['', '**Judge independence:**', '', f'> {caveat}'])

    lines.append('')
    if result['failed_floor']:
        lines.append(f'**Below the floor:** {", ".join(result["below_floor"])}. '
                     'A single unacceptable criterion fails the gate regardless of the mean.')
    if result['failed_mean']:
        lines.append(f'**Mean {result["mean"]:.2f} is below {MIN_MEAN}.**')
    if result['verdict_notes']:
        lines.extend(['', "Judge's summary:", '', f'> {result["verdict_notes"]}'])
    if not result['passed']:
        lines.extend(['', 'The pipeline retries once with this report appended to the '
                          'prompt, then stops for a human decision.'])
    return '\n'.join(lines) + '\n'


def append_run(result: dict, verdict_path: Path) -> None:
    RUN_LOG.parent.mkdir(parents=True, exist_ok=True)
    entry = {
        'at': datetime.now(timezone.utc).isoformat(),
        'lesson': result['lesson'],
        'verdict': str(verdict_path).replace('\\', '/'),
        'scores': result['scores'],
        'mean': result['mean'],
        'passed': result['passed'],
        'below_floor': result['below_floor'],
        'score_label': SCORE_LABEL,
        'levels': result['levels'],
        'scored_criteria': len(result['scores']),
        'not_scored': sorted(result['not_scored']),
        # Recorded per run so the caveat cannot be separated from the score it
        # qualifies, wherever the log is read from later.
        'independence_caveat': (result.get('judge') or {}).get('independence_caveat', ''),
    }
    with io.open(RUN_LOG, 'a', encoding='utf-8', newline='\n') as fh:
        fh.write(json.dumps(entry, ensure_ascii=False) + '\n')


def main(argv: list[str] | None = None) -> int:
    # Windows consoles default to cp1252, and the report quotes whatever the
    # judge wrote — the icon '☷' in one note crashed this script outright.
    # On an Arabic-first project that is not an edge case: any Arabic note would
    # have done the same. A gate must not fail on the content it is reporting.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass

    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--verdict', type=Path, required=True)
    ap.add_argument('--lesson', type=Path,
                    help='lesson.json; defaults to the one beside the verdict')
    ap.add_argument('--report', type=Path, help='where to write qa-report.md')
    ap.add_argument('--dry-run', action='store_true', help='do not append to the run log')
    args = ap.parse_args(argv)

    try:
        levels = lesson_levels(args.verdict, args.lesson)
        result = evaluate(load_verdict(args.verdict, levels))
    except GateError as e:
        print(f'error: {e}', file=sys.stderr)
        return 2

    text = report(result)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        io.open(args.report, 'w', encoding='utf-8', newline='\n').write(text)
        print(f'wrote {args.report}')
    else:
        print(text)

    if not args.dry_run:
        append_run(result, args.verdict)

    return 0 if result['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
