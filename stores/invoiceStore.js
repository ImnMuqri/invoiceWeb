import { defineStore } from "pinia";

export const useInvoiceStore = defineStore("invoice", {
  state: () => ({
    invoices: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchInvoices() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const { data } = await $api.get("/invoices");
        this.invoices = data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * The public view of an invoice, for the pay page.
     *
     * /pay/invoice/:id is the endpoint built for this: an unauthenticated client
     * opening a payment link. It returns a curated projection — the document,
     * the sender's details, the gateways and the bank block — and nothing else.
     *
     * The pay page used to call fetchInvoiceById, which meant GET /invoices/:id
     * had to stay public for it, and that route returns the whole row. Two
     * different audiences were being served by one unguarded endpoint.
     */
    async fetchPublicInvoice(id) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const { data } = await $api.get(`/pay/invoice/${id}`);
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * `renderToken` is only ever supplied by /invoices/:id/export, the page the
     * backend prints to PDF. That page has no session — Puppeteer carries no
     * cookie — so the token is what authorises the read. Every other caller
     * omits it and is authorised by their own session.
     */
    async fetchInvoiceById(id, renderToken = null) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const { data } = await $api.get(`/invoices/${id}`, {
          params: renderToken ? { renderToken } : {},
        });
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async addInvoice(payload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const { data } = await $api.post("/invoices", payload);
        this.invoices.unshift(data);
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // isLocal = true skips the global loading flag (used for inline status updates)
    async updateInvoice(id, payload, isLocal = false) {
      const { $api } = useNuxtApp();
      this.error = null;
      if (!isLocal) this.loading = true;
      try {
        const { data } = await $api.put(`/invoices/${id}`, payload);
        const index = this.invoices.findIndex((i) => i.id === id);
        if (index !== -1) this.invoices[index] = data;
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      } finally {
        if (!isLocal) this.loading = false;
      }
    },

    async deleteInvoice(id) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        await $api.delete(`/invoices/${id}`);
        this.invoices = this.invoices.filter((i) => i.id !== id);
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async sendWhatsAppReminder(id) {
      const { $api } = useNuxtApp();
      this.error = null;
      // Optimistic UI update
      const invoice = this.invoices.find((i) => i.id === id);
      if (invoice) invoice.whatsappStatus = "Sending...";
      try {
        await $api.post(`/whatsapp/remind/${id}`);
        if (invoice) invoice.whatsappStatus = "Sent";
      } catch (err) {
        if (invoice) invoice.whatsappStatus = "Not Sent";
        this.error = err.response?.data?.message || err.message;
        throw err;
      }
    },

    async downloadPdf(id, filename = "invoice.pdf") {
      const { $api } = useNuxtApp();
      try {
        const response = await $api.get(`/invoices/${id}/pdf`, {
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      }
    },

    // isLocal = true skips global loading spinner (used in bulk/inline sends)
    async sendInvoice(id, method, email = null, isReminder = false, isLocal = false) {
      const { $api } = useNuxtApp();
      this.error = null;
      if (!isLocal) this.loading = true;
      try {
        const { data } = await $api.post(`/invoices/${id}/send`, {
          method,
          email,
          isReminder,
        });
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      } finally {
        if (!isLocal) this.loading = false;
      }
    },

    // Convenience wrapper — avoids callers having to pass method: "whatsapp"
    async whatsappInvoice(id) {
      return this.sendInvoice(id, "whatsapp", null, false, true);
    },

    async downloadReceipt(id, filename = "receipt.pdf") {
      const { $api } = useNuxtApp();
      try {
        const response = await $api.get(`/invoices/${id}/pdf`, {
          params: { type: "receipt" },
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      }
    },
 
    async createPaymentBill(invoiceId, providerId) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const { data } = await $api.post(`/pay/invoice/${invoiceId}/create-bill`, {
          providerId,
        });
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
