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
| `@types/node` | 24.13.3 |
| `@types/pg` | 8.23.1 |
| `@types/react` | 19.2.18 |
| `@types/react-dom` | 19.2.7 |
| `@vitejs/plugin-react` | 6.1.1 |
| `bcryptjs` | 3.0.3 |
| `dotenv` | 17.4.2 |
| `eslint` | 9.39.5 |
| `eslint-config-next` | 16.3.4 |
| `jsdom` | 29.1.1 |
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
- **`next dev` can write an agent-instructions file at the repository root.** It is
  local tooling output, not project documentation, and is kept out of version control.
  The rules the code is built to live in `docs/CONVENTIONS.md`.
- **`jsdom` is a dev dependency, and it earns its place.** `tests/batched-clicks.test.tsx`
  renders the real components and fires several clicks inside one React batch, which is
  the only way to catch a handler that computes state from its render closure instead of
  from previous state. Testing the extracted pure updaters alone would pass even if a
  handler were reverted to the broken form — a test that cannot fail for the bug it names,
  which is `docs/design/what-failed.md` entry 5. The test was verified red against the old
  handlers before it was kept. Removing `jsdom` removes the only guard on that class.

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

**The rule.** The original project rules asked for permission checks in middleware *and* re-checked
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

---

# Architecture

A single Next.js application talking to one Postgres database. No queue, no cache, no
second service, no blob store. Everything below is a consequence of that being enough.

```
Next.js (App Router)  ──  Prisma + @prisma/adapter-pg  ──  Postgres (Neon)
        │
        ├── app/[locale]/…      pages, Arabic default with an English mirror
        ├── app/api/…           route handlers: auth, demo, sim, attempt, certificate,
        │                       checkout, retention, me/export, me/delete
        ├── lib/                the pure logic: scoring, assembly, certificates,
        │                       retention, auth guard, payments
        ├── content/            lessons, items and simulations as JSON, in git
        └── pipeline/           gates, contract, prompts, memory
```

**Where the rules live.** Anything that could silently corrupt a grade, a certificate or a
privacy claim is a pure module under `lib/`, unit-tested, with no database or request in
sight: `lib/scoring/claim-review.ts`, `lib/assessment/{assembly,scoring}.ts`,
`lib/certificates.ts`, `lib/retention.ts`, `lib/auth-guard.ts`. Route handlers call them;
they never reimplement them.

**Content is data, in git.** Lessons, items and simulations are JSON files validated by a
Zod schema, loaded into the database by seed scripts. The database is a load target, not
the source of truth — which is what makes the export story below real rather than nominal.

# Commands

```
npm run dev            development server
npm run build          production build (runs prisma generate first)
npm run check          typecheck + lint + tests + prisma validate — run before committing
npm run test           vitest
npm run schema:export  regenerate content/schema/lesson.schema.json from the Zod source
npm run db:migrate     prisma migrate dev
npm run db:deploy      prisma migrate deploy

python pipeline/validate.py --denylist .local/denylist.txt
python pipeline/concept_log.py --check
python pipeline/qa_gate.py --verdict <file>
python pipeline/test_validate.py && python pipeline/test_concept_log.py && python pipeline/test_qa_gate.py
```

# Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string, pooled |
| `AUTH_SECRET` | Session signing secret |
| `SHADOW_DATABASE_URL` | CI only, for `migrate diff --from-migrations` |

`.env.example` is committed with placeholder shapes; `.env` is gitignored and never leaves
the machine.

# Costs

| Item | Plan | Monthly |
|---|---|---|
| Vercel | Hobby (non-commercial) | $0 |
| Neon Postgres | Free | $0 |
| GitHub | Public repository | $0 |
| Domain | Already owned | — |
| Payment provider | None activated | $0 |
| **Total** | | **$0.00** |

The Hobby plan forbids commercial use, which is why the price card never renders without a
test-mode banner and why no payment provider is activated. A production-scale equivalent
would be a paid database tier and a paid hosting tier; nothing about the architecture
assumes the free tiers.

# How you take all of this and leave

The point of this section is that none of it depends on the author, this account, or this
hosting provider.

**1. The source code.** A public Git repository. Clone it; there is no build service, no
private registry and no proprietary tooling.

**2. The content.** Every lesson, item and simulation is a JSON file under `content/`, in
git, validated by a published schema. The database can be rebuilt from these files with the
seed scripts. Nothing about the course lives only in a database row.

**3. The database.** One standard Postgres. A full dump is one command:

```bash
pg_dump "$DATABASE_URL" > masar-backup.sql
```

Restore it anywhere that speaks Postgres. `@prisma/adapter-pg` is the generic driver, not a
vendor-specific one, so moving off Neon is a connection-string change.

**4. Learner data.** Any signed-in learner can export everything held about them as JSON
from `/api/me/export`, and delete their account outright at `/api/me/delete`. Deletion
cascades; a test fails the build if a model is ever added that holds a learner id without a
cascade.

**5. The schema.** `npx prisma migrate deploy` rebuilds the structure from the committed
migrations against any empty Postgres.

**6. The domain.** A CNAME. Point it elsewhere and this stops being the deployment.

**7. The pipeline.** Python, standard library plus `jsonschema` and `PyYAML`. It calls no
model API and has no credentials of its own.

# Licences

- **Code** — MIT.
- **Course content** — CC BY-NC 4.0.
- **Dependencies** — all permissively licensed; no commercial licence is required to run,
  modify or redistribute this.
- **Code sets** — none licensed. Every code in the course is fictional
  (`PRC-1000` procedures, `DX-A100` diagnoses) precisely so that no licensed descriptor is
  redistributed. A real deployment would license real code sets and is responsible for
  doing so.

# What is deliberately not built

Recorded in `LATER.md` and scoped out in writing before the build, not dropped when time
ran short: a second simulation, module quizzes, a mastery engine, content CRUD editors, an
instructor role, real payment adapters, SCORM export, a mobile app, and email
deliverability beyond a single free tier.

# Support model

Thirty days of defect correction after handover.

| Severity | Definition | Response |
|---|---|---|
| P1 | Platform down, or grading or certification incorrect | 1 business day |
| P2 | A feature is broken and a workaround exists | 3 business days |
| P3 | Cosmetic | Next release |

**Defect versus change request.** A defect is behaviour that contradicts this document, the
specification, or a committed test. Anything else — including behaviour that is correct but
unwanted — is a change request. Writing that distinction down in advance is the part that
usually gets skipped, and it is where most support relationships fail.
