<template>
  <div class="max-w-[1300px]">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Settings</h2>
      <p class="text-xs font-medium text-slate-500 mt-1">
        Manage your profile and platform preferences.
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
            <div class="p-6 border-b border-slate-100">
              <h3
                class="text-base font-semibold text-slate-900 tracking-tight mb-1">
                User Profile
              </h3>
              <p class="text-sm text-slate-500 mb-6">
                Manage your preferences, personal and business information.
              </p>
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-3">
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Login Email</label
                  >
                  <input
                    type="email"
                    disabled
                    :value="authStore.user?.email"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed outline-none transition-all" />
                </div>
                <div class="sm:col-span-3">
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Full Name</label
                  >
                  <input
                    type="text"
                    v-model="profileForm.name"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
                </div>
                <div class="sm:col-span-3">
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Personal Phone</label
                  >
                  <input
                    type="tel"
                    v-model="profileForm.phoneNumber"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
                </div>
              </div>
            </div>

            <div class="p-6 border-b border-slate-100">
              <div class="flex items-center justify-between mb-6">
                <h3
                  class="text-base font-semibold text-slate-900 tracking-tight">
                  Company Profile
                </h3>
              </div>
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-6">
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Company Name</label
                  >
                  <input
                    type="text"
                    v-model="profileForm.companyName"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
                </div>
                <div class="sm:col-span-3">
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Company Email</label
                  >
                  <input
                    type="email"
                    v-model="profileForm.companyEmail"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
                  <div class="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sameEmail"
                      v-model="useSameEmail"
                      @change="syncEmail"
                      class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <label
                      for="sameEmail"
                      class="text-[11px] font-medium text-slate-500"
                      >Use same as login email</label
                    >
                  </div>
                </div>
                <div class="sm:col-span-3">
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Company Phone</label
                  >
                  <input
                    type="tel"
                    v-model="profileForm.companyPhone"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
                  <div class="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="samePhone"
                      v-model="useSamePhone"
                      @change="syncPhone"
                      class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <label
                      for="samePhone"
                      class="text-[11px] font-medium text-slate-500"
                      >Use same as personal phone</label
                    >
                  </div>
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
                class="text-base font-semibold text-slate-900 tracking-tight mb-1">
                WhatsApp Connection
              </h3>
              <p class="text-sm text-slate-500 mb-6">
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
                    autocomplete="off"
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

            <div class="p-6 border-t border-slate-100">
              <h3
                class="text-base font-semibold text-slate-900 tracking-tight mb-2">
                Automated WhatsApp Reminders
              </h3>
              <p class="text-sm text-slate-500 mb-6 font-medium">
                Set how frequently your clients receive automated WhatsApp
                notifications for overdue invoices.
              </p>

              <div class="max-w-xs">
                <label
                  class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                  >WhatsApp Reminder Interval</label
                >
                <UiSelect
                  v-model="settingsForm.whatsappReminderInterval"
                  :options="reminderIntervalOptions"
                  placeholder="Select interval" />
                <p class="text-[12px] text-slate-500 mt-4 leading-relaxed">
                  <span v-if="settingsForm.whatsappReminderInterval === 0">
                    WhatsApp reminders are currently disabled.
                  </span>
                  <span v-else-if="settingsForm.whatsappReminderInterval < 0">
                    A WhatsApp reminder will be sent
                    {{ Math.abs(settingsForm.whatsappReminderInterval) }} days
                    before the due date.
                  </span>
                  <span v-else>
                    After the due date, a WhatsApp reminder will be sent every
                    {{ settingsForm.whatsappReminderInterval }} days.
                  </span>
                </p>
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

          <!-- Email Configuration Tab -->
          <div
            v-if="activeTab === 'email'"
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
                Email Reminders are a Pro Feature
              </h3>
              <p class="text-sm text-slate-500 mb-4 max-w-sm leading-relaxed">
                Customize your completely automated email reminder pacing
                settings by upgrading to a business plan.
              </p>
              <button
                @click="switchTab('billing')"
                class="inline-flex items-center px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg">
                Upgrade to Pro
              </button>
            </div>

            <div class="p-6">
              <h3
                class="text-base font-semibold text-slate-900 tracking-tight mb-1">
                Automated Email Reminders
              </h3>
              <p class="text-sm text-slate-500 mb-6">
                Control exactly how frequently your clients realistically
                receive polite, automated email reminders chasing unpaid
                invoices.
              </p>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Controls -->
                <div>
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Reminder Interval</label
                  >
                  <UiSelect
                    v-model="profileForm.reminderInterval"
                    :options="reminderIntervalOptions"
                    placeholder="Select interval" />
                  <p class="text-[12px] text-slate-500 mt-4 leading-relaxed">
                    <span v-if="profileForm.reminderInterval === 0">
                      Automated email reminders are currently disabled. Your
                      clients will only receive the initial invoice email.
                    </span>
                    <span v-else-if="profileForm.reminderInterval < 0">
                      The platform will automatically email your client a polite
                      reminder exactly
                      {{ Math.abs(profileForm.reminderInterval) }} days before
                      the invoice's strict due date to ensure timely payment.
                    </span>
                    <span v-else>
                      Once an invoice passes its due date without being fully
                      paid, the platform will automatically email your client a
                      polite reminder precisely following this spacing interval
                      until it is marked as Paid.
                    </span>
                  </p>
                </div>
                <!-- Preview Canvas -->
                <div
                  class="bg-slate-50 rounded-xl border border-slate-200 p-5 col-span-2">
                  <div
                    class="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div class="flex flex-col">
                      <span
                        class="text-[12px] font-bold text-slate-400 uppercase tracking-widest"
                        >Client View Simulator</span
                      >
                      <span class="text-[11px] font-noprmal text-slate-400"
                        >This is an example of what your client will see</span
                      >
                    </div>
                    <span
                      class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[9px] font-bold tracking-widest uppercase border border-blue-200 w-fit"
                      >Email Layout</span
                    >
                  </div>
                  <!-- Mini stylized email container -->
                  <div
                    class="bg-white rounded-xl border border-slate-200 shadow-sm p-8 w-full mx-auto font-sans"
                    style="max-width: 480px">
                    <!-- Header Logo -->
                    <div class="flex items-center justify-center gap-1.5 mb-4">
                      <UiLogo class="text-slate-900 relative" />
                    </div>

                    <!-- Intro Text -->
                    <div
                      class="text-[13px] text-slate-600 space-y-2 mb-4 leading-relaxed">
                      <p>Hi <strong>Iman Muqri</strong>,</p>
                      <p>
                        You have received an invoice from
                        <strong>{{
                          profileForm.companyName ||
                          profileForm.name ||
                          "Client Name"
                        }}</strong>
                        via
                        <span class="py-0.5 rounded font-medium text-slate-900"
                          >InvoKita</span
                        >.
                      </p>
                    </div>

                    <!-- Invoice Card -->
                    <div
                      class="bg-[#f8fafc] rounded-xl p-8 text-center mb-8 border border-slate-100">
                      <span
                        class="inline-flex items-center justify-center px-3 py-1 bg-[#eff6ff] text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full mb-5">
                        PENDING
                      </span>
                      <p class="text-xs text-slate-500 font-medium mb-1">
                        INVK-0005
                      </p>
                      <p
                        class="text-[11px] text-slate-400 font-medium tracking-wide mb-3">
                        Amount Due
                      </p>
                      <h2
                        class="text-3xl font-black text-slate-900 mb-8 tracking-tight">
                        {{ profileForm.defaultCurrency }} 20.99
                      </h2>

                      <div class="h-px bg-slate-200 w-full mb-5"></div>

                      <p class="text-[11px] text-slate-500 font-medium">
                        Due April 11, 2026
                      </p>
                    </div>

                    <!-- CTA Button -->
                    <div class="w-full flex justify-center mb-8">
                      <div
                        class="bg-[#0f172a] text-white rounded-lg px-8 py-3 text-xs font-bold shadow-sm cursor-not-allowed">
                        View Invoice
                      </div>
                    </div>

                    <!-- Footer -->
                    <p class="text-[11px] text-slate-500 text-center mb-4">
                      A PDF copy of your invoice is also attached to this email.
                    </p>

                    <div
                      class="text-center text-[10px] font-medium text-slate-400 space-y-1">
                      <p>This email was sent via InvoKita.</p>
                      <p>Accurate & Professional Invoicing.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payments Tab -->
          <div
            v-if="activeTab === 'payments'"
            class="divide-y divide-slate-100 p-6">
            <div class="mb-8 text-left">
              <h3
                class="text-base font-semibold text-slate-900 tracking-tight text-left">
                Accept payments from your invoices
              </h3>
              <p class="text-sm text-slate-500 mt-1 text-left">
                Connect a payment provider so your clients can pay your invoices
                online using FPX, DuitNow QR, or card payments.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8">
              <!-- Direct Bank Transfer -->
              <div
                class="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm flex flex-col hover:border-slate-300 transition-all">
                <div class="flex items-center gap-4 mb-6">
                  <div
                    class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden text-slate-400">
                    <UiIcon icon="heroicons:banknotes" class="w-6 h-6" />
                  </div>
                  <div class="text-left">
                    <h4 class="text-sm font-bold text-slate-900 text-left">
                      Bank Transfer
                    </h4>
                    <p class="text-[10px] text-slate-500 font-medium text-left">
                      Manual fallback for direct payments
                    </p>
                  </div>
                </div>

                <div
                  v-if="
                    settingsForm.manualBankName ||
                    settingsForm.manualAccountNumber
                  "
                  class="mt-auto">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span class="text-[12px] font-bold text-emerald-600"
                        >Configured</span
                      >
                    </div>
                  </div>
                  <button
                    @click="isManualModalOpen = true"
                    class="w-full py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
                    Edit Details
                  </button>
                </div>
                <button
                  v-else
                  @click="isManualModalOpen = true"
                  class="mt-auto w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest">
                  Setup Manual
                </button>
              </div>

              <!-- ToyyibPay -->
              <div
                class="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm flex flex-col hover:border-slate-300 transition-all">
                <div class="flex items-center gap-4 mb-6">
                  <div
                    class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                    <img
                      src="https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/e2hhr8kgl2hq5bkkqueq?ik-sanitizeSvg=true"
                      class="w-10 h-10 object-contain"
                      alt="ToyyibPay" />
                  </div>
                  <div class="text-left">
                    <h4 class="text-sm font-bold text-slate-900 text-left">
                      ToyyibPay
                    </h4>
                    <p class="text-[10px] text-slate-500 font-medium text-left">
                      Accepts FPX, DuitNow, and Card payments
                    </p>
                  </div>
                </div>

                <div v-if="isProviderConnected('TOYYIBPAY')" class="mt-auto">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span
                        class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest"
                        >Connected</span
                      >
                    </div>
                    <div
                      v-if="isProviderPreferred('TOYYIBPAY')"
                      class="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-blue-100 italic">
                      Preferred
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="openConnectModal('TOYYIBPAY')"
                      class="flex-1 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-all">
                      Edit
                    </button>
                    <button
                      @click="disconnectProvider('TOYYIBPAY')"
                      class="px-3 py-2 text-xs font-bold text-red-600 border border-red-100 rounded-md hover:bg-red-50 transition-all">
                      Disconnect
                    </button>
                  </div>
                  <button
                    v-if="
                      !isProviderPreferred('TOYYIBPAY') &&
                      paymentProviders.length > 1
                    "
                    @click="setPreferred('TOYYIBPAY')"
                    class="w-full mt-3 py-1.5 text-[10px] font-bold text-blue-600 border border-blue-100 rounded-md hover:bg-blue-50 transition-all uppercase tracking-widest">
                    Set Preferred
                  </button>
                </div>
                <button
                  v-else
                  @click="openConnectModal('TOYYIBPAY')"
                  class="mt-auto w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-md hover:bg-slate-800 transition-all uppercase tracking-widest">
                  Connect
                </button>
              </div>

              <!-- Billplz -->
              <div
                class="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm flex flex-col hover:border-slate-300 transition-all">
                <div class="flex items-center gap-4 mb-6">
                  <div
                    class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                    <img
                      src="https://make-cxp-documentation.ams3.digitaloceanspaces.com/apps-center-icons/billplz.png"
                      class="w-10 h-10 object-contain"
                      alt="Billplz" />
                  </div>
                  <div class="text-left">
                    <h4 class="text-sm font-bold text-slate-900 text-left">
                      Billplz
                    </h4>
                    <p class="text-[10px] text-slate-500 font-medium text-left">
                      Accepts FPX and Card payments
                    </p>
                  </div>
                </div>

                <div v-if="isProviderConnected('BILLPLZ')" class="mt-auto">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span
                        class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest"
                        >Connected</span
                      >
                    </div>
                    <div
                      v-if="isProviderPreferred('BILLPLZ')"
                      class="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-blue-100 italic">
                      Preferred
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="openConnectModal('BILLPLZ')"
                      class="flex-1 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-all">
                      Edit
                    </button>
                    <button
                      @click="disconnectProvider('BILLPLZ')"
                      class="px-3 py-2 text-xs font-bold text-red-600 border border-red-100 rounded-md hover:bg-red-50 transition-all">
                      Disconnect
                    </button>
                  </div>
                  <button
                    v-if="
                      !isProviderPreferred('BILLPLZ') &&
                      paymentProviders.length > 1
                    "
                    @click="setPreferred('BILLPLZ')"
                    class="w-full mt-3 py-1.5 text-[10px] font-bold text-blue-600 border border-blue-100 rounded-md hover:bg-blue-50 transition-all uppercase tracking-widest">
                    Set Preferred
                  </button>
                </div>
                <button
                  v-else
                  @click="openConnectModal('BILLPLZ')"
                  class="mt-auto w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-md hover:bg-slate-800 transition-all uppercase tracking-widest">
                  Connect
                </button>
              </div>
            </div>

            <!-- Security Notice -->
            <div
              class="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div class="flex gap-4">
                <div
                  class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 text-slate-600">
                  <UiIcon
                    name="heroicons:shield-check"
                    custom-class="w-4 h-4" />
                </div>
                <div class="flex-1 text-left">
                  <h4 class="text-sm font-bold text-slate-900 mb-1 text-left">
                    Your Security is Our Priority
                  </h4>
                  <p class="text-xs text-slate-500 leading-relaxed text-left">
                    We use military-grade encryption to store your payment
                    credentials. InvoKita only uses them to generate payment
                    bills for your invoices. We never store or have access to
                    your bank account's login information.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Invoice Configuration Tab -->
          <div v-if="activeTab === 'invoice_config'" class="p-6 space-y-8">
            <!-- Display Fields Section -->
            <section>
              <h3 class="text-base font-semibold text-slate-900 tracking-tight">
                Invoice Display Fields
              </h3>
              <p class="text-sm text-slate-500 mb-6 font-medium">
                Choose which information you want to include in the "From"
                section of your invoices.
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  v-for="field in [
                    {
                      key: 'invoiceIncludeName',
                      label: 'Full Name',
                      icon: 'solar:user-bold',
                      disabled: true,
                    },
                    {
                      key: 'invoiceIncludeEmail',
                      label: 'Company Email',
                      icon: 'solar:letter-bold',
                      disabled: !profileForm.companyEmail,
                      warning:
                        'Please fill your company email in General settings to enable.',
                    },
                    {
                      key: 'invoiceIncludePersonalPhone',
                      label: 'Personal Phone',
                      icon: 'solar:phone-bold',
                    },
                    {
                      key: 'invoiceIncludeCompanyName',
                      label: 'Company Name',
                      icon: 'solar:buildings-bold',
                      disabled: !profileForm.companyName,
                      warning:
                        'Please fill your company name in General settings to enable.',
                    },
                    {
                      key: 'invoiceIncludeCompanyPhone',
                      label: 'Company Phone',
                      icon: 'solar:phone-calling-bold',
                      disabled: !profileForm.companyPhone,
                      warning:
                        'Please fill your company phone in General settings to enable.',
                    },
                    {
                      key: 'invoiceIncludeAddress',
                      label: 'Business Address',
                      icon: 'solar:map-point-bold',
                      disabled: !profileForm.address,
                      warning:
                        'Please fill your business address in General settings to enable.',
                    },
                  ]"
                  :key="field.key"
                  class="relative flex items-center p-4 border rounded-xl transition-all cursor-pointer group select-none"
                  :class="
                    profileForm[field.key]
                      ? 'border-emerald-600 bg-slate-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  "
                  :style="{
                    cursor: field.disabled ? 'not-allowed' : 'pointer',
                    opacity: field.disabled ? '0.7' : '1',
                  }">
                  <div class="flex items-center gap-3 flex-1">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      :class="
                        profileForm[field.key]
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400 group-hover:text-slate-500'
                      ">
                      <UiIcon :icon="field.icon" class="w-4 h-4" />
                    </div>
                    <div
                      class="text-xs font-semibold transition-colors"
                      :class="
                        profileForm[field.key]
                          ? 'text-slate-900'
                          : 'text-slate-500'
                      ">
                      {{ field.label }}
                      <p
                        v-if="field.disabled && field.warning"
                        class="text-[10px] font-normal text-amber-600 mt-0.5">
                        {{ field.warning }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <div
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                      :class="
                        profileForm[field.key]
                          ? 'bg-emerald-600 border-emerald-600'
                          : 'bg-white border-slate-200'
                      ">
                      <UiIcon
                        v-if="profileForm[field.key]"
                        icon="heroicons:check-16-solid"
                        class="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    v-model="profileForm[field.key]"
                    :disabled="field.disabled"
                    class="sr-only" />
                </label>
              </div>
            </section>

            <div class="h-px bg-slate-100"></div>

            <!-- Automation Section -->
            <section>
              <div class="flex items-center justify-between mb-2">
                <h3
                  class="text-base font-semibold text-slate-900 tracking-tight">
                  Global Automation
                </h3>
                <div class="flex items-center">
                  <button
                    @click="
                      profileForm.globalAutoChaser =
                        !profileForm.globalAutoChaser
                    "
                    type="button"
                    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-offset-2"
                    :class="
                      profileForm.globalAutoChaser
                        ? 'bg-slate-900'
                        : 'bg-slate-200'
                    ">
                    <span
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      :class="
                        profileForm.globalAutoChaser
                          ? 'translate-x-5'
                          : 'translate-x-0'
                      "></span>
                  </button>
                </div>
              </div>
              <p class="text-sm text-slate-500 mb-6 font-medium">
                Enable or disable automated reminders for all clients.
              </p>

              <div
                class="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                <UiIcon
                  icon="heroicons:exclamation-triangle"
                  custom-class="w-5 h-5 text-amber-600 shrink-0" />
                <p class="text-[11px] text-amber-800 leading-relaxed">
                  <strong>Important Notice:</strong> If you switch this OFF,
                  <strong>all auto-chaser reminders</strong> for all clients
                  will be disabled immediately. To disable reminders for a
                  single specific client while keeping others active, please use
                  the toggle in the <strong>Client Table</strong> instead.
                </p>
              </div>

              <!-- Reminder Info Note -->
              <div
                class="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                <UiIcon
                  icon="heroicons:information-circle"
                  custom-class="w-5 h-5 text-blue-600 shrink-0" />
                <p class="text-[11px] text-blue-800 leading-relaxed">
                  <strong>Reminder Intervals:</strong> Note that specific timing
                  intervals for automated messages must be configured in the
                  <button
                    @click="switchTab('email')"
                    class="font-bold underline hover:text-blue-900">
                    Email Configuration
                  </button>
                  or
                  <button
                    @click="switchTab('whatsapp')"
                    class="font-bold underline hover:text-blue-900">
                    WhatsApp Configuration
                  </button>
                  tabs.
                </p>
              </div>
            </section>

            <div class="h-px bg-slate-100"></div>

            <!-- Invoice Defaults Section -->
            <section>
              <h3 class="text-base font-semibold text-slate-900 tracking-tight">
                Invoice Defaults
              </h3>
              <p class="text-sm text-slate-500 mb-6 font-medium">
                Set standard defaults for all new invoices you create.
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
                    >Invoice Number Prefix</label
                  >
                  <input
                    type="text"
                    v-model="profileForm.invoicePrefix"
                    placeholder="e.g. INV"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all uppercase" />
                  <p class="text-[10px] text-slate-500 mt-2">
                    Default prefix for your invoice numbers.
                  </p>
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label
                      class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest"
                      >Default Tax Rate (%)</label
                    >
                  </div>

                  <div>
                    <div class="relative">
                      <input
                        type="number"
                        step="0.01"
                        v-model="profileForm.defaultTaxRate"
                        class="block w-full rounded-md border border-slate-200 pl-3 pr-8 py-2 text-sm font-bold text-slate-900 focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
                      <div
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        %
                      </div>
                    </div>
                    <p class="text-[10px] text-slate-500 mt-2">
                      Automatically apply this percentage to all new invoices.
                    </p>
                  </div>
                </div>
              </div>
            </section>
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
                    class="text-sm font-semibold text-slate-900 leading-none capitalize pt-1">
                    {{ authStore.user?.plan || "Free" }}
                  </h4>
                  <p
                    v-if="
                      activeSubscription &&
                      activeSubscription.status === 'ACTIVE'
                    "
                    class="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                    <UiIcon
                      icon="solar:calendar-date-bold"
                      class="w-3 h-3 text-slate-400" />
                    Renews
                    {{
                      new Date(
                        activeSubscription.subscriptionEnds,
                      ).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div
                  v-if="
                    authStore.user?.plan &&
                    authStore.user?.plan !== 'FREE' &&
                    !isCancelling
                  "
                  class="mr-2">
                  <button
                    @click="updatePlan('FREE')"
                    class="text-[10px] font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider px-3 py-1.5 rounded-lg border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition-all">
                    Cancel Plan
                  </button>
                </div>
                <div
                  class="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded border border-emerald-100 shadow-sm">
                  Active
                </div>
              </div>
            </div>

            <!-- Promo Code Section -->
            <div
              class="mb-8 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <h5 class="text-sm font-bold text-slate-900 mb-3 text-left">
                Have a promo code?
              </h5>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <input
                    v-model="promoCodeInput"
                    type="text"
                    placeholder="Enter code"
                    class="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-slate-900 focus:border-slate-900 uppercase shadow-none outline-none"
                    :disabled="isPromoValid" />
                  <div
                    v-if="promoLoading"
                    class="absolute right-3 top-1/2 -translate-y-1/2">
                    <UiIcon
                      icon="heroicons:arrow-path"
                      class="w-4 h-4 animate-spin text-slate-400" />
                  </div>
                </div>
                <button
                  v-if="!isPromoValid"
                  type="button"
                  @click="validatePromo"
                  :disabled="!promoCodeInput || promoLoading"
                  class="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50">
                  Verify
                </button>
                <button
                  v-else
                  type="button"
                  @click="clearPromo"
                  class="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-100 transition-all">
                  Clear
                </button>
              </div>
              <p
                v-if="promoError"
                class="text-[10px] font-bold text-rose-500 mt-2 ml-1 text-left">
                {{ promoError }}
              </p>
              <p
                v-if="isPromoValid"
                class="text-[10px] font-bold text-emerald-600 mt-2 ml-1 text-left">
                Applied: {{ appliedDiscountText }} discount!
              </p>
            </div>

            <!-- Dynamic Pricing Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
              <div
                v-for="plan in dynamicPlans"
                :key="plan.id"
                :class="[
                  'border rounded-2xl p-8 transition-all shadow-sm flex flex-col',
                  plan.name === 'PRO'
                    ? 'hover:border-emerald-200'
                    : plan.name === 'MAX'
                      ? 'hover:border-indigo-200'
                      : 'hover:border-slate-300',
                  'bg-white',
                ]">
                <div class="mb-8">
                  <div class="flex items-center justify-between mb-2 text-left">
                    <h5
                      class="text-lg font-semibold text-slate-900 uppercase tracking-tight">
                      {{ plan.name }}
                    </h5>
                    <span
                      v-if="authStore.user?.plan === plan.name"
                      class="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-semibold rounded uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                  <p class="text-sm text-slate-500 font-medium text-left">
                    {{ plan.description }}
                  </p>
                </div>
                <div class="mb-8 flex flex-col items-start min-h-[50px]">
                  <div class="flex items-baseline flex-wrap gap-2">
                    <span
                      v-if="
                        isPromoValid &&
                        appliedDiscount &&
                        getDiscountedPrice(plan.price) < plan.price
                      "
                      class="text-2xl font-semibold text-slate-400 line-through tracking-tight">
                      {{ plan.currency }} {{ plan.price }}
                    </span>
                    <span
                      class="text-4xl font-semibold text-slate-900 tracking-tight">
                      {{ plan.currency }}
                      {{
                        isPromoValid
                          ? getDiscountedPrice(plan.price)
                          : plan.price
                      }}
                    </span>
                    <span class="text-slate-400 text-sm font-medium"
                      >/{{ plan.interval }}</span
                    >
                  </div>
                  <p
                    v-if="
                      isPromoValid &&
                      appliedDiscount &&
                      getDiscountedPrice(plan.price) < plan.price
                    "
                    class="text-[10px] text-emerald-600 font-semibold mt-2 tracking-wide text-left">
                    Discount applies to the first subscription term only.
                  </p>
                </div>
                <ul class="space-y-4 mb-8 flex-1 text-left">
                  <li
                    v-for="feature in plan.features"
                    :key="feature"
                    class="flex items-center text-sm font-medium text-slate-600">
                    <UiIcon
                      icon="heroicons:check"
                      :class="[
                        'w-4 h-4 mr-3 shrink-0',
                        plan.name === 'PRO'
                          ? 'text-emerald-600'
                          : plan.name === 'MAX'
                            ? 'text-indigo-500'
                            : 'text-slate-400',
                      ]" />
                    {{ feature }}
                  </li>
                </ul>
                <button
                  @click="
                    updatePlan(
                      authStore.user?.plan === plan.name && plan.name !== 'FREE'
                        ? 'FREE'
                        : plan.name,
                    )
                  "
                  :disabled="
                    (authStore.user?.plan === plan.name &&
                      plan.name === 'FREE') ||
                    (authStore.user?.plan === plan.name && isCancelling) ||
                    (authStore.user?.plan !== 'FREE' &&
                      authStore.user?.plan !== plan.name &&
                      !isCancelling)
                  "
                  class="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border outline-none cursor-pointer"
                  :class="[
                    authStore.user?.plan === plan.name
                      ? plan.name === 'FREE'
                        ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                        : isCancelling
                          ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                          : 'bg-white text-rose-600 border-rose-100 hover:bg-rose-50 hover:border-rose-200'
                      : authStore.user?.plan !== 'FREE' && !isCancelling
                        ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800',
                  ]">
                  <template v-if="authStore.user?.plan === plan.name">
                    <template v-if="plan.name === 'FREE'"
                      >Current Plan</template
                    >
                    <template v-else>
                      {{ isCancelling ? "Downgrade Pending" : "Cancel Plan" }}
                    </template>
                  </template>
                  <template
                    v-else-if="
                      authStore.user?.plan !== 'FREE' && !isCancelling
                    ">
                    Switch Plan
                  </template>
                  <template v-else>
                    {{
                      plan.name === "FREE"
                        ? "Select Free"
                        : `Select ${plan.name}`
                    }}
                  </template>
                </button>
              </div>
            </div>

            <div class="text-center border-t border-slate-100 pt-8">
              <p class="text-sm font-medium text-slate-500">
                Want more power?
                <a
                  href="mailto:contact@invokita.com"
                  class="text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                  >Contact us for enquiry</a
                >
              </p>
            </div>
          </div>

          <!-- Footer Actions -->
          <div
            v-if="activeTab !== 'billing'"
            class="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              @click="saveSettings"
              :disabled="authStore.loading || !isDirty"
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
  </div>
  <UiToast v-model="toast" />
  <PaymentConnectModal
    v-model="connectModal"
    :provider="selectedProvider"
    :existing-data="
      paymentProviders.find((p) => p.provider === selectedProvider) || {}
    "
    @save="saveConnection" />

  <!-- Downgrade Confirmation Modal -->
  <UiModal v-model="isDowngradeModalOpen" maxWidth="md">
    <div class="p-6">
      <div
        class="flex items-center justify-center w-12 h-12 mx-auto bg-rose-50 rounded-full mb-4">
        <UiIcon
          icon="heroicons:exclamation-triangle"
          custom-class="w-6 h-6 text-rose-600" />
      </div>
      <div class="text-center">
        <h3 class="text-lg font-bold text-slate-900">Cancel Plan?</h3>
        <div class="mt-2 text-sm text-slate-500 font-medium leading-relaxed">
          Are you sure you want to cancel your
          <span class="text-slate-900 font-bold uppercase">{{
            authStore.user?.plan
          }}</span>
          subscription?
          <p class="pt-2">
            You will keep
            <span class="text-slate-900 font-bold uppercase">{{
              authStore.user?.plan || "your"
            }}</span>
            benefits until
            <span class="text-slate-900 font-bold">{{
              authStore.user?.subscriptions?.[0]?.subscriptionEnds
                ? new Date(
                    authStore.user.subscriptions[0].subscriptionEnds,
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "the end of your billing cycle"
            }}</span
            >, after which you will move to the FREE plan.
          </p>
        </div>
      </div>
      <div class="mt-6 flex flex-col gap-3">
        <button
          @click="confirmDowngrade"
          :disabled="downgradingPlan"
          class="w-full inline-flex justify-center items-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700 transition-colors disabled:opacity-50">
          <UiIcon
            v-if="downgradingPlan"
            icon="line-md:loading-twotone-loop"
            class="w-4 h-4 mr-2 animate-spin" />
          Yes, Confirm Cancellation
        </button>
        <button
          @click="isDowngradeModalOpen = false"
          class="w-full inline-flex justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors">
          Keep My Current Plan
        </button>
      </div>
    </div>
  </UiModal>

  <!-- Direct Bank Transfer Modal -->
  <UiModal
    v-model="isManualModalOpen"
    maxWidth="lg"
    title="Direct Bank Transfer"
    description="Clients can pay you directly to your bank account. These details will be shown on the invoice if no automated gateway is connected.">
    <div class="p-6">
      <div
        class="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-left">
        <UiIcon
          icon="heroicons:information-circle"
          custom-class="w-5 h-5 text-amber-600 shrink-0" />
        <p class="text-[12px] text-amber-700 leading-normal font-medium">
          <strong>Manual Detection:</strong> We cannot automatically detect
          these payments. You must manually mark invoices as paid once received.
        </p>
      </div>

      <div class="space-y-4">
        <div>
          <label
            class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
            >Bank Name</label
          >
          <input
            v-model="settingsForm.manualBankName"
            type="text"
            placeholder="e.g. Maybank, CIMB"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none transition-all" />
        </div>
        <div>
          <label
            class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
            >Account Number</label
          >
          <input
            v-model="settingsForm.manualAccountNumber"
            type="text"
            placeholder="e.g. 1234 5678 90"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none transition-all" />
        </div>
        <div>
          <label
            class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
            >Account Holder Name</label
          >
          <input
            v-model="settingsForm.manualAccountName"
            type="text"
            placeholder="e.g. John Doe Enterprise"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none transition-all" />
        </div>
        <div>
          <label
            class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
            >Payment QR Code</label
          >
          <div
            class="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 min-h-[140px] flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-all group cursor-pointer overflow-hidden">
            <template v-if="settingsForm.manualQrCode">
              <div class="flex flex-col items-center text-center">
                <div
                  class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                  <UiIcon icon="heroicons:qr-code" custom-class="w-5 h-5" />
                </div>
                <p
                  class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                  QR Detected
                </p>
                <button
                  @click.stop="settingsForm.manualQrCode = ''"
                  class="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest underline">
                  Remove
                </button>
              </div>
            </template>
            <template v-else>
              <UiIcon
                icon="heroicons:cloud-arrow-up"
                custom-class="w-8 h-8 text-slate-300 mb-2 group-hover:text-slate-400 transition-colors" />
              <p class="text-[11px] font-bold text-slate-600 mb-1">
                Upload QR Image
              </p>
              <input
                type="file"
                accept="image/*"
                @change="handleQrUpload"
                class="absolute inset-0 opacity-0 cursor-pointer" />
            </template>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <button
          @click="isManualModalOpen = false"
          class="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg uppercase tracking-widest">
          Done
        </button>
      </div>
    </div>
  </UiModal>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "~/stores/authStore";
import { useUiStore } from "~/stores/uiStore";
import { useSubscribeStore } from "~/stores/subscribeStore";
import jsQR from "jsqr";

const authStore = useAuthStore();
const uiStore = useUiStore();
const subscribeStore = useSubscribeStore();
const route = useRoute();
const router = useRouter();
const { $api } = useNuxtApp();

const useSameEmail = ref(false);
const useSamePhone = ref(false);

const syncEmail = () => {
  if (useSameEmail.value && authStore.user?.email) {
    profileForm.value.companyEmail = authStore.user.email;
  }
};

const syncPhone = () => {
  if (useSamePhone.value && profileForm.value.phoneNumber) {
    profileForm.value.companyPhone = profileForm.value.phoneNumber;
  }
};

const activeSubscription = computed(() => {
  if (!authStore.user?.subscriptions?.length) return null;
  // Since we only take 1 from backend, it's either this one or nothing
  const sub = authStore.user.subscriptions[0];
  if (sub && sub.status === "ACTIVE") return sub;
  return null;
});

const tabs = [
  {
    id: "general",
    name: "General & Profile",
    icon: "heroicons:building-office",
  },
  {
    id: "invoice_config",
    name: "Invoice Configuration",
    icon: "heroicons:document-text",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Configuration",
    icon: "heroicons:chat-bubble-left-right",
  },
  {
    id: "email",
    name: "Email Configuration",
    icon: "heroicons:envelope",
  },
  {
    id: "payments",
    name: "Payments",
    icon: "heroicons:credit-card",
  },

  { id: "billing", name: "Billing", icon: "heroicons:receipt-percent" },
];

const isDowngradeModalOpen = ref(false);
const isManualModalOpen = ref(false);
const downgradingPlan = ref(false);
const pendingPlanUpdate = ref(null);

const currentSub = computed(() => authStore.user?.subscriptions?.[0]);
const isCancelling = computed(() => {
  const sub = currentSub.value;
  if (!sub) return false;
  return (
    sub.cancelAtPeriodEnd ||
    sub.status === "CANCELED" ||
    sub.status === "CANCELLED"
  );
});
const activeTab = ref(route.query.tab || "general");
const toast = ref({ message: "", type: "success" });
const currencyOptions = ref([]);
const dynamicPlans = ref([]);

const fetchPlans = async () => {
  try {
    const { data } = await $api.get("/plans");
    dynamicPlans.value = data;
  } catch (err) {
    console.error("Failed to fetch plans", err);
  }
};

const reminderIntervalOptions = [
  { value: 0, label: "None (Disabled)" },
  { value: -3, label: "3 Days Before Due" },
  { value: 3, label: "Every 3 Days (Aggressive)" },
  { value: 7, label: "Every 7 Days (Standard)" },
  { value: 14, label: "Every 14 Days (Relaxed)" },
];

const fetchCurrencies = async () => {
  try {
    const response = await $api.get("/currencies");
    currencyOptions.value = response.data;
  } catch (err) {
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
  defaultCurrency: "MYR",
  defaultTaxRate: 0,
  reminderInterval: 0,
  invoiceIncludeName: true,
  invoiceIncludeEmail: false,
  invoiceIncludePersonalPhone: false,
  invoiceIncludeCompanyPhone: true,
  invoiceIncludeCompanyName: true,
  invoiceIncludeAddress: true,
  globalAutoChaser: true,
  invoicePrefix: "INV",
});
const settingsForm = ref({
  whatsappSendTemplate: "",
  whatsappReminderTemplate: "",
  whatsappMode: "SYSTEM",
  twilioSid: "",
  twilioAuthToken: "",
  twilioPhoneNumber: "",
  manualBankName: "",
  manualAccountNumber: "",
  manualAccountName: "",
  manualQrCode: "",
  whatsappReminderInterval: 0,
});

const promoCodeInput = ref("");
const isPromoValid = ref(false);
const promoLoading = ref(false);
const promoError = ref("");
const appliedDiscount = ref(null);

const originalProfileForm = ref({});
const originalSettingsForm = ref({});

const isDirty = computed(() => {
  if (
    activeTab.value === "general" ||
    activeTab.value === "email" ||
    activeTab.value === "invoice_config"
  ) {
    return (
      JSON.stringify(profileForm.value) !==
      JSON.stringify(originalProfileForm.value)
    );
  }
  if (activeTab.value === "whatsapp" || activeTab.value === "payments") {
    return (
      JSON.stringify(settingsForm.value) !==
      JSON.stringify(originalSettingsForm.value)
    );
  }
  return false;
});

onMounted(async () => {
  // Handle Xendit payment redirects
  if (route.query.success === "true") {
    toast.value = {
      message: "Payment setup successful! Your plan is active.",
      type: "success",
    };
    const newQuery = { ...route.query };
    delete newQuery.success;
    router.replace({ query: newQuery });
  } else if (route.query.failed === "true") {
    toast.value = {
      message: "Payment setup failed or was cancelled.",
      type: "error",
    };
    const newQuery = { ...route.query };
    delete newQuery.failed;
    router.replace({ query: newQuery });
  }

  fetchCurrencies();
  fetchPlans();
  await authStore.fetchProfile();
  const settings = await authStore.fetchSettings();

  if (authStore.user) {
    profileForm.value = {
      name: authStore.user.name || "",
      phoneNumber: authStore.user.phoneNumber || "",
      defaultCurrency: authStore.user.defaultCurrency || "MYR",
      companyName: settings?.companyName || "",
      companyEmail: settings?.companyEmail || "",
      companyPhone: settings?.companyPhone || "",
      address: settings?.address || "",
      defaultTaxRate: settings?.defaultTaxRate || 0,
      reminderInterval: settings?.reminderInterval || 0,
      invoiceIncludeName: settings?.invoiceIncludeName || false,
      invoiceIncludeEmail: settings?.invoiceIncludeEmail || false,
      invoiceIncludePersonalPhone:
        settings?.invoiceIncludePersonalPhone || false,
      invoiceIncludeCompanyPhone: settings?.invoiceIncludeCompanyPhone || false,
      invoiceIncludeCompanyName: settings?.invoiceIncludeCompanyName || false,
      invoiceIncludeAddress: settings?.invoiceIncludeAddress || false,
      globalAutoChaser: settings?.globalAutoChaser || false,
      invoicePrefix: settings?.invoicePrefix || "INV",
    };

    // Force disable toggles if data is missing
    if (!profileForm.value.address) {
      profileForm.value.invoiceIncludeAddress = false;
    }
    if (!profileForm.value.companyEmail) {
      profileForm.value.invoiceIncludeEmail = false;
    }
    if (!profileForm.value.companyName) {
      profileForm.value.invoiceIncludeCompanyName = false;
    }
    if (!profileForm.value.companyPhone) {
      profileForm.value.invoiceIncludeCompanyPhone = false;
    }

    originalProfileForm.value = JSON.parse(JSON.stringify(profileForm.value));
  }

  if (settings) {
    settingsForm.value.whatsappSendTemplate =
      settings.whatsappSendTemplate || "";
    settingsForm.value.whatsappReminderTemplate =
      settings.whatsappReminderTemplate || "";
    settingsForm.value.whatsappMode = settings.whatsappMode || "SYSTEM";
    settingsForm.value.twilioSid = settings.twilioSid || "";
    settingsForm.value.twilioAuthToken = settings.twilioAuthToken || "";
    settingsForm.value.twilioPhoneNumber = settings.twilioPhoneNumber || "";
    settingsForm.value.whatsappReminderInterval =
      settings.whatsappReminderInterval || 0;
  }

  const paymentSettings = await authStore.fetchPaymentSettings();
  if (paymentSettings) {
    settingsForm.value.manualBankName = paymentSettings.manualBankName || "";
    settingsForm.value.manualAccountNumber =
      paymentSettings.manualAccountNumber || "";
    settingsForm.value.manualAccountName =
      paymentSettings.manualAccountName || "";
    settingsForm.value.manualQrCode = paymentSettings.manualQrCode || "";
  }

  originalSettingsForm.value = JSON.parse(JSON.stringify(settingsForm.value));

  fetchProviders();
});

const paymentProviders = ref([]);
const connectModal = ref(false);
const selectedProvider = ref(null);

const fetchProviders = async () => {
  paymentProviders.value = await authStore.fetchPaymentProviders();
};

const isProviderConnected = (p) => {
  return paymentProviders.value.some((pr) => pr.provider === p);
};

const openConnectModal = (p) => {
  selectedProvider.value = p;
  connectModal.value = true;
};

const handleQrUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        settingsForm.value.manualQrCode = code.data;
        toast.value = {
          message: "QR Code decoded successfully!",
          type: "success",
        };
      } else {
        toast.value = {
          message: "Could not find a valid QR code in the image.",
          type: "error",
        };
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const isProviderPreferred = (p) => {
  return paymentProviders.value.some(
    (pr) => pr.provider === p && pr.isPreferred,
  );
};

const setPreferred = async (p) => {
  try {
    const provider = paymentProviders.value.find((pr) => pr.provider === p);
    if (provider) {
      await authStore.setPreferredPaymentProvider(provider.id);
      await fetchProviders();
      toast.value = {
        message: `${
          p === "TOYYIBPAY" ? "ToyyibPay" : "Billplz"
        } set as preferred`,
        type: "success",
      };
    }
  } catch (err) {
    toast.value = {
      message: "Failed to set preferred provider",
      type: "error",
    };
  }
};

const saveConnection = async (data) => {
  try {
    await authStore.updatePaymentProvider(data);
    await fetchProviders();
    toast.value = {
      message: "Payment provider connected successfully!",
      type: "success",
    };
  } catch (err) {
    toast.value = { message: "Failed to connect provider", type: "error" };
  }
};

const disconnectProvider = async (p) => {
  if (!confirm("Are you sure you want to disconnect this provider?")) return;
  try {
    const provider = paymentProviders.value.find((pr) => pr.provider === p);
    if (provider) {
      await authStore.deletePaymentProvider(provider.id);
      await fetchProviders();
      toast.value = { message: "Provider disconnected", type: "success" };
    }
  } catch (err) {
    toast.value = { message: "Failed to disconnect", type: "error" };
  }
};

const saveSettings = async () => {
  try {
    let res;
    if (
      activeTab.value === "general" ||
      activeTab.value === "email" ||
      activeTab.value === "invoice_config"
    ) {
      res = await authStore.updateProfile(profileForm.value);
      await authStore.updateSettings(profileForm.value);
    } else if (activeTab.value === "whatsapp") {
      res = await authStore.updateSettings(settingsForm.value);
    } else if (activeTab.value === "payments") {
      res = await authStore.updatePaymentSettings(settingsForm.value);
    } else {
      return;
    }
    toast.value = {
      message: res?.message || "Settings saved successfully!",
      type: "success",
    };

    // Update original state to current to reset isDirty
    if (activeTab.value === "general" || activeTab.value === "email") {
      originalProfileForm.value = JSON.parse(JSON.stringify(profileForm.value));
    } else {
      originalSettingsForm.value = JSON.parse(
        JSON.stringify(settingsForm.value),
      );
    }
  } catch (err) {
    toast.value = {
      message:
        err.response?.data?.message ||
        authStore.error ||
        "Failed to save settings",
      type: "error",
    };
  }
};

const validatePromo = async () => {
  if (!promoCodeInput.value) return;
  promoLoading.value = true;
  promoError.value = "";
  try {
    const { data } = await $api.post("/promo/validate", {
      code: promoCodeInput.value,
    });
    appliedDiscount.value = data;
    isPromoValid.value = true;
  } catch (err) {
    promoError.value = err.response?.data?.message || "Invalid promo code";
    isPromoValid.value = false;
  } finally {
    promoLoading.value = false;
  }
};

const clearPromo = () => {
  promoCodeInput.value = "";
  isPromoValid.value = false;
  appliedDiscount.value = null;
  promoError.value = "";
};

const appliedDiscountText = computed(() => {
  if (!appliedDiscount.value) return "";
  const d = appliedDiscount.value;
  return d.discountType === "PERCENTAGE"
    ? `${d.discountValue}%`
    : `${d.discountValue} MYR`;
});

const getDiscountedPrice = (price) => {
  if (!price) return 0;
  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice === 0) return numPrice;
  if (!isPromoValid.value || !appliedDiscount.value) return numPrice;

  const d = appliedDiscount.value;
  let discounted = numPrice;
  if (d.discountType === "PERCENTAGE") {
    discounted = numPrice - numPrice * (d.discountValue / 100);
  } else {
    discounted = numPrice - d.discountValue;
  }
  return Math.max(0, discounted);
};

const updatePlan = async (plan) => {
  // If downgrading to FREE, show the confirmation modal
  if (plan === "FREE" && authStore.user?.plan !== "FREE") {
    pendingPlanUpdate.value = plan;
    isDowngradeModalOpen.value = true;
    return;
  }

  try {
    const res = await subscribeStore.subscribe(
      plan,
      isPromoValid.value ? promoCodeInput.value : null,
    );

    if (res?.checkoutUrl) {
      toast.value = {
        message: "Redirecting to payment gateway...",
        type: "success",
      };
      // Give the toast a moment to show, then redirect
      setTimeout(() => {
        window.location.href = res.checkoutUrl;
      }, 500);
      return;
    }

    // Refetch profile to get new usage limits only if no checkout redirect
    await authStore.fetchProfile();
    toast.value = {
      message: res?.message || `Successfully switched to ${plan} plan!`,
      type: "success",
    };
  } catch (err) {
    toast.value = {
      message:
        err.response?.data?.message ||
        subscribeStore.error ||
        "Failed to update plan",
      type: "error",
    };
  }
};

const confirmDowngrade = async () => {
  if (!pendingPlanUpdate.value) return;
  downgradingPlan.value = true;
  try {
    const res = await subscribeStore.subscribe(pendingPlanUpdate.value, null);
    await authStore.fetchProfile();
    toast.value = {
      message: res?.message || "Successfully downgraded to Free plan",
      type: "success",
    };
    isDowngradeModalOpen.value = false;
  } catch (err) {
    toast.value = {
      message:
        err.response?.data?.message ||
        subscribeStore.error ||
        "Failed to downgrade plan",
      type: "error",
    };
  } finally {
    downgradingPlan.value = false;
    pendingPlanUpdate.value = null;
  }
};
</script>

<style scoped></style>
