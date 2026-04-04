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
  // Directly check cookies for SSR reliability
  const cookieToken = useCookie("accessToken").value;
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
