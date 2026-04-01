<template>
  <div class="admin-dashboard">
    <!-- Page Header -->
    <div
      class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
          Users Management
        </h2>
        <p class="text-xs font-medium text-slate-500 mt-1">
          Manage user accounts and monitor platform statistics.
        </p>
      </div>
      <div class="relative w-full sm:w-64 shrink-0">
        <UiIcon
          icon="heroicons:magnifying-glass"
          class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search users by name..."
          class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
      </div>
    </div>
    <!-- Main Content -->

    <!-- User Management Table -->
    <UiTable
      :loading="adminStore.loading"
      :is-empty="filteredUsers.length === 0"
      :column-count="7">
      <template #header>
        <th
          scope="col"
          class="py-4 pl-6 pr-3 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          User
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Plan
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Role
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Statistics
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Status
        </th>
        <th
          scope="col"
          class="px-3 py-4 text-left text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Joined Date
        </th>
        <th scope="col" class="relative py-4 pl-3 pr-6 text-right">
          <span class="sr-only">Actions</span>
          <button
            @click="adminStore.fetchUsers()"
            class="p-1.5 hover:bg-slate-100 rounded-lg transition-all"
            title="Refresh List">
            <svg
              class="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </th>
      </template>

      <tr
        v-for="user in filteredUsers"
        :key="user.id"
        class="hover:bg-slate-50 transition-colors group">
        <td class="whitespace-nowrap py-4 pl-6 pr-3">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm shrink-0">
              {{ user.name?.charAt(0) || "U" }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-900 truncate">
                {{ user.name }}
              </p>
              <p class="text-xs font-medium text-slate-500 truncate">
                {{ user.email }}
              </p>
            </div>
          </div>
        </td>
        <td class="whitespace-nowrap px-3 py-4">
          <div class="flex flex-col gap-1 w-fit">
            <span
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit border',
                user.plan === 'FREE'
                  ? 'bg-slate-50 text-slate-600 border-slate-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100',
              ]">
              {{ user.plan }}
            </span>
            <p
              v-if="
                user.subscriptions &&
                user.subscriptions.length &&
                user.subscriptions[0].status === 'ACTIVE' &&
                user.subscriptions[0].subscriptionEnds
              "
              class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Renews:
              {{
                new Date(
                  user.subscriptions[0].subscriptionEnds,
                ).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              }}
            </p>
          </div>
        </td>
        <td class="whitespace-nowrap px-3 py-4">
          <span
            v-if="user.role === 'ADMIN'"
            class="text-[9px] font-bold text-emerald-600/80 border border-emerald-100 bg-emerald-50 px-2 py-0.5 rounded-md w-fit uppercase tracking-widest inline-block"
            >Admin</span
          >
          <span
            v-else
            class="text-[9px] font-bold text-slate-400 border border-slate-100 bg-slate-50 px-2 py-0.5 rounded-md w-fit uppercase tracking-widest inline-block"
            >User</span
          >
        </td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500">
          <div class="flex items-center gap-4">
            <div class="flex flex-col">
              <span class="text-slate-900 font-bold leading-none">{{
                user._count?.clients || 0
              }}</span>
              <span
                class="text-[9px] text-slate-400 uppercase font-bold tracking-tighter"
                >Clients</span
              >
            </div>
            <div class="flex flex-col">
              <span class="text-slate-900 font-bold leading-none">{{
                user._count?.invoices || 0
              }}</span>
              <span
                class="text-[9px] text-slate-400 uppercase font-bold tracking-tighter"
                >Invoices</span
              >
            </div>
          </div>
        </td>
        <td class="whitespace-nowrap px-3 py-4">
          <span
            :class="[
              'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit border',
              user.isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-red-50 text-red-700 border-red-100',
            ]">
            {{ user.isActive ? "Active" : "Suspended" }}
          </span>
        </td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500">
          {{ new Date(user.createdAt).toLocaleDateString() }}
        </td>
        <td class="relative whitespace-nowrap py-4 pl-3 pr-6 text-right">
          <UiPopover placement="bottom-end">
            <template #trigger>
              <button
                class="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                <UiIcon
                  icon="heroicons:ellipsis-horizontal"
                  custom-class="w-5 h-5" />
              </button>
            </template>
            <template #default="{ close }">
              <div class="px-2 py-1.5 border-b border-slate-100 bg-slate-50/50">
                <span
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >Account Control</span
                >
              </div>
              <div class="p-1">
                <button
                  @click="
                    close();
                    openBillingEditor(user);
                  "
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all text-left">
                  <UiIcon
                    icon="heroicons:calendar-days"
                    custom-class="w-4 h-4" />
                  Edit Billing Date
                </button>
                <button
                  @click="
                    close();
                    toggleUserStatus(user);
                  "
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all text-left mt-0.5">
                  <UiIcon
                    :icon="
                      user.isActive
                        ? 'heroicons:no-symbol'
                        : 'heroicons:check-circle'
                    "
                    custom-class="w-4 h-4" />
                  {{ user.isActive ? "Suspend User" : "Activate User" }}
                </button>
                <button
                  v-if="user.plan !== 'FREE'"
                  @click="
                    close();
                    confirmCancelSubscription(user);
                  "
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all text-left mt-0.5">
                  <UiIcon icon="heroicons:x-circle" custom-class="w-4 h-4" />
                  Cancel Subscription
                </button>
                <div class="h-px bg-slate-100 my-1 mx-2"></div>
                <button
                  @click="
                    close();
                    confirmDeleteUser(user);
                  "
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-all text-left">
                  <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </template>
          </UiPopover>
        </td>
      </tr>
    </UiTable>

    <!-- Billing Editor Modal -->
    <UiModal
      v-model="editBillingModal.isOpen"
      title="Edit Billing Date"
      description="Upgrade or extend this user's subscription access by selecting a new expiration date below."
      maxWidth="md">
      <div class="p-6">
        <div class="space-y-4">
          <div>
            <label
              class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5"
              >User Profile</label
            >
            <p class="text-sm font-semibold text-slate-900">
              {{ editBillingModal.user?.name || "Unnamed" }} ({{
                editBillingModal.user?.email
              }})
            </p>
          </div>
          <div>
            <label
              class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5"
              >New Expiration Date</label
            >
            <input
              type="date"
              v-model="editBillingModal.newDate"
              class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
            <p class="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Setting a future date instantly upgrades and grants the user
              uninterrupted access to their plan until exactly that day.
            </p>
          </div>
        </div>
        <div class="mt-8 flex justify-end gap-3">
          <button
            @click="editBillingModal.isOpen = false"
            class="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            @click="saveBillingDate"
            :disabled="savingBilling"
            class="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50">
            <UiIcon
              v-if="savingBilling"
              icon="line-md:loading-twotone-loop"
              class="w-4 h-4 animate-spin" />
            Save & Extend
          </button>
        </div>
      </div>
    </UiModal>

    <!-- Status Modals/Toasts -->
    <UiToast v-model="toast" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useAdminStore } from "~/stores/adminStore";
import { useUiStore } from "~/stores/uiStore";

definePageMeta({
  layout: "default",
  middleware: "admin",
});

const adminStore = useAdminStore();
const uiStore = useUiStore();
const toast = ref({ message: "", type: "success" });
const searchQuery = ref("");

const filteredUsers = computed(() => {
  if (!searchQuery.value) return adminStore.users;
  const q = searchQuery.value.toLowerCase();
  return adminStore.users.filter(
    (u) =>
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
  );
});

const editBillingModal = ref({
  isOpen: false,
  user: null,
  newDate: "",
});
const savingBilling = ref(false);

const openBillingEditor = (user) => {
  editBillingModal.value.user = user;
  const currentEnd = user.subscriptions?.[0]?.subscriptionEnds;
  editBillingModal.value.newDate = currentEnd
    ? new Date(
        new Date(currentEnd).getTime() +
          Math.abs(new Date(currentEnd).getTimezoneOffset() * 60000),
      )
        .toISOString()
        .split("T")[0]
    : "";
  editBillingModal.value.isOpen = true;
};

const saveBillingDate = async () => {
  savingBilling.value = true;
  const success = await adminStore.updateUser(editBillingModal.value.user.id, {
    subscriptionEnds: editBillingModal.value.newDate || null,
  });
  if (success) {
    toast.value = {
      message: "Billing date successfully extended!",
      type: "success",
    };
    editBillingModal.value.isOpen = false;
    await adminStore.fetchUsers(); // Refresh to catch fresh subs array
  } else {
    toast.value = { message: "Failed to update billing date", type: "error" };
  }
  savingBilling.value = false;
};

onMounted(() => {
  adminStore.fetchUsers();
  adminStore.stats ? null : adminStore.fetchStats();
});

const toggleUserStatus = async (user) => {
  const success = await adminStore.updateUser(user.id, {
    isActive: !user.isActive,
  });
  if (success) {
    toast.value = {
      message: `User ${user.isActive ? "deactivated" : "activated"} successfully`,
      type: "success",
    };
  }
};

const confirmCancelSubscription = async (user) => {
  if (
    confirm(
      `Are you sure you want to cancel the subscription for ${user.email}? This will immediately downgrade them to the FREE plan.`,
    )
  ) {
    const success = await adminStore.cancelSubscription(user.id);
    if (success) {
      toast.value = {
        message: "Subscription successfully cancelled!",
        type: "success",
      };
    } else {
      toast.value = {
        message: adminStore.error || "Failed to cancel subscription",
        type: "error",
      };
    }
  }
};

const confirmDeleteUser = async (user) => {
  if (
    confirm(
      `Are you sure you want to delete ${user.email}? All associated data will be lost forever.`,
    )
  ) {
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
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
