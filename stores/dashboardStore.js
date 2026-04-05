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
    async fetchCoreData(params = {}) {
      const { $api } = useNuxtApp();
      const { useSystemStore } = await import("./systemStore");
      const systemStore = useSystemStore();
      
      this.loading = true;
      try {
        const { data } = await $api.get("/dashboard/core", { params });
        this.stats = data.stats;
        this.recentInvoices = data.recentInvoices;
        this.topClients = data.topClients;
        this.insights = data.insights || [];
        this.usageLimits = data.usageLimits || null;
        
        // Update global system config
        if (data.system) {
          systemStore.setSystemConfig(data.system);
        }
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
