import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = useState("auth_user", () => null);
  const accessToken = useState("auth_accessToken", () => null);
  const refreshToken = useState("auth_refreshToken", () => null);

  const loading = ref(false);
  const error = ref(null);
  const isHydrated = ref(false);

  const token = computed(() => accessToken.value);

  const isPro = computed(() => {
    return user.value?.plan === "PRO" || user.value?.plan === "MAX";
  });

  const isAdmin = computed(() => {
    return user.value?.role === "ADMIN";
  });

  const COOKIE_OPTIONS = {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: process.dev ? false : true,
  };

  function syncFromCookies() {
    let u = useCookie("user").value;
    let at = useCookie("accessToken").value;
    let rt = useCookie("refreshToken").value;

    // SSR fallback
    if (process.server && !at) {
      const headers = useRequestHeaders(["cookie"]);
      if (headers.cookie) {
        const atMatch = headers.cookie.match(/accessToken=([^;]+)/);
        if (atMatch) at = atMatch[1];

        const rtMatch = headers.cookie.match(/refreshToken=([^;]+)/);
        if (rtMatch) rt = rtMatch[1];

        const userMatch = headers.cookie.match(/user=([^;]+)/);
        if (userMatch) {
          try {
            u = JSON.parse(decodeURIComponent(userMatch[1]));
          } catch (e) {}
        }
      }
    }

    if (at) {
      accessToken.value = at;
      refreshToken.value = rt;

      if (u) {
        user.value = u;
      }

      return true;
    }

    return false;
  }

  function syncFromLS() {
    if (!process.client) return false;

    const at = localStorage.getItem("accessToken");

    if (at) {
      accessToken.value = at;
      refreshToken.value = localStorage.getItem("refreshToken");

      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        user.value = JSON.parse(savedUser);
      }

      useCookie("user", COOKIE_OPTIONS).value = user.value;
      useCookie("accessToken", COOKIE_OPTIONS).value = accessToken.value;
      useCookie("refreshToken", COOKIE_OPTIONS).value = refreshToken.value;

      return true;
    }

    return false;
  }

  // 🔥 SINGLE SOURCE SYNC (SSR SAFE)
  syncFromCookies();

  if (process.client) {
    try {
      // Backup to LS if missing
      if (accessToken.value && !localStorage.getItem("accessToken")) {
        localStorage.setItem("user", JSON.stringify(user.value));
        localStorage.setItem("accessToken", accessToken.value);
        localStorage.setItem("refreshToken", refreshToken.value);
      }

      // Restore if cookies missing but LS exists
      else if (!accessToken.value && localStorage.getItem("accessToken")) {
        syncFromLS();
      }
    } catch (e) {
    } finally {
      setTimeout(() => {
        isHydrated.value = true;
      }, 0);
    }

    // ✅ Only watch token, not everything
    watch(accessToken, (at) => {
      if (!isHydrated.value) return;

      useCookie("accessToken", COOKIE_OPTIONS).value = at;

      if (at) {
        localStorage.setItem("accessToken", at);
      } else {
        localStorage.removeItem("accessToken");
      }
    });

    watch(user, (u) => {
      if (!isHydrated.value) return;

      useCookie("user", COOKIE_OPTIONS).value = u;

      if (u) {
        localStorage.setItem("user", JSON.stringify(u));
      } else {
        localStorage.removeItem("user");
      }
    });

    watch(refreshToken, (rt) => {
      if (!isHydrated.value) return;

      useCookie("refreshToken", COOKIE_OPTIONS).value = rt;

      if (rt) {
        localStorage.setItem("refreshToken", rt);
      } else {
        localStorage.removeItem("refreshToken");
      }
    });
  }

  async function login(email, password) {
    const { $api } = useNuxtApp();
    loading.value = true;

    try {
      const { data } = await $api.post("/auth/login", { email, password });

      user.value = data.user;
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;

      return true;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    const { $api } = useNuxtApp();

    try {
      await $api.post("/auth/logout");
    } catch (err) {
    } finally {
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;

      useCookie("user", COOKIE_OPTIONS).value = null;
      useCookie("accessToken", COOKIE_OPTIONS).value = null;
      useCookie("refreshToken", COOKIE_OPTIONS).value = null;

      if (process.client) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  }

  async function register(name, email, password, referralCode) {
    const { $api } = useNuxtApp();
    loading.value = true;
    error.value = null;

    try {
      const { data } = await $api.post("/auth/register", {
        name,
        email,
        password,
        referralCode,
      });

      user.value = data.user;
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;

      return true;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProfile() {
    const { $api } = useNuxtApp();
    loading.value = true;

    try {
      const { data } = await $api.get("/users/me");
      user.value = { ...user.value, ...data };
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  }

  async function refreshAccessToken() {
    const { $api } = useNuxtApp();

    if (!refreshToken.value) return false;

    try {
      const { data } = await $api.post("/auth/refresh", {
        refreshToken: refreshToken.value,
      });

      accessToken.value = data.accessToken;
      return true;
    } catch (err) {
      return false;
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    token,
    isPro,
    isAdmin,
    isHydrated,
    login,
    register,
    logout,
    fetchProfile,
    refreshAccessToken,
    syncFromCookies,
    syncFromLS,
  };
});
