import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { shouldRedirectToLogin } from "~/utils/routeAccess";

export const useAuthStore = defineStore("auth", () => {
  const user = useState("auth_user", () => null);
  const accessToken = useState("auth_accessToken", () => null);
  const refreshToken = useState("auth_refreshToken", () => null);

  const loading = ref(false);
  const error = ref(null);
  const isHydrated = ref(false);

  const token = computed(() => accessToken.value);

  const isPro = computed(() => {
    const p = user.value?.plan?.toUpperCase();
    return p && p !== "FREE" && p !== "PENDING" && p !== "CANCELLED";
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

    // Robust SSR fallback for production (Cloudflare Workers / Node)
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
    error.value = null;

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
        // Same guard as the axios interceptor: logging out while the visitor is
        // reading a public page should clear the session, not relocate them.
        // Previously this had no path check at all.
        if (shouldRedirectToLogin(window.location.pathname)) {
          window.location.href = "/login";
        } else {
          window.location.reload();
        }
      }
    }
  }

  async function fetchProfile() {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.get("/users/me");
      user.value = data;
      return data;
    } catch (err) {
      error.value = "Failed to fetch profile";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(profileData) {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.put("/users/me", profileData);
      user.value = data;
      return data;
    } catch (err) {
      error.value = "Failed to update profile";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function changePassword(passwords) {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.post("/users/change-password", passwords);
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to update password";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSettings() {
    const { $api } = useNuxtApp();
    try {
      const { data } = await $api.get("/users/settings/profile");
      return data;
    } catch (err) {
      console.error("Failed to fetch settings", err);
      return null;
    }
  }

  // Fetches only the invoice config fields (invoiceInclude*, defaultTaxRate, invoicePrefix)
  // Called on invoice create/edit mount — keeps /me lean
  async function fetchInvoiceConfig() {
    const { $api } = useNuxtApp();
    try {
      const { data } = await $api.get("/users/settings/profile");
      return {
        invoiceIncludeName: data.invoiceIncludeName ?? true,
        invoiceIncludeEmail: data.invoiceIncludeEmail ?? false,
        invoiceIncludePersonalPhone: data.invoiceIncludePersonalPhone ?? false,
        invoiceIncludeCompanyPhone: data.invoiceIncludeCompanyPhone ?? true,
        invoiceIncludeCompanyName: data.invoiceIncludeCompanyName ?? true,
        invoiceIncludeAddress: data.invoiceIncludeAddress ?? true,
        defaultTaxRate: data.defaultTaxRate ?? 0,
        invoicePrefix: data.invoicePrefix ?? "INV",
        /* Spec 05. The two switches AND the four values, because the builder
           preview has to draw what the saved document will say and the invoice
           does not exist yet to be read from. */
        invoiceIncludeTaxIdentifiers: data.invoiceIncludeTaxIdentifiers ?? true,
        invoiceIncludeClientIdentifiers: data.invoiceIncludeClientIdentifiers ?? true,
        registrationNumber: data.registrationNumber ?? "",
        tin: data.tin ?? "",
        msicCode: data.msicCode ?? "",
        sstNumber: data.sstNumber ?? "",
        /* Spec 09. Passed straight through — the server decided whether this
           account shows attribution and what it says, and the preview must not
           form a second opinion about it. Null means draw nothing. */
        attribution: data.attribution ?? null,
        attributionEnabled: data.attributionEnabled ?? true,
        canRemoveAttribution: data.canRemoveAttribution ?? false,
      };
    } catch (err) {
      console.error("Failed to fetch invoice config", err);
      // Safe defaults so the invoice builder never crashes
      return {
        invoiceIncludeName: true,
        invoiceIncludeEmail: false,
        invoiceIncludePersonalPhone: false,
        invoiceIncludeCompanyPhone: true,
        invoiceIncludeCompanyName: true,
        invoiceIncludeAddress: true,
        defaultTaxRate: 0,
        invoicePrefix: "INV",
        invoiceIncludeTaxIdentifiers: true,
        invoiceIncludeClientIdentifiers: true,
        /* Empty, not absent. The preview then simply omits the block rather
           than drawing a half-built one from a failed request. */
        registrationNumber: "",
        tin: "",
        msicCode: "",
        sstNumber: "",
      };
    }
  }

  async function updateSettings(settingsData) {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.put("/users/settings/profile", settingsData);
      return data;
    } catch (err) {
      error.value = "Failed to update settings";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPaymentSettings() {
    const { $api } = useNuxtApp();
    try {
      const { data } = await $api.get("/users/payments/manual");
      return data;
    } catch (err) {
      console.error("Failed to fetch payment settings", err);
      return null;
    }
  }

  async function updatePaymentSettings(paymentData) {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      const { data } = await $api.put("/users/payments/manual", paymentData);
      return data;
    } catch (err) {
      error.value = "Failed to update payment settings";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPaymentProviders() {
    const { $api } = useNuxtApp();
    try {
      const { data } = await $api.get("/users/payments");
      return data;
    } catch (err) {
      console.error("Failed to fetch payment providers", err);
      return [];
    }
  }

  async function updatePaymentProvider(providerData) {
    const { $api } = useNuxtApp();
    try {
      const { data } = await $api.post("/users/payments", providerData);
      return data;
    } catch (err) {
      error.value = "Failed to save payment provider";
      throw err;
    }
  }

  async function deletePaymentProvider(id) {
    const { $api } = useNuxtApp();
    try {
      await $api.delete(`/users/payments/${id}`);
    } catch (err) {
      error.value = "Failed to delete payment provider";
      throw err;
    }
  }

  async function setPreferredPaymentProvider(id) {
    const { $api } = useNuxtApp();
    try {
      const { data } = await $api.patch(`/users/payments/${id}/prefer`);
      return data;
    } catch (err) {
      error.value = "Failed to set preferred provider";
      throw err;
    }
  }

  async function uploadLogo(file) {
    const { $api } = useNuxtApp();
    const formData = new FormData();
    formData.append("file", file);

    loading.value = true;
    try {
      const { data } = await $api.post("/users/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Update local user state
      if (user.value && user.value.profile) {
        user.value.profile.logoUrl = data.logoUrl;
      }
      return data;
    } catch (err) {
      error.value = "Failed to upload logo";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteLogo() {
    const { $api } = useNuxtApp();
    loading.value = true;
    try {
      await $api.delete("/users/logo");
      if (user.value && user.value.profile) {
        user.value.profile.logoUrl = null;
      }
    } catch (err) {
      error.value = "Failed to delete logo";
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
    updateProfile,
    changePassword,
    fetchSettings,
    fetchInvoiceConfig,
    updateSettings,
    fetchPaymentSettings,
    updatePaymentSettings,
    fetchPaymentProviders,
    updatePaymentProvider,
    deletePaymentProvider,
    setPreferredPaymentProvider,
    uploadLogo,
    deleteLogo,
    refreshAccessToken,
    syncFromCookies,
  };
});
