<template>
  <div>
    <h2
      class="text-center text-3xl font-black tracking-tight text-slate-900 mb-2">
      Welcome back
    </h2>
    <p class="text-center text-slate-500 mb-8 font-medium">
      Sign in to your account
    </p>

    <div
      class="bg-white/70 backdrop-blur-md py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl sm:px-10 border border-slate-200/80">
      <form class="space-y-6" @submit.prevent="handleLogin">
        <div>
          <label for="email" class="block text-sm font-semibold text-slate-700"
            >Email address</label
          >
          <div class="mt-2">
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm bg-white transition-shadow" />
          </div>
        </div>
        <div>
          <label
            for="password"
            class="block text-sm font-semibold text-slate-700"
            >Password</label
          >
          <div class="mt-2">
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm bg-white transition-shadow" />
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-emerald-600 focus:ring-emerald-600 border-slate-300 rounded" />
            <label
              for="remember-me"
              class="ml-2 block text-sm font-medium text-slate-700">
              Remember me
            </label>
          </div>
          <div class="text-sm">
            <a
              href="#"
              class="font-semibold text-emerald-600 hover:text-emerald-600 transition-colors">
              Forgot your password?
            </a>
          </div>
        </div>
        <div>
          <button
            type="submit"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors">
            Sign in
          </button>
        </div>
      </form>
      <div class="mt-8 relative">
        <div class="absolute inset-0 flex items-center" aria-hidden="true">
          <div class="w-full border-t border-slate-200/80"></div>
        </div>
        <div class="relative flex justify-center">
          <span
            class="px-3 bg-white/70 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-400 uppercase tracking-widest"
            >Or continue with</span
          >
        </div>
      </div>
      <div class="mt-6">
        <button
          class="w-full flex justify-center items-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-all">
          <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
          </svg>
          Sign in with Google
        </button>
      </div>

      <div class="mt-8 text-center text-sm font-medium text-slate-500">
        Not a member?
        <NuxtLink
          to="/register"
          class="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >Create an account</NuxtLink
        >
      </div>
    </div>
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
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push("/dashboard");
  } else {
    toast.value = { message: authStore.error, type: "error" };
  }
};
</script>
