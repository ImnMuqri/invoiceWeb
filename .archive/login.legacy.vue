<template>
  <div class="lf">
    <div class="lf__head">
      <span class="lf__eyebrow">Sign in</span>
      <h1 class="lf__title">Welcome back.</h1>
      <p class="lf__sub">Enter your credentials to continue.</p>
    </div>

    <form class="lf__form" @submit.prevent="handleLogin" novalidate>
      <div class="lf__field">
        <label for="email" class="lf__label">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
          class="lf__input" />
      </div>

      <div class="lf__field">
        <div class="lf__label-row">
          <label for="password" class="lf__label">Password</label>
          <a href="#" class="lf__link">Forgot?</a>
        </div>
        <input
          id="password"
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          placeholder="••••••••"
          required
          class="lf__input" />
      </div>

      <button type="submit" :disabled="authStore.loading" class="lf__btn">
        <UiIcon
          v-if="authStore.loading"
          icon="heroicons:arrow-path"
          custom-class="w-4 h-4 animate-spin" />
        <span>{{ authStore.loading ? "Signing in…" : "Sign in" }}</span>
        <svg
          v-if="!authStore.loading"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="lf__btn-arrow">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </form>

    <div class="lf__sep">
      <span>or</span>
    </div>

    <button class="lf__google">
      <svg class="lf__g-icon" viewBox="0 0 48 48">
        <path
          fill="#FFC107"
          d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.9 0 5.5 1 7.5 2.7l5.7-5.7C33.7 6.6 29.1 5 24 5 12.4 5 3 14.4 3 26s9.4 21 21 21c11 0 20.3-8 20.3-21 0-1.4-.1-2.7-.3-4H43.6z" />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.6 15.7 19 13 24 13c2.9 0 5.5 1 7.5 2.7l5.7-5.7C33.7 6.6 29.1 5 24 5c-7.6 0-14.2 4.1-17.7 9.7z" />
        <path
          fill="#4CAF50"
          d="M24 47c5 0 9.6-1.7 13.1-4.5l-6.1-5.2C29.2 38.7 26.7 39.5 24 39.5c-5.3 0-9.8-3.6-11.3-8.5l-6.6 5.1C9.7 42.8 16.4 47 24 47z" />
        <path
          fill="#1976D2"
          d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.8l6.1 5.2c3.6-3.3 5.8-8.2 5.8-14 0-1.4-.1-2.7-.3-4H43.6z" />
      </svg>
      Continue with Google
    </button>

    <p class="lf__switch">
      Don't have an account?
      <NuxtLink to="/register" class="lf__switch-link">Create one →</NuxtLink>
    </p>

    <UiToast v-model="toast" />
  </div>
</template>

<script setup>
definePageMeta({ layout: "auth" });
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useAuthStore } from "~/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();
const toast = ref({ message: "", type: "success" });
const email = ref("");
const password = ref("");

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value);
    router.push("/dashboard/");
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || authStore.error || "Login failed",
      type: "error",
    };
  }
};
</script>

<style scoped>
.lf {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Head */
.lf__head {
  margin-bottom: 2.25rem;
}

.lf__eyebrow {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #059669;
  margin-bottom: 0.875rem;
}

.lf__title {
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: -0.035em;
  color: #1a1d23;
  line-height: 1.15;
  margin-bottom: 0.5rem;
}

.lf__sub {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Form */
.lf__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
}

.lf__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.lf__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
}

.lf__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lf__link {
  font-size: 0.8rem;
  color: #059669;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s ease;
}
.lf__link:hover {
  color: #047857;
}

.lf__input {
  width: 100%;
  padding: 0.6875rem 0.875rem;
  font-size: 0.875rem;
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
  color: #1a1d23;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  -webkit-appearance: none;
}
.lf__input::placeholder {
  color: #9ca3af;
}
.lf__input:focus {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

/* Primary button */
.lf__btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8125rem 1.5rem;
  background: #1a1d23;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.lf__btn:hover:not(:disabled) {
  background: #2d3748;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.14);
}
.lf__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.lf__btn-arrow {
  width: 13px;
  height: 13px;
  transition: transform 0.15s ease;
}
.lf__btn:hover .lf__btn-arrow {
  transform: translateX(2px);
}

/* Separator */
.lf__sep {
  position: relative;
  text-align: center;
  margin-bottom: 1.25rem;
}
.lf__sep::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
}
.lf__sep span {
  position: relative;
  background: #f8f9fa;
  padding: 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Google */
.lf__google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 0.6875rem 1.5rem;
  background: #fff;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 2rem;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}
.lf__google:hover {
  background: #f9fafb;
  border-color: rgba(0, 0, 0, 0.18);
}
.lf__g-icon {
  width: 18px;
  height: 18px;
}

/* Switch */
.lf__switch {
  font-size: 0.8125rem;
  color: #6b7280;
}
.lf__switch-link {
  color: #059669;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.15s ease;
}
.lf__switch-link:hover {
  color: #047857;
}
</style>
