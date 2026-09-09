# HANDOVER

Architecture, runbook, environment, costs, licences and ownership.
Written incrementally; v1.0 scope only (see `LATER.md` for what is deliberately absent).

## Runbook — clean clone to running instance

```bash
git clone <repo> masar-platform && cd masar-platform
npm install
cp .env.example .env.local          # then fill in the values
npm run dev                          # http://localhost:3000
```

Verify with `npm run check` (typecheck + lint + tests).

### Steps that do not survive a clone

These are **not** in version control and must be redone on every new machine:

1. **git identity.** The global git config may be a work account, which no dashboard
   surfaces. Set it per repository before the first commit:
   ```bash
   git config --local user.email "<personal address>"
   git config --local user.name  "<name>"
   git log -1 --format='%an <%ae>'   # verify
   ```
2. **The publish-safety gate.** `.local/` is gitignored, so the denylist and the
   `pre-push` hook are absent after a clone. Restore `.local/denylist.txt`, run
   `bash .local/denylist-selftest.sh`, and reinstall `.git/hooks/pre-push`.
   Git hooks are never cloned.
3. **Node on PATH** if using a portable install.

## Environment

| Runtime | Version |
|---|---|
| Node | v24.14.0 |
| npm | 11.9.0 |
| Git | 2.53.0 |
| Python | 3.13.14 |

Verified 8 Sep 2026 on Windows 11. `gh` and `vercel` CLIs are not installed;
the GitHub and Vercel web dashboards are used instead.

## Dependency versions as installed

Installed with `create-next-app@latest` rather than pinned versions, so these are
what actually resolved — not what any planning document predicted.

| Package | Version |
|---|---|
| `@prisma/client` | 7.10.0 |
| `@tailwindcss/postcss` | 4.3.3 |
| `@tanstack/react-query` | 5.102.8 |
| `@types/node` | 20.19.43 |
| `@types/react` | 19.2.18 |
| `@types/react-dom` | 19.2.7 |
| `@vitejs/plugin-react` | 6.1.1 |
| `bcryptjs` | 3.0.3 |
| `eslint` | 9.39.5 |
| `eslint-config-next` | 16.3.4 |
| `lucide-react` | 1.43.0 |
| `next` | 16.3.4 |
| `next-auth` | 5.0.0-beta.32 |
| `next-intl` | 4.14.2 |
| `next-themes` | 0.4.6 |
| `prisma` | 7.10.0 |
| `react` | 19.2.8 |
| `react-dom` | 19.2.8 |
| `recharts` | 3.10.1 |
| `sonner` | 2.0.8 |
| `tailwindcss` | 4.3.3 |
| `typescript` | 5.9.3 |
| `vitest` | 4.1.11 |
| `zod` | 4.5.4 |

### Deviations worth knowing

- **Next 16, not 14.** The build brief named 14.2.35. Using `@latest` was a
  deliberate instruction; Next 16 changes enough that framework code should be
  checked against the version-correct guides shipped in `node_modules/next/dist/docs/`.
- **Tailwind 4, not 3.4.** Tailwind 4 is CSS-first: there is no `tailwind.config.ts`,
  and theme tokens live in an `@theme` block in `app/globals.css`.
- **Prisma pinned to 7.10.0.** The `latest` dist-tag currently resolves to
  `8.0.0-rc.13`. A release candidate does not belong on this project's critical
  path, and the CLI must match `@prisma/client`. Revisit when 8.x is stable.
- **`npm run typecheck` runs `next typegen` first.** Next 16 generates global route
  types during the build; a bare `tsc --noEmit` fails on `LayoutProps`, which is not
  checked in. CI must run the script, not `tsc` directly.
- **`AGENTS.md` is framework-managed.** `next dev` injects a block into `AGENTS.md`
  when it exists, and into the project rules file only when it does not. `AGENTS.md` exists so
  the framework never edits the file carrying the project's hard rules. Do not delete it.

## Known deviations

Departures from the project's own rules, recorded rather than quietly absorbed.

### Vercel is on the work-email account

**The rule.** Every account for this project is created with the personal Gmail, so the
work is never bound to an employer's identity.

**What was done instead.** The Vercel account is the work-email one. It already owns
`mostafafathy.com` and deploys the live portfolio site, so `masar` was added there as its
own project rather than splitting one domain's DNS across two Vercel accounts.

**Why.** Splitting a domain across accounts means the apex and the subdomain are
administered separately, which is fragile for a site that is in active use and is the
destination the whole job search points at.

**Residual risk.** Account continuity is tied to an email address the owner does not
control long term. If access to that address ends, so does control of the project and,
more seriously, of the portfolio domain.

**Mitigation.** Add the personal Gmail as an owner on the Vercel team, so control does
not depend on the work address. Until that is done the risk is live.

**Scope of the exception.** This is limited to the deployment account. GitHub and Neon
are on the personal Gmail, the repository-local git identity is the personal address, and
nothing in the repository, the commit history or any deployed output carries the work
address — verified by the publish-safety gate over every blob in the object database.

### The Neon driver, not the generic Postgres driver

**The intent.** Use plain `@prisma/adapter-pg` so the same code runs against any Postgres
and nothing is bound to one vendor.

**What was done instead.** `lib/db.ts` uses `@prisma/adapter-neon` over a WebSocket.

**Why.** The development machine cannot open outbound TCP 5432 — DNS resolves and HTTPS
works, but the Postgres port is blocked at the network level. `adapter-pg` cannot connect
at all from there. The Neon driver tunnels Postgres over 443, which works locally and in
production.

**Residual risk.** The *driver* is Neon-specific. The database is not: the schema, the
data and the `pg_dump` export are ordinary Postgres, so the ownership story is unaffected.
Reverting to `adapter-pg` is a few lines once the network allows it.

**Consequence.** `prisma migrate` needs a direct TCP connection and therefore cannot run
from the development machine at all. The baseline migration was generated offline and
applied over HTTP, and the CI `migrations` job replays it against a real Postgres on every
push to prove it reproduces the datamodel.
