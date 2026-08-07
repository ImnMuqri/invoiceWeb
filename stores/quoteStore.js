import { defineStore } from "pinia";

/**
 * Quotations.
 *
 * Deliberately its own store rather than a `kind` flag inside invoiceStore. The
 * two lists are fetched independently, held independently and invalidated at
 * different times — sharing one array would mean every invoice screen re-renders
 * when a quote changes, and every filter in the app would need a type guard.
 *
 * Conversion is the one place the two meet, and it is handled by asking the
 * caller to refresh invoices afterwards rather than by reaching across stores.
 */
export const useQuoteStore = defineStore("quote", {
  state: () => ({
    quotes: [],
    loading: false,
    error: null,
  }),

  getters: {
    /** Live quotes: not yet accepted, declined or expired. */
    open: (state) =>
      state.quotes.filter((q) => ["Draft", "Sent", "Viewed"].includes(q.status)),
    /** Already turned into an invoice — kept as the record of what was agreed. */
    converted: (state) => state.quotes.filter((q) => !!q.convertedTo),
    /**
     * Accepted and not yet billed.
     *
     * Work already won and not yet invoiced — the spec calls this the most
     * valuable thing the product can remind somebody of, and it is worth having
     * as a getter so no screen has to re-derive the test and get it subtly
     * wrong. The `convertedTo` relation is the only honest one: a status cannot
     * tell you whether an invoice exists.
     */
    acceptedNotInvoiced: (state) =>
      state.quotes.filter((q) => q.status === "Accepted" && !q.convertedTo),
  },

  actions: {
    async fetchQuotes() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const { data } = await $api.get("/quotes");
        this.quotes = Array.isArray(data) ? data : [];
      } catch (err) {
        /* Surfaced, not swallowed. An empty list because the request failed
           reads exactly like an empty list because nothing exists, and the
           support inbox had that bug for real. */
        this.error =
          err.response?.data?.message || "Could not load your quotations.";
        this.quotes = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchQuoteById(id) {
      const { $api } = useNuxtApp();
      const { data } = await $api.get(`/quotes/${id}`);
      return data;
    },

    async addQuote(payload) {
      const { $api } = useNuxtApp();
      const { data } = await $api.post("/quotes", payload);
      await this.fetchQuotes();
      return data;
    },

    async updateQuote(id, payload) {
      const { $api } = useNuxtApp();
      const { data } = await $api.put(`/quotes/${id}`, payload);
      await this.fetchQuotes();
      return data;
    },

    async deleteQuote(id) {
      const { $api } = useNuxtApp();
      const { data } = await $api.delete(`/quotes/${id}`);
      await this.fetchQuotes();
      return data;
    },

    /**
     * Send the quotation to the client.
     *
     * `channel` is "email", "whatsapp" or "both". Resolves to the server's
     * response, which carries `sent` — the channels that actually went. A
     * partial send (email through, WhatsApp allowance spent) comes back 207
     * with `failed` alongside it, so the caller can say what happened rather
     * than claiming everything worked or that nothing did.
     */
    async sendQuote(id, channel = "email") {
      const { $api } = useNuxtApp();
      const { data } = await $api.post(`/quotes/${id}/send`, { channel });
      await this.fetchQuotes();
      return data;
    },

    /**
     * Record the answer the user got somewhere else.
     *
     * Most quotes are still answered in a phone call, and a product that only
     * knows about answers pressed through its own button knows about half of
     * them. `decision` is "accept", "decline" or "reopen".
     */
    async recordDecision(id, decision, extra = {}) {
      const { $api } = useNuxtApp();
      const { data } = await $api.post(`/quotes/${id}/decision`, {
        decision,
        ...extra,
      });
      await this.fetchQuotes();
      return data;
    },

    /**
     * Accept a quote and raise the invoice for it.
     *
     * Returns the new invoice. The quote is not removed — it stays, marked
     * Accepted, with the invoice linked to it — so the caller refetches rather
     * than splicing anything out of the array.
     */
    async convertToInvoice(id, dueDate = null) {
      const { $api } = useNuxtApp();
      const { data } = await $api.post(`/quotes/${id}/convert`, { dueDate });
      await this.fetchQuotes();
      return data;
    },
  },
});
