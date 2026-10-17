/**
 * Social sign-in availability.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THERE IS NO GOOGLE OAUTH IN THIS CODEBASE YET.
 *
 * Backend/src/routes/auth/index.js exposes exactly four routes — register,
 * login, refresh, logout — all email + password. There is no OAuth provider, no
 * `googleId`/`provider` column on User in prisma/schema.prisma, and no callback
 * handler. So the button is built and styled but stays switched OFF: shipping a
 * "Continue with Google" button that 404s is worse than not offering it, and
 * it is the kind of thing that gets clicked first and trusted least after.
 *
 * TO TURN IT ON you need all of these, in this order:
 *   1. Google Cloud console: create an OAuth 2.0 Client ID (Web application),
 *      add the authorised redirect URI, e.g. https://api.invokita.my/api/auth/google/callback
 *   2. Env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET on the backend.
 *   3. Prisma: add `provider String @default("password")` and
 *      `googleId String? @unique` to User, and make `password` nullable —
 *      an OAuth account has no password. Migrate.
 *   4. Backend: GET /auth/google (redirect to Google) and
 *      GET /auth/google/callback (exchange code, find-or-create the user, issue
 *      the same access/refresh pair the password flow issues so nothing
 *      downstream changes).
 *   5. Account linking: decide what happens when a Google email matches an
 *      existing password account. Silently linking is the friendly option and
 *      is safe ONLY if you trust Google's verified-email claim — check
 *      `email_verified` on the ID token before linking, or you have an account
 *      takeover vector.
 *   6. Flip SOCIAL_AUTH_ENABLED to true and set GOOGLE_AUTH_URL below.
 *
 * Once (1)-(5) exist this file is the only frontend change required.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SOCIAL_AUTH_ENABLED = false

/** Where the "Continue with Google" button points once the backend exists. */
export const GOOGLE_AUTH_URL = '/api/auth/google'

export function useSocialAuth() {
  const config = useRuntimeConfig()
  return {
    enabled: SOCIAL_AUTH_ENABLED,
    googleUrl: `${config.public.apiBase}${GOOGLE_AUTH_URL}`,
  }
}
