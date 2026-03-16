export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Ensure store is synced with cookies on every route change
  authStore.syncFromCookies();

  // Normalize path to ignore trailing slashes
  const normalizedPath = to.path.replace(/\/$/, "") || "/";

  const publicRoutes = ["/login", "/register", "/", "/pay"];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      normalizedPath === route ||
      normalizedPath.startsWith("/pay/") ||
      (normalizedPath.startsWith("/invoices/") && normalizedPath.endsWith("/export")) ||
      normalizedPath === "/pay" ||
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
    // Only redirect to login on the client and ONLY after we are certain hydration/LS check is done
    if (process.client && authStore.isHydrated) {
      return navigateTo("/login");
    }
    // If we are on the server or not hydrated yet, we stay silent and let the client handle it
    return;
  }

  // If user is authenticated and trying to access login/register
  if (isAuthenticated && (to.path === "/login" || to.path === "/register")) {
    return navigateTo("/dashboard");
  }
});
