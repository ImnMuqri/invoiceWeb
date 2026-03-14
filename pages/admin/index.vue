<template>
  <div class="admin-dashboard space-y-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h2>
      <p class="text-xs font-medium text-slate-500 mt-1">Manage user accounts and monitor platform statistics.</p>
    </div>
    <!-- Main Content -->

    <!-- User Management Table -->
    <UiTable
      :loading="adminStore.loading"
      :is-empty="adminStore.users.length === 0"
      :column-count="6"
    >
      <template #header>
        <th scope="col" class="py-4 pl-6 pr-3 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">User</th>
        <th scope="col" class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Plan / Role</th>
        <th scope="col" class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Statistics</th>
        <th scope="col" class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Status</th>
        <th scope="col" class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Joined Date</th>
        <th scope="col" class="relative py-4 pl-3 pr-6 text-right">
          <span class="sr-only">Actions</span>
          <button @click="adminStore.fetchUsers()" class="p-1.5 hover:bg-slate-100 rounded-lg transition-all" title="Refresh List">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </th>
      </template>

      <tr v-for="user in adminStore.users" :key="user.id" class="hover:bg-slate-50 transition-colors group">
        <td class="whitespace-nowrap py-4 pl-6 pr-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm shrink-0">
              {{ user.name?.charAt(0) || 'U' }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-900 truncate">{{ user.name }}</p>
              <p class="text-xs font-medium text-slate-500 truncate">{{ user.email }}</p>
            </div>
          </div>
        </td>
        <td class="whitespace-nowrap px-3 py-4">
          <div class="flex flex-col gap-1.5">
            <span :class="[
              'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit border',
              user.plan === 'FREE' ? 'bg-slate-50 text-slate-600 border-slate-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
            ]">
              {{ user.plan }}
            </span>
            <span v-if="user.role === 'ADMIN'" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator</span>
          </div>
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500">
          <div class="flex items-center gap-4">
            <div class="flex flex-col">
              <span class="text-slate-900 font-bold leading-none">{{ user._count?.clients || 0 }}</span>
              <span class="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Clients</span>
            </div>
            <div class="flex flex-col">
              <span class="text-slate-900 font-bold leading-none">{{ user._count?.invoices || 0 }}</span>
              <span class="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Invoices</span>
            </div>
          </div>
        </td>
        <td class="whitespace-nowrap px-3 py-4">
          <span :class="[
            'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit border',
            user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
          ]">
            {{ user.isActive ? 'Active' : 'Suspended' }}
          </span>
        </td>
        <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500">
          {{ new Date(user.createdAt).toLocaleDateString() }}
        </td>
        <td class="relative whitespace-nowrap py-4 pl-3 pr-6 text-right">
          <UiPopover placement="bottom-end">
            <template #trigger>
              <button class="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                <UiIcon icon="heroicons:ellipsis-horizontal" custom-class="w-5 h-5" />
              </button>
            </template>
            <template #default="{ close }">
              <div class="px-2 py-1.5 border-b border-slate-100 bg-slate-50/50">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Control</span>
              </div>
              <div class="p-1">
                <button @click="close(); toggleUserStatus(user)" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all text-left">
                  <UiIcon :icon="user.isActive ? 'heroicons:no-symbol' : 'heroicons:check-circle'" custom-class="w-4 h-4" />
                  {{ user.isActive ? 'Suspend User' : 'Activate User' }}
                </button>
                <div class="h-px bg-slate-100 my-1 mx-2"></div>
                <button @click="close(); confirmDeleteUser(user)" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-all text-left">
                  <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </template>
          </UiPopover>
        </td>
      </tr>
    </UiTable>

    <!-- Status Modals/Toasts -->
    <UiToast v-model="toast" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useAdminStore } from '~/stores/adminStore';
import { useUiStore } from '~/stores/uiStore';

definePageMeta({
  layout: 'default',
  middleware: 'admin'
});

const adminStore = useAdminStore();
const uiStore = useUiStore();
const toast = ref({ message: "", type: "success" });

onMounted(() => {
  adminStore.fetchUsers();
  adminStore.stats ? null : adminStore.fetchStats();
});

const toggleUserStatus = async (user) => {
  const success = await adminStore.updateUser(user.id, { isActive: !user.isActive });
  if (success) {
    toast.value = { 
      message: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`, 
      type: "success" 
    };
  }
};

const confirmDeleteUser = async (user) => {
  if (confirm(`Are you sure you want to delete ${user.email}? All associated data will be lost forever.`)) {
    const success = await adminStore.deleteUser(user.id);
    if (success) {
      toast.value = { message: "User deleted successfully", type: "success" };
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
