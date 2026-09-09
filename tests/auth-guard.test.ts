import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function walk(dir: string): string[] {
  let out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out = out.concat(walk(full))
    else if (/\.tsx?$/.test(entry)) out.push(full)
  }
  return out
}

/*
 * A JWT session outlives the row it describes. After an account is deleted the
 * cookie stays cryptographically valid, so `session.user.id` alone identifies a
 * user who no longer exists — a deleted learner could call the data-export
 * endpoint and receive a 200. The same applies to `session.user.role`, which
 * carries whatever the role was at sign-in rather than what it is now.
 *
 * Every authorization decision therefore goes through requireUser/requireAdmin,
 * which resolve the row. This test stops the shortcut coming back.
 */
describe('authorization reads the database, not just the token', () => {
  const files = walk('app').filter((f) => !f.includes('node_modules'))

  it('finds route and page files to check', () => {
    expect(files.length).toBeGreaterThan(5)
  })

  it('no route or page trusts session.user.id or .role directly', () => {
    const offenders = files.filter((f) => {
      const src = readFileSync(f, 'utf-8')
      return /session\?\.user\?\.(id|role)/.test(src) || /session\.user\.(id|role)/.test(src)
    })
    expect(
      offenders,
      'these read identity from the token; use requireUser()/requireAdmin() instead',
    ).toEqual([])
  })

  it('the guard actually re-reads the user row', () => {
    const guard = readFileSync('lib/auth-guard.ts', 'utf-8')
    expect(guard).toContain('findUnique')
    // An inactive account must not authenticate either.
    expect(guard).toContain('isActive')
  })
})
