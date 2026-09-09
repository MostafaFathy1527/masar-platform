# STATUS

Update this file at the end of every session. It is the first thing the next session reads.

## Now
**Week 1 complete — every definition-of-done criterion met.** `masar.mostafafathy.com`
is live over HTTPS, CI is green, the database is migrated and verified, and a clean clone
reaches a running instance in 156 seconds.

**Week 2 is complete.** All four of its plan deliverables have landed: the lesson renderer
and block registry, L1 and L2 rendering, the `/depth` page, and the lesson JSON schema with
`pipeline/validate.py`. Verified at runtime in both locales.

**Week 3 is complete.** `claim_review` ships with F1 scoring, per-field feedback, a retry
variant and the 390px bottom-sheet pattern, and the guest button now deep-links into it.
All three promises this week carried are met.

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

## Next (Week 4)

Assessment and a lightweight certificate, per the plan: in-lesson knowledge checks, a
lesson quiz, one blueprint-sampled exam with an objective breakdown, certificate-lite with
`/verify/[serial]` and print CSS, and one read-only `/admin/analytics` page.

**Block-type budget: still 12 of 16.** `claim_review` needed no new block type — it mounts
through the existing `practice_sim` block — so all four slots remain.

Carried: self-hosted OFL fonts; a lesson-player shell with `BlockInteraction` writes.

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
- [ ] **Environment variables on Vercel** — `DATABASE_URL` and `AUTH_SECRET`, scoped to
      all environments. Until then `POST /api/demo` returns 500 in production. The
      landing page is static and serves fine without them.
- [ ] **Add the personal Gmail as a Vercel team owner** — the mitigation recorded against
      the work-email deviation in `HANDOVER.md`. Until then that risk is live.
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
| 2026-09-09 | **Vercel on the work-email account** | Deliberate, recorded exception to Day-0 #1; that account owns the apex domain. |
| 2026-09-09 | **gitleaks binary, not the action** | The action builds an invalid revision range on a root-commit push: zero bytes scanned, job fails anyway. |
