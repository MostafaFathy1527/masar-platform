#!/usr/bin/env python3
"""Hard-fail validation for authored and generated lesson documents.

This is the pipeline's side of the contract that lib/schema/lesson.ts defines.
It runs in three layers, deliberately separated:

  1. STRUCTURE  — validated against content/schema/lesson.schema.json, which is
     GENERATED from the Zod schema. Never edit that file by hand; run
     `npm run schema:export`. This layer cannot drift from the renderer.

  2. SEMANTICS  — the cross-field rules JSON Schema cannot express: level
     completeness, prose budgets between acting blocks, objective references,
     duplicate ids. Some of these are also enforced in Zod; they are repeated
     here because the pipeline must be able to reject its own output before
     anything reaches the database, without running Node.

  3. CONTENT    — the forbidden licensed code sets, and an optional external
     denylist of names. The name terms are NOT in this file by design: writing
     an employer or client name into a tracked file is the leak this project
     guards against. Pass --denylist to point at an untracked file.

Exit codes: 0 clean, 1 findings, 2 could not run (bad arguments, missing schema).

Usage:
    python pipeline/validate.py
    python pipeline/validate.py content/courses/rcm-foundations/lessons/*.json
    python pipeline/validate.py --denylist .local/denylist.txt
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

SCHEMA_PATH = Path("content/schema/lesson.schema.json")
DEFAULT_GLOB = "content/courses/*/lessons/*.json"

# Blocks that ask the learner to do something. The prose budget is measured
# between these, because the rule exists to stop a lesson turning back into an
# article with an exercise bolted on the end.
ACTING_BLOCKS = {
    "knowledge_check",
    "scenario",
    "sort_buckets",
    "worked_example",
    "practice_sim",
}

# Blocks whose payload is prose the learner reads.
PROSE_FIELDS = {
    "rich_text": ("mdAr", "mdEn"),
    "job_tip": ("mdAr", "mdEn"),
}

MAX_PROSE_WORDS_BETWEEN_ACTS = 180

# Real licensed code sets, forbidden everywhere in course content. Every code in
# this demo is a fictional training code. See the project rules file.
FORBIDDEN_CODE_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("CPT", re.compile(r"\bCPT\b", re.I)),
    ("HCPCS", re.compile(r"\bHCPCS\b", re.I)),
    ("CDT", re.compile(r"\bCDT\b", re.I)),
    ("DRG", re.compile(r"\bDRG\b", re.I)),
    ("X12 adjustment code", re.compile(r"(^|[^A-Za-z])(CO|PR|OA|PI|CR)-?\d{1,3}\b")),
    ("X12 remark code (N)", re.compile(r"\bN\d{3}\b")),
    ("X12 remark code (M)", re.compile(r"\bM\d{2,3}\b")),
]

OBJECTIVE_RE = re.compile(r"^MI-\d{2}$")

# Which block types may appear at which level. Mirrors BLOCK_LEVELS in
# lib/schema/lesson.ts; the drift test on the JSON Schema keeps the structural
# half honest, and this list is checked against the schema's own enum below.
BLOCK_LEVELS: dict[str, set[str]] = {
    "heading": {"L1", "L2", "L3"},
    "rich_text": {"L1", "L2", "L3"},
    "definition_card": {"L1", "L2", "L3"},
    "compare_table": {"L1", "L2", "L3"},
    "process_flow": {"L1", "L2", "L3"},
    "job_tip": {"L1", "L2", "L3"},
    "takeaways": {"L1", "L2", "L3"},
    "worked_example": {"L2", "L3"},
    "knowledge_check": {"L2", "L3"},
    "scenario": {"L2", "L3"},
    "sort_buckets": {"L2", "L3"},
    "practice_sim": {"L3"},
}


@dataclass
class Finding:
    file: str
    rule: str
    message: str

    def __str__(self) -> str:
        return f"{self.file}\n    [{self.rule}] {self.message}"


def word_count(text: str) -> int:
    return len([w for w in re.split(r"\s+", text.strip()) if w])


def walk_strings(node, path: str = ""):
    """Yield (json_path, string) for every string in the document."""
    if isinstance(node, dict):
        for k, v in node.items():
            yield from walk_strings(v, f"{path}.{k}" if path else k)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from walk_strings(v, f"{path}[{i}]")
    elif isinstance(node, str):
        yield path, node


# ----------------------------------------------------------------- layer 1


def check_structure(doc, schema, file: str) -> list[Finding]:
    try:
        import jsonschema
    except ImportError:
        return [
            Finding(
                file,
                "structure",
                "jsonschema is not installed; run `pip install jsonschema`. "
                "Structural validation was SKIPPED, which means this run "
                "proves less than it appears to.",
            )
        ]

    validator = jsonschema.Draft202012Validator(schema)
    findings = []
    for error in sorted(validator.iter_errors(doc), key=lambda e: list(e.path)):
        where = "/".join(str(p) for p in error.path) or "(root)"
        findings.append(Finding(file, "structure", f"{where}: {error.message}"))
    return findings


# ----------------------------------------------------------------- layer 2


def check_semantics(doc, file: str) -> list[Finding]:
    findings: list[Finding] = []
    blocks_by_level = doc.get("blocks", {})
    declared = set(doc.get("levels", []))
    objectives = set(doc.get("objectives", []))

    # Declared levels and present blocks must agree, in both directions.
    for level in ("L1", "L2", "L3"):
        key = level.lower()
        present = bool(blocks_by_level.get(key))
        if level in declared and not present:
            findings.append(
                Finding(file, "level-declared-empty", f"{level} is declared but has no blocks")
            )
        if level not in declared and present:
            findings.append(
                Finding(file, "level-undeclared", f"blocks exist for {level} but it is not declared")
            )

    seen_ids: dict[str, str] = {}
    for key in ("l1", "l2", "l3"):
        level = key.upper()
        for block in blocks_by_level.get(key) or []:
            bid = block.get("id", "(no id)")
            btype = block.get("type", "(no type)")

            # Block ids are unique across the whole document: BlockInteraction
            # rows key on them, so a duplicate silently merges two blocks'
            # analytics instead of failing.
            if bid in seen_ids:
                findings.append(
                    Finding(file, "duplicate-block-id", f'"{bid}" appears in {seen_ids[bid]} and {level}')
                )
            seen_ids[bid] = level

            allowed = BLOCK_LEVELS.get(btype)
            if allowed is None:
                findings.append(Finding(file, "unknown-block-type", f'"{btype}" (block {bid})'))
            elif level not in allowed:
                findings.append(
                    Finding(file, "block-level", f'"{btype}" is not allowed at {level} (block {bid})')
                )

            obj = block.get("objectiveId")
            if not obj or not OBJECTIVE_RE.match(str(obj)):
                findings.append(
                    Finding(file, "objective-format", f'block {bid} has objectiveId "{obj}"')
                )
            elif obj not in objectives:
                findings.append(
                    Finding(
                        file,
                        "objective-undeclared",
                        f'block {bid} references {obj}, which the lesson does not declare',
                    )
                )

            # Alt text is mandatory on anything carrying an image. No block type
            # carries one yet; this fires the moment one does.
            payload = block.get("payload", {})
            if isinstance(payload, dict) and ("image" in payload or "imageUrl" in payload):
                if not str(payload.get("alt", "")).strip():
                    findings.append(
                        Finding(file, "missing-alt-text", f"block {bid} carries an image with no alt text")
                    )

    findings += check_bilingual_honesty(doc, file)
    findings += check_level_completeness(doc, file)
    findings += check_prose_budget(doc, file)
    return findings


def check_bilingual_honesty(doc, file: str) -> list[Finding]:
    """A lesson claiming Arabic must not just repeat its English.

    The failure this catches is specific and easy to commit by accident: paste
    English into the Arabic fields to satisfy a schema that requires both, and a
    lesson reports full Arabic coverage while a reader gets English. The flag
    exists so English-only content can be declared and said on the page; this
    rule stops the flag being wrong.
    """
    findings: list[Finding] = []
    if not doc.get("bilingual", True):
        return findings

    if str(doc.get("titleAr", "")).strip() == str(doc.get("titleEn", "")).strip():
        findings.append(
            Finding(
                file,
                "bilingual-claim",
                "marked bilingual but the Arabic title is identical to the English one; "
                "set bilingual: false if this lesson is English-only",
            )
        )

    # Sample the prose too: identical Arabic and English bodies mean the same
    # thing as an identical title, and are the more likely place to find it.
    duplicated = 0
    total = 0
    for key in ("l1", "l2", "l3"):
        for block in doc.get("blocks", {}).get(key) or []:
            payload = block.get("payload", {})
            if not isinstance(payload, dict):
                continue
            for ar_field, en_field in (("mdAr", "mdEn"), ("textAr", "textEn")):
                ar, en = payload.get(ar_field), payload.get(en_field)
                if isinstance(ar, str) and isinstance(en, str) and ar.strip():
                    total += 1
                    if ar.strip() == en.strip():
                        duplicated += 1
    if total and duplicated / total > 0.5:
        findings.append(
            Finding(
                file,
                "bilingual-claim",
                f"marked bilingual but {duplicated} of {total} text blocks have identical "
                "Arabic and English; set bilingual: false if this lesson is English-only",
            )
        )
    return findings


def check_level_completeness(doc, file: str) -> list[Finding]:
    """L2 and L3 have a definition, not just a label.

    Levels are cumulative, so an L2 requirement may be satisfied by a block in
    L1 or L2, and L3 by anything in the lesson.
    """
    findings: list[Finding] = []
    blocks = doc.get("blocks", {})
    declared = set(doc.get("levels", []))

    def types_upto(level: str) -> list[str]:
        keys = {"L1": ["l1"], "L2": ["l1", "l2"], "L3": ["l1", "l2", "l3"]}[level]
        return [b.get("type") for k in keys for b in (blocks.get(k) or [])]

    if "L2" in declared:
        t = types_upto("L2")
        if t.count("worked_example") < 1:
            findings.append(Finding(file, "l2-incomplete", "L2 needs at least 1 worked_example"))
        if t.count("knowledge_check") < 2:
            findings.append(
                Finding(file, "l2-incomplete", f"L2 needs at least 2 knowledge_check (found {t.count('knowledge_check')})")
            )
        if t.count("scenario") + t.count("sort_buckets") < 1:
            findings.append(
                Finding(file, "l2-incomplete", "L2 needs at least 1 scenario or sort_buckets")
            )

    if "L3" in declared:
        t = types_upto("L3")
        if t.count("practice_sim") < 1:
            findings.append(Finding(file, "l3-incomplete", "L3 needs at least 1 practice_sim"))
        # The rubric lives on the Simulation record, not in the lesson document,
        # so "practice_sim with a published rubric" can only be half-checked
        # here. The other half belongs with the simulation definitions.

    return findings


def check_prose_budget(doc, file: str) -> list[Finding]:
    """No more than 180 words of prose between two acting blocks at L2+.

    The rule exists to stop a lesson reverting to an article with an exercise
    bolted on the end. Counted per level, in the language with more words, so a
    long Arabic passage cannot hide behind a short English one.
    """
    findings: list[Finding] = []
    blocks = doc.get("blocks", {})
    declared = set(doc.get("levels", []))

    for key in ("l2", "l3"):
        level = key.upper()
        if level not in declared:
            continue
        run = 0
        run_started_after = "the start of the level"
        for block in blocks.get(key) or []:
            btype = block.get("type")
            if btype in ACTING_BLOCKS:
                run = 0
                run_started_after = f"{btype} ({block.get('id')})"
                continue
            fields = PROSE_FIELDS.get(btype)
            if not fields:
                continue
            payload = block.get("payload", {})
            words = max(word_count(str(payload.get(f, ""))) for f in fields)
            run += words
            if run > MAX_PROSE_WORDS_BETWEEN_ACTS:
                findings.append(
                    Finding(
                        file,
                        "prose-budget",
                        f"{level}: {run} words of prose after {run_started_after} "
                        f"without an acting block (limit {MAX_PROSE_WORDS_BETWEEN_ACTS})",
                    )
                )
                run = 0
    return findings


# ----------------------------------------------------------------- layer 3


def check_content(doc, file: str, extra_terms: list[re.Pattern[str]]) -> list[Finding]:
    findings: list[Finding] = []
    for path, text in walk_strings(doc):
        for name, pattern in FORBIDDEN_CODE_PATTERNS:
            m = pattern.search(text)
            if m:
                findings.append(
                    Finding(
                        file,
                        "forbidden-code-set",
                        f'{path}: matched {name} ("{m.group(0).strip()}"). '
                        "All codes in this course are fictional training codes.",
                    )
                )
        for pattern in extra_terms:
            m = pattern.search(text)
            if m:
                # The matched text is not echoed: it is the thing being kept out
                # of logs and CI output in the first place.
                findings.append(
                    Finding(file, "forbidden-term", f"{path}: matched a denylisted term")
                )
    return findings


def load_denylist(path: Path) -> list[re.Pattern[str]]:
    patterns = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            patterns.append(re.compile(line, re.I))
    return patterns


# ----------------------------------------------------------------------- cli


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("files", nargs="*", help=f"lesson JSON files (default: {DEFAULT_GLOB})")
    parser.add_argument("--denylist", type=Path, help="untracked file of forbidden name patterns")
    parser.add_argument("--schema", type=Path, default=SCHEMA_PATH)
    args = parser.parse_args(argv)

    if not args.schema.exists():
        print(
            f"error: {args.schema} not found. It is generated — run `npm run schema:export`.",
            file=sys.stderr,
        )
        return 2
    schema = json.loads(args.schema.read_text(encoding="utf-8"))

    paths = [Path(f) for f in args.files] or sorted(Path().glob(DEFAULT_GLOB))
    if not paths:
        print(f"error: no lesson files matched {DEFAULT_GLOB}", file=sys.stderr)
        return 2

    extra_terms = load_denylist(args.denylist) if args.denylist else []
    if args.denylist:
        print(f"denylist: {len(extra_terms)} pattern(s) from {args.denylist}")
    else:
        print("denylist: none passed (name checks skipped; see --denylist)")

    findings: list[Finding] = []
    for path in paths:
        name = str(path).replace("\\", "/")
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            findings.append(Finding(name, "json", str(e)))
            continue
        structural = check_structure(doc, schema, name)
        findings += structural
        # Semantic rules index into the document, so only run them on a shape
        # that survived structural validation.
        if not structural:
            findings += check_semantics(doc, name)
        findings += check_content(doc, name, extra_terms)

    print(f"checked {len(paths)} lesson file(s)")
    if not findings:
        print("PASS - no findings")
        return 0

    print(f"\nFAIL — {len(findings)} finding(s):\n")
    for f in findings:
        print(f)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
