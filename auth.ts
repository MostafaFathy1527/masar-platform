import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { verifyPassword } from '@/lib/passwords'

// Credentials + JWT, with no database session tables. Chosen so a reviewer
// never meets an OAuth consent screen between themselves and the product.

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = CredentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const user = await getDb().user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        })
        // Same null for "no such user" and "wrong password": never reveal
        // which addresses exist.
        if (!user || !user.isActive) return null
        if (!(await verifyPassword(parsed.data.password, user.passwordHash))) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isDemo: user.isDemo,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // Only on sign-in; afterwards the claims are already on the token.
      if (user) {
        token.role = user.role
        token.isDemo = user.isDemo
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ''
        session.user.role = token.role
        session.user.isDemo = token.isDemo
      }
      return session
    },
  },
})
