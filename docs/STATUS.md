# STATUS

Update this file at the end of every session. It is the first thing the next session reads.

## Now
**Week 1 substantially complete.** The repository is on GitHub (private), CI is green, the
database is live and migrated, auth and one-click guest entry work end to end, and the
bilingual landing page is built and verified.

**One item outstanding:** the Vercel project has not been created, so
`masar.mostafafathy.com` is not yet serving. DNS is already in place and verified.

Scope of record is the correction pass (section 0 of the authoritative plan, path in
`.local/DAY0.md`) — **v1.0 = 6 weeks / ~65 h**. `BUILD.md` sections 3 and 9 describe the
older 14-week plan and are superseded; treat them as v2 reference only.

## Week 1 against its definition of done

| Criterion | Status |
|---|---|
| `masar.mostafafathy.com` serves a bilingual placeholder over HTTPS | **Not met.** Page built and verified locally; the Vercel project still needs creating. |
| `prisma migrate deploy` runs clean | **Met, by a different route** — see below. |
| A clean clone reaches a running local instance in under 5 minutes on Windows | **Not verified.** Never tested from an actual fresh clone. |
| CI green | **Met.** Run #2 green across all three jobs. |
| No employer name in tree or history | **Met.** Verified over every blob in the object database. |

## The migration, and what the offline baseline check found

This machine cannot open outbound TCP 5432 — DNS resolves and HTTPS works, but the
Postgres port is blocked at the network level, with and without the command sandbox. So
`prisma migrate dev` could not run locally at all, and the requested by-hand comparison
was impossible. Instead:

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

## Next
1. **Create the Vercel project** and attach `masar` (owner action — needs the two secrets).
2. Verify HTTPS serves `/ar` and `/en`, and that the guest button works in production.
3. Test a genuinely clean clone against the five-minute claim; fix what it exposes.
4. Self-hosted OFL fonts — currently a system stack.
5. Week 2: lesson renderer, block registry, L1/L2 rendering, `/depth`, lesson JSON schema
   and `validate.py`.

## Done
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
- [ ] **Create the Vercel project.** The import page is prepared with both variable names
      filled in. The two *values* must be pasted by hand — `DATABASE_URL` (the Neon pooled
      string) and `AUTH_SECRET` (in `.env`). Then click **Create Project** and add
      `masar.mostafafathy.com` under the project's Domains tab. DNS already resolves.
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
| 2026-09-09 | **`@prisma/adapter-neon`, not `adapter-pg`** | Outbound 5432 is blocked here; the Neon driver tunnels over 443. Recorded as a deviation. |
| 2026-09-09 | **Vercel on the work-email account** | Deliberate, recorded exception to Day-0 #1; that account owns the apex domain. |
| 2026-09-09 | **gitleaks binary, not the action** | The action builds an invalid revision range on a root-commit push: zero bytes scanned, job fails anyway. |
