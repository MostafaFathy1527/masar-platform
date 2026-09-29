# Masār (مسار)

**I built a learning platform, then spent a week trying to break it. I found thirteen
things that looked right and weren't.**

Two of them:

- The claim-review scoring rewarded guessing. Flagging every field scored **79%**.
  Reading four fields carefully and flagging only those scored **77%**. The formula paid
  30% for doing nothing.
- The exam could be beaten without reading the questions. Authored banks put the correct
  answer first, so *always pick option A* scored **89%**.

Both are fixed. All thirteen are written up, with what I got wrong and why, in
[`docs/design/what-failed.md`](docs/design/what-failed.md) — which is the part of this
repository actually worth reading.

---

## What this is

A practice-first learning platform, built end to end. A lesson can be published at three
defined depths, assessment is assembled from a blueprint rather than a pile of questions,
and the AI content pipeline that produces the lessons ships here with its quality gates.

**Try it, no sign-up:** [masar.mostafafathy.com](https://masar.mostafafathy.com) — Arabic
and English, right-to-left throughout.

## The pipeline is the point

Generating learning content is no longer hard. Knowing whether the output is any good
still is. So nothing in this project ships because it looks finished — it ships because it
passed a gate:

| Gate | What it refuses |
|---|---|
| [`pipeline/validate.py`](pipeline/validate.py) | Schema violations, forbidden real-world code sets, a lesson claiming bilingual support while repeating its English |
| [`pipeline/concept_log.py`](pipeline/concept_log.py) | A lesson that re-teaches a concept already taught, or contradicts one |
| [`pipeline/qa_gate.py`](pipeline/qa_gate.py) | Content that fails the instructional-design rubric |

The gates have their own tests. A gate nobody tests is a gate that passes everything.

## The course is a test fixture, not the subject

The demo course is medical insurance and revenue-cycle management. That domain was chosen
because it is genuinely hard: it has real error types that can be planted in a claim and
found, and shallow content would have been obvious. **The method is not specific to it.**
Every code, payer, clinic and patient in the demo is fictional and authored for training.

## Design decisions, with the reasoning

`docs/STATUS.md` carries a decision log — every non-obvious choice and the evidence behind
it. A sample:

- **Scoring is F1, not the specified linear blend.** The linear formula let shotgun
  flagging beat careful reading; F1 delivers the claim at any field count.
- **Options are shuffled per attempt.** See the 89% above.
- **Authorization reads the database row, not the token.** A deleted user's cookie
  returned 200 from the export endpoint.
- **Arabic is never letter-spaced.** Tracking breaks the cursive joins.

## What it does not do

Payments run in sandbox mode only. The blind inter-rater check on the content rubric needs
a rater independent of this project and has not been run. One accuracy question in lesson
07 is open pending a practitioner's answer. These are listed rather than hidden.

## Stack

Next.js 16 · React 19 · Tailwind 4 · Prisma · PostgreSQL · Python for the pipeline.

```bash
npm run check     # typecheck, lint, tests
npm run dev
python pipeline/validate.py --denylist .local/denylist.txt
```

## Documentation

- [`docs/design/what-failed.md`](docs/design/what-failed.md) — the thirteen failures
- [`docs/STATUS.md`](docs/STATUS.md) — current state and the decision log
- [`SPEC.md`](SPEC.md) — the fourteen headings a client asked to see
- [`HANDOVER.md`](HANDOVER.md) — architecture, runbook, ownership
- [`BUILD.md`](BUILD.md) — the build brief
- [`LATER.md`](LATER.md) — deliberately out of scope for v1.0

---

**Self-initiated project.** Not a commercial product. Not affiliated with, or recognized
by, any certification body. Not medical, billing, clinical, legal or regulatory advice.

© 2026 Mostafa Fathy. Code MIT; course content CC BY-NC 4.0.
