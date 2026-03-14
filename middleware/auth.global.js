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

  const isAuthenticated = !!authStore.accessToken;
  // Reduced logging to avoid terminal clutter, but kept essential for debugging


  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo("/login");
  }

  // If user is authenticated and trying to access login/register
  if (isAuthenticated && (to.path === "/login" || to.path === "/register")) {
    return navigateTo("/dashboard");
  }
});
