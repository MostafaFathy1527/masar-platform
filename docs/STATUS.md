# STATUS

Update this file at the end of every session. It is the first thing the next session reads.

## Now
**v1.0 is complete and deployed.** All six weeks shipped at `masar.mostafafathy.com`, CI is
green, and `npm run check` passes with no warnings. The interior has since been rebuilt on a
real design system — see "Design system" below.

This section was itself stale for weeks: it said five of six weeks were done, and claimed
environment variables were unset on Vercel so `POST /api/demo` returned 500 in production.
Both stopped being true and nothing forced the sentence to follow. That is the same
sub-pattern this file documents further down, in the file whose whole job is to tell the
next session what is true.

**Added 2026-09-22 — Techne Summit community-partner strip.** Masār is entering Techne
Summit 2026 as a community partner in its own name, and the partnership asks for a link
back on the partner's site. The strip lives in `SiteFooter`, above the footer columns, so
the link is on every page without a partner badge landing inside a lesson. The application
form was submitted by the owner; if Techne does not confirm, this strip comes out.

**What remains needs a person, not an agent**: the blind
inter-rater check, and one open accuracy question for a practitioner. The judge sitting and
the instructional-design review are done. The SME
recruitment is **closed, not deferred** — §0.7 records it as a scope decision and the
limitation is stated on the page. **The narrated recording is cut**, also a decision rather
than a deferral: it is not in `LATER.md` and should not reappear as an open item.

Note: `/method` is **not** in v1.0. It belongs to the 14-week plan's Week 9, which §0.3
cut; `/depth` already renders the depth model.

**Outbound 5432 is intermittently blocked on this network.** Not "blocked", not "a cold
start" — *intermittent*, and both states have been measured on the same machine, the same
host and the same `.env`, hours apart:

| When | Raw TCP 5432 | Postgres handshake |
|---|---|---|
| Working | — | **1,933 ms**, returned `PostgreSQL 18.6` and the table count |
| Blocked | **TIMEOUT after 20,107 ms** | **ETIMEDOUT after 21,566 ms** |

**The diagnostic is a same-host 443-vs-5432 comparison.** In the blocked state, 443 to that
exact Neon host connects in ~150 ms while 5432 times out twice at 20 s+. Same host is the
whole point: it isolates the port from DNS, routing and the endpoint being down. Comparing
against a *different* host is what made the earlier diagnosis on this page wrong, and a
cold start is ruled out because a cold start still completes the TCP handshake — Neon's
proxy accepts the connection and then wakes the compute.

Write neither verdict down as permanent. A flat "blocked" or a flat "cold start" would be
wrong within a day and would cost the next reader an afternoon. Run the comparison; it
takes seconds and it answers the question in whichever state the network is in.

Production is unaffected — Vercel has its own egress — so DB-backed screenshots come from
production while this is in the blocked state.

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

**Middleware authorization is not in place.** The original project rules asked for permission checks
in middleware *and* re-checked server-side. Only the server-side check exists. The proxy
runs on the edge and this project's auth config imports Prisma, which is not edge-safe.
A cookie-presence check in the proxy was deliberately not added: something that looks like
authorization without being it is worse than a recorded gap. The server-side check is the
one that actually protects the data, and a non-admin gets a 404 rather than a 403 so the
route does not confirm its own existence.

**Role changes need re-authentication.** Role travels on the JWT, so promoting a user to
ADMIN leaves them refused until they sign in again. Correct behaviour for JWT sessions
rather than a defect, but worth knowing before someone debugs it twice.

## The pipeline, what it claims, and what it does not

Three gates exist, each with negative tests proving it refuses things, and all run in CI:

| Gate | Refuses | Negative tests |
|---|---|---|
| `validate.py` | structure, undeclared objectives, wrong-level blocks, duplicate ids, prose budget, licensed code sets | 18 |
| `concept_log.py` | re-defining a concept an earlier lesson taught; using one before it is introduced | 6 |
| `qa_gate.py` | any criterion below 3, a mean below 4.0, a verdict missing criteria, a criterion scored where the registry gives it no evidence, a skipped criterion with no reason | 20 |

Each set includes a case asserting valid content **passes**, so no gate can satisfy its own
tests by refusing everything.

**That was not enough, and `qa_gate.py` proves it.** It carried nine passing negative tests
while being unable to evaluate an L1-only lesson at all — four of the five shipped lessons.
Negative tests constrain what a gate *rejects*; only a positive case over real input
constrains what it can *accept*. Both of its "valid content passes" fixtures used the
eight-criterion shape, so they encoded the same assumption as the bug. See
`docs/design/what-failed.md` entry 10.

**The gates were built before the generation, and that ordering is the argument.** A
generator built first and gated afterwards is gated to whatever it already produces. This
is checkable in the commit history rather than asserted.

**Content has now been through it.** The five shipped lessons were hand-authored, but
`pipeline/out/lesson-02/v1` was generated from a source note, passed both deterministic
gates, and has now been judged and gated: **PASS, mean 4.14 over seven scored criteria,
nothing below 4**, with `knowledge_check` declared not scorable at L1 and the reason
recorded. `pipeline/memory/run-log.jsonl` holds that run.

**n = 1 is a result, not a first-pass rate.** `/how-it-was-built` reads every figure from
the run log and says exactly that, because a percentage from one run is a number pretending
to be a trend.

**The judge's independence caveat travels with the score**, verbatim, from the run-log entry
to the page. The judge did not see the generation prompt and did not author the lesson, but
the same session directed the project and set several of its constraints — weaker
independence than the rubric assumes. That caveat is why the blind inter-rater check is now
the load-bearing open item: the page publishes a rubric score that only resolves when a
human scores three lessons blind against the same rubric.

Running the loop honestly needs two sessions: one to generate, and a **separate** one for
the judge, which §0.4 item 5 requires to be a fresh context that has never seen the
generation prompt. An agent that wrote the generation prompt cannot also judge the output
without producing a number that looks like evidence and is not.

## The gate crashed on the content it was quoting

Recorded here with its own heading rather than as a line in a commit message, because it is
a second finding and not a detail of the first.

`qa_gate.py` printed its report to stdout. On Windows that stream defaults to cp1252, so the
gate **died with a `UnicodeEncodeError` on any character outside that codepage**. What
actually killed it was a single icon inside a judge's note.

On a project whose entire differentiator is Arabic, that is not an edge case. The first
Arabic judge note would have crashed it, and the crash happens while *printing the report* —
after the verdict has been evaluated, so the gate would have failed at the last step, on the
content it was quoting, having already done the work correctly.

It surfaced only because the gate was run on real content. Every test passed, and every test
supplied ASCII. This is the same family as the evidence panel that reported itself visible
and rendered nothing: **the artefact worked in every test and not in use.**

`sys.stdout` and `sys.stderr` are now reconfigured to UTF-8 with `errors='replace'`.

**Recorded as entry 11** in `docs/design/what-failed.md`, where it names a second
sub-pattern: *a gate for a bilingual product whose tests only ever handle Latin text is
monolingual infrastructure wearing a bilingual claim.* It took two independent instances to
see it — this crash, and the Arabic case-study count that read `ستة إخفاقات` while every
English surface was correct. Two mechanisms, built months apart for unrelated purposes, both
silently assuming their inputs were Latin. **The non-English half of a bilingual system is
where verification quietly stops** — not by decision, but because whoever writes the test
writes the fixture, in the language they are thinking in.

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

## Design system

The interior of the product was rebuilt in two passes after a review found the presentation
undermining the writing: default dark shadcn, no header, no footer, no navigation, no
typographic hierarchy, and a 620px column floating in a 1280px viewport.

The palette is the owner's identity — amber `#F4A93C` on warm paper `#F6F4EF` — so a
reviewer moving from the portfolio site to this one sees one hand at work. **Light is the
default**, dark is the `prefers-color-scheme` alternate. Type is Archivo for display, Space
Grotesk for body, JetBrains Mono for labels and data, Cairo for Arabic, all self-hosted
through `next/font`. The layout language is editorial: mono eyebrows, a real display scale,
hairline rules instead of bordered cards, full-bleed bands alternating ground and surface,
prose at 68ch inside a 1240px shell.

Two rules that are easy to break and expensive to miss:

- **Arabic is never letter-spaced.** Tracking breaks the cursive joins. The mono faces carry
  no Arabic at all, so Arabic labels use Cairo a step smaller and heavier rather than
  falling through to a system monospace.
- **Every layout property stays logical** (`padding-inline`, `border-inline-start`), so one
  stylesheet serves both directions. 390px RTL is re-measured after any layout change rather
  than assumed — `scrollWidth` must be exactly 390 with no element escaping the viewport.

`scripts/shot.mjs` takes a colour scheme argument. A headless browser reports the host
machine's setting, so on a dark machine a light-default design photographs dark forever and
the default never gets reviewed. That is how entry 9 in `what-failed.md` was found.

## Next

**v1.0 is complete.** All six weeks are shipped and deployed. Week 6 delivered the
`PaymentProvider` interface with a mock adapter and the paywall, all six screenshots, the
case study in English with an Arabic summary, and `HANDOVER.md`.

**The judge sitting is done.** It ran in a fresh session and its verdict is at
`pipeline/out/lesson-02/v1/verdict.json`; the gate it exposed is repaired and the result is
published.

What remains needs a person, not an agent: the **blind inter-rater check** and the
instructional-design review.

The Arabic objective statements are **done** — written by the owner rather than translated,
and `MI-13` now carries a behavioural statement in both languages where it previously had
only a topic. `/ar` renders them directly; the fallback that showed the code with the
English beneath it is removed. The narrated recording is **cut from scope**.

**The inter-rater check is now the load-bearing one.** `/how-it-was-built` publishes a
rubric score that carries its own caveat about the judge's independence, and that caveat
only resolves when a human scores three lessons blind against the same rubric. Until then
the page is honest but the number is unconfirmed — which is the state it describes.

`docs/design/what-failed.md` has **fourteen** entries for §0.4 item 4. The first five share
one pattern — **the falsifiable claims are the ones that break, and they only break when
you try to game them.** The sixth, seventh and eighth break it in different directions: the
code was right and the product was wrong; the product was right and the tool was wrong; and
a check written to keep a screenshot honest caught the page lying to learners. The ninth and tenth pair with the gate's false pass instead: all three are checks that could
not do the thing they claimed. Tailwind 4 hoists `@theme` out of `@media`, so the dark
palette shipped unconditionally and the light default had never rendered anywhere. And
`qa_gate.py` could not accept an L1-only lesson — four of the five shipped — while nine
negative tests passed throughout.

The eleventh names a second sub-pattern — monolingual infrastructure under a bilingual
claim — from two independent instances. The fourteenth closed the README's oldest untested
sentence: the validator was domain-locked to the demo course's objective prefix in all three
places the schema lives, found the first time the pipeline was run on another subject.

**Both case-study locales now derive the count** from the document via `lib/failures.ts`,
after `/ar/case-study` sat at "ستة إخفاقات" while every English surface said nine. Every
count check on this project had been run against English text, which made hand-written
Arabic prose the one surface where a stale number could sit indefinitely. The mechanism has
since earned itself twice: the pages moved to ten and then to eleven with no edit.

Two things in that file are for the case study rather than the incident list. **Facts that
were true when written** — four of the fourteen are hardcoded facts that silently stopped
being true, and the general fix is to interpolate from the source of truth rather than
restate it. And **the gate has failed twice against one real catch** — a false positive on
binary blobs, and a false pass that printed `clean` over zero blobs scanned. A third
incident was recorded as a false positive and was not one: the pattern is anchored and the
prose was genuinely path-shaped, which is the operational note that a document describing
leak patterns will trip a leak detector.

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

- Repo, `BUILD.md` (sanitized), `LATER.md`.
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

## The lesson reader, and the hole in the brief

**The product listed five lessons and could not open one.** There was no lesson route —
no `/lesson/[slug]`, nothing. The lessons existed as validated JSON, passed every gate, were
listed on `/course` with objectives and durations, and could not be read.

**The plan omitted it.** §0.2's Week 2 specifies "Lesson renderer + block registry (16 block
types max) · L1 + L2 rendering · `/depth` page · lesson JSON schema + validate.py". All of
that was built and all of it was correct. The brief specified the machinery and a
demonstration of the machinery, and never specified the thing the machinery is for. This is
not scope creep against `LATER.md`; it is a gap in the specification.

**It is the first gap found by using the product rather than testing it, and the owner found
it** — not either agent. Every test in the repository derives from the specification, so
every test agreed with the specification, including the ones written to catch the product
being wrong rather than the code being wrong. A suite cannot find a page nobody said should
exist. Recorded as `docs/design/what-failed.md` entry 12, and kept distinct from entry 6:
that one was finished work behind no link, a navigation failure whose fix was links; this
one had nothing to link to.

**It also blocked the load-bearing item.** The blind inter-rater check requires reading three
lessons and scoring them. They did not render, so the check that resolves the caveat on
`/how-it-was-built` could not begin.

`/[locale]/lesson/[slug]` now reads the content files rather than the database, reuses the
`/depth` renderer and the existing registry (budget still 12 of 16), opens at the deepest
level a lesson declares, shows the depth switch only when there is a choice, states the
English-only notice before the body on `/ar`, lists objectives with their statements, and
links previous/next. The `/course` rows are links. It is a reader, not a player: no progress
tracking, no completion state, no block-viewed marking.

**Verified while the database was unreachable**, which was the point of reading from the
content files: all five lessons render in both locales with 5432 in its blocked state, and
390px RTL reports `scrollWidth` exactly 390 with no overflow and no letter-spaced Arabic.

## A design critique, and what it led to

An independent session reviewed the five lessons and the item bank. It is **a design
critique** — not a subject-matter review and not the blind inter-rater check — and anything
from it that reaches the case study is labelled that way. Every measurable claim in it was
reproduced from the content files before being acted on.

**The flagship lesson was demonstrating placeholders.** Lesson 04 — the one `/course`, the
case study and `/how-it-was-built` all point at as proof the depth model works — rendered
"This check renders once the item bank ships (Week 4)" twice at L2 and "The simulation ships
in Week 3" at L3, long after both shipped. No lesson had a working knowledge check. Knowledge
checks now render from the bank and are answerable; the L3 block links to the live simulation.
Recorded as `docs/design/what-failed.md` entry 13, the most serious in the record, and the
fourth instance of the stale-facts sub-pattern.

**Four lessons had no practice on a practice-first platform.** Lessons 01, 03, 05 and 07 now
declare L1 and L2. The plan was two knowledge checks each; `validate.py` defines a complete L2
as a worked example, two checks, and a scenario or sort exercise, so each got the full
definition rather than a relaxed gate. Eight formative items, one worked example and one
scenario per lesson, all passing `validate.py` and `concept_log.py`. The four lessons are
English-only, so their L2 content follows that declaration.

**The new items were not judged, deliberately.** `qa_gate.py` was not run on them: the judge
must not be the author, and the only other available session wrote the critique that asked
for them and has read every lesson they attach to. **The run log stays at n = 1.** An honest
n = 1 is worth more than a manufactured n = 4.

**MI-13 is now taught in proportion to how it is assessed.** Lesson 05 gains a table
distinguishing a single error from a pattern, with the record-based response for each, aligned
to the statement the owner approved. With the new L2 scenario and check, MI-13 has six blocks
behind its five items where it had three.

**The scenario bar is withdrawn for v1.0.** The 33% "scenario-led" figure was computed from a
hand-set `isScenario` boolean; no stem in the bank reaches the defined 60-word minimum. The
flag and every reader of it are deleted, including the "Scenario" badge that asserted the
property to learners. The Prisma column is dropped by migration
`20260910071908_drop_item_is_scenario`, generated offline because 5432 was unreachable.
**Applied.** CI #42 was green on the commit that introduced it, so the offline-generated migration has had its
replay check against a real Postgres. The owner approved `npm run db:deploy`; the SQL was read
first (one statement, `ALTER TABLE "Item" DROP COLUMN "isScenario"`), 5432 was confirmed
reachable, and it was applied. `migrate status` reports up to date, and production was healthy
afterwards: exam, lessons and course 200, `POST /api/demo` 303.

**The bank, as it verifiably is:** 50 items, 40 scored and 10 formative; two types; every one
of 196 options with feedback in both languages; Bloom over scored items 20/40/40; every
objective at exactly five scored items. Figures are over scored items deliberately — an
earlier count put two objectives at six, and both sixes were knowledge checks.

**Two things this surfaced that were already false.** The Prisma schema had claimed for weeks
that the wider item types "are in `LATER.md`" — they were not, and now are. And the commit
that fixed the placeholders said nothing checked `itemRef`; `tests/content-items.test.ts`
already checked that references *exist*, and what was missing was that they are *formative*.
Entry 13 says so.

## The instructional-design review of the L2 content

**Provenance, to be stated wherever this is cited:** a design critique from an independent
*session*. That session did not author the content, but it wrote the critique that asked for
it, and it has read every lesson the content attaches to. It is **not a subject-matter review**.

Its overall verdict was that the new L2 layers are strong — better than the L1 layers they
extend. Its findings, and what was done:

**An open accuracy question — needs a practitioner.** Lesson 07 taught, for a service denied
because the provider never obtained required authorisation, "absorb the loss or bill according
to the policy". Many provider–payer agreements prohibit billing the member for a denial caused
by the provider's own authorisation failure; if that applies, the lesson taught a prohibited
action. Neither agent is qualified to rule on it and the project disclaims domain review, so
**it stays open**. The interim wording is the safer one: *treat it as a provider loss unless
your agreement with the payer says otherwise.*

The claim did not originate in the new L2: lesson 07's L1 root-cause table, live since Week 5,
already said "otherwise absorb or bill per policy". Both are reworded, or the page would
contradict itself. The worked-example step was also an instructional defect on its own terms —
a "Decide" step offering two actions with no rule for choosing is not a decision — and now
states one action and the single condition that would change it.

**Three weak checks, replaced.** MI-04-KC-02 tested recall of the lesson's own heading;
MI-09-KC-01 was functionally a two-option item; MI-10-KC-01 measured MI-13's record-integrity
principle rather than choosing a corrective action.

**Two exam leaks the review did not flag.** Comparing every formative item with every scored
item on the same objective found MI-01-KC-01 was scored MI-01-05 with a clause appended, and
MI-13-KC-01 rehearsed MI-13-03's situation and answer. With the original MI-04-KC-02 —
near-identical to scored MI-04-03 — **three of the eight new formative items were exam leaks**:
a learner doing the lesson's check would have answered the exam question in advance. That is the
failure writing new items was meant to prevent, and nothing checks for it.

There is deliberately **no automated guard**. A lexical check would have caught the verbatim
MI-01 copy and missed the paraphrased MI-13 one, which measured only 0.25 word overlap — it would
claim coverage it does not have. **Formative/scored overlap is a review-time check.** One
remaining pair is borderline and was kept: MI-09-KC-01 and scored MI-09-02 both classify an
assessed refusal as a denial, in different situations, and MI-09-02 also asks the root cause.

All replacements pass `validate.py` and `concept_log.py`. None was run through `qa_gate.py`, for
the same reason as before; the run log stays at n = 1.

**What the review found genuinely good — for the case study, with the provenance above:**

- Every worked-example step names the judgement, not just the move — "Arranging is an
  intention. It is not evidence that the visit happened." That is the rubric's 5-behaviour,
  consistently.
- Every scenario option carries a consequence, including the best one. Most branching
  scenarios only explain the wrong answers.
- The distractors are misconceptions people actually hold: waive the balance to end the
  complaint; tell the member to call the payer; assume a high-billing clinician simply sees
  complex patients.
- Lesson 05's MI-13 scenario is the standout. Its wrong answer, "quietly downgrade those claims
  yourself", returns "you have changed claims without the record changing — the same move you
  noticed, in the other direction."
- Lesson 01 carries its worked-example numbers (800 → 640 / 160) into its scenario, so the
  learner applies the trace they just watched.

## A note for whoever opens this next

"Environment variables on Vercel" sat in the blocked list below for weeks, claiming
production was broken and `POST /api/demo` returned 500. It had been false since the day the
variables were set. It survived every previous pass over this file — **including passes whose
explicit subject was stale facts**, written by someone who had just finished cataloguing that
exact failure mode two sections above.

That is the strongest evidence in the project for the thing the record keeps saying: **a
document describing a failure mode does not protect itself from it.** Knowing the pattern is
not a mechanism. Only a mechanism is a mechanism — a derived value, a test, or a named owner
and a moment when the claim is re-read.

So: the checklist below is prose, and prose drifts. Before trusting any line in it, check the
thing it describes.

## Blocked / needs the owner
- [ ] **Practitioner accuracy question** — may a provider bill the member for a service denied
      because the provider failed to obtain required authorisation? Lesson 07 teaches the
      safer answer in the interim. Needs someone who does this work; neither agent can rule.
- [x] **Instructional-design review of the L2 content** — **done**, by an independent session
      that wrote the critique asking for the content. Not a subject-matter review.
- [ ] **Blind inter-rater sample** (~20 min). **Now load-bearing.** Three lessons scored
      against `pipeline/rubric.md`, without seeing the model's scores first, then the mean
      absolute difference reported. This is instructional quality, which is the owner's
      actual expertise. A rubric score is now published on `/how-it-was-built` with the
      judge's own caveat beside it — the judge did not see the generation prompt and did
      not author the lesson, but the same session directed the project. That caveat is
      what this check resolves, and §0.4 item 5 is explicit that the number cannot stand
      alone without it.
- [x] **Eight Arabic objective statements, and a behavioural statement for `MI-13`** —
      **done.** Written by the owner rather than translated. Two authoring decisions are
      recorded in `lib/objectives.ts` so they are not "corrected" later: `rejection` and
      `denial` keep their English terms beside the Arabic in `MI-09`, because they are
      distinct operational states Arabic RCM practice does not reliably separate and
      practitioners say the English; and every statement is a present-tense observable
      behaviour, never يفهم, so each stays measurable.
- [ ] **Instructional-design review** — objective alignment, coverage, the assessment
      blueprint, feedback quality, the depth model, and the Arabic. Labelled as an
      instructional-design review everywhere, never as a subject-matter or accuracy review.
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
| 2026-09-09 | **Agent-instructions files kept local** | `next dev` can write a managed block into an agent-instructions file at the repo root. It is tooling output and stays out of version control; the project's rules are in `docs/CONVENTIONS.md`. |
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
| 2026-09-10 | **Scenario bar withdrawn; `isScenario` deleted** | Supersedes the row above. The flag was hand-set on a third of the bank and reported as a scenario-led share while the longest flagged stem was under half the defined minimum. Withdrawn rather than redefined, because renaming a flag does not change what it measures. See `BUILD.md` §4.4. |
| 2026-09-09 | **Admin routes return 404, not 403** | An admin route should not confirm its own existence to someone who may not access it. |
| 2026-09-09 | **No middleware authorization** | The proxy is edge-run and the auth config imports Prisma. A cookie-presence check would look like authorization without being it. Recorded as a gap rather than faked. |
| 2026-09-09 | **Authorization reads the row, not the token** | A JWT outlives the account it describes: a deleted user's cookie returned 200 from the export endpoint. |
| 2026-09-09 | **Guest retention runs on guest creation** | A purge that only runs on a schedule is one that silently stops when the schedule breaks. |
| 2026-09-09 | **Flagship bilingual, four lessons English-only** | Fits the hours honestly. The `bilingual` flag makes the limitation visible on the page, and both gates reject a lesson that claims Arabic while repeating its English. |
| 2026-09-09 | **The judge must be a separate session** | An agent that wrote the generation prompt cannot judge the output; the score would look like evidence and be self-assessment. |
| 2026-09-09 | **Vercel on the work-email account** | Deliberate, recorded exception to Day-0 #1; that account owns the apex domain. |
| 2026-09-09 | **gitleaks binary, not the action** | The action builds an invalid revision range on a root-commit push: zero bytes scanned, job fails anyway. |
| 2026-09-22 | **Partner mark is flattened to the local ink, not shown in Techne's own colours** | A second brand palette inside a product with exactly one accent reads as a pasted banner. `brightness(0)` in light, `brightness(0) invert(1)` in dark. |
| 2026-09-22 | **`.partner-strip .eyebrow` overrides only colour and margin** | Restating the full `.eyebrow` rule matched the `[dir="rtl"] .eyebrow` specificity and, being later in the file, beat it — putting Latin letter-spacing back on the Arabic label. Caught at 375px before commit; Arabic is never tracked. |

## 8 October 2026 — the pipeline put to work, and a page that sells it

**Owner's decision, outside the v1.0 scope and recorded as such.** Masār is not being
developed further as a product this year. It is being used two ways: as the proof behind
job applications, and as the engine behind a paid content service. This entry records the
second.

- **Two more out-of-domain pipeline runs**, both DRAFT, both passing `validate.py` and the
  concept log, neither rubric-scored (the only available judge authored them, as before):
  `pipeline/out/lesson-cs-01/v1` (handling a customer complaint) and
  `pipeline/out/lesson-prv-01/v1` (what counts as personal data; deliberately names no law
  or regulator). With SEC-01 that is three domains beyond medical insurance. Each has its own
  `STATUS.md` with the gate table and the limitations.
- **`/commission`** — the one page on the site that sells something: the pipeline as a
  per-lesson content service (L1 USD 150, L2 USD 250, L3 by quote, a 20-lesson pilot at 20%
  off), the three sample drafts linked by file, and a no-commitment first step. Prices are an
  offer, not a metric, and are the owner's to change. Linked from the header and footer.
- **SCORM export does not exist** and the page says it is agreed in the first pilot rather
  than promising it. It belongs in `LATER.md` until a buyer needs it.
- **The failure log is at fourteen** as of the previous commit; `lib/failures.ts` carried the
  count to both case-study locales with no edit, which is the mechanism working as intended.

### Same day, later — the drafts became readable and the landing page got two doors

- **`/samples` and `/samples/[code]`** render the pipeline drafts with the course reader,
  read from `pipeline/out` at build time (`lib/drafts.ts`). Each page carries the word DRAFT,
  quotes the "Not run" line from its own `STATUS.md`, and links the files. `lib/items.ts`
  now bundles the drafts' formative items so their knowledge checks answer. This was parked
  in `LATER.md` behind rubric scoring; the owner wanted prospects to read a lesson rather
  than a JSON file, and the DRAFT labelling is what makes that honest.
- **Landing page:** the hero now offers two paths — try the demo course, or read the samples
  and commission lessons — because a training buyer arriving at a single guest button saw an
  unexplained demo. The header is ordered learner → buyer → reviewer; `/depth` lost its slot.
- `/commission` links each sample to its page on the site; the GitHub status file remains
  as the secondary link.
