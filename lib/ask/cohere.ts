import type { Passage } from './passages'

/**
 * "Ask the lesson": find the passages that bear on a learner's question, then have
 * a model answer from those passages only, citing them.
 *
 * Two calls to Cohere's own API. Rerank scores every passage of the lesson against
 * the question (a lesson is a few dozen passages, so there is no index to keep and
 * nothing to fall out of date when the content changes). If no passage clears the
 * floor, the lesson does not cover the question and the model is never called.
 * Otherwise Command A+ answers from the passages it was handed, and marks each
 * sentence with the id of the block it came from, so the reader can scroll to it.
 *
 * Why markers in the text rather than the chat API's own citations: with reasoning
 * switched on, Command A+ returns no citation spans, and with it switched off its
 * reasoning leaks into the answer. A short reasoning budget and markers parsed here
 * gave clean answers on every lesson tried.
 */

export const RERANK_MODEL = 'rerank-v5.0-fast'
export const ANSWER_MODEL = 'command-a-plus-05-2026'
/** Passages handed to the model. Enough for a question that spans two blocks. */
export const TOP_K = 5
/**
 * Below this rerank score a passage is not about the question. Off-topic questions
 * scored 0.001 to 0.003 on every lesson; an on-topic Egyptian-Arabic question scored
 * 0.097 against its best passage. The floor sits well between the two, and the model
 * still says so when the passages it is handed do not answer.
 */
export const RELEVANCE_FLOOR = 0.03
const THINKING_BUDGET = 1500

const API = 'https://api.cohere.com/v2'

export type Answer =
  | { kind: 'answer'; text: string; cites: string[] }
  | { kind: 'not_covered' }

export const SYSTEM = `You answer a learner's question inside a training lesson, from the lesson passages below and nothing else.
- Each passage starts with its id in square brackets. At the end of every sentence that uses a passage, write that passage's id in square brackets, exactly as given, e.g. [b1_intro].
- If the passages do not answer the question, say in one sentence that this lesson does not cover it, and do not guess.
- Answer in the language and dialect of the question, in three to five short sentences. Call the passages "the lesson", never "the documents".
- Never say which option, answer or decision in one of the lesson's exercises is correct, best or right, and never say what the learner should choose there, even if you can work it out. Explain the rule that decides it and stop there, so the learner makes the choice.
- Every code and organisation in the lesson is fictional. Give no medical, legal or billing advice.`

async function post(path: string, key: string, body: unknown, signal?: AbortSignal) {
  const res = await fetch(`${API}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) throw new Error(`cohere ${path} ${res.status}`)
  return res.json()
}

export async function rerank(question: string, passages: Passage[], key: string, signal?: AbortSignal) {
  const r = await post(
    'rerank',
    key,
    { model: RERANK_MODEL, query: question, documents: passages.map((p) => p.text), top_n: TOP_K },
    signal,
  )
  return (r.results as { index: number; relevance_score: number }[]).map((x) => ({
    passage: passages[x.index],
    score: x.relevance_score,
  }))
}

/**
 * Pull the [blockId] markers out of an answer. Only ids that were handed to the
 * model count; anything else in brackets is left in the text, since a model that
 * invents an id must not produce a link to nowhere.
 */
export function readCitations(raw: string, known: Iterable<string>): { text: string; cites: string[] } {
  const ids = new Set(known)
  const cites: string[] = []
  const text = raw
    .replace(/\s*\[([A-Za-z0-9_-]{1,64})\]/g, (whole, id: string) => {
      if (!ids.has(id)) return whole
      if (!cites.includes(id)) cites.push(id)
      return ''
    })
    .replace(/[ \t]+\n/g, '\n')
    .trim()
  return { text, cites }
}

export async function askLesson(
  question: string,
  passages: Passage[],
  key: string,
  signal?: AbortSignal,
): Promise<Answer> {
  const ranked = (await rerank(question, passages, key, signal)).filter((x) => x.score >= RELEVANCE_FLOOR)
  if (ranked.length === 0) return { kind: 'not_covered' }

  const context = ranked.map((x) => `[${x.passage.blockId}]\n${x.passage.text}`).join('\n\n')
  const r = await post(
    'chat',
    key,
    {
      model: ANSWER_MODEL,
      messages: [
        { role: 'system', content: `${SYSTEM}\n\nLesson passages:\n\n${context}` },
        { role: 'user', content: question },
      ],
      thinking: { type: 'enabled', token_budget: THINKING_BUDGET },
      temperature: 0,
      max_tokens: THINKING_BUDGET + 800,
    },
    signal,
  )
  const parts = (r.message?.content ?? []) as { type: string; text?: string }[]
  const raw = parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text ?? '')
    .join('')
  const { text, cites } = readCitations(raw, ranked.map((x) => x.passage.blockId))
  if (!text) return { kind: 'not_covered' }
  return { kind: 'answer', text, cites }
}
