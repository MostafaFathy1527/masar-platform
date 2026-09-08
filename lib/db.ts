import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Prisma 7 requires a driver adapter; the connection string no longer lives in
// schema.prisma. @prisma/adapter-pg speaks standard Postgres, so the same code
// runs against Neon and against a local database, and `pg_dump` is unchanged.
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set (see .env.example)')

const createClient = () => new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

// Reuse across hot reloads in dev, or every save leaks a connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> }

export const db = globalForPrisma.prisma ?? createClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
