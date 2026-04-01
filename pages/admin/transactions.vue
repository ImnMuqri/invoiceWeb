<template>
  <div class="transactions-management">
    <!-- Page Header -->
    <div
      class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
          Transaction Management
        </h2>
        <p class="text-xs font-medium text-slate-500 mt-1">
          Monitor system-wide subscriptions and payment status.
        </p>
      </div>
      <div class="relative w-full sm:w-64 shrink-0">
        <UiIcon
          icon="heroicons:magnifying-glass"
          class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by user or plan..."
          class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
      </div>
    </div>

    <!-- Transactions Table -->
    <UiTable
      :loading="adminStore.loading"
      :is-empty="filteredTransactions.length === 0"
      :column-count="5">
      <template #header>
        <th
          scope="col"
          class="py-4 pl-6 pr-3 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          User / Platform
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Plan Details
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Amount
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Status
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Transaction Date
        </th>
        <th scope="col" class="relative py-4 pl-3 pr-6 text-right">
          <button
            @click="adminStore.fetchTransactions()"
            class="p-1.5 hover:bg-slate-100 rounded-lg transition-all"
            title="Refresh List">
            <UiIcon
              icon="heroicons:arrow-path"
              class="w-4 h-4 text-slate-400" />
          </button>
        </th>
      </template>

      <tr
        v-for="tx in filteredTransactions"
        :key="tx.id"
        class="hover:bg-slate-50 transition-colors group">
        <td class="whitespace-nowrap py-4 pl-6 pr-3">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold ring-2 ring-white shadow-sm shrink-0 uppercase">
              {{ tx.user?.name?.charAt(0) || "U" }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-900 truncate">
                {{ tx.user?.name || "Unnamed User" }}
              </p>
              <p class="text-xs font-medium text-slate-500 truncate">
                {{ tx.user?.email }}
              </p>
            </div>
          </div>
        </td>
        <td class="whitespace-nowrap px-3 py-4">
          <div class="flex flex-col">
            <span
              class="text-sm font-semibold text-slate-900 uppercase tracking-tight"
              >{{ tx.plan }}</span
            >
            <span
              v-if="tx.xenditSubscriptionId"
              class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5"
              >XND-SUB: {{ tx.xenditSubscriptionId.split("_").pop() }}</span
            >
          </div>
        </td>
        <td class="whitespace-nowrap px-3 py-4">
          <span class="text-sm font-bold text-slate-900"
            >{{ tx.currency }} {{ tx.amount.toLocaleString() }}</span
          >
        </td>
        <td class="whitespace-nowrap px-3 py-4">
          <span
            :class="[
              'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit border',
              statusColors[tx.status] ||
                'bg-slate-50 text-slate-600 border-slate-100',
            ]">
            {{ tx.status }}
          </span>
        </td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500">
          {{
            new Date(tx.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          }}
          <span
            class="text-[10px] text-slate-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {{
              new Date(tx.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </span>
        </td>
        <td class="relative whitespace-nowrap py-4 pl-3 pr-6 text-right">
          <!-- Potential detail view or xendit link -->
        </td>
      </tr>
    </UiTable>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useAdminStore } from "~/stores/adminStore";

definePageMeta({
  layout: "default",
  middleware: "admin",
});

const adminStore = useAdminStore();
const searchQuery = ref("");

const statusColors = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
  INACTIVE: "bg-slate-50 text-slate-600 border-slate-100",
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
  FAILED: "bg-red-50 text-red-700 border-red-100",
};

const filteredTransactions = computed(() => {
  if (!searchQuery.value) return adminStore.transactions;
  const q = searchQuery.value.toLowerCase();
  return adminStore.transactions.filter(
    (tx) =>
      tx.user?.name?.toLowerCase().includes(q) ||
      tx.user?.email?.toLowerCase().includes(q) ||
      tx.plan?.toLowerCase().includes(q) ||
      tx.status?.toLowerCase().includes(q),
  );
});

onMounted(() => {
  adminStore.fetchTransactions();
});
</script>
