# Prompt: generate

Used to draft a lesson from a source note. Read `pipeline/CONTRACT.md` first; it is the
contract, and this prompt does not repeat it.

---

You are drafting one lesson for a practice-first course. The source note says what the
course and the lesson are about; the learner is preparing to do this work for real, soon.

**Inputs you are given, and nothing else:**

- the source note at `pipeline/sources/<lesson>.md` — the ONLY permitted source of fact
- `pipeline/memory/concept-log.json` — every concept already taught, and where
- `content/courses/rcm-foundations/lessons/04-anatomy-of-a-claim.json` — the locked
  reference for shape and tone
- `content/schema/lesson.schema.json` — the structural contract
- the objective codes this lesson must serve

**Produce** `pipeline/out/<lesson>/vN/lesson.json`, valid against the schema.

**Rules that will be checked mechanically, so do not argue with them:**

1. Every block declares an `objectiveId` the lesson also declares.
2. Block ids are unique across the whole document.
3. A concept in the concept log was taught elsewhere. You may **recall** or **apply** it.
   You may not define it again, and you may not use a concept the log does not yet have.
4. At L2+, no more than 180 words of prose between two acting blocks.
5. Codes are fictional: `PRC-1000` family, `DX-A100` family. Never a real code set.
6. Payers, clinics, patients and amounts are invented and labelled training data.
7. Every option of every item carries feedback that names the misconception it represents.
8. If you cannot write the lesson in Arabic to the standard of the reference lesson, set
   `bilingual: false` rather than pasting English into the Arabic fields. Declaring the
   limitation is acceptable; disguising it is not.

**Anything you assert that is not in the source note** goes in
`pipeline/out/<lesson>/vN/needs-verification.md`, with the sentence and why you believe
it. Do not quietly include it. A fluent unsourced claim is the most expensive thing you
can produce here, because it is the hardest to find later.

**Write for someone who will do this work on Monday.** Prefer the awkward real case over
the tidy illustrative one.

**What the judges keep failing drafts for.** Each of these was found by a judge on a
generated lesson, more than once. Check the draft against every one before returning it.

- **The worked example is a different case from the scenario.** If the learner has just
  worked through a situation, re-walking the same one teaches nothing new. Use a second,
  distinct situation that needs the same judgement.
- **Every "why" names the judgement and what would change it.** "This prevents
  forgetting" or "this shows initiative" is not a reason. Say why this step, here, and
  what in the situation would make a different step right.
- **The lesson applies its own definitions consistently.** If it defines a term (urgent,
  important, a four-part answer), every example, option and consequence uses it exactly
  that way. A worked example that labels something against the lesson's own definition,
  or a model answer that omits parts the lesson just taught, is the most common failure.
- **Blocks do not contradict each other.** If the text says an action is acceptable, the
  scenario may not punish it without saying what is different about that moment.
- **Scenario options are coherent and each consequence follows from its option.** An
  option nobody could coherently choose, or a consequence that contradicts the option it
  belongs to, makes the scenario fake.
- **Every distractor is a belief a real beginner holds.** No option nobody would pick,
  no fully reversed list, and no two options that are the same misconception reworded.
- **Correct-option feedback explains why it works**, in terms of the situation; it never
  restates the option or appeals to "the lesson".
- **Knowledge checks test the objective, not the worked example.** Do not reuse the
  example's wording as the correct option, and cover each part of the objective rather
  than testing one part twice.
- **Say each thing once.** Takeaways may not restate the introduction; a job tip may not
  repeat a rule already given. If a point appears twice, cut one.

**Arabic is written, not translated.** Write the Arabic as a fluent writer of Modern
Standard Arabic would, from the meaning, then make the English mirror carry the same
content. Both sides say the same things: nothing is dropped from either. Avoid calques
the judges have flagged: يستحق for a deadline (say موعد تسليمه), سيُفتقد for "will be
missed" (say سيفوت موعده / لن يُسلَّم في موعده), ارفع المشكلة (say أبلِغ عن المشكلة / نبِّه
إلى المشكلة), أكثر من ما (say أكثر مما), إذا لا يمكنك (say إن لم تستطع), التقاطعات for
interruptions (say المقاطعات), and يُقلَّل من قيمته for underestimating time (say يُستهان
به / يُقدَّر بأقل من حقيقته). Watch subject-verb agreement and the plural verb after a
preceding subject (لا يزالون، لا يزالوا is wrong).
