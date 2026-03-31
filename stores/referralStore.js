import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const useReferralStore = defineStore("referral", {
  state: () => ({
    stats: {
      referralCode: "",
      referralCredits: 0,
      totalReferrals: 0,
    },
    loading: false,
    error: null,
  }),

  actions: {
    async fetchStats() {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const response = await $api.get("/referral/stats");
        this.stats = response.data;
      } catch (err) {
        this.error =
          err.response?.data?.message || "Failed to fetch referral stats";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async claimReward(rewardType) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const response = await $api.post("/referral/claim", { rewardType });

        // Refresh stats and user profile after claiming
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
