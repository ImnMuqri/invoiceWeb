import { defineStore } from "pinia";

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({
    stats: {
      totalRevenue: 0,
      outstandingAmount: 0,
      overdueCount: 0,
      activeClients: 0,
    },
    recentInvoices: [],
    topClients: [],
    cashflow: {
      history: [],
      forecast: [],
    },
    loading: false,
    error: null,
  }),
  actions: {
    async fetchDashboardData() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const { data } = await $api.get("/dashboard");
        this.stats = data.stats;
        this.recentInvoices = data.recentInvoices;
        this.topClients = data.topClients;
        this.cashflow = data.cashflow;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("Dashboard Fetch Error:", err);
      } finally {
        this.loading = false;
      }
    },
  },
});
