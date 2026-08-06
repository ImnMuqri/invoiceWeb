import axios from "axios";
import { shouldRedirectToLogin } from "~/utils/routeAccess";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const api = axios.create({
    baseURL: `${config.public.apiBase}/api`,
  });

  /* Progress. Every call through $api counts, which is what makes the bar mean
     "something on this page is loading" rather than "the route is changing".
     A request can opt out with `{ quiet: true }` — the notification poll runs
     every 30 seconds and would otherwise flash the bar forever. */
  const progress = useProgress();

  // Request interceptor to add the token
  api.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    if (!config.quiet) {
      config._progress = true;
      progress.start();
    }
    return config;
  });

  /* Paired with the request interceptor above, and deliberately its own pair:
     the response interceptor further down retries 401s through api(), so a
     single request can pass through here more than once. Keying off the flag we
     set on the config keeps start and done balanced. */
  api.interceptors.response.use(
    (response) => {
      if (response.config?._progress) {
        response.config._progress = false;
        progress.done();
      }
      return response;
    },
    (error) => {
      if (error.config?._progress) {
        error.config._progress = false;
        progress.done();
      }
      return Promise.reject(error);
    },
  );

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

          // Only eject the visitor if they are actually inside the app. A
          // background token refresh failing on a public marketing page must
          // not throw the reader onto the login screen — that is what made the
          // /ms landing page look like it "routes to login".
          if (
            process.client &&
            shouldRedirectToLogin(window.location.pathname)
          ) {
            window.location.href = "/login";
          }
        }
      }
      return Promise.reject(error);
    },
  );

  /* Route changes count too. A page that is code-split or guarded can spend
     real time resolving before any request goes out, and the bar should already
     be moving by then. page:finish only ends the navigation's own turn — the
     data fetches the new page kicks off keep the counter above zero on their
     own, so the bar runs continuously from click to rendered. */
  if (import.meta.client) {
    nuxtApp.hook("page:start", () => progress.start());
    nuxtApp.hook("page:finish", () => progress.done());
    /* A failed navigation never fires page:finish, which would strand the
       counter and leave the bar up until the next full reload. */
    nuxtApp.hook("vue:error", () => progress.reset());
  }

  return {
    provide: {
      api: api,
    },
  };
});
