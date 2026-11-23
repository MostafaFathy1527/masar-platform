# QA gate report — recognising-a-phishing-email

**Result: PASS**

Mean 4.25 over 8 scored criteria (threshold 4.0); lowest criterion 4 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 | Everything serves SEC-01, but the reporting content (KC-02 and the tail of the worked-example answer) is response-to-incident, a slight stretch beyond recognition; it is coherent within the lesson's own takeaways, so a minor stretch only. |
| level fidelity | 4 | L1 and L2 are genuinely distinct and definition cards are true term-definition cards, not bulleted lists with borders. However, two introduced concepts (link_destination, engineered_urgency) get no dedicated L1 treatment — they appear only in the job tip and takeaways — leaving L1 slightly thin against the concept list. |
| worked example | 4 | Each step gives a real 'why' rather than an assertion, and step 3 is exemplary (urgency alone is not evidence; urgency plus an off-route request nearly is). Only step 3 fully names what would change the judgement; steps 1, 2 and 4 explain the mechanism well but not the boundary of the judgement, which keeps this off 5. |
| knowledge check | 4 | Most distractors name real held misconceptions (trusting polish, trusting logos, wait-and-see, deleting evidence, replying to verify) with feedback that explains the why. Two weaknesses: the 'arrived at work address' distractor is a weakly-held belief nobody would pick over 'actual address' as a signal, and the 'delete so nobody else clicks it' framing is slightly contrived since other recipients hold their own copies — the underlying impulse is real but the stated rationale is off. |
| scenario authenticity | 4 | A recognisable BEC pattern with genuine friction: the engineered 'cannot take calls' is the crux and the wrong options fail in-world with correct reasoning. It stays at 4 only because it is the canonical version of this scenario, cleanly executed rather than surprising. |
| bilingual quality | 5 |  |
| concision | 5 |  |
| accessibility ip | 4 | Compliant: no licensed code descriptors, no payer policy text, no denylist content, and no colour-dependent meaning anywhere. Minimal rather than exemplary — there is no point where the constraint itself is turned into a teaching moment. |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.


Judge's summary:

> A tightly written bilingual lesson with natural, Arabic-first prose and disciplined concision; its strongest elements are the worked example's calibrated reasoning and a scenario whose friction is the point. The weakest area is knowledge-check distractor construction, where two options are thinner than the rest, and two declared concepts get shallow L1 coverage. No criterion falls below 4; the floor is not threatened and the mean is comfortably above threshold.
