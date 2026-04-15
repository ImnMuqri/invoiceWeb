import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const useReferralStore = defineStore("referral", {
  state: () => ({
    stats: {
      totalReferrals: 0,
      referrals: [],
    },
    loading: false,
    error: null,
  }),

  actions: {
    async fetchStats() {
      this.loading = true;
      this.error = null;
      try {
        const { $api } = useNuxtApp();
        const response = await $api.get("/referral/stats");
        this.stats = response.data;
      } catch (err) {
        // Non-fatal — dashboard still works without referral stats
        this.error = err.response?.data?.message || "Failed to fetch referral stats";
        console.warn("Referral stats fetch failed:", this.error);
      } finally {
        this.loading = false;
      }
    },

    async claimReward(rewardType) {
      this.loading = true;
      this.error = null;
      try {
        const { $api } = useNuxtApp();
        const response = await $api.post("/referral/claim", { rewardType });

        // Refresh both referral stats and user profile after claiming
        await this.fetchStats();
        const authStore = useAuthStore();
        await authStore.fetchProfile();

        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to claim reward";
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
