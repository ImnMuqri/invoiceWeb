import { defineStore } from "pinia";
import { ref } from "vue";

export const useAdminStore = defineStore("admin", () => {
  const users = ref([]);
  const stats = ref(null);
  const analytics = ref(null);
  const transactions = ref([]);
  const plans = ref([]);
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

  async function fetchMonthlyRevenue(month, year) {
    const { $api } = useNuxtApp();
    try {
      const { data } = await $api.get("/analytics/monthly", {
        params: { month, year },
      });
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      return null;
    }
  }

  async function fetchTransactions() {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.get("/admin/transactions");
      transactions.value = data;
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

  async function cancelSubscription(id) {
    const { $api } = useNuxtApp();
    try {
      await $api.post(`/admin/users/${id}/cancel-subscription`);
      await fetchUsers();
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      return false;
    }
  }

  async function fetchPlans() {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.get("/admin/plans");
      plans.value = data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  }

  async function createPlan(payload) {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      await $api.post("/admin/plans", payload);
      await fetchPlans();
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function updatePlan(id, payload) {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      await $api.put(`/admin/plans/${id}`, payload);
      await fetchPlans();
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function deletePlan(id) {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      await $api.delete(`/admin/plans/${id}`);
      await fetchPlans();
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    users,
    stats,
    analytics,
    transactions,
    plans,
    loading,
    error,
    fetchUsers,
    fetchStats,
    fetchAnalytics,
    fetchMonthlyRevenue,
    fetchTransactions,
    deleteUser,
    cancelSubscription,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    updateUser,
  };
});
