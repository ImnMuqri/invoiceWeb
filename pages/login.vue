<template>
  <div>
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
              <input id="email" name="email" type="email" autocomplete="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm">
            </div>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
              <input id="password" name="password" type="password" autocomplete="current-password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm">
            </div>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded">
              <label for="remember-me" class="ml-2 block text-sm text-gray-900"> Remember me </label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-medium text-slate-600 hover:text-slate-500"> Forgot your password? </a>
            </div>
          </div>
          <div>
            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">Sign in</button>
          </div>
        </form>
        <div class="mt-6 flex justify-center gap-2 text-sm text-gray-600">
          Not a member?
          <NuxtLink to="/register" class="font-medium text-slate-800 hover:text-slate-700">Sign up</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' })
import { useRouter } from 'vue-router'
const router = useRouter()

const handleLogin = () => {
  // Mock login, just redirect to dashboard
  router.push('/dashboard')
}
</script>
