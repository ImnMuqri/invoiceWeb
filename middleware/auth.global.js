export default defineNuxtRouteMiddleware(async (to, from) => {
  // 🚀 SKIP during prerendering to avoid generating static meta-refresh redirects
  if (import.meta.prerender) return;

  const authStore = useAuthStore();

  // 🔥 Always sync first
  authStore.syncFromCookies();

  const path = to.path;

  const publicRoutes = ["/login", "/register", "/", "/pay"];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      path === route ||
      (route !== "/" && path === route + "/") ||
      path.startsWith("/pay/") ||
      (path.startsWith("/invoices/") && path.endsWith("/export")) ||
      to.name === "pay-id",
  );

  // 🔥 SSR-safe cookie check
  let cookieToken = useCookie("accessToken").value;

  if (process.server && !cookieToken) {
    const headers = useRequestHeaders(["cookie"]);
    const cookieHeader = headers.cookie || "";
    const match = cookieHeader.match(
      new RegExp("(^|;)\\s*accessToken\\s*=\\s*([^;]+)"),
    );
    if (match) cookieToken = match[2];
  }

  const isAuthenticated = !!cookieToken;

  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo("/login");
  }

  if (isAuthenticated) {
    const isCompleted = authStore.user?.onboardingCompleted === true;
    const isOnboarding = path === "/onboarding" || path === "/onboarding/";

    if (!isCompleted && !isOnboarding && !isPublicRoute) {
      return navigateTo("/onboarding");
    }

    if (isCompleted && isOnboarding) {
      return navigateTo("/dashboard");
    }
  }
});
