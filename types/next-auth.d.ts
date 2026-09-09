import type { Role } from '@prisma/client'
import type { DefaultSession } from 'next-auth'
// The import is what activates the module augmentation below; without it
// TypeScript treats the declare block as a new ambient module and token.role
// stays `unknown`.
import type { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: Role; isDemo: boolean } & DefaultSession['user']
  }
  interface User {
    role: Role
    isDemo: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
    isDemo: boolean
  }
}

export type { JWT }
