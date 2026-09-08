# STATUS

Update this file at the end of every session. It is the first thing the next session reads.

## Now
Nothing built yet. Repo scaffolded on 8 Sep 2026.

## Next (Week 1)
1. Walk through `docs/DAY0.md` with the owner — accounts, name check, Stripe availability.
2. Scaffold: Next.js (App Router) + TypeScript + Tailwind, `create-next-app@latest`.
3. Prisma + a free Postgres (Neon) — schema for User, Course, Module, Lesson, Enrollment.
4. Credentials auth + **one-click guest login** (`POST /demo`).
5. Landing page skeleton + deploy to Vercel. **Week 1 ends with a live URL.**
6. `SPEC.md` v0 — the 14 client headings, one paragraph each.

## Done
- Repo, folder structure, the project rules file, `BUILD.md` (sanitized), `LATER.md`, `.gitignore`.

## Blocked / needs the owner
- [ ] Day 0 checklist (accounts on the personal Gmail, name/trademark check, Stripe check).
- [ ] Confirm the demo course domain stays medical-insurance/RCM.

## Decisions log
| Date | Decision | Why |
|---|---|---|
| 2026-09-08 | Name: **Masār** (مسار) | Vertical-neutral, licensable as a platform rather than one course brand. |
| 2026-09-08 | v1.0 cut to 6 weeks / ~65 h | Original 14-week plan was ~2× what one part-time person can ship. |
| 2026-09-08 | One simulation only (`claim_review`) in v1.0 | It is the hero moment; the other three stay documented patterns. |
