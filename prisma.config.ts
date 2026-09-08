import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Prisma 7 no longer reads `url` from schema.prisma, and no longer loads .env
// on its own — hence the dotenv import above. The runtime client does not use
// this file; it gets a driver adapter in lib/db.ts.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: { url: env('DATABASE_URL') },
  migrations: { path: 'prisma/migrations' },
})
