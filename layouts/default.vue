<template>
  <div style="zoom: 0.9">
    <div
      class="h-[111.11vh] bg-slate-50 flex overflow-hidden font-sans text-sm">
      <!-- Sidebar -->
      <aside
        class="hidden w-[280px] md:flex flex-col bg-[#f7f7f9] border-r border-[#e5e5e5] flex-shrink-0 z-10 transition-colors">
        <div class="h-20 flex items-center px-6 mt-2">
          <UiLogo size="md" />
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
        <div v-if="!authStore.isPro" class="px-4 mb-4">
          <div
            class="bg-white rounded-2xl p-5 border border-[#e5e5e5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative transition-all hover:bg-slate-50/50">
            <div class="relative">
              <div class="flex items-center gap-2 mb-2">
                <h5
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                  Limited Plan
                </h5>
              </div>
              <p class="text-[14px] font-bold text-slate-900 mb-1">
                Upgrade to Pro
              </p>
              <p
                class="text-[12px] text-slate-500 font-medium leading-relaxed mb-4">
                Get unlimited invoices, WhatsApp reminders and AI drafts.
              </p>
              <NuxtLink
                to="/settings?tab=billing"
                class="block w-full text-center py-2.5 bg-slate-900 text-white text-[12px] font-bold rounded-xl hover:bg-slate-800 transition-all shadow-sm">
                Upgrade Now
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-[#e5e5e5]">
          <p
            class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">
            invokita v1.0.0
          </p>
          <p
            class="text-[11px] font-bold text-slate-400 capitalize tracking-[0.2em] text-center">
            powered by Bsyx
          </p>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Top Navbar (Desktop) -->
        <header
          class="hidden md:flex h-16 items-end justify-end px-8 gap-6 flex-shrink-0">
          <!-- Notifications -->
          <button
            class="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all group">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span
              class="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 border-2 border-white rounded-full"></span>
          </button>

          <!-- Divider -->
          <div class="h-6 w-px bg-[#e5e5e5]"></div>

          <!-- User Profile -->
          <UiPopover placement="bottom-end">
            <template #trigger="{ isOpen }">
              <div class="flex items-center gap-3 group cursor-pointer">
                <div class="text-right hidden sm:block">
                  <p class="text-sm font-bold text-slate-900 leading-none mb-1">
                    {{ authStore.user?.name || "User" }}
                  </p>
                  <div class="flex items-center justify-end gap-1.5">
                    <span class="relative flex h-2 w-2">
                      <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span
                        class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p
                      class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {{ authStore.user?.plan || "Free" }} Plan
                    </p>
                  </div>
                </div>
                <div
                  :class="[
                    'w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold shadow-sm border transition-all',
                    isOpen
                      ? 'border-indigo-500 ring-4 ring-indigo-50'
                      : 'border-slate-700 group-hover:border-slate-500',
                  ]">
                  {{ (authStore.user?.name || "U").charAt(0).toUpperCase() }}
                </div>
              </div>
            </template>
            <template #default="{ close }">
              <!-- Category Header -->
              <div class="px-2 py-1.5 border-b border-slate-100 bg-slate-50/50">
                <span
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >Account</span
                >
              </div>

              <div class="p-2">
                <NuxtLink
                  to="/settings"
                  @click="close"
                  class="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-all">
                  <svg
                    class="w-4 h-4"
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
                  User Settings
                </NuxtLink>
                <div class="h-px bg-slate-100 my-1 mx-2"></div>
                <button
                  @click="
                    isLogoutModalOpen = true;
                    close();
                  "
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-all text-left border-none bg-transparent">
                  <svg
                    class="w-4 h-4"
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
                </button>
              </div>
            </template>
          </UiPopover>
        </header>

        <!-- Header (Mobile) -->
        <header
          class="md:hidden h-16 flex items-center justify-between px-4 bg-white border-b border-slate-200">
          <UiLogo size="sm" />
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

        <main
          class="flex-1 overflow-y-auto p-4 md:px-6 lg:px-8 relative min-h-0">
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
                    <UiLogo size="md" />
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

                  <div v-if="!authStore.isPro" class="px-4 mb-8">
                    <div
                      class="bg-white rounded-2xl p-5 border border-[#e5e5e5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative">
                      <div class="relative">
                        <div class="flex items-center gap-2 mb-2">
                          <h5
                            class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                            Limited Plan
                          </h5>
                        </div>
                        <p class="text-[14px] font-bold text-slate-900 mb-1">
                          Upgrade to Pro
                        </p>
                        <p
                          class="text-[12px] text-slate-500 font-medium leading-relaxed mb-4">
                          Get unlimited invoices, WhatsApp reminders and AI
                          drafts.
                        </p>
                        <NuxtLink
                          to="/settings?tab=billing"
                          @click="isMobileMenuOpen = false"
                          class="block w-full text-center py-2.5 bg-slate-900 text-white text-[12px] font-bold rounded-xl hover:bg-slate-800 transition-all shadow-sm">
                          Upgrade Now
                        </NuxtLink>
                      </div>
                    </div>
                  </div>

                  <!-- Bottom Sidebar Action -->
                  <div class="p-6 border-t border-[#e5e5e5]">
                    <p
                      class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">
                      invokita v1.0.0
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <UiModal v-model="isLogoutModalOpen" maxWidth="sm">
      <div class="p-6">
        <div
          class="flex items-center justify-center w-12 h-12 mx-auto bg-slate-100 rounded-full mb-4">
          <svg
            class="w-6 h-6 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </div>
        <div class="text-center">
          <h3 class="text-lg font-semibold text-slate-900">Sign Out?</h3>
          <p class="mt-2 text-sm text-slate-500 font-medium">
            Are you sure you want to sign out of your account?
          </p>
        </div>
        <div class="mt-6 flex flex-col gap-3">
          <button
            @click="authStore.logout()"
            class="w-full inline-flex justify-center items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-colors">
            Yes, Sign Out
          </button>
          <button
            @click="isLogoutModalOpen = false"
            class="w-full inline-flex justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<style scoped>
/* Custom Scrollbar for scrollable containers */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e1; /* slate-300 */
  border-radius: 20px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8; /* slate-400 */
}
</style>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "~/stores/authStore";

const route = useRoute();
const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);
const isLogoutModalOpen = ref(false);

watch(isMobileMenuOpen, (isOpen) => {
  if (process.client) {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
});
</script>
