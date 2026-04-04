import { defineStore, skipHydrate } from "pinia";
import { ref, computed, watch, onMounted } from "vue";

export const useAuthStore = defineStore("auth", () => {
  // Use Nuxt useState to ensure state is synced from server to client
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
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    // Only use secure cookies if on HTTPS (localhost usually isn't)
    secure: false, // Relaxed for production to avoid SSL termination issues on some proxies
  };

  // Function to sync from cookies to store (SSR safe)
  function syncFromCookies() {
    const u = useCookie("user", COOKIE_OPTIONS).value;
    const at = useCookie("accessToken", COOKIE_OPTIONS).value;
    const rt = useCookie("refreshToken", COOKIE_OPTIONS).value;

    if (at) {
      accessToken.value = at;
      refreshToken.value = rt;
      user.value = u;
      return true;
    }
    return false;
  }

  // Initial sync
  syncFromCookies();

  if (process.client) {
    const initStore = () => {
      // If we have state but no LS, backup to LS
      if (accessToken.value && !localStorage.getItem("accessToken")) {
        localStorage.setItem("user", JSON.stringify(user.value));
        localStorage.setItem("accessToken", accessToken.value);
        localStorage.setItem("refreshToken", refreshToken.value);
      }
      // If we have NO state but have LS, restore from LS
      else if (!accessToken.value && localStorage.getItem("accessToken")) {
        syncFromLS();
      }

      isHydrated.value = true;
    };

    // Run initialization IMMEDIATELY to avoid race conditions with API calls
    initStore();

    // Update cookies and LS when state changes
    watch(
      [user, accessToken, refreshToken],
      ([u, at, rt]) => {
        if (!isHydrated.value) return;

        const uCookie = useCookie("user", COOKIE_OPTIONS);
        const atCookie = useCookie("accessToken", COOKIE_OPTIONS);
        const rtCookie = useCookie("refreshToken", COOKIE_OPTIONS);

        uCookie.value = u;
        atCookie.value = at;
        rtCookie.value = rt;

        if (at) {
          localStorage.setItem("user", JSON.stringify(u));
          localStorage.setItem("accessToken", at);
          localStorage.setItem("refreshToken", rt);
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      },
      { deep: true },
    );
  }

  function syncFromLS() {
    if (!process.client) return false;
    const at = localStorage.getItem("accessToken");
    if (at) {
      accessToken.value = at;
      refreshToken.value = localStorage.getItem("refreshToken");
      const savedUser = localStorage.getItem("user");
      if (savedUser) user.value = JSON.parse(savedUser);

      // Restore cookies from LS for future SSR
      useCookie("user", COOKIE_OPTIONS).value = user.value;
      useCookie("accessToken", COOKIE_OPTIONS).value = accessToken.value;
      useCookie("refreshToken", COOKIE_OPTIONS).value = refreshToken.value;
      return true;
    }
    return false;
  }

  async function login(email, password) {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.post("/auth/login", { email, password });
      user.value = data.user;
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;

      // Explicitly set cookies immediately for middleware
      useCookie("user", COOKIE_OPTIONS).value = data.user;
      useCookie("accessToken", COOKIE_OPTIONS).value = data.accessToken;
      useCookie("refreshToken", COOKIE_OPTIONS).value = data.refreshToken;

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

      // Clear cookies immediately
      useCookie("user", COOKIE_OPTIONS).value = null;
      useCookie("accessToken", COOKIE_OPTIONS).value = null;
      useCookie("refreshToken", COOKIE_OPTIONS).value = null;

      if (process.client) {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
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

      useCookie("user", COOKIE_OPTIONS).value = data.user;
      useCookie("accessToken", COOKIE_OPTIONS).value = data.accessToken;
      useCookie("refreshToken", COOKIE_OPTIONS).value = data.refreshToken;

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
    error.value = null;
    try {
      const { data } = await $api.get("/users/me");
      user.value = { ...user.value, ...data };
      useCookie("user", COOKIE_OPTIONS).value = user.value;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(profileData) {
    const { $api } = useNuxtApp();
    loading.value = true;
    error.value = null;
    try {
      const { data } = await $api.put("/users/me", profileData);
      user.value = { ...user.value, ...data };
      useCookie("user", COOKIE_OPTIONS).value = user.value;
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      throw err;
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
      useCookie("accessToken", COOKIE_OPTIONS).value = data.accessToken;
      return true;
    } catch (err) {
      return false;
    }
  }

  async function fetchSettings() {
    const { $api } = useNuxtApp();
    loading.value = true;
    error.value = null;
    try {
      const { data } = await $api.get("/users/settings/profile");
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateSettings(settingsData) {
    const { $api } = useNuxtApp();
    loading.value = true;
    error.value = null;
    try {
      const { data } = await $api.put("/users/settings/profile", settingsData);
      return {
        message: data.message || "Settings updated successfully",
        user: data.user,
      };
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPaymentProviders() {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.get("/users/payments");
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function updatePaymentProvider(providerData) {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.post("/users/payments", providerData);
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deletePaymentProvider(id) {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.delete(`/users/payments/${id}`);
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function setPreferredPaymentProvider(id) {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.patch(`/users/payments/${id}/prefer`);
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPaymentSettings() {
    const { $api } = useNuxtApp();
    loading.value = true;
    error.value = null;
    try {
      const { data } = await $api.get("/users/payments/manual");
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updatePaymentSettings(paymentData) {
    const { $api } = useNuxtApp();
    loading.value = true;
    error.value = null;
    try {
      const { data } = await $api.put("/users/payments/manual", paymentData);
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
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
    updateProfile,
    fetchSettings,
    updateSettings,
    fetchPaymentSettings,
    updatePaymentSettings,
    fetchPaymentProviders,
    updatePaymentProvider,
    deletePaymentProvider,
    setPreferredPaymentProvider,
    syncFromCookies,
    syncFromLS,
    refreshAccessToken,
  };
});
