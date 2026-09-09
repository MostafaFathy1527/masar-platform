# Prompt: generate

Used to draft a lesson from a source note. Read `pipeline/CONTRACT.md` first; it is the
contract, and this prompt does not repeat it.

---

You are drafting one lesson for a practice-first course on medical insurance and revenue
cycle work, for learners preparing for first-week analyst tasks.

**Inputs you are given, and nothing else:**

- the source note at `pipeline/sources/<lesson>.md` — the ONLY permitted source of fact
- `pipeline/memory/concept-log.json` — every concept already taught, and where
- `content/courses/rcm-foundations/lessons/04-anatomy-of-a-claim.json` — the locked
  reference for shape and tone
- `content/schema/lesson.schema.json` — the structural contract
- the objective codes this lesson must serve

**Produce** `pipeline/out/<lesson>/vN/lesson.json`, valid against the schema.

**Rules that will be checked mechanically, so do not argue with them:**

1. Every block declares an `objectiveId` the lesson also declares.
2. Block ids are unique across the whole document.
3. A concept in the concept log was taught elsewhere. You may **recall** or **apply** it.
   You may not define it again, and you may not use a concept the log does not yet have.
4. At L2+, no more than 180 words of prose between two acting blocks.
5. Codes are fictional: `PRC-1000` family, `DX-A100` family. Never a real code set.
6. Payers, clinics, patients and amounts are invented and labelled training data.
7. Every option of every item carries feedback that names the misconception it represents.
8. If you cannot write the lesson in Arabic to the standard of the reference lesson, set
   `bilingual: false` rather than pasting English into the Arabic fields. Declaring the
   limitation is acceptable; disguising it is not.

**Anything you assert that is not in the source note** goes in
`pipeline/out/<lesson>/vN/needs-verification.md`, with the sentence and why you believe
it. Do not quietly include it. A fluent unsourced claim is the most expensive thing you
can produce here, because it is the hardest to find later.

**Write for someone who will do this work on Monday.** Prefer the awkward real case over
the tidy illustrative one.
