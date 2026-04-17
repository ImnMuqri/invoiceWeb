export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.prerender) return;

  const authStore = useAuthStore();

  // 🔥 Always sync first
  authStore.syncFromCookies();

  const path = to.path;

  const publicRoutes = ["/login", "/register", "/", "/pay", "/legal"];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      path === route ||
      (route !== "/" && path === route + "/") ||
      path.startsWith("/pay/") ||
      path.startsWith("/legal/") ||
      (path.startsWith("/invoices/") && path.endsWith("/export")) ||
      to.name === "pay-id",
  );

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
  if (!isAuthenticated && !isPublicRoute) {
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

    if (!isCompleted && !isOnboarding && !isPublicRoute) {
      return navigateTo("/onboarding");
    }

    if (isCompleted && isOnboarding) {
      return navigateTo("/dashboard");
    }
  }
});
