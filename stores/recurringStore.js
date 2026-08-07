import { defineStore } from "pinia";

export const useRecurringStore = defineStore("recurring", {
  state: () => ({ schedules: [], loading: false, error: null }),
  actions: {
    async fetchSchedules() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const { data } = await $api.get("/recurring");
        this.schedules = data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
      } finally {
        this.loading = false;
      }
    },
    async fetchSchedule(id) {
      const { $api } = useNuxtApp();
      const { data } = await $api.get(`/recurring/${id}`);
      return data;
    },
    async addSchedule(payload) {
      const { $api } = useNuxtApp();
      const { data } = await $api.post("/recurring", payload);
      this.schedules.unshift(data);
      return data;
    },
    async updateSchedule(id, payload) {
      const { $api } = useNuxtApp();
      const { data } = await $api.put(`/recurring/${id}`, payload);
      const i = this.schedules.findIndex((s) => s.id === id);
      if (i !== -1) this.schedules[i] = { ...this.schedules[i], ...data };
      return data;
    },
    /** pause | resume | cancel | auto | review */
    async act(id, action) {
      const { $api } = useNuxtApp();
      const { data } = await $api.post(`/recurring/${id}/${action}`);
      const i = this.schedules.findIndex((s) => s.id === id);
      if (i !== -1) this.schedules[i] = { ...this.schedules[i], ...data };
      return data;
    },
    async fromInvoice(invoiceId, payload = {}) {
      const { $api } = useNuxtApp();
      const { data } = await $api.post(`/recurring/from-invoice/${invoiceId}`, payload);
      this.schedules.unshift(data);
      return data;
    },
  },
});
