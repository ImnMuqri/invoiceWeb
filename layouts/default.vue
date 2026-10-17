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
        class="app-sidebar hidden w-[270px] md:flex flex-col bg-[#f7f7f9] flex-shrink-0 z-10 transition-colors">
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
            class="nav-link flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="nav-link--active">
            <UiIcon
              icon="heroicons:home"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
            Dashboard
          </NuxtLink>

          <!-- SALES: quotes, then invoices — the order the work happens in -->
          <div class="pt-6 pb-2 px-4">
            <h4 class="nav-section-title">SALES</h4>
          </div>

          <NuxtLink
            to="/quotes/"
            class="nav-link flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="nav-link--active">
            <UiIcon
              icon="heroicons:document-duplicate"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
            Quotes
          </NuxtLink>
          <NuxtLink
            to="/invoices/"
            class="nav-link flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="nav-link--active"
            :class="{
              'nav-link--active': $route.path.startsWith('/invoices'),
            }">
            <UiIcon
              icon="heroicons:document-text"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
            Invoices
          </NuxtLink>
          <NuxtLink
            to="/recurring/"
            class="nav-link flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="nav-link--active">
            <UiIcon
              icon="heroicons:arrow-path-rounded-square"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
            Recurring
          </NuxtLink>
          <NuxtLink
            to="/clients/"
            class="nav-link flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="nav-link--active">
            <UiIcon
              icon="heroicons:users"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
            Clients
          </NuxtLink>
          <NuxtLink
            to="/catalogue/"
            class="nav-link flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="nav-link--active">
            <UiIcon
              icon="heroicons:squares-2x2"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
            Catalogue
          </NuxtLink>
          <NuxtLink
            to="/exports/"
            class="nav-link flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="nav-link--active">
            <UiIcon
              icon="heroicons:arrow-down-tray"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
            Export
          </NuxtLink>
          <!-- SYSTEM -->
          <div class="pt-6 pb-2 px-4">
            <h4 class="nav-section-title">SYSTEM</h4>
          </div>

          <NuxtLink
            to="/business/"
            class="nav-link flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="nav-link--active">
            <UiIcon
              icon="heroicons:building-office-2"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
            Business
          </NuxtLink>
          <!-- Referrals (spec 09).
               The page existed with no way to reach it: the only link was
               inside the share prompt, which by design appears rarely and
               never again after two dismissals — so anybody who dismissed it
               could not find their own referral link again. The spec says
               every account gets its link from the dashboard, on all tiers. -->
          <NuxtLink
            to="/referral-management"
            class="nav-link flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="nav-link--active">
            <UiIcon
              icon="heroicons:gift"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
            Refer &amp; earn
          </NuxtLink>
          <NuxtLink
            to="/settings/"
            class="nav-link flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
            active-class="nav-link--active">
            <UiIcon
              icon="heroicons:cog-6-tooth"
              class="w-[18px] h-[18px] mr-3 opacity-70" />
            Settings
          </NuxtLink>

          <!-- ADMIN -->
          <template v-if="authStore.isAdmin">
            <div class="pt-6 pb-2 px-4">
              <h4 class="nav-section-title">ADMIN</h4>
            </div>
            <NuxtLink
              to="/admin/"
              class="nav-link flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
              active-class="nav-link--active"
              :class="{
                'nav-link--active':
                  $route.path === '/admin/' || $route.path === '/admin',
              }">
              <UiIcon
                icon="heroicons:command-line"
                class="w-[18px] h-[18px] mr-3 opacity-70" />
              System Management
            </NuxtLink>
            <NuxtLink
              to="/admin/tickets"
              class="nav-link flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
              active-class="nav-link--active"
              :class="{
                'nav-link--active': $route.path.startsWith('/admin/tickets'),
              }">
              <UiIcon
                icon="heroicons:ticket"
                class="w-[18px] h-[18px] mr-3 opacity-70" />
              Support Tickets
            </NuxtLink>
          </template>
        </nav>
        <div v-if="boost" class="px-4 mb-4">
          <section class="boost" aria-labelledby="boost-title">
            <p class="boost__eyebrow">{{ boost.eyebrow }}</p>
            <p id="boost-title" class="boost__title">{{ boost.title }}</p>
            <p class="boost__body">{{ boost.body }}</p>
            <NuxtLink to="/settings?tab=billing" class="boost__cta">
              {{ boost.cta }}
              <UiIcon icon="heroicons:arrow-right" custom-class="w-3.5 h-3.5" />
            </NuxtLink>
          </section>
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
            <!-- Dark Mode Toggle (Mobile) -->
            <button
              type="button"
              class="tb tb--icon"
              :aria-label="themeStore.isDark ? 'Switch to light' : 'Switch to dark'"
              @click="themeStore.toggleTheme()">
              <UiIcon
                :icon="themeStore.isDark ? 'heroicons:sun' : 'heroicons:moon'"
                custom-class="w-[18px] h-[18px]" />
            </button>

            <UiPopover placement="bottom-end" bare>
              <template #trigger="{ isOpen }">
                <button
                  type="button"
                  class="tb tb--icon"
                  :class="{ 'tb--on': isOpen }"
                  :aria-label="
                    notificationStore.unreadCount > 0
                      ? `Notifications, ${notificationStore.unreadCount} unread`
                      : 'Notifications'
                  ">
                  <UiIcon icon="heroicons:bell" custom-class="w-[18px] h-[18px]" />
                  <span
                    v-if="notificationStore.unreadCount > 0"
                    class="tb__dot"
                    aria-hidden="true"></span>
                </button>
              </template>
              <template #default="{ close }">
                <div class="pop">
                  <div class="pop__head">
                    <span class="pop__title">Notifications</span>
                    <button
                      v-if="notificationStore.unreadCount > 0"
                      type="button"
                      class="pop__act"
                      @click="notificationStore.markAllAsRead()">
                      Mark all read
                    </button>
                  </div>

                  <div class="pop__body deskbar">
                    <div
                      v-if="notificationStore.notifications.length === 0"
                      class="note__empty">
                      <UiIcon icon="heroicons:bell-slash" custom-class="w-6 h-6" />
                      Nothing waiting for you.
                    </div>
                    <button
                      v-for="notif in notificationStore.notifications.slice(0, 8)"
                      v-else
                      :key="notif.id"
                      type="button"
                      class="note"
                      :class="{ 'note--read': notif.isRead }"
                      @click="
                        notificationStore.markAsRead(notif.id);
                        close();
                      ">
                      <span
                        class="note__pip"
                        :class="{ 'note__pip--read': notif.isRead }"
                        aria-hidden="true"></span>
                      <span>
                        <span class="note__top">
                          <span class="note__title">{{ notif.title }}</span>
                          <span class="note__when">
                            {{ formatDate(notif.createdAt) }}
                          </span>
                        </span>
                        <span class="note__body">{{ notif.message }}</span>
                      </span>
                    </button>
                  </div>

                  <div class="pop__foot">
                    <NuxtLink to="/notifications" class="pop__all" @click="close">
                      See all notifications
                      <UiIcon icon="heroicons:arrow-right" custom-class="w-3.5 h-3.5" />
                    </NuxtLink>
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
          class="hidden md:flex h-[80px] shrink-0 items-center justify-between pl-8 pr-10 bg-[#f7f7f9] w-full">
          <div class="flex items-center gap-4">
            <h3 class="text-lg font-semibold text-slate-400 capitalize">
              Workspace /
              <span class="text-slate-900">{{
                route.meta.title || route.name
              }}</span>
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <!-- Dark Mode Toggle (Desktop) -->
            <button
              type="button"
              class="tb tb--icon"
              :title="themeStore.isDark ? 'Switch to light' : 'Switch to dark'"
              :aria-label="themeStore.isDark ? 'Switch to light' : 'Switch to dark'"
              @click="themeStore.toggleTheme()">
              <UiIcon
                :icon="themeStore.isDark ? 'heroicons:sun' : 'heroicons:moon'"
                custom-class="w-[18px] h-[18px]" />
            </button>

            <!-- Notifications -->
            <UiPopover placement="bottom-end" bare>
              <template #trigger="{ isOpen }">
                <button
                  type="button"
                  class="tb tb--icon"
                  :class="{ 'tb--on': isOpen }"
                  :aria-label="
                    notificationStore.unreadCount > 0
                      ? `Notifications, ${notificationStore.unreadCount} unread`
                      : 'Notifications'
                  ">
                  <UiIcon icon="heroicons:bell" custom-class="w-[18px] h-[18px]" />
                  <span
                    v-if="notificationStore.unreadCount > 0"
                    class="tb__dot"
                    aria-hidden="true"></span>
                </button>
              </template>
              <template #default="{ close }">
                <div class="pop">
                  <div class="pop__head">
                    <span class="pop__title">Notifications</span>
                    <button
                      v-if="notificationStore.unreadCount > 0"
                      type="button"
                      class="pop__act"
                      @click="notificationStore.markAllAsRead()">
                      Mark all read
                    </button>
                  </div>

                  <div class="pop__body deskbar">
                    <div
                      v-if="notificationStore.notifications.length === 0"
                      class="note__empty">
                      <UiIcon icon="heroicons:bell-slash" custom-class="w-6 h-6" />
                      Nothing waiting for you.
                    </div>
                    <button
                      v-for="notif in notificationStore.notifications.slice(0, 8)"
                      v-else
                      :key="notif.id"
                      type="button"
                      class="note"
                      :class="{ 'note--read': notif.isRead }"
                      @click="
                        notificationStore.markAsRead(notif.id);
                        close();
                      ">
                      <span
                        class="note__pip"
                        :class="{ 'note__pip--read': notif.isRead }"
                        aria-hidden="true"></span>
                      <span>
                        <span class="note__top">
                          <span class="note__title">{{ notif.title }}</span>
                          <span class="note__when">
                            {{ formatDate(notif.createdAt) }}
                          </span>
                        </span>
                        <span class="note__body">{{ notif.message }}</span>
                      </span>
                    </button>
                  </div>

                  <div class="pop__foot">
                    <NuxtLink to="/notifications" class="pop__all" @click="close">
                      See all notifications
                      <UiIcon icon="heroicons:arrow-right" custom-class="w-3.5 h-3.5" />
                    </NuxtLink>
                  </div>
                </div>
              </template>
            </UiPopover>

            <div class="tb__rule" aria-hidden="true"></div>

            <!-- User -->
            <UiPopover placement="bottom-end" bare>
              <template #trigger="{ isOpen }">
                <button
                  type="button"
                  class="tb tb--user"
                  :class="{ 'tb--on': isOpen }"
                  aria-label="Your account">
                  <span class="tb__av" aria-hidden="true">
                    {{ (authStore.user?.name || "U").charAt(0) }}
                  </span>
                  <span class="tb__name">
                    {{ authStore.user?.name || "User" }}
                  </span>
                  <UiIcon
                    icon="heroicons:chevron-down"
                    custom-class="tb__caret w-3.5 h-3.5" />
                </button>
              </template>
              <template #default="{ close }">
                <div class="pop pop--sm">
                  <div class="pop__head">
                    <div class="pop__who">
                      <span class="tb__av" aria-hidden="true">
                        {{ (authStore.user?.name || "U").charAt(0) }}
                      </span>
                      <div style="min-width: 0">
                        <p class="pop__title">
                          {{ authStore.user?.name || "User" }}
                        </p>
                        <p class="pop__mail">{{ authStore.user?.email }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="pmenu">
                    <NuxtLink to="/business" class="pmenu__item" @click="close">
                      <UiIcon
                        icon="heroicons:building-office-2"
                        custom-class="w-4 h-4" />
                      Business details
                    </NuxtLink>
                    <NuxtLink to="/settings" class="pmenu__item" @click="close">
                      <UiIcon icon="heroicons:cog-8-tooth" custom-class="w-4 h-4" />
                      Settings
                    </NuxtLink>
                    <NuxtLink
                      to="/settings?tab=billing"
                      class="pmenu__item"
                      @click="close">
                      <UiIcon icon="heroicons:sparkles" custom-class="w-4 h-4" />
                      Plan
                      <span class="chip chip--idle" style="margin-left: auto">
                        {{ authStore.user?.plan || "Free" }}
                      </span>
                    </NuxtLink>
                    <div class="pmenu__rule" aria-hidden="true"></div>
                    <button
                      type="button"
                      class="pmenu__item pmenu__item--danger"
                      @click="
                        isLogoutModalOpen = true;
                        close();
                      ">
                      <UiIcon
                        icon="heroicons:arrow-right-on-rectangle"
                        custom-class="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </template>
            </UiPopover>
          </div>
        </header>

        <main
          class="flex-1 overflow-y-auto pt-[20px] md:pt-0 relative min-h-0 bg-[#f7f7f9]"
          :aria-busy="progress.active.value ? 'true' : 'false'">
          <!-- Rides the top edge of the content panel, from its rounded corner
               to the right edge of the window. aria-hidden because the bar is
               decoration: aria-busy on <main> above is what actually tells a
               screen reader something is in flight. -->
          <!-- The stroke traces the panel's own outline: it starts where the
               top-left arc begins, sweeps through the corner, then straightens
               and runs to the right edge. A <div> cannot bend, so this is a
               path with stroke-dashoffset rather than a scaled bar. -->
          <svg
            v-show="progress.visible.value"
            class="pbar"
            :width="panelWidth || '100%'"
            height="20"
            fill="none"
            aria-hidden="true">
            <defs>
              <!-- Fades the first ~44px of the rail from nothing to solid, so
                   the stroke emerges out of the panel edge instead of beginning
                   on a hard round cap parked in the corner. Anchored in user
                   space at x=0, so it only ever softens the START — the moving
                   head keeps full strength wherever it happens to be. -->
              <linearGradient
                id="pbar-fade"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="44"
                y2="0">
                <stop offset="0" stop-color="#fff" stop-opacity="0" />
                <stop offset="0.55" stop-color="#fff" stop-opacity="0.72" />
                <stop offset="1" stop-color="#fff" stop-opacity="1" />
              </linearGradient>
              <mask id="pbar-mask" maskUnits="userSpaceOnUse">
                <rect
                  x="0"
                  y="0"
                  :width="railWidth"
                  height="20"
                  fill="url(#pbar-fade)" />
              </mask>
            </defs>
            <g mask="url(#pbar-mask)">
              <path class="pbar__rail" :d="railPath" />
              <path
                class="pbar__fill"
                :d="railPath"
                pathLength="100"
                stroke-dasharray="100"
                :stroke-dashoffset="100 - progress.value.value" />
            </g>
          </svg>
          <div
            ref="panelEl"
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
                        SALES
                      </h4>
                    </div>
                    <NuxtLink
                      to="/quotes/"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900"
                      :class="{
                        'bg-[#ebebec] text-slate-900 flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl':
                          $route.path.startsWith('/quotes'),
                      }">
                      <UiIcon
                        icon="heroicons:document-duplicate"
                        class="w-[18px] h-[18px] mr-3 opacity-70" />
                      Quotes
                    </NuxtLink>
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
                      to="/recurring/"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900">
                      <UiIcon
                        icon="heroicons:arrow-path-rounded-square"
                        class="w-[18px] h-[18px] mr-3 opacity-70" />
                      Recurring
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
                    <NuxtLink
                      to="/catalogue/"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900">
                      <UiIcon
                        icon="heroicons:squares-2x2"
                        class="w-[18px] h-[18px] mr-3 opacity-70" />
                      Catalogue
                    </NuxtLink>
                    <NuxtLink
                      to="/exports/"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900">
                      <UiIcon
                        icon="heroicons:arrow-down-tray"
                        class="w-[18px] h-[18px] mr-3 opacity-70" />
                      Export
                    </NuxtLink>

                    <div class="pt-6 pb-2 px-4">
                      <h4
                        class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        SYSTEM
                      </h4>
                    </div>
                    <NuxtLink
                      to="/business/"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900">
                      <UiIcon
                        icon="heroicons:building-office-2"
                        class="w-[18px] h-[18px] mr-3 opacity-70" />
                      Business
                    </NuxtLink>
                    <!-- Mirrors the desktop sidebar. Most sharing happens on a
                         phone over WhatsApp, so if either nav were going to
                         carry this one it would be this one. -->
                    <NuxtLink
                      to="/referral-management"
                      @click="isMobileMenuOpen = false"
                      class="flex items-center px-4 py-2.5 text-[15px] font-medium rounded-xl text-slate-600 hover:bg-[#ebebec] hover:text-slate-900 transition-colors"
                      active-class="bg-[#ebebec] text-slate-900">
                      <UiIcon
                        icon="heroicons:gift"
                        class="w-[18px] h-[18px] mr-3 opacity-70" />
                      Refer &amp; earn
                    </NuxtLink>
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

                  <div v-if="boost" class="px-4 mb-8">
                    <section class="boost">
                      <p class="boost__eyebrow">{{ boost.eyebrow }}</p>
                      <p class="boost__title">{{ boost.title }}</p>
                      <p class="boost__body">{{ boost.body }}</p>
                      <NuxtLink
                        to="/settings?tab=billing"
                        class="boost__cta"
                        @click="isMobileMenuOpen = false">
                        {{ boost.cta }}
                        <UiIcon icon="heroicons:arrow-right" custom-class="w-3.5 h-3.5" />
                      </NuxtLink>
                    </section>
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
    <UiModal v-model="isLogoutModalOpen" max-width="sm">
      <div class="dlg">
        <h3 class="dlg__title">Sign out?</h3>
        <p class="dlg__body">
          You will be signed out on this device. Nothing is deleted — your
          invoices, clients and settings will be exactly as you left them when
          you sign back in.
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            :disabled="signingOut"
            @click="isLogoutModalOpen = false">
            Stay signed in
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--primary"
            :disabled="signingOut"
            @click="signOut">
            <UiIcon
              v-if="signingOut"
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 spin" />
            {{ signingOut ? "Signing out…" : "Sign out" }}
          </button>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "~/stores/authStore";
import { useSystemStore } from "~/stores/systemStore";
import { useUiStore } from "~/stores/uiStore";
import { useNotificationStore } from "~/stores/notificationStore";
import { useThemeStore } from "~/stores/themeStore";
import { formatDate } from "~/utils/date";

const route = useRoute();
const authStore = useAuthStore();
const systemStore = useSystemStore();
const uiStore = useUiStore();
const notificationStore = useNotificationStore();
const progress = useProgress();

/* What to offer at the foot of the sidebar, or null for nothing.
   Keyed off the plan rather than off isPro: isPro is true for anything that is
   not FREE, so gating the old card on !isPro meant a Starter customer — the one
   with the clearest reason to move — never saw it.

   The copy names the actual difference between their tier and the next one.
   "Upgrade to Pro" tells somebody nothing they cannot already guess; "Pro
   chases overdue invoices on its own" is the reason they would.

   One line each, and one benefit each. This card sits in the sidebar of every
   module, permanently, next to work somebody is trying to do — at that size a
   feature list is not read, it is just something the eye has to get past. The
   CTA is where the full comparison lives. */
const boost = computed(() => {
  const plan = String(authStore.user?.plan ?? "FREE").toUpperCase();

  if (plan === "STARTER") {
    return {
      eyebrow: "On Starter",
      title: "Still chasing them yourself?",
      body: "Pro follows up on overdue invoices on its own.",
      cta: "See what Pro adds",
    };
  }

  /* FREE, and anything unrecognised — PENDING and CANCELLED both land here,
     which is right: neither is a paid tier. */
  if (!["PRO", "MAX"].includes(plan)) {
    return {
      eyebrow: "Free plan",
      title: "Need more power?",
      body: "Pro chases the late ones, and lifts you to 100 a month.",
      cta: "Get Pro",
    };
  }

  return null;
});

/* The rail is drawn in real pixels, so it has to know how wide the panel is.
   No viewBox on the <svg> means one user unit is one CSS pixel, which keeps the
   16px corner a true 16px corner at every window size — a viewBox would scale
   the arc horizontally along with the width and flatten it into an ellipse. */
const panelEl = ref(null);
const panelWidth = ref(0);
let panelRO = null;

/* Corner radius 16 (rounded-tl-2xl) and stroke width 3. The stroke is centred on
   the path, so the centreline is inset by half the stroke: it starts at
   (1.5, 16), arcs to (16, 1.5) on a radius of 16 - 1.5, then runs flat to the
   right edge. Without that inset the outer half of the stroke would fall
   outside the svg box and be clipped along its whole length. */
const railWidth = computed(() => Math.max(panelWidth.value || 0, 16));
const railPath = computed(
  () => `M 1.5 16 A 14.5 14.5 0 0 1 16 1.5 H ${railWidth.value}`,
);

onMounted(() => {
  if (!panelEl.value) return;
  panelRO = new ResizeObserver(([entry]) => {
    panelWidth.value = Math.round(entry.contentRect.width);
  });
  panelRO.observe(panelEl.value);
});

onUnmounted(() => panelRO?.disconnect());
const themeStore = useThemeStore();
const isMobileMenuOpen = ref(false);
const isLogoutModalOpen = ref(false);
const signingOut = ref(false);

/* authStore.logout() awaits a network call before clearing anything, so without
   a busy state the dialog just sits there on a slow connection and invites a
   second click. It ends in a hard location change, so the flag is not reset on
   the happy path — only if the call throws and we are still here. */
const signOut = async () => {
  if (signingOut.value) return;
  signingOut.value = true;
  try {
    await authStore.logout();
  } catch {
    signingOut.value = false;
  }
};

onMounted(async () => {
  themeStore.initTheme();
  try {
    await systemStore.fetchConfig();
  } catch (e) {}
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
/* ── InvoKita Design Tokens ── */
/* Matching index.vue + login.vue: Inter font, #1a1d23 text,
   #059669 emerald accent, spring easing transitions */

/* ── Sidebar shell ── */
.app-sidebar {
  /* token, not a literal: the scoped rule out-specifies the utility override,
     so a hardcoded value here kept the sidebar light in dark mode */
  background: var(--app-sidebar-bg, #f5f2ed);
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

/* ── Nav section eyebrow labels ── */
.nav-section-title {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  /* was #9ca3af = 2.41:1 on the sidebar, a clear AA failure. Tokenised so it
     tracks the theme instead of being a literal. */
  color: var(--nav-section-color, #656c6a);
}

/* ── Nav links ── */
.nav-link {
  font-size: 0.875rem;
  font-weight: 500;
  /* #6b7280 measured 4.33:1 on the warmed sidebar. Tokenised so it tracks the
     theme instead of being tuned to one background. */
  color: var(--nav-link-color, #626a68);
  border-radius: 10px;
  transition:
    color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    background 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.nav-link:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #1a1d23;
}

/* Active state: emerald accent to match landing + auth pages */
.nav-link--active,
.nav-link.nav-link--active {
  background: var(--nav-active-bg) !important;
  color: var(--nav-active-text) !important;
  font-weight: 600;
}
.nav-link--active :deep(.iconify),
.nav-link--active :deep(svg) {
  opacity: 1 !important;
  color: var(--nav-active-text);
}

/* ── Scrollbars ── */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 99px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #059669;
}
</style>
