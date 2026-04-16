<template>
  <div class="max-w-5xl mx-auto space-y-6 pb-20">
    <!-- Back & Actions Header -->
    <div class="flex items-center justify-between">
      <NuxtLink to="/admin/tickets" class="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
        <div class="w-8 h-8 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center group-hover:border-slate-300 transition-all">
          <UiIcon icon="heroicons:arrow-left" class="w-4 h-4" />
        </div>
        <span class="text-sm font-bold">Back to Inbox</span>
      </NuxtLink>

      <div class="flex items-center gap-2">
        <div :class="['px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-widest', getStatusClass(ticket?.status)]">
          {{ ticket?.status }}
        </div>
        <UiPopover placement="bottom-end">
          <template #trigger="{ isOpen }">
            <button class="p-2.5 bg-white border border-[#e5e5e5] rounded-xl hover:bg-slate-50 transition-all">
              <UiIcon icon="heroicons:ellipsis-horizontal" class="w-5 h-5 text-slate-600" />
            </button>
          </template>
          <template #default="{ close }">
            <div class="w-[180px] p-2 bg-white rounded-2xl shadow-xl border border-slate-100">
               <button 
                 v-for="status in ['OPEN', 'PENDING', 'CLOSED']" 
                 :key="status"
                 @click="updateStatus(status); close()"
                 class="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors uppercase tracking-wider"
               >
                 Mark as {{ status }}
               </button>
            </div>
          </template>
        </UiPopover>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center p-20 space-y-4">
      <div class="relative flex items-center justify-center">
          <div class="w-12 h-12 border-4 border-emerald-500/20 rounded-full"></div>
          <div class="w-12 h-12 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
    </div>

    <div v-else-if="ticket" class="space-y-6">
      <!-- Ticket Info Header -->
      <div class="bg-white rounded-3xl border border-[#e5e5e5] p-6 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div class="space-y-1">
            <h2 class="text-xl font-bold text-slate-900 tracking-tight">{{ ticket.subject }}</h2>
            <div class="flex items-center gap-3">
               <p class="text-sm font-medium text-slate-500">
                 From: <span class="text-slate-900 font-bold">{{ ticket.fromName || 'Guest' }}</span> 
                 <span class="mx-1 text-slate-300">•</span> 
                 {{ ticket.fromEmail }}
               </p>
               <div v-if="ticket.user" class="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 flex items-center gap-1.5">
                  <span class="w-1 h-1 bg-emerald-500 rounded-full"></span>
                  <span class="text-[10px] font-bold text-emerald-600 uppercase">Registered User</span>
               </div>
            </div>
          </div>
          <div class="text-right">
             <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ticket Created</p>
             <p class="text-sm font-bold text-slate-900">{{ formatDate(ticket.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Message History -->
      <div class="space-y-6">
        <div 
          v-for="message in ticket.messages" 
          :key="message.id"
          :class="['flex', message.sender === 'ADMIN' ? 'justify-end' : 'justify-start']"
        >
          <div :class="['max-w-[85%] md:max-w-[70%] space-y-2', message.sender === 'ADMIN' ? 'items-end' : 'items-start']">
             <div class="flex items-center gap-2 px-2">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {{ message.sender === 'ADMIN' ? 'InvoKita Support' : (ticket.fromName || 'User') }}
                </span>
                <span class="text-[10px] font-medium text-slate-300 font-mono">{{ formatTime(message.createdAt) }}</span>
             </div>
             <div :class="['p-5 rounded-3xl shadow-sm text-[15px] leading-relaxed', 
               message.sender === 'ADMIN' 
                ? 'bg-slate-900 text-white rounded-tr-none' 
                : 'bg-white border border-[#e5e5e5] text-slate-700 rounded-tl-none'
             ]">
                <p class="whitespace-pre-wrap">{{ message.content }}</p>
             </div>
          </div>
        </div>
      </div>

      <!-- Reply Section -->
      <div class="sticky bottom-6 bg-white rounded-3xl border border-[#e5e5e5] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div class="space-y-4">
           <textarea 
            v-model="replyContent"
            placeholder="Type your reply here..."
            class="w-full min-h-[120px] p-4 bg-slate-50 border-none rounded-2xl resize-none text-[15px] outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
           ></textarea>
           
           <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                 <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" v-model="closeOnReply" class="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                    <span class="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Close ticket after reply</span>
                 </label>
              </div>

              <button 
                @click="sendReply"
                :disabled="!replyContent || sending"
                class="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <div v-if="sending" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <UiIcon v-else icon="heroicons:paper-airplane" class="w-4 h-4" />
                {{ sending ? 'Sending...' : 'Send Reply' }}
              </button>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/authStore';
import { formatDate, formatTime } from '~/utils/date';

definePageMeta({
  title: 'Ticket Conversation',
  middleware: 'admin'
});

const route = useRoute();
const authStore = useAuthStore();
const loading = ref(true);
const sending = ref(false);
const ticket = ref(null);
const replyContent = ref('');
const closeOnReply = ref(false);

async function fetchTicket() {
  loading.value = true;
  try {
    const data = await $fetch(`/api/support/${route.params.id}`, {
      headers: authStore.authHeaders
    });
    ticket.value = data;
  } catch (err) {
    console.error('Failed to fetch ticket:', err);
  } finally {
    loading.value = false;
  }
}

async function sendReply() {
  if (!replyContent.value || sending.value) return;
  sending.value = true;
  try {
    await $fetch(`/api/support/${route.params.id}/reply`, {
      method: 'POST',
      headers: authStore.authHeaders,
      body: {
        content: replyContent.value,
        closeTicket: closeOnReply.value
      }
    });
    replyContent.value = '';
    await fetchTicket(); // Refresh thread
  } catch (err) {
    alert('Failed to send reply. Please check logs.');
  } finally {
    sending.value = false;
  }
}

async function updateStatus(status) {
  try {
    await $fetch(`/api/support/${route.params.id}/status`, {
      method: 'PATCH',
      headers: authStore.authHeaders,
      body: { status }
    });
    await fetchTicket();
  } catch (err) {
    alert('Failed to update status.');
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'OPEN': return 'bg-red-50 border-red-100 text-red-600';
    case 'PENDING': return 'bg-amber-50 border-amber-100 text-amber-600';
    case 'CLOSED': return 'bg-emerald-50 border-emerald-100 text-emerald-600';
    default: return 'bg-slate-50 border-slate-100 text-slate-500 text-emerald-600';
  }
}

onMounted(() => {
  fetchTicket();
});
</script>
