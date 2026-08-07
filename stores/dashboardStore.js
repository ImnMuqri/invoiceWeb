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
    /**
     * Quotations (spec 07). Its own slice of state fed by its own endpoint,
     * deliberately never merged into `stats`.
     *
     * A quotation is not money owed. `stats.outstandingAmount` is receivables
     * and these two figures must never be added to it, folded into it, or shown
     * beside it in a way that invites the reader to sum the row. Keeping them
     * in separate state fetched from a separate endpoint is what makes that
     * mistake take an act of will rather than a moment of inattention.
     */
    quotes: {
      currency: "MYR",
      /* The lists are capped for display; the counts and the values describe
         everything. Keep them distinct — reading `waiting.length` as the total
         is how a truncated list starts reporting a wrong number. */
      waiting: [],
      won: [],
      waitingCount: 0,
      wonCount: 0,
      waitingValue: 0,
      wonValue: 0,
    },
    quotesLoading: false,
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

    /**
     * The two quotation lists (spec 07): waiting on a reply, and accepted but
     * not yet invoiced.
     *
     * Non-throwing like the others — a dashboard that fails to load its
     * quotation panel should still show the money.
     */
    async fetchQuotes() {
      const { $api } = useNuxtApp();
      this.quotesLoading = true;
      try {
        const { data } = await $api.get("/dashboard/quotes");
        this.quotes = data;
      } catch {
        this.quotes = {
          currency: this.quotes.currency,
          waiting: [],
          won: [],
          waitingCount: 0,
          wonCount: 0,
          waitingValue: 0,
          wonValue: 0,
        };
      } finally {
        this.quotesLoading = false;
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
