import { defineStore } from "pinia";

/**
 * Top-ups (spec 01).
 *
 * Extra chased invoices for the CURRENT period, bought as a block.
 *
 * This store existed as an endpoint and nothing else. The backend has had
 * `GET /api/topups` and `POST /api/topups` since spec 01, and the dashboard has
 * had two "Top up" links — but both pointed at the billing tab, which rendered
 * only a promo box and a plan list. So the one action a user takes when their
 * allowance runs out mid-month landed them on a page offering to sell them a
 * bigger subscription instead. That is the worst possible moment to answer a
 * small question with a big one.
 *
 * Money is SEN, like everywhere else.
 */
export const useTopUpStore = defineStore("topUp", {
  state: () => ({
    /* Unconsumed balance for the current period, in chased invoices. */
    balance: 0,
    periodKey: "",
    /* What can be bought, priced by the server — never hardcoded here, or the
       page and the charge would eventually disagree about the price. */
    blocks: [],
    note: "",
    history: [],
    loading: false,
    buying: "",
    error: null,
  }),

  actions: {
    async fetchTopUps() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const { data } = await $api.get("/topups");
        this.balance = data.balance ?? 0;
        this.periodKey = data.periodKey || "";
        this.blocks = data.blocks || [];
        this.note = data.note || "";
        this.history = data.history || [];
      } catch (err) {
        this.error =
          err.response?.data?.message || "Could not load top-ups right now.";
      } finally {
        this.loading = false;
      }
    },

    /**
     * Start a purchase. Resolves to the gateway checkout url.
     *
     * Nothing is granted here — the row is created PENDING and only becomes
     * spendable when the payment webhook confirms it, so closing the tab at
     * checkout buys nothing. The caller sends the browser to `checkoutUrl`.
     */
    async buy(blockKey) {
      const { $api } = useNuxtApp();
      this.buying = blockKey;
      this.error = null;
      try {
        const { data } = await $api.post("/topups", { block: blockKey });
        return data.checkoutUrl;
      } catch (err) {
        this.error =
          err.response?.data?.message || "Could not start that purchase.";
        throw err;
      } finally {
        this.buying = "";
      }
    },
  },
});
