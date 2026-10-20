# STATUS

Update this file at the end of every session. It is the first thing the next session reads.

## 20 October 2026: the blind human rating is built

The one open item that needs a person now has its tool. `/rate/index.html` (not linked, not
indexed) shows a rater 50 lesson samples, shuffled and identified only as L01 to L50: drafts
from both writers and copies broken in the calibration's named ways. Each is shown in Arabic,
then as its English mirror, fully rendered with every answer and its feedback visible, and
scored on the eight rubric criteria, with a reason required for any score of 3 or below. No
model's score and no sample's source appears on the page; the key that maps L01 to a source is
kept outside the repository. A second rater scores an overlapping 15 for agreement. Raters
reach it with a private code whose hash is in `lib/rating/raters.ts`; scores are stored in
`HumanRating` (migration `20261020080000_add_human_rating`, applied to production 20 October).

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

**Added 2026-10-13 — Sentry wired; live in production.** `@sentry/nextjs` 11.7 is
installed: `instrumentation.ts` (Node + edge init, `onRequestError`), `instrumentation-client.ts`
(browser init, replay on error only with default masking, route transitions),
`app/global-error.tsx`, and `withSentryConfig` from `@sentry/nextjs/config` wrapping the
next-intl plugin in `next.config.ts`. The SDK is `enabled` only when `NODE_ENV` is production,
browser events tunnel through `/api/monitoring` (under `/api` so the proxy matcher skips it),
and source-map upload runs only when `SENTRY_AUTH_TOKEN` is set. One test event was sent
straight to the DSN and accepted. The DSN and auth-token variables are on Vercel (13 Oct) and a production deployment
followed; production now reports to Sentry. What is still open is in `LATER.md`.
The DSN lives in `.env` locally and in `.local/sentry.env`; never in a tracked file.

**Added 2026-10-14 — three more judges, four lessons scored.** `pipeline/judge_bedrock.py`
scores a lesson against the unchanged rubric with a model on Amazon Bedrock in a fresh
context (judge prompt + rubric + lesson, nothing else), with applicability derived from the
lesson's levels exactly as the gate does it; `pipeline/compare_verdicts.py` reports
per-criterion deltas. Run with Qwen3-32B, Llama 3.3 70B and Nova Pro on all four drafts.
SEC-01, CS-01 and PRV-01, never scored before, pass with every judge (means 4.38 to 4.88
over 8 criteria; no pair of judges more than one point apart on any criterion). Lesson-02
exposed the finding: Llama scored bilingual quality 1 on a lesson that declares
`bilingual: false`, which the rubric says is not penalised, and that single score failed
the gate while the other two judges passed it. The gate did its job; the judge misread a
clause. The judge prompt now states the lesson's `bilingual` flag next to the applicability
rules. Per-lesson tables are in each `pipeline/out/*/v1/STATUS.md`; every run is in
`pipeline/memory/run-log.jsonl`, including the FAIL. Credentials come from the standard AWS
environment, never from a tracked file.

**Added 2026-10-14 (later) — the drafts' pages now read their rubric result.** `/`,
`/samples`, `/samples/[code]` and `/commission` said "not rubric-scored" as fixed text; that
stopped being true when the three judges ran. `draftRubric()` in `lib/drafts.ts` reads the
verdicts and takes pass/fail from each `qa-report.<tag>.md`, so the pages state the judge
count and mean range and keep the "LLM rubric scores, not human QA" label. Test:
`tests/draft-rubric.test.ts`. The Llama finding is failure entry 15; the re-run with the
`bilingual` flag stated in the prompt passes (`verdict.llama33-70b-r2.json`). The failure
log is at fifteen; `lib/failures.ts` carries the count to the case study with no edit.

**Added 2026-10-14 (later) — the judge panel.** `pipeline/panel.py` loads every
`verdict.<tag>.json` beside a lesson through `qa_gate.py`, keeps the latest verdict per model,
and decides PASS (all pass, no criterion split above 1), NEEDS HUMAN (outcomes differ or a
split above 1) or FAIL (all fail); it writes `panel-report.md`. Seven fixture tests in
`pipeline/test_panel.py`. All four drafts: PANEL PASS with three judges. Lesson-02's first
Llama verdict is superseded by the re-run and listed as such in its report. The Qwen and
Nova verdicts predate the prompt line stating the `bilingual` flag; they scored that
criterion correctly without it.

**Added 2026-10-14 (later) — the loop end to end, and checks that run without anyone.**
- `pipeline/run_lesson.py` runs source note → generate → `validate.py` + item check →
  `concept_log.py` → panel → one retry → stop, and refuses a generator whose model family
  sits on the panel. Twenty-six offline checks in `pipeline/test_run_lesson.py` drive it with
  stand-in models: clean pass, gate failure then retry, second failure stops, split panel
  goes to a human without a retry, unusable output stops. The three existing drafts pass the
  new item check. **Not yet run against a real model**: the machine had no DNS when it was
  written. The source note for that first run is
  `pipeline/sources/ops-01-writing-a-shift-handover.md`. A run writes to `pipeline/out/`,
  which `lib/drafts.ts` lists on the site automatically, so a new draft also needs its
  objective in `DRAFT_OBJECTIVES` and its items imported in `lib/items.ts` before it ships.
- `scripts/learner-flow.mjs` walks the live site in headless Chrome with no dependencies:
  home in both locales, Arabic at 390px with no sideways scroll, course → lesson, a
  knowledge check answered and explained, a draft from /samples, /commission. Read-only.
  Daily via `.github/workflows/learner-flow.yml`. Passed 7/7 against the dev server and
  failed 7/7 against a broken base URL.
- `.github/workflows/lighthouse.yml` audits six database-free pages of each commit's
  production build (`lighthouserc.json`): accessibility below 0.9 fails, the other three
  categories warn. **Its first run will be its first test**: it could not be run here.
- CI now also runs the judge, panel and runner tests.

**Added 2026-10-14 (evening) — the first real runs, and failure 16.** DNS came back; the
commits above are pushed, CI and Lighthouse are green on them. Two real runs of
`run_lesson.py` on the OPS-01 note, generator `openai.gpt-oss-120b-1:0`:
- **Run 1** (`pipeline/out/lesson-ops-01/`): v1 failed two gates, and the retry passed by
  deleting every definition card and emptying `conceptsIntroduced`. The panel passed it.
  Failure entry 16. The runner now has a revision check (a retry may not shrink concepts,
  cards, acting blocks or items), and the prompt states the concept-key rule. The run is
  kept unedited with a `STATUS.md` withdrawing its verdict.
- **Run 2** (`pipeline/out/lesson-ops-01-r2/`): every gate passed at v1, and the panel
  passed it at 4.75, 4.75 and 4.62. A read against the source found five things the panel
  did not, listed in its `STATUS.md`. It needs a human revision before it can be shown.
- `lib/drafts.ts` now lists a draft only once its objective statement is written in
  `DRAFT_OBJECTIVES`, so a fresh run in `pipeline/out` cannot reach /samples unreviewed.
  /samples still shows exactly SEC-01, CS-01 and PRV-01, and `/en/samples/OPS-01` is a 404.
- README and the Space README say sixteen. The live Hugging Face Space only changes when
  `demo/hf-space` is pushed there.

**Added 2026-10-14 (night) — OPS-01 is the fourth sample, and failure 17.**
- OPS-01 v2 (`pipeline/out/lesson-ops-01-r2/v2/`) fixes the five problems a read found in
  the generated v1, plus a sixth (its item bank carried the RCM course slug). Made by hand
  at the owner's direction; v1 kept unedited. Its objective is in `DRAFT_OBJECTIVES`, its
  items are imported in `lib/items.ts`, and it is listed under /samples. The withdrawn run
  `lesson-ops-01` is excluded by name in `lib/drafts.ts`.
- **Failure 17:** the judge prompt never contained the items behind knowledge-check blocks,
  so every knowledge-check score so far was blind. `judge_bedrock.py` now includes them and
  refuses to run if one is missing. All four samples re-scored: every judge passes every
  sample, but the judges split 5/4/3 on knowledge checks on all four, so **the panel says
  NEEDS HUMAN on all four**. The earlier "All four drafts: PANEL PASS" above is superseded.
- The pages now read the panel decision from `panel-report.md` and say when a sample goes
  to a human. Sample and domain counts on the home and commission pages are derived
  (`lib/count-words.ts`) instead of "three".

**Added 2026-10-14 (late) — failure 18: the judges were calibrated, and the panel changed.**
- `pipeline/calibrate_judges.py` breaks each sample's items in two ways the rubric names and
  checks which judges notice. The old panel caught 0, 1 and 0 of 8 (Qwen3-32B, Llama 3.3 70B,
  Nova Pro). Kimi K2.5 caught 8 of 8, DeepSeek V3.2 7 of 8. Report and every score:
  `pipeline/out/calibration/2026-10-14/`.
- The panel (`PANEL_MODELS` in `pipeline/panel.py`) is now Kimi K2.5 and DeepSeek V3.2. All
  four samples re-scored: **PANEL PASS on all four**, no criterion split above one. The
  earlier "NEEDS HUMAN on all four" above is superseded. Old verdicts are in each sample's
  `retired-judges/`. Kimi's first verdict on PRV-01 used an unknown criterion name, the gate
  refused it, and the re-run is the one counted; the refused file is in `refused-verdicts/`.
- The item check in `run_lesson.py` now refuses feedback that only states a verdict and
  identical feedback across options. The independence check treats Bedrock's two spellings
  of Moonshot as one family.
- `pipeline/out/lesson-02/v1/` still carries the old panel's verdicts; it is not a sample.
- The Space README says eighteen in the repo and on the live Space (uploaded 14 Oct).

**Added 2026-10-14 (night) — calibration widened; weekly panel in CI, waiting on AWS.**
- `calibrate_judges.py` now plants five defects across four criteria. The seated panel passes
  on knowledge checks (8/8, 7/8) and worked examples (4/4, 4/4), and fails on scenario
  consequences (2/4, 0/4) and pasted English (1/4, 1/4). Report:
  `pipeline/out/calibration/2026-10-14/report.md`.
- `validate.py` has a new rule, `scenario-consequence`: every decision's consequence has at
  least five words and no two are identical. Two negative tests; 20/20 pass; the five course
  lessons and the four samples still pass.
- `.github/workflows/judge-panel.yml` re-scores the four samples weekly on Bedrock through
  GitHub OIDC (no stored key). It is skipped until the repository variable `AWS_ROLE_ARN`
  names an IAM role that trusts this repository and may invoke Bedrock; the owner creates
  that role in the console.
- First manual runs (14 Oct) failed with "Not authorized to perform sts:AssumeRoleWithWebIdentity".
  The workflow's claims step showed why: GitHub now sends the subject claim with immutable
  ids, `repo:MostafaFathy1527@<owner-id>/masar-platform@<repo-id>:ref:refs/heads/main`, and the
  role's trust policy matched the old form `repo:MostafaFathy1527/masar-platform:*`. The
  trust policy's `sub` condition must use the new form; the claims step stays in the
  workflow so a refused role says why.
- After the trust policy was updated, run #4 (14 Oct, manual) passed: all four samples PANEL
  PASS with two judges, in about a minute. The job now runs every Monday.

**Added 2026-10-14 (night) — documentation site.** `.gitbook.yaml` and `SUMMARY.md` at the
root define a documentation site built from the files already in the repository (README as
the front page; the contract, rubric, calibration report, failure log, sample statuses).
Two new pages: `docs/method.md` (the loop in one page) and `docs/running-the-gates.md` (the
commands). The repository is the source of truth: edit here, not in the hosted editor, so
every change still passes the publish gate. English only, because the host's right-to-left
support is partial; Arabic stays on the platform itself.

**Added 2026-10-14 (night) — a third judge, for Arabic.** The pasted-English calibration was
run on eleven more Bedrock models. Seven gave every broken copy a 5 for bilingual quality,
GLM-4.7 caught two of four, one (DeepSeek R1) returned unparseable output, and two caught all
four: Kimi K3 and GLM-5 (counts corrected 15 October from "twelve" and "nine"). GLM-5
also caught all twelve knowledge-check and worked-example defects, missed empty scenario
consequences like every judge, and now sits on the panel (`panel.py`). All four samples still
pass with three judges. On the four pasted-English copies, the two-judge panel passed three
and sent one to a person; the three-judge panel sends all four to a person. GLM-5 scored every
real sample 5 on every criterion, so it is calibrated on catching defects, not on grading
fine differences. Two robustness fixes came with it: `judge_bedrock.py` retries without
`temperature` for models that refuse the field and records that in the verdict, and
`calibrate_judges.py` keeps going when one model is refused and has `--report-only` to rebuild
the report from verdicts on disk. Only models AWS itself serves on Bedrock are used; a
third-party marketplace model is not.

**Added 2026-10-15 — scenarios tested on six more judges, and open models can be judges.**
The empty-consequences calibration ran on six more models AWS serves on Bedrock
(`pipeline/out/calibration/2026-10-15/report.md`). GLM-4.7, MiniMax M2.5, Mistral Large 3,
Nemotron Super 3 and Qwen3-VL caught 0 of 4. Kimi K3 caught 3 of 4, and on the fourth named
the defect in its note while taking one point off. Nine judges tested, none calibrated on
scenarios; `validate.py` and a person still own them. K3 also caught 8 of 8 knowledge-check
and 4 of 4 worked-example defects, and 4 of 4 pasted English on 14 October, so it is at least
as good as Kimi K2.5 on every defect. **Seated the same day, on the owner's decision, in K2.5's
place** (K2.5's verdicts are in each sample's `retired-judges/`). The measured cost: it refuses
temperature 0, and its two runs on identical real lessons a day apart differed by one point on
10 of 32 criterion scores. Re-scored with the new panel, SEC-01, CS-01 and PRV-01 still PASS.
**OPS-01 is now NEEDS HUMAN:** K3 scored its Arabic 3 against 5 and 5, and named two slips that
are in the lesson («ثلاث سطور» for «ثلاثة سطور», and the coinage «المنتهي»). A fix would be a
`v3`, by a person. The weekly CI run needs access to `us.moonshotai.kimi-k3`. Separately, `judge_bedrock.py` and `calibrate_judges.py` now take
`--endpoint`: any OpenAI-compatible server (llama.cpp, vLLM, Ollama) serving an open model, so
ALLaM, SILMA or Fanar can be calibrated on whatever hardware is to hand, with the same prompt,
parsing and gate. The verdict records `provider: openai-compatible`. Tested end to end against
a stand-in server and in `test_judge_bedrock.py`.

**Added 2026-10-15 (night) — an open Arabic model, and judges that copy the example
(what-failed entry 19).**
- **The run:** `pipeline/kaggle_open_judges.ipynb` runs the full calibration on Kaggle's free
  T4 GPUs. It builds llama.cpp, serves a GGUF model, and checks the chat format before any
  judgement.
- **The models:** QCRI's Fanar-2-27B-Instruct (Q4_K_M, thinking off), with Gemma 3 27B, its
  base model, as a control.
- **The result:** Fanar-2 handed back the example verdict printed in `rubric.md` for 24 of 24
  lessons, and Gemma 3 27B for 23 of 24. On Bedrock, Gemma 3 27B had done the same on 5 of 8
  on 14 October.
- **The fix:** `judge_bedrock.py` refuses a verdict whose scores, notes and closing note all
  equal the example. `calibrate_judges.py` counts one as no score, lists copies in the report
  and takes `--audit-copies` and `--date`. The 14 October report keeps its rows, with a note.
- **Context limits:** ALLaM-7B and Fanar-1-9B were not run; their 4,096-token context is
  shorter than the judge prompt.
- **The live HF Space README** says twenty (re-uploaded 19 October, hash matches the repo).

**Added 2026-10-17: Fanar-2 re-tested at 8-bit, thinking off and on (what-failed entry 19).**
- **The run:** Fanar-2 at Q8_0 on two V100 cards, four ways: thinking off and on, each with the
  committed rubric (`pipeline/out/calibration/2026-10-17`) and with a copy whose example verdict
  has no values (`2026-10-17-no-values-in-example`, with `rubric-used.md`). Settings, model hash
  and templates are in `2026-10-17/environment.json`.
- **The result:** thinking off, it returned the example 24 of 24 times at 8-bit too, and with
  nothing to copy it gave 5 on every criterion to every lesson. Thinking on, it read some
  lessons: 5 of 14 scorable defects caught with the example present, 4 of 20 without. With the
  example present, 14 of its 22 verdicts carried the example's knowledge-check note word for
  word. Not seated.
- **The code:** `judge_bedrock.py` reads `JUDGE_MAX_TOKENS` and `JUDGE_TEMPERATURE` for a
  served reasoning model (defaults unchanged: 4,000 and 0, and the verdict records the
  temperature), drops a think block before reading the JSON, and with `JUDGE_KEEP_OUTPUT` keeps
  the whole reply beside the verdict as `verdict.<tag>.output.txt`.

**Added 2026-10-17 (night): four more open Arabic models (what-failed entry 19).**
- **The run:** SILMA-9B-Instruct, Falcon-H1-7B-Instruct, AceGPT-v2-32B-Chat and
  Jais-family-30B-16k-chat on two V100 cards, each with its own chat template and default
  decoding (`pipeline/out/calibration/2026-10-17-open-arabic-judges`; files, hashes and server
  commands in its `environment.json`).
- **The result:** SILMA and Jais gave no verdict in 24. AceGPT handed back the example 18 times,
  and four of its other six verdicts are the example with one score changed. Falcon-H1 scored
  all 24, caught 1 of 20 defects and gave every lesson's Arabic 5. None is seated.
- **The fix:** `copies_rubric_example` now also refuses the example with at most one score
  changed and its note and closing note kept, numbers aside, with three new tests. Across every
  run that is five verdicts: AceGPT's four, now no score, and a sixth Gemma 3 27B copy from
  14 October, noted in that report. A verdict with its own scores and a borrowed note still counts.

**Added 2026-10-18: five small open models as judges; one could be seated.**
- **The run:** Mistral Small 3.2 24B, Falcon-H1-34B, gpt-oss-20b, GLM-4.7-Flash and
  Qwen3-30B-A3B-Thinking-2507, each at Q8_0 on two V100 cards with its own default decoding
  (`pipeline/out/calibration/2026-10-18-small-open-judges`; files, hashes, server commands and
  decoding in its `environment.json`). The question was whether a judge that fits one or two
  rented 32 GB cards can be seated.
- **The result:** Mistral caught 1 of 19 and copied the example once; Falcon-H1-34B 5 of 20 (the
  worked examples); GLM-4.7-Flash 10 of 19; **gpt-oss-20b 15 of 20** and **Qwen3-30B-A3B-Thinking
  14 of 20**, both with every knowledge-check and worked-example defect and most of the pasted
  English. No judge saw an empty scenario. gpt-oss-20b shares the generator's family and cannot be
  seated; Qwen3-30B-A3B-Thinking-2507 (Apache-2.0, 3B active, one card at Q6_K) can be, if the
  owner decides so. **Owner's call, not taken here;** taken later the same day (the next entry).
- **What seating it would need:** a served endpoint the weekly run can reach (the HF Space is
  CPU-only; a rented card costs about $0.30 an hour while judging), the family check in
  `panel.py`, and the same drift check K3 got (two runs of identical lessons).

**Added 2026-10-18 (later): Qwen3-30B-A3B-Thinking-2507 seated as the fourth judge, the first open one.**
- **The decision:** the owner's, on the first pass (14 of 20). The seat is the exact file that passed,
  `Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf`, served by llama.cpp at the model's own temperature 0.6
  with 12,000 tokens (`panel.SERVED_JUDGES`).
- **The drift check K3 got** (`pipeline/out/calibration/2026-10-18-qwen3-second-pass`): 11 of 20
  on the second pass; worked examples 4 of 4 both times, knowledge checks 6 of 8 against 8 of 8,
  pasted English 1 of 4 against 2 of 4. 12 of 192 scores moved (10 by two or more), 2 of 32 on
  the real lessons, and 4 of 24 gate outcomes flipped, three on pasted English. Steady on worked
  examples, not on pasted English; K3 and GLM-5 still catch that, and a split goes to a person.
- **The four samples with four judges:** SEC-01, CS-01 and PRV-01 PANEL PASS; OPS-01 NEEDS HUMAN
  on its Arabic, as before (K3 3 against 5, 5 and 5).
- **The code:** `panel.py` has `SERVED_JUDGES` and `SEATS`; an empty seat is NEEDS HUMAN, never
  PASS or FAIL; `run_judges()` scores every seat and leaves a served seat empty, with one line on
  stderr, when its endpoint is unset, unreachable or not a chat completion. `judge_bedrock.py`
  takes `--temperature` and `--max-tokens`. `run_lesson.py` refuses a generator from any seat's
  family, Qwen included.
- **The weekly run rents its own card** (owner's decision, 18 October): `judge-panel.yml` rents two
  V100 cards for the run (`pipeline/served_judge_vm.py`), builds llama.cpp at the calibration's
  commit and serves the seated file only if its sha256 matches (`pipeline/served_judge_setup.sh`),
  reaches it through an SSH tunnel with a key made for that run, and terminates the machine in a
  final step that always runs. One machine with two V100 cards, about 20 minutes a run, $0.58 an hour.
- **The first full run** (18 October, run 39124575598, about 20 minutes): the
  `CLOUDRIFT_API_KEY` repository secret is set and the run succeeded end to end. SEC-01 and
  PRV-01 PANEL PASS; CS-01 NEEDS HUMAN on accessibility; OPS-01 NEEDS HUMAN. The job shows red
  whenever a sample goes to a person, by design.
- **When the open seat fails:** a run that cannot score it counts the seat empty, even if an older
  verdict from it sits beside the lesson, so a stale verdict never stands in for this week's. A
  served verdict the gate refuses is moved to `refused-verdicts/` beside the lesson and the seat
  counts empty; it no longer stops the whole panel.

**Added 2026-10-18 (evening): what a weekly panel run costs, and one judge given room.**
- **Cost, from the token counts in the four samples' verdicts and AWS's public on-demand price
  list:** about $0.28 of Bedrock per run (Kimi K3 about $0.23, GLM-5 $0.03, DeepSeek V3.2 $0.02),
  plus about 20 minutes of the rented machine (two V100 cards, $0.58 an hour) for the open seat. Under $25 a year in all. On-demand
  only: provisioned throughput would be a commitment the project has no use for.
- **Kimi K3 gets 8,000 tokens** (`panel.HOSTED_MAX_TOKENS`). Its replies on the samples ran to
  3,430-3,640 of the default 4,000, so a longer lesson would have cut its verdict off mid-JSON.
- **An oddity, recorded rather than explained:** Bedrock reports 7 input tokens for every K3
  verdict, against 6,000-7,700 for the other judges on the same prompt. K3 did read the lessons:
  its notes name details only the lesson contains. The count is Bedrock's, not the pipeline's.

**Added 2026-10-18 (night): two logs, and gates that do not depend on where they run.**
- **Calibration judgements have their own log**, `pipeline/memory/calibration-log.jsonl`
  (`judge_bedrock.py --log`). `run-log.jsonl` now holds only the 56 lesson runs, and
  `/how-it-was-built` says so instead of "it mixes calibration trials".
- **`qa_gate.py` resolves its paths from the repository**, not the working directory, and refuses
  `true`/`false` as a score (Python counts a bool as an int). `run_lesson.py` writes `run.json`
  in a `finally`, so a run that crashes still leaves its record.
- **The Hugging Face Space carries the same gates** (`demo/hf-space/sync.py`, then
  `build_static.py`); its four changed files were re-uploaded and their hashes match the repo.

**Added 2026-10-19: an open Arabic judge dataset, a sixth defect, and failure 20.**
- **`datasets/arabic-lesson-judge/`** (built by `pipeline/judge_dataset.py`, no model calls):
  real-versus-broken lesson pairs from the four pipeline samples and the five human-authored course
  lessons, and every judge's real and broken score from the calibration runs so far. Offered to the
  Fanar post-training team at QCRI, who said Fanar 2 had no judge-task post-training data.
  Published 19 October at huggingface.co/datasets/masar1/arabic-lesson-judge (CC BY-NC 4.0; its card
  adds Hugging Face metadata to the repo README). Rebuild and re-upload when the calibration grows. The
  counts are in the dataset's README, computed from the data.
- **`mismatched-numbers`**, a sixth calibration defect: every number in the Arabic fields moved so
  it no longer matches the English. It applies only where the Arabic has numbers, so 2 of 9 lessons
  today; a lesson it cannot break is skipped, not judged as a copy of itself. First run, 19 October
  on Bedrock (`pipeline/out/calibration/2026-10-19-mismatched-numbers`): one pair per judge, and only
  Kimi K3 of nine noticed; the other eight gave the broken Arabic full marks.
- **Failure 20:** the judge read a lesson with no `bilingual` key as English-only, the opposite of
  the schema. Fixed in `judge_bedrock.build_prompt`, with a test.

**Added 2026-10-19 (afternoon): the weekly run without its open seat, and what it settled.**
- **No GPU to rent.** The scheduled run had not started by 11:50 UTC (GitHub started the daily
  learner-flow run five and a half hours late the same day), so it was started by hand, and then
  CloudRift had no free V100 node. The run used to stop there; `judge-panel.yml` now lets the
  rent step fail, scores with the three hosted seats, and says in the summary that the open seat
  is empty, so every sample is NEEDS HUMAN by design (run 39248873259).
- **What the three hosted judges said:** all four samples PASS from each of them, and no criterion
  split them by more than one point, CS-01's accessibility included. Last week's CS-01
  accessibility split and OPS-01's splits therefore came from the open seat (Qwen3-30B-A3B-Thinking).
- **GLM-5 gave 5 on every criterion of every sample, 32 of 32 scores.** It passed calibration, so
  this is not a refusal; it is recorded because a judge that never marks anything down adds no
  information to a panel. Checked the same afternoon (calibrate.yml, run 39250758377): it still
  scores the broken copies far lower, 16 of 16 on knowledge checks, pasted English and worked examples
  (mean drop 3 to 4), and 0 of 4 on empty scenario consequences, as before. Its fives are a lenient
  reading of good lessons, not a judge that stopped looking; it also missed the one mismatched-numbers
  pair.

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

Four gates exist, each with negative tests proving it refuses things, and all run in CI:

| Gate | Refuses | Negative tests |
|---|---|---|
| `validate.py` | structure, undeclared objectives, wrong-level blocks, duplicate ids, prose budget, licensed code sets | 20 |
| `concept_log.py` | re-defining a concept an earlier lesson taught; using one before it is introduced | 6 |
| `qa_gate.py` | any criterion below 3, a mean below 4.0, a verdict missing criteria, a criterion scored where the registry gives it no evidence, a skipped criterion with no reason | 20 |
| `panel.py` (tested by `test_panel.py`) | fewer than two distinct judges; PASS while a seat is empty, the judges' outcomes differ or a criterion splits by more than one point; a served verdict the gate refuses, which is moved to `refused-verdicts/` | 26 |

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
**lesson 07 practitioner question**. The instructional-design review of the L2 content is done
(see "Blocked / needs the owner").

The Arabic objective statements are **done** — written by the owner rather than translated,
and `MI-13` now carries a behavioural statement in both languages where it previously had
only a topic. `/ar` renders them directly; the fallback that showed the code with the
English beneath it is removed. The narrated recording is **cut from scope**.

**The inter-rater check is now the load-bearing one.** `/how-it-was-built` publishes a
rubric score that carries its own caveat about the judge's independence, and that caveat
only resolves when a human scores three lessons blind against the same rubric. Until then
the page is honest but the number is unconfirmed — which is the state it describes.

`docs/design/what-failed.md` has **twenty** entries for §0.4 item 4. The first five share
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
were true when written** — four of the first fourteen are hardcoded facts that silently stopped
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
  per-lesson content service (priced per project since 8 Oct — the fixed table
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
- **UI/UX pass (8 Oct):** a real mobile menu in the header — a disclosure button with
  `aria-expanded`, Escape to close, focus returned — where before 900px a phone visitor
  could reach nothing but the guest button. Header controls, footer links and buttons are
  at least 44px tall; transitions respect `prefers-reduced-motion`. The hero eyebrow no
  longer reads "Demonstration — v1.0": a version number is internal state and the word
  told a buyer the thing was not real. It now carries the positioning line instead.
- **Orientation fix (8 Oct, later):** the owner tested the site as a visitor and got lost. The
  header is down to four items (course, samples, commission, case study); the landing page's
  depth comparison and page index are replaced by one "Who are you?" section with one
  destination per answer; the hero's two doors sit in a two-column grid (the third column
  was empty). The price table is gone from `/commission`: a fixed per-lesson figure read as
  expensive to some buyers and arbitrary to others. The page now says, in one line, that
  the price is quoted per project; the free first lesson stays.
- **Redesign (8 Oct, evening):** the whole surface, not a patch. Type: Newsreader for display,
  Instrument Sans for body and UI, IBM Plex Sans Arabic in place of Cairo (Cairo made every
  Arabic heading shout), JetBrains Mono kept for data. Colour: bone canvas, charcoal ink (no
  pure black), the amber desaturated and demoted to eyebrows, rules and active states; the one
  filled button is ink on paper, paper on ink in dark. Landing: an asymmetric hero — copy on
  the start side, a real gate report for the first draft in `pipeline/out` on the end side,
  read from its STATUS.md — then "Who are you?" and the three depths as numbered hairline rows
  rather than boxes. Chips are quiet pills; sections breathe (64–128px); the footer no longer
  doubles the band's ground. Motion: a single IntersectionObserver reveal (12px, 600ms,
  staggered 80ms) that marks an element only when it is already observing it, so nothing is
  hidden without JavaScript or under reduced motion; the first screen does not animate at all.
  Measured at 375 and 1280, both directions, both schemes: no horizontal overflow, 44px targets.
- **Hugging Face Space (13 Oct) — LIVE at https://huggingface.co/spaces/masar1/masar-quality-gates:**
  `demo/hf-space/` runs the three gates in the visitor's browser: the validator on any sample or
  pasted lesson (three layers, with the name denylist explicitly absent and said so), the concept
  log over the authored course, and the rubric gate on a verdict plus the lesson it judged.
  Gradio and Docker Spaces now need a paid plan, so it is a free *Static* Space: `index.html`
  (generated by `build_static.py`) loads Pyodide, mounts the gate scripts and samples, and drives
  `gates_core.py` from a small hand-written UI; `app.py` is a Gradio front end over the same
  module for a local run. Gradio-Lite was tried first and rejected: its worker mocks `os.link`
  without `follow_symlinks`, which the current `filelock` calls, so it dies before `import gradio`.
  `sync.py` snapshots the gate scripts, the generated schema, the course lessons and
  `pipeline/out` drafts into the folder, flat (the web uploader does not keep folders); nothing
  in it is edited by hand. No model is called on the page. Verified on the live URL: validator
  PASS and a forced FAIL, concept log PASS over 5 lessons, gate PASS (mean 4.14) and a forced
  floor FAIL. Purpose: a public, runnable artefact for the open-source pipeline.
