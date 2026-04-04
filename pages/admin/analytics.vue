<template>
  <div class="advanced-analytics space-y-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
        Analytics Overview
      </h2>
      <p class="text-xs font-medium text-slate-500 mt-1">
        Monitor your platform's revenue, user growth, and system health.
      </p>
    </div>

    <!-- Charts Section -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAdminStore } from "~/stores/adminStore";

definePageMeta({
  layout: "default",
  middleware: "admin",
});

const adminStore = useAdminStore();

onMounted(async () => {
  await adminStore.fetchAnalytics();
});

const formatUptime = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hrs = Math.floor((seconds % (3600 * 24)) / 3600);
  return `${days}d ${hrs}h`;
};

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
          value >= 1000 ? "MYR " + value / 1000 + "k" : "MYR " + value,
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
</script>

<style scoped>
:deep(.chart-container) {
  position: relative;
}
</style>
