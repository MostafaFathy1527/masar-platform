#!/usr/bin/env python3
"""The concept log: a content invariant a human editor cannot hold in their head.

Across a course, two failures are almost invisible to review and obvious to a
learner:

  RE-DEFINITION  — lesson 7 explains "denial" from scratch, as though lesson 4
                   had not already defined it. The learner concludes they must
                   have missed something, or that the course is not paying
                   attention to itself.

  FORWARD REFERENCE — lesson 3 uses "clean claim" as though it were established,
                   when it is not introduced until lesson 4. The learner is
                   asked to rely on something they have not been given.

A reviewer catches these in a course of five lessons. Nobody catches them
reliably across a hundred and twenty, which is the scale this pipeline exists
to serve — so they are checked mechanically.

The log is the memory: each concept records the lesson that first taught it and
what reuse is permitted afterwards.

    python pipeline/concept_log.py --check      # verify, exit 1 on findings
    python pipeline/concept_log.py --rebuild    # regenerate from the lessons
"""

from __future__ import annotations

import argparse
import io
import json
import re
import sys
from dataclasses import dataclass, asdict
from pathlib import Path

LOG_PATH = Path('pipeline/memory/concept-log.json')
LESSON_GLOB = 'content/courses/*/lessons/*.json'

# What a later lesson may do with a concept an earlier one introduced.
#   DEFINE  — may define it (only the introducing lesson)
#   APPLY   — may use it in a task without re-explaining
#   RECALL  — may remind the reader in a clause, not a definition block
REUSE_LEVELS = ('DEFINE', 'RECALL', 'APPLY')


@dataclass
class Finding:
    lesson: str
    rule: str
    message: str

    def __str__(self) -> str:
        return f'{self.lesson}\n    [{self.rule}] {self.message}'


def lesson_order(path: Path) -> int:
    """Lessons are sequenced by their filename prefix, which is the order a
    learner meets them. A concept is only 'earlier' relative to that."""
    m = re.match(r'(\d+)', path.name)
    return int(m.group(1)) if m else 9999


def load_lessons() -> list[tuple[Path, dict]]:
    paths = sorted(Path().glob(LESSON_GLOB), key=lesson_order)
    return [(p, json.loads(p.read_text(encoding='utf-8'))) for p in paths]


def definition_terms(doc: dict) -> set[str]:
    """Concepts this lesson actually DEFINES, as opposed to mentions.

    A definition_card is an explicit definition. Everything else is prose, and
    prose that happens to contain a term is not a definition.
    """
    terms: set[str] = set()
    for level in ('l1', 'l2', 'l3'):
        for block in doc.get('blocks', {}).get(level) or []:
            if block.get('type') == 'definition_card':
                payload = block.get('payload', {})
                # English term only: conceptsIntroduced keys are English
                # snake_case, and an Arabic term normalises to an empty slug
                # under an ASCII rule, which would invent a phantom concept.
                key = normalise(str(payload.get('termEn', '')))
                if key:
                    terms.add(key)
    return terms


def normalise(term: str) -> str:
    return re.sub(r'[^a-z0-9]+', '_', term.strip().lower()).strip('_')


def lesson_text(doc: dict) -> str:
    parts: list[str] = []

    def walk(node):
        if isinstance(node, dict):
            for k, v in node.items():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)
        elif isinstance(node, str):
            parts.append(node)

    walk(doc.get('blocks', {}))
    return ' '.join(parts).lower()


def check(lessons: list[tuple[Path, dict]]) -> list[Finding]:
    findings: list[Finding] = []
    introduced_by: dict[str, str] = {}

    for path, doc in lessons:
        name = str(path).replace('\\', '/')
        declared = {normalise(c) for c in doc.get('conceptsIntroduced', [])}
        defined = definition_terms(doc)

        # A concept another lesson already introduced must not be re-declared
        # as new here.
        for concept in sorted(declared):
            if concept in introduced_by and introduced_by[concept] != name:
                findings.append(Finding(
                    name, 'redefines-concept',
                    f'"{concept}" is declared as introduced here, but lesson '
                    f'{introduced_by[concept]} already introduces it. A later lesson may '
                    f'recall or apply a concept, not re-introduce it.'))
            else:
                introduced_by.setdefault(concept, name)

        # A definition block for a concept an earlier lesson defined is the
        # same failure, caught in the content rather than the declaration.
        for term in sorted(defined):
            if term in introduced_by and introduced_by[term] != name:
                findings.append(Finding(
                    name, 'redefines-concept',
                    f'defines "{term}", which lesson {introduced_by[term]} already '
                    f'defines. Recall it instead of defining it again.'))

        # Anything defined here should be declared here, or the log drifts away
        # from the content it is supposed to track.
        for term in sorted(defined - declared):
            if term not in introduced_by or introduced_by[term] == name:
                findings.append(Finding(
                    name, 'undeclared-concept',
                    f'defines "{term}" but does not list it in conceptsIntroduced'))
                introduced_by.setdefault(term, name)

    # Forward references: a concept used before any lesson introduces it.
    for path, doc in lessons:
        name = str(path).replace('\\', '/')
        order = lesson_order(path)
        text = lesson_text(doc)
        for concept, owner in introduced_by.items():
            owner_order = lesson_order(Path(owner))
            if owner_order <= order:
                continue
            phrase = concept.replace('_', ' ')
            # Only flag a substantive phrase; single short words produce noise.
            if len(phrase) < 8 or ' ' not in phrase:
                continue
            if phrase in text:
                findings.append(Finding(
                    name, 'forward-reference',
                    f'uses "{phrase}", which is not introduced until {owner}'))

    return findings


def rebuild(lessons: list[tuple[Path, dict]]) -> dict:
    concepts: dict[str, dict] = {}
    for path, doc in lessons:
        name = str(path).replace('\\', '/')
        for raw in doc.get('conceptsIntroduced', []):
            key = normalise(raw)
            if key in concepts:
                continue
            snippet = ''
            for level in ('l1', 'l2', 'l3'):
                for block in doc.get('blocks', {}).get(level) or []:
                    if block.get('type') == 'definition_card':
                        payload = block.get('payload', {})
                        if normalise(str(payload.get('termEn', ''))) == key:
                            snippet = str(payload.get('defEn', ''))[:200]
            concepts[key] = {
                'label': raw,
                'firstTaughtLesson': name,
                'definitionSnippet': snippet,
                'allowedReuse': 'APPLY',
            }
    return {
        'note': 'GENERATED by pipeline/concept_log.py --rebuild. The pipeline reads this '
                'before generating a lesson, so it knows what has already been taught and '
                'what it may only recall.',
        'concepts': dict(sorted(concepts.items())),
    }


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--rebuild', action='store_true')
    args = ap.parse_args(argv)

    lessons = load_lessons()
    if not lessons:
        print('error: no lessons found', file=sys.stderr)
        return 2

    if args.rebuild:
        LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        log = rebuild(lessons)
        io.open(LOG_PATH, 'w', encoding='utf-8', newline='\n').write(
            json.dumps(log, ensure_ascii=False, indent=2) + '\n')
        print(f'rebuilt {LOG_PATH}: {len(log["concepts"])} concepts across {len(lessons)} lessons')
        return 0

    findings = check(lessons)
    print(f'checked {len(lessons)} lesson(s)')
    if not findings:
        print('PASS - no findings')
        return 0
    print(f'\nFAIL - {len(findings)} finding(s):\n')
    for f in findings:
        print(f)
    return 1


if __name__ == '__main__':
    raise SystemExit(main())
