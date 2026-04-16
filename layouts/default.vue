<template>
  <div style="zoom: 0.9">
    <!-- Maintenance Overlay -->
    <div
      v-if="systemStore.config.maintenanceMode && !authStore.isAdmin"
      class="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <!-- Animated Background Elements -->
      <div
        class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div
          class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px] animate-pulse"></div>
        <div
          class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] animate-pulse-slow"></div>
      </div>

      <div class="relative z-10 max-w-md w-full">
        <UiLogo
          size="lg"
          :showText="true"
          containerClass="flex-col mb-12 brightness-0 invert" />

        <div
          class="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div
            class="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <UiIcon
              icon="heroicons:wrench-screwdriver"
              class="w-8 h-8 text-emerald-400" />
          </div>

          <h1 class="text-2xl font-bold text-white mb-3 tracking-tight">
            Scheduled Maintenance
          </h1>
          <p class="text-slate-400 text-sm leading-relaxed mb-8">
            We're currently performing some essential updates to improve your
            invoicing experience. We'll be back online shortly. Thank you for
            your patience!
          </p>

          <div
            class="pt-6 border-t border-white/5 flex flex-col items-center gap-4">
            <div
              class="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <div
                class="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              <span
                class="text-[10px] font-bold text-slate-300 uppercase tracking-widest"
                >System Status: Updating</span
              >
            </div>
          </div>
        </div>

        <p
          class="mt-12 text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
          Engineered for excellence
        </p>
      </div>
    </div>

    <UiAuthLoader v-if="!authStore.isHydrated" />
    <UiWelcomeModal />
    <UiModuleHelpModal />
    <div
      v-if="authStore.isHydrated && !systemStore.config.maintenanceMode"
      class="h-[111.11vh] bg-slate-50 flex overflow-hidden font-sans text-sm">
      <!-- Sidebar -->
      <aside
        class="hidden w-[270px] md:flex flex-col bg-[#f7f7f9] flex-shrink-0 z-10 transition-colors">
        <div class="h-20 flex items-center justify-center mt-2">
          <UiLogo size="lg" />
        </div>
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <!-- Search -->
          <div class="mb-6">
            <div class="relative">
              <UiIcon
                icon="heroicons:magnifying-glass"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                class="w-full bg-[#ebebec] border-none rounded-xl py-2.5 pl-9 pr-8 text-sm text-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-slate-300 transition-shadow" />
              <div
                class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-white shadow-sm border border-[#e5e5e5]">
                /
              </div>
            </div>
          </div>

          <NuxtLink
            to="/dashboard/"
            class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="bg-[#ebebec] text-slate-900">
            <UiIcon
              icon="heroicons:home"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
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
            to="/invoices/"
            class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="bg-[#ebebec] text-slate-900"
            :class="{
              'bg-[#ebebec] text-slate-900 flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl':
                $route.path.startsWith('/invoices'),
            }">
            <UiIcon
              icon="heroicons:document-text"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
            Invoices
          </NuxtLink>
          <NuxtLink
            to="/clients/"
            class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="bg-[#ebebec] text-slate-900">
            <UiIcon
              icon="heroicons:users"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
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
            to="/settings/"
            class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="bg-[#ebebec] text-slate-900">
            <UiIcon
              icon="heroicons:cog-6-tooth"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
            Settings
          </NuxtLink>

          <!-- ADMIN -->
          <template v-if="authStore.isAdmin">
            <div class="pt-6 pb-2 px-4">
              <h4
                class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                ADMIN
              </h4>
            </div>
            <NuxtLink
              to="/admin/"
              class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
              active-class="bg-[#ebebec] text-slate-900"
              :class="{
                'bg-[#ebebec] text-slate-900':
                  $route.path === '/admin/' || $route.path === '/admin',
              }">
              <UiIcon
                icon="heroicons:command-line"
                class="w-[18px] h-[18px] mr-3 opacity-70" />
              System Management
            </NuxtLink>
            <NuxtLink
              to="/admin/tickets"
              class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
              active-class="bg-[#ebebec] text-slate-900"
              :class="{
                'bg-[#ebebec] text-slate-900':
                  $route.path.startsWith('/admin/tickets'),
              }">
              <UiIcon
                icon="heroicons:ticket"
                class="w-[18px] h-[18px] mr-3 opacity-70" />
              Support Tickets
            </NuxtLink>
          </template>
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

        <div class="px-4 mt-auto mb-8 text-center shrink-0">
          <p
            class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            invokita v1.0.0
          </p>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header (Mobile) -->
        <header
          class="md:hidden h-16 flex items-center justify-between px-4 bg-white border-b border-slate-200">
          <UiLogo size="sm" />
          <div class="flex items-center gap-2">
            <UiPopover placement="bottom-end">
              <template #trigger="{ isOpen }">
                <button
                  class="p-2 text-slate-500 hover:bg-gray-50 rounded-md relative"
                  :class="{ 'bg-gray-50 text-slate-900': isOpen }">
                  <UiIcon icon="heroicons:bell" custom-class="w-4 h-4" />
                  <span
                    v-if="notificationStore.unreadCount > 0"
                    class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                </button>
              </template>
              <template #default="{ close }">
                <div
                  class="w-[280px] max-h-[400px] flex flex-col shadow-xl border border-slate-100 rounded-xl bg-white overflow-hidden">
                  <div
                    class="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                    <span
                      class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                      >Updates</span
                    >
                    <button
                      v-if="notificationStore.unreadCount > 0"
                      @click="notificationStore.markAllAsRead()"
                      class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider hover:text-emerald-700">
                      Mark all read
                    </button>
                  </div>
                  <div class="p-2 overflow-y-auto flex-1 custom-scrollbar">
                    <div
                      v-if="notificationStore.notifications.length === 0"
                      class="text-center py-6 text-xs text-slate-500">
                      <UiIcon
                        icon="heroicons:bell-slash"
                        class="w-8 h-8 mx-auto mb-2 text-slate-200" />
                      No new notifications
                    </div>
                    <div v-else class="space-y-1">
                      <div
                        v-for="notif in notificationStore.notifications"
                        :key="notif.id"
                        @click="
                          notificationStore.markAsRead(notif.id);
                          close();
                        "
                        class="p-2.5 rounded-xl text-left cursor-pointer transition-all border border-transparent hover:border-slate-100"
                        :class="
                          notif.isRead
                            ? 'bg-transparent hover:bg-slate-50'
                            : 'bg-blue-50/50 hover:bg-blue-50'
                        ">
                        <div
                          class="flex items-start justify-between gap-2 mb-1">
                          <span
                            class="font-bold text-xs"
                            :class="
                              notif.isRead ? 'text-slate-700' : 'text-slate-900'
                            "
                            >{{ notif.title }}</span
                          >
                        </div>
                        <p
                          class="text-xs text-slate-500 leading-relaxed truncate"
                          :class="{
                            'font-medium text-slate-600': !notif.isRead,
                          }">
                          {{ notif.message }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </UiPopover>
            <button
              @click="isMobileMenuOpen = true"
              class="p-2 text-slate-500 hover:bg-gray-50 rounded-md">
              <UiIcon icon="heroicons:bars-3" class="w-6 h-6" />
            </button>
          </div>
        </header>

        <!-- Header (Desktop) -->
        <header
          class="hidden md:flex h-[80px] shrink-0 items-center justify-between pl-8 pr-10 bg-[#f7f7f9] w-full border-b border-slate-100/50">
          <div class="flex items-center gap-4">
            <h3 class="text-lg font-semibold text-slate-400 capitalize">
              Workspace /
              <span class="text-slate-900">{{
                route.meta.title || route.name
              }}</span>
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <!-- Notifications Popover -->
            <UiPopover placement="bottom-end">
              <template #trigger="{ isOpen }">
                <button
                  class="p-2.5 bg-white border border-[#e5e5e5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl relative transition-all"
                  :class="{
                    'ring-2 ring-emerald-500 border-transparent': isOpen,
                  }">
                  <UiIcon
                    icon="heroicons:bell"
                    class="w-5 h-5"
                    :custom-class="{
                      'text-emerald-500 w-4 h-4  ': isOpen,
                    }" />
                  <span
                    v-if="notificationStore.unreadCount > 0"
                    class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                </button>
              </template>
              <template #default="{ close }">
                <div
                  class="w-[320px] max-h-[400px] flex flex-col overflow-hidden rounded-2xl">
                  <div
                    class="flex items-center justify-between px-3 py-3 border-b border-slate-100 bg-slate-50/80 backdrop-blur w-[320px]">
                    <span class="text-[13px] font-semibold text-slate-500"
                      >Notifications</span
                    >
                    <button
                      v-if="notificationStore.unreadCount > 0"
                      @click="notificationStore.markAllAsRead()"
                      class="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                      Mark all as read
                    </button>
                  </div>
                  <div
                    class="p-2 overflow-y-auto flex-1 custom-scrollbar w-[320px]"
                    style="scrollbar-gutter: stable">
                    <div
                      v-if="notificationStore.notifications.length === 0"
                      class="text-center py-8 text-xs text-slate-500">
                      <UiIcon
                        icon="heroicons:bell-slash"
                        custom-class="w-6 h-6 mx-auto mb-3 text-slate-200" />
                      You're all caught up!
                    </div>
                    <div v-else class="space-y-1">
                      <div
                        v-for="notif in notificationStore.notifications"
                        :key="notif.id"
                        @click="
                          notificationStore.markAsRead(notif.id);
                          close();
                        "
                        class="p-3 rounded-xl text-left cursor-pointer transition-all border border-transparent hover:border-slate-100"
                        :class="
                          notif.isRead
                            ? 'bg-transparent hover:bg-slate-50'
                            : 'bg-blue-50/40 hover:bg-blue-50/80'
                        ">
                        <div
                          class="flex items-start justify-between gap-3 mb-1.5">
                          <span
                            class="font-semibold text-[13px]"
                            :class="
                              notif.isRead ? 'text-slate-700' : 'text-slate-900'
                            "
                            >{{ notif.title }}</span
                          >
                          <span
                            class="text-[10px] font-medium text-slate-400 whitespace-nowrap mt-0.5"
                            >{{ formatDate(notif.createdAt) }}</span
                          >
                        </div>
                        <p
                          class="text-[12px] text-slate-500 leading-relaxed"
                          :class="{
                            'font-medium text-slate-600': !notif.isRead,
                          }">
                          {{ notif.message }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </UiPopover>

            <div class="w-px h-6 bg-slate-200 mx-1"></div>

            <!-- User Profile Popover -->
            <UiPopover placement="bottom-end">
              <template #trigger="{ isOpen }">
                <div
                  class="flex items-center gap-3 px-3 py-2 bg-white rounded-xl border border-[#e5e5e5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] cursor-pointer group hover:bg-slate-50 transition-all"
                  :class="{
                    'ring-2 ring-emerald-500 border-transparent': isOpen,
                  }">
                  <div
                    class="w-8 h-8 rounded-md bg-emerald-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm shrink-0 uppercase">
                    {{ (authStore.user?.name || "U").charAt(0) }}
                  </div>
                  <div class="hidden sm:block min-w-0">
                    <p class="text-xs font-bold text-slate-900 truncate">
                      {{ authStore.user?.name || "User" }}
                    </p>
                  </div>
                  <UiIcon
                    icon="heroicons:chevron-down"
                    class="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                </div>
              </template>
              <template #default="{ close }">
                <div class="w-[200px] rounded-2xl bg-white overflow-hidden">
                  <div
                    class="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <p class="text-[12px] font-bold text-slate-900 truncate">
                      {{ authStore.user?.name || "User" }}
                    </p>
                    <div
                      :class="[
                        'w-fit py-1 px-2 rounded-[4px]',
                        authStore.user?.plan === 'STARTER'
                          ? 'bg-emerald-500'
                          : authStore.user?.plan === 'PRO'
                            ? 'bg-black'
                            : authStore.user?.plan === 'MAX'
                              ? 'bg-purple-950'
                              : 'bg-slate-200',
                      ]">
                      <p
                        :class="[
                          'text-[10px] font-bold truncate capitalize',
                          authStore.user?.plan === 'STARTER'
                            ? 'text-white'
                            : authStore.user?.plan === 'PRO'
                              ? 'text-slate-400'
                              : authStore.user?.plan === 'MAX'
                                ? 'text-purple-100'
                                : 'text-slate-600',
                        ]">
                        {{ authStore.user?.plan || "Free" }}
                      </p>
                    </div>
                  </div>

                  <div class="p-2">
                    <NuxtLink
                      to="/settings/"
                      @click="close"
                      class="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-all">
                      <UiIcon icon="heroicons:cog-8-tooth" class="w-4 h-4" />
                      User Settings
                    </NuxtLink>
                    <div class="h-px bg-slate-100 my-1 mx-2"></div>
                    <button
                      @click="
                        isLogoutModalOpen = true;
                        close();
                      "
                      class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-all text-left border-none bg-transparent">
                      <UiIcon
                        icon="heroicons:arrow-right-on-rectangle"
                        class="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </template>
            </UiPopover>
          </div>
        </header>

        <main
          class="flex-1 overflow-y-auto pt-[20px] md:pt-0 relative min-h-0 bg-[#f7f7f9]">
          <div
            class="w-full h-full bg-white border border-[#e5e5e5] rounded-tl-2xl p-6 md:p-10 h-full overflow-y-auto overflow-x-hidden">
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
                      <UiIcon icon="heroicons:x-mark" class="h-6 w-6" />
                    </button>
                  </div>

                  <!-- Navigation Links -->
                  <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <NuxtLink
                      to="/dashboard/"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900">
                      <UiIcon
                        icon="heroicons:home"
                        class="w-[18px] h-[18px] mr-3 opacity-70" />
                      Dashboard
                    </NuxtLink>

                    <div class="pt-6 pb-2 px-4">
                      <h4
                        class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        DATA
                      </h4>
                    </div>
                    <NuxtLink
                      to="/invoices/"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900"
                      :class="{
                        'bg-[#ebebec] text-slate-900 flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl':
                          $route.path.startsWith('/invoices'),
                      }">
                      <UiIcon
                        icon="heroicons:document-text"
                        class="w-[18px] h-[18px] mr-3 opacity-70" />
                      Invoices
                    </NuxtLink>
                    <NuxtLink
                      to="/clients/"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900">
                      <UiIcon
                        icon="heroicons:users"
                        class="w-[18px] h-[18px] mr-3 opacity-70" />
                      Clients
                    </NuxtLink>

                    <div class="pt-6 pb-2 px-4">
                      <h4
                        class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        SYSTEM
                      </h4>
                    </div>
                    <NuxtLink
                      to="/settings/"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900">
                      <UiIcon
                        icon="heroicons:cog-6-tooth"
                        class="w-[18px] h-[18px] mr-3 opacity-70" />
                      Settings
                    </NuxtLink>

                    <!-- ADMIN -->
                    <template v-if="authStore.isAdmin">
                      <div class="pt-6 pb-2 px-4">
                        <h4
                          class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          ADMIN
                        </h4>
                      </div>
                      <NuxtLink
                        to="/admin/"
                        @click="isMobileMenuOpen = false"
                        class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                        active-class="bg-[#ebebec] text-slate-900"
                        :class="{
                          'bg-[#ebebec] text-slate-900':
                            $route.path === '/admin/' ||
                            $route.path === '/admin',
                        }">
                        <UiIcon
                          icon="heroicons:command-line"
                          class="w-[18px] h-[18px] mr-3 opacity-70" />
                        System Management
                      </NuxtLink>
                      <NuxtLink
                        to="/admin/tickets"
                        @click="isMobileMenuOpen = false"
                        class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                        active-class="bg-[#ebebec] text-slate-900"
                        :class="{
                          'bg-[#ebebec] text-slate-900':
                            $route.path.startsWith('/admin/tickets'),
                        }">
                        <UiIcon
                          icon="heroicons:ticket"
                          class="w-[18px] h-[18px] mr-3 opacity-70" />
                        Support Tickets
                      </NuxtLink>
                    </template>
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
                          to="/settings/?tab=billing"
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
          <UiIcon
            icon="heroicons:arrow-right-on-rectangle"
            class="w-6 h-6 text-slate-600" />
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

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "~/stores/authStore";
import { useSystemStore } from "~/stores/systemStore";
import { useUiStore } from "~/stores/uiStore";
import { useNotificationStore } from "~/stores/notificationStore";
import { formatDate } from "~/utils/date";

const route = useRoute();
const authStore = useAuthStore();
const systemStore = useSystemStore();
const uiStore = useUiStore();
const notificationStore = useNotificationStore();
const isMobileMenuOpen = ref(false);
const isLogoutModalOpen = ref(false);

onMounted(() => {
  systemStore.fetchSystemConfig();
  if (authStore.user) {
    notificationStore.startPolling();
  }
});

onUnmounted(() => {
  notificationStore.stopPolling();
});

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

<style scoped>
/* Custom Scrollbar for scrollable containers */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
  padding-right: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
  padding-right: 100px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e1; /* slate-300 */
  border-radius: 20px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8; /* slate-400 */
}
</style>
