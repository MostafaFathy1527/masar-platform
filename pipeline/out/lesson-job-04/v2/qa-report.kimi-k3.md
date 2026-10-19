# QA gate report — your-first-week

**Result: FAIL**

Mean 3.38 over 8 scored criteria (threshold 4.0); lowest criterion 3 (floor 3).

Lesson levels: L1, L2.

> LLM rubric score, fresh-context judge, self-assessed — not human QA

| Criterion | Score | Note |
|---|---|---|
| objective alignment | 4 |  |
| level fidelity | 4 |  |
| worked example | 3 | The 'why' fields are generic ('It shows you've already looked and pinpoints exactly what you need') and restate the tactic rather than naming a judgment or what would change the approach. Step 2 is an optional one-line add-on, not a real step in a process, so the example is closer to a scripted phrase than a worked demonstration of reasoning. |
| knowledge check | 3 | KC-01 has two distractors nobody would choose: 'Can I get a raise now?' and 'Do you have spare time to chat?' are not plausible answers to a stem about understanding performance expectations, so they teach nothing. Feedback on correct options reads 'Correct misconception addressed:' — a template misfire, since a correct answer has no misconception — and most incorrect-option feedback is a one-line label rather than an explanation. KC-02 is materially better (insecure password file, relying on memory, asking one person everything are real misconceptions), which keeps this at 3 rather than lower. |
| scenario authenticity | 3 | Plausible but frictionless. The wrong-option consequences are mild hedges ('may not be familiar', 'may redirect you'), there is no awkwardness (busy colleague, conflicting advice, cost of asking wrong), and the 'best' answer is itself a redirection — asking Mina so she can tell you who actually knows — which blurs the distinction the decision is supposed to teach. Generic texture throughout; no detail that signals an observed workplace. |
| bilingual quality | 3 | Mostly accurate but carries translation tells. 'الشكل الناجح للشهر الأول' is a direct calque of 'what a successful first month looks like' and recurs in the rich text, worked example, takeaways, and KC-01's correct option, amplifying it. Worked-example step 2 has a grammar slip: 'أضف سؤالًا فرعيًا إذا تحتاج تفاصيل إضافية' (should be 'إذا احتجت'). The check-in concept is rendered inconsistently across blocks ('اتفاقية المتابعة' vs 'مراجعة دورية'), against the glossary-consistency requirement. |
| concision | 3 | The job tip duplicates the rich-text 'ask good questions' paragraph almost verbatim, including the same shared-folder/price-list example. The takeaways restate the rich text point-for-point (structural for the type, but nothing is compressed), and the five definition cards largely rephrase what the prose already said. The job tip at minimum is removable without loss. |
| accessibility ip | 4 |  |

**Judge independence:**

> This judge is a different model family and a fresh context: it saw only the judge prompt, the rubric and the lesson. It did not direct the project and did not author anything in it. It is still a language model scoring a language model's output, so the label applies: not human QA.

**Mean 3.38 is below 4.0.**

Judge's summary:

> Five criteria at 3 and three at 4; mean 3.375 with nothing below the floor. The structural bones are fine — alignment holds and L2 is genuine practice rather than L1-plus-a-question — but the acting blocks are thin: a two-step worked example with generic 'why', a frictionless scenario, and one knowledge check with throwaway distractors. The Arabic is serviceable but calqued in a phrase the lesson repeats constantly, and the job tip is a copy-paste of prose the learner has already read.

The pipeline retries once with this report appended to the prompt, then stops for a human decision.
