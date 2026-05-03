import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    isDark: false,
  }),
  actions: {
    initTheme() {
      if (process.client) {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
          this.isDark = true;
          document.documentElement.classList.add("dark");
        } else if (savedTheme === "light") {
          this.isDark = false;
          document.documentElement.classList.remove("dark");
        } else {
          // Check system preference
          this.isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          if (this.isDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      }
    },
    toggleTheme() {
      this.isDark = !this.isDark;
      if (process.client) {
        if (this.isDark) {
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("theme", "light");
        }
      }
    }
  }
});
