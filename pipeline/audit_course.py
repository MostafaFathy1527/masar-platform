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
  "quote": "<the exact words, at most 20>", "problem": "<one sentence>"}}]}}
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


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    ap.add_argument('--models', required=True)
    ap.add_argument('--region', default='us-east-1')
    ap.add_argument('--tag', default='run1')
    ap.add_argument('--samples', default=','.join(cj.SAMPLES))
    ap.add_argument('--build-only', action='store_true')
    args = ap.parse_args(argv)
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
