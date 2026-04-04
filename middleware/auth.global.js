export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Normalize path to ignore trailing slashes
  const normalizedPath = to.path.replace(/\/$/, "") || "/";

  const publicRoutes = ["/login", "/register", "/", "/pay"];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      normalizedPath === route ||
      normalizedPath.startsWith("/pay/") ||
      (normalizedPath.startsWith("/invoices/") &&
        normalizedPath.endsWith("/export")) ||
      to.name === "pay-id",
  );

  // Authentication status check
  // Uses store token (client/server sync) or direct cookie (SSR safety)
  const isAuthenticated = !!(
    authStore.accessToken || useCookie("accessToken").value
  );

  // Protected route check
  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo("/login");
  }

  // Onboarding enforcement
  if (isAuthenticated) {
    const isCompleted = authStore.user?.onboardingCompleted === true;
    if (!isCompleted && normalizedPath !== "/onboarding" && !isPublicRoute) {
      return navigateTo("/onboarding");
    }

    // Redirect away from onboarding if already completed
    if (isCompleted && normalizedPath === "/onboarding") {
      return navigateTo("/dashboard");
    }
  }
});
