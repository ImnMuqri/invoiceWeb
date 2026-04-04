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

    // Robust SSR fallback for production
    if (process.server && !at) {
      const headers = useRequestHeaders(["cookie"]);
      const cookieHeader = headers.cookie || "";

      const getCookie = (name) => {
        const match = cookieHeader.match(
          new RegExp("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"),
        );
        return match ? match[2] : null;
      };

      const atMatch = getCookie("accessToken");
      if (atMatch) at = atMatch;

      const rtMatch = getCookie("refreshToken");
      if (rtMatch) rt = rtMatch;

      const userMatch = getCookie("user");
      if (userMatch) {
        try {
          u = JSON.parse(decodeURIComponent(userMatch));
        } catch (e) {}
      }
    }

    if (at) {
      accessToken.value = at;
      refreshToken.value = rt;
      if (u) user.value = u;
      return true;
    }
    return false;
  }

  // ✅ Initialize from cookies
  syncFromCookies();

  if (process.client) {
    // Set hydrated in next tick to avoid hydration mismatch
    setTimeout(() => {
      isHydrated.value = true;
    }, 0);

    // ✅ Sync state changes TO cookies only
    watch(accessToken, (at) => {
      useCookie("accessToken", COOKIE_OPTIONS).value = at;
    });

    watch(user, (u) => {
      useCookie("user", COOKIE_OPTIONS).value = u;
    });

    watch(refreshToken, (rt) => {
      useCookie("refreshToken", COOKIE_OPTIONS).value = rt;
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
  };
});
