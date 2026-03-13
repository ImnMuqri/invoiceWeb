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
      try {
        const { data } = await $api.get("/invoices");
        this.invoices = data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("Error fetching invoices:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchInvoiceById(id) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const { data } = await $api.get(`/invoices/${id}`);
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("Error fetching invoice:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async addInvoice(payload) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const response = await $api.post("/invoices", payload);
        this.invoices.unshift(response.data);
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateInvoice(id, payload) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const response = await $api.put(`/invoices/${id}`, payload);
        const index = this.invoices.findIndex((i) => i.id === id);
        if (index !== -1) {
          this.invoices[index] = response.data;
        }
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteInvoice(id) {
      const { $api } = useNuxtApp();
      try {
        const { data } = await $api.delete(`/invoices/${id}`);
        this.invoices = this.invoices.filter((i) => i.id !== id);
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("Error deleting invoice:", err);
        throw err;
      }
    },
    async sendWhatsAppReminder(id) {
      const { $api } = useNuxtApp();
      const invoice = this.invoices.find((i) => i.id === id);
      if (invoice) {
        invoice.whatsappStatus = "Sending...";
      }
      try {
        await $api.post(`/whatsapp/remind/${id}`);
        if (invoice) {
          invoice.whatsappStatus = "Sent";
        }
      } catch (err) {
        if (invoice) {
          invoice.whatsappStatus = "Not Sent";
        }
        this.error = err.response?.data?.message || err.message;
        console.error("Error sending WhatsApp reminder:", err);
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
        console.error("Error downloading PDF:", err);
        throw err;
      }
    },
    async sendInvoice(id, method, email = null, isReminder = false) {
      const { $api } = useNuxtApp();
      this.loading = true;
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
        this.loading = false;
      }
    },
    async whatsappInvoice(id) {
      const { $api } = useNuxtApp();
      try {
        const { data } = await $api.post(`/invoices/${id}/send`, {
          method: "whatsapp",
        });
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("Error sending WhatsApp message:", err);
        throw err;
      }
    },
  },
});
