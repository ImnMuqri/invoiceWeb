import { defineStore } from "pinia";

export const usePromoStore = defineStore("promo", {
  state: () => ({
    promoCodes: [],
    loading: false,
    error: null,
    validPromo: null,
  }),

  actions: {
    // Admin Actions
    async fetchAllPromoCodes() {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const response = await $api.get("/admin/promo-codes");
        this.promoCodes = response.data;
      } catch (err) {
        this.error =
          err.response?.data?.message || "Failed to fetch promo codes";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createPromoCode(promoData) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const response = await $api.post("/admin/promo-codes", promoData);
        this.promoCodes.unshift(response.data);
        return response.data;
      } catch (err) {
        this.error =
          err.response?.data?.message || "Failed to create promo code";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updatePromoCode(id, promoData) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const response = await $api.put(`/admin/promo-codes/${id}`, promoData);
        const index = this.promoCodes.findIndex((p) => p.id === id);
        if (index !== -1) {
          this.promoCodes[index] = response.data;
        }
        return response.data;
      } catch (err) {
        this.error =
          err.response?.data?.message || "Failed to update promo code";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deletePromoCode(id) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        await $api.delete(`/admin/promo-codes/${id}`);
        this.promoCodes = this.promoCodes.filter((p) => p.id !== id);
      } catch (err) {
        this.error =
          err.response?.data?.message || "Failed to delete promo code";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async togglePromoStatus(id) {
      try {
        const { $api } = useNuxtApp();
        const response = await $api.patch(`/admin/promo-codes/${id}/toggle`);
        const index = this.promoCodes.findIndex((p) => p.id === id);
        if (index !== -1) {
          this.promoCodes[index] = response.data;
        }
      } catch (err) {
        this.error =
          err.response?.data?.message || "Failed to toggle promo code";
        throw err;
      }
    },

    // Public Actions
    async validatePromoCode(code) {
      this.loading = true;
      this.validPromo = null;
      try {
        const { $api } = useNuxtApp();
        const response = await $api.post("/auth/validate-promo", { code });
        this.validPromo = response.data;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || "Invalid promo code";
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
