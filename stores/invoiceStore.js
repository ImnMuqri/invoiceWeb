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
        this.invoices = data.map((inv) => ({
          ...inv,
          client: inv.client?.name || inv.client,
        }));
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("Error fetching invoices:", err);
      } finally {
        this.loading = false;
      }
    },
    async fetchInvoiceById(id) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const { data } = await $api.get(`/invoices/${id}`);
        return {
          ...data,
          client: data.client?.name || data.client,
        };
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("Error fetching invoice:", err);
        return null;
      } finally {
        this.loading = false;
      }
    },
    async addInvoice(invoice) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const { data } = await $api.post("/invoices", invoice);
        this.invoices.unshift({
          ...data,
          client: data.client?.name || data.client,
        });
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("Error adding invoice:", err);
      } finally {
        this.loading = false;
      }
    },
    async deleteInvoice(id) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        await $api.delete(`/invoices/${id}`);
        this.invoices = this.invoices.filter((i) => i.id !== id);
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("Error deleting invoice:", err);
      } finally {
        this.loading = false;
      }
    },
    async sendWhatsAppReminder(id) {
      const invoice = this.invoices.find((i) => i.id === id);
      if (invoice) {
        invoice.whatsappStatus = "Sending...";
        // Mocking API call for WhatsApp for now as backend doesn't have it yet
        setTimeout(() => {
          invoice.whatsappStatus = "Sent";
        }, 1000);
      }
    },
  },
});
