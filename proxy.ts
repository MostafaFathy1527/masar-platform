import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Next 16 renamed the "middleware" file convention to "proxy".
export default createMiddleware(routing)

export const config = {
  // Run on everything except API routes, Next internals, and any path with a
  // file extension. The backslash before the dot must survive into the regex,
  // so it is escaped for the string literal too: '\\.' -> \. in the pattern.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
}
