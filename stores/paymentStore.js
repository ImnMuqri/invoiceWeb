import { defineStore } from "pinia";

/**
 * Payments, credit notes and voiding (spec 03).
 *
 * Amounts crossing this boundary are SEN, like everywhere else. The components
 * convert what a person typed exactly once, at the input.
 */
export const usePaymentStore = defineStore("payments", {
  state: () => ({ loading: false, error: null }),
  actions: {
    async fetchHistory(invoiceId) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const { data } = await $api.get(`/payments/invoice/${invoiceId}`);
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async recordPayment(invoiceId, payload) {
      const { $api } = useNuxtApp();
      const { data } = await $api.post(`/payments/invoice/${invoiceId}`, payload);
      return data;
    },
    async updatePayment(paymentId, payload) {
      const { $api } = useNuxtApp();
      const { data } = await $api.put(`/payments/${paymentId}`, payload);
      return data;
    },
    async deletePayment(paymentId) {
      const { $api } = useNuxtApp();
      const { data } = await $api.delete(`/payments/${paymentId}`);
      return data;
    },
    async issueCreditNote(invoiceId, payload) {
      const { $api } = useNuxtApp();
      const { data } = await $api.post(`/payments/credit-note/${invoiceId}`, payload);
      return data;
    },
    async deleteCreditNote(id) {
      const { $api } = useNuxtApp();
      const { data } = await $api.delete(`/payments/credit-note/${id}`);
      return data;
    },
    async voidInvoice(invoiceId, reason) {
      const { $api } = useNuxtApp();
      const { data } = await $api.post(`/payments/void/${invoiceId}`, { reason });
      return data;
    },
  },
});
