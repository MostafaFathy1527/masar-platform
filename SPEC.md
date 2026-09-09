# Masār — product specification (v0)

The fourteen headings a prospective client asked to see before development starts.
One paragraph each at v0; sections deepen as each week lands.

**Status: v0, written in Week 1.** Where a section describes something not yet built,
it says so. Nothing here is a claim that a feature exists.

**Scope of record: v1.0 = 6 weeks, ~65 hours.** Anything outside that is in
[`LATER.md`](LATER.md) and is not promised here, in the README, or in the case study.

> This is a self-initiated demonstration platform. It is not affiliated with, or
> recognized by, any certification body. Course content is original and written from
> public knowledge; all identifiers, payers, patients and codes are fictional and
> labelled as training data. Not medical, billing, clinical, legal or regulatory advice.

---

## 1. Sitemap

Public routes: landing (Arabic default, English mirror), course catalogue and course
page, a free flagship lesson preview needing no signup, `/method` showing the depth
model, `/how-it-was-built` exposing the content pipeline's own artefacts, `/demo` for
one-click guest entry, public certificate verification at `/verify/[serial]`, and the
legal pages including a privacy inventory. Learner routes cover the dashboard, the
course map, the lesson player, the full-screen practice simulation, quizzes, the exam
player, an attempt review screen and results. Admin is four read-mostly pages —
analytics, lessons, question bank with a coverage matrix, and learners — deliberately
not a CRUD suite. API routes are grouped under `/api` for auth, attempts, simulation
submission, certificates and the admin content import.

## 2. Course architecture

One course ships in v1.0: an original, payer-agnostic introduction to medical insurance
and revenue-cycle work. It is organised as course → module → lesson, with twelve
learning objectives forming the spine. Every content block and every assessment item
carries an objective code, which is the single design decision that makes coverage,
weakness reporting and item analysis the same database query rather than three separate
features. One objective covers fraud, waste and abuse — upcoding, unbundling and
medical-necessity integrity — because a course about getting claims paid that never
raises compliance reads badly to anyone who does the work.

## 3. Module and lesson structure

A lesson is one database row holding three block arrays, one per depth level, rather
than three separate lessons. This is the central idea: **L1** is the source material
professionally structured; **L2** rebuilds it as an interactive experience with worked
examples, knowledge checks and consequential scenarios; **L3** adds a rehearsal of a
real job task, scored against a published rubric. Because depth is a property of a
lesson, upgrading L1 to L2 is an additive diff — no URL change, no re-enrolment, no
progress reset. That is what makes it a commercial scoping instrument: a client can buy
every lesson at L1 and upgrade selected flagships later. v1.0 ships five lessons, with
one at L3.

## 4. UX and UI

Arabic-first and right-to-left by default, with English as a full mirror. RTL is
implemented with CSS logical properties rather than mirrored stylesheets, so a single
layout serves both directions. The lesson player is a reading column with a progress
rail and a depth switch; the simulation is full-screen, and on narrow viewports its
evidence panel becomes a bottom sheet, verified at 390px. Accessibility is part of
"done", not a later pass: a keyboard path for every interaction including drag
exercises, visible focus, alt text, live regions for feedback, and no meaning carried
by colour alone. **Bilingual honesty:** the UI is fully bilingual and the interactive
lessons are Arabic; any lesson that ships English-only says so on its own page rather
than being covered by a blanket "bilingual" claim.

## 5. Database

PostgreSQL via Prisma, hosted on a free-tier Neon instance. v1.0 begins with seven
models — user, course, objective, module, lesson, enrolment and lesson progress — and
adds tables per week as each feature lands, rather than provisioning tables for
features the schedule may cut. Conventions throughout: collision-resistant string ids,
created and updated timestamps on every row, a database enum for every state machine,
and soft deactivation instead of deletion. Lesson content is stored as validated JSON on
the lesson row rather than in a relational block store; every block carries a stable id,
so block-level analytics and "which block taught this" remediation still work, without
the cost of building an editor over a block table.

## 6. Roles and permissions

Two real roles and one machine identity. A **learner** owns their enrolments, attempts,
submissions and certificate. An **admin** can see everything, including analytics and
certificate revocation. A **service identity** — a bearer token, not a user — may write
*draft* content only and has **no publish permission by design**, which is what keeps a
human in the loop between the content pipeline and anything a learner sees. Permissions
are decided by one pure function, checked in middleware for route groups *and*
re-checked inside every server action and route handler. Never UI-only, and unit-tested
per role per action.

## 7. Student journey

Discover the course page, read the flagship lesson free with no signup, then either
register or enter as a guest in one click. **The guest button leads with practice, not
reading:** it deep-links straight into the claim-review simulation with a guided tour
banner, because the fastest way to show what this platform is differs from the fastest
way to explain it. *(Week 1 note: the simulation ships in Week 3. Until then the button
carries the tour parameter and lands on the landing page; the intended destination is
the claim-review workbench, recorded here so the intent survives.)* From there: learn,
practise ungraded knowledge checks, take a scored lesson quiz, complete the applied
simulation, sit one exam, and reach a certificate.

## 8. Assessment system

Assessment is assembled from a blueprint, not drawn from an undifferentiated pool.
Items carry an objective, a cognitive level and a type; the bank targets roughly sixty
approved items for v1.0, weighted toward application and analysis rather than recall,
with more than half set in a scenario. Every option — correct and incorrect — carries
feedback, and every distractor's rationale must name the misconception it represents;
missing feedback fails the content quality gate. The ladder is deliberately short at
v1.0: ungraded in-lesson knowledge checks, a scored lesson quiz, and one blueprint-
sampled exam with a per-objective breakdown. Integrity rules are non-negotiable and each
is a committed test: attempts are materialised server-side, the payload for an
in-progress attempt is stripped of correct answers and rationales, timers are
server-authoritative, and assembly fails loudly rather than silently serving fewer items.

## 9. Payments

Payment lives behind a provider interface with a single **mock adapter** in v1.0. No
real payment processor is activated and no money moves. The interface exists so that a
real provider is a configuration change rather than a rewrite, and the specification
documents what going live would actually require — which is the part usually left out of
a proposal. A regional processor needs commercial registration, a tax card and merchant
verification that a self-initiated project does not have; and at least one major
international processor does not onboard individuals in every country, so availability
must be confirmed rather than assumed. The hosting plan used for the demo is
**non-commercial**, so the price card never appears without a banner reading *"Demo —
test mode, no real purchases."*

## 10. Certificate workflow

A certificate is issued only when defined gates are met, and the gates are printed on
the course page **before** anyone enrols, so the standard is visible in advance rather
than discovered afterwards. Unusually, the certificate prints **which objectives the
holder demonstrated**, on the argument that a credential saying what someone can do
beats one saying they attended. Each certificate has a serial and a content hash, and
the **public verification URL is the source of truth, never the PDF file**. An admin can
revoke, and the public page reflects that immediately. Every certificate face carries:
*Certificate of completion for a self-initiated training course. Not affiliated with, or
recognized by, any certification body.*

## 11. Admin functionality

Four read-mostly screens in v1.0: analytics, a lesson list with validation status, the
question bank with a blueprint coverage matrix showing gaps, and a learner list.
Deliberately **not** built: content CRUD editors, a blueprint editor, an orders console,
a certificate registry and an instructor role — those are scope decisions, documented in
[`LATER.md`](LATER.md), not omissions. Analytics answers stated learning questions
rather than showing vanity metrics: there are no streaks and no leaderboards. Item
statistics need roughly twenty first attempts per item before they mean anything, so
every screen fed by seeded data carries a visible **demo data** badge and the case study
repeats the caveat.

## 12. Development phases

Six weeks, about sixty-five hours, at roughly twelve hours a week alongside a job
search, with **something deployed at the end of every week**. Week 1 foundations and a
live placeholder; Week 2 the lesson renderer and depth model; Week 3 the claim-review
simulation, which is the hero moment; Week 4 assessment and a lightweight certificate;
Week 5 content and the AI pipeline; Week 6 the payment interface, the case study and
handover. Explicit cut lines exist in advance: if a week runs short, defined features
drop rather than the demo shipping half-built. New ideas go to [`LATER.md`](LATER.md),
never onto the main branch.

## 13. Deliverables and handover

The client receives the running platform, the repository under an open licence for the
code and a non-commercial licence for the content, this specification, and a handover
document covering architecture, environment, runbook, costs and licences. Ownership is
demonstrated rather than asserted: lesson and item content lives in the repository as
JSON, the database exports with a single standard `pg_dump` command documented in the
handover, and an admin export endpoint produces the content as files. There is no
proprietary format and no vendor lock-in — the handover document is explicitly written
as *how you take all of this and leave*.

## 14. Support model

Thirty days of defect correction after handover, with a written severity scale:
platform down or grading incorrect within one business day; a broken feature with a
workaround within three; cosmetic issues in the next release. The document defines the
difference between a **defect** and a **change request** in writing, because that
distinction is where most support relationships fail. Handover includes one recorded
walkthrough and a question window afterwards. A public maintenance log is kept for the
first thirty days after launch, so the process is evidenced rather than claimed.

---

## Privacy inventory

Stored: email, display name, a password hash, hashed IP for 24 hours for rate limiting,
and learning data (progress, attempts, submissions). Guest accounts are purged on a
schedule. Learners can export their own data and request deletion. **No third-party
analytics runs on learner pages, ever** — learning data stays as first-party rows in
this project's own database, which is the point of the ownership argument. Relevant to
data-protection regimes in the target market.
