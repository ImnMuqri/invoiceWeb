export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Ensure store is synced with cookies on every route change
  const hasToken = authStore.syncFromCookies();

  // Normalize path to ignore trailing slashes
  const normalizedPath = to.path.replace(/\/$/, "") || "/";

  const publicRoutes = ["/login", "/register", "/", "/pay"];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      normalizedPath === route ||
      normalizedPath.startsWith("/pay/") ||
      (normalizedPath.startsWith("/invoices/") &&
        normalizedPath.endsWith("/export")) ||
      normalizedPath === "/pay" ||
      to.name === "pay-id",
  );

  // Use either the store token or the direct cookie check to prevent refresh-to-login flickering
  const isAuthenticated = hasToken || !!authStore.accessToken;

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo("/login");
  }

  // Enforce onboarding
  if (isAuthenticated) {
    const isCompleted = authStore.user?.onboardingCompleted === true;
    if (!isCompleted && normalizedPath !== "/onboarding" && !isPublicRoute) {
      return navigateTo("/onboarding");
    }

    // Don't let completed users go back to onboarding
    if (isCompleted && normalizedPath === "/onboarding") {
      return navigateTo("/dashboard");
    }
  }
});
