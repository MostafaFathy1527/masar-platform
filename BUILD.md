# Masār — build brief

> Sanitized working brief for this repository. The authoritative plan (with the
> correction pass that overrides parts of this document) is kept privately outside
> the repo. Scope of record: **v1.0 = 6 weeks / ~65 hours**. Anything not in that
> scope belongs in `LATER.md`.

# 1. Project identity

**Name:** **Masār** (مسار — "track / path"). Vertical-neutral on purpose: it is a licensable platform codebase, not a single course brand. Repo `masar-platform`, demo at `masar.mostafafathy.com`.

**One-line positioning:** *A practice-first learning platform where a lesson can be published at three defined depths, assessment is built from a blueprint rather than a pile of questions, and the AI pipeline that produces the lessons ships in the same repo with its QA gate.*

**What it proves about the owner:**
- He can produce a client-grade technical specification before writing code (the exact 14-item spec a real prospect asked for).
- He can design learning, not just pages: named depth levels, formative vs summative separation, a mastery definition, job-task simulations with defensible scoring.
- He can build and deploy the platform: Next.js/Prisma/Turso/NextAuth, bilingual Arabic-first RTL, payments, certificates, analytics.
- He can industrialise content production: an LLM-driven pipeline with a concept log, a rubric gate, and a human publish step.

**What it is NOT — stated in the README, the case study and this file:**
- Not built with any client's or employer's material. The reference prospect's lessons are never opened, copied, paraphrased or stored.
- Not a live commercial product. Payments run in sandbox/test mode only; no real money moves; Vercel Hobby is non-commercial and this stays non-commercial.
- Not a claim of users, learners, revenue or outcomes. Any cohort data in analytics is seeded and visibly badged.
- Not affiliated with, or endorsed by, any certification body, payer or employer. No employer is named anywhere in the repo, commits, screenshots or copy.
- Not medical, billing or legal advice. Foundations-level, payer-agnostic, synthetic identifiers throughout.

---

# 2. Portfolio deliverables

These are the things a recruiter or client actually sees. Everything else in this plan exists to produce them.

**D1 — Live demo, `https://masar.mostafafathy.com`.** The single link. `/demo` is a one-click guest login (no signup, no email verification) that drops the visitor **mid-course on a flagship L3 lesson**, already enrolled, with progress partly filled. Guest data resets nightly via Vercel Cron; guest writes are rate-limited and scoped to a sandboxed learner record. A second published read-only admin account exposes analytics, the item bank and the blueprint matrix.

**D2 — Public GitHub monorepo `masar-platform`** (MIT for code, CC BY-NC 4.0 for course content, © Mostafa Fathy):

```
masar-platform/
├── PLAN.md  README.md  README.ar.md  LICENSE  LICENSE-CONTENT
├── docs/  00-brief.md 01-sitemap.md 02-course-architecture.md
│          03-module-lesson-structure.md 04-ux-ui.md 05-database.md
│          06-roles-permissions.md 07-student-journey.md 08-assessment-system.md
│          09-payments.md 10-certificate-workflow.md 11-admin-functionality.md
│          12-development-phases.md 13-deliverables-handover.md 14-support-model.md
│          15-content-pipeline.md  COSTS.md  DATA-OWNERSHIP.md  RUNBOOK.md
│          ROADMAP.md  ACCESSIBILITY.md  adr/0001..0010.md  shots/
├── app/ components/ lib/ prisma/ scripts/ tests/
├── content/  schema/lesson.schema.json  courses/rcm-foundations/  items/
├── content-pipeline/  CONTRACT.md  sources/  reference/  memory/  tools/  out/
└── .github/workflows/ci.yml
```

**D3 — Case study page**, AR + EN, at `mostafafathy.com/p/masar` (deployed with the existing `vercel_deploy.py` flow, token in `.env`). Outline: the problem (120 PDF lessons is not a course) → the depth model with the same lesson shown at L1 and L2 side by side → the assessment blueprint → the two simulations and why their scoring is shaped that way → the AI pipeline and its concept-log gate, including the runs that failed → architecture and cost ($0) → what is deliberately not built → a closing disclosure paragraph (self-initiated, original content, seeded demo data, no employer named, sandbox payments).

**D4 — ~~Three-minute walkthrough video~~ — CUT FROM SCOPE.** A decision, not a deferral: it is not a `LATER.md` item and should not return as an open one. Original text follows for the record. **D4 (superseded) — Three-minute walkthrough video** (OBS, free; screen only, no face; English narration, Arabic subtitles; unlisted YouTube). Script:
- 0:00–0:20 — "This is Masār. I built it to show what I'd deliver for a certification-prep client. Everything you'll see is mine: the platform, the course, the pipeline."
- 0:20–0:50 — `/demo`, one click. Land mid-course on the L3 flagship. Point at the depth switch: same lesson, L1 / L2 / L3.
- 0:50–1:30 — Do the claim-review simulation live. Flag two errors, deliberately flag one wrong field, show that the score punishes shotgun-flagging, show the feedback and the link back to the block that taught it.
- 1:30–2:00 — Lesson quiz → the review screen with per-option feedback → the objective mastery heatmap on `/results`.
- 2:00–2:30 — Admin: blueprint coverage matrix with gap cells, item analysis table (badged "seeded demo data").
- 2:30–3:00 — `/how-it-was-built`: the real lesson JSON, its rubric scorecard, the concept-log entry it wrote. "The pipeline can only write drafts. A human clicks Publish." Cut to the repo URL.

**D5 — The specification pack**, `docs/00-15`, one file per item the reference prospect asked to see before development. Published in-repo and as a page. This is the highest-leverage reusable artefact: it becomes the paid discovery deliverable for the next client.

**D6 — `/method`**, a public page showing the L1/L2/L3 model with one real lesson rendered live at all three depths, plus a gallery of all 12 block types. The page an L&D hiring manager will actually read.

**D7 — `/how-it-was-built`**, public: one real generated lesson JSON, its rubric report, its concept-log diff, and the first-pass gate rate measured on this project.

**D8 — Screenshots**, `docs/shots/` (all AR and EN where relevant): lesson player L1, lesson player L2 with a knowledge check open, the depth switch, claim-review simulation mid-flag, simulation feedback panel, denial-triage board, lesson-quiz review screen with per-option feedback, blueprint coverage matrix, item-analysis table, objective mastery heatmap, certificate, public verify page, sandbox checkout with the banner, `/how-it-was-built`.

**D9 — Ownership documents**: `COSTS.md` (every recurring cost, including the $0 lines, plus what a production-scale equivalent would cost), `DATA-OWNERSHIP.md` (schema export, DB dump, content export, domain transfer, admin handover — "how you take all of this and leave"), `SUPPORT.md`/`docs/14` (30-day support model).

**D10 — A one-page proposal PDF** distilled from `docs/00-15`, plus updated CV / LinkedIn featured / Upwork portfolio entries, each pointing at D1 and D3.

---

# 3. Scope

### MVP — must ship (weeks 1–14)
Auth (credentials) with learner + admin roles · guest demo login · course → module → lesson delivery · 12 lesson block types · L1/L2/L3 depth switch · progress tracking with resume · 8 original bilingual lessons · 2 full practice simulations · ~90-item question bank · lesson quizzes, module quizzes, one mock exam, one final assessment · objective mastery model · certificate issue + public verification + revoke · Stripe test-mode checkout + Paymob adapter (not activated) · admin: course/lesson CRUD, JSON import, item bank, blueprint matrix, learner list, analytics, audit log · AI content pipeline with concept log + rubric gate + human publish · `/method`, `/how-it-was-built`, case study, video, docs pack.

### v1.1 — should have (only after MVP is live and only if hours exist)
Third simulation (eligibility decision desk) · a second short course to prove multi-course scaling · instructor role with scoped authoring · SCORM 1.2 export for one lesson · Arabic translation of modules 2–3 (MVP ships Module 1 fully bilingual, the rest English content with a bilingual UI and an AR/EN glossary for every key term) · rubric-graded written assignments with an admin grading queue.

### Won't have now — explicit non-goals (`docs/ROADMAP.md`)
Video hosting or live sessions · discussion forums · mobile app · multi-tenant SaaS · subscriptions · AI tutor chatbot · proctoring · SSO · an instructor WYSIWYG authoring UI · email deliverability engineering beyond one free-tier provider · real money, real learners, real certifications.

**Scope contract.** If a feature does not appear in the three-minute walkthrough, it does not ship in weeks 1–14. New ideas go to `ROADMAP.md`, never to `main`. `ROADMAP.md` is itself a portfolio artefact: it reads as scoping maturity.

---

# 4. Learning design

## 4.1 The depth model (the central idea)

Depth is a property of a lesson, not a separate lesson. One `Lesson` row holds three block arrays. Adding L2 to an existing L1 lesson is an **additive diff**: no URL change, no re-enrolment, no progress reset. That is why it works as a commercial scoping instrument — "all 120 lessons at L1 in phase 1, eight flagships at L2/L3 so the difference is visible on day one, then upgrade module by module as budget allows."

| Level | Definition | Required blocks | Learner does |
|---|---|---|---|
| **L1 — Structured publishing** | The source material, professionally structured into the platform. | heading, rich_text, ≥2 definition_card, ≥1 compare_table or process_flow, job_tip, takeaways | Reads, then takes a 5-item lesson quiz |
| **L2 — Interactive lesson** | Rebuilt as a learning experience. | everything in L1 + ≥1 worked_example, ≥2 knowledge_check, ≥1 scenario or sort_buckets | Answers inside the flow, gets per-option feedback, makes decisions with consequences |
| **L3 — Applied practice** | A rehearsal of a real job task. | everything in L2 + ≥1 practice_sim with a published rubric | Produces a work output that is scored on how a professional would judge it |

Hard rule enforced by the QA gate: **no more than 180 words of prose between two acting blocks at L2+**, and a "visual card" that is secretly a bulleted list fails level fidelity.

## 4.2 Lesson block schema

Blocks are stored as validated JSON on `Lesson.blocksJson`, **not** in a block table — a relational block store plus an editor over it roughly doubles the build for zero visible benefit. Every block carries a stable `id`, so `BlockInteraction` rows still give block-level analytics and "which block taught this" remediation. The Zod schema in `lib/schema/lesson.ts` is the single source of truth; `content/schema/lesson.schema.json` is generated from it via `zod-to-json-schema` so the Python pipeline cannot drift.

```jsonc
// content/schema/lesson.schema.json (shape)
{
  "slug": "04-claim-lifecycle",
  "titleAr": "...", "titleEn": "...",
  "estMinutes": 45,
  "levels": ["L1", "L2", "L3"],
  "objectives": ["MI-05", "MI-06"],
  "conceptsIntroduced": ["clean_claim", "clearinghouse"],
  "blocks": {
    "l1": [ /* Block[] */ ], "l2": [ /* Block[] */ ], "l3": [ /* Block[] */ ]
  }
}
```

Every block: `{ id, type, objectiveId, payload }`. The 12 types:

| # | `type` | Level | `payload` shape |
|---|---|---|---|
| 1 | `heading` | L1 | `{ textAr, textEn, level: 2|3 }` |
| 2 | `rich_text` | L1 | `{ mdAr, mdEn }` (markdown, ≤180 words at L2+) |
| 3 | `definition_card` | L1 | `{ termAr, termEn, defAr, defEn, icon, exampleAr?, exampleEn? }` |
| 4 | `compare_table` | L1 | `{ captionAr, captionEn, columns[], rows[][] }` |
| 5 | `process_flow` | L1/L2 | `{ steps: [{ id, labelAr, labelEn, detailAr, detailEn }], interactive: bool }` — `interactive: true` becomes the **workflow-ordering** exercise |
| 6 | `job_tip` | L1 | `{ mdAr, mdEn }` |
| 7 | `takeaways` | L1 | `{ itemsAr[], itemsEn[] }` |
| 8 | `worked_example` | L2 | `{ promptAr, promptEn, steps: [{ showAr, showEn, whyAr, whyEn }], answerAr, answerEn }` — stepped reveal |
| 9 | `knowledge_check` | L2 | `{ itemRef }` → an `Item` marked `formative: true`. **Never scored, never in the gradebook.** |
| 10 | `scenario` | L2 | `{ situationAr, situationEn, decisions: [{ id, optionAr, optionEn, consequenceAr, consequenceEn, isBest }] }` |
| 11 | `sort_buckets` | L2 | `{ buckets: [{id,labelAr,labelEn}], cards: [{id,textAr,textEn,bucketId,whyAr,whyEn}] }` — the **mapping** pattern |
| 12 | `practice_sim` | L3 | `{ simSlug }` → mounts a `Simulation` by slug |

Both drag interactions (`sort_buckets`, interactive `process_flow`) ship with a **select-then-place keyboard fallback**. Alt text is mandatory on any block carrying an image; the gate fails without it.

## 4.3 Practice simulation patterns

Two full simulations ship in MVP. The other three patterns ship as block-level interactions or in v1.1.

**SIM-CLAIM — claim review with error spotting (MVP, flagship of Lesson 4).**
```jsonc
{ "slug": "claim-review", "kind": "CLAIM_REVIEW",
  "objectiveIds": ["MI-06","MI-07"],
  "dataset": { "claim": { "fields": [ {"key":"member_dob","label":"...","value":"1988-03-11"}, ... ],
                          "lines": [ {"code":"PRC-1042","charge":420.00,"units":1}, ... ],
                          "total": 1260.00 },
               "note": { "mdAr": "...", "mdEn": "..." },
               "card": { "policyEffective":"2026-02-01", "memberDob":"1988-03-14" } },
  "seededErrors": [
    { "id":"E1","fieldKey":"member_dob","class":"DEMOGRAPHIC_MISMATCH",
      "whyAr":"...","whyEn":"...","teachesBlockId":"b_l2_defcard_dob" },
    { "id":"E2","fieldKey":"service_date","class":"DATE_LOGIC", ... },
    { "id":"E3","fieldKey":"line_2_code","class":"UNDOCUMENTED_SERVICE", ... },
    { "id":"E4","fieldKey":"dx_primary","class":"SPECIFICITY", ... },
    { "id":"E5","fieldKey":"rendering_provider","class":"MISSING_ELEMENT", ... },
    { "id":"E6","fieldKey":"claim_total","class":"ARITHMETIC", ... } ],
  "scoring": { "mode":"PRECISION_RECALL", "passPct": 70 } }
```
**Scoring formula, published in the UI and the case study:**
`score = (hits / 6) × 0.7 + (1 − falsePositives / max(flagsMade,1)) × 0.3`
Shotgun-flagging every field scores *worse* than reading four fields carefully. Every hit and every miss returns a written explanation, and every miss links to `teachesBlockId` — the exact block that taught it.

**SIM-DENIAL — denial analysis / triage (MVP, flagship of Lesson 7).** 10 synthetic denial cases. Per case the learner sets four categorical fields: `rejectionOrDenial`, `rootCause` (eligibility | authorisation | coding | documentation | timely_filing | duplicate | non_covered | coordination_of_benefits), `action` (correct_and_resubmit | appeal | bill_patient | write_off), `originStage` (which stage of the cycle produced the failure). Weighted `rootCause 40 / action 30 / rejectionOrDenial 15 / originStage 15`, pass 75%. Two of the ten additionally ask for an **appeal justification**, scored by a **deterministic rubric checklist** the learner self-marks against four published criteria (cites the specific denial reason · cites specific evidence from the record · states the requested remedy · professional and concise), with a model answer revealed after submission. No model call at request time — that keeps the $0 rule intact and is also better formative practice.

**Patterns shipping as block interactions:** *mapping* → `sort_buckets` (remittance lines back to claim lines; covered vs excluded vs pre-auth); *workflow ordering* → `process_flow` with `interactive: true` (sequence the nine stages of the cycle, Kendall-tau partial credit). *Eligibility decision desk* → v1.1.

## 4.4 Assessment system

**Objectives are the spine.** Thirteen objectives, `MI-01`…`MI-13`, each with a Bloom level, a weight, and an owning lesson (table in §5). Every block and every item carries an `objectiveId`. That one rule makes coverage, mastery and item analysis the same query.

`MI-13` was added in Week 5 and is the one exception to *exactly one* owning lesson: it is cross-cutting, carried by callouts in two lessons and five scenario items. This paragraph said "Twelve objectives, `MI-01`…`MI-12`" for weeks after two shipped lessons and the exam blueprint began using a thirteenth — a hardcoded fact that stopped being true when the content changed underneath it.

**Item types (6):** `MCQ_SINGLE` · `MULTI_SELECT` (partial credit `max(0, correct − incorrect) / required`) · `MATCHING` (per-pair credit) · `ORDERING` (Kendall-tau partial credit) · `SCENARIO_MCQ` (60–120-word vignette then a decision) · `CASE_SET` (shared stimulus, 3–5 linked items, kept together in assembly).

**Bank target: 90 approved items** (floor 70 — and the case study says "90 items" plainly; the demo scope is not hidden). Composition, enforced mechanically by `content-pipeline/tools/bank_report.py` and by `scripts/check-blueprint.mjs` in CI:
- Bloom mix: recall ≤ 30%, apply ≥ 40%, analyze ≥ 30%.
- ~~**≥ 50% of the bank must be `SCENARIO_MCQ` or `CASE_SET`.**~~ **Withdrawn for v1.0** — see below.
- Every objective ≥ 5 items, with at least one above recall.
- Every option carries per-option feedback; **every distractor's rationale must name the misconception it represents.** No feedback = QA failure.

**The scenario bar is withdrawn for v1.0, not redefined.** It came from the 14-week plan and
was never re-derived when §0.3 cut assessment scope to two item types. v1.0 ships no
`SCENARIO_MCQ` and no `CASE_SET`; the stems are short, the longest at 28 words against a
defined minimum of 60. A "scenario-led" percentage was nevertheless reported, computed from a
hand-set `isScenario` boolean on a third of the bank — a figure that measured the flag rather
than the property the flag named.

Two repairs were rejected. Amending the definition to fit the bank would still have left a
published percentage computed from a hand-set flag: renaming the flag does not change what it
measures. Padding stems to 60 words would have been the F1 mistake again — designing the
artefact to flatter the metric. So the bar is withdrawn, `isScenario` is deleted along with
every reader of it, and no scenario percentage is published anywhere.

The questions themselves are not weak for being short. Several are decisions framed by a
situation — *a claim comes back within hours saying its format was not accepted and it never
reached the payer; where did it stop?* — which is a good question and simply not a vignette
by this document's definition. A genuine `SCENARIO_MCQ` type is in `LATER.md`.

**What the v1.0 bank verifiably is**, computed from the content files rather than restated.
Figures are over the **40 scored items**, which are the exam's pool; the 10 formative items
are in-lesson knowledge checks and are never drawn into a quiz or exam, so counting them with
scored items would inflate coverage:

- 50 items: 40 scored, 10 formative. Two types: `MCQ_SINGLE` (31 scored) and `MULTI_SELECT` (9).
- Every one of 196 options carries feedback in both languages. No exceptions.
- Bloom, scored items: recall 20% · apply 40% · analyze 40%, against recall ≤ 30%, apply ≥ 40%,
  analyze ≥ 30%.
- Every objective has exactly five scored items. An earlier count reported two objectives at
  six; both sixes were knowledge checks, counted as if they were scored coverage.

**The ladder:**

| Instrument | Items | Assembly | Time | Pass | Attempts | Feedback |
|---|---|---|---|---|---|---|
| Knowledge check (in-lesson) | 2–4 | fixed | — | — | unlimited | immediate, per option, **never scored** |
| Lesson quiz ×8 | 5 | sampled from a 10-item pool, prefers unseen | — | 70% | unlimited | on submit, per option |
| Module quiz ×3 | 12 | blueprint-sampled | 20 min | 70% | 3, 12h cooldown after the 2nd | on submit, per option |
| Mock exam | 40 | blueprint-weighted, mirrors the final exactly | 60 min | 70% advisory | 3, no repeats within a 2-attempt window | full review + per-objective bar chart |
| Final assessment | 40 | blueprint-sampled from LIVE items, seeded per attempt | 60 min | **75%** | 2, 24h cooldown, <30% item overlap between attempts | score + per-objective breakdown; rationales after pass or after the last attempt |

**Integrity, non-negotiable and each one a committed test:** attempts are materialised server-side (`Attempt.itemIdsJson` + `seed`); the client payload for an in-progress attempt is **stripped of `isCorrect` and every rationale** — verified by a test *and* screenshotted for the case study; the timer is server-authoritative (`startedAt` + `timeLimitSec`), the client clock is decorative; an expired attempt auto-submits what was saved; every answer autosaves via `POST /api/attempts/[id]/answer`; assembly **fails loudly** if a pool is too thin rather than silently serving fewer items.

**Mastery (`lib/mastery.ts`, unit-tested).** An objective is **mastered** when `itemsSeen ≥ 4` **and** `masteryPct ≥ 80%` **and** `sittings ≥ 2` (two separate sessions, so it means retention rather than one lucky run). First attempts weight 1.0, later attempts 0.5. **No decay job** — cut as scope. `masteryPct` uses first attempts only, which is also the only honest difficulty signal.

**Certificate rules (5 gates, printed on the course page before purchase):**
1. All 8 lessons complete at L1 (every block viewed, every knowledge check attempted).
2. Both L3 flagship simulations passed at their stated rule.
3. All 8 lesson quizzes ≥ 70% and all 3 module quizzes ≥ 70%.
4. Final assessment ≥ 75%.
5. ≥ 8 of 12 objectives at mastered status.

`certificateEligible(enrollmentId)` is one pure, unit-tested function called by both the UI and the issue endpoint. **`DEMO_MODE=true` on the guest account bypasses gates 1–5 behind a visible "demo shortcut" badge**, so a visitor with three minutes can watch a certificate issue and verify it. Without that bypass the most persuasive artefact in the product is unreachable.

## 4.5 Analytics that measure learning

Every chart carries a caption naming the learning question it answers. No vanity metrics, no streaks, no leaderboards — stated on `/method` as a design position.

- **Objective mastery heatmap** (learner × objective) — where is the cohort weak?
- **Item analysis** — p-value (first attempts only), point-biserial discrimination, distractor distribution. Auto-flags: `p < 0.20` (broken or mis-keyed), `p > 0.95` (giveaway), `discrimination < 0.15` (not discriminating), any distractor chosen by < 3% (dead option). Flagged items go `LIVE → DRAFT` for rewrite.
- **Block-level drop-off** — from `BlockInteraction`; where do learners stop reading?
- **Knowledge-check → quiz transfer** — did the formative check predict the summative item on the same objective?
- **Simulation error-class frequency** — which error class do learners miss most, and which block was supposed to teach it?

**Honesty rule, in the UI and in writing:** item statistics need roughly 20 first attempts per item before they mean anything. This demo has a seeded cohort. Every screen fed by seeded data carries a **"demo data"** badge, and the case study repeats the caveat. The capability is what is being demonstrated, not psychometric significance.

---

# 5. Demo course spec

**Course: "Medical Insurance & Revenue Cycle Foundations"** (`rcm-foundations`) — 3 modules, 8 lessons, ~4.5 hours, 12 objectives, ~90 items, 2 simulations. Priced 1,499 EGP / $49 in **test mode only**.

**Sourcing and IP note (goes in the README, the course page and every lesson footer).** All content is original, authored by Mostafa from public, payer-agnostic knowledge of how insurance transactions, claims and revenue cycles work. **No lesson, question, scenario or document from any client or employer is used, referenced or paraphrased.** Real CPT/HCPCS descriptors are AMA-licensed and real payer policies are proprietary, so the course teaches *how code sets and claim forms function* using clearly-labelled synthetic identifiers: procedure codes in a `PRC-1000` family, diagnosis codes in a `DX-A100` family, a generic `CLAIM-FORM-A` modelled on the public structure of a standard claim, and fictional payers *Nile Health Assurance* and *Gulf Care Insurance*. Every patient, provider, amount and denial letter is invented and labelled **sample**. Lesson 6 teaches this licensing decision explicitly — handling licensing risk is itself a professional skill. Visible disclaimer on every lesson: *educational demonstration content · payer-agnostic · not affiliated with or endorsed by any certification body or payer · not medical, billing or legal advice.* Before launch, one person who actually works in medical insurance reads all eight lessons for plausibility (a favour, credited only with permission, never presented as an endorsement). **If no such reader can be found, the course is cut to the four lessons he can defend line by line and the case study says so.**

**Objectives:**

| Code | Objective | Bloom | Lesson |
|---|---|---|---|
| MI-01 | Identify the parties in an insurance transaction and the money flow between them | recall | L1 |
| MI-02 | Distinguish copay / deductible / coinsurance / OOP max and compute member liability | apply | L2 |
| MI-03 | Read a benefit schedule to decide covered / excluded / limited / pre-auth | analyze | L2 |
| MI-04 | Perform an eligibility check and decide proceed / pre-auth / self-pay | analyze | L3 |
| MI-05 | Sequence the claim lifecycle and name the artefact produced at each stage | recall | L4 |
| MI-06 | Complete a claim's required data elements and identify missing or contradictory fields | apply | L4 |
| MI-07 | Judge whether documentation supports the services billed | analyze | L5 |
| MI-08 | Explain what diagnosis / procedure code families do and map an encounter to the right one | apply | L6 |
| MI-09 | Distinguish a rejection from a denial and classify a denial by root cause | analyze | L7 |
| MI-10 | Choose the correct corrective action for a denial | analyze | L7 |
| MI-11 | Trace the revenue cycle end to end and locate where a failure originated | analyze | L8 |
| MI-12 | Interpret clean-claim rate, denial rate, days in A/R, net collection rate and diagnose a trend | analyze | L8 |
| MI-13 | Recognise indicators of fraud, waste and abuse in claims and documentation, and state the record-based response | analyze | L4, L5 (cross-cutting) |

`MI-13` now has a behavioural statement in both languages, written rather than translated.
It previously carried only a topic — "fraud, waste and abuse" — which names a subject rather
than something a learner can be observed doing, and therefore gave a rubric nothing to mark.
`lib/objectives.ts` carries the same English, so the brief and the code agree.

**Lessons:**

| # | Title | Levels | One-line objective | Practice |
|---|---|---|---|---|
| 1 | The insurance transaction: who pays whom | L1, L2 | Draw the money flow between member, provider, payer and TPA | 4 knowledge checks; `compare_table` cash vs insured |
| 2 | Plans, benefits and member liability | L1, L2 | Compute what the member owes and say why | worked_example (a 4,800 EGP encounter, stepped); `sort_buckets` covered/excluded/limited/pre-auth |
| 3 | Eligibility and pre-authorisation | L1, L2 | Decide whether to proceed, pre-authorise or convert to self-pay | `scenario` with three decision points and consequences |
| 4 | **⭐ FLAGSHIP L3 — Anatomy of a claim, end to end** | L1, L2, L3 | Complete a claim and find what would make it fail | `process_flow` interactive (order the 9 stages) + **SIM-CLAIM** |
| 5 | Documentation that supports the claim | L1, L2 | Judge whether a note defends what was billed | 3 note pairs, supports vs does not, with knowledge checks |
| 6 | What code families do (and why we use synthetic codes) | L1, L2 | Map a documented encounter to the right code family | `sort_buckets` mapping exercise; the licensing teaching moment |
| 7 | **⭐ FLAGSHIP L3 — Denials: cause, category, cure** | L1, L2, L3 | Classify a denial and choose the corrective action | **SIM-DENIAL** (10 cases + 2 appeal justifications) |
| 8 | The revenue cycle and its KPIs | L1, L2 | Read four KPI trends and say which stage broke | calculation exercise over a synthetic A/R table |

**Lesson 4 is also the free public preview** at `/preview/anatomy-of-a-claim` — no signup — and is the **hand-authored locked golden reference** the pipeline imitates. It ships at the end of week 2.

**Bank targets:** 90 items · lesson-quiz pools 10 per lesson (80) is too many for 90, so: **each lesson quiz draws 5 from a shared objective-tagged pool**, no dedicated per-lesson pools. Distribution: MI-01..MI-12 ≥ 5 items each (60 floor), remaining ~30 authored into blueprint gaps weighted toward apply/analyze. Bilingual: Module 1 fully AR + EN; Modules 2–3 English content with bilingual UI and an AR/EN glossary entry for every key term (stated as scope, not hidden).

---

# 6. Full product specification

*(Each subsection here is the summary; `docs/00-15` is the expanded version, written incrementally as each phase lands — not all in week 1.)*

## 6.1 Sitemap

```
PUBLIC
/                                  landing (AR default, /en mirror)
/courses  /courses/[slug]          catalogue, course page (outcomes, syllabus, blueprint summary, price)
/preview/[lessonSlug]              free flagship lesson, no signup
/method                            the L1/L2/L3 depth model + block gallery
/how-it-was-built                  pipeline artefact: real lesson JSON + rubric report + concept-log diff
/demo                              ONE-CLICK GUEST LOGIN → mid-course on the L3 flagship
/verify/[serial]                   public certificate verification
/login  /register  /forgot-password
/legal/terms  /legal/privacy  /legal/refund

LEARNER
/dashboard                                    next action, enrolled courses, mastery ring
/learn/[course]                               course map, module lock state
/learn/[course]/[module]/[lesson]             lesson player (depth switch L1/L2/L3)
/learn/[course]/practice/[simSlug]            full-screen simulation
/learn/[course]/quiz/[assessmentId]           lesson + module quizzes
/learn/[course]/exam/[attemptId]              mock / final player
/learn/[course]/attempts/[attemptId]/review   review screen with rationales
/learn/[course]/results                       objective mastery heatmap + "revise these"
/account  /account/certificates  /account/orders

ADMIN
/admin                       KPI strip
/admin/courses  /admin/courses/[id]/structure
/admin/lessons/[id]          JSON editor + live preview + Validate button + version history
/admin/questions             item bank (filter by objective, type, Bloom, p-value, status)
/admin/blueprint             coverage matrix, gap cells in red
/admin/assessments/[id]      assembly rules
/admin/simulations/[id]      seeded-error and rubric editor
/admin/learners  /admin/learners/[id]
/admin/analytics             item analysis, mastery, drop-off, transfer
/admin/orders  /admin/certificates  /admin/imports  /admin/audit

API
/api/auth/[...nextauth]           /api/demo/login        /api/progress/block
/api/attempts (POST)              /api/attempts/[id]/answer     /api/attempts/[id]/submit
/api/sim/[slug]/submit            /api/certificates/issue       /api/certificates/verify/[serial]
/api/checkout/[provider]          /api/webhooks/[provider]
/api/admin/lessons/import         /api/admin/items/import       /api/cron/nightly
```

## 6.2 Course architecture and module/lesson structure

`Course → Module → Lesson`, with `Objective` cross-cutting. Module unlock: Module N+1 opens when Module N's quiz is passed (soft gate; the guest demo account has all modules open). A lesson declares `levels[]`; the player offers only the levels that exist. Lesson completion at L1 = all L1 blocks viewed + all knowledge checks attempted; at L3 = the simulation submitted.

## 6.3 UX/UI approach

Arabic-first (`ar` default, `en` mirror) via `next-intl`, `dir` on `<html>`, **logical CSS properties only** (`margin-inline-start`) so one stylesheet serves both — never a mirrored second stylesheet. Fonts: Cairo (headings) + IBM Plex Sans Arabic (body), both SIL OFL, self-hosted (no Google Fonts request). Tailwind + shadcn/ui with a small token layer (`--brand`, `--surface`, `--edu-formative`, `--edu-summative`). Dark mode via `next-themes`.

Lesson player: single scrolling column, max 68ch, sticky rail with block-level progress dots and the depth switch (`مبسّط L1 / تفاعلي L2 / تطبيقي L3`); single column with a bottom sheet on mobile. **Mobile-first** — the audience is phone-heavy. Formative and summative are visually distinct chips, and the distinction is explained on `/method`. Every interactive block resolves with *why*, never a bare tick.

Accessibility target **WCAG 2.1 AA**: keyboard-operable everything including both simulations (select-then-place fallback for drags), visible focus, 4.5:1 contrast, `aria-live` on answer feedback, no meaning by colour alone (denial severity = icon + label + colour), `prefers-reduced-motion` honoured, mandatory alt text. `axe-core` runs in CI; a critical violation fails the build. Performance budget: lesson route ≤ 180KB JS gzipped, Lighthouse ≥ 90 performance and accessibility on `/preview/[slug]`, `/learn/...`, `/admin/analytics`.

## 6.4 Database architecture

Prisma + SQLite (dev) / Turso libSQL (prod). 22 application models + 3 Auth.js. `cuid()` ids, `createdAt`/`updatedAt` everywhere, enums for every state machine, soft deactivation over deletion.

| Table | Key columns |
|---|---|
| `User` | email @unique, passwordHash, name, locale, `role` (LEARNER \| ADMIN), isDemo, emailVerifiedAt, isActive |
| `Account` `Session` `VerificationToken` | Auth.js |
| `AuditLog` | actorId, action, entity, entityId, diffJson, ip, createdAt (append-only) |
| `Course` | slug @unique, titleAr/En, summaryAr/En, priceEgp, priceUsd, status, version |
| `Objective` | courseId, code (`MI-01`), statementAr/En, bloom, weight |
| `Module` | courseId, order, titleAr/En, unlockRule |
| `Lesson` | moduleId, order, slug, titleAr/En, estMinutes, levels[], **blocksJson**, status (DRAFT\|QA\|PUBLISHED), isPreview, sourceHash, pipelineRunId, qaScore |
| `ConceptLogEntry` | courseId, conceptKey @unique(courseId), firstTaughtLessonId, definitionSnippet, allowedReuse (DEFINE\|RECALL\|APPLY) |
| `GlossaryTerm` | courseId, termAr/En, definitionAr/En, firstLessonId |
| `Item` | courseId, objectiveId, type, stemAr/En, difficulty, bloom, formative, rationaleAr/En, status (DRAFT\|LIVE\|RETIRED), authoredBy (HUMAN\|PIPELINE), reviewedAt — no `isScenario`; see §4.4 |
| `ItemOption` | itemId, order, textAr/En, isCorrect, **feedbackAr/En (required)** |
| `ItemStat` | itemId @unique, exposures, pValue, pointBiserial, meanTimeSec, distractorDistJson, lastComputedAt |
| `Assessment` | courseId, scope (LESSON\|MODULE\|MOCK\|FINAL), scopeId, itemCount, timeLimitSec, passPct, maxAttempts, cooldownSec, assemblyJson |
| `Attempt` | userId, assessmentId, startedAt, submittedAt, **itemIdsJson**, seed, scorePct, passed, attemptNo, state |
| `AttemptAnswer` | attemptId, itemId, responseJson, isCorrect, timeSec, answeredAt |
| `ObjectiveMastery` | userId, objectiveId, itemsSeen, itemsCorrect, sittings, masteryPct, masteredAt |
| `Simulation` | courseId, slug @unique, kind, objectiveIds[], datasetJson, seededErrorsJson, rubricJson, passRule |
| `SimSubmission` | simulationId, userId, responseJson, scoreJson, scorePct, passed, submittedAt |
| `Enrollment` | userId, courseId, source (PURCHASE\|MANUAL\|GUEST_DEMO), startedAt, completedAt, progressPct |
| `LessonProgress` | enrollmentId, lessonId, level, blocksDone, blocksTotal, state, timeSpentSec, completedAt |
| `BlockInteraction` | enrollmentId, lessonId, blockId, event (VIEW\|ANSWER\|RETRY\|REVEAL\|SKIP), payloadJson, at |
| `Order` | userId, courseId, provider (STRIPE\|PAYMOB\|MANUAL), providerRef @unique, amountMinor, currency, status, **isSandbox (default true)**, rawJson |
| `Certificate` | serial @unique, userId, courseId, issuedAt, finalScorePct, masteredObjectives[], payloadHash, revokedAt, revokeReason, isDemo |

## 6.5 Roles and permissions

Two real roles plus a machine identity. Cut from five — `instructor` and `reviewer` are schema seams (`Course.ownerId` exists), not built screens.

| Role | Can |
|---|---|
| `LEARNER` | own enrolments, attempts, submissions, certificate |
| `ADMIN` | everything, including orders, revocation and audit |
| `SERVICE` (bearer token, not a user) | **write DRAFT lessons and DRAFT items only. No publish permission, by design.** |

Enforced in `lib/permissions.ts` (`can(user, action, resource)`), checked in `middleware.ts` for route groups **and re-checked in every server action and route handler**. Never UI-only. One unit test per role per action.

## 6.6 Student journey

Discover `/courses/rcm-foundations` → free preview of Lesson 4 (no signup) → register → **or** `/demo` one click → purchase (Stripe test) or manual grant → dashboard → **Learn** (lesson blocks, `BlockInteraction` rows accumulate) → **Practice** (knowledge checks, per-option feedback, ungraded) → **Quiz** (5-item lesson quiz, 70%) → **Apply** (L3 simulation, rubric-scored, misses link back to the teaching block) → **Assess** (module quiz → mock exam → final ≥ 75%) → **Certificate** (5 gates → PDF + public verify URL) → `/results` keeps the objective heatmap and a permanent "revise these" list.

## 6.7 Certificate workflow

On any gate-crossing event, `certificateEligible(enrollmentId)` runs. On pass, `POST /api/certificates/issue` creates a `Certificate` with serial `MF-RCM-{YYYY}-{seq:04d}`, `payloadHash = sha256(serial|name|courseSlug|issuedAt|finalScorePct)`, and — the unusual part — **the list of objectives mastered is printed on the certificate**, because a credential that says what you can do beats one that says you attended.

**PDF: rendered from the DOM client-side with `html2canvas` + `jsPDF`.** This is deliberate (`ADR-0004`): the browser performs Arabic shaping and bidi correctly, while `pdf-lib` does neither on its own and would ship disconnected, reversed Arabic on the single artefact a Gulf reviewer will screenshot. Server-side Arabic shaping is a multi-day trap; it is documented in the ADR as the path for a future Cloud Run deployment.

`/verify/[serial]` is public, unauthenticated, shows holder, course, issue date, final score band, mastered objectives and status. The **verify URL is the source of truth, never the PDF.** Admin revoke sets `revokedAt` + reason and the public page flips immediately, audit-logged. Every certificate face carries: *Issued by a self-initiated demonstration platform.*

## 6.8 Admin functionality

Course/module/lesson CRUD with drag ordering · lesson JSON editor with live preview and a **Validate** button running the Zod schema (no relational block editor — deliberate) · lesson version history from `pipelineRunId` + `qaScore` · item bank with filters, bulk status transitions and XLSX import/export · blueprint coverage matrix with red gap cells · assessment assembly rules · simulation seeded-error and rubric editor · learner list with per-learner mastery and attempt timeline · orders and manual enrolment grants · certificate issue/revoke · import-run history with QA scores and dry-run diffs · audit log · analytics (§4.5).

## 6.9 Payment workflow

```ts
// lib/payments/provider.ts
export interface PaymentProvider {
  createCheckout(order: Order, locale: Locale): Promise<{ redirectUrl: string; providerRef: string }>
  verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookEvent>
}
```
`StripeProvider` — **test mode, fully working**, the demoable path. `PaymobProvider` — implemented against published docs, **shipped disabled**, with an honest note in `docs/09-payments.md`: *Paymob live access requires an Egyptian commercial registration, tax card and merchant KYC that this self-initiated project does not have. The adapter is written against the documented API and is not claimed to be tested against a live sandbox. Going live is three environment variables and a merchant account.* Fawry: a paragraph, not code.

Flow: `POST /api/checkout/stripe` → server-computed price (never trust the client) → `Order(status=PENDING, isSandbox=true)` → redirect → `POST /api/webhooks/stripe` with signature verification, **idempotent on `providerRef`** → `Order.PAID` + `Enrollment` created. A committed test replays the same webhook twice and asserts exactly one enrolment. Test card printed on the checkout page; a permanent banner reads **"Sandbox mode — this is a demonstration. No payment is processed and no money moves."** `isSandbox` is a real database column, not a UI string.

## 6.10 Development phases and support model

Phases in §9. Final deliverables = D1–D10 in §2. Support model (`docs/14`, written as the policy he would offer a client — writing it down *is* the portfolio value): 30 days of defect correction after handover; P1 (platform down, payments or grading wrong) ≤ 24h, P2 (feature broken, workaround exists) ≤ 72h, P3 (cosmetic) next release; a written definition of defect vs change request; one recorded handover walkthrough; a 14-day post-handover question window; a public maintenance log kept for 30 days after launch as proof the process is real, not claimed.

---

# 7. Tech stack and architecture

**Decided, not optioned. Every choice is verified against `(local path)` — a stack he already ships and debugs. Zero new technology on the critical path.**

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js **14.2.35** App Router + TypeScript 5 | Exactly what he runs today. Server Components keep lesson rendering cheap; route handlers remove the need for a second service. |
| UI | Tailwind 3.4 + shadcn/ui + lucide + sonner + next-themes | Same deps; copy-paste velocity, credible product look, $0 design budget. |
| i18n / RTL | `next-intl`, logical CSS properties, self-hosted OFL fonts | Arabic RTL is the edge; logical properties beat mirrored stylesheets. |
| DB | Prisma **7.7** + `@prisma/adapter-libsql` + `@libsql/client`; SQLite dev → Turso prod | Identical adapter both sides, no dialect drift, generous free tier, and the `ensure-db` / `reset-db` script pattern ports over. |
| Auth | NextAuth v5 (credentials + bcryptjs, JWT) | Already implemented once. Credentials keeps the demo self-contained — no OAuth consent screen between a reviewer and the product. |
| Validation | Zod 4, one `LessonDoc` schema exported to JSON Schema for the Python pipeline | The contract between pipeline and platform; cannot drift. |
| Charts | Recharts 3 | Already a dependency. |
| Certificates | DOM render + `html2canvas` + `jsPDF` (client-side) | Browser does Arabic shaping and bidi. See ADR-0004. |
| Payments | Stripe test mode + Paymob adapter behind `PaymentProvider` | §6.9. |
| Email | Resend free tier (3k/mo) | Verification + certificate delivery. Gmail SMTP documented as fallback. |
| Storage | Repo-committed lesson media under `public/content/`; certificates rendered client-side, so no blob store needed in MVP | Content stays ownable and diff-able; one fewer vendor. |
| Errors | Sentry free tier | 5k events/mo. |
| Testing | Vitest (scoring, assembly, mastery, eligibility, permissions) + Playwright (3 journeys) + axe-core in CI | Test the rules that would silently corrupt a grade. No coverage targets. |
| CI | GitHub Actions on `ubuntu-latest`: typecheck, lint, vitest, `prisma validate`, `scripts/check-blueprint.mjs`, `content-pipeline/tools/qa_gate.py`, axe, **gitleaks** | Free on public repos. |
| Hosting | Vercel Hobby, `masar.mostafafathy.com` | Owned domain, $0 incremental. **Hobby forbids commercial use** — this stays test-mode; `Dockerfile` + `deploy.sh` for Google Cloud Run stay in-repo as the documented migration path (`docs/RUNBOOK.md`). |
| Pipeline | Python 3.12 (stdlib + `jsonschema` + `pyyaml`) driven by an AI coding agent on an existing subscription | **No metered API key anywhere in the request path.** |

**Environments.** `local` (SQLite file, `npm run dev` → `scripts/ensure-db.js` + `scripts/start-dev.js`), `preview` (Vercel PR deploys against a scratch Turso DB), `production` (Turso). Secrets live only in `.env.local` and Vercel env vars; `.env.example` is committed, `.env*` is git-ignored, `gitleaks` runs in CI. `.gitattributes` sets `* text=auto eol=lf` and CI runs on Linux to catch Windows-only path assumptions early.

**Cost table (`COSTS.md`, reproduced in the case study):**

| Item | Plan | Now | Limit that could bite | If it bites |
|---|---|---|---|---|
| Vercel | Hobby | $0 | non-commercial; 100GB bandwidth; **2 cron jobs, daily** | one nightly cron only; Cloud Run migration documented |
| Turso | Free | $0 | 9GB, 1B row reads/mo | nowhere near it |
| Resend | Free | $0 | 3,000/mo, 100/day | sufficient |
| Sentry | Developer | $0 | 5k events/mo | — |
| GitHub | Public | $0 | unlimited Actions on public repos | — |
| Domain | owned | ~$12/yr existing | subdomain free | — |
| Stripe | Test mode | $0 | no real money | live = 2.9% + $0.30 |
| Paymob | Not activated | $0 | needs commercial registration + KYC | documented, not claimed |
| AI coding agent | Existing subscription | $0 incremental | rate limits on long runs | batch pipeline runs overnight |
| **Total new spend** | | **$0.00/month** | | |

**Security and privacy.** bcrypt password hashing · rate limiting on `/api/auth/*`, `/api/attempts/*`, `/api/demo/login` and all guest writes · CSRF on server actions · server-side scoring only, answer keys never leave the server during an attempt · signature-verified, idempotent webhooks · security headers + CSP · Dependabot + `npm audit` in CI · no third-party analytics on learner pages, ever — learning data is first-party rows in the project's own database, which is the ownership point.

**Backups and export (`DATA-OWNERSHIP.md`).** Nightly `turso db shell masar .dump` to a private backup repo (`scripts/backup.js`); `scripts/export-content.js` writes every lesson and item to `content/` as JSON; `npx prisma migrate deploy` rebuilds the schema anywhere; the whole database is one portable SQLite file. The document walks through: source code, database dump, content export, user-data export, domain transfer, admin handover, and the recurring-cost table — i.e. *how you take all of this and leave.*

---

# 8. AI-assisted content pipeline

Lives in the same monorepo under `content-pipeline/`, a direct descendant of earlier spec-driven generation projects (a written contract as spec + a locked reference + a `memory/` folder + Python verification gates). What is new: the output is **validated JSON that loads into a database**, not HTML files — which is what makes it reusable across clients.

```
content-pipeline/
├── CONTRACT.md                  the generation contract: block schema, level rules,
│                                tone, forbidden claims, known failure modes
├── reference/lesson-04/         THE LOCKED GOLDEN LESSON (hand-authored, L1+L2+L3)
├── sources/                     Mostafa's own .md source notes — the ONLY permitted input
├── objectives.yml  blueprint.yml
├── memory/  concept-log.json  style-decisions.md  run-log.jsonl
├── schema/  lesson.schema.json  item.schema.json   (generated from Zod)
├── rubric.md
├── tools/  gen_lesson.py  validate.py  concept_log.py  qa_gate.py
│           bank_report.py  parity_check.py  import_lesson.py  run.py
└── out/lesson-04/v1  v2 ...    NEVER edited in place
```

**One command per lesson:**
```bash
python content-pipeline/tools/run.py --lesson 05 --levels L1,L2
```

**The stages.**
1. **Context.** Reads `objectives.yml` (this lesson's objectives only), `memory/concept-log.json` (every concept already taught in lessons 1..N−1 with its allowed reuse level), `reference/lesson-04/` (the locked shape), `memory/style-decisions.md` (accumulated corrections).
2. **Generate.** The generating agent emits `out/lesson-NN/vX/lesson.json` (blocks at the requested levels) + `items.json` + `conceptsIntroduced[]`.
3. **`validate.py` — hard fail:** JSON Schema valid · every block and item carries a real `objectiveId` · block types allowed at that level · every image block has non-empty alt text · every `ItemOption` has feedback · exactly one correct option for MCQ_SINGLE · no duplicate block ids · L2 depth completeness (≥1 worked_example, ≥2 knowledge_check, ≥1 scenario or sort_buckets) · L3 completeness (≥1 practice_sim with a rubric) · ≤180 words of prose between acting blocks.
4. **`concept_log.py` — hard fail:** a concept already `firstTaught` in an earlier lesson may not be **re-defined** here — only recalled or applied; and a concept **used before it is introduced anywhere** is a forward-reference error. New concepts are appended with their lesson id. This is the single most defensible piece in the project: a checkable content invariant a human editor cannot enforce across 120 lessons.
5. **`qa_gate.py` — the rubric gate.** A second, **adversarial** model pass that never sees the generation prompt, scoring 8 criteria 1–5: objective alignment · level fidelity (a "visual card" that is a bulleted list fails) · worked-example quality · knowledge-check quality (plausible distractors from real misconceptions, per-option feedback that explains why, no "all of the above") · scenario authenticity · AR/EN parity and natural Arabic · concision and reading level · accessibility & IP (alt text, no colour-only meaning, **no real licensed code descriptors, no payer text, and a forbidden-term denylist covering employer and client names**). **Gate: fail if any criterion < 3 or the mean < 4.0.** On failure it writes `qa-report.md`, retries once with the report appended, then stops for a human decision.
6. **`bank_report.py`** recomputes blueprint coverage and prints the gap list. Gaps are what Mostafa authors by hand.
7. **`import_lesson.py`** POSTs to `/api/admin/lessons/import` with the SERVICE token, `--dry-run` first (block-level diff), writing rows as **`status = DRAFT`**. `--rollback <runId>` reverses an import. **The pipeline has no publish permission. A human clicks Publish in `/admin/lessons/[id]`.** That sentence ends the "AI slop" objection.

**Invariants (in `CONTRACT.md`, learned from the existing projects):** never edit a generated output in place — copy to `vN+1`; if Mostafa hand-edits an output, **his version becomes the new baseline** and regeneration diffs onto it; `sourceHash` (SHA-256 of the source note) is stored on the Lesson so a changed source flags it stale in admin; the pipeline may never invent a fact about insurance practice that is not in the source note — new claims go to `needs-verification.md` for him to confirm or cut; the only permitted input path is `content-pipeline/sources/`, and `import_lesson.py` refuses anything outside it.

**Two committed negative tests** (cheapest credibility in the whole project, run in CI):
- `tests/pipeline/redefines-concept.test` — a lesson that deliberately re-defines `coinsurance` must fail the gate.
- `tests/pipeline/forbidden-term.test` — a lesson with a planted employer/client term must fail the denylist scan.
Plus a repo-wide CI grep for the same denylist, so the never-name-the-employer rule is mechanical rather than remembered at 1am.

**What gets logged for the case study.** `memory/run-log.jsonl` records every run: lesson, level, input hash, per-criterion scores, verdict, wall-clock minutes, and the human edit-minutes afterwards. Published on `/how-it-was-built` **including the failed runs**: first-pass gate rate, mean rubric score, median human edit-minutes per lesson per level. These are measured on this project. **The employer's cycle-time figure is not reused here** — that number belongs to his day job and is quoted, if at all, only as day-job context and clearly separated.

---

# 9. Delivery plan

**Assumption: 12 hours/week** (weeknight evenings + weekends), job hunting is priority #1 and will interrupt. **14 planned weeks + 2 elastic = 16 elapsed, stated openly.** Every week ends with something deployed. `main` is never left broken across a week. Anything shippable ships Friday night.

**Week 0 (no code, do it now, on a phone if necessary):** rotate the Vercel token in `(local path)` (a live plaintext `vcp_…` token, project id and team slug sit at the top of that file), move it to `.env`, confirm the old one is revoked. Then start drafting `content-pipeline/sources/*.md` — the eight source notes are the real long pole and they need no repo.

| Week | Ships | Definition of done |
|---|---|---|
| **1** | Monorepo public, MIT + CC BY-NC, `PLAN.md`, `README.ar.md`. Next.js 14 + TS + Tailwind + shadcn scaffold. Full Prisma schema + first migration. `ensure-db`/`reset-db`/`seed` scripts. CI green (typecheck, vitest, prisma validate, gitleaks). Vercel project + DNS + SSL. `docs/00-brief`, `01-sitemap`, `05-database` (Mermaid ERD), `06-roles`, `07-journey`. ADR-0001..0005. | `masar.mostafafathy.com` serves a bilingual placeholder over HTTPS. `npx prisma migrate deploy` runs clean against Turso. A clean clone reaches a running local instance from the README in under 5 minutes on Windows. No employer name anywhere. |
| **2** | **★ FIRST DEMOABLE CHECKPOINT.** Lesson block renderer for the 12 types (L1 + L2 sets). `LessonDoc` Zod schema + JSON Schema export. Lesson 4 hand-authored bilingually at L1+L2 and published at `/preview/anatomy-of-a-claim`, **no signup**. RTL/LTR correct at layout level. Depth switch L1↔L2. | A stranger with the link reads the full flagship lesson on a phone, in Arabic and English, answers the knowledge checks and sees per-option feedback. Lighthouse ≥ 90 perf + a11y. Screenshots committed. Link is postable to LinkedIn as-is. |
| **3** | Auth (register, verify, reset), roles, `lib/permissions.ts` + tests, enrolment, `BlockInteraction` → `LessonProgress` → `Enrollment.progressPct`, dashboard, resume. `/demo` one-click guest login (bypasses verification), nightly reset cron, guest rate limiting. | A guest reaches the lesson in one click and lands mid-course. Progress survives logout, reload and a different browser. A LEARNER hitting `/admin` is refused by middleware **and** by the server action. |
| **4** | Admin shell: course/module/lesson CRUD, drag ordering, JSON editor + Validate + live preview, `/api/admin/lessons/import` with SERVICE token, audit log. `docs/02`, `03`, `04`, `11`. **Case-study draft started.** | An admin creates a module, reorders lessons and imports a lesson JSON without touching the database. Every admin write appears in `/admin/audit`. |
| **5–6** | `content-pipeline/` complete (all tools, the contract, locked reference, concept log, rubric). All 8 lessons generated at L1 from the source notes, QA-gated, imported, published. `run-log.jsonl` populated. Both negative tests committed and green. `docs/15`. | `python tools/run.py --lesson 07 --levels L1` goes source → generate → validate → concept log → gate → DRAFT with no manual step. The gate has demonstrably rejected at least one real generation and the report is kept in the repo. All 8 lessons readable end to end. Concept log shows zero re-definitions. |
| **7–8** | Assessment engine: 6 item types, partial credit, blueprint assembly with recency exclusion and loud thin-pool failure, server timers, autosave/resume, review screen with rationales. Item bank admin, blueprint matrix. **90 items** (pipeline-drafted, human-reviewed, gaps hand-authored). `scripts/check-blueprint.mjs` in CI. `docs/08`. | A learner fails and retakes a lesson quiz and provably gets a different item set. A killed browser mid-exam resumes with the correct remaining clock. **The network payload for an in-progress attempt contains no correct keys — verified, tested and screenshotted.** Blueprint shows zero uncovered objectives; bank mix passes. |
| **9** | All 8 lessons upgraded to L2 through the pipeline. Knowledge checks live. `/method` public with the block gallery and the same lesson at L1 vs L2. | `/method` renders every block type live and makes the L1↔L2 difference obvious to a stranger in under 60 seconds. |
| **10** | **SIM-CLAIM** — claim-review workbench, 6 seeded errors, precision-aware scoring, per-error feedback, misses linked to `teachesBlockId`. Lesson 4 at L3. | A guest completes it with keyboard only; a shotgun-flagger scores lower than a careful reader; every miss returns a written explanation and a link back to the teaching block. |
| **11** | **SIM-DENIAL** — 10 cases, 4 categorical fields, 2 rubric self-assessed appeal justifications. Lesson 7 at L3. `ObjectiveMastery` + `/learn/[course]/results` heatmap. | Both flagship L3 lessons complete. Mastery unit tests green, including the two-sittings rule. |
| **12** | Certificates (5 gates, `DEMO_MODE` bypass, serial, hash, client-side bilingual PDF, `/verify/[serial]`, revoke). Stripe test checkout + idempotent webhook + `/admin/orders` + sandbox banner. Paymob adapter + `docs/09`, `docs/10`. | End to end on the live site: guest → course → final → certificate → public verify → admin revoke flips the page. Replaying the same webhook twice creates exactly one enrolment (committed test). Arabic renders correctly in the PDF on a phone. |
| **13** | `/admin/analytics`: mastery heatmap, item analysis (p-value, point-biserial, distractor distribution, auto-flags), block drop-off, transfer chart, simulation error-class frequency. Nightly `ItemStat` recompute (the one allowed cron, combined with the guest reset). `scripts/seed-demo-cohort.js` with visible "demo data" badges. `/how-it-was-built`. | Every chart is computed from real tables with a caption naming its learning question. The item-analysis page correctly flags three deliberately mis-keyed seed items. Every seeded screen is badged. |
| **14** | Hardening (rate limits, headers, CSP, dependency audit, Playwright ×3, axe clean), `docs/12`, `13`, `14`, `COSTS.md`, `DATA-OWNERSHIP.md`, `RUNBOOK.md`, `ACCESSIBILITY.md`, `ROADMAP.md`. Case study AR+EN deployed to `mostafafathy.com/p/masar`. 3-minute video. CV / LinkedIn / Upwork updated. | A stranger with only the URL reaches the flagship L3 exercise in ≤ 3 clicks with no signup, completes it, sees a certificate verify page, and finds the repo — all under 10 minutes with no help. The case study names no employer, claims no users, invents no metrics. |
| **15–16** | Elastic. Absorbs slippage. If nothing slipped, ship exactly one v1.1 item and document it. | Either every earlier DoD is met, or one extension is shipped and documented. An unfinished extension is reverted from `main` and moved to `ROADMAP.md`. |

**Freeze rule.** If a job offer or an interview loop starts, freeze at the last completed week boundary and write the case study for what exists. From week 6 onward — spec pack, working platform, eight published lessons, a QA-gated pipeline — this is already a stronger portfolio piece than most people finish in six months.

---

# 10. Bootstrap (superseded)

The original bootstrap instructions targeted Next.js 14 and libSQL, and were superseded
when the stack changed to Next.js 16 and Postgres. The current path from a clean clone to a
running instance is the runbook in `HANDOVER.md`, measured at 156 seconds on Windows; the
rules the code is built to are in `docs/CONVENTIONS.md`.

---

# 11. Risks, honesty guardrails, and done

| # | Risk | Mitigation |
|---|---|---|
| 1 | **Job hunt eats the schedule** (near certain; jobs are priority #1) | Every week ends deployed. Freeze at the last week boundary and publish what exists. Weeks 15–16 pre-booked as slippage, not stretch. Week 2 already yields a postable public asset. |
| 2 | **Content authoring is the real long pole**, not code | Source notes start in Week 0, before the repo. Scope capped: 8 lessons, 90 items, 2 sims — **do not add a 9th lesson**. If behind at week 8: ship 6 lessons and say so. The pipeline drafts; he reviews and repairs rather than writing cold. |
| 3 | **Scope creep into a real LMS** | `ROADMAP.md` as the pressure valve; the scope contract in §3; the walkthrough test ("if it's not in the 3 minutes, it doesn't ship"). |
| 4 | **Domain accuracy — he is not an RCM professional** | Foundations level, payer-agnostic, public sources cited per fact-bearing claim, `needs-verification.md` forces confirmation, one domain-literate reader before launch as a **hard gate**; if unavailable, cut to four defensible lessons. |
| 5 | **IP on real code sets** (CPT is AMA-licensed) | Synthetic `PRC-`/`DX-` families, fictional payers, generic claim structure, banner everywhere, taught as a lesson. |
| 6 | **Accidental employer/client contamination** | Forbidden-term denylist enforced twice: inside the pipeline gate and as a repo-wide CI grep. Client files never copied into the project. Screenshot review and a fresh browser profile for all recordings. |
| 7 | **Arabic PDF shaping** | Client-side DOM render (browser shapes and bidis). ADR-0004 records why `pdf-lib` was rejected. Visual check on a real phone before launch. |
| 8 | **Analytics that look impressive but mean nothing at n≈5** | Seeded cohort visibly badged; the ~20-first-attempts caveat stated in the UI and the case study; the mechanism is what is claimed. |
| 9 | **Sandbox payments mistaken for a live product** | `Order.isSandbox` as a real column, a permanent checkout banner, test card printed on the page, and an explicit paragraph in the case study. |
| 10 | **Guest-demo abuse** | Guest role scoped to a sandboxed learner record, rate-limited, wiped nightly. |
| 11 | **Leaked secrets** | Token rotated in Week 0 before any commit; gitleaks in CI; `.env.example` only. |
| 12 | **Vercel Hobby non-commercial clause** | Test mode only, documented in `RUNBOOK.md`; Cloud Run path pre-built, not theoretical. |
| 13 | **Windows-specific breakage** | Node script wrappers (the existing pattern), `.gitattributes` `eol=lf`, CI on `ubuntu-latest`. |
| 14 | **Burnout around week 8** | Four short Arabic posts to the newsletter list released as phases land (weeks 2, 6, 11, 14), so external feedback arrives four times. A missed week is normal; the plan absorbs it. |
| 15 | **Nobody sees it** | Launch is a week-14 deliverable, not an afterthought, and the case study is drafted from week 4 — that final push is exactly what gets skipped when an offer lands. |

**Honesty guardrails for the case study (a checklist run before publishing):**
- No employer named, ever — "an education company" if context is needed.
- No invented learners, clients, revenue, completion rates or testimonials.
- Any cohort data is labelled seeded, in the UI and in the text.
- Payments described as sandbox; Paymob described as implemented-and-not-activated, with the commercial-registration reason stated.
- The only external numbers quoted are his five approved professional metrics, explicitly attributed to his day job and visually separated from this project's own (zero) usage.
- The project is described everywhere as self-initiated and built to production standard.
- Numbers about *this* project — first-pass QA rate, edit-minutes per lesson, item counts — are measured, and the failures are published alongside the successes.

**Definition of done for the whole portfolio piece.** All of these true at once:
1. A stranger with only the URL reaches the flagship L3 exercise in ≤ 3 clicks with no signup, completes it, and gets specific per-error feedback.
2. `/method` shows the same lesson at L1, L2 and L3 live.
3. `/how-it-was-built` publishes a real generated lesson, its rubric scorecard and its concept-log entry, including failed runs.
4. One certificate is issued, downloadable with correct Arabic, and verifiable at a public URL.
5. The blueprint matrix shows zero uncovered objectives across ~90 items. *(The ≥ 50% scenario/case clause is withdrawn for v1.0 — see §4.4.)*
6. The repo is public, CI is green, and a clean clone reaches a running local instance from the README alone.
7. `docs/00-15`, `COSTS.md`, `DATA-OWNERSHIP.md`, `SUPPORT.md`, `ROADMAP.md`, `ACCESSIBILITY.md` all exist with real content.
8. The case study and the 3-minute video are live, and both pass the honesty checklist.
9. The links are in the CV, LinkedIn featured section and Upwork portfolio.

---

# 12. Appendix

## A. Glossary (RCM terms used in the demo course)

| Term | Meaning as taught (payer-agnostic, foundations level) |
|---|---|
| **Payer** | The organisation that pays for covered healthcare services under a plan. |
| **Provider** | The clinic, hospital or practitioner delivering the service. |
| **Member / beneficiary** | The person covered by the plan. |
| **TPA** | Third-party administrator; administers claims on a payer's behalf. |
| **Network** | The set of providers contracted with a payer at agreed rates. |
| **Premium** | The recurring amount paid to keep coverage active. |
| **Deductible** | The amount the member pays before the plan begins to pay. |
| **Copay** | A fixed amount the member pays per encounter. |
| **Coinsurance** | A percentage of the allowed amount the member pays after the deductible. |
| **Out-of-pocket maximum** | The annual ceiling on member cost-sharing. |
| **Eligibility verification** | Confirming the member is active and the service is covered on the date of service. |
| **Pre-authorisation** | Payer approval obtained before a service is delivered. |
| **Claim** | The structured request for payment sent from provider to payer. |
| **Clean claim** | A claim with no defect that would delay adjudication. |
| **Clearinghouse** | An intermediary that validates and routes claims to payers. |
| **Adjudication** | The payer's decision process on a submitted claim. |
| **Remittance advice** | The payer's explanation of what was paid, adjusted or denied. |
| **Rejection** | A claim refused before adjudication, usually on format or data. |
| **Denial** | A claim adjudicated and refused payment for a stated reason. |
| **Appeal** | A formal request to reconsider a denial, supported by evidence. |
| **Medical necessity** | The principle that documentation must support the services billed. |
| **Days in A/R** | Average days receivables remain outstanding. |
| **Clean-claim rate** | Share of claims accepted on first submission without correction. |
| **Denial rate** | Share of adjudicated claims denied. |
| **Net collection rate** | Share of collectable revenue actually collected. |
| **Code family (synthetic)** | In this course, `PRC-` for procedures and `DX-` for diagnoses — invented identifiers standing in for licensed real-world code sets. |

## B. Reusable client-proposal mapping

Masār is not only a portfolio piece; it is the proposal template. Any prospect arriving with a pile of written lessons maps onto three options, all built from the same platform and pipeline, with the same ownership and handover pack. No prices here — prices are set per engagement.

| | **Option A — Publish** | **Option B — Publish + Flagships** | **Option C — Product** |
|---|---|---|---|
| **Promise** | Every lesson live, structured, quizzed | A + the difference made visible | B + a certification-prep product |
| **Depth** | 100% at L1 | 100% L1, ~10% at L2/L3 | 100% L1, ~30% L2, ~10% L3 |
| **Assessment** | Existing questions organised into lesson quizzes | + a blueprint, module quizzes, a real item bank | + mock exams, final assessment, item analysis, mastery |
| **Practice** | — | 2–3 job-task simulations | Simulations across every module |
| **Platform** | Delivery, progress, admin | + certificates, public verification | + payments, analytics, multi-course, scale |
| **Pipeline** | Bulk L1 conversion via the pipeline | + concept log across the whole corpus | + client-run pipeline, handed over with its contract and gate |
| **Timeline shape** | Shortest | Medium | Phased; A ships first, B and C are upgrades |
| **Upgrade path** | A → B → C with **no migration**, no URL change, no progress reset — depth is additive | | |
| **Always included** | The `docs/00-15` specification produced first and reviewed together · full ownership (source, database, content, user data, domain, admin, design assets) · a transparent recurring-cost table · a written data-export and offboarding document · a 30-day support policy | | |

**The line to use:** *"Every lesson gets L1 in phase one so nothing stays a PDF. We pick a handful of flagships for L2 and L3 so the difference is visible from day one. Then we upgrade module by module as budget allows — and because depth is additive, an upgrade never resets a single learner's progress."*

---

*Masār is a self-initiated project by Mostafa Fathy, built to production standard. Original content, synthetic data, sandbox payments, no client material, no employer named.*