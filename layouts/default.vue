<template>
  <div style="zoom: 0.9">
    <div
      class="h-[111.11vh] bg-slate-50 flex overflow-hidden font-sans text-sm">
      <!-- Sidebar -->
      <aside
        class="hidden w-[280px] md:flex flex-col bg-[#f7f7f9] border-r border-[#e5e5e5] flex-shrink-0 z-10 transition-colors">
        <div class="h-20 flex items-center px-6 mt-2">
          <div
            class="flex items-center gap-2 text-[22px] tracking-tight font-semibold text-slate-900">
            <svg
              class="w-6 h-6 text-slate-900"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <path
                d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
              <path d="M7 7h.01" />
            </svg>
            InvoMate
          </div>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <!-- Search -->
          <div class="mb-6 px-2">
            <div class="relative">
              <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                type="text"
                placeholder="Search"
                class="w-full bg-[#ebebec] border-none rounded-xl py-2 pl-9 pr-8 text-sm text-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-slate-300 transition-shadow" />
              <div
                class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-white shadow-sm border border-[#e5e5e5]">
                /
              </div>
            </div>
          </div>

          <NuxtLink
            to="/dashboard"
            class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="bg-[#ebebec] text-slate-900">
            <svg
              class="w-[18px] h-[18px] mr-3 opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Dashboard
          </NuxtLink>

          <!-- DATA -->
          <div class="pt-6 pb-2 px-4">
            <h4
              class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              DATA
            </h4>
          </div>

          <NuxtLink
            to="/invoices"
            class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="bg-[#ebebec] text-slate-900"
            :class="{
              'bg-[#ebebec] text-slate-900 flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl':
                $route.path.startsWith('/invoices'),
            }">
            <svg
              class="w-[18px] h-[18px] mr-3 opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Invoices
          </NuxtLink>
          <NuxtLink
            to="/clients"
            class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="bg-[#ebebec] text-slate-900">
            <svg
              class="w-[18px] h-[18px] mr-3 opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Clients
          </NuxtLink>
          <!-- SYSTEM -->
          <div class="pt-6 pb-2 px-4">
            <h4
              class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              SYSTEM
            </h4>
          </div>

          <NuxtLink
            to="/settings"
            class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="bg-[#ebebec] text-slate-900">
            <svg
              class="w-[18px] h-[18px] mr-3 opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Settings
          </NuxtLink>
        </nav>
        <div class="p-4 border-t border-[#e5e5e5]">
          <NuxtLink
            to="/login"
            class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#ebebec] transition-colors">
            <svg
              class="w-[18px] h-[18px] mr-3 opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Sign Out
          </NuxtLink>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header (Mobile) -->
        <header
          class="md:hidden h-16 flex items-center justify-between px-4 bg-white border-b border-slate-200">
          <div
            class="flex items-center gap-1 text-lg font-extrabold text-slate-800">
            <svg
              class="w-5 h-5 text-slate-900"
              viewBox="0 0 24 24"
              fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            InvoMate
          </div>
          <button
            @click="isMobileMenuOpen = true"
            class="p-2 text-slate-500 hover:bg-gray-50 rounded-md">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </header>

        <main class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative min-h-0">
          <div class="w-full h-full">
            <slot />
          </div>
        </main>
      </div>

      <!-- Mobile Sidebar Overlay & Menu -->
      <div
        v-if="isMobileMenuOpen"
        class="relative z-50 md:hidden"
        aria-labelledby="slide-over-title"
        role="dialog"
        aria-modal="true">
        <!-- Background backdrop -->
        <div
          class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
          @click="isMobileMenuOpen = false"></div>

        <div class="fixed inset-0 overflow-hidden pointer-events-none">
          <div class="absolute inset-0 overflow-hidden">
            <div
              class="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
              <!-- Slide-over panel -->
              <div
                class="pointer-events-auto relative w-[280px] w-max-md transform transition-transform ease-in-out duration-300">
                <div class="flex h-full flex-col bg-[#f7f7f9] shadow-xl">
                  <!-- Close Button Header -->
                  <div
                    class="h-16 flex items-center justify-between px-6 border-b border-[#e5e5e5]">
                    <div
                      class="flex items-center gap-2 text-[22px] tracking-tight font-semibold text-slate-900">
                      <svg
                        class="w-6 h-6 text-slate-900"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <path
                          d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                        <path d="M7 7h.01" />
                      </svg>
                      InvoMate
                    </div>
                    <button
                      type="button"
                      @click="isMobileMenuOpen = false"
                      class="relative rounded-md text-slate-400 hover:text-slate-600 focus:outline-none">
                      <span class="absolute -inset-2.5"></span>
                      <span class="sr-only">Close panel</span>
                      <svg
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2.5"
                        stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <!-- Navigation Links -->
                  <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <NuxtLink
                      to="/dashboard"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900">
                      <svg
                        class="w-[18px] h-[18px] mr-3 opacity-70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                      </svg>
                      Dashboard
                    </NuxtLink>

                    <div class="pt-6 pb-2 px-4">
                      <h4
                        class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        DATA
                      </h4>
                    </div>
                    <NuxtLink
                      to="/invoices"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900"
                      :class="{
                        'bg-[#ebebec] text-slate-900 flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl':
                          $route.path.startsWith('/invoices'),
                      }">
                      <svg
                        class="w-[18px] h-[18px] mr-3 opacity-70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      Invoices
                    </NuxtLink>
                    <NuxtLink
                      to="/clients"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900">
                      <svg
                        class="w-[18px] h-[18px] mr-3 opacity-70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      Clients
                    </NuxtLink>

                    <div class="pt-6 pb-2 px-4">
                      <h4
                        class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        SYSTEM
                      </h4>
                    </div>
                    <NuxtLink
                      to="/settings"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900">
                      <svg
                        class="w-[18px] h-[18px] mr-3 opacity-70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      Settings
                    </NuxtLink>
                  </nav>

                  <!-- Bottom Sidebar Action -->
                  <div class="p-4 border-t border-[#e5e5e5]">
                    <NuxtLink
                      to="/login"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#ebebec] transition-colors">
                      <svg
                        class="w-[18px] h-[18px] mr-3 opacity-70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      Sign Out
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isMobileMenuOpen = ref(false);
</script>
