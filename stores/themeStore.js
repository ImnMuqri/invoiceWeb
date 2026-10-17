import { defineStore } from "pinia";

/**
 * Write the theme to BOTH markers the stylesheets look for.
 *
 * There are two, and they are not interchangeable:
 *
 *   html.dark               main.css — 64 rules, and the ONLY condition it
 *                           knows. The sidebar, the topbar, every Tailwind
 *                           utility remap (.bg-white, .text-slate-900, …).
 *   :root[data-theme=dark]  design-tokens.css and app-desk.css, which match
 *                           EITHER condition, because the marketing pages set
 *                           the attribute and never the class.
 *
 * So the attribute alone paints the tokens and the desk surfaces dark while
 * leaving every main.css utility light: dark content cards inside a light
 * sidebar, with headings still authored slate-900 sitting on a dark surface —
 * on every module at once. Any marketing, legal or auth page sets that
 * attribute on its way through and nothing ever cleared it, so arriving at the
 * dashboard from /login or /onboarding was enough to trigger it whenever the
 * app's own stored theme disagreed with the one those pages resolved.
 *
 * The app owns both markers while it is on screen. One theme, however a
 * stylesheet chooses to ask about it.
 */
const applyTheme = (isDark) => {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", isDark ? "dark" : "light");
};

export const useThemeStore = defineStore("theme", {
  state: () => ({
    isDark: false,
  }),
  actions: {
    initTheme() {
      if (process.client) {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark" || savedTheme === "light") {
          this.isDark = savedTheme === "dark";
        } else {
          // Check system preference
          this.isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        applyTheme(this.isDark);
      }
    },
    toggleTheme() {
      this.isDark = !this.isDark;
      if (process.client) {
        applyTheme(this.isDark);
        localStorage.setItem("theme", this.isDark ? "dark" : "light");
      }
    }
  }
});
