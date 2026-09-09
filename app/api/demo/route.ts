import { randomBytes, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { signIn } from '@/auth'
import { getDb } from '@/lib/db'
import { hashPassword } from '@/lib/passwords'

// One-click guest entry. Creates a throwaway learner, enrols them, and signs
// them in — no signup form, no email verification, nothing between a reviewer
// and the product.
//
// Practice before reading (SPEC.md section 7): the guest lands directly in the
// claim-review workbench with the reviewer tour banner, not on a marketing page.
// Unprefixed on purpose — the locale proxy adds the right prefix, so this works
// for both locales without hard-coding one.
const DESTINATION = '/practice/claim-review?tour=1'

export async function POST(req: Request) {
  const db = getDb()

  // A password is required by the credentials provider but is never shown to
  // anyone: the guest is signed in programmatically in the same request.
  const password = randomBytes(24).toString('base64url')
  const email = `guest-${randomUUID()}@demo.invalid`

  const user = await db.user.create({
    data: {
      email,
      name: 'Guest',
      passwordHash: await hashPassword(password),
      isDemo: true,
      emailVerifiedAt: new Date(),
    },
  })

  // Enrol in the demo course if one is published yet. In Week 1 there is no
  // course, and a guest with no enrolment is still a valid guest — so this is
  // deliberately not an error.
  const course = await db.course.findFirst({
    where: { status: 'PUBLISHED' },
    select: { id: true },
  })
  if (course) {
    await db.enrollment.create({
      data: { userId: user.id, courseId: course.id, source: 'GUEST_DEMO' },
    })
  }

  await signIn('credentials', { email, password, redirect: false })
  // Resolve against the incoming request so this works on any host without
  // a hard-coded origin. 303 so the browser follows with GET.
  return NextResponse.redirect(new URL(DESTINATION, req.url), 303)
}

// A bare GET would let any crawler create guest rows. Entry is a POST.
export function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 })
}
