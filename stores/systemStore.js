import { defineStore } from "pinia";

export const useSystemStore = defineStore("system", {
  state: () => ({
    config: {
      whatsappEnabled: true,
      emailEnabled: true,
      invoiceCreationEnabled: true,
      paymentsEnabled: true,
      planUpgradesEnabled: true,
      globalNotice: null,
      maintenanceMode: false,
    },
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * The switches, for any signed-in screen that needs them.
     *
     * `fetchSystemConfig` below hits the admin-only route, so every non-admin
     * page had to wait for a payload that happened to carry `system` — and a
     * page with no such payload, like onboarding, could not see a switch at
     * all. This reads GET /api/system, which any account may read.
     *
     * MERGED, not assigned: the dashboard's own payload is the only source of
     * some fields, and replacing the object wholesale would blank whatever
     * arrived first depending on which request finished last.
     */
    async fetchConfig() {
      const { $api } = useNuxtApp();
      try {
        const { data } = await $api.get("/system");
        this.config = { ...this.config, ...data };
        return this.config;
      } catch (error) {
        /* Deliberately soft. Every flag defaults to "working normally", so a
           failed read leaves the product usable rather than locking screens
           over a network blip — and every switch is enforced server-side, so a
           stale `true` here cannot let anything through. */
        console.error("Fetch system config error:", error);
        return null;
      }
    },

    async fetchSystemConfig() {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const response = await $api.get("/admin/system");
        this.config = response.data;
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Failed to fetch system configuration";
        console.error("Fetch System Config Error:", error);
      } finally {
        this.loading = false;
      }
    },

    async updateSystemConfig(payload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const response = await $api.patch("/admin/system", payload);
        this.config = response.data;
        return true;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Failed to update system configuration";
        console.error("Update System Config Error:", error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    setSystemConfig(config) {
      this.config = config;
    },
  },

  getters: {
    isWhatsappEnabled: (state) => state.config.whatsappEnabled,
    isEmailEnabled: (state) => state.config.emailEnabled,
    isInvoiceCreationEnabled: (state) => state.config.invoiceCreationEnabled,
    isPaymentsEnabled: (state) => state.config.paymentsEnabled,
    /* Undefined counts as on — an older API that does not return the field yet
       must not silently switch selling off. */
    arePlanUpgradesEnabled: (state) => state.config.planUpgradesEnabled !== false,
    /* Same defensive default. These two are read-only signals in the UI: they
       explain why a chaser has gone quiet, and nothing here enforces them — the
       cron does, which is the only place that can. */
    isAutoChaseEmailEnabled: (state) => state.config.autoChaseEmailEnabled !== false,
    isAutoChaseWaEnabled: (state) => state.config.autoChaseWaEnabled !== false,
    globalNotice: (state) => state.config.globalNotice,
  },
});
