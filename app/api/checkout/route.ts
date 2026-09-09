import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/auth-guard'
import { getDb } from '@/lib/db'
import { paymentProvider } from '@/lib/payments/mock'

// Two rules matter more here than anything provider-specific.
//
// The request names a COURSE, never an amount. The price is read from the
// course row, so a client cannot name its own price.
//
// Completion is idempotent on providerRef, which is unique in the database.
// Every real provider retries webhooks, so "the same reference twice" is
// ordinary traffic and must produce one order and one enrolment.

const StartBody = z.object({ courseSlug: z.string().min(1) })
const CompleteBody = z.object({ providerRef: z.string().min(1), paid: z.boolean() })

export async function POST(req: Request) {
  const me = await requireUser()
  if (!me) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const db = getDb()

  // ---- complete ---------------------------------------------------------
  const completion = CompleteBody.safeParse(body)
  if (completion.success) {
    const event = paymentProvider.parseCompletion(completion.data)
    // A reference this adapter never issued is refused rather than trusted.
    if (!event) return NextResponse.json({ error: 'Unrecognised reference' }, { status: 400 })

    const order = await db.order.findUnique({ where: { providerRef: event.providerRef } })
    if (!order || order.userId !== me.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (order.status === 'PAID') {
      // Replay: already settled. Return the same result rather than creating a
      // second enrolment.
      return NextResponse.json({ status: 'PAID', alreadySettled: true })
    }

    if (!event.paid) {
      await db.order.update({ where: { id: order.id }, data: { status: 'FAILED' } })
      return NextResponse.json({ status: 'FAILED' })
    }

    await db.$transaction([
      db.order.update({ where: { id: order.id }, data: { status: 'PAID' } }),
      db.enrollment.upsert({
        where: { userId_courseId: { userId: me.id, courseId: order.courseId } },
        update: {},
        create: { userId: me.id, courseId: order.courseId, source: 'PURCHASE' },
      }),
    ])
    return NextResponse.json({ status: 'PAID', alreadySettled: false })
  }

  // ---- start ------------------------------------------------------------
  const start = StartBody.safeParse(body)
  if (!start.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const course = await db.course.findUnique({ where: { slug: start.data.courseSlug } })
  if (!course) return NextResponse.json({ error: 'Unknown course' }, { status: 404 })

  // Price from the course row. The caller does not get a say.
  const session = paymentProvider.createCheckout(
    { userId: me.id, courseId: course.id, locale: 'en' },
    course.priceEgp,
    'EGP',
  )

  await db.order.create({
    data: {
      userId: me.id,
      courseId: course.id,
      provider: 'MOCK',
      providerRef: session.providerRef,
      amountMinor: session.amountMinor,
      currency: session.currency,
      status: 'PENDING',
      isSandbox: session.isSandbox,
    },
  })

  return NextResponse.json(session)
}
