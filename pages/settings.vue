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
              value="Acme Inc."
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
              value="billing@acme.com"
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
              rows="3"
              class="block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm bg-white">
123 Business Rd&#10;Suite 100&#10;San Francisco, CA 94107</textarea
            >
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
              class="block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm bg-white text-slate-900">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>IDR (Rp)</option>
              <option>MYR (RM)</option>
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
              value="6"
              class="block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm bg-white" />
          </div>
        </div>
      </div>

      <div
        class="bg-white px-6 py-4 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          class="inline-flex justify-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup></script>
