# Rubric

Eight criteria, scored 1–5. **The gate fails if any criterion scores below 3, or if
the mean is below 4.0.** Two thresholds because they catch different things: the mean
catches a lesson that is mediocre everywhere, and the floor catches one that is excellent
in seven places and unacceptable in the eighth.

## Who scores this, and what that is worth

The judge is a **fresh-context pass with no sight of the generation prompt**. It does not
know what the generator was asked for, so it cannot mark against intent — only against
what is on the page. That is the entire reason for the separation.

It is still the same family of model marking its own work. Everywhere this score appears
it carries the label:

> **LLM rubric score, fresh-context judge, self-assessed — not human QA.**

That label is not decoration. This number must never be presented as quality assurance,
must never appear in the same table or sentence as a human work-quality figure, and must
never be described as a pass rate without saying what did the passing.

The check on the check is the **blind inter-rater sample**: three lessons scored
independently against this rubric by a human, without seeing the model's scores, and the
mean absolute difference reported. If the two disagree materially, the rubric score is
worth less than it looks, and that is the finding.

---

## The criteria

### 1. Objective alignment
Does every block serve the objective it declares? A block that teaches something true but
unrelated to its objective scores low, however good it is.

**1** — blocks carry objectives that do not match their content.
**3** — mostly aligned; one or two blocks stretch their objective.
**5** — every block earns its objective, and the set covers it.

### 2. Level fidelity
Does the lesson do what its level promises? **A "visual card" that is secretly a bulleted
list fails this criterion.** So does an L2 that is an L1 with a question bolted on the end.

**1** — the level label is aspirational.
**3** — the required blocks are present but thin.
**5** — the level is what the learner actually experiences.

### 3. Worked-example quality
Does each step show what to do *and why*? The "why" is what separates a worked example
from a printed solution.

**1** — steps assert an answer with no reasoning.
**3** — reasoning present but generic.
**5** — reasoning names the judgement being made and what would change it.

### 4. Knowledge-check quality
Are distractors drawn from **real misconceptions**, and does per-option feedback explain
*why* rather than restate the answer? No "all of the above". A distractor nobody would
choose teaches nothing.

**1** — implausible distractors, or feedback that repeats the stem.
**3** — plausible distractors, feedback thin on some.
**5** — every distractor names a misconception someone actually holds.

### 5. Scenario authenticity
Would someone who does this work recognise the situation? Invented detail is fine;
implausible detail is not.

**1** — a textbook example wearing a story.
**3** — plausible but frictionless.
**5** — recognisable, including the awkward parts.

### 6. Bilingual quality
Is the Arabic natural, or translated? Terminology consistent with the glossary?
**An English-only lesson is not penalised here** — it is scored against its own
declaration. What is penalised is Arabic that reads as machine output.

**1** — Arabic is a literal rendering of English word order.
**3** — accurate, occasionally stiff.
**5** — reads as though written in Arabic.

### 7. Concision and reading level
Is anything longer than it needs to be? The prose budget between acting blocks is checked
mechanically; this criterion is about whether the prose that is there earns its space.

**1** — padded, repetitive.
**3** — clear but wordy.
**5** — nothing removable without loss.

### 8. Accessibility and IP
Alt text on any image. No meaning carried by colour alone. **No real licensed code
descriptors, no payer policy text, and nothing from the forbidden-term denylist.**

**1** — any licensed code set or denylisted term present. *This is an automatic 1 and
therefore an automatic gate failure, regardless of the other seven.*
**3** — compliant but minimal.
**5** — compliant, and the constraint is used as a teaching point.

---

## Output the judge must return

```json
{
  "lesson": "05-documentation-that-supports-the-claim",
  "scores": {
    "objective_alignment": 4,
    "level_fidelity": 4,
    "worked_example": 4,
    "knowledge_check": 3,
    "scenario_authenticity": 4,
    "bilingual_quality": 5,
    "concision": 4,
    "accessibility_ip": 5
  },
  "notes": {
    "knowledge_check": "Two distractors restate the stem rather than naming a misconception."
  },
  "verdict_notes": "One criterion at 3; mean 4.1. Passes, but the knowledge checks are the weakest part."
}
```

The gate — not the judge — decides pass or fail. `pipeline/qa_gate.py` applies the
thresholds, writes the report, and appends the run to `memory/run-log.jsonl` **including
the failures**, because a pipeline whose logged history contains only successes is not
evidence of anything.
