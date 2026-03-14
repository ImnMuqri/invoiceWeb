export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  
  // Wait for auth to be ready
  if (!authStore.isReady) {
    // In SSR, authStore might already be hydrated or we need to wait
    authStore.syncFromCookies();
  }

  if (!authStore.isAdmin) {

    return navigateTo("/dashboard");
  }
});
