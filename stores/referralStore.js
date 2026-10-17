import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

export const useReferralStore = defineStore("referral", {
  state: () => ({
    /* Shaped to match GET /referral/stats exactly, defaults included, so a
       component can render before the fetch resolves without guarding every
       field. The four counts are deliberately separate rather than one
       "referrals" number: clicks-without-signups and signups-without-
       conversions are different problems with different fixes, and a single
       figure hides which one you have. */
    stats: {
      code: "",
      url: "",
      share: { en: "", ms: "" },
      clicks: 0,
      signups: 0,
      converted: 0,
      /* SEN, like every money value in this codebase. */
      creditSen: 0,
      terms: null,
      legacyCredits: 0,
      recent: [],
    },
    /* Null when there is nothing to ask. Never a boolean plus a payload —
       one nullable object cannot get into a state where it is shown with
       nothing to show. */
    prompt: null,
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

    /**
     * Should the share prompt be shown, and what should it say?
     *
     * The DECISION is the server's, not this store's. The rule depends on when
     * the last qualifying payment landed, when the prompt was last shown and
     * how many times it has been dismissed — none of which the browser knows,
     * and a frequency cap kept in localStorage resets itself on every new
     * browser, so somebody who has said no twice on a laptop gets asked again
     * on their phone.
     */
    async fetchPrompt() {
      try {
        const { $api } = useNuxtApp();
        const { data } = await $api.get("/referral/prompt", { quiet: true });
        this.prompt = data?.show ? data : null;
      } catch {
        /* Silent. A missing prompt is not worth an error on the dashboard. */
        this.prompt = null;
      }
      return this.prompt;
    },

    /**
     * Record that it was seen. `dismissed` records a no.
     *
     * Cleared locally first so the card disappears the moment it is clicked —
     * waiting for the round trip makes a dismissal feel broken.
     */
    async acknowledgePrompt(dismissed = false) {
      this.prompt = null;
      try {
        const { $api } = useNuxtApp();
        await $api.post("/referral/prompt/seen", { dismissed }, { quiet: true });
      } catch {
        /* If this fails the prompt reappears on the next qualifying event,
           which is a far better outcome than blocking the dismissal. */
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
