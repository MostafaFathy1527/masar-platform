import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Prisma 7 no longer reads `url` from schema.prisma, and no longer loads .env
// on its own — hence the dotenv import above. The runtime client does not use
// this file; it gets a driver adapter in lib/db.ts.
//
// shadowDatabaseUrl is optional and only set in CI, where a throwaway Postgres
// service exists. It lets `migrate diff --from-migrations` replay the committed
// migrations and prove they reproduce the datamodel exactly.
const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
  migrations: { path: 'prisma/migrations' },
})
