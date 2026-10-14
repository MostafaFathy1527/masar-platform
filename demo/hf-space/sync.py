#!/usr/bin/env python3
"""Copy what the Hugging Face Space needs from the repository into this folder.

The Space is a self-contained snapshot: the three gate scripts, the generated
lesson schema, the authored course lessons, and the pipeline's draft outputs
with their verdicts. Run from the repository root:

    python demo/hf-space/sync.py

Nothing here is edited by hand. If a gate changes in pipeline/, re-run this.
The denylist is deliberately NOT copied: it lives untracked in .local/ and the
Space runs the name check with no terms, which it says on the page.
"""

from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent

# Flat on purpose: the Hugging Face web uploader does not keep folders, so the
# Space keeps everything at the root and encodes origin in the file name.
COPY = {
    "pipeline/validate.py": "validate.py",
    "pipeline/concept_log.py": "concept_log.py",
    "pipeline/qa_gate.py": "qa_gate.py",
    "pipeline/rubric.md": "rubric.md",
    "content/schema/lesson.schema.json": "lesson.schema.json",
}


WITHDRAWN = {"lesson-ops-01"}


def main() -> None:
    for src, dst in COPY.items():
        target = HERE / dst
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / src, target)

    for old in HERE.glob("sample__*"):
        old.unlink()
    for lesson in sorted(ROOT.glob("content/courses/*/lessons/*.json")):
        course = lesson.parents[1].name
        shutil.copyfile(lesson, HERE / f"sample__course__{course}__{lesson.name}")
    for out in sorted(ROOT.glob("pipeline/out/*")):
        # The latest version is the one the site shows; a withdrawn run is
        # evidence in the repository, not a sample (see lib/drafts.ts).
        versions = sorted((v for v in out.glob("v*") if v.name[1:].isdigit()), key=lambda v: int(v.name[1:]))
        if out.name in WITHDRAWN or not versions:
            continue
        run, name = versions[-1], out.name
        for fname in ("lesson.json", "verdict.json"):
            src = run / fname
            if src.exists():
                shutil.copyfile(src, HERE / f"sample__draft__{name}__{fname}")

    print("synced into", HERE)


if __name__ == "__main__":
    main()
