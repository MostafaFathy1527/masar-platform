# Review: what was done, what was not, and why

§0.7 scheduled a practitioner review of the content. **That review was not sought.** This
document records the decision, the limitation it leaves, and the two reviews that *are*
being done — which are real, but are not the same thing and must never be described as if
they were.

---

## 1. Practitioner review — not sought (scope decision, closed)

**What the plan asked for.** One or two claims or revenue-cycle practitioners to review the
flagship lesson and the simulation against a fixed form.

**What was decided.** Not to seek it. Recruiting a practitioner reviewer has a real cost in
time and social capital for a self-initiated project with no budget, and the owner decided
against it.

**This is a scope decision, not an outstanding task.** It is closed. It is recorded here so
that the limitation is visible rather than absent, which is the only thing that makes the
decision defensible.

### The limitation this leaves

Stated on `/how-it-was-built` and in the case study, in these words:

> No claims or revenue-cycle practitioner reviewed this content. It was authored from
> public sources by an instructional designer. All code sets are fictional training codes,
> and a real deployment would use a deploying organisation's own payer rules and licensed
> code sets, reviewed by someone who works in the field.

**Why the honest version is stronger than a softened one.** A reviewer who works in claims
is the single most likely person to test this claim, and it is the easiest one to check. A
vague "reviewed for accuracy" invites exactly that scrutiny and fails it. Saying plainly
that no practitioner saw it costs nothing that was ever truthfully claimed, and it removes
the only sentence a domain reviewer could use to dismiss the whole project.

### What must never be written

**The owner is not the subject-matter expert on this content.** He is an instructional
designer, not a claims or RCM practitioner. Naming him as the SME would be a fabricated
credential on a public page, in a project whose entire argument is that it does not do
that — and it would be trivially checkable by anyone in the field.

The two reviews below are his, they are genuine, and they are labelled for what they are.

---

## 2. Instructional-design review — his actual expertise

This is the review he is qualified to give, and it is a real credential. It is described
everywhere as an **instructional-design review**, never as a subject-matter or accuracy
review.

**Scope — design, not domain truth:**

1. **Objective alignment.** Does every block serve the objective it declares? Any block
   that teaches something true but unrelated to its objective.
2. **Coverage.** Does each objective have enough blocks and items to be learnable, and does
   anything have coverage it does not need?
3. **Assessment blueprint.** Does the item distribution match what the course claims to
   teach? Is the exam sampling defensible?
4. **Feedback quality.** Does every distractor name a misconception someone actually holds,
   and does feedback explain rather than restate?
5. **Depth model.** Does L2 do something L1 does not, or is it L1 with a question added?
6. **Arabic.** Does the flagship read as written in Arabic rather than translated? Is
   terminology consistent?

**What this review explicitly does not cover:** whether the claims content is factually
correct, whether the workflow matches real practice, or whether the seeded errors are
realistic. Those need a practitioner, and no practitioner saw this.

---

## 3. Blind inter-rater check — the one that makes the rubric number mean anything

§0.4 item 5: the LLM rubric score cannot stand alone. Without this, it is a model marking
its own homework.

**Method.** Three lessons, scored against `pipeline/rubric.md`, **without seeing the
model's scores first**. The blindness is the whole point — knowing the model's answer makes
agreement worthless. Then report the **mean absolute difference** per criterion.

**Cost.** Roughly twenty minutes.

**What the result means either way.** Close agreement means the rubric score is
approximately trustworthy for this kind of content. Wide disagreement means it is not —
and that is a finding worth publishing, not a reason to bury the exercise. Either outcome
goes in the case study with the number attached.

- [ ] Lesson A scored blind — date:
- [ ] Lesson B scored blind — date:
- [ ] Lesson C scored blind — date:
- [ ] Mean absolute difference computed and published

---

## Status

- [x] Practitioner review — **not sought.** Scope decision, closed. Limitation published.
- [ ] Instructional-design review — the owner's, labelled as such
- [ ] Blind inter-rater check — the owner's, ~20 minutes
