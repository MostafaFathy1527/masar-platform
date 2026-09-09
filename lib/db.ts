import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Prisma 7 requires a driver adapter; the connection string no longer lives in
// schema.prisma.
//
// Why the Neon adapter rather than @prisma/adapter-pg: the development machine
// cannot open outbound TCP 5432, so the generic Postgres driver cannot connect
// at all from here. The Neon driver tunnels Postgres over a WebSocket on 443,
// which works both locally and on the host. See HANDOVER.md, Known deviations.
//
// The database itself stays ordinary Postgres — the schema, the data and the
// `pg_dump` export are unchanged, so this is a driver choice, not a lock-in.
// Swapping back to adapter-pg is a few lines if the network changes.

// Node has no global WebSocket in every runtime; the serverless edge does.
if (!neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = ws
}

const createClient = () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set (see .env.example)')
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) })
}

// Reuse across hot reloads in dev, or every save leaks a connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

/**
 * Lazy on purpose. A build with no DATABASE_URL — CI, or a preview deploy —
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
