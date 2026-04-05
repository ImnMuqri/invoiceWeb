import { defineStore } from "pinia";

export const useSystemStore = defineStore("system", {
  state: () => ({
    config: {
      whatsappEnabled: true,
      emailEnabled: true,
      invoiceCreationEnabled: true,
      paymentsEnabled: true,
      globalNotice: null,
      maintenanceMode: false,
    },
    loading: false,
    error: null,
  }),

  actions: {
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
    globalNotice: (state) => state.config.globalNotice,
  },
});
