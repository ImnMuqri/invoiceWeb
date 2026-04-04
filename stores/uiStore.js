import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    pageTitle: "",
    pageDescription: "",
    isWelcomeModalOpen: false,
    isModuleHelpOpen: false,
    activeModuleHelp: "dashboard",
    activeSubContext: "",
  }),
  actions: {
    setPageHeader(title, description = "") {
      this.pageTitle = title;
      this.pageDescription = description;
    },
    clearPageHeader() {
      this.pageTitle = "";
      this.pageDescription = "";
    },
    toggleWelcomeModal(val) {
      this.isWelcomeModalOpen =
        typeof val === "boolean" ? val : !this.isWelcomeModalOpen;
    },
    openModuleHelp(module, subContext = "") {
      this.activeModuleHelp = module;
      this.activeSubContext = subContext;
      this.isModuleHelpOpen = true;
    },
    closeModuleHelp() {
      this.isModuleHelpOpen = false;
      this.activeSubContext = "";
    },
  },
});
