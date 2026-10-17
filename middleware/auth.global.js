import { isProtectedRoute } from "~/utils/routeAccess";

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.prerender) return;

  const authStore = useAuthStore();

  // 🔥 Always sync first
  authStore.syncFromCookies();

  const path = to.path;

  // NOTE: this is a GLOBAL middleware. Nuxt does not reliably hot-reload it —
  // restart the dev server after changing this file or the change won't apply.

  // Routes are PUBLIC unless they are explicitly protected. This used to be an
  // allowlist of public paths, which meant every new marketing page (like the
  // Bahasa Malaysia landing at /ms) was login-walled until someone remembered
  // to add it. See utils/routeAccess.ts.
  const isProtected = isProtectedRoute(path);

  // 🔥 Try cookie first (SSR)
  let cookieToken = useCookie("accessToken").value;

  if (process.server && !cookieToken) {
    const headers = useRequestHeaders(["cookie"]);
    const cookieHeader = headers.cookie || "";
    const match = cookieHeader.match(
      new RegExp("(^|;)\\s*accessToken\\s*=\\s*([^;]+)"),
    );
    if (match) cookieToken = match[2];
  }

  // 🔥 FALLBACK to store (this is the key fix)
  const storeToken = authStore.accessToken;

  const isAuthenticated = !!(cookieToken || storeToken);

  // 🚫 Protect routes
  if (!isAuthenticated && isProtected) {
    return navigateTo("/login");
  }

  // 🔁 Redirect away from auth pages
  if (isAuthenticated && (path === "/login" || path === "/register")) {
    return navigateTo("/dashboard");
  }

  // ✅ Onboarding logic (safe now)
  if (isAuthenticated) {
    const isCompleted = authStore.user?.onboardingCompleted === true;
    const isOnboarding = path === "/onboarding" || path === "/onboarding/";

    // Only nudge into onboarding from inside the app. Doing it on a public page
    // would hijack a marketing visit for a signed-in reader.
    if (!isCompleted && !isOnboarding && isProtected) {
      return navigateTo("/onboarding");
    }

    if (isCompleted && isOnboarding) {
      return navigateTo("/dashboard");
    }
  }
});
