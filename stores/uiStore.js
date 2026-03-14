import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    pageTitle: '',
    pageDescription: ''
  }),
  actions: {
    setPageHeader(title, description = '') {
      this.pageTitle = title;
      this.pageDescription = description;
    },
    clearPageHeader() {
      this.pageTitle = '';
      this.pageDescription = '';
    }
  }
});
