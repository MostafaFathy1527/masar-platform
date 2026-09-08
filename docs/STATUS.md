# STATUS

Update this file at the end of every session. It is the first thing the next session reads.

## Now
**Week 1 in progress.** Repo history rebuilt for publish safety; Next.js app scaffolded,
installed, building, and committed. `npm run check` is green.

Scope of record is the correction pass (section 0 of the authoritative plan, path in
`.local/DAY0.md`) — **v1.0 = 6 weeks / ~65 h**. `BUILD.md` §3 and §9 describe the older
14-week plan and are superseded; treat them as v2 reference only.

## Next (Week 1, remaining)
1. **Prisma schema + first migration** against Neon Postgres — model set scoped to
   v1.0 (see the open question below), then `ensure-db` / `reset-db` / `seed` scripts.
2. Credentials auth (NextAuth v5) with LEARNER + ADMIN roles.
3. **One-click guest entry.** Deep-links to `claim_review` per the plan, but that
   simulation does not exist until Week 3 — Week 1 ships the button and the `?tour=1`
   plumbing pointed at the landing page. `SPEC.md` must record the intended destination
   so the intent survives.
4. Landing page skeleton, bilingual (AR default), RTL via logical properties.
5. `SPEC.md` v0 — the 14 client headings, one paragraph each.
6. Vercel project + DNS + SSL. **Week 1 ends with a live URL.**

## Done
- Repo, folder structure, the project rules file, `BUILD.md` (sanitized), `LATER.md`, `.gitignore`.
- **Publish safety.** Forbidden terms moved out of the repo into `.local/denylist.txt`
  with a 14-case regression fixture; `pre-push` hook installed; git history rebuilt as a
  single clean commit; repo-local git identity pinned to the personal account.
- **Scaffold.** Next.js + TypeScript + Tailwind, npm scripts, vitest harness with a
  smoke test, `AGENTS.md` shielding the project rules file from framework writes.
- `HANDOVER.md` with resolved versions, the clean-clone runbook, and the steps that do
  not survive a clone.

## Blocked / needs the owner
- [ ] Day 0 #2 — name/trademark check for "Masār". **Gates the Vercel project and DNS**,
      since the subdomain bakes the name in.
- [ ] Day 0 #1 — accounts on the personal Gmail (GitHub, Vercel, Neon, Paymob sandbox).
      Neon is needed before the first migration can run against anything but a local DB.
- [ ] Day 0 #3 — confirm the fictional entity names read as obviously invented (Week 2).
- [ ] Day 0 #4 — Stripe availability for an Egypt-based individual. Not a Week 1 gate;
      v1.0 ships the mock adapter only, so this only affects what `SPEC.md` claims.
- [ ] **Open question:** which Prisma models ship in v1.0. `BUILD.md` §6.4 lists 22, but
      the correction pass cuts the mastery engine, module quizzes, orders/refunds and the
      certificate registry. Building all 22 would contradict the scope; building too few
      forces a migration later.

## Decisions log
| Date | Decision | Why |
|---|---|---|
| 2026-09-08 | Name: **Masār** (مسار) | Vertical-neutral, licensable as a platform rather than one course brand. |
| 2026-09-08 | v1.0 cut to 6 weeks / ~65 h | Original 14-week plan was ~2× what one part-time person can ship. |
| 2026-09-08 | One simulation only (`claim_review`) in v1.0 | It is the hero moment; the other three stay documented patterns. |
| 2026-09-09 | **Postgres (Neon), not Turso/libSQL** | The ownership story is defined as content in git + `pg_dump` + `/api/admin/export`. `BUILD.md` §6.4/§7 is the stale side. |
| 2026-09-09 | **Plain `provider = "postgresql"`**, no driver adapter | Fewer moving parts, and `pg_dump` works unchanged — which the ownership story depends on. |
| 2026-09-09 | **`create-next-app@latest`**, not pinned 14.2.35 | Instructed by the correction pass. Landed Next 16 / React 19 / Tailwind 4; recorded in `HANDOVER.md`. |
| 2026-09-09 | **Prisma held at 7.10.0** | `latest` currently resolves to `8.0.0-rc.13`; a release candidate does not belong on the critical path, and the CLI must match the client. |
| 2026-09-09 | **Denylist moved to `.local/`, history rebuilt** | The terms were literals in a tracked file — itself a hard-rule violation — and the private plan path was in commit 1. One fresh commit removes every vector rather than regex whack-a-mole. |
| 2026-09-09 | **`AGENTS.md` added** | `next dev` injects a managed block into the project rules file unless `AGENTS.md` exists. Keeps the framework out of the hard-rules file. |
