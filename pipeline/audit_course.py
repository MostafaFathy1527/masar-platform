#!/usr/bin/env python3
"""Audit a course someone else wrote: read it as a plain document, list defects with quotes.

An experiment, not a panel seat. The panel reads our own lesson.json; a client's course
arrives as a Word file or a PDF, with no schema and no gates. This asks one model to read
the course as plain text and return findings, each with the exact words it objects to.

To measure it, our four samples are flattened to text (`flatten`), and copies with one
planted defect each are made the same way calibrate_judges.py does (plus two defects the
generator really produced on BNK-01: a negative stem with two right answers, and a wrong
answer key). A finding counts as a catch when its category matches the planted defect.
On the real copies every finding is a candidate false alarm, read by hand.

    python pipeline/audit_course.py --out pipeline/out/calibration/2026-11-23-course-audit \
        --models deepseek.v3.2,zai.glm-5 --tag run1

Review one document (the free module review): string checks first, then one model,
written as a markdown report a second reviewer checks point by point before anything
leaves the team. A client's file goes in only after their written consent.

    python pipeline/audit_course.py --report module.txt --models zai.glm-5 --out report.md
"""
from __future__ import annotations

import argparse
import copy
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import calibrate_judges as cj  # noqa: E402
import judge_bedrock  # noqa: E402
import run_lesson  # noqa: E402
import validate  # noqa: E402

CATEGORIES = ('answer_key', 'negative_stem', 'distractors', 'feedback', 'scenario',
              'language_mismatch', 'accuracy', 'other')

PROMPT = """You audit a training course module written by another team. It is shown as a plain
document, English and Arabic side by side; each part starts with a tag like [p3] or [Q2].

Find real defects a learner or a client would be hurt by. Do not report style
preferences, missing extras, or things that are merely different from how you would write.
Check especially:
- answer_key: the marked answer is wrong, or more than one option is correct;
- negative_stem: a question asks "which is NOT / EXCEPT" (or ليس / عدا / باستثناء);
- distractors: wrong options so absurd that nobody would pick them;
- feedback: feedback that only says right/wrong and explains nothing;
- scenario: a consequence that does not follow from the option it sits under;
- language_mismatch: the Arabic and English say different things (numbers, facts, negation),
  or one side is not translated;
- accuracy: a factual error in the subject itself.

Document:
{doc}

Reply with JSON only:
{{"findings": [{{"where": "<tag>", "category": "<one of: {cats}>",
  "quote": "<the exact words, at most 20>", "problem": "<one sentence>",
  "fix": "<one sentence: what to change>"}}]}}
An empty list is a valid answer when the module has no real defect."""


def _md(p: dict, key: str) -> str:
    return (p.get(key + 'En') or '').strip(), (p.get(key + 'Ar') or '').strip()


def flatten(lesson: dict, bank: dict) -> str:
    """The lesson as a client would send it: text only, no ids beyond a short tag."""
    items = {i['key']: i for i in bank.get('items', [])}
    out = [f"# {lesson.get('titleEn', '')} / {lesson.get('titleAr', '')}"]
    n_p = n_q = 0
    for level, blocks in (lesson.get('blocks') or {}).items():
        for b in blocks or []:
            t, p = b.get('type'), b.get('payload') or {}
            if t == 'knowledge_check':
                it = items.get(p.get('itemRef'))
                if not it:
                    continue
                n_q += 1
                lines = [f"[Q{n_q}] {it.get('stemEn', '')}", f"      {it.get('stemAr', '')}"]
                key = []
                for j, o in enumerate(it.get('options', [])):
                    letter = 'ABCDEFG'[j]
                    lines.append(f"  {letter}) {o.get('textEn', '')} / {o.get('textAr', '')}")
                    lines.append(f"     feedback: {o.get('feedbackEn', '')} / {o.get('feedbackAr', '')}")
                    if o.get('isCorrect'):
                        key.append(letter)
                lines.append(f"  Answer key: {', '.join(key)}")
                out.append('\n'.join(lines))
                continue
            n_p += 1
            tag = f'[p{n_p}]'
            if t == 'heading':
                en, ar = _md(p, 'text')
                out.append(f'{tag} ## {en} / {ar}')
            elif t in ('rich_text', 'job_tip', 'callout'):
                en, ar = _md(p, 'md')
                out.append(f'{tag} {en}\n{ar}')
            elif t == 'definition_card':
                out.append(f"{tag} {p.get('termEn', '')}: {p.get('defEn', '')}\n"
                           f"{p.get('termAr', '')}: {p.get('defAr', '')}")
            elif t == 'takeaways':
                out.append(f'{tag} Key points:\n' + '\n'.join(
                    f'- {e} / {a}' for e, a in zip(p.get('itemsEn', []), p.get('itemsAr', []))))
            elif t == 'worked_example':
                steps = '\n'.join(f"  {k + 1}. {s.get('showEn', '')} (why: {s.get('whyEn', '')})"
                                  f" / {s.get('showAr', '')} ({s.get('whyAr', '')})"
                                  for k, s in enumerate(p.get('steps', [])))
                out.append(f"{tag} Worked example: {p.get('promptEn', '')}\n{p.get('promptAr', '')}\n"
                           f"{steps}\n  Answer: {p.get('answerEn', '')} / {p.get('answerAr', '')}")
            elif t == 'scenario':
                ds = '\n'.join(f"  - Option: {d.get('optionEn', '')} / {d.get('optionAr', '')}"
                               f"{' (best)' if d.get('best') or d.get('isBest') else ''}\n"
                               f"    Then: {d.get('consequenceEn', '')} / {d.get('consequenceAr', '')}"
                               for d in p.get('decisions', []))
                out.append(f"{tag} Scenario: {p.get('situationEn', '')}\n{p.get('situationAr', '')}\n{ds}")
            else:
                out.append(f'{tag} ' + json.dumps(p, ensure_ascii=False))
    return '\n\n'.join(out) + '\n'


def wrong_key(lesson: dict, bank: dict):
    bank = copy.deepcopy(bank)
    it = bank['items'][0]
    right = next(o for o in it['options'] if o['isCorrect'])
    wrong = next(o for o in it['options'] if not o['isCorrect'])
    right['isCorrect'], wrong['isCorrect'] = False, True
    return lesson, bank


def negative_stem(lesson: dict, bank: dict):
    """What BNK-01 really did: 'which is NOT', and the old right answer stays marked, so
    every former distractor is now also right."""
    bank = copy.deepcopy(bank)
    it = bank['items'][0]
    it['stemEn'] = 'Which of the following is NOT true?'
    it['stemAr'] = 'أيّ مما يلي ليس صحيحًا؟'
    return lesson, bank


# defect -> (category that counts as a catch, mutation)
DEFECTS = {
    'wrong-key': ('answer_key', wrong_key),
    'negative-stem': (('negative_stem', 'answer_key'), negative_stem),
    'absurd-distractors': ('distractors', cj.absurd_distractors),
    'generic-feedback': ('feedback', cj.generic_feedback),
    'swapped-consequences': ('scenario', cj.swapped_consequences),
    'mismatched-numbers': ('language_mismatch', cj.mismatched_numbers),
}


NAMES = {'answer_key': 'Answer key', 'negative_stem': 'Negative question stem',
         'distractors': 'Weak wrong options', 'feedback': 'Feedback explains nothing',
         'scenario': 'Scenario consequence does not follow', 'language_mismatch':
         'Arabic and English differ', 'accuracy': 'Factual error', 'other': 'Other'}


def string_checks(text: str) -> list[dict]:
    """The defects a model misses and a string check does not (23/11: GLM-5 missed
    generic feedback). Line-based, so they also run on a client's own layout."""
    found = []
    for n, line in enumerate(text.splitlines(), 1):
        neg = validate.negative_stem(line, line)
        if neg:
            found.append({'where': f'line {n}', 'category': 'negative_stem', 'quote': line.strip()[:160],
                          'problem': 'A "which is NOT" question invites two defensible answers.',
                          'fix': 'Ask for the right answer instead.', 'by': 'string check'})
        if line.strip().lower().startswith('feedback:'):
            for part in line.split(':', 1)[1].split(' / '):
                if part.strip() and run_lesson.verdict_only(part):
                    found.append({'where': f'line {n}', 'category': 'feedback', 'quote': part.strip(),
                                  'problem': 'The feedback says right or wrong and not why.',
                                  'fix': 'Name the misconception this option represents.',
                                  'by': 'string check'})
                    break
    # The same empty feedback on eight options is one point for the reader, not eight.
    merged: dict[tuple, dict] = {}
    for f in found:
        k = (f['category'], f['quote'])
        if k in merged:
            merged[k]['where'] += ', ' + f['where'].replace('line ', '')
        else:
            merged[k] = dict(f)
    for f in merged.values():
        if ',' in f['where']:
            f['where'] = f['where'].replace('line ', 'lines ', 1)
    return list(merged.values())


def report_markdown(name: str, findings: list[dict], model: str, usage: dict) -> str:
    lines = [f'# Module review: {name}', '',
             f'Draft for the second reviewer. Every point needs "keep" or "drop" before anything '
             f'reaches the client. Reader: {model} + string checks. No score, no counts outside the team.', '']
    if not findings:
        lines += ['No defects found. The second reviewer still reads the whole file.', '']
    for i, f in enumerate(findings, 1):
        lines += [f'## {i}. {NAMES.get(f.get("category"), "Other")} ({f.get("where", "?")})', '',
                  f'- Quote: "{f.get("quote", "")}"',
                  f'- Why it matters: {f.get("problem", "")}',
                  f'- Suggested fix: {f.get("fix", "")}',
                  f'- Found by: {f.get("by", "model")}',
                  '- Second reviewer: [ ] keep  [ ] drop  note:', '']
    lines += ['---', f'Tokens: {usage.get("inputTokens", 0)} in, {usage.get("outputTokens", 0)} out.', '']
    return '\n'.join(lines)


def review(path: Path, model: str, region: str) -> tuple[list[dict], dict]:
    text = path.read_text(encoding='utf-8')
    found = string_checks(text)
    prompt = PROMPT.format(doc=text, cats=', '.join(CATEGORIES))
    raw, usage = judge_bedrock.call_bedrock(prompt, model, region, max_tokens=3000)
    model_found = judge_bedrock.extract_json(raw).get('findings', [])
    seen = {(f['category'], f['quote']) for f in found}
    for f in model_found:
        if (f.get('category'), f.get('quote')) not in seen:
            found.append(dict(f, by='model'))
    return found, usage


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    ap.add_argument('--models', required=True)
    ap.add_argument('--region', default='us-east-1')
    ap.add_argument('--tag', default='run1')
    ap.add_argument('--samples', default=','.join(cj.SAMPLES))
    ap.add_argument('--build-only', action='store_true')
    ap.add_argument('--report', type=Path, help='review this one plain-text document')
    args = ap.parse_args(argv)
    if args.report:
        model = args.models.split(',')[0]
        found, usage = review(args.report, model, args.region)
        Path(args.out).write_text(report_markdown(args.report.name, found, model, usage), encoding='utf-8')
        print(f'{len(found)} finding(s) -> {args.out}; usage {usage}')
        return 0
    root = Path(args.out)
    root.mkdir(parents=True, exist_ok=True)
    copies = []
    for s in args.samples.split(','):
        src = cj.qa_gate.REPO / s
        lesson = json.loads((src / 'lesson.json').read_text(encoding='utf-8'))
        bank = json.loads((src / 'items.json').read_text(encoding='utf-8'))
        name = src.parent.name
        variants = {'real': (lesson, bank)}
        for d, (_, fn) in DEFECTS.items():
            try:
                variants[d] = fn(lesson, bank)
            except cj.NotApplicable:
                pass
        for d, (l2, b2) in variants.items():
            f = root / f'{name}__{d}.txt'
            f.write_text(flatten(l2, b2), encoding='utf-8')
            copies.append((name, d, f))
    print(f'{len(copies)} documents in {root}')
    if args.build_only:
        return 0
    out = root / f'audit-{args.tag}.json'
    rows = json.loads(out.read_text()) if out.exists() else []
    done = {(r['sample'], r['defect'], r['model']) for r in rows}
    for name, d, f in copies:
        for m in args.models.split(','):
            if (name, d, m) in done:
                continue
            prompt = PROMPT.format(doc=f.read_text(encoding='utf-8'), cats=', '.join(CATEGORIES))
            text, usage = judge_bedrock.call_bedrock(prompt, m, args.region, max_tokens=3000)
            try:
                findings = judge_bedrock.extract_json(text).get('findings', [])
            except Exception:
                findings = None
            want = DEFECTS[d][0] if d in DEFECTS else None
            want = (want,) if isinstance(want, str) else want
            caught = None if want is None or findings is None else any(
                x.get('category') in want for x in findings)
            rows.append({'sample': name, 'defect': d, 'model': m, 'caught': caught,
                         'n_findings': None if findings is None else len(findings),
                         'findings': findings if findings is not None else text[:800], 'usage': usage})
            out.write_text(json.dumps(rows, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
            print(f'{name} {d} {m}: caught={caught} findings={rows[-1]["n_findings"]}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
