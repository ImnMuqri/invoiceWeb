<template>
  <div class="dashboard-page w-full w-full mx-auto font-sans pb-8">
    <div class="flex flex-col gap-8">
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h2>
          <p class="text-xs font-medium text-slate-500 mt-1">
            Deep insights into platform growth and system performance.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="uiStore.openModuleHelp('dashboard')"
            class="text-slate-400 hover:text-indigo-600 transition-colors p-1"
            title="Dashboard Help">
            <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
          </button>
          <NuxtLink
            v-if="systemStore.isInvoiceCreationEnabled"
            to="/invoices/create"
            class="inline-flex items-center rounded-md bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all w-fit">
            New Invoice
          </NuxtLink>
          <button
            v-else
            disabled
            class="inline-flex items-center rounded-md bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed w-fit"
            title="Invoice creation is temporarily disabled by admin">
            New Invoice (Disabled)
          </button>
        </div>
      </div>
      <!-- Global System Notice -->
      <div
        v-if="systemStore.globalNotice"
        class="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4 items-start animate-pulse-slow">
        <div class="mt-0.5 p-2 bg-amber-100 rounded-xl text-amber-600">
          <UiIcon icon="heroicons:megaphone" custom-class="w-4 h-4" />
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-bold text-amber-900">System Announcement</h4>
          <p class="text-xs font-bold text-amber-800/80 mt-1 leading-relaxed">
            {{ systemStore.globalNotice }}
          </p>
        </div>
      </div>
      <!-- Currency Note -->
      <div
        class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4 items-start">
        <div class="mt-0.5">
          <UiIcon
            icon="heroicons:information-circle-solid"
            custom-class="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-indigo-900">
            Multi-Currency standardisation
          </h4>
          <p class="text-xs text-indigo-700/80 mt-1 leading-relaxed">
            All amounts are automatically converted and standardised to your
            default currency (<strong>{{
              dashboardStore.stats.currency || "MYR"
            }}</strong
            >) based on your preferences. This ensures accurate tracking across
            global clients.
          </p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Revenue Card -->
        <div
          class="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 shadow-sm hover:border-indigo-200 transition-colors">
          <dt class="text-sm font-semibold text-indigo-800 mb-1">
            Total Revenue
          </dt>
          <dd class="text-2xl font-semibold text-indigo-950 tracking-tight">
            {{ (dashboardStore.stats.totalRevenue || 0).toLocaleString() }}
            {{ dashboardStore.stats.currency }}
          </dd>
        </div>
        <!-- Outstanding Card -->
        <div
          class="bg-amber-50/50 border border-amber-100 rounded-xl p-6 shadow-sm hover:border-amber-200 transition-colors">
          <dt class="text-sm font-semibold text-amber-800 mb-1">
            Outstanding Invoices
          </dt>
          <dd class="text-2xl font-semibold text-amber-950 tracking-tight">
            {{ (dashboardStore.stats.outstandingAmount || 0).toLocaleString() }}
            {{ dashboardStore.stats.currency }}
          </dd>
        </div>
        <!-- Active Clients Card -->
        <div
          class="bg-emerald-50/50 border border-emerald-100 rounded-xl p-6 shadow-sm hover:border-emerald-200 transition-colors">
          <dt class="text-sm font-semibold text-emerald-800 mb-1">
            Active Clients
          </dt>
          <dd class="text-2xl font-semibold text-emerald-950 tracking-tight">
            {{ dashboardStore.stats.activeClients }}
          </dd>
        </div>
        <!-- Overdue Card -->
        <div
          class="bg-rose-50/50 border border-rose-100 rounded-xl p-6 shadow-sm hover:border-rose-200 transition-colors">
          <dt class="text-sm font-semibold text-rose-800 mb-1">Overdue</dt>
          <dd class="text-2xl font-semibold text-rose-600 tracking-tight">
            {{ dashboardStore.stats.overdueCount }}
          </dd>
        </div>
      </div>

      <!-- Monthly Usage Highlights -->
      <div class="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-slate-900 tracking-tight">
            Monthly Usage Highlights
          </h2>
          <span
            class="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500 uppercase tracking-widest"
            >{{ authStore.user?.plan || "FREE" }} PLAN</span
          >
        </div>
        <div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="space-y-3">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-500 uppercase tracking-tight"
                  >WhatsApp Sends</span
                >
                <span class="text-slate-900"
                  >{{ authStore.user?.waSendsUsed || 0 }} /
                  <template
                    v-if="(dashboardStore.usageLimits?.waSends || 0) >= 99999"
                    >∞</template
                  >
                  <template v-else>{{
                    dashboardStore.usageLimits?.waSends || 0
                  }}</template>
                </span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div
                  class="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                  :style="{
                    width:
                      Math.min(
                        100,
                        ((authStore.user?.waSendsUsed || 0) /
                          (dashboardStore.usageLimits?.waSends || 1)) *
                          100,
                      ) + '%',
                  }"></div>
              </div>
              <div
                class="flex justify-between text-[10px] font-medium text-slate-400">
                <span>Whatsapp Reminders Used:</span>
                <span class="font-semibold text-slate-600"
                  >{{ authStore.user?.waRemindersUsed || 0 }} /
                  <template
                    v-if="
                      (dashboardStore.usageLimits?.waReminders || 0) >= 99999
                    "
                    >∞</template
                  >
                  <template v-else>{{
                    dashboardStore.usageLimits?.waReminders || 0
                  }}</template>
                </span>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-500 uppercase tracking-tight"
                  >Email Sends</span
                >
                <span class="text-slate-900"
                  >{{ authStore.user?.emailSendsUsed || 0 }} /
                  <template
                    v-if="
                      (dashboardStore.usageLimits?.emailSends || 0) >= 99999
                    "
                    >∞</template
                  >
                  <template v-else>{{
                    dashboardStore.usageLimits?.emailSends || 0
                  }}</template>
                </span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div
                  class="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  :style="{
                    width:
                      Math.min(
                        100,
                        ((authStore.user?.emailSendsUsed || 0) /
                          (dashboardStore.usageLimits?.emailSends || 1)) *
                          100,
                      ) + '%',
                  }"></div>
              </div>
              <div
                class="flex justify-between text-[10px] font-medium text-slate-400">
                <span>Email Reminders Used:</span>
                <span class="font-semibold text-slate-600"
                  >{{ authStore.user?.emailRemindersUsed || 0 }} /
                  <template
                    v-if="
                      (dashboardStore.usageLimits?.emailReminders || 0) >= 99999
                    "
                    >∞</template
                  >
                  <template v-else>{{
                    dashboardStore.usageLimits?.emailReminders || 0
                  }}</template>
                </span>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-500 uppercase tracking-tight"
                  >AI Helper Credits</span
                >
                <span class="text-slate-900"
                  >{{ authStore.user?.aiUsed || 0 }} /
                  <template
                    v-if="(dashboardStore.usageLimits?.aiCredits || 0) >= 99999"
                    >∞</template
                  >
                  <template v-else>{{
                    dashboardStore.usageLimits?.aiCredits || 0
                  }}</template>
                </span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div
                  class="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  :style="{
                    width:
                      Math.min(
                        100,
                        ((authStore.user?.aiUsed || 0) /
                          (dashboardStore.usageLimits?.aiCredits || 1)) *
                          100,
                      ) + '%',
                  }"></div>
              </div>

              <div class="flex justify-end">
                <NuxtLink
                  to="/settings"
                  class="text-[10px] font-semibold text-slate-400 hover:text-slate-900 uppercase tracking-widest"
                  >Settings →</NuxtLink
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Main Chart Section -->
        <div class="lg:col-span-3 space-y-8">
          <!-- Monthly Revenue Forecast -->
          <div
            class="bg-white border border-slate-200 shadow-sm rounded-xl relative">
            <div
              class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-xl z-20">
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-semibold text-slate-900 tracking-tight">
                  Monthly Revenue Forecast
                </h2>
                <div class="group relative">
                  <UiIcon
                    icon="heroicons:information-circle"
                    custom-class="w-4 h-4 text-slate-400 cursor-help hover:text-emerald-500 transition-colors" />
                  <div
                    class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[60] -translate-y-1 group-hover:translate-y-0 text-left">
                    <p
                      class="font-bold text-emerald-400 mb-1.5 uppercase tracking-wider">
                      Revenue Prediction
                    </p>
                    <div class="leading-relaxed text-slate-200">
                      A forward-looking view of your cashflow. We calculate this
                      by summing up your expected payments from **Pending
                      Invoices** and **Active Subscriptions** for the selected
                      period.
                    </div>
                    <div
                      class="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900"></div>
                  </div>
                </div>
              </div>
              <div
                class="flex items-center gap-1 bg-slate-50/50 p-1 rounded-xl border border-slate-100">
                <!-- Range Selector Group -->
                <div class="flex items-center">
                  <button
                    @click="toggleFilterMode('range')"
                    class="p-2 rounded-lg transition-all duration-200 flex items-center justify-center"
                    :class="[
                      activeFilterMode === 'range'
                        ? 'bg-white shadow-sm text-emerald-600 ring-1 ring-slate-200'
                        : 'text-slate-400 hover:bg-white hover:text-slate-600',
                      activeFilterMode && activeFilterMode !== 'range'
                        ? 'opacity-60'
                        : '',
                    ]"
                    :title="
                      activeFilterMode === 'range'
                        ? 'Close Filter'
                        : 'Filter by Range'
                    ">
                    <UiIcon icon="heroicons:clock" class="w-4 h-4" />
                  </button>

                  <transition name="filter-grow">
                    <div
                      v-if="activeFilterMode === 'range'"
                      class="flex items-center gap-2 px-2 overflow-hidden whitespace-nowrap">
                      <UiSelect
                        v-model="forecastRange"
                        :options="forecastOptions"
                        custom-class="!w-36 !py-1 !text-[11px] !font-semibold !bg-white !border-slate-200 shadow-sm !ring-0" />
                    </div>
                  </transition>
                </div>

                <div class="h-4 w-px bg-slate-200 mx-0.5"></div>

                <!-- Calendar Selector Group -->
                <div class="flex items-center">
                  <button
                    @click="toggleFilterMode('calendar')"
                    class="p-2 rounded-lg transition-all duration-200 flex items-center justify-center"
                    :class="[
                      activeFilterMode === 'calendar'
                        ? 'bg-white shadow-sm text-emerald-600 ring-1 ring-slate-200'
                        : 'text-slate-400 hover:bg-white hover:text-slate-600',
                      activeFilterMode && activeFilterMode !== 'calendar'
                        ? 'opacity-60'
                        : '',
                    ]"
                    :title="
                      activeFilterMode === 'calendar'
                        ? 'Close Filter'
                        : 'Filter by Calendar'
                    ">
                    <UiIcon icon="heroicons:calendar" class="w-4 h-4" />
                  </button>

                  <transition name="filter-grow">
                    <div
                      v-if="activeFilterMode === 'calendar'"
                      class="flex items-center gap-1.5 mx-2 overflow-hidden whitespace-nowrap">
                      <UiSelect
                        v-model="selectedMonth"
                        :options="monthOptions"
                        custom-class="!w-32 !py-1 !text-[11px] !font-semibold !bg-white !border-slate-200 shadow-sm !ring-0" />
                      <UiSelect
                        v-if="selectedMonth"
                        v-model="selectedYear"
                        :options="yearOptions"
                        custom-class="!w-24 !py-1 !text-[11px] !font-semibold !bg-white !border-slate-200 shadow-sm !ring-0" />
                    </div>
                  </transition>
                </div>
              </div>
            </div>
            <div class="p-6 h-[350px]">
              <ClientOnly>
                <UiChart
                  v-if="chartData.length > 0"
                  :data="chartData"
                  index="date"
                  :categories="['amount']" />
                <div
                  v-else
                  class="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm italic gap-2">
                  <UiIcon
                    icon="heroicons:document-chart-bar"
                    custom-class="w-8 h-8 text-slate-200" />
                  <p>No cashflow data available for this range</p>
                </div>
              </ClientOnly>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-6">
            <!-- Activity History -->
            <div
              class="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col w-full">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-lg font-semibold text-slate-900 tracking-tight">
                  Activity History
                </h2>
                <NuxtLink
                  to="/invoices"
                  class="text-xs font-semibold text-slate-400 hover:text-slate-900 uppercase tracking-widest"
                  >All →</NuxtLink
                >
              </div>
              <ul role="list" class="space-y-5">
                <li
                  v-for="invoice in dashboardStore.recentInvoices"
                  :key="invoice.id"
                  class="flex items-center gap-4 group">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 transition-transform group-hover:scale-110"
                    :class="
                      invoice.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : invoice.status === 'Overdue'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                    ">
                    INVK
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-slate-900 truncate">
                      {{ invoice.client?.name || invoice.client }}
                    </p>
                    <p
                      class="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">
                      {{ invoice.status }} • {{ invoice.invoiceNumber }}
                    </p>
                  </div>
                  <p class="text-sm font-semibold text-slate-900 shrink-0">
                    {{ (invoice.amount || 0).toLocaleString() }}
                    {{ invoice.currency }}
                  </p>
                </li>
                <li
                  v-if="dashboardStore.recentInvoices.length === 0"
                  class="py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p class="text-xs font-semibold text-slate-400 uppercase">
                    No activity found
                  </p>
                </li>
              </ul>
            </div>
            <!-- Client Profitability Insights -->
            <div
              class="col-span-2 bg-white shadow-sm rounded-xl border border-slate-200 flex flex-col relative">
              <div
                class="p-6 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-xl z-20">
                <div>
                  <div class="flex items-center gap-2">
                    <h3
                      class="text-lg font-semibold text-slate-900 tracking-tight">
                      Client Profitability
                    </h3>
                    <div class="group relative">
                      <UiIcon
                        icon="heroicons:information-circle"
                        custom-class="w-4 h-4 text-slate-400 cursor-help hover:text-emerald-500 transition-colors" />
                      <div
                        class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[60] -translate-y-1 group-hover:translate-y-0 text-left">
                        <p
                          class="font-bold text-emerald-400 mb-1.5 uppercase tracking-wider">
                          Profitability Logic
                        </p>
                        <div class="leading-relaxed text-slate-200">
                          We analyze your clients based on their **Total
                          Revenue**, **Profit Margins**, and **Payment Speed**.
                          <br /><br />
                          🌟 <span class="text-white font-bold">Elite</span>:
                          High-profit & fast payers.<br />
                          ✅ <span class="text-white font-bold">Stable</span>:
                          Consistent partners.<br />
                          ⚠️ <span class="text-white font-bold">At Risk</span>:
                          Low-margin or late payers.
                        </div>
                        <!-- Arrow pointing up -->
                        <div
                          class="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900"></div>
                      </div>
                    </div>
                  </div>
                  <p class="text-sm text-slate-500 font-medium mt-1">
                    AI analysis ranking clients by effective margin.
                  </p>
                </div>
                <UiSelect
                  v-model="profitabilityFilter"
                  :options="rankOptions"
                  custom-class="!w-32 !py-1 !text-xs !font-semibold !uppercase !tracking-wider !bg-slate-50" />
              </div>

              <!-- Table Content Area -->
              <div
                class="flex-1 overflow-x-auto profit-table-scroll rounded-b-xl overflow-hidden relative">
                <!-- Blur Overlay for Client Profitability -->
                <div
                  v-if="!authStore.isPro"
                  class="absolute inset-0 z-10 backdrop-blur-[4px] bg-white/40 flex items-center justify-center border border-slate-100/50 rounded-b-xl">
                  <div class="text-center p-4">
                    <div class="flex items-center justify-center gap-1 mb-2">
                      <h3 class="text-[13px] font-bold text-slate-900">
                        Profitability Insights Locked
                      </h3>
                      <UiIcon
                        icon="heroicons:lock-closed"
                        class="w-3 h-3 text-black/70" />
                    </div>
                    <p
                      class="text-[12px] text-slate-500 mb-4 px-2 leading-relaxed">
                      Identify your most high-value clients with automated
                      margin analysis and payment behavior tracking.
                    </p>

                    <NuxtLink
                      to="/settings?tab=billing"
                      class="text-[10px] font-bold border border-emerald-200 py-2 px-4 rounded-md text-emerald-600 hover:text-emerald-800 uppercase tracking-widest"
                      >Upgrade to Pro →</NuxtLink
                    >
                  </div>
                </div>

                <table class="min-w-full divide-y divide-slate-200">
                  <thead class="bg-slate-50">
                    <tr>
                      <th
                        class="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th
                        class="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th
                        class="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Margin
                      </th>
                      <th
                        class="px-6 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Avg Delay
                      </th>
                      <th
                        class="px-6 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Impact
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-slate-100">
                    <tr v-if="dashboardStore.topClients.length === 0">
                      <td
                        colspan="5"
                        class="py-10 text-center bg-slate-50 border-b border-dashed border-slate-200">
                        <p
                          class="text-xs font-semibold text-slate-400 uppercase">
                          No data available
                        </p>
                      </td>
                    </tr>
                    <tr
                      v-for="client in dashboardStore.topClients"
                      :key="client.id"
                      class="hover:bg-slate-50 transition-colors">
                      <td class="px-6 py-4">
                        <div class="text-sm font-semibold text-slate-900">
                          {{ client.name }}
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm font-medium text-slate-600">
                        {{ (client.totalRevenue || 0).toLocaleString() }}
                        {{ dashboardStore.stats.currency }}
                      </td>
                      <td class="px-6 py-4">
                        <span
                          class="inline-flex items-center px-2 py-1 rounded text-xs font-medium border"
                          :class="
                            client.profitMargin > 20
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                          "
                          >{{ client.profitMargin }}%</span
                        >
                      </td>
                      <td class="px-6 py-4 text-sm font-medium text-slate-600">
                        {{ client.averageDelayDays || 0 }}d
                      </td>
                      <td
                        class="px-6 py-4 text-right text-sm font-semibold"
                        :class="
                          client.profitMargin > 20 &&
                          (client.averageDelayDays || 0) < 10
                            ? 'text-emerald-600'
                            : client.profitMargin < 15 ||
                                (client.averageDelayDays || 0) > 20
                              ? 'text-rose-600'
                              : 'text-amber-600'
                        ">
                        {{
                          client.profitMargin > 20 &&
                          (client.averageDelayDays || 0) < 10
                            ? "Elite"
                            : client.profitMargin < 15 ||
                                (client.averageDelayDays || 0) > 20
                              ? "At Risk"
                              : "Stable"
                        }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Column -->
        <div class="lg:col-span-1 space-y-8">
          <!-- AI Suggestions -->
          <div
            class="bg-emerald-50/10 shadow-sm rounded-xl border border-emerald-100 p-6 flex flex-col relative">
            <!-- Blur Overlay for AI Insights -->
            <div
              v-if="!authStore.isPro"
              class="absolute inset-0 z-10 backdrop-blur-[4px] bg-white/40 flex items-center justify-center border border-emerald-100/50">
              <div class="text-center p-4">
                <div class="flex items-center justify-center gap-1 mb-2">
                  <h3 class="text-[13px] font-bold text-slate-900">
                    AI Insights Locked
                  </h3>
                  <UiIcon
                    icon="heroicons:lock-closed"
                    class="w-3 h-3 text-black/70" />
                </div>
                <p class="text-[12px] text-slate-500 mb-4 px-2 leading-relaxed">
                  Get real-time AI analysis of overdue invoices and automated
                  payment chaser recommendations.
                </p>

                <NuxtLink
                  to="/settings?tab=billing"
                  class="text-[10px] font-bold border border-emerald-200 py-2 px-4 rounded-md text-emerald-600 hover:text-emerald-800 uppercase tracking-widest"
                  >Upgrade to Pro →</NuxtLink
                >
              </div>
            </div>

            <div class="flex items-center gap-2 mb-4 relative z-20">
              <div class="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                <UiIcon icon="heroicons:sparkles" class="w-4 h-4" />
              </div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
                  AI Chaser Insights
                </h3>
                <div class="group relative">
                  <UiIcon
                    icon="heroicons:information-circle"
                    custom-class="w-4 h-4 text-slate-400 cursor-help hover:text-emerald-500 transition-colors" />
                  <div
                    class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[60] -translate-y-1 group-hover:translate-y-0 text-left">
                    <p
                      class="font-bold text-emerald-400 mb-1.5 uppercase tracking-wider">
                      Strategic Mentor
                    </p>
                    <div class="leading-relaxed text-slate-200">
                      Meet your personal business partner! Our AI analyzes your
                      **Payment Trends** and **Overdue History** to give you
                      tactical advice on how to recover cash and grow.
                    </div>
                    <div
                      class="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900"></div>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="space-y-4 min-h-[100px] max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
              <!-- Loading State -->
              <template
                v-if="
                  dashboardStore.loading && !dashboardStore.insights.length
                ">
                <div
                  v-for="i in 1"
                  :key="i"
                  class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse">
                  <div class="flex items-start gap-4">
                    <div class="mt-1 w-2 h-2 rounded-full bg-slate-200"></div>
                    <div class="flex-1 space-y-2">
                      <div class="h-4 bg-slate-100 rounded w-1/2"></div>
                      <div class="h-3 bg-slate-50 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Insight Items -->
              <template v-else-if="dashboardStore.insights.length > 0">
                <div
                  v-for="insight in dashboardStore.insights"
                  :key="insight.id || insight.title"
                  class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-all cursor-pointer group mb-4 last:mb-0"
                  @click="
                    insight.type === 'chaser' && authStore.isPro
                      ? $router.push(`/invoices`)
                      : null
                  ">
                  <div class="flex items-start gap-4">
                    <div
                      class="mt-1 w-2 h-2 rounded-full"
                      :class="
                        insight.type === 'chaser'
                          ? 'bg-amber-500'
                          : insight.type === 'profit'
                            ? 'bg-emerald-600'
                            : 'bg-indigo-500'
                      "></div>
                    <div>
                      <p class="text-sm font-semibold text-slate-900">
                        {{ insight.title }}
                      </p>
                      <p class="text-xs text-slate-700 mt-1 leading-relaxed">
                        {{ insight.description }}
                      </p>
                      <p class="text-xs text-slate-500 leading-relaxed">
                        {{ insight.action }}
                      </p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Empty State -->
              <div
                v-else
                class="py-8 px-4 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <div
                  class="mx-auto w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <UiIcon icon="heroicons:sparkles" class="w-4 h-4" />
                </div>
                <p class="text-sm font-bold text-slate-900">All caught up!</p>
                <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                  No urgent chasers needed right now. Good job!
                </p>
              </div>
            </div>
          </div>

          <!-- Referral Campaign -->
          <div
            class="bg-emerald-50/10 shadow-sm rounded-xl border border-emerald-100 p-6 flex flex-col relative overflow-hidden">
            <div class="flex items-center gap-2 mb-4">
              <div class="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                <UiIcon icon="heroicons:gift" class="w-4 h-4" />
              </div>
              <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
                Referral Campaign
              </h3>
            </div>

            <p class="text-xs text-slate-500 mb-4 leading-relaxed">
              Share your code and when user subscribe you can claim reward.
            </p>

            <div class="space-y-4">
              <!-- Referral Credits Status -->
              <div class="flex items-center justify-between px-1">
                <span
                  class="text-xs font-semibold text-slate-500 capitalize tracking-wider"
                  >My Credits</span
                >
                <span class="text-lg font-bold text-emerald-600">{{
                  authStore.user?.referralCredits || 0
                }}</span>
              </div>

              <!-- Referral Code Field -->
              <div class="flex items-center gap-2">
                <div
                  class="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-700">
                  {{ authStore.user?.referralCode || "..." }}
                </div>
                <button
                  @click="copyReferralCode"
                  class="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Copy Code">
                  <UiIcon icon="heroicons:document-duplicate" class="w-4 h-4" />
                </button>
              </div>

              <NuxtLink
                to="/referral-management"
                class="w-full inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">
                See your progress →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    <UiToast v-model="toast" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDashboardStore } from "~/stores/dashboardStore";
import { useAuthStore } from "~/stores/authStore";
import { useUiStore } from "~/stores/uiStore";
import { useReferralStore } from "~/stores/referralStore";
import { useSystemStore } from "~/stores/systemStore";
import confetti from "canvas-confetti";

const route = useRoute();
const router = useRouter();
const dashboardStore = useDashboardStore();
const authStore = useAuthStore();
const uiStore = useUiStore();
const referralStore = useReferralStore();
const systemStore = useSystemStore();
const toast = ref({ message: "", type: "success" });

const forecastRange = ref(30);
const selectedMonth = ref("");
const selectedYear = ref(new Date().getFullYear());
const profitabilityFilter = ref("top5");
const activeFilterMode = ref(null);

const rankOptions = [
  { label: "Top 5", value: "top5" },
  { label: "Bottom 5", value: "bottom5" },
];

const forecastOptions = [
  { label: "Next 30 Days", value: 30 },
  { label: "Next 60 Days", value: 60 },
  { label: "Next 90 Days", value: 90 },
  { label: "All Time", value: "all" },
];

const monthOptions = [
  { label: "Rolling Range", value: "" },
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const yearOptions = Array.from({ length: 4 }, (_, i) => ({
  label: String(new Date().getFullYear() - 1 + i),
  value: new Date().getFullYear() - 1 + i,
}));

const fetchCoreData = async (params = {}) => {
  try {
    await dashboardStore.fetchCoreData(params);
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || "Failed to load dashboard stats",
      type: "error",
    };
  }
};

const copyReferralCode = () => {
  const code = authStore.user?.referralCode;
  if (code) {
    navigator.clipboard.writeText(code);
    toast.value = { message: "Referral code copied!", type: "success" };
  }
};

const fetchForecastData = async () => {
  try {
    const params = {};
    if (selectedMonth.value) {
      params.month = selectedMonth.value;
      params.year = selectedYear.value;
    } else {
      params.range = forecastRange.value;
    }
    await dashboardStore.fetchForecastData(params);
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || "Failed to load forecast data",
      type: "error",
    };
  }
};

// Watch for any forecast filter changes
watch([forecastRange, selectedMonth, selectedYear], () => {
  fetchForecastData();
});

watch(profitabilityFilter, (newVal) => {
  fetchCoreData({ rank: newVal });
});

onMounted(() => {
  fetchCoreData({ rank: profitabilityFilter.value });
  fetchForecastData();
  authStore.fetchProfile();
  referralStore.fetchStats();

  // Check for welcome trigger
  if (route.query.welcome === "true") {
    uiStore.toggleWelcomeModal(true);

    // Trigger professional celebration (Confetti)
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#6366f1"],
    });

    // Clean up URL query parameters
    const newQuery = { ...route.query };
    delete newQuery.welcome;
    router.replace({ query: newQuery });
  }
});

// Chart Data mapping
const chartData = computed(() => {
  const history = dashboardStore.cashflow?.history || [];
  const forecast = dashboardStore.cashflow?.forecast || [];

  const combined = [...history, ...forecast];

  const mapped = combined.map((item) => ({
    date: item.date,
    amount: item.amount || 0,
    details: Array.isArray(item.details) ? item.details : [],
  }));

  return mapped.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
});

watch(chartData, (newData) => {}, { immediate: true });

const toggleFilterMode = (mode) => {
  if (activeFilterMode.value === mode) {
    activeFilterMode.value = null;
  } else {
    activeFilterMode.value = mode;
    if (mode === "range") {
      selectedMonth.value = "";
    } else if (mode === "calendar") {
      forecastRange.value = 30;
    }
  }
};
</script>

<style scoped>
/* Custom scrollbar for Client Profitability */
.profit-table-scroll::-webkit-scrollbar {
  height: 5px;
}
.profit-table-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.profit-table-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.profit-table-scroll::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* Filter grow animation */
.filter-grow-enter-active,
.filter-grow-leave-active {
  transition: all 0.2s ease-out;
  max-width: 300px;
}
.filter-grow-enter-from,
.filter-grow-leave-to {
  max-width: 0;
  opacity: 0;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* For Firefox */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
</style>
