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

COPY = {
    "pipeline/validate.py": "pipeline/validate.py",
    "pipeline/concept_log.py": "pipeline/concept_log.py",
    "pipeline/qa_gate.py": "pipeline/qa_gate.py",
    "pipeline/rubric.md": "pipeline/rubric.md",
    "content/schema/lesson.schema.json": "pipeline/lesson.schema.json",
}


def main() -> None:
    for src, dst in COPY.items():
        target = HERE / dst
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / src, target)

    courses = HERE / "samples" / "courses"
    if courses.exists():
        shutil.rmtree(courses)
    for lesson in sorted(ROOT.glob("content/courses/*/lessons/*.json")):
        course = lesson.parents[1].name
        dst = courses / course / lesson.name
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(lesson, dst)

    drafts = HERE / "samples" / "drafts"
    if drafts.exists():
        shutil.rmtree(drafts)
    for run in sorted(ROOT.glob("pipeline/out/*/v1")):
        name = run.parent.name
        for fname in ("lesson.json", "verdict.json", "items.json", "STATUS.md"):
            src = run / fname
            if src.exists():
                dst = drafts / name / fname
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(src, dst)

    print("synced into", HERE)


if __name__ == "__main__":
    main()
