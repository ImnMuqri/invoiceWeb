export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  
  // Wait for auth to be hydrated if physically in a client environment
  if (process.client && !authStore.isHydrated) {
    // A small wait to ensure Pinia persisted state is loaded
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (!authStore.isAdmin) {
    return navigateTo("/dashboard");
  }
});
