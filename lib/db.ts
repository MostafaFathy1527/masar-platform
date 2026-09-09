import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Prisma 7 requires a driver adapter; the connection string no longer lives in
// schema.prisma. @prisma/adapter-pg speaks standard Postgres, so the same code
// runs against Neon, against a local database, and against anything else that
// speaks the protocol — which is what keeps `pg_dump` and the ownership story
// meaningful rather than nominal.

const createClient = () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set (see .env.example)')
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
}

// Reuse across hot reloads in dev, or every save leaks a connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

/**
 * Lazy on purpose. A build with no DATABASE_URL — CI, or a preview deploy —
 * must not fail merely because this module was imported by a page that never
 * queries. The error surfaces on first use instead.
 *
 * Note for anyone debugging a connection timeout: a Neon endpoint auto-suspends
 * when idle and takes a few seconds to wake. A first connection can time out
 * while a later one succeeds instantly. That is a cold start, not a firewall.
 */
export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const client = createClient()
    if (process.env.NODE_ENV === 'production') return client
    globalForPrisma.prisma = client
  }
  return globalForPrisma.prisma
}
