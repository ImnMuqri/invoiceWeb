/**
 * Single source of truth for "can a logged-out visitor be on this page?"
 *
 * There were three separate answers to this question before, and they disagreed:
 *   1. middleware/auth.global.js  — an allowlist of public paths
 *   2. plugins/axios.js           — exempted only /login and /register
 *   3. stores/authStore.js        — exempted nothing at all
 *
 * Any of the three could eject a visitor to /login. (2) and (3) fire on a failed
 * token refresh, which means a visitor with an expired session could be thrown
 * off a public marketing page mid-read — and because it is a hard
 * window.location assignment, it looks exactly like the page "routing to login".
 *
 * The list is now inverted: routes are PUBLIC unless they match a protected
 * prefix. Adding a marketing page can never again require touching auth code.
 */

/** Everything behind the login wall. Prefix match. */
export const PROTECTED_PREFIXES = [
  '/dashboard',
  '/invoices',
  '/quotes',
  '/recurring',
  '/clients',
  '/catalogue',
  '/business',
  '/notifications',
  '/exports',
  '/settings',
  '/admin',
  '/onboarding',
  '/referral-management',
] as const

/* NOTE FOR WHOEVER ADDS THE NEXT MODULE.
   The inversion above — public unless listed — is right for marketing pages and
   wrong to forget for app pages. Quotations, Recurring, Catalogue, Business and
   Notifications were all shipped without being added here, so each was reachable
   logged out: no redirect to login, just a page that renders its shell and fails
   every API call. Add the prefix in the same commit as the module. */

/** Public invoice export links are reachable without a session. */
const PROTECTED_EXCEPTIONS = [
  (path: string) => path.startsWith('/invoices/') && path.endsWith('/export'),
]

function normalise(path: string) {
  // Treat "/ms" and "/ms/" as the same route; hosts differ on trailing slashes.
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
  return path
}

/** True when the path requires an authenticated session. */
export function isProtectedRoute(pathname: string): boolean {
  const path = normalise(pathname)
  if (PROTECTED_EXCEPTIONS.some((fn) => fn(path))) return false
  return PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix + '/')
  )
}

/** True when a logged-out visitor is welcome — the inverse, stated positively. */
export function isPublicRoute(pathname: string): boolean {
  return !isProtectedRoute(pathname)
}

/**
 * Guard for the two hard `window.location.href = "/login"` redirects.
 * A public page must never bounce its visitor to the login screen just because
 * a stale token failed to refresh in the background.
 */
export function shouldRedirectToLogin(pathname: string): boolean {
  return isProtectedRoute(pathname)
}
