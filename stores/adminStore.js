import { defineStore } from "pinia";
import { ref } from "vue";

export const useAdminStore = defineStore("admin", () => {
  const users = ref([]);
  const stats = ref(null);
  const analytics = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchUsers() {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.get("/admin/users");
      users.value = data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStats() {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.get("/admin/stats");
      stats.value = data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAnalytics() {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.get("/analytics");
      analytics.value = data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(id, payload) {
    const { $api } = useNuxtApp();
    try {
      await $api.patch(`/admin/users/${id}`, payload);
      await fetchUsers();
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      return false;
    }
  }

  async function deleteUser(id) {
    const { $api } = useNuxtApp();
    try {
      await $api.delete(`/admin/users/${id}`);
      await fetchUsers();
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      return false;
    }
  }

  return {
    users,
    stats,
    analytics,
    loading,
    error,
    fetchUsers,
    fetchStats,
    fetchAnalytics,
    updateUser,
    deleteUser
  };
});
