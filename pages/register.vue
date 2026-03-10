<template>
  <div>
    <h2
      class="text-center text-3xl font-black tracking-tight text-slate-900 mb-2">
      Create an account
    </h2>
    <p class="text-center text-slate-500 mb-8 font-medium">
      Start invoicing weightlessly today.
    </p>

    <div
      class="bg-white/70 backdrop-blur-md py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl sm:px-10 border border-slate-200/80">
      <form class="space-y-6" @submit.prevent="handleRegister">
        <div>
          <label for="name" class="block text-sm font-semibold text-slate-700"
            >Full Name</label
          >
          <div class="mt-2">
            <input
              id="name"
              v-model="name"
              name="name"
              type="text"
              autocomplete="name"
              required
              class="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white transition-shadow" />
          </div>
        </div>
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
              class="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white transition-shadow" />
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
              autocomplete="new-password"
              required
              class="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white transition-shadow" />
          </div>
        </div>
        <div>
          <button
            type="submit"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors">
            Start Free Trial
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
            >Or sign up with</span
          >
        </div>
      </div>
      <div class="mt-6">
        <button
          class="w-full flex justify-center items-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-all">
          <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
          </svg>
          Sign up with Google
        </button>
      </div>
      <div class="mt-8 text-center text-sm font-medium text-slate-500">
        Already have an account?
        <NuxtLink
          to="/login"
          class="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
          >Log in</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: "auth" });
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useAuthStore } from "~/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");

const handleRegister = async () => {
  const success = await authStore.register(
    name.value,
    email.value,
    password.value,
  );
  if (success) {
    router.push("/dashboard");
  } else {
    alert(authStore.error);
  }
};
</script>
