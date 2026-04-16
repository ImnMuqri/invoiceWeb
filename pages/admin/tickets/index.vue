<template>
  <div class="space-y-8">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-1">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <UiIcon icon="heroicons:ticket" class="w-5 h-5 text-emerald-600" />
          </div>
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Support Tickets</h1>
        </div>
        <p class="text-[14px] text-slate-500 font-medium">Manage and respond to user inquiries from Resend.</p>
      </div>

      <!-- Quick Actions / Filters -->
      <div class="flex items-center gap-3">
        <div class="relative group">
          <UiIcon icon="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search tickets..." 
            class="pl-10 pr-4 py-2.5 bg-white border border-[#e5e5e5] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all w-full md:w-[240px]"
          />
        </div>
        <button 
          @click="fetchTickets"
          class="p-2.5 bg-white border border-[#e5e5e5] text-slate-600 hover:text-slate-900 rounded-xl transition-all hover:bg-slate-50 shadow-sm"
          :class="{ 'animate-spin': loading }"
        >
          <UiIcon icon="heroicons:arrow-path" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div :class="['p-2 rounded-xl', stat.bgClass]">
            <UiIcon :icon="stat.icon" :class="['w-5 h-5', stat.iconClass]" />
          </div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ stat.label }}</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900">{{ stat.value }}</span>
        </div>
      </div>
    </div>

    <!-- Ticket List Table -->
    <div class="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden min-h-[400px]">
      <div v-if="loading" class="flex flex-col items-center justify-center p-20 space-y-4">
        <div class="relative flex items-center justify-center">
            <div class="w-12 h-12 border-4 border-emerald-500/20 rounded-full"></div>
            <div class="w-12 h-12 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p class="text-sm font-medium text-slate-400">Loading tickets...</p>
      </div>

      <div v-else-if="filteredTickets.length === 0" class="flex flex-col items-center justify-center p-20 text-center">
        <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <UiIcon icon="heroicons:ticket-slash" class="w-10 h-10 text-slate-200" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-1">No tickets found</h3>
        <p class="text-sm text-slate-400 max-w-[240px]">We couldn't find any tickets matching your search criteria.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-[#e5e5e5]">
              <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User / Status</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Subject</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Priority</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Last Update</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#e5e5e5]">
            <tr 
              v-for="ticket in filteredTickets" 
              :key="ticket.id"
              class="group hover:bg-slate-50/50 transition-colors cursor-pointer"
              @click="$router.push(`/admin/tickets/${ticket.id}`)"
            >
              <td class="px-6 py-5">
                <span class="text-xs font-mono font-bold text-slate-400 text-slate-400 group-hover:text-emerald-600 transition-colors">#{{ String(ticket.id).padStart(4, '0') }}</span>
              </td>
              <td class="px-6 py-5">
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-bold text-slate-900">{{ ticket.fromName || 'Guest' }}</p>
                    <div v-if="ticket.user" class="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 flex items-center gap-1">
                      <UiIcon icon="heroicons:check-badge" class="w-3 h-3 text-emerald-500" />
                      <span class="text-[10px] font-bold text-emerald-600 uppercase">{{ ticket.user.plan }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <p class="text-xs text-slate-500">{{ ticket.fromEmail }}</p>
                    <span :class="['w-1.5 h-1.5 rounded-full', getStatusColor(ticket.status)]"></span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ ticket.status }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-5">
                <div class="max-w-[300px]">
                  <p class="text-sm font-semibold text-slate-700 leading-tight truncate group-hover:text-emerald-600 transition-colors">
                    {{ ticket.subject }}
                  </p>
                  <p class="text-[11px] text-slate-400 mt-1">
                    {{ ticket._count?.messages || 0 }} messages in thread
                  </p>
                </div>
              </td>
              <td class="px-6 py-5">
                <div :class="['inline-flex items-center px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider', getPriorityClass(ticket.priority)]">
                   {{ ticket.priority }}
                </div>
              </td>
              <td class="px-6 py-5 text-right">
                <p class="text-sm font-semibold text-slate-900">{{ formatRelativeDate(ticket.updatedAt) }}</p>
                <p class="text-[11px] text-slate-400 mt-0.5">{{ formatDate(ticket.updatedAt) }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/authStore';
import { formatDate, formatRelativeDate } from '~/utils/date';

definePageMeta({
  title: 'Support Inbox',
  middleware: 'admin'
});

const authStore = useAuthStore();
const loading = ref(true);
const tickets = ref([]);
const searchQuery = ref('');

const stats = computed(() => {
  const open = tickets.value.filter(t => t.status === 'OPEN').length;
  const pending = tickets.value.filter(t => t.status === 'PENDING').length;
  const closed = tickets.value.filter(t => t.status === 'CLOSED').length;
  
  return [
    { label: 'Open', value: open, icon: 'heroicons:envelope-open', bgClass: 'bg-red-50', iconClass: 'text-red-500' },
    { label: 'Pending', value: pending, icon: 'heroicons:clock', bgClass: 'bg-amber-50', iconClass: 'text-amber-500' },
    { label: 'Closed', value: closed, icon: 'heroicons:check-circle', bgClass: 'bg-emerald-50', iconClass: 'text-emerald-500' },
    { label: 'Total', value: tickets.value.length, icon: 'heroicons:chat-bubble-left-right', bgClass: 'bg-slate-50', iconClass: 'text-slate-500' }
  ];
});

const filteredTickets = computed(() => {
  if (!searchQuery.value) return tickets.value;
  const q = searchQuery.value.toLowerCase();
  return tickets.value.filter(t => 
    t.subject.toLowerCase().includes(q) || 
    t.fromEmail.toLowerCase().includes(q) ||
    t.fromName?.toLowerCase().includes(q)
  );
});

async function fetchTickets() {
  loading.value = true;
  try {
    const response = await $fetch('/api/support', {
      headers: authStore.authHeaders
    });
    tickets.value = response;
  } catch (err) {
    console.error('Failed to fetch tickets:', err);
  } finally {
    loading.value = false;
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'OPEN': return 'bg-red-500 animate-pulse';
    case 'PENDING': return 'bg-amber-500';
    case 'CLOSED': return 'bg-emerald-500';
    default: return 'bg-slate-300';
  }
}

function getPriorityClass(priority) {
  switch (priority) {
    case 'HIGH': return 'bg-red-50 border-red-100 text-red-600';
    case 'MEDIUM': return 'bg-amber-50 border-amber-100 text-amber-600';
    case 'LOW': return 'bg-emerald-50 border-emerald-100 text-emerald-600';
    default: return 'bg-slate-50 border-slate-100 text-slate-500';
  }
}

onMounted(() => {
  fetchTickets();
});
</script>
