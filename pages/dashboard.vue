<template>
  <div class="dashboard-page max-w-[1400px] mx-auto font-sans pb-8">
    <div class="flex flex-col gap-8">
      <!-- Header Section -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p class="mt-1 text-sm text-slate-500 font-medium">
            Here's your financial overview for today.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/invoices/create"
            class="inline-flex items-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all">
            New Invoice
          </NuxtLink>
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
                  {{ dashboardStore.usageLimits?.waSends || 0 }}</span
                >
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
                <span>WA Reminders Used:</span>
                <span class="font-semibold text-slate-600"
                  >{{ authStore.user?.waRemindersUsed || 0 }} /
                  {{ dashboardStore.usageLimits?.waReminders || 0 }}</span
                >
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-500 uppercase tracking-tight"
                  >Email Sends</span
                >
                <span class="text-slate-900"
                  >{{ authStore.user?.emailSendsUsed || 0 }} /
                  {{ dashboardStore.usageLimits?.emailSends || 0 }}</span
                >
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
                  {{ dashboardStore.usageLimits?.emailReminders || 0 }}</span
                >
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-500 uppercase tracking-tight"
                  >AI Helper Credits</span
                >
                <span class="text-slate-900"
                  >{{ authStore.user?.aiUsed || 0 }} /
                  {{ dashboardStore.usageLimits?.aiCredits || 0 }}</span
                >
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

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Chart Section -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Monthly Revenue Forecast -->
          <div
            class="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div
              class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 class="text-lg font-semibold text-slate-900 tracking-tight">
                Monthly Revenue Forecast
              </h2>
              <UiSelect
                v-model="forecastRange"
                :options="forecastOptions"
                custom-class="!w-40 !py-1.5 !text-xs !font-semibold !bg-slate-50" />
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
                    class="w-8 h-8 text-slate-200" />
                  <p>No cashflow data available for this range</p>
                </div>
              </ClientOnly>
            </div>
          </div>

          <!-- Client Profitability Insights -->
          <div
            class="bg-white shadow-sm rounded-xl border border-slate-200 flex flex-col overflow-hidden relative">
            <!-- Blur Overlay for Client Profitability -->
            <div
              v-if="!authStore.isPro"
              class="absolute inset-0 z-10 backdrop-blur-[4px] bg-white/40 flex items-center justify-center border border-slate-100/50">
              <div class="text-center p-4">
                <div class="flex items-center justify-center gap-1 mb-2">
                  <h3 class="text-[13px] font-bold text-slate-900">
                    Profitability Insights Locked
                  </h3>
                  <UiIcon
                    icon="heroicons:lock-closed"
                    class="w-3 h-3 text-black/70" />
                </div>
                <p class="text-[12px] text-slate-500 mb-4 px-2 leading-relaxed">
                  Identify your most high-value clients with automated margin
                  analysis and payment behavior tracking.
                </p>

                <NuxtLink
                  to="/settings?tab=billing"
                  class="text-[10px] font-bold border border-emerald-200 py-2 px-4 rounded-md text-emerald-600 hover:text-emerald-800 uppercase tracking-widest"
                  >Upgrade to Pro →</NuxtLink
                >
              </div>
            </div>

            <div
              class="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
                  Client Profitability
                </h3>
                <p class="text-sm text-slate-500 font-medium mt-1">
                  AI analysis ranking clients by effective margin.
                </p>
              </div>
              <UiSelect
                v-model="profitabilityFilter"
                :options="rankOptions"
                custom-class="!w-32 !py-1 !text-xs !font-semibold !uppercase !tracking-wider !bg-slate-50" />
            </div>
            <div class="flex-1 overflow-x-auto">
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
                      Avg Margin
                    </th>
                    <th
                      class="px-6 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Impact
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-slate-100">
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
                    <td
                      class="px-6 py-4 text-right text-sm font-semibold"
                      :class="
                        client.profitMargin > 20
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      ">
                      {{ client.profitMargin > 20 ? "High" : "Low" }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sidebar Column -->
        <div class="lg:col-span-1 space-y-8">
          <!-- AI Suggestions -->
          <div
            class="bg-emerald-50/10 shadow-sm rounded-xl border border-emerald-100 p-6 flex flex-col relative overflow-hidden">
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

            <div class="flex items-center gap-2 mb-4">
              <div class="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                <UiIcon icon="heroicons:sparkles" class="w-4 h-4" />
              </div>
              <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
                AI Chaser Insights
              </h3>
            </div>
            <div class="space-y-4 min-h-[100px]">
              <div
                v-for="insight in dashboardStore.insights"
                :key="insight.id || insight.title"
                class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-all cursor-pointer group"
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
                        : 'bg-emerald-600'
                    "></div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900">
                      {{ insight.title }}
                    </p>
                    <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                      {{ insight.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity History -->
          <div
            class="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col">
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
                  INV
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
        </div>
      </div>
    </div>
    <UiToast v-model="toast" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useDashboardStore } from "~/stores/dashboardStore";
import { useAuthStore } from "~/stores/authStore";

const dashboardStore = useDashboardStore();
const authStore = useAuthStore();
const toast = ref({ message: "", type: "success" });

const forecastRange = ref(30);

const fetchDashboardData = async (range) => {
  try {
    await dashboardStore.fetchDashboardData(range);
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || "Failed to load dashboard data",
      type: "error",
    };
  }
};

// Watch for range changes to fetch new data
watch(forecastRange, (newRange) => {
  fetchDashboardData(newRange);
});

onMounted(() => {
  fetchDashboardData(forecastRange.value);
  authStore.fetchProfile();
});

// Chart Data mapping
const chartData = computed(() => {
  // Combine history and forecast into a continuous series
  const history = dashboardStore.cashflow?.history || [];
  const forecast = dashboardStore.cashflow?.forecast || [];

  const combined = [...history, ...forecast].map((item) => ({
    date: item.date,
    amount: item.amount,
  }));

  // Sort by date to ensure continuity
  return combined.sort((a, b) => new Date(a.date) - new Date(b.date));
});

watch(
  chartData,
  (newData) => {
    console.log("Dashboard Chart Data:", newData);
  },
  { immediate: true },
);

const profitabilityFilter = ref("top5");
const rankOptions = [
  { label: "Top 5", value: "top5" },
  { label: "Bottom 5", value: "bottom5" },
];

const forecastOptions = [
  { label: "Next 30 Days", value: 30 },
  { label: "Next 60 Days", value: 60 },
  { label: "Next 90 Days", value: 90 },
];
</script>
