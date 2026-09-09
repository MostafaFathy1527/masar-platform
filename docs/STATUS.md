# STATUS

Update this file at the end of every session. It is the first thing the next session reads.

## Now
**Week 1 complete — every definition-of-done criterion met.** `masar.mostafafathy.com`
is live over HTTPS, CI is green, the database is migrated and verified, and a clean clone
reaches a running instance in 156 seconds.

**Week 2 is complete.** All four of its plan deliverables have landed: the lesson renderer
and block registry, L1 and L2 rendering, the `/depth` page, and the lesson JSON schema with
`pipeline/validate.py`. Verified at runtime in both locales.

**Week 3 is next, and it is the critical path.** `claim_review` is the hero of the case
study, the destination the guest button deep-links to, and the subject of the 390px
bottom-sheet mobile pattern — three separate promises resting on one week of 12 hours. If
anything threatens to overrun, cut it rather than borrowing from Week 3.

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

## Next (Week 3) — the hero

Ships by Sunday: the `claim_review` simulation with F1-style scoring, per-field feedback
and a retry variant, plus the mobile pattern verified at 390px.

1. **`Simulation` and `SimSubmission` tables** — the next week-by-week migration.
2. **The claim-review workbench** — a claim with seeded errors the learner flags.
3. **Precision-aware scoring**, published in the UI: flagging every field must score worse
   than reading four fields carefully. Pure and unit-tested, in its own module.
4. **Per-error feedback**, with every miss linked back to the block that taught it.
5. **Bottom-sheet evidence panel**, verified at 390px.
6. **Point the guest button at it** — replacing the Week 1 `?tour=1` stub, which is the
   third promise resting on this week.

**Block-type budget: 12 of 16 used, 4 left for Weeks 3-6.** Those four slots are the whole
allowance for the rest of v1.0 and belong to `claim_review`, not to a thirteenth
presentational block.

Carried, not blocking: self-hosted OFL fonts (still a system stack); a lesson-player shell
with `BlockInteraction` writes, which the plan does not place in Week 2.

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
| 2026-09-09 | **Vercel on the work-email account** | Deliberate, recorded exception to Day-0 #1; that account owns the apex domain. |
| 2026-09-09 | **gitleaks binary, not the action** | The action builds an invalid revision range on a root-commit push: zero bytes scanned, job fails anyway. |
