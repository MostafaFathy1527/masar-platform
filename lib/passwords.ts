import bcrypt from 'bcryptjs'

// Cost 12: a deliberate choice, not a default. Cheap enough for a serverless
// request, expensive enough that a leaked hash is not trivially reversed.
const COST = 12

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST)
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
