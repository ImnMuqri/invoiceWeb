import { defineStore } from "pinia";

export const useCatalogueStore = defineStore("catalogue", {
  state: () => ({
    items: [],
    loading: false,
    /* Set once a fetch has completed, successfully or not. The picker in the
       invoice builder needs to tell "you have no saved items" apart from "we
       have not looked yet", and an empty array says both. */
    loaded: false,
    error: null,
  }),

  getters: {
    live: (state) => state.items.filter((i) => !i.archived),
  },

  actions: {
    async fetchItems({ includeArchived = false, force = false } = {}) {
      const { $api } = useNuxtApp();
      /* The picker mounts on every invoice and quote builder. Refetching a price
         list that changes a few times a year on each of those is waste. */
      if (this.loaded && !force && !includeArchived) return this.items;
      this.loading = true;
      this.error = null;
      try {
        const { data } = await $api.get("/catalogue", {
          params: includeArchived ? { includeArchived: "true" } : {},
        });
        this.items = data;
        this.loaded = true;
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        this.loaded = true;
        return [];
      } finally {
        this.loading = false;
      }
    },

    async addItem(payload) {
      const { $api } = useNuxtApp();
      this.error = null;
      try {
        const { data } = await $api.post("/catalogue", payload);
        this.items.unshift(data);
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      }
    },

    async updateItem(id, payload) {
      const { $api } = useNuxtApp();
      this.error = null;
      try {
        const { data } = await $api.put(`/catalogue/${id}`, payload);
        const i = this.items.findIndex((it) => it.id === id);
        if (i !== -1) this.items[i] = data;
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      }
    },

    /**
     * The server decides whether this is a delete or an archive — an item that
     * has been used on documents is archived instead, and says so. Reconcile
     * against what actually happened rather than assuming.
     */
    async removeItem(id) {
      const { $api } = useNuxtApp();
      this.error = null;
      try {
        const { data } = await $api.delete(`/catalogue/${id}`);
        if (data?.archived) {
          const i = this.items.findIndex((it) => it.id === id);
          if (i !== -1) this.items[i] = { ...this.items[i], archived: true };
        } else {
          this.items = this.items.filter((it) => it.id !== id);
        }
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        throw err;
      }
    },

    /**
     * Usage counting. Deliberately swallows everything: this only drives the
     * sort order of the picker, and nobody should lose an invoice because a
     * statistic failed to save.
     */
    async markUsed(ids) {
      const list = [...new Set((ids || []).filter(Boolean))];
      if (!list.length) return;
      const { $api } = useNuxtApp();
      try {
        await $api.post("/catalogue/used", { ids: list });
        for (const id of list) {
          const i = this.items.findIndex((it) => it.id === id);
          if (i !== -1) {
            this.items[i] = {
              ...this.items[i],
              timesUsed: (this.items[i].timesUsed || 0) + 1,
            };
          }
        }
      } catch {
        /* Ignored on purpose. See above. */
      }
    },
  },
});
