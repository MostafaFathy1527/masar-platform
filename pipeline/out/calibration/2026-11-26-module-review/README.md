# Module review report: first run, 26 November 2026

`audit_course.py --report` reads one plain-text module: string checks first (negative
stems, feedback that only says right or wrong), then one model (zai.glm-5), and writes a
markdown report: defect, quote, why it matters, suggested fix, and a keep/drop box for the
second reviewer.

Tested on our own sample CS-01 only (no outside material):
- the real lesson: 0 findings (no false alarm);
- a copy with the three scenario consequences swapped: 3 findings, all three swaps, each
  with the right fix ("move this consequence under that option").
- string checks, no model: the generic-feedback copy gives 2 points (8 lines merged), the
  negative-stem copy gives the English and the Arabic stem.

2 model calls, 8,222 input and 284 output tokens, under $0.02 (estimate, priced high).
Next: a module in someone else's layout (Word/PDF turned to text), not our flatten format.
