# STATUS

Update this file at the end of every session. It is the first thing the next session reads.

## Now
**Week 1 complete — every definition-of-done criterion met.** `masar.mostafafathy.com`
is live over HTTPS, CI is green, the database is migrated and verified, and a clean clone
reaches a running instance in 156 seconds.

**Week 2 is complete.** All four of its plan deliverables have landed: the lesson renderer
and block registry, L1 and L2 rendering, the `/depth` page, and the lesson JSON schema with
`pipeline/validate.py`. Verified at runtime in both locales.

**Week 5's code is complete.** Five lessons, a 42-item bank, three pipeline gates with
33 negative tests, and `/how-it-was-built`. Five of six weeks done, each ending deployed.

**Two Week 5 items are the owner's and remain open** — the SME invitation and the blind
inter-rater sample. Neither can be done by the agent, and both are listed under
"Blocked / needs the owner".

Note: `/method` is **not** in v1.0. It belongs to the 14-week plan's Week 9, which §0.3
cut; `/depth` already renders the depth model.

**One production gap, not a DoD line:** environment variables are still unset on Vercel,
so `POST /api/demo` returns 500 in production. The landing page is static and unaffected.

Scope of record is the correction pass (section 0 of the authoritative plan, path in
`.local/DAY0.md`) — **v1.0 = 6 weeks / ~65 h**. `BUILD.md` sections 3 and 9 describe the
older 14-week plan and are superseded; treat them as v2 reference only.

## Week 1 against its definition of done

| Criterion | Status |
|---|---|
| `masar.mostafafathy.com` serves a bilingual placeholder over HTTPS | **Met.** Verified independently: `/` 307 to `/ar`, both locales 200 in ~0.26 s, `dir` correct, Arabic rendering, TLS valid. |
| `prisma migrate deploy` runs clean | **Met.** `migrate status` reports no drift and `migrate dev` reports "Already in sync" locally, and CI replays the migrations against a real Postgres on every push. |
| A clean clone reaches a running local instance in under 5 minutes on Windows | **Met — 156 s.** Clone 14 s, `npm install` 95 s, dev server serving `/ar` 47 s. The script copied `.env` in, so this measures machine time, not the developer pasting two values. |
| CI green | **Met.** All three jobs. |
| No employer name in tree or history | **Met.** Verified over every blob in the object database. |

## The migration, and a diagnosis I got wrong

**Correction.** An earlier version of this file said outbound TCP 5432 was blocked at the
network level. **That was wrong.** The port is reachable — three connections for three, in
about a second each. What actually happened: the first attempt hit a Neon endpoint that had
auto-suspended and timed out, an HTTP call then woke it, and TCP was never retried. A cold
start, not a firewall. The control test used at the time (HTTPS to a different, always-awake
host) never isolated the variable it claimed to.

The consequences are reverted: `@prisma/adapter-pg` is restored, the Neon-specific packages
are removed, and `HANDOVER.md` records the real cause. `prisma migrate dev` now runs locally
and reports "Already in sync".

What was done at the time, which still stands:

- the baseline was applied to Neon over the HTTP endpoint and recorded in
  `_prisma_migrations` with the correct checksum, so `migrate deploy` treats it as applied;
- the applied structure was read back and matched: 8 tables, 8 enums with the expected
  member counts, 9 foreign keys, 16 unique indexes;
- the check became a permanent CI job. `migrations` replays the committed migrations
  against a real Postgres service and asserts by exit code that they reproduce the
  datamodel and leave no drift after applying.

**Result: the offline baseline was correct.** The `migrations` job passes, so
`migrate diff --from-migrations` finds no difference against the datamodel and no drift
after `migrate deploy`. The offline method got nothing wrong on this schema — and that is
now checked on every push rather than trusted once.

## The scoring formula changed, and why

The formula specified for `claim_review` was
`(hits/6) x 0.7 + (1 - falsePositives/flagsMade) x 0.3`. Written as tests, **the
case-study claim failed against it**: flagging all 19 fields scored 79% while reading four
fields carefully scored 77%. Shotgun-flagging won — the exact thing the case study says
cannot happen.

The cause is structural, not a tuning problem. Flagging everything maxes recall, and the
recall weight alone (0.70) already reaches the pass mark. The linear form only supports the
claim when the form has more than 27 flaggable fields; this claim has 19. Padding the form
to fit the metric would have been the wrong repair, and would have made the 390px panel
worse. The same formula also paid the full precision weight for zero flags — 30% for doing
nothing.

Scoring is now **F1**, the harmonic mean, which the plan's own prose already called it. It
is dominated by whichever of precision and recall is worse, so it delivers the claim at any
field count:

| strategy | score | |
|---|---|---|
| flag nothing | 0% | fail |
| shotgun, all 19 fields | 48% | fail |
| four fields, all correct | 80% | pass |
| all six correct | 100% | pass |

The tests encode the **claim**, not the implementation, so a future change that breaks it
fails the build rather than surfacing in front of a reviewer.

## Position bias: found end to end, not by inspection

Answering "the first option" on every exam item scored **89%**. The bank is authored with
the correct answer first in 11 of 14 items, so option position predicted correctness — a
bank that read fine and was trivially gameable.

Options are now shuffled deterministically per attempt and per item, seeded by the attempt
so a reload does not move them under the learner. Scoring is unaffected, because answers
match by option id and never by position.

| strategy | before | after |
|---|---|---|
| always answer the first shown option | 89%, passes | 22% / 28% / 11%, all fail |

A test asserts the mean across eight seeds stays near chance, and a second test documents
that the authored bank *is* position-biased — so the shuffle cannot later be removed as
apparently redundant.

## Two honest gaps in Week 4

**Middleware authorization is not in place.** the project rules file rule 8 asks for permission checks
in middleware *and* re-checked server-side. Only the server-side check exists. The proxy
runs on the edge and this project's auth config imports Prisma, which is not edge-safe.
A cookie-presence check in the proxy was deliberately not added: something that looks like
authorization without being it is worse than a recorded gap. The server-side check is the
one that actually protects the data, and a non-admin gets a 404 rather than a 403 so the
route does not confirm its own existence.

**Role changes need re-authentication.** Role travels on the JWT, so promoting a user to
ADMIN leaves them refused until they sign in again. Correct behaviour for JWT sessions
rather than a defect, but worth knowing before someone debugs it twice.

## The pipeline, and what it does not yet claim

Three gates exist, each with negative tests proving it refuses things, and all run in CI:

| Gate | Refuses | Negative tests |
|---|---|---|
| `validate.py` | structure, undeclared objectives, wrong-level blocks, duplicate ids, prose budget, licensed code sets | 18 |
| `concept_log.py` | re-defining a concept an earlier lesson taught; using one before it is introduced | 6 |
| `qa_gate.py` | any criterion below 3, a mean below 4.0, a verdict missing criteria | 9 |

Each set includes a case asserting valid content **passes**, so no gate can satisfy its own
tests by refusing everything.

**The gates were built before the generation, and that ordering is the argument.** A
generator built first and gated afterwards is gated to whatever it already produces. This
is checkable in the commit history rather than asserted.

**What the pipeline does not yet claim.** The five shipped lessons were hand-authored, not
generated. The run log is empty. `/how-it-was-built` says so and reports no first-pass rate,
because inventing one is exactly the failure the page exists to avoid.

Running the loop honestly needs two sessions: one to generate, and a **separate** one for
the judge, which §0.4 item 5 requires to be a fresh context that has never seen the
generation prompt. An agent that wrote the generation prompt cannot also judge the output
without producing a number that looks like evidence and is not.

## §0.7 practitioner review — not sought (scope decision, closed)

The plan scheduled a review by one or two claims or revenue-cycle practitioners. **The
owner decided against seeking it**, on cost: recruiting a practitioner reviewer spends real
time and social capital on a self-initiated project with no budget. This is a closed scope
decision, not an outstanding task.

The limitation it leaves is published rather than absent — on `/how-it-was-built` and in
the case study:

> No claims or revenue-cycle practitioner reviewed this content. It was authored from
> public sources by an instructional designer. All code sets are fictional training codes,
> and a real deployment would use a deploying organisation's own payer rules and licensed
> code sets, reviewed by someone who works in the field.

**The owner must never be named as the subject-matter expert on this content.** He is an
instructional designer, not a claims or RCM practitioner. That would be a fabricated
credential on a public page, in a project whose whole argument is that it does not do that
— and it is the single easiest claim for a domain reviewer to check and dismiss.

The two reviews he *is* doing are real and are labelled precisely: an **instructional-design
review** and the **blind inter-rater check**. Neither is a subject-matter review, and the
copy never lets the two blur. See `docs/design/sme-review.md`.

## Next

**v1.0 is complete.** All six weeks are shipped and deployed. Week 6 delivered the
`PaymentProvider` interface with a mock adapter and the paywall, all six screenshots, the
case study in English with an Arabic summary, and `HANDOVER.md`.

What remains needs a person, not an agent, and is listed in the project rules file: the judge sitting
in a fresh session, the blind inter-rater check, the instructional-design review, and the
narrated recording.

`docs/design/what-failed.md` has **eight** entries for §0.4 item 4. The first five share
one pattern — **the falsifiable claims are the ones that break, and they only break when
you try to game them.** The last three break it in different directions: the code was
right and the product was wrong; the product was right and the tool was wrong; and a check
written to keep a screenshot honest caught the page lying to learners.

Two things in that file are for the case study rather than the incident list. **Facts that
were true when written** — three of the eight are hardcoded facts that silently stopped
being true, and the general fix is to interpolate from the source of truth rather than
restate it. And **the gate has failed more often than it has caught** — three failures,
one real catch, including a false pass that printed `clean` over zero blobs scanned.

**Block-type budget: still 12 of 16.** Nothing in Weeks 3 to 6 needed a new type.

## Done
- **Week 2, complete.** `lib/schema/lesson.ts` — the LessonDoc schema and 12-type block
  registry against a 16-type cap, with the cross-field rules a human editor cannot
  enforce by eye. `content/schema/lesson.schema.json` is generated from it and
  cross-validated with Python's `jsonschema`; a drift test makes "regenerate after any
  change" mechanical. All 12 block components, an exhaustive `<BlockRenderer>`, lesson 4
  authored bilingually at all three depths, and `/depth` rendering it cumulatively.
  Content is validated and scanned for licensed code sets in CI.
- **`pipeline/validate.py`** in three layers: structure against the generated JSON Schema,
  semantics that JSON Schema cannot express, and forbidden content. Sixteen negative tests,
  three of which exist to catch a validator that passes by failing everything. CI also
  fails if the generated schema is stale, so the contract cannot quietly become a fiction.
- **`compare_table` is bilingual**, so every text-bearing block now is, with no exceptions —
  enforced by the schema rather than by review.
- **Week 5, code complete.** Four English-only L1 lessons plus the bilingual flagship,
  each declaring `bilingual` so the player tells an Arabic reader before they start. MI-13
  covers fraud, waste and abuse with callouts in two lessons and five scenario items. A
  42-item bank with every objective at the floor of five and a 20/40/40 Bloom mix. Three
  pipeline gates, their contract, three prompts, and `/how-it-was-built` reading its numbers
  from the repository at build time.
- **Week 4, complete.** Item, ItemOption, Assessment, Attempt, AttemptAnswer and
  Certificate tables. Blueprint assembly that is deterministic from a stored seed and
  fails loudly on a thin pool rather than scoring an attempt out of the wrong denominator.
  Quiz and exam with a per-objective breakdown and weakest-objectives list. Certificate-lite
  issuing idempotently with the objectives demonstrated printed on it, public verification,
  and print CSS. Read-only admin analytics. 14 authored items, every option carrying
  feedback that names its misconception.
- **Week 3, complete.** `Simulation` and `SimSubmission` tables; the claim-review dataset
  with six seeded errors, one per class, each carrying a bilingual explanation and a
  `teachesBlockId` verified to exist in lesson 4; F1 scoring as a pure, hard-tested module;
  the workbench with keyboard-first flagging; the evidence panel as a 390px bottom sheet
  and a desktop side panel from one element; and guest entry deep-linking into it.
  Answers never reach the browser before submission, guarded by three structural tests.

- Repo, the project rules file, `BUILD.md` (sanitized), `LATER.md`.
- **Publish safety.** Forbidden terms in `.local/denylist.txt` with a 14-case fixture;
  `.gitleaks.toml` with committed shape-based rules naming no person or company, plus an
  11-case fixture; `.local/gate.sh` scans blob content in three modes; a `pre-push` hook
  delegates to it. History rebuilt as one clean commit; git identity pinned.
- **Scaffold.** Next.js 16 + TypeScript + Tailwind 4, npm scripts, vitest.
- **`SPEC.md` v0** — all fourteen client headings, written to the 6-week scope.
- **Database.** 7 models, baseline applied to Neon and verified in CI.
- **Auth.** NextAuth v5 credentials + JWT, bcrypt cost 12, no user enumeration.
- **One-click guest.** `POST /api/demo` creates a guest, signs them in, redirects to
  `?tour=1`; `GET` returns 405. Verified against the live database.
- **Bilingual RTL landing page.** `/` to `/ar`, `/en` mirrors, `dir` flips, Arabic renders.
- **CI** — typecheck, lint, tests, `prisma validate`, build, migration verification,
  full-history secret scan.
- `HANDOVER.md` with resolved versions, the clean-clone runbook, and **Known deviations**.

## Blocked / needs the owner
- [ ] **Blind inter-rater sample** (~20 min). Three lessons scored against
      `pipeline/rubric.md`, without seeing the model's scores first, then the mean absolute
      difference reported. This is instructional quality, which is the owner's actual
      expertise. Without it the rubric number is a model marking its own homework, and
      §0.4 item 5 is explicit that it cannot stand alone.
- [ ] **Instructional-design review** — objective alignment, coverage, the assessment
      blueprint, feedback quality, the depth model, and the Arabic. Labelled as an
      instructional-design review everywhere, never as a subject-matter or accuracy review.
- [ ] **Environment variables on Vercel** — `DATABASE_URL` and `AUTH_SECRET`, scoped to
      all environments. Until then `POST /api/demo` returns 500 in production. The
      landing page is static and serves fine without them.
- [ ] Day 0 #3 — confirm the fictional entity names read as obviously invented (Week 2).
- [ ] Day 0 #4 — Stripe availability. Not a v1.0 gate; only affects what `SPEC.md` claims.

## Decisions log
| Date | Decision | Why |
|---|---|---|
| 2026-09-08 | Name: **Masār** | Vertical-neutral, licensable as a platform rather than one course brand. |
| 2026-09-08 | v1.0 cut to 6 weeks / ~65 h | The 14-week plan was about twice what one part-time person can ship. |
| 2026-09-08 | One simulation only (`claim_review`) | It is the hero moment; the others stay documented patterns. |
| 2026-09-09 | **Postgres (Neon), not Turso** | Ownership story is content in git + `pg_dump` + an export endpoint. |
| 2026-09-09 | **`create-next-app@latest`** | Instructed by the correction pass. Landed Next 16 / React 19 / Tailwind 4. |
| 2026-09-09 | **Prisma held at 7.10.0** | `latest` resolves to `8.0.0-rc.13`; an RC does not belong on the critical path. |
| 2026-09-09 | **Denylist moved to `.local/`, history rebuilt** | Terms were literals in a tracked file, and the private plan path was in commit 1. |
| 2026-09-09 | **`AGENTS.md` added** | `next dev` injects a managed block into the project rules file unless `AGENTS.md` exists. |
| 2026-09-09 | **Week-by-week migrations**, 7 models now | Builds nothing for features the cut lines may drop. |
| 2026-09-09 | ~~`@prisma/adapter-neon`~~ — **reverted to `adapter-pg`** | The blocked-port diagnosis was wrong: it was a Neon cold start. Retry before concluding anything about a network. |
| 2026-09-09 | **Vercel project needs `framework: "nextjs"`** | With `framework: null` the build is green and every route 404s. Recorded in `HANDOVER.md`; no build log shows it. |
| 2026-09-09 | **Deployment Protection off** | Deliberate for a public portfolio demo whose purpose is that a stranger can open the link. |
| 2026-09-09 | **12 block types, cap 16** | The plan caps the registry at 16. The 4 remaining slots are reserved for `claim_review` in Week 3, not for presentational blocks. |
| 2026-09-09 | **`compare_table` cells carry their own Ar/En pair** | Parallel `columnsAr`/`columnsEn` arrays can drift in length; per-cell pairs make alignment hold by construction. |
| 2026-09-09 | **`@types/node` tracks the runtime major** | Types four majors behind the runtime produce type errors that are not real and hide ones that are. |
| 2026-09-09 | **`__pycache__` is gitignored** | A `.pyc` embeds `co_filename`, verified as the absolute source path on this machine — a local-path leak in a repo that goes public. |
| 2026-09-09 | **Scoring is F1, not the specified linear blend** | The linear formula let shotgun-flagging (79%) beat careful reading (77%) and paid 30% for doing nothing. F1 delivers the claim at any field count. |
| 2026-09-09 | **Seeded errors never reach the client** | Same rule as stripping answer keys from an in-progress attempt; otherwise the exercise is spot-the-highlighted-field. |
| 2026-09-09 | **Evidence panel is one `<details>`, `open` by default** | CSS cannot reveal a closed `<details>`, so the desktop panel rendered empty. Open + hidden summary is the panel; on a phone the same element is the bottom sheet. |
| 2026-09-09 | **Options are shuffled per attempt** | Authored banks put the correct answer first; without shuffling, "always answer A" scored 89% on the exam. |
| 2026-09-09 | **Two item types, not six** | A scenario item is an MCQ_SINGLE with a vignette, flagged by `isScenario`: the difference is in the stem, not in how it is answered or scored. |
| 2026-09-09 | **Admin routes return 404, not 403** | An admin route should not confirm its own existence to someone who may not access it. |
| 2026-09-09 | **No middleware authorization** | The proxy is edge-run and the auth config imports Prisma. A cookie-presence check would look like authorization without being it. Recorded as a gap rather than faked. |
| 2026-09-09 | **Authorization reads the row, not the token** | A JWT outlives the account it describes: a deleted user's cookie returned 200 from the export endpoint. |
| 2026-09-09 | **Guest retention runs on guest creation** | A purge that only runs on a schedule is one that silently stops when the schedule breaks. |
| 2026-09-09 | **Flagship bilingual, four lessons English-only** | Fits the hours honestly. The `bilingual` flag makes the limitation visible on the page, and both gates reject a lesson that claims Arabic while repeating its English. |
| 2026-09-09 | **The judge must be a separate session** | An agent that wrote the generation prompt cannot judge the output; the score would look like evidence and be self-assessment. |
| 2026-09-09 | **Vercel on the work-email account** | Deliberate, recorded exception to Day-0 #1; that account owns the apex domain. |
| 2026-09-09 | **gitleaks binary, not the action** | The action builds an invalid revision range on a root-commit push: zero bytes scanned, job fails anyway. |
