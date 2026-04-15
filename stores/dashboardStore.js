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
    // Populated by fetchCoreData — avoids a separate /me call on dashboard mount
    quotaUsage: {
      invoicesUsed: 0,
      waSendsUsed: 0,
      emailSendsUsed: 0,
      waRemindersUsed: 0,
      emailRemindersUsed: 0,
      aiUsed: 0,
    },
    loading: false,
    forecastLoading: false,
    error: null,
  }),

  actions: {
    async fetchCoreData(params = {}) {
      const { $api } = useNuxtApp();
      // Lazy import to avoid circular dependency
      const { useSystemStore } = await import("./systemStore");
      const systemStore = useSystemStore();

      this.loading = true;
      this.error = null;
      try {
        const { data } = await $api.get("/dashboard/core", { params });
        this.stats = data.stats;
        this.recentInvoices = data.recentInvoices;
        this.topClients = data.topClients;
        this.insights = data.insights || [];
        this.usageLimits = data.usageLimits || null;
        if (data.quotaUsage) this.quotaUsage = data.quotaUsage;

        // Piggyback system config from dashboard response to avoid extra request
        if (data.system) {
          systemStore.setSystemConfig(data.system);
        }
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        // Non-throwing — dashboard shows empty state on error
      } finally {
        this.loading = false;
      }
    },

    async fetchForecastData(params = { range: 30 }) {
      const { $api } = useNuxtApp();
      this.forecastLoading = true;
      this.error = null;
      try {
        const { data } = await $api.get("/dashboard/forecast", { params });
        this.cashflow = data.cashflow;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        // Non-throwing — chart shows empty state on error
      } finally {
        this.forecastLoading = false;
      }
    },
  },
});
