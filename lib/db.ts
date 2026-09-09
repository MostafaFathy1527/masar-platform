import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Prisma 7 requires a driver adapter; the connection string no longer lives in
// schema.prisma. @prisma/adapter-pg speaks standard Postgres, so the same code
// runs against Neon and against a local database, and `pg_dump` is unchanged.

const createClient = () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set (see .env.example)')
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
}

// Reuse across hot reloads in dev, or every save leaks a connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

/**
 * Lazy on purpose. A build with no DATABASE_URL — a Vercel preview, or CI —
 * must not fail merely because this module was imported by a page that never
 * queries. The error surfaces on first use instead.
 */
export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const client = createClient()
    if (process.env.NODE_ENV === 'production') return client
    globalForPrisma.prisma = client
  }
  return globalForPrisma.prisma
}
