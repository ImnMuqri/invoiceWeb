import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./authStore";

export const useSubscribeStore = defineStore("subscribe", () => {
  const loading = ref(false);
  const error = ref(null);

  /**
   * Subscribes the user to a specific plan
   * @param {string} plan - The plan name (FREE, PRO, MAX)
   * @returns {Promise<Object>} The response data
   */
  async function subscribe(plan) {
    const { $api } = useNuxtApp();
    const authStore = useAuthStore();
    
    loading.value = true;
    error.value = null;
    
    try {
      const { data } = await $api.post("/users/subscribe", { plan });
      
      if (data.checkoutUrl) {
        // Return without updating the store so the UI doesn't glitch while redirecting
        return data;
      } else if (authStore.user) {
        // Upgrade/downgrade instant success without checkout
        authStore.user.plan = data.plan;
      }
      
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to subscribe to plan";

      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    subscribe,
  };
});
