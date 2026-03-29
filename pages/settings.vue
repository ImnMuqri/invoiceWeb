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
                class="text-base font-semibold text-slate-900 tracking-tight mb-6">
                User Profile
              </h3>
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
                <label class="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    v-model="useSameAsUser"
                    @change="syncCompanyInfo"
                    class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 w-4 h-4 cursor-pointer" />
                  <span
                    class="text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors"
                    >Use same as user's</span
                  >
                </label>
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
                    >Business Email</label
                  >
                  <input
                    type="email"
                    v-model="profileForm.companyEmail"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
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
                class="text-base font-semibold text-slate-900 tracking-tight mb-2">
                Automated Email Reminders
              </h3>
              <p class="text-sm text-slate-500 mb-6 font-medium">
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
                        <span
                          class="px-1.5 py-0.5 bg-[#fef08a] rounded font-medium text-slate-900"
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
                        INV-0005
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
                      <p>
                        This email was sent via
                        <span
                          class="px-1 py-0.5 bg-[#fef08a] rounded text-slate-700"
                          >InvoKita</span
                        >.
                      </p>
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

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8">
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
                      class="flex-1 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
                      Edit
                    </button>
                    <button
                      @click="disconnectProvider('TOYYIBPAY')"
                      class="px-3 py-2 text-xs font-bold text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all">
                      Disconnect
                    </button>
                  </div>
                  <button
                    v-if="
                      !isProviderPreferred('TOYYIBPAY') &&
                      paymentProviders.length > 1
                    "
                    @click="setPreferred('TOYYIBPAY')"
                    class="w-full mt-3 py-1.5 text-[10px] font-bold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-all uppercase tracking-widest">
                    Set Preferred
                  </button>
                </div>
                <button
                  v-else
                  @click="openConnectModal('TOYYIBPAY')"
                  class="mt-auto w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest">
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
                      class="flex-1 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
                      Edit
                    </button>
                    <button
                      @click="disconnectProvider('BILLPLZ')"
                      class="px-3 py-2 text-xs font-bold text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all">
                      Disconnect
                    </button>
                  </div>
                  <button
                    v-if="
                      !isProviderPreferred('BILLPLZ') &&
                      paymentProviders.length > 1
                    "
                    @click="setPreferred('BILLPLZ')"
                    class="w-full mt-3 py-1.5 text-[10px] font-bold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-all uppercase tracking-widest">
                    Set Preferred
                  </button>
                </div>
                <button
                  v-else
                  @click="openConnectModal('BILLPLZ')"
                  class="mt-auto w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest">
                  Connect
                </button>
              </div>
            </div>

            <div
              class="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div class="flex gap-4">
                <div
                  class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 text-slate-600">
                  <UiIcon
                    name="heroicons:shield-check"
                    custom-class="w-4 h-4" />
                </div>
                <div class="flex-1">
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
                      authStore.user?.subscriptions?.length &&
                      authStore.user.subscriptions[0].status === 'ACTIVE'
                    "
                    class="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                    <UiIcon
                      icon="solar:calendar-date-bold"
                      class="w-3 h-3 text-slate-400" />
                    Renews
                    {{
                      new Date(
                        authStore.user.subscriptions[0].subscriptionEnds,
                      ).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    }}
                  </p>
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
                    >RM 0</span
                  >
                  <span class="text-slate-400 text-sm ml-1 font-medium"
                    >/month</span
                  >
                </div>
                <ul class="space-y-4 mb-8 flex-1">
                  <li
                    v-for="feature in [
                      '5 Invoices/mo',
                      '5 Email Deliveries/mo',
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
                      'No Reminders',
                      'No AI Drafts',
                      'No WhatsApp Features',
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
                    Perfect for freelancers
                  </p>
                </div>
                <div class="mb-8 flex items-baseline">
                  <span
                    class="text-4xl font-semibold text-slate-900 tracking-tight"
                    >RM 59</span
                  >
                  <span class="text-slate-400 text-sm ml-1 font-medium"
                    >/month</span
                  >
                </div>
                <ul class="space-y-4 mb-8 flex-1">
                  <li
                    v-for="feature in [
                      '30 Invoices/mo',
                      '30 WhatsApp Sends & Reminders',
                      '50 Email Deliveries & Reminders',
                      '20 AI Drafts/mo',
                      'Auto-Chaser',
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
                    >RM 99</span
                  >
                  <span class="text-slate-400 text-sm ml-1 font-medium"
                    >/month</span
                  >
                </div>
                <ul class="space-y-4 mb-8 flex-1">
                  <li
                    v-for="feature in [
                      '100 Invoices/mo',
                      '100 WhatsApp Sends & Reminders',
                      '100 Email Deliveries & Reminders',
                      '50 AI Drafts/mo',
                      'Auto-Chaser',
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
    <PaymentConnectModal
      v-model="connectModal"
      :provider="selectedProvider"
      :existing-data="
        paymentProviders.find((p) => p.provider === selectedProvider) || {}
      "
      @save="saveConnection" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "~/stores/authStore";
import { useUiStore } from "~/stores/uiStore";
import { useSubscribeStore } from "~/stores/subscribeStore";

const authStore = useAuthStore();
const uiStore = useUiStore();
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

const activeTab = ref(route.query.tab || "general");
const toast = ref({ message: "", type: "success" });
const currencyOptions = ref([]);

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
  name: "",
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  address: "",
  phoneNumber: "",
  defaultCurrency: "MYR",
  reminderInterval: 0,
});

const useSameAsUser = ref(false);
const syncCompanyInfo = () => {
  if (useSameAsUser.value) {
    profileForm.value.companyName =
      profileForm.value.name || authStore.user?.name || "";
    profileForm.value.companyEmail = authStore.user?.email || "";
    profileForm.value.companyPhone = profileForm.value.phoneNumber || "";
  }
};

const settingsForm = ref({
  whatsappSendTemplate: "",
  whatsappReminderTemplate: "",
  whatsappMode: "SYSTEM",
  twilioSid: "",
  twilioAuthToken: "",
  twilioPhoneNumber: "",
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
  await authStore.fetchProfile();
  if (authStore.user) {
    profileForm.value = {
      name: authStore.user.name || "",
      companyName: authStore.user.companyName || "",
      companyEmail: authStore.user.companyEmail || "",
      companyPhone: authStore.user.companyPhone || "",
      address: authStore.user.address || "",
      phoneNumber: authStore.user.phoneNumber || "",
      defaultCurrency: authStore.user.defaultCurrency || "MYR",
      reminderInterval: authStore.user.reminderInterval || 3,
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
    if (activeTab.value === "general" || activeTab.value === "email") {
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
      message:
        err.response?.data?.message ||
        authStore.error ||
        "Failed to save settings",
      type: "error",
    };
  }
};

const updatePlan = async (plan) => {
  try {
    const res = await subscribeStore.subscribe(plan);

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
</script>

<style scoped></style>
