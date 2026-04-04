export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  const path = to.path;

  const publicRoutes = ["/login", "/register", "/", "/pay"];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      path === route ||
      path === route + "/" ||
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

  const isAuthenticated = !!(authStore.accessToken || cookieToken);

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
