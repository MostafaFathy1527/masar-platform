import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Prisma 7 no longer reads `url` from schema.prisma, and no longer loads .env
// on its own — hence the dotenv import above. The runtime client does not use
// this file; it gets a driver adapter in lib/db.ts.
//
// The datasource is assembled conditionally rather than with prisma/config's
// `env()` helper, which throws on a missing variable. `prisma generate` runs
// during the build and needs no database, so throwing there would fail a
// deployment for a variable that step never uses.
const url = process.env.DATABASE_URL
const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    ...(url ? { url } : {}),
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
})
