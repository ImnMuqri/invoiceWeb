export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  const path = to.path;

  if (process.client) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const publicRoutes = ["/login", "/register", "/", "/pay"];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      path === route ||
      (route !== "/" && path === route + "/") ||
      path.startsWith("/pay/") ||
      (path.startsWith("/invoices/") && path.endsWith("/export")) ||
      to.name === "pay-id",
  );

  // Authentication status check
  // Uses store token or direct cookie check for SSR reliability
  let cookieToken = useCookie("accessToken").value;

  // High-reliability check for SSR in production
  if (process.server && !cookieToken) {
    const headers = useRequestHeaders(["cookie"]);
    if (headers.cookie) {
      const match = headers.cookie.match(/accessToken=([^;]+)/);
      if (match) cookieToken = match[1];
    }
  }

  let isAuthenticated = !!(authStore.accessToken || cookieToken);

  // Final catch-all for client-side hydration issues
  if (process.client && !isAuthenticated) {
    const at = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];
    if (at) {
      isAuthenticated = true;
      authStore.syncFromCookies();
    }
  }

  // Protected route check
  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo("/login");
  }

  // Onboarding enforcement
  if (isAuthenticated) {
    const isCompleted = authStore.user?.onboardingCompleted === true;
    const isOnboarding = path === "/onboarding" || path === "/onboarding/";

    if (!isCompleted && !isOnboarding && !isPublicRoute) {
      return navigateTo("/onboarding");
    }

    // Redirect away from onboarding if already completed
    if (isCompleted && isOnboarding) {
      return navigateTo("/dashboard");
    }
  }
});
