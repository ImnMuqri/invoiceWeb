<template>
  <div class="advanced-analytics space-y-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
        Advanced Analytics
      </h2>
      <p class="text-xs font-medium text-slate-500 mt-1">
        Deep insights into platform growth and system performance.
      </p>
    </div>
    <!-- Dashboard Overview Stats -->
    <!-- Dashboard Overview Stats -->
    <div
      v-if="adminStore.analytics?.summary"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Revenue (Lifetime) -->
      <div
        class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-center justify-between mb-4">
          <div
            class="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors text-emerald-600">
            <UiIcon icon="heroicons:banknotes" class="w-5 h-5" />
          </div>
          <div
            class="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-bold">
            LIFETIME
          </div>
        </div>
        <dt
          class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Total Revenue
        </dt>
        <dd class="text-2xl font-semibold text-slate-900 tracking-tight">
          ${{ adminStore.analytics.summary.revenue.lifetime.toLocaleString() }}
        </dd>
        <p class="text-[10px] text-slate-500 mt-2 font-medium">
          All-time platform earnings
        </p>
      </div>

      <!-- Total Users Card -->
      <div
        class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-center justify-between mb-4">
          <div
            class="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors text-blue-600">
            <UiIcon icon="heroicons:users" class="w-5 h-5" />
          </div>
          <div
            :class="
              adminStore.analytics.summary.users.growth >= 0
                ? 'text-blue-600 bg-blue-50'
                : 'text-red-600 bg-red-50'
            "
            class="px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
            <UiIcon
              :icon="
                adminStore.analytics.summary.users.growth >= 0
                  ? 'heroicons:arrow-trending-up'
                  : 'heroicons:arrow-trending-down'
              "
              class="w-3 h-3" />
            {{ Math.abs(adminStore.analytics.summary.users.growth) }}%
          </div>
        </div>
        <dt
          class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Total Users
        </dt>
        <dd class="text-2xl font-semibold text-slate-900 tracking-tight">
          {{ adminStore.analytics.summary.users.total.toLocaleString() }}
        </dd>
        <p class="text-[10px] text-slate-500 mt-2 font-medium">
          Global platform reach
        </p>
      </div>

      <!-- Monthly Revenue Selector Card -->
      <div
        class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-center justify-between mb-4">
          <div
            class="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors text-purple-600">
            <UiIcon icon="heroicons:calendar-days" class="w-5 h-5" />
          </div>
          <div class="flex items-center gap-1">
            <select
              v-model="selectedMonth"
              class="bg-slate-50 border-none text-[10px] font-bold text-slate-600 rounded p-1 focus:ring-0 cursor-pointer"
              @change="updateMonthlyRevenue">
              <option v-for="(m, i) in months" :key="i" :value="i + 1">
                {{ m }}
              </option>
            </select>
            <select
              v-model="selectedYear"
              class="bg-slate-50 border-none text-[10px] font-bold text-slate-600 rounded p-1 focus:ring-0 cursor-pointer"
              @change="updateMonthlyRevenue">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>
        <dt
          class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Monthly Revenue
        </dt>
        <dd
          class="text-2xl font-semibold text-slate-900 tracking-tight transition-all"
          :class="{ 'opacity-50 animate-pulse': loadingMonthly }">
          ${{ monthlyRevenueValue.toLocaleString() }}
        </dd>
        <p class="text-[10px] text-slate-500 mt-2 font-medium">
          {{ months[selectedMonth - 1] }} {{ selectedYear }} Earnings
        </p>
      </div>

      <!-- Total Transactions Card -->
      <div
        class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group text-white bg-slate-900">
        <div class="flex items-center justify-between mb-4">
          <div
            class="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors text-amber-400">
            <UiIcon icon="heroicons:credit-card" class="w-5 h-5" />
          </div>
          <div
            class="text-white/40 text-[9px] font-bold tracking-widest uppercase">
            Platform-wide
          </div>
        </div>
        <dt
          class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Total Transactions
        </dt>
        <dd class="text-2xl font-semibold text-white tracking-tight">
          {{ adminStore.analytics.summary.totalTransactions.toLocaleString() }}
        </dd>
        <p class="text-[10px] text-slate-400 mt-2 font-medium">
          Lifetime cumulative activity
        </p>
      </div>
    </div>

    <div
      v-if="adminStore.analytics"
      class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Content Column -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Revenue Trends -->
        <div
          class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h3
                class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Normalized Revenue (USD)
              </h3>
              <p class="text-xl font-semibold text-slate-900 tracking-tight">
                Daily Revenue Trend
              </p>
            </div>
          </div>
          <div class="h-[320px]">
            <UiChart type="line" :data="revenueData" :options="chartOptions" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- User Growth -->
          <div
            class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h3
                  class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  User Growth
                </h3>
                <p class="text-sm font-semibold text-slate-900 tracking-tight">
                  Daily Signups
                </p>
              </div>
            </div>
            <div class="h-[200px]">
              <UiChart type="bar" :data="userData" :options="barOptions" />
            </div>
          </div>

          <!-- Market Share -->
          <div
            class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div class="text-center mb-8">
              <h3
                class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Market Share
              </h3>
              <p class="text-sm font-semibold text-slate-900 tracking-tight">
                Plan Distribution
              </p>
            </div>
            <div class="h-[200px] flex items-center justify-center">
              <UiChart
                type="doughnut"
                :data="planData"
                :options="doughnutOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Column -->
      <div class="lg:col-span-4 space-y-8">
        <!-- System Health Card -->
        <div
          class="bg-slate-950 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div
            class="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl transition-all group-hover:bg-emerald-500/20"></div>

          <div class="flex items-center gap-2 mb-8 relative z-10">
            <div class="p-1.5 bg-emerald-500/20 rounded-lg">
              <UiIcon
                icon="heroicons:cpu-chip"
                class="w-4 h-4 text-emerald-400" />
            </div>
            <h3
              class="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              System Performance
            </h3>
          </div>

          <div class="space-y-4 relative z-10">
            <div
              class="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
              <span
                class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                >Node Engine</span
              >
              <span class="text-xs font-mono font-bold text-slate-300">{{
                adminStore.analytics.system.nodeVersion
              }}</span>
            </div>
            <div
              class="flex justify-between items-start bg-white/5 p-3 rounded-xl border border-white/5">
              <span
                class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                >Memory Usage</span
              >
              <div class="text-right">
                <p class="text-sm font-bold text-emerald-400 leading-none mb-1">
                  {{ adminStore.analytics.system.memory.percentUsed }}
                </p>
                <p
                  class="text-[9px] text-slate-500 font-bold tracking-tight uppercase">
                  {{ adminStore.analytics.system.memory.used }} /
                  {{ adminStore.analytics.system.memory.total }}
                </p>
              </div>
            </div>
            <div
              class="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
              <span
                class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                >Server Uptime</span
              >
              <span class="text-xs font-bold text-slate-300">{{
                formatUptime(adminStore.analytics.system.uptime)
              }}</span>
            </div>
            <div
              class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
              <div
                class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span
                class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest"
                >Database Stable</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-else-if="adminStore.loading"
      class="flex flex-col items-center justify-center py-24 gap-4">
      <div
        class="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
      <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
        Processing Intelligence...
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useAdminStore } from "~/stores/adminStore";
import { useUiStore } from "~/stores/uiStore";

definePageMeta({
  layout: "default",
  middleware: "admin",
});

const adminStore = useAdminStore();
const uiStore = useUiStore();

const formatUptime = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hrs = Math.floor((seconds % (3600 * 24)) / 3600);
  return `${days}d ${hrs}h`;
};

// Monthly Revenue Selection Logic
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());
const monthlyRevenueValue = ref(0);
const loadingMonthly = ref(false);

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  const startYear = 2024;
  const result = [];
  for (let y = currentYear; y >= startYear; y--) {
    result.push(y);
  }
  return result;
});

const updateMonthlyRevenue = async () => {
  loadingMonthly.value = true;
  try {
    const data = await adminStore.fetchMonthlyRevenue(
      selectedMonth.value,
      selectedYear.value,
    );
    if (data) {
      monthlyRevenueValue.value = data.revenue;
    }
  } finally {
    loadingMonthly.value = false;
  }
};

onMounted(async () => {
  await adminStore.fetchAnalytics();
  // Initial load of monthly revenue for current month
  updateMonthlyRevenue();
});

// Chart Data Mappings
const revenueData = computed(() => {
  if (!adminStore.analytics) return { labels: [], datasets: [] };
  return {
    labels: adminStore.analytics.web.revenueTrends.map((d) => d.date),
    datasets: [
      {
        label: "Revenue",
        data: adminStore.analytics.web.revenueTrends.map((d) => d.amount),
        borderColor: "#059669",
        backgroundColor: "rgba(16, 185, 129, 0.05)",
        fill: true,
        tension: 0.4,
      },
    ],
  };
});

const userData = computed(() => {
  if (!adminStore.analytics) return { labels: [], datasets: [] };
  return {
    labels: adminStore.analytics.web.userGrowth.map((d) => d.date),
    datasets: [
      {
        label: "Signups",
        data: adminStore.analytics.web.userGrowth.map((d) => d.count),
        backgroundColor: "#059669",
        borderRadius: 4,
      },
    ],
  };
});

const planData = computed(() => {
  if (!adminStore.analytics) return { labels: [], datasets: [] };
  return {
    labels: adminStore.analytics.web.planDistribution.map((d) => d.plan),
    datasets: [
      {
        data: adminStore.analytics.web.planDistribution.map((d) => d.count),
        backgroundColor: ["#94a3b8", "#10b981", "#0f172a"],
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0f172a",
      titleFont: { size: 11, weight: "bold" },
      bodyFont: { size: 10 },
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: "rgba(241, 245, 249, 0.5)", drawBorder: false },
      border: { display: false },
      ticks: {
        font: { size: 9, weight: "bold" },
        color: "#94a3b8",
        padding: 8,
        callback: (value) =>
          value >= 1000 ? "$" + value / 1000 + "k" : "$" + value,
      },
    },
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        font: { size: 9, weight: "bold" },
        color: "#94a3b8",
        padding: 8,
      },
    },
  },
};

const barOptions = {
  ...chartOptions,
  scales: {
    ...chartOptions.scales,
    y: {
      ...chartOptions.scales.y,
      ticks: {
        ...chartOptions.scales.y.ticks,
        callback: (value) => value,
      },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "85%",
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        boxWidth: 8,
        padding: 24,
        usePointStyle: true,
        font: { size: 10, weight: "700" },
        color: "#64748b",
      },
    },
    tooltip: {
      backgroundColor: "#0f172a",
      titleFont: { size: 11, weight: "bold" },
      bodyFont: { size: 10 },
      padding: 10,
      cornerRadius: 8,
    },
  },
};
</script>

<style scoped>
.advanced-analytics {
  animation: dashboardFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dashboardFadeIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

:deep(.chart-container) {
  position: relative;
}
</style>
