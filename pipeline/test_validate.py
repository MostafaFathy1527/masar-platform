#!/usr/bin/env python3
"""Negative tests for pipeline/validate.py.

A validator that has only ever returned PASS proves nothing. Each test here
breaks exactly one rule in a copy of the real golden lesson and asserts that the
matching rule fires — and the first test asserts the untouched lesson passes, so
these cannot all be trivially satisfied by a validator that fails everything.

Run:  python pipeline/test_validate.py
"""

from __future__ import annotations

import copy
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import validate  # noqa: E402

GOLDEN = Path("content/courses/rcm-foundations/lessons/04-anatomy-of-a-claim.json")
SCHEMA = json.loads(Path(validate.SCHEMA_PATH).read_text(encoding="utf-8"))


def run(doc, denylist=None) -> list[validate.Finding]:
    findings = validate.check_structure(doc, SCHEMA, "test")
    if not findings:
        findings += validate.check_semantics(doc, "test")
    findings += validate.check_content(doc, "test", denylist or [])
    return findings


def rules(findings) -> set[str]:
    return {f.rule for f in findings}


def block(doc, level, btype):
    for b in doc["blocks"][level]:
        if b["type"] == btype:
            return b
    raise AssertionError(f"no {btype} in {level}")


RESULTS: list[tuple[str, bool, str]] = []


def case(name: str):
    def deco(fn):
        base = json.loads(GOLDEN.read_text(encoding="utf-8"))
        try:
            fn(copy.deepcopy(base))
            RESULTS.append((name, True, ""))
        except AssertionError as e:
            RESULTS.append((name, False, str(e)))
        return fn

    return deco


@case("the untouched golden lesson passes")
def _(doc):
    f = run(doc)
    assert not f, f"expected no findings, got: {[str(x) for x in f]}"


@case("a real licensed code set is rejected")
def _(doc):
    block(doc, "l1", "rich_text")["payload"]["mdEn"] += " See CPT guidance."
    assert "forbidden-code-set" in rules(run(doc))


@case("an X12 remark code shape is rejected")
def _(doc):
    block(doc, "l1", "rich_text")["payload"]["mdEn"] += " Denial CO-45 applies."
    assert "forbidden-code-set" in rules(run(doc))


@case("the project's own training codes are NOT rejected")
def _(doc):
    block(doc, "l1", "rich_text")["payload"]["mdEn"] += " Procedure PRC-1042, diagnosis DX-A118."
    assert "forbidden-code-set" not in rules(run(doc))


@case("a duplicate block id is rejected")
def _(doc):
    doc["blocks"]["l2"][0]["id"] = doc["blocks"]["l1"][0]["id"]
    assert "duplicate-block-id" in rules(run(doc))


@case("a block at a level it is not allowed at is rejected")
def _(doc):
    sim = copy.deepcopy(block(doc, "l3", "practice_sim"))
    sim["id"] = "b_l1_sim_illegal"
    doc["blocks"]["l1"].append(sim)
    assert "block-level" in rules(run(doc))


@case("an objective the lesson does not declare is rejected")
def _(doc):
    doc["blocks"]["l1"][0]["objectiveId"] = "MI-99"
    assert "objective-undeclared" in rules(run(doc))


@case("a declared level with no blocks is rejected")
def _(doc):
    doc["blocks"]["l3"] = []
    assert "level-declared-empty" in rules(run(doc))


@case("an L2 lesson missing its second knowledge_check is rejected")
def _(doc):
    doc["blocks"]["l2"] = [b for b in doc["blocks"]["l2"] if b["type"] != "knowledge_check"]
    assert "l2-incomplete" in rules(run(doc))


@case("an L2 lesson missing a worked_example is rejected")
def _(doc):
    doc["blocks"]["l2"] = [b for b in doc["blocks"]["l2"] if b["type"] != "worked_example"]
    assert "l2-incomplete" in rules(run(doc))


@case("an L3 lesson with no practice_sim is rejected")
def _(doc):
    doc["blocks"]["l3"] = [b for b in doc["blocks"]["l3"] if b["type"] != "practice_sim"]
    assert "l3-incomplete" in rules(run(doc))


@case("prose past the 180-word budget between acting blocks is rejected")
def _(doc):
    filler = {
        "id": "b_l2_filler",
        "type": "rich_text",
        "objectiveId": "MI-06",
        "payload": {"mdAr": "كلمة " * 200, "mdEn": "word " * 200},
    }
    # Insert after the last acting block so the run is unbroken.
    doc["blocks"]["l2"].append(filler)
    assert "prose-budget" in rules(run(doc))


@case("prose under the budget is NOT rejected")
def _(doc):
    filler = {
        "id": "b_l2_short",
        "type": "rich_text",
        "objectiveId": "MI-06",
        "payload": {"mdAr": "كلمة " * 20, "mdEn": "word " * 20},
    }
    doc["blocks"]["l2"].append(filler)
    assert "prose-budget" not in rules(run(doc))


@case("a structurally invalid document is rejected")
def _(doc):
    doc["slug"] = "Not Kebab Case"
    assert "structure" in rules(run(doc))


@case("a denylisted term is rejected without echoing it")
def _(doc):
    doc["titleEn"] = "A lesson mentioning Contoso Health"
    findings = run(doc, [re.compile(r"contoso", re.I)])
    assert "forbidden-term" in rules(findings)
    assert not any("Contoso" in f.message for f in findings), "the term was echoed into the output"


@case("an image without alt text is rejected")
def _(doc):
    doc["blocks"]["l1"].append(
        {
            "id": "b_l1_img",
            "type": "rich_text",
            "objectiveId": "MI-05",
            "payload": {"mdAr": "ص", "mdEn": "x", "image": "/x.png", "alt": ""},
        }
    )
    assert "missing-alt-text" in rules(run(doc))


def main() -> int:
    passed = sum(1 for _, ok, _ in RESULTS if ok)
    for name, ok, err in RESULTS:
        print(("  ok   " if ok else "  FAIL ") + name)
        if not ok:
            print("         " + err[:300])
    print(f"\n{passed}/{len(RESULTS)} passed")
    return 0 if passed == len(RESULTS) else 1


if __name__ == "__main__":
    raise SystemExit(main())
