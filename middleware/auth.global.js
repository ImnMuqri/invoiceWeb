export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Ensure store is synced with cookies on every route change
  authStore.syncFromCookies();

  const publicRoutes = ["/login", "/register", "/", "/pay"];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      to.path === route ||
      to.path.startsWith("/pay/") ||
      (to.path.startsWith("/invoices/") && to.path.endsWith("/export")) ||
      to.path === "/pay" ||
      to.name === "pay-id",
  );

  // On client, wait for hydration if needed
  if (process.client && !authStore.isHydrated) {
    // We don't return here because we want the rest of the logic to run
    // but we need to be careful. Actually, syncFromCookies is immediate.
  }

  const isAuthenticated = !!authStore.accessToken;

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    // One last check on client: if we aren't hydrated yet, don't kick out
    if (process.client && !authStore.isHydrated) {
      return;
    }
    return navigateTo("/login");
  }

  // If user is authenticated and trying to access login/register
  if (isAuthenticated && (to.path === "/login" || to.path === "/register")) {
    return navigateTo("/dashboard");
  }
});
