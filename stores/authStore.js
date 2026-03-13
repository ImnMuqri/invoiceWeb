import { defineStore, skipHydrate } from "pinia";
import { ref, computed, watch, onMounted } from "vue";

export const useAuthStore = defineStore("auth", () => {
  // Use simple refs for state to ensure better Pinia hydration
  const user = ref(null);
  const accessToken = ref(null);
  const refreshToken = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const isReady = ref(false);

  const token = computed(() => accessToken.value);
  const isPro = computed(() => {
    return user.value?.plan === "PRO" || user.value?.plan === "MAX";
  });

  // Function to sync from cookies to store (SSR safe)
  function syncFromCookies() {
    const u = useCookie("user").value;
    const at = useCookie("accessToken").value;
    const rt = useCookie("refreshToken").value;

    if (at) {
      accessToken.value = at;
      refreshToken.value = rt;
      user.value = u;
    }
  }

  // Initial sync
  syncFromCookies();

  if (process.client) {
    onMounted(() => {
      // If we have state but no LS, backup to LS
      if (accessToken.value && !localStorage.getItem("accessToken")) {
        localStorage.setItem("user", JSON.stringify(user.value));
        localStorage.setItem("accessToken", accessToken.value);
        localStorage.setItem("refreshToken", refreshToken.value);
      }

      // If we have NO state but have LS, restore from LS
      else if (!accessToken.value && localStorage.getItem("accessToken")) {
        console.log("[authStore] Restoring from LocalStorage...");
        accessToken.value = localStorage.getItem("accessToken");
        refreshToken.value = localStorage.getItem("refreshToken");
        const savedUser = localStorage.getItem("user");
        if (savedUser) user.value = JSON.parse(savedUser);

        // Push back to cookies
        useCookie("user").value = user.value;
        useCookie("accessToken").value = accessToken.value;
        useCookie("refreshToken").value = refreshToken.value;
      }

      isReady.value = true;
    });

    // Update cookies and LS when state changes
    watch(
      [user, accessToken, refreshToken],
      ([u, at, rt]) => {
        if (!isReady.value) return;

        console.log(`[authStore] State change detected: AT=${!!at}`);
        const uCookie = useCookie("user", { path: "/" });
        const atCookie = useCookie("accessToken", { path: "/" });
        const rtCookie = useCookie("refreshToken", { path: "/" });

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

  async function login(email, password) {
    console.log("[authStore] login() called");
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.post("/auth/login", { email, password });
      user.value = data.user;
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;

      // Explicitly set cookies immediately for middleware
      useCookie("user", { path: "/" }).value = data.user;
      useCookie("accessToken", { path: "/" }).value = data.accessToken;
      useCookie("refreshToken", { path: "/" }).value = data.refreshToken;

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
      console.error("Backend logout failed:", err);
    } finally {
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;

      // Clear cookies immediately
      useCookie("user").value = null;
      useCookie("accessToken").value = null;
      useCookie("refreshToken").value = null;

      if (process.client) {
        window.location.href = "/login";
      }
    }
  }

  async function register(name, email, password) {
    const { $api } = useNuxtApp();
    loading.value = true;
    error.value = null;
    try {
      const { data } = await $api.post("/auth/register", {
        name,
        email,
        password,
      });
      user.value = data.user;
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;

      useCookie("user", { path: "/" }).value = data.user;
      useCookie("accessToken", { path: "/" }).value = data.accessToken;
      useCookie("refreshToken", { path: "/" }).value = data.refreshToken;

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
      useCookie("user", { path: "/" }).value = user.value;
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
      useCookie("user", { path: "/" }).value = user.value;
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
      useCookie("accessToken", { path: "/" }).value = data.accessToken;
      return true;
    } catch (err) {
      console.error("Failed to refresh access token:", err);
      return false;
    }
  }

  async function fetchSettings() {
    const { $api } = useNuxtApp();
    loading.value = true;
    error.value = null;
    try {
      const { data } = await $api.get("/users/settings");
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
      const { data } = await $api.put("/users/settings", settingsData);
      return true;
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
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    fetchSettings,
    updateSettings,
    syncFromCookies,
    refreshAccessToken,
  };
});
