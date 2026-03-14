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

        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteClient(id) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const { data } = await $api.delete(`/clients/${id}`);
        this.clients = this.clients.filter((c) => c.id !== id);
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;

        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateClient(id, clientData) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const { data } = await $api.put(`/clients/${id}`, clientData);
        const index = this.clients.findIndex((c) => c.id === id);
        if (index !== -1) {
          this.clients[index] = data;
        }

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
