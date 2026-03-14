<template>
  <div class="advanced-analytics space-y-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Advanced Analytics</h2>
      <p class="text-xs font-medium text-slate-500 mt-1">Deep insights into platform growth and system performance.</p>
    </div>
    <div v-if="adminStore.analytics" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Content Column -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Revenue Trends -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div class="flex items-center justify-between mb-8">
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Normalized Revenue (USD)</h3>
              <p class="text-xl font-bold text-slate-900 tracking-tight">Last 30 Days Trend</p>
            </div>
          </div>
          <div class="h-[280px]">
             <UiChart 
              type="line" 
              :data="revenueData" 
              :options="chartOptions" 
            />
          </div>
        </div>

        <!-- User Growth -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div class="flex items-center justify-between mb-8">
             <div>
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Platform Expansion</h3>
                <p class="text-sm font-bold text-slate-900 tracking-tight">Daily New User Signups</p>
             </div>
          </div>
          <div class="h-[200px]">
            <UiChart 
              type="bar" 
              :data="userData" 
              :options="barOptions" 
            />
          </div>
        </div>
      </div>

      <!-- Sidebar Column -->
      <div class="lg:col-span-4 space-y-8">
        <!-- Plan Distribution -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div class="text-center mb-8">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Market Share</h3>
            <p class="text-sm font-bold text-slate-900 tracking-tight">Plan Distribution</p>
          </div>
          <div class="h-[220px] flex items-center justify-center">
            <UiChart 
              type="doughnut" 
              :data="planData" 
              :options="doughnutOptions" 
            />
          </div>
        </div>

        <!-- System Health Card -->
        <div class="bg-slate-900 rounded-xl p-6 shadow-xl relative overflow-hidden group">
          <div class="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl transition-all group-hover:bg-emerald-500/20"></div>
          
          <div class="flex items-center gap-2 mb-8 relative z-10">
            <div class="p-1.5 bg-emerald-500/20 rounded-lg">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <h3 class="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">System Health</h3>
          </div>

          <div class="space-y-4 relative z-10">
            <div class="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Node Engine</span>
              <span class="text-xs font-mono font-bold text-slate-300">{{ adminStore.analytics.system.nodeVersion }}</span>
            </div>
            <div class="flex justify-between items-start bg-white/5 p-3 rounded-xl border border-white/5">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Memory Usage</span>
              <div class="text-right">
                <p class="text-sm font-bold text-emerald-400 leading-none mb-1">{{ adminStore.analytics.system.memory.percentUsed }}</p>
                <p class="text-[9px] text-slate-500 font-bold tracking-tight uppercase">{{ adminStore.analytics.system.memory.used }} / {{ adminStore.analytics.system.memory.total }}</p>
              </div>
            </div>
            <div class="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Server Uptime</span>
              <span class="text-xs font-bold text-slate-300">{{ formatUptime(adminStore.analytics.system.uptime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="adminStore.loading" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
      <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Processing Intelligence...</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAdminStore } from '~/stores/adminStore';
import { useUiStore } from '~/stores/uiStore';

definePageMeta({
  layout: 'default',
  middleware: 'admin'
});

const adminStore = useAdminStore();
const uiStore = useUiStore();

onMounted(() => {

  adminStore.fetchAnalytics();
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
    labels: adminStore.analytics.web.revenueTrends.map(d => d.date),
    datasets: [{
      label: 'Revenue',
      data: adminStore.analytics.web.revenueTrends.map(d => d.amount),
      borderColor: '#059669',
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      fill: true,
      tension: 0.4
    }]
  };
});

const userData = computed(() => {
  if (!adminStore.analytics) return { labels: [], datasets: [] };
  return {
    labels: adminStore.analytics.web.userGrowth.map(d => d.date),
    datasets: [{
      label: 'Signups',
      data: adminStore.analytics.web.userGrowth.map(d => d.count),
      backgroundColor: '#059669',
      borderRadius: 4
    }]
  };
});

const planData = computed(() => {
  if (!adminStore.analytics) return { labels: [], datasets: [] };
  return {
    labels: adminStore.analytics.web.planDistribution.map(d => d.plan),
    datasets: [{
      data: adminStore.analytics.web.planDistribution.map(d => d.count),
      backgroundColor: ['#94a3b8', '#10b981', '#0f172a']
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { 
      beginAtZero: true, 
      grid: { color: '#f8fafc' }, 
      border: { display: false },
      ticks: { font: { size: 9, weight: 'bold' }, color: '#94a3b8' } 
    },
    x: { 
      grid: { display: false }, 
      border: { display: false },
      ticks: { font: { size: 9, weight: 'bold' }, color: '#94a3b8' } 
    }
  }
};

const barOptions = { ...chartOptions };
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '82%',
  plugins: { 
    legend: { 
      position: 'bottom', 
      labels: { 
        boxWidth: 8, 
        padding: 20,
        usePointStyle: true,
        font: { size: 10, weight: '700' },
        color: '#64748b'
      } 
    } 
  }
};
</script>

<style scoped>
.advanced-analytics {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
