export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Ensure store is synced with cookies on every route change
  authStore.syncFromCookies();

  const publicRoutes = ["/login", "/register", "/", "/pay"];
  const isPublicRoute = publicRoutes.some(
    (route) => to.path === route || to.path.startsWith("/pay/"),
  );

  const isAuthenticated = !!authStore.accessToken;

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo("/login");
  }

  // If user is authenticated and trying to access login/register
  if (isAuthenticated && (to.path === "/login" || to.path === "/register")) {
    return navigateTo("/dashboard");
  }
});
