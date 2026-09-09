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

### Accounts created to test a gate

Any account created to exercise an authorization gate gets a **random** password and is
**deleted in the same session**, or it is created in a scratch database instead. Never a
known or guessable password, and never left behind.

This rule exists because it was broken once: an admin account with the password
`demo-admin-password` was written to the *production* database while testing that
`/admin/analytics` refuses non-admins. It was deleted immediately and the promoted guest
demoted, leaving zero privileged accounts — but the window should not have existed.

Verify with a direct query rather than trusting a cleanup step:

```sql
SELECT role, count(*) FROM "User" GROUP BY role;
```

### Role changes do not take effect until the next sign-in

Sessions are JWTs and the role travels on the token, so promoting a user to `ADMIN` in the
database leaves their current session refused. This is correct for JWT sessions, not a
defect — but it costs an hour if you debug it without knowing. Sign out and back in after
any role change.

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
| `@prisma/adapter-pg` | 7.10.0 |
| `@prisma/client` | 7.10.0 |
| `@tailwindcss/postcss` | 4.3.3 |
| `@tanstack/react-query` | 5.102.8 |
| `@types/node` | 20.19.43 |
| `@types/pg` | 8.23.1 |
| `@types/react` | 19.2.18 |
| `@types/react-dom` | 19.2.7 |
| `@vitejs/plugin-react` | 6.1.1 |
| `bcryptjs` | 3.0.3 |
| `dotenv` | 17.4.2 |
| `eslint` | 9.39.5 |
| `eslint-config-next` | 16.3.4 |
| `lucide-react` | 1.43.0 |
| `next` | 16.3.4 |
| `next-auth` | 5.0.0-beta.32 |
| `next-intl` | 4.14.2 |
| `next-themes` | 0.4.6 |
| `pg` | 8.23.0 |
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

**Mitigation.** Adding the personal Gmail as a co-owner on the Vercel team was
considered and declined by the owner. The risk above is therefore accepted as it stands,
knowingly, rather than left open as a pending task.

**Scope of the exception.** This is limited to the deployment account. GitHub and Neon
are on the personal Gmail, the repository-local git identity is the personal address, and
nothing in the repository, the commit history or any deployed output carries the work
address — verified by the publish-safety gate over every blob in the object database.

### Resolved: the driver switch, and the misdiagnosis behind it

**What was believed.** That this machine could not open outbound TCP 5432 — that the
Postgres port was blocked at the network level. `lib/db.ts` was switched to
`@prisma/adapter-neon` over a WebSocket on 443 to work around it.

**What was actually true.** A Neon endpoint auto-suspends when idle and takes a few
seconds to wake. The first TCP connection hit a suspended endpoint and timed out; an HTTP
call then woke it; TCP was never retried. **A cold start, not a firewall.** The control
test used at the time — HTTPS to a different, always-awake host — never isolated the
variable it claimed to.

**Current state.** `@prisma/adapter-pg` is restored and verified: three consecutive
transactions succeeded (1950 ms on the first, ~750 ms after), `prisma migrate status`
reports no drift, and `prisma migrate dev` reports "Already in sync". The Neon-specific
packages have been removed.

**The lesson worth keeping.** A first connection can time out while the next succeeds
instantly. Retry before concluding anything about the network, and make sure a control
test varies only the thing being tested.

### Authorization is server-side only, and deliberately so

**The rule.** the project rules file rule 8 asks for permission checks in middleware *and* re-checked
in every server action and route handler.

**What is actually in place.** Only the server-side check. `/admin/analytics` resolves the
session and returns a 404 — not a 403 — when the caller is not an `ADMIN`, so the route
does not confirm its own existence to someone who may not use it.

**Why the middleware layer is missing.** The proxy runs on the edge, and this project's
auth configuration imports Prisma, which is not edge-safe. The available shortcut is a
cookie-presence check in the proxy, and that was **deliberately rejected**: it inspects
whether a session cookie exists without validating it, so it looks like authorization to
anyone reading the file while providing none. Worse, it would make the real server-side
check look redundant and invite someone to weaken it.

**Do not "fix" this by adding a cookie check to the proxy.** An honest gap is better than a
layer that performs security theatre. Closing it properly means an edge-safe auth
configuration — splitting the session verification away from the Prisma import — which is
a real piece of work, not a patch.

**Residual risk.** Low. The server-side check is the one that actually protects the data;
no admin surface is reachable without it, and v1.0 ships no admin writes at all.

### Vercel project settings that a build log will not reveal

Three settings caused or masked failures during the first deployment. All are project
configuration, not code, and none appear in a build log.

**`framework` must be `nextjs`.** The project was first imported with `framework: null`.
Vercel built the application correctly — `prisma generate` ran, `/ar` and `/en`
prerendered, the proxy was present, the build reported success — and then served the
output as a plain static directory: no App Router, no proxy, no route table. Every path
returned `X-Vercel-Error: NOT_FOUND` behind a green build.

**Production branch must be `main`.** The repository's default branch is `main`; a project
pointed at another branch produces no production deployment.

**Diagnostic rule.** A green build plus a 404 on *every* route, including the raw
`.vercel.app` alias, means project settings — not DNS, not the domain, not the code. The
two failure modes above are indistinguishable from the dashboard.

**Deployment Protection is deliberately off.** It was `all_except_custom_domains`, which
returned SSO redirects on some aliases and 404s on others and made the routing failure
much harder to isolate. For a public portfolio demo whose entire purpose is that a
stranger can open the link, off is the correct end state. This is a deliberate setting,
not an oversight.
