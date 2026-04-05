<script setup>
import { onMounted, ref, computed } from "vue";
import { useAdminStore } from "~/stores/adminStore";
import { usePromoStore } from "~/stores/promoStore";
import { useSystemStore } from "~/stores/systemStore";

definePageMeta({
  layout: "default",
  middleware: "admin",
});

const adminStore = useAdminStore();
const promoStore = usePromoStore();
const systemStore = useSystemStore();

const activeTab = ref("general");
const toast = ref({ message: "", type: "success" });

// --- GENERAL SETTINGS LOGIC ---
const localConfig = ref({ ...systemStore.config });
const isSavingConfig = ref(false);

const saveConfig = async () => {
  isSavingConfig.value = true;
  const success = await systemStore.updateSystemConfig(localConfig.value);
  if (success) {
    toast.value = { message: "System configuration updated!", type: "success" };
  } else {
    toast.value = {
      message: systemStore.error || "Failed to update config",
      type: "error",
    };
  }
  isSavingConfig.value = false;
};

// --- USERS MANAGEMENT LOGIC ---
const userSearchQuery = ref("");
const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return adminStore.users;
  const q = userSearchQuery.value.toLowerCase();
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
    await adminStore.fetchUsers();
  } else {
    toast.value = { message: "Failed to update billing date", type: "error" };
  }
  savingBilling.value = false;
};

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

const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

// --- PLAN MANAGEMENT LOGIC ---
const isPlanModalOpen = ref(false);
const selectedPlan = ref(null);
const isPlanEdit = ref(false);
const planForm = ref({
  name: "",
  description: "",
  price: 0,
  currency: "MYR",
  interval: "month",
  waSends: 0,
  emailSends: 0,
  aiCredits: 0,
  waReminders: 0,
  emailReminders: 0,
  invoices: 0,
  features: [],
  isPublic: true,
});

const openCreatePlanModal = () => {
  selectedPlan.value = null;
  isPlanEdit.value = false;
  planForm.value = {
    name: "",
    description: "",
    price: 0,
    currency: "MYR",
    interval: "month",
    waSends: 0,
    emailSends: 0,
    aiCredits: 0,
    waReminders: 0,
    emailReminders: 0,
    invoices: 0,
    features: [],
    isPublic: true,
  };
  isPlanModalOpen.value = true;
};

const openEditPlanModal = (plan) => {
  selectedPlan.value = { ...plan };
  isPlanEdit.value = true;
  planForm.value = {
    ...plan,
    features: Array.isArray(plan.features) ? [...plan.features] : [],
  };
  isPlanModalOpen.value = true;
};

const handleSavePlan = async () => {
  const payload = { ...planForm.value };
  let success = false;
  if (selectedPlan.value) {
    success = await adminStore.updatePlan(selectedPlan.value.id, payload);
  } else {
    success = await adminStore.createPlan(payload);
  }

  if (success) {
    isPlanModalOpen.value = false;
    toast.value = {
      message: "Plan details updated successfully!",
      type: "success",
    };
    adminStore.fetchPlans();
  }
};

const confirmDeletePlan = async (plan) => {
  if (confirm(`Are you sure you want to delete the ${plan.name} plan?`)) {
    const success = await adminStore.deletePlan(plan.id);
    if (success) {
      toast.value = {
        message: "The plan has been removed successfully.",
        type: "success",
      };
    }
  }
};

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
  const result = [];
  for (let y = currentYear; y >= 2024; y--) result.push(y);
  return result;
});

const updateMonthlyRevenueData = async () => {
  loadingMonthly.value = true;
  try {
    const data = await adminStore.fetchMonthlyRevenue(
      selectedMonth.value,
      selectedYear.value,
    );
    if (data) monthlyRevenueValue.value = data.revenue;
  } finally {
    loadingMonthly.value = false;
  }
};

// --- TRANSACTIONS LOGIC ---
const txSearchQuery = ref("");
const statusColors = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
  INACTIVE: "bg-slate-50 text-slate-600 border-slate-100",
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
  FAILED: "bg-red-50 text-red-700 border-red-100",
};

const filteredTransactions = computed(() => {
  if (!txSearchQuery.value) return adminStore.transactions;
  const q = txSearchQuery.value.toLowerCase();
  return adminStore.transactions.filter(
    (tx) =>
      tx.user?.name?.toLowerCase().includes(q) ||
      tx.user?.email?.toLowerCase().includes(q) ||
      tx.plan?.toLowerCase().includes(q) ||
      tx.status?.toLowerCase().includes(q),
  );
});

// --- PROMO CODES LOGIC ---
const showCreatePromoModal = ref(false);
const showEditPromoModal = ref(false);
const newPromo = ref({
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  maxUses: null,
  expiresAt: null,
});
const editPromo = ref({
  id: null,
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  maxUses: null,
  expiresAt: null,
});
const discountOptions = [
  { value: "PERCENTAGE", label: "Percentage (%)" },
  { value: "FIXED", label: "Fixed (MYR)" },
];

const handleCreatePromo = async () => {
  try {
    await promoStore.createPromoCode(newPromo.value);
    toast.value = {
      message: "Promo code created successfully!",
      type: "success",
    };
    showCreatePromoModal.value = false;
    newPromo.value = {
      code: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      maxUses: null,
      expiresAt: null,
    };
  } catch (err) {
    toast.value = {
      message: err.message || "Failed to create promo code",
      type: "error",
    };
  }
};

const openEditPromoModal = (promo) => {
  editPromo.value = { ...promo };
  showEditPromoModal.value = true;
};

const handleUpdatePromo = async () => {
  try {
    await promoStore.updatePromoCode(editPromo.value.id, editPromo.value);
    toast.value = {
      message: "Promo code updated successfully!",
      type: "success",
    };
    showEditPromoModal.value = false;
  } catch (err) {
    toast.value = {
      message: err.message || "Failed to update promo code",
      type: "error",
    };
  }
};

const confirmDeletePromo = async (id) => {
  if (confirm("Are you sure you want to delete this promo code?")) {
    try {
      await promoStore.deletePromoCode(id);
      toast.value = {
        message: "Promo code deleted successfully!",
        type: "success",
      };
    } catch (err) {
      toast.value = {
        message: err.message || "Failed to delete promo code",
        type: "error",
      };
    }
  }
};

const promoSearchQuery = ref("");
const filteredPromoCodes = computed(() => {
  if (!promoSearchQuery.value) return promoStore.promoCodes;
  const q = promoSearchQuery.value.toLowerCase();
  return promoStore.promoCodes.filter(
    (p) =>
      p.code?.toLowerCase().includes(q) ||
      p.discountType?.toLowerCase().includes(q),
  );
});

onMounted(async () => {
  await Promise.all([
    systemStore.fetchSystemConfig(),
    adminStore.fetchUsers(),
    adminStore.fetchAnalytics(),
    adminStore.fetchPlans(),
    adminStore.fetchTransactions(),
    promoStore.fetchAllPromoCodes(),
  ]);
  localConfig.value = { ...systemStore.config };
  updateMonthlyRevenueData();
});
</script>

<template>
  <div class="system-management-page max-w-[1400px]">
    <!-- Page Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
        System Management
      </h2>
      <p class="text-xs font-medium text-slate-500 mt-1">
        Configure global feature availability, broadcast messages, and manage
        commercial operations.
      </p>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-8">
      <button
        v-for="tab in [
          { id: 'general', label: 'General', icon: 'heroicons:cog-6-tooth' },
          { id: 'users', label: 'Users', icon: 'heroicons:users' },
          {
            id: 'plans',
            label: 'Plans & Analytics',
            icon: 'heroicons:sparkles',
          },
          {
            id: 'transactions',
            label: 'Transactions',
            icon: 'heroicons:credit-card',
          },
          { id: 'promo', label: 'Promo Codes', icon: 'heroicons:ticket' },
        ]"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-lg',
          activeTab === tab.id
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700',
        ]">
        <UiIcon :icon="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- TAB CONTENT: GENERAL -->
    <div
      v-if="activeTab === 'general'"
      class="space-y-8 animate-in fade-in duration-500">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Feature Toggles -->
        <div class="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <UiIcon icon="heroicons:bolt" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">
                Global Feature Availability
              </h3>
              <p class="text-xs font-medium text-slate-500">
                Enable or disable core system modules instantly.
              </p>
            </div>
          </div>

          <div class="space-y-6">
            <div
              v-for="feature in [
                {
                  key: 'invoiceCreationEnabled',
                  label: 'Invoice Creation',
                  desc: 'Allow users to generate new invoices.',
                },
                {
                  key: 'whatsappEnabled',
                  label: 'WhatsApp Reminders',
                  desc: 'Allow system or user WhatsApp delivery.',
                },
                {
                  key: 'emailEnabled',
                  label: 'Email Delivery',
                  desc: 'Allow invoice and reminder emails.',
                },
                {
                  key: 'paymentsEnabled',
                  label: 'Online Payments',
                  desc: 'Enable Xendit/ToyyibPay/Billplz gateways.',
                },
              ]"
              :key="feature.key"
              class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p class="text-sm font-bold text-slate-900">
                  {{ feature.label }}
                </p>
                <p class="text-xs font-medium text-slate-500">
                  {{ feature.desc }}
                </p>
              </div>
              <button
                @click="localConfig[feature.key] = !localConfig[feature.key]"
                :class="[
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2',
                  localConfig[feature.key] ? 'bg-slate-900' : 'bg-slate-200',
                ]">
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    localConfig[feature.key]
                      ? 'translate-x-5'
                      : 'translate-x-0',
                  ]" />
              </button>
            </div>
          </div>
        </div>

        <!-- Global Notice -->
        <div
          class="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
              <UiIcon icon="heroicons:megaphone" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">
                System Broadcast Notice
              </h3>
              <p class="text-xs font-medium text-slate-500">
                displayed prominently on every user's dashboard.
              </p>
            </div>
          </div>

          <div class="flex-1 space-y-4">
            <textarea
              v-model="localConfig.globalNotice"
              placeholder="Enter a message to tell users what's happening (e.g. system maintenance details)..."
              class="w-full h-40 p-4 text-sm font-medium border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-950 outline-none transition-all resize-none bg-slate-50"></textarea>

            <div
              class="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
              <p
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Live Preview
              </p>
              <div
                v-if="localConfig.globalNotice"
                class="bg-amber-50 border border-amber-100 p-4 rounded-lg flex items-start gap-3">
                <UiIcon
                  icon="heroicons:information-circle"
                  class="w-5 h-5 text-amber-600 shrink-0" />
                <p class="text-xs font-bold text-amber-900 leading-relaxed">
                  {{ localConfig.globalNotice }}
                </p>
              </div>
              <p
                v-else
                class="text-xs font-medium text-slate-400 italic text-center py-4">
                No message set. Banner will be hidden.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div
        class="flex justify-end p-6 bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10">
        <button
          @click="saveConfig"
          :disabled="isSavingConfig"
          class="flex items-center gap-2 px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-all disabled:opacity-50">
          <UiIcon
            v-if="isSavingConfig"
            icon="line-md:loading-twotone-loop"
            class="w-4 h-4 animate-spin" />
          {{ isSavingConfig ? "Saving..." : "Deploy System Changes" }}
        </button>
      </div>
    </div>

    <!-- TAB CONTENT: USERS -->
    <div v-if="activeTab === 'users'" class="animate-in fade-in duration-500">
      <div
        class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div class="px-6 pt-6 flex items-center justify-between">
          <div>
            <p class="text-lg font-bold text-slate-900">User Accounts</p>
            <p class="text-[12px] font-medium text-slate-500">
              Manage system access, subscription tiers, and operational status.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div class="relative w-64">
              <UiIcon
                icon="heroicons:magnifying-glass"
                class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="userSearchQuery"
                type="text"
                placeholder="Search users..."
                class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-slate-950 px-3 font-medium text-slate-600" />
            </div>
            <button
              @click="adminStore.fetchUsers()"
              class="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
              title="Refresh Users">
              <UiIcon icon="heroicons:arrow-path" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <UiTable
          :loading="adminStore.loading"
          :is-empty="filteredUsers.length === 0"
          :column-count="7">
          <template #header>
            <th
              class="py-4 pl-6 pr-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              User
            </th>
            <th
              class="px-3 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Plan
            </th>
            <th
              class="px-3 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Role
            </th>
            <th
              class="px-3 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Stats
            </th>
            <th
              class="px-3 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Status
            </th>
            <th
              class="px-3 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Joined
            </th>
            <th
              class="px-3 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Actions
            </th>
          </template>

          <tr
            v-for="user in filteredUsers"
            :key="user.id"
            class="hover:bg-slate-50 transition-colors group">
            <td class="whitespace-nowrap py-4 pl-6 pr-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm shrink-0 uppercase">
                  {{ getInitials(user.name) }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-bold text-slate-900 truncate">
                    {{ user.name }}
                  </p>
                  <p class="text-xs font-medium text-slate-500 truncate">
                    {{ user.email }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <div class="flex flex-col">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border w-fit',
                    user.plan === 'FREE'
                      ? 'bg-slate-50 text-slate-600 border-slate-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  ]">
                  {{ user.plan }}
                </span>
                <p
                  v-if="
                    user.subscriptions?.[0]?.status === 'ACTIVE' &&
                    user.subscriptions?.[0]?.subscriptionEnds
                  "
                  class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Renews:
                  {{
                    new Date(
                      user.subscriptions[0].subscriptionEnds,
                    ).toLocaleDateString()
                  }}
                </p>
              </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border w-fit',
                  user.role === 'ADMIN'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    : 'bg-slate-50 text-slate-500 border-slate-100',
                ]">
                {{ user.role }}
              </span>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="flex flex-col">
                  <span
                    class="text-xs font-bold text-slate-900 leading-tight"
                    >{{ user._count?.invoices || 0 }}</span
                  >
                  <span class="text-[9px] font-bold text-slate-400 uppercase"
                    >Invoices</span
                  >
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-xs font-bold text-slate-900 leading-tight"
                    >{{ user._count?.clients || 0 }}</span
                  >
                  <span class="text-[9px] font-bold text-slate-400 uppercase"
                    >Clients</span
                  >
                </div>
              </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border',
                  user.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-100',
                ]">
                {{ user.isActive ? "Active" : "Suspended" }}
              </span>
            </td>
            <td
              class="px-3 py-4 whitespace-nowrap text-xs font-bold text-slate-500">
              {{ new Date(user.createdAt).toLocaleDateString() }}
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-right">
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
                  <div class="p-1 min-w-[160px]">
                    <button
                      @click="
                        close();
                        openBillingEditor(user);
                      "
                      class="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all text-left">
                      <UiIcon
                        icon="heroicons:calendar-days"
                        custom-class="w-4 h-4" />
                      Edit Subscription
                    </button>
                    <button
                      @click="
                        close();
                        toggleUserStatus(user);
                      "
                      class="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all text-left mt-0.5">
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
                      class="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all text-left mt-0.5">
                      <UiIcon
                        icon="heroicons:x-circle"
                        custom-class="w-4 h-4" />
                      Cancel Subscription
                    </button>
                    <div class="h-px bg-slate-100 my-1 mx-2"></div>
                    <button
                      @click="
                        close();
                        confirmDeleteUser(user);
                      "
                      class="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-md transition-all text-left">
                      <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </template>
              </UiPopover>
            </td>
          </tr>
        </UiTable>
      </div>
    </div>

    <!-- TAB CONTENT: PLANS & ANALYTICS -->
    <div
      v-if="activeTab === 'plans'"
      class="animate-in fade-in duration-500 space-y-8">
      <!-- Analytics Summary Cards -->
      <div
        v-if="adminStore.analytics?.summary"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div
          class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div class="flex items-center justify-between mb-4">
            <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <UiIcon icon="heroicons:banknotes" class="w-5 h-5" />
            </div>
            <div
              class="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase">
              Lifetime
            </div>
          </div>
          <dt
            class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Revenue
          </dt>
          <dd class="text-2xl font-bold text-slate-900 tracking-tight">
            MYR
            {{ adminStore.analytics.summary.revenue.lifetime.toLocaleString() }}
          </dd>
        </div>

        <div
          class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div class="flex items-center justify-between mb-4">
            <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
              <UiIcon icon="heroicons:users" class="w-5 h-5" />
            </div>
            <div
              :class="[
                'px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1',
                adminStore.analytics.summary.users.growth >= 0
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-rose-600 bg-rose-50',
              ]">
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
            class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Users
          </dt>
          <dd class="text-2xl font-bold text-slate-900 tracking-tight">
            {{ adminStore.analytics.summary.users.total.toLocaleString() }}
          </dd>
        </div>

        <div
          class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div class="flex items-center justify-between mb-4">
            <div class="p-2 bg-purple-50 rounded-lg text-purple-600">
              <UiIcon icon="heroicons:calendar-days" class="w-5 h-5" />
            </div>
            <div class="flex items-center gap-1">
              <select
                v-model="selectedMonth"
                @change="updateMonthlyRevenueData"
                class="bg-slate-50 border-none text-[9px] font-bold text-slate-600 rounded p-1 focus:ring-0 cursor-pointer">
                <option v-for="(m, i) in months" :key="i" :value="i + 1">
                  {{ m }}
                </option>
              </select>
              <select
                v-model="selectedYear"
                @change="updateMonthlyRevenueData"
                class="bg-slate-50 border-none text-[9px] font-bold text-slate-600 rounded p-1 focus:ring-0 cursor-pointer">
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>
          <dt
            class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Monthly Revenue
          </dt>
          <dd
            class="text-2xl font-bold text-slate-900 tracking-tight"
            :class="{ 'opacity-40 animate-pulse': loadingMonthly }">
            MYR {{ monthlyRevenueValue.toLocaleString() }}
          </dd>
        </div>

        <div
          class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div class="flex items-center justify-between mb-4">
            <div class="p-2 bg-amber-50 rounded-lg text-amber-600">
              <UiIcon icon="heroicons:credit-card" class="w-5 h-5" />
            </div>
            <div
              class="text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
              Activity
            </div>
          </div>
          <dt
            class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Transactions
          </dt>
          <dd class="text-2xl font-bold text-slate-900 tracking-tight">
            {{
              adminStore.analytics.summary.totalTransactions.toLocaleString()
            }}
          </dd>
        </div>

        <div
          class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div class="flex items-center justify-between mb-2">
            <div class="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <UiIcon icon="heroicons:chart-pie" class="w-5 h-5" />
            </div>
            <div
              class="text-indigo-600 px-2 py-1 rounded text-[9px] font-semibold uppercase tracking-widest">
              Mix
            </div>
          </div>
          <dt
            class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Plan distribution
          </dt>
          <dd class="flex flex-wrap gap-1">
            <div
              v-for="d in adminStore.analytics?.web?.planDistribution"
              :key="d.plan"
              class="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
              <span class="text-slate-400">{{ d.plan }}:</span>
              <span class="text-slate-900 font-semibold">{{ d.count }}</span>
            </div>
          </dd>
        </div>
      </div>

      <!-- Plan Management Table -->
      <div
        class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div
          class="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900">
              Subscription Plans Control
            </h3>
            <p class="text-[11px] font-medium text-slate-500">
              Manage platform-wide subscription tiers. Define technical throughput limits, 
              AI processing credits, and market visibility for each tier.
            </p>
          </div>
          <button
            @click="openCreatePlanModal"
            class="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95">
            <UiIcon icon="heroicons:plus" class="w-4 h-4" />
            Create New Plan
          </button>
        </div>

        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-50">
              <th
                class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Plan Name
              </th>
              <th
                class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Price
              </th>
              <th
                class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Limits (Inv/AI)
              </th>
              <th
                class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Status
              </th>
              <th
                class="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="plan in adminStore.plans"
              :key="plan.id"
              class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span
                    class="text-sm font-semibold text-slate-900 uppercase tracking-tight"
                    >{{ plan.name }}</span
                  >
                  <span
                    class="text-[10px] text-slate-500 font-medium truncate max-w-[200px]"
                    >{{ plan.description }}</span
                  >
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-baseline gap-1">
                  <span class="text-sm font-bold text-slate-900">{{
                    plan.price
                  }}</span>
                  <span class="text-[9px] font-bold text-slate-400 uppercase"
                    >{{ plan.currency }}/{{ plan.interval }}</span
                  >
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                    >{{
                      plan.invoices >= 999999 ? "∞" : plan.invoices
                    }}
                    Inv</span
                  >
                  <span
                    class="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                    >{{
                      plan.aiCredits >= 999999 ? "∞" : plan.aiCredits
                    }}
                    AI</span
                  >
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest w-fit border',
                    plan.isPublic
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200',
                  ]">
                  {{ plan.isPublic ? "Public" : "Hidden" }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditPlanModal(plan)"
                    class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <UiIcon icon="heroicons:pencil-square" class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDeletePlan(plan)"
                    :disabled="
                      ['FREE', 'PRO', 'MAX', 'STARTER PACK'].includes(
                        plan.name.toUpperCase(),
                      )
                    "
                    class="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-0 underline-none border-none bg-transparent cursor-pointer">
                    <UiIcon icon="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB CONTENT: TRANSACTIONS -->
    <div
      v-if="activeTab === 'transactions'"
      class="animate-in fade-in duration-500">
      <div
        class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div class="px-6 pt-6 flex items-center justify-between">
          <div>
            <p class="text-lg font-bold text-slate-900">Transaction History</p>
            <p class="text-[12px] font-medium text-slate-500">
              Complete record of financial activity and payments.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div class="relative w-64">
              <UiIcon
                icon="heroicons:magnifying-glass"
                class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="txSearchQuery"
                type="text"
                placeholder="Search transactions..."
                class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-slate-950 font-medium text-slate-600" />
            </div>
            <button
              @click="adminStore.fetchTransactions()"
              class="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
              <UiIcon icon="heroicons:arrow-path" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <UiTable
          :loading="adminStore.loading"
          :is-empty="filteredTransactions.length === 0"
          :column-count="5">
          <template #header>
            <th
              class="py-4 pl-6 pr-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              User Details
            </th>
            <th
              class="px-3 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Plan Details
            </th>
            <th
              class="px-3 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Amount
            </th>
            <th
              class="px-3 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Status
            </th>
            <th
              class="px-3 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Date
            </th>
          </template>

          <tr
            v-for="tx in filteredTransactions"
            :key="tx.id"
            class="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
            <td class="whitespace-nowrap py-4 pl-6 pr-3">
              <div class="flex flex-col">
                <p class="text-sm font-bold text-slate-900 truncate">
                  {{ tx.user?.name || "Unnamed" }}
                </p>
                <p class="text-[11px] font-medium text-slate-500 truncate">
                  {{ tx.user?.email }}
                </p>
              </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <div class="flex flex-col">
                <span class="text-sm font-bold text-slate-900">{{
                  tx.plan
                }}</span>
                <span
                  v-if="tx.xenditSubscriptionId"
                  class="text-[9px] font-bold text-slate-400 tracking-widest"
                  >ID: {{ tx.xenditSubscriptionId.split("_").pop() }}</span
                >
              </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <span class="text-sm font-semibold text-slate-900"
                >{{ tx.currency }} {{ tx.amount.toLocaleString() }}</span
              >
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border',
                  tx.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-100',
                ]">
                {{ tx.status }}
              </span>
            </td>
            <td
              class="px-3 py-4 whitespace-nowrap text-xs font-bold text-slate-500">
              {{ new Date(tx.createdAt).toLocaleDateString() }}
            </td>
          </tr>
        </UiTable>
      </div>
    </div>

    <!-- TAB CONTENT: PROMO CODES -->
    <div v-if="activeTab === 'promo'" class="animate-in fade-in duration-500">
      <div
        class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div class="px-6 pt-6 flex items-center justify-between">
          <div>
            <p class="text-lg font-bold text-slate-900">Promotion Campaigns</p>
            <p class="text-[12px] font-medium text-slate-500">
              Create and manage discount codes for special offers.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div class="relative w-64">
              <UiIcon
                icon="heroicons:magnifying-glass"
                class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="promoSearchQuery"
                type="text"
                placeholder="Search codes..."
                class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-slate-950 font-medium text-slate-600" />
            </div>
            <button
              @click="showCreatePromoModal = true"
              class="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shrink-0">
              <UiIcon icon="heroicons:plus" class="w-4 h-4" />
              New Code
            </button>
            <button
              @click="promoStore.fetchAllPromoCodes()"
              class="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
              title="Refresh Promo Codes">
              <UiIcon icon="heroicons:arrow-path" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <UiTable
          :loading="false"
          :is-empty="filteredPromoCodes.length === 0"
          :column-count="6">
          <template #header>
            <th
              class="py-4 pl-6 pr-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Badge & Code
            </th>
            <th
              class="px-3 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Marketing Benefit
            </th>
            <th
              class="px-3 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Active Status
            </th>
            <th
              class="px-3 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Usage Quota
            </th>
            <th
              class="px-3 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Expiry
            </th>
            <th
              class="px-3 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6">
              Actions
            </th>
          </template>

          <tr
            v-for="promo in filteredPromoCodes"
            :key="promo.id"
            class="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
            <td class="whitespace-nowrap py-4 pl-6 pr-3">
              <span
                class="px-2 py-1 bg-slate-100 rounded font-mono text-[11px] font-bold text-slate-900 tracking-tight uppercase border border-slate-200 shadow-sm"
                >{{ promo.code }}</span
              >
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <div class="flex items-center gap-1.5">
                <UiIcon
                  icon="heroicons:gift"
                  class="w-3.5 h-3.5 text-indigo-500" />
                <span class="text-sm font-bold text-slate-700">
                  {{
                    promo.discountType === "PERCENTAGE"
                      ? promo.discountValue + "%"
                      : promo.discountValue + " MYR"
                  }}
                  Off
                </span>
              </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <button
                @click="promoStore.togglePromoStatus(promo.id)"
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-all active:scale-95',
                  promo.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-100',
                ]">
                {{ promo.isActive ? "Active" : "Inactive" }}
              </button>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-900 leading-none">{{
                  promo.uses
                }}</span>
                <span class="text-[9px] font-bold text-slate-400 uppercase">{{
                  promo.maxUses ? "limit: " + promo.maxUses : "Unlimited"
                }}</span>
              </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <span class="text-xs font-bold text-slate-500">
                {{
                  promo.expiresAt
                    ? new Date(promo.expiresAt).toLocaleDateString()
                    : "Lifetime"
                }}
              </span>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-right px-6 space-x-1">
              <button
                @click="openEditPromoModal(promo)"
                class="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100 group-hover:bg-slate-100">
                <UiIcon icon="heroicons:pencil-square" class="w-4 h-4" />
              </button>
              <button
                @click="confirmDeletePromo(promo.id)"
                class="p-2 text-rose-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 group-hover:bg-rose-50">
                <UiIcon icon="heroicons:trash" class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </UiTable>
      </div>
    </div>

    <!-- Modals -->
    <UiModal
      v-model="showCreatePromoModal"
      title="Issue New Promo Code"
      description="Launch a new discount campaign by configuring the parameters below."
      max-width="lg">
      <form @submit.prevent="handleCreatePromo" class="p-8 space-y-6">
        <div>
          <label
            class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
            >Redemption Code</label
          >
          <input
            v-model="newPromo.code"
            type="text"
            required
            placeholder="e.g. SPECIAL50"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none uppercase font-bold" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <UiSelect
            v-model="newPromo.discountType"
            label="Discount Type"
            :options="discountOptions" />
          <div>
            <label
              class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
              >Value</label
            >
            <input
              v-model="newPromo.discountValue"
              type="number"
              required
              class="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
              >Max Redemptions</label
            >
            <input
              v-model="newPromo.maxUses"
              type="number"
              placeholder="Unlimited"
              class="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none" />
          </div>
          <UiDatePicker v-model="newPromo.expiresAt" label="Expiration Date" />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="showCreatePromoModal = false"
            class="px-6 py-2.5 text-sm font-bold text-slate-600">
            Cancel
          </button>
          <button
            type="submit"
            class="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all">
            Create Promotion
          </button>
        </div>
      </form>
    </UiModal>

    <UiModal
      v-model="showEditPromoModal"
      title="Modify Promo Campaign"
      description="Adjust the configuration for this promotional code."
      max-width="lg">
      <form @submit.prevent="handleUpdatePromo" class="p-8 space-y-6">
        <div>
          <label
            class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
            >Redemption Code</label
          >
          <input
            v-model="editPromo.code"
            type="text"
            required
            class="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none uppercase font-bold bg-slate-50" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <UiSelect
            v-model="editPromo.discountType"
            label="Discount Type"
            :options="discountOptions" />
          <div>
            <label
              class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
              >Value</label
            >
            <input
              v-model="editPromo.discountValue"
              type="number"
              required
              class="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
              >Max Redemptions</label
            >
            <input
              v-model="editPromo.maxUses"
              type="number"
              class="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none" />
          </div>
          <UiDatePicker v-model="editPromo.expiresAt" label="Expiration Date" />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="showEditPromoModal = false"
            class="px-6 py-2.5 text-sm font-bold text-slate-600">
            Cancel
          </button>
          <button
            type="submit"
            class="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold active:scale-95 transition-all">
            Update Promotion
          </button>
        </div>
      </form>
    </UiModal>

    <!-- MODALS: USERS -->
    <UiModal
      v-model="editBillingModal.isOpen"
      title="Extend/Modify User Subscription"
      description="Update the subscription manually for this user by extending their expiration date."
      maxWidth="md">
      <div class="p-6 space-y-6">
        <div>
          <label
            class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2"
            >Target User</label
          >
          <div
            class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold uppercase">
              {{ getInitials(editBillingModal.user?.name) }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold text-slate-900 truncate">
                {{ editBillingModal.user?.name }}
              </p>
              <p class="text-xs font-medium text-slate-500 truncate">
                {{ editBillingModal.user?.email }}
              </p>
            </div>
          </div>
        </div>
        <div>
          <label
            class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2"
            >New Expiration Date</label
          >
          <input
            type="date"
            v-model="editBillingModal.newDate"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-slate-900 outline-none" />
          <p
            class="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed italic">
            The user will retain their current plan until this date. Set to
            empty for lifetime or until manual intervention.
          </p>
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button
            @click="editBillingModal.isOpen = false"
            class="px-6 py-2.5 text-sm font-bold text-slate-600 cursor-pointer hover:bg-slate-50 rounded-xl transition-all">
            Cancel
          </button>
          <button
            @click="saveBillingDate"
            :disabled="savingBilling"
            class="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer hover:bg-slate-800 transition-all">
            <UiIcon
              v-if="savingBilling"
              icon="line-md:loading-twotone-loop"
              class="w-4 h-4 animate-spin" />
            Apply Subscription Change
          </button>
        </div>
      </div>
    </UiModal>

    <!-- MODALS: PLANS -->
    <UiModal
      v-model="isPlanModalOpen"
      title="Manage Subscription Tier"
      description="Define the technical limits and marketing details for this subscription plan."
      max-width="2xl">
      <form
        @submit.prevent="handleSavePlan"
        class="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-6">
            <div class="space-y-4">
              <h4
                class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                Technical Limits
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-[10px] font-bold text-slate-700 uppercase mb-1"
                    >Total Invoices</label
                  >
                  <input
                    v-model.number="planForm.invoices"
                    type="number"
                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" />
                </div>
                <div>
                  <label
                    class="block text-[10px] font-bold text-slate-700 uppercase mb-1"
                    >AI Credits</label
                  >
                  <input
                    v-model.number="planForm.aiCredits"
                    type="number"
                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-[10px] font-bold text-slate-700 uppercase mb-1"
                    >WA Sends</label
                  >
                  <input
                    v-model.number="planForm.waSends"
                    type="number"
                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" />
                </div>
                <div>
                  <label
                    class="block text-[10px] font-bold text-slate-700 uppercase mb-1"
                    >Email Sends</label
                  >
                  <input
                    v-model.number="planForm.emailSends"
                    type="number"
                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-[10px] font-bold text-slate-700 uppercase mb-1"
                    >WA Reminders</label
                  >
                  <input
                    v-model.number="planForm.waReminders"
                    type="number"
                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" />
                </div>
                <div>
                  <label
                    class="block text-[10px] font-bold text-slate-700 uppercase mb-1"
                    >Email Reminders</label
                  >
                  <input
                    v-model.number="planForm.emailReminders"
                    type="number"
                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" />
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h4 class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Feature Entitlements</h4>
              <div class="grid grid-cols-2 gap-3">
                <label v-for="feature in ['AI Helper Access', 'WhatsApp System', 'Email System', 'Priority Support', 'Custom Domain', 'Advanced Analytics']" :key="feature" class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" :value="feature" v-model="planForm.features" class="w-3.5 h-3.5 rounded text-slate-900 border-slate-300" />
                  <span class="text-[10px] font-bold text-slate-600 uppercase">{{ feature }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="space-y-4">
              <h4
                class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                Core Identity
              </h4>
              <div>
                <label
                  class="block text-[10px] font-bold text-slate-700 uppercase mb-1"
                  >Plan Name</label
                >
                <input
                  v-model="planForm.name"
                  type="text"
                  class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold uppercase"
                  required />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-[10px] font-bold text-slate-700 uppercase mb-1"
                    >Price</label
                  >
                  <input
                    v-model.number="planForm.price"
                    type="number"
                    step="0.01"
                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-emerald-600"
                    required />
                </div>
                <div>
                  <label
                    class="block text-[10px] font-bold text-slate-700 uppercase mb-1"
                    >Interval</label
                  >
                  <select
                    v-model="planForm.interval"
                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none">
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h4
                class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                Marketing & Narrative
              </h4>
              <div>
                <label
                  class="block text-[10px] font-bold text-slate-700 uppercase mb-1"
                  >Marketing Description</label
                >
                <textarea
                  v-model="planForm.description"
                  rows="4"
                  class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none resize-none"
                  placeholder="Enter plan details for public display..."></textarea>
              </div>
              <div class="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  v-model="planForm.isPublic"
                  id="isPublic"
                  class="w-4 h-4 rounded text-slate-900 border-slate-300" />
                <label
                  for="isPublic"
                  class="text-xs font-bold text-slate-700 uppercase tracking-wide"
                  >Visible to Public Users</label
                >
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            @click="isPlanModalOpen = false"
            class="px-6 py-2.5 text-sm font-bold text-slate-600 cursor-pointer">
            Cancel
          </button>
          <button
            type="submit"
            class="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all cursor-pointer hover:bg-slate-800">
            Save Changes
          </button>
        </div>
      </form>
    </UiModal>

    <UiToast v-model="toast" />
  </div>
</template>

<style scoped>
.animate-in {
  animation-duration: 400ms;
}
</style>
