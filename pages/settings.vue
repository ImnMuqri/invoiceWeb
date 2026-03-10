<template>
  <div class="max-w-3xl">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">
        Settings
      </h1>
      <p class="mt-2 text-sm text-slate-500 font-medium">
        Manage your company profile and general preferences.
      </p>
    </div>

    <div
      class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
      <!-- Section 1 -->
      <div class="p-8 border-b border-slate-200">
        <h3
          class="text-lg font-medium leading-6 text-slate-900 tracking-tight mb-6">
          Company Information
        </h3>
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div class="sm:col-span-4">
            <label
              for="company-name"
              class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
              >Company Name</label
            >
            <input
              type="text"
              id="company-name"
              placeholder="Enter your company name"
              v-model="form.companyName"
              class="block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm bg-white" />
          </div>
          <div class="sm:col-span-4">
            <label
              for="company-email"
              class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
              >Billing Email</label
            >
            <input
              type="email"
              id="company-email"
              placeholder="Enter your company name"
              v-model="form.companyEmail"
              class="block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm bg-white" />
          </div>
          <div class="sm:col-span-6">
            <label
              for="address"
              class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
              >Address</label
            >
            <textarea
              id="address"
              v-model="form.address"
              placeholder="Enter your company name"
              rows="3"
              class="block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm bg-white"></textarea>
          </div>
        </div>
      </div>

      <!-- Section 2 -->
      <div class="p-8 border-b border-slate-200">
        <h3
          class="text-lg font-medium leading-6 text-slate-900 tracking-tight mb-6">
          Preferences
        </h3>
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div class="sm:col-span-3">
            <label
              for="currency"
              class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
              >Default Currency</label
            >
            <select
              id="currency"
              v-model="form.defaultCurrency"
              class="block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm bg-white text-slate-900">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="IDR">IDR (Rp)</option>
              <option value="MYR">MYR (RM)</option>
            </select>
          </div>
          <div class="sm:col-span-3">
            <label
              for="tax"
              class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
              >Default Tax Rate (%)</label
            >
            <input
              type="number"
              id="tax"
              v-model.number="form.defaultTaxRate"
              class="block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm bg-white" />
          </div>
        </div>
      </div>

      <div
        class="bg-white px-6 py-4 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          @click="saveSettings"
          :disabled="authStore.loading"
          class="inline-flex justify-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-colors disabled:opacity-50">
          {{ authStore.loading ? "Saving..." : "Save Settings" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useAuthStore } from "~/stores/authStore";

const authStore = useAuthStore();

const form = ref({
  name: "",
  companyName: "",
  companyEmail: "",
  address: "",
  defaultCurrency: "MYR",
  defaultTaxRate: 0,
});

onMounted(async () => {
  await authStore.fetchProfile();
  if (authStore.user) {
    form.value = {
      name: authStore.user.name || "",
      companyName: authStore.user.companyName || "",
      companyEmail: authStore.user.companyEmail || "",
      address: authStore.user.address || "",
      defaultCurrency: authStore.user.defaultCurrency || "MYR",
      defaultTaxRate: authStore.user.defaultTaxRate || 0,
    };
  }
});

const saveSettings = async () => {
  const success = await authStore.updateProfile(form.value);
  if (success) {
    alert("Settings saved successfully!");
  } else {
    alert("Failed to save settings: " + authStore.error);
  }
};
</script>
