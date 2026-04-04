<template>
  <div class="advanced-analytics space-y-8">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
          Plan Management
        </h2>
        <p class="text-xs font-medium text-slate-500 mt-1">
          Manage subscription plans, pricing, and platform analytics.
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-bold transition-all shadow-sm active:scale-95 border-none cursor-pointer">
        Create New Plan
      </button>
    </div>

    <!-- Dashboard Overview Stats -->
    <div
      v-if="adminStore.analytics?.summary"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
          MYR
          {{ adminStore.analytics.summary.revenue.lifetime.toLocaleString() }}
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
          MYR {{ monthlyRevenueValue.toLocaleString() }}
        </dd>
        <p class="text-[10px] text-slate-500 mt-2 font-medium">
          {{ months[selectedMonth - 1] }} {{ selectedYear }} Earnings
        </p>
      </div>

      <!-- Total Transactions Card -->
      <div
        class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-center justify-between mb-4">
          <div
            class="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors text-amber-600">
            <UiIcon icon="heroicons:credit-card" class="w-5 h-5" />
          </div>
          <div
            class="text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
            Platform-wide
          </div>
        </div>
        <dt
          class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Total Transactions
        </dt>
        <dd class="text-2xl font-semibold text-slate-900 tracking-tight">
          {{ adminStore.analytics.summary.totalTransactions.toLocaleString() }}
        </dd>
        <p class="text-[10px] text-slate-500 mt-2 font-medium">
          Lifetime cumulative activity
        </p>
      </div>

      <!-- Plan Distribution Card -->
      <div
        class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-center justify-between mb-4">
          <div
            class="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors text-indigo-600">
            <UiIcon icon="heroicons:chart-pie" class="w-5 h-5" />
          </div>
          <div
            class="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
            SUBSCRIPTIONS
          </div>
        </div>
        <dt
          class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Plan Distribution
        </dt>
        <dd class="space-y-1">
          <div
            v-for="d in adminStore.analytics?.web?.planDistribution"
            :key="d.plan"
            class="flex items-center justify-between bg-slate-50/50 px-2 py-0.5 rounded-lg border border-slate-100 group-hover:bg-slate-50 transition-colors">
            <span class="text-[10px] font-bold text-slate-500 uppercase">{{
              d.plan
            }}</span>
            <span class="text-xs font-bold text-slate-900">{{ d.count }}</span>
          </div>
        </dd>
        <p class="text-[10px] text-slate-500 mt-2 font-medium">
          Global platform spread
        </p>
      </div>
    </div>

    <!-- Plan Management Section -->
    <div class="space-y-8">
      <div
        class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
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
                Invoices
              </th>
              <th
                class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                AI Credits
              </th>
              <th
                class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Status
              </th>
              <th
                class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <template v-if="adminStore.plans && adminStore.plans.length">
              <tr
                v-for="plan in adminStore.plans"
                :key="plan.id"
                class="hover:bg-slate-50/30 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span
                      class="text-sm font-bold text-slate-900 uppercase tracking-tight"
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
                    <span class="text-[10px] font-bold text-slate-400 uppercase"
                      >{{ plan.currency }}/{{ plan.interval }}</span
                    >
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs font-bold text-slate-600">{{
                    plan.invoices >= 999999 ? "Unlimited" : plan.invoices
                  }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs font-bold text-slate-600">{{
                    plan.aiCredits >= 999999 ? "Unlimited" : plan.aiCredits
                  }}</span>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="
                      plan.isPublic
                        ? 'bg-emerald-50 text-emerald-600 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]'
                        : 'bg-slate-100 text-slate-500'
                    "
                    class="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest">
                    {{ plan.isPublic ? "Public" : "Private" }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="openEditModal(plan)"
                      class="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all border-none bg-transparent cursor-pointer">
                      <UiIcon icon="heroicons:pencil-square" class="w-4 h-4" />
                    </button>
                    <button
                      @click="confirmDelete(plan)"
                      class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
                      :disabled="['FREE', 'PRO', 'MAX'].includes(plan.name)">
                      <UiIcon icon="heroicons:trash" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-else-if="!adminStore.loading">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center gap-2">
                  <UiIcon
                    icon="heroicons:scale"
                    class="w-8 h-8 text-slate-200" />
                  <p
                    class="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    No plans defined
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Plan Modal -->
    <UiModal v-model="isModalOpen" maxWidth="2xl">
      <div class="p-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-xl font-bold text-slate-900 tracking-tight">
              {{ isEdit ? "Edit Plan" : "Create New Plan" }}
            </h3>
            <p class="text-xs text-slate-500 font-medium mt-1">
              {{
                isEdit
                  ? "Modify existing plan details and limits."
                  : "Define a new subscription tier for your users."
              }}
            </p>
          </div>
        </div>

        <form @submit.prevent="handleSave" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Basic Info -->
            <div class="space-y-4">
              <h4
                class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                Basic Information
              </h4>
              <div>
                <label
                  class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                  >Plan Name</label
                >
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. PRO, ENTERPRISE"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900 transition-all font-medium uppercase"
                  required />
              </div>
              <div>
                <label
                  class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                  >Description</label
                >
                <textarea
                  v-model="form.description"
                  placeholder="Briefly describe who this plan is for..."
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900 transition-all font-medium min-h-[100px]"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                    >Price</label
                  >
                  <div class="relative">
                    <span
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold"
                      >{{ form.currency }}</span
                    >
                    <input
                      v-model.number="form.price"
                      type="number"
                      step="0.01"
                      class="w-full pl-14 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900 transition-all font-bold"
                      required />
                  </div>
                </div>
                <div>
                  <label
                    class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                    >Interval</label
                  >
                  <select
                    v-model="form.interval"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900 transition-all font-bold cursor-pointer">
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Limits -->
            <div class="space-y-4">
              <h4
                class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                Usage Limits
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                    >Invoices</label
                  >
                  <input
                    v-model.number="form.invoices"
                    type="number"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label
                    class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                    >AI Credits</label
                  >
                  <input
                    v-model.number="form.aiCredits"
                    type="number"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label
                    class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                    >WA Sends</label
                  >
                  <input
                    v-model.number="form.waSends"
                    type="number"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label
                    class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                    >WA Reminders</label
                  >
                  <input
                    v-model.number="form.waReminders"
                    type="number"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label
                    class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                    >Email Sends</label
                  >
                  <input
                    v-model.number="form.emailSends"
                    type="number"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label
                    class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                    >Email Reminders</label
                  >
                  <input
                    v-model.number="form.emailReminders"
                    type="number"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                </div>
              </div>
              <p
                class="text-[10px] text-slate-400 font-medium italic mt-2 text-center">
                Use 999999 for unlimited.
              </p>
            </div>
          </div>

          <!-- Features List -->
          <div class="pt-6 border-t border-slate-100">
            <h4
              class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              Marketing Features (shown on cards)
            </h4>
            <div class="space-y-3">
              <div
                v-for="(feature, index) in form.features"
                :key="index"
                class="flex gap-2">
                <input
                  v-model="form.features[index]"
                  type="text"
                  placeholder="e.g. White Labelling"
                  class="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium" />
                <button
                  type="button"
                  @click="removeFeature(index)"
                  class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all border-none bg-transparent cursor-pointer">
                  <UiIcon icon="heroicons:trash" class="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                @click="addFeature"
                class="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-all cursor-pointer bg-transparent">
                + Add Feature Line
              </button>
            </div>
          </div>

          <!-- Meta -->
          <div class="flex items-center gap-6 pt-6">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                v-model="form.isPublic"
                class="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer" />
              <span
                class="text-sm font-bold text-slate-600 group-hover:text-slate-900"
                >Show on Landing/Onboarding</span
              >
            </label>
          </div>

          <div class="pt-8 flex gap-3">
            <button
              type="button"
              @click="isModalOpen = false"
              class="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer bg-transparent">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="adminStore.loading"
              class="flex-[2] py-3 px-4 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none">
              {{
                adminStore.loading
                  ? "Saving..."
                  : isEdit
                    ? "Update Plan"
                    : "Create Plan"
              }}
            </button>
          </div>
        </form>
      </div>
    </UiModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAdminStore } from "~/stores/adminStore";
import { useUiStore } from "~/stores/uiStore";

definePageMeta({
  layout: "default",
  middleware: "admin",
});

const adminStore = useAdminStore();
const uiStore = useUiStore();

// Plan Management Logic
const isModalOpen = ref(false);
const selectedPlan = ref(null);
const isEdit = ref(false);
const form = ref({
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

const openCreateModal = () => {
  selectedPlan.value = null;
  isEdit.value = false;
  form.value = {
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
  isModalOpen.value = true;
};

const openEditModal = (plan) => {
  selectedPlan.value = { ...plan };
  isEdit.value = true;
  form.value = {
    ...plan,
    features: Array.isArray(plan.features) ? [...plan.features] : [],
  };
  isModalOpen.value = true;
};

const addFeature = () => {
  form.value.features.push("");
};

const removeFeature = (index) => {
  form.value.features.splice(index, 1);
};

const handleSave = async () => {
  const payload = { ...form.value };
  let success = false;
  if (selectedPlan.value) {
    success = await adminStore.updatePlan(selectedPlan.value.id, payload);
  } else {
    success = await adminStore.createPlan(payload);
  }

  if (success) {
    isModalOpen.value = false;
    uiStore.addNotification({
      type: "success",
      title: "Plan Saved",
      message: "The plan details have been updated successfully.",
    });
    // refresh the plans list just in case
    adminStore.fetchPlans();
  }
};

const confirmDelete = async (plan) => {
  if (confirm(`Are you sure you want to delete the ${plan.name} plan?`)) {
    const success = await adminStore.deletePlan(plan.id);
    if (success) {
      uiStore.addNotification({
        type: "success",
        title: "Plan Deleted",
        message: "The plan has been removed successfully.",
      });
    }
  }
};

onMounted(async () => {
  await Promise.all([adminStore.fetchAnalytics(), adminStore.fetchPlans()]);
  updateMonthlyRevenue();
});

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
</script>

<style scoped>
:deep(.chart-container) {
  position: relative;
}
</style>
