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
    insights: [],
    usageLimits: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchCoreData() {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const { data } = await $api.get("/dashboard/core");
        this.stats = data.stats;
        this.recentInvoices = data.recentInvoices;
        this.topClients = data.topClients;
        this.insights = data.insights || [];
        this.usageLimits = data.usageLimits || null;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
      } finally {
        this.loading = false;
      }
    },
    async fetchForecastData(params = { range: 30 }) {
      const { $api } = useNuxtApp();
      try {
        const { data } = await $api.get("/dashboard/forecast", { params });
        this.cashflow = data.cashflow;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
      }
    },
  },
});
