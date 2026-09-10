# Conventions

The rules this repository is built to. Code comments point here by section name rather than
by number: an earlier numbered list drifted until two different comments both cited "rule 8"
for two different rules, and a citation that can drift is worse than none.

## Hard rules

These are never broken, by anyone, for any reason.

1. **The authoritative plan is never copied into this repository.** It names a real prospect
   and local paths. `BUILD.md` is the sanitized brief; keep it that way.
2. **The owner's employer, and any client, is never named** — in any file, commit message,
   screenshot or piece of copy. Say "an education company".
3. **No client material.** Every lesson, question, code and case in the demo course is
   original, authored from public knowledge. Fictional payers, clinics, patients and
   procedure codes only, labelled as fictional.
4. **Zero budget.** Free tiers, open source, sandbox and test payment modes only. No paid API
   call anywhere.
5. **No invented numbers.** No fake users, learners, revenue or outcomes. Seeded demo data is
   always visibly badged as synthetic.
6. **Scope is v1.0.** Anything outside it goes in `LATER.md`, and is never promised in the
   README, the case study, or on LinkedIn.
7. **Not medical, billing, clinical, legal or regulatory advice.** That disclaimer stays in
   the footer.
8. **No named certification.** The course is "certification-style exam preparation" or
   "job-readiness". The certificate says, verbatim: *"Certificate of completion for a
   self-initiated training course. Not affiliated with, or recognized by, any certification
   body."*

## Forbidden in content

Real licensed code sets: CPT, HCPCS, CDT, and X12 denial and remark codes matching
`^(CO|PR|OA|PI|CR)-?\d{1,3}$`, `^N\d{3}$`, `^M\d{2,3}$`, plus DRG references. Every code in the
demo is a fictional training code. Enforced by `pipeline/validate.py` and by
`tests/content-lessons.test.ts`, so it is checked rather than remembered.

## Bilingual

- **Arabic first, English as a full mirror.** Arabic is the default locale and is served from
  the bare path.
- Content is stored as `xAr` / `xEn` pairs, and `lib/content-locale.ts` picks the side for the
  active locale.
- A lesson that is English-only declares `bilingual: false` and says so on the page before
  the body. The limitation is stated, never left to be discovered.
- Arabic is never letter-spaced. Tracking breaks the cursive joins.

## Layout and accessibility

- **Logical properties only** — `padding-inline`, `border-inline-start`, never `margin-left`
  or `padding-right`. One layout serves both directions and the `dir` attribute on `<html>`
  does the mirroring. 390px RTL is re-measured after any layout change, not assumed.
- **Accessibility is part of done.** A visible focus ring on every interactive element, and
  meaning is never carried by colour alone: a correct or incorrect answer is always stated in
  words, and a coloured label always has a text label.

## Code

- **Scoring and assembly modules are pure and dependency-free.** They decide what a learner is
  asked and what they score, so they are unit-tested without a database, a request or a
  rendered page.
- **`lib/schema/lesson.ts` is the single source of truth for the lesson schema.** The JSON
  Schema is generated from it, and a drift test fails the build if the two disagree.
- **Authorization reads the database row, not the session token.** A token outlives the
  account it describes.
- **Data model:** cuid ids, `createdAt` / `updatedAt` everywhere, enums for every state
  machine, bilingual fields as `xAr` / `xEn` pairs, soft deactivation over deletion.
- **Hardcoded facts drift.** Where a number or a state can be read from its source — a count,
  an item total, a pass mark — interpolate it rather than restate it.

## Before any push

The forbidden terms — the employer name, client and prospect names, local path patterns —
live in `.local/denylist.txt`, which is gitignored and must never be committed. Writing them
into a tracked file is itself a breach of hard rules 1 and 2.

`.local/gate.sh` scans the content of what is about to leave the machine, and the pre-push
hook runs it over every object reachable from a ref.
