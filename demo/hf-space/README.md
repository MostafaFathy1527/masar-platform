---
title: Masār quality gates
emoji: 🚪
colorFrom: yellow
colorTo: gray
sdk: gradio
sdk_version: 6.30.0
python_version: "3.11"
app_file: app.py
pinned: false
license: mit
short_description: The three gates a lesson must pass before Masār publishes it
---

# Masār quality gates

The content pipeline behind [masar.mostafafathy.com](https://masar.mostafafathy.com) refuses to
publish any lesson until it passes three gates. This Space runs them in a browser on the real
lesson files from the repository, or on anything you paste.

- **Validator** — structure (JSON Schema generated from the renderer's Zod schema), semantics,
  and forbidden content.
- **Concept log** — no lesson may re-introduce a concept an earlier lesson taught, or use one
  before it is taught.
- **Rubric gate** — thresholds applied to a fresh-context judge's verdict; which criteria apply
  is derived from the lesson, never from the judge.

No model is called here. Source, tests and the public record of fourteen things that looked
right and weren't: [github.com/MostafaFathy1527/masar-platform](https://github.com/MostafaFathy1527/masar-platform).

This folder is a snapshot produced by `python demo/hf-space/sync.py` from the repository root.
