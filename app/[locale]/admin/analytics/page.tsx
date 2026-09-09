import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { requireAdmin } from '@/lib/auth-guard'
import { getDb } from '@/lib/db'
import type { AppLocale } from '@/i18n/routing'

export const dynamic = 'force-dynamic'

/*
 * Read-only. v1.0 ships no admin writes at all, so there is no CRUD surface to
 * protect — only this view.
 *
 * Authorization is enforced here, server-side, which is the check that actually
 * protects the data. The project rules also asks for a middleware check; that is
 * NOT in place, because the proxy runs on the edge and this project's auth
 * config imports Prisma, which is not edge-safe. Rather than add a cookie-
 * presence check in the proxy that looks like authorization without being it,
 * the gap is recorded in docs/STATUS.md. A non-admin reaching this route gets a
 * 404, not a 403: an admin route should not confirm its own existence.
 */

const COPY = {
  ar: {
    title: 'التحليلات',
    lead: 'يجيب كل جدول عن سؤال تعليمي محدد. لا توجد مقاييس مظهرية ولا تسلسلات ولا لوحات صدارة.',
    q1: 'هل يغطي بنك الأسئلة كل هدف؟',
    q2: 'أين يخفق المتعلمون؟',
    q3: 'ما حجم النشاط حتى الآن؟',
    objective: 'الهدف',
    live: 'أسئلة منشورة',
    formative: 'أسئلة تفاعلية',
    attempts: 'محاولات',
    correct: 'نسبة الصواب',
    metric: 'المؤشر',
    value: 'القيمة',
    noData: 'لا توجد بيانات كافية بعد.',
    caveat:
      'إحصاءات الأسئلة تحتاج نحو 20 محاولة أولى لكل سؤال قبل أن تعني شيئًا. الأرقام هنا من الاستخدام الفعلي لهذا العرض، وهي قليلة عمدًا وليست دلالة قياسية.',
  },
  en: {
    title: 'Analytics',
    lead: 'Every table answers a stated learning question. No vanity metrics, no streaks, no leaderboards.',
    q1: 'Does the item bank cover every objective?',
    q2: 'Where are learners going wrong?',
    q3: 'How much activity is there so far?',
    objective: 'Objective',
    live: 'Live items',
    formative: 'Knowledge checks',
    attempts: 'Attempts',
    correct: 'Correct rate',
    metric: 'Metric',
    value: 'Value',
    noData: 'Not enough data yet.',
    caveat:
      'Item statistics need roughly 20 first attempts per item before they mean anything. These numbers come from real use of this demo, are deliberately sparse, and carry no psychometric significance.',
  },
} as const

export default async function AdminAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as AppLocale
  const t = COPY[l] ?? COPY.ar

  // Role is read from the row, not from the token: a demoted admin loses
  // access at the next request rather than at their next sign-in.
  if (!(await requireAdmin())) notFound()

  const db = getDb()

  const byObjective = await db.item.groupBy({
    by: ['objectiveId', 'formative'],
    _count: true,
    orderBy: { objectiveId: 'asc' },
  })
  const objectives = [...new Set(byObjective.map((r) => r.objectiveId))].sort()

  const answers = await db.attemptAnswer.findMany({
    include: { item: { select: { objectiveId: true } } },
  })
  const perf = new Map<string, { n: number; correct: number }>()
  for (const a of answers) {
    const g = perf.get(a.item.objectiveId) ?? { n: 0, correct: 0 }
    g.n += 1
    if (a.isCorrect) g.correct += 1
    perf.set(a.item.objectiveId, g)
  }

  const [attempts, submissions, certificates] = await Promise.all([
    db.attempt.count(),
    db.simSubmission.count(),
    db.certificate.count(),
  ])

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{t.lead}</p>

      <h2 className="admin-q">{t.q1}</h2>
      <div className="block-table-scroll">
        <table className="block-table">
          <tbody>
            <tr>
              <th scope="col">{t.objective}</th>
              <th scope="col">{t.live}</th>
              <th scope="col">{t.formative}</th>
            </tr>
            {objectives.map((o) => (
              <tr key={o}>
                <th scope="row">{o}</th>
                <td>{byObjective.find((r) => r.objectiveId === o && !r.formative)?._count ?? 0}</td>
                <td>{byObjective.find((r) => r.objectiveId === o && r.formative)?._count ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="admin-q">{t.q2}</h2>
      {perf.size === 0 ? (
        <p className="text-muted">{t.noData}</p>
      ) : (
        <div className="block-table-scroll">
          <table className="block-table">
            <tbody>
              <tr>
                <th scope="col">{t.objective}</th>
                <th scope="col">{t.attempts}</th>
                <th scope="col">{t.correct}</th>
              </tr>
              {[...perf.entries()]
                .sort((a, b) => a[1].correct / a[1].n - b[1].correct / b[1].n)
                .map(([o, g]) => (
                  <tr key={o}>
                    <th scope="row">{o}</th>
                    <td>{g.n}</td>
                    <td>{Math.round((g.correct / g.n) * 100)}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="admin-q">{t.q3}</h2>
      <div className="block-table-scroll">
        <table className="block-table">
          <tbody>
            <tr>
              <th scope="col">{t.metric}</th>
              <th scope="col">{t.value}</th>
            </tr>
            <tr>
              <th scope="row">{t.attempts}</th>
              <td>{attempts}</td>
            </tr>
            <tr>
              <th scope="row">Simulation submissions</th>
              <td>{submissions}</td>
            </tr>
            <tr>
              <th scope="row">Certificates issued</th>
              <td>{certificates}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* The caveat is part of the screen, not a footnote in a case study. */}
      <p className="admin-caveat">{t.caveat}</p>
    </div>
  )
}
