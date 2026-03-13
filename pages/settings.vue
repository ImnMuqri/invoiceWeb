<template>
  <div class="max-w-[1300px]">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">
        Settings
      </h1>
      <p class="mt-2 text-sm text-slate-500 font-medium">
        Manage your company profile, WhatsApp configurations, and preferences.
      </p>
    </div>

    <div class="flex flex-col md:flex-row gap-8">
      <!-- Sidebar Navigation -->
      <aside class="w-full md:w-64 flex-shrink-0">
        <nav class="space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="switchTab(tab.id)"
            :class="[
              activeTab === tab.id
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              'group flex items-center px-4 py-2.5 text-sm font-semibold rounded-md transition-all w-full text-left',
            ]">
            <UiIcon
              :name="tab.icon"
              :class="[
                activeTab === tab.id
                  ? 'text-slate-900'
                  : 'text-slate-400 group-hover:text-slate-500',
                'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
              ]" />
            {{ tab.name }}
          </button>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 mb-12">
        <div
          class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
          <!-- General Tab -->
          <div v-if="activeTab === 'general'" class="divide-y divide-slate-100">
            <div class="p-6">
              <h3
                class="text-base font-semibold text-slate-900 tracking-tight mb-6">
                Company Information
              </h3>
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-4">
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Full Name</label
                  >
                  <input
                    type="text"
                    v-model="profileForm.name"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
                </div>
                <div class="sm:col-span-4">
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Company Name</label
                  >
                  <input
                    type="text"
                    v-model="profileForm.companyName"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
                </div>
                <div class="sm:col-span-4">
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Billing Email</label
                  >
                  <input
                    type="email"
                    v-model="profileForm.companyEmail"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
                </div>
                <div class="sm:col-span-6">
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Address</label
                  >
                  <textarea
                    v-model="profileForm.address"
                    rows="3"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all"></textarea>
                </div>
              </div>
            </div>

            <div class="p-6">
              <h3
                class="text-base font-semibold text-slate-900 tracking-tight mb-6">
                Preferences
              </h3>
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-3">
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Default Currency</label
                  >
                  <UiSelect
                    v-model="profileForm.defaultCurrency"
                    :options="currencyOptions"
                    placeholder="Select currency" />
                </div>
                <div class="sm:col-span-3">
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Default Tax Rate (%)</label
                  >
                  <input
                    type="number"
                    v-model.number="profileForm.defaultTaxRate"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          <!-- WhatsApp Tab -->
          <div
            v-if="activeTab === 'whatsapp'"
            class="divide-y divide-slate-100 relative overflow-hidden min-h-[400px]">
            <!-- Lock Overlay -->
            <div
              v-if="!authStore.isPro"
              class="absolute inset-0 z-10 backdrop-blur-[6px] bg-white/40 flex flex-col items-center justify-center p-8 text-center">
              <div
                class="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-4 text-emerald-600">
                <UiIcon icon="heroicons:lock-closed" custom-class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-1">
                WhatsApp & Reminders are Pro Features
              </h3>
              <p class="text-sm text-slate-500 mb-4 max-w-sm leading-relaxed">
                Connect your own Twilio, customize automated reminder templates,
                and more by upgrading to a business plan.
              </p>
              <button
                @click="switchTab('billing')"
                class="inline-flex items-center px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg">
                Upgrade to Pro
              </button>
            </div>

            <div class="p-6">
              <h3
                class="text-base font-semibold text-slate-900 tracking-tight mb-2">
                WhatsApp Connection
              </h3>
              <p class="text-sm text-slate-500 mb-6 font-medium">
                Choose how you want to connect to WhatsApp.
              </p>

              <div class="space-y-3 mb-8">
                <label
                  class="flex items-center p-4 border rounded-md cursor-pointer transition-all border-slate-200 hover:border-slate-300"
                  :class="{
                    'border-slate-900 bg-slate-50':
                      settingsForm.whatsappMode === 'SYSTEM',
                  }">
                  <input
                    type="radio"
                    value="SYSTEM"
                    v-model="settingsForm.whatsappMode"
                    class="sr-only" />
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-slate-900">
                      Managed (InvoKita Shared Number)
                    </p>
                    <p class="text-xs text-slate-500 mt-1">
                      Plug & Play. Use our shared business number to send
                      messages instantly.
                    </p>
                  </div>
                  <div
                    class="h-4 w-4 rounded-full border flex items-center justify-center"
                    :class="
                      settingsForm.whatsappMode === 'SYSTEM'
                        ? 'border-slate-900'
                        : 'border-slate-300'
                    ">
                    <div
                      v-if="settingsForm.whatsappMode === 'SYSTEM'"
                      class="h-2 w-2 rounded-full bg-slate-900"></div>
                  </div>
                </label>

                <label
                  class="flex items-center p-4 border rounded-md cursor-pointer transition-all border-slate-200 hover:border-slate-300"
                  :class="{
                    'border-slate-900 bg-slate-50':
                      settingsForm.whatsappMode === 'CUSTOM',
                  }">
                  <input
                    type="radio"
                    value="CUSTOM"
                    v-model="settingsForm.whatsappMode"
                    class="sr-only" />
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-slate-900">
                      Custom (Bring Your Own Twilio)
                    </p>
                    <p class="text-xs text-slate-500 mt-1">
                      Connect your own Twilio account to send from your own
                      business number.
                    </p>
                  </div>
                  <div
                    class="h-4 w-4 rounded-full border flex items-center justify-center"
                    :class="
                      settingsForm.whatsappMode === 'CUSTOM'
                        ? 'border-slate-900'
                        : 'border-slate-300'
                    ">
                    <div
                      v-if="settingsForm.whatsappMode === 'CUSTOM'"
                      class="h-2 w-2 rounded-full bg-slate-900"></div>
                  </div>
                </label>
              </div>

              <div
                v-if="settingsForm.whatsappMode === 'CUSTOM'"
                class="grid grid-cols-1 gap-6 sm:grid-cols-2 bg-slate-50 p-6 rounded-md border border-slate-200">
                <div class="sm:col-span-2">
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Twilio Account SID</label
                  >
                  <input
                    type="text"
                    v-model="settingsForm.twilioSid"
                    placeholder="AC..."
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none bg-white transition-all" />
                </div>
                <div>
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Twilio Auth Token</label
                  >
                  <input
                    type="password"
                    v-model="settingsForm.twilioAuthToken"
                    placeholder="••••••••"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none bg-white transition-all" />
                </div>
                <div>
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Twilio WhatsApp Number</label
                  >
                  <input
                    type="text"
                    v-model="settingsForm.twilioPhoneNumber"
                    placeholder="whatsapp:+123..."
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none bg-white transition-all" />
                </div>
              </div>
            </div>

            <div class="p-6">
              <h3
                class="text-base font-semibold text-slate-900 tracking-tight mb-2">
                Message Templates
              </h3>
              <p class="text-sm text-slate-500 mb-6 font-medium">
                Customize the messages sent to your clients.
              </p>

              <div class="space-y-6">
                <div>
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Invoice Send Template</label
                  >
                  <textarea
                    v-model="settingsForm.whatsappSendTemplate"
                    rows="4"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all"
                    placeholder="Enter template for manual sending"></textarea>
                </div>
                <div>
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Automatic Reminder Template</label
                  >
                  <textarea
                    v-model="settingsForm.whatsappReminderTemplate"
                    rows="4"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all"
                    placeholder="Enter template for auto reminders"></textarea>
                </div>

                <div class="bg-slate-50 rounded-md p-6 border border-slate-200">
                  <h4
                    class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
                    Available Placeholders
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="tag in [
                        '{{userName}}',
                        '{{companyName}}',
                        '{{clientName}}',
                        '{{invoiceNumber}}',
                        '{{totalAmount}}',
                        '{{currency}}',
                        '{{dueDate}}',
                        '{{invoiceUrl}}',
                      ]"
                      :key="tag"
                      class="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-mono font-semibold text-slate-600 shadow-sm">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Billing Tab -->
          <div v-if="activeTab === 'billing'" class="p-6">
            <!-- Current Plan Banner -->
            <div
              class="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between transition-all hover:bg-slate-100/50">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-white border border-slate-200 rounded-md flex items-center justify-center text-lg shadow-sm">
                  <UiIcon
                    icon="solar:bill-check-bold"
                    class="text-emerald-600"></UiIcon>
                </div>
                <div>
                  <p
                    class="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none mb-1">
                    Your Current Plan
                  </p>
                  <h4
                    class="text-sm font-semibold text-slate-900 leading-none capitalize">
                    {{ authStore.user?.plan || "Free" }}
                  </h4>
                </div>
              </div>
              <div
                class="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded border border-emerald-100 shadow-sm">
                Active
              </div>
            </div>

            <!-- Pricing Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
              <!-- Free Plan -->
              <div
                class="border border-slate-200 rounded-2xl p-8 transition-all hover:border-slate-300 bg-white shadow-sm flex flex-col">
                <div class="mb-8">
                  <div class="flex items-center justify-between mb-2">
                    <h5 class="text-lg font-semibold text-slate-900">Free</h5>
                    <span
                      v-if="authStore.user?.plan === 'FREE'"
                      class="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-semibold rounded uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                  <p class="text-sm text-slate-500 font-medium">For starters</p>
                </div>
                <div class="mb-8 flex items-baseline">
                  <span
                    class="text-4xl font-semibold text-slate-900 tracking-tight"
                    >$0</span
                  >
                  <span class="text-slate-400 text-sm ml-1 font-medium"
                    >/month</span
                  >
                </div>
                <ul class="space-y-4 mb-8 flex-1">
                  <li
                    v-for="feature in [
                      '5 Invoices/mo',
                      'Email Delivery',
                      'Manual Reminders',
                    ]"
                    :key="feature"
                    class="flex items-center text-sm font-medium text-slate-600">
                    <UiIcon
                      icon="heroicons:check"
                      class="w-4 h-4 mr-3 text-slate-400" />
                    {{ feature }}
                  </li>
                  <li
                    v-for="limit in [
                      'No AI Drafts',
                      'No WhatsApp',
                      'No Auto-Chasers',
                    ]"
                    :key="limit"
                    class="flex items-center text-sm font-medium text-slate-400 line-through">
                    <UiIcon
                      icon="heroicons:x-mark"
                      class="w-4 h-4 mr-3 text-slate-300" />
                    {{ limit }}
                  </li>
                </ul>
                <button
                  @click="
                    authStore.user?.plan !== 'FREE' ? updatePlan('FREE') : null
                  "
                  :disabled="authStore.user?.plan === 'FREE'"
                  class="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border"
                  :class="
                    authStore.user?.plan === 'FREE'
                      ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                  ">
                  {{
                    authStore.user?.plan === "FREE"
                      ? "Current Plan"
                      : "Downgrade"
                  }}
                </button>
              </div>

              <!-- Pro Plan -->
              <div
                class="border border-slate-200 rounded-2xl p-8 transition-all hover:border-emerald-200 bg-white shadow-sm flex flex-col">
                <div class="mb-8">
                  <div class="flex items-center justify-between mb-2">
                    <h5 class="text-lg font-semibold text-slate-900">Pro</h5>
                    <span
                      v-if="authStore.user?.plan === 'PRO'"
                      class="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-semibold rounded uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                  <p class="text-sm text-slate-500 font-medium">
                    Growing businesses
                  </p>
                </div>
                <div class="mb-8 flex items-baseline">
                  <span
                    class="text-4xl font-semibold text-slate-900 tracking-tight"
                    >$29</span
                  >
                  <span class="text-slate-400 text-sm ml-1 font-medium"
                    >/month</span
                  >
                </div>
                <ul class="space-y-4 mb-8 flex-1">
                  <li
                    v-for="feature in [
                      '30 Invoices/mo',
                      '10 WhatsApp channels',
                      '30 Reminders/mo',
                      '20 AI Drafts/mo',
                    ]"
                    :key="feature"
                    class="flex items-center text-sm font-medium text-slate-600">
                    <UiIcon
                      icon="heroicons:check"
                      class="w-4 h-4 mr-3 text-emerald-600" />
                    {{ feature }}
                  </li>
                  <li
                    class="flex items-center text-sm font-medium text-slate-400 line-through">
                    <UiIcon
                      icon="heroicons:x-mark"
                      class="w-4 h-4 mr-3 text-slate-300" />
                    White Labelling
                  </li>
                </ul>
                <button
                  @click="
                    authStore.user?.plan !== 'PRO' ? updatePlan('PRO') : null
                  "
                  :disabled="authStore.user?.plan === 'PRO'"
                  class="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border"
                  :class="
                    authStore.user?.plan === 'PRO'
                      ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                      : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                  ">
                  {{
                    authStore.user?.plan === "PRO"
                      ? "Current Plan"
                      : "Select Pro"
                  }}
                </button>
              </div>

              <!-- Max Plan -->
              <div
                class="border border-slate-200 rounded-2xl p-8 transition-all hover:border-indigo-200 bg-white shadow-sm flex flex-col">
                <div class="mb-8">
                  <div class="flex items-center justify-between mb-2">
                    <h5 class="text-lg font-semibold text-slate-900">Max</h5>
                    <span
                      v-if="authStore.user?.plan === 'MAX'"
                      class="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-semibold rounded uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                  <p class="text-sm text-slate-500 font-medium">Power users</p>
                </div>
                <div class="mb-8 flex items-baseline">
                  <span
                    class="text-4xl font-semibold text-slate-900 tracking-tight"
                    >$99</span
                  >
                  <span class="text-slate-400 text-sm ml-1 font-medium"
                    >/month</span
                  >
                </div>
                <ul class="space-y-4 mb-8 flex-1">
                  <li
                    v-for="feature in [
                      '100 Invoices/mo',
                      'Unlimited Channels',
                      '100 Reminders/mo',
                      '50 AI Drafts/mo',
                      'White Labelling',
                    ]"
                    :key="feature"
                    class="flex items-center text-sm font-medium text-slate-600">
                    <UiIcon
                      icon="heroicons:check"
                      class="w-4 h-4 mr-3 text-indigo-500" />
                    {{ feature }}
                  </li>
                </ul>
                <button
                  @click="
                    authStore.user?.plan !== 'MAX' ? updatePlan('MAX') : null
                  "
                  :disabled="authStore.user?.plan === 'MAX'"
                  class="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border"
                  :class="
                    authStore.user?.plan === 'MAX'
                      ? 'border-indigo-100 bg-indigo-50 text-indigo-600'
                      : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                  ">
                  {{
                    authStore.user?.plan === "MAX"
                      ? "Current Plan"
                      : "Select Max"
                  }}
                </button>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div
            v-if="activeTab !== 'billing'"
            class="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              @click="saveSettings"
              :disabled="authStore.loading"
              class="inline-flex justify-center items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all disabled:opacity-50">
              <UiIcon
                v-if="authStore.loading"
                icon="heroicons:arrow-path"
                custom-class="w-4 h-4 mr-2 animate-spin text-white" />
              {{ authStore.loading ? "Saving..." : "Save Settings" }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <UiToast v-model="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "~/stores/authStore";

const authStore = useAuthStore();
const subscribeStore = useSubscribeStore();
const route = useRoute();
const router = useRouter();
const { $api } = useNuxtApp();

const tabs = [
  {
    id: "general",
    name: "General & Profile",
    icon: "heroicons:building-office",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Configuration",
    icon: "heroicons:chat-bubble-left-right",
  },
  { id: "billing", name: "Billing", icon: "heroicons:credit-card" },
];

const activeTab = ref(route.query.tab || "general");
const toast = ref({ message: "", type: "success" });
const currencyOptions = ref([]);

const fetchCurrencies = async () => {
  try {
    const response = await $api.get("/currencies");
    currencyOptions.value = response.data;
  } catch (err) {
    console.error("Failed to fetch currencies:", err);
    // Fallback if API fails
    currencyOptions.value = [
      { value: "MYR", label: "MYR (RM)" },
      { value: "USD", label: "USD ($)" },
    ];
  }
};

// Sync with route changes
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && tabs.some((t) => t.id === newTab)) {
      activeTab.value = newTab;
    } else if (!newTab) {
      activeTab.value = "general";
    }
  },
);

const switchTab = (tabId) => {
  router.push({ query: { ...route.query, tab: tabId } });
};

const profileForm = ref({
  name: "",
  companyName: "",
  companyEmail: "",
  address: "",
  defaultCurrency: "MYR",
  defaultTaxRate: 0,
});

const settingsForm = ref({
  whatsappSendTemplate: "",
  whatsappReminderTemplate: "",
  whatsappMode: "SYSTEM",
  twilioSid: "",
  twilioAuthToken: "",
  twilioPhoneNumber: "",
});

onMounted(async () => {
  fetchCurrencies();
  await authStore.fetchProfile();
  if (authStore.user) {
    profileForm.value = {
      name: authStore.user.name || "",
      companyName: authStore.user.companyName || "",
      companyEmail: authStore.user.companyEmail || "",
      address: authStore.user.address || "",
      defaultCurrency: authStore.user.defaultCurrency || "MYR",
      defaultTaxRate: authStore.user.defaultTaxRate || 0,
    };
  }

  const settings = await authStore.fetchSettings();
  if (settings) {
    settingsForm.value = {
      whatsappSendTemplate: settings.whatsappSendTemplate || "",
      whatsappReminderTemplate: settings.whatsappReminderTemplate || "",
      whatsappMode: settings.whatsappMode || "SYSTEM",
      twilioSid: settings.twilioSid || "",
      twilioAuthToken: settings.twilioAuthToken || "",
      twilioPhoneNumber: settings.twilioPhoneNumber || "",
    };
  }
});

const saveSettings = async () => {
  try {
    let res;
    if (activeTab.value === "general") {
      res = await authStore.updateProfile(profileForm.value);
    } else if (activeTab.value === "whatsapp") {
      res = await authStore.updateSettings(settingsForm.value);
    } else {
      return;
    }
    toast.value = {
      message: res?.message || "Settings saved successfully!",
      type: "success",
    };
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || authStore.error || "Failed to save settings",
      type: "error",
    };
  }
};

const updatePlan = async (plan) => {
  try {
    const res = await subscribeStore.subscribe(plan);
    // Refetch profile to get new usage limits
    await authStore.fetchProfile();
    toast.value = {
      message: res?.message || `Successfully switched to ${plan} plan!`,
      type: "success",
    };
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || subscribeStore.error || "Failed to update plan",
      type: "error",
    };
  }
};
</script>

<style scoped></style>
