import axios from "axios";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const api = axios.create({
    baseURL: `${config.public.apiBase}/api`,
  });

  // Request interceptor to add the token
  api.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  });

  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // Response interceptor to handle 401/403/404 errors
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const authStore = useAuthStore();
      const originalRequest = error.config;

      // Handle 401 (Unauthorized) - Attempt Refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        // If the error is from the refresh endpoint itself, don't try to refresh again!
        if (originalRequest.url?.includes("/auth/refresh")) {
          if (process.client) {
            authStore.logout();
          }
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshed = await authStore.refreshAccessToken();
          if (refreshed) {
            const token = authStore.accessToken;
            processQueue(null, token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          } else {
            processQueue(new Error("Refresh failed"), null);
            if (process.client) {
              authStore.logout();
            }
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          if (process.client) {
            authStore.logout();
          }
        } finally {
          isRefreshing = false;
        }
      }

      // Handle 401 (Unauthorized) - Only logout if it's a 401 and refresh already failed or is not possible
      if (error.response?.status === 401) {
        // If we are already retrying or it's the refresh endpoint, then logout
        if (
          originalRequest._retry ||
          originalRequest.url?.includes("/auth/refresh")
        ) {
          if (process.client) {
            authStore.logout();
          }

          if (
            process.client &&
            window.location.pathname !== "/login" &&
            window.location.pathname !== "/register"
          ) {
            window.location.href = "/login";
          }
        }
      }
      return Promise.reject(error);
    },
  );

  return {
    provide: {
      api: api,
    },
  };
});
