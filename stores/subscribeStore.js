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
      
      // Update the user plan in authStore instantly
      if (authStore.user) {
        authStore.user.plan = data.plan;
      }
      
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to subscribe to plan";
      console.error("[subscribeStore] Error subscribing to plan:", err);
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
