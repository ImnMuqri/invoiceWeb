export default defineNuxtRouteMiddleware(async (to, from) => {
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

  // 🔥 SSR-safe cookie check ONLY
  let cookieToken = useCookie("accessToken").value;

  if (process.server && !cookieToken) {
    const headers = useRequestHeaders(["cookie"]);
    if (headers.cookie) {
      const match = headers.cookie.match(/accessToken=([^;]+)/);
      if (match) cookieToken = match[1];
    }
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
