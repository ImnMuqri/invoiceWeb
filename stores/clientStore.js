import { defineStore } from "pinia";

export const useClientStore = defineStore("client", {
  state: () => ({
    clients: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchClients() {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const { data } = await $api.get("/clients");
        this.clients = data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("Error fetching clients:", err);
      } finally {
        this.loading = false;
      }
    },
    async addClient(client) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const { data } = await $api.post("/clients", client);
        this.clients.unshift(data);
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("Error adding client:", err);
      } finally {
        this.loading = false;
      }
    },
    async deleteClient(id) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        await $api.delete(`/clients/${id}`);
        this.clients = this.clients.filter((c) => c.id !== id);
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("Error deleting client:", err);
      } finally {
        this.loading = false;
      }
    },
  },
});
