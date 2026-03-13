<template>
  <div
    class="flex flex-col xl:flex-row gap-6 xl:h-[calc(110vh-4rem)] w-full pb-0 relative">
    <!-- Left Column (Form) block -->
    <div
      class="w-full xl:w-1/2 flex-shrink-0 bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden min-h-[600px] xl:min-h-0">
      <!-- Page Header -->
      <div class="px-4 sm:px-6 pt-6 pb-4 border-b border-slate-200">
        <h1
          class="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
          Create Invoice
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Generate a new invoice manually or with AI.
        </p>
      </div>

      <!-- Input Mode Tabs -->
      <div
        class="flex flex-wrap border-b border-slate-200 bg-slate-50/50 px-4 sm:px-6 pt-3 gap-4 sm:gap-6">
        <button
          type="button"
          @click="inputMode = 'manual'"
          class="pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2"
          :class="
            inputMode === 'manual'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          ">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Manual Entry
        </button>
        <button
          type="button"
          @click="inputMode = 'ai'"
          class="pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2"
          :class="
            inputMode === 'ai'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          ">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          AI Builder Chat
        </button>
      </div>

      <!-- AI Chat Interface (replaces form when active) -->
      <div
        v-if="inputMode === 'ai'"
        class="flex-1 flex flex-col bg-slate-50 overflow-hidden relative min-h-0">
        <!-- Clear Chat Action -->
        <div
          class="absolute top-4 right-4 z-10"
          v-if="chatHistory.length > 0 && userPlan !== 'Basic'">
          <button
            @click="clearChat"
            type="button"
            class="text-xs font-medium text-slate-500 hover:text-red-600 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors">
            <svg
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Clear Chat
          </button>
        </div>

        <!-- Premium Lock Screen Overlay -->
        <div
          v-if="!authStore.isPro"
          class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm p-6 text-center">
          <div
            class="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 text-slate-400">
            <UiIcon icon="heroicons:lock-closed" class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-semibold text-slate-900 mb-2">
            AI Builder is a Premium Feature
          </h3>
          <p class="text-slate-600 mb-8 max-w-sm">
            Upgrade to the Pro or Max plan to generate complete, accurate
            invoices instantly using natural language commands.
          </p>
          <button
            type="button"
            @click="$router.push('/settings')"
            class="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors">
            Upgrade Plan
          </button>
        </div>

        <!-- Form Content -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0 space-y-8">
          <!-- General Details -->
          <!-- Initial greeting -->
          <div class="flex items-start gap-3">
            <div
              class="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <svg
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
              </svg>
            </div>
            <div
              class="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-700 leading-relaxed max-w-[85%] shadow-sm">
              Hi! I can help you draft this invoice instantly. Try typing:
              <br /><br />
              <span class="text-emerald-600 font-medium italic"
                >"create invoice for Wayne, software RM1200"</span
              ><br />
              <span class="text-emerald-600 font-medium italic mt-1 block"
                >"due on 15 Nov, currency USD, subject: Web Design"</span
              >
            </div>
          </div>

          <!-- Dynamic Messages -->
          <div
            v-for="(msg, index) in chatHistory"
            :key="index"
            class="flex items-start gap-3"
            :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
            <div
              v-if="msg.role === 'ai'"
              class="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <svg
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
              </svg>
            </div>
            <div
              :class="
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm'
              "
              class="px-4 py-3 leading-relaxed max-w-[85%] break-words shadow-sm mt-1">
              <!-- Use v-html for basic bold rendering -->
              <span
                v-html="
                  msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                "></span>
            </div>
          </div>

          <div v-if="isAiTyping" class="flex items-start gap-3">
            <div
              class="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <UiIcon
                icon="heroicons:arrow-path"
                custom-class="w-4 h-4 text-white animate-spin" />
            </div>
            <div
              class="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-500 shadow-sm mt-1">
              Drafting...
            </div>
          </div>
        </div>

        <!-- Chat Input Area -->
        <div class="p-4 bg-white border-t border-slate-200">
          <form @submit.prevent="handleChatSubmit" class="relative group">
            <input
              v-model="chatInput"
              type="text"
              placeholder="Message AI Builder..."
              :disabled="userPlan === 'Basic'"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
            <button
              type="submit"
              :disabled="!chatInput.trim() || userPlan === 'Basic'"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white transition-colors"
              :class="
                chatInput.trim() && userPlan !== 'Basic'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-300 cursor-not-allowed'
              ">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </form>
        </div>
      </div>

      <!-- Manual Form -->
      <div
        v-show="inputMode === 'manual'"
        class="flex-1 overflow-y-auto px-8 py-6">
        <form class="space-y-8" @submit.prevent="submitInvoice">
          <!-- Invoice Details Section -->
          <section>
            <h2
              class="text-xl font-semibold text-slate-900 mb-6 tracking-tight">
              Invoice Details
            </h2>
            <div class="space-y-6">
              <!-- People Input (Placeholder for styling) -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2"
                  >People <span class="text-red-500">*</span></label
                >
                <div
                  v-if="!showManualClient"
                  class="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white shadow-sm gap-4">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-500 font-semibold">
                      <template v-if="selectedClient">
                        {{ selectedClient.name.charAt(0) }}
                      </template>
                      <template v-else>
                        <svg
                          class="w-full h-full text-slate-400"
                          fill="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </template>
                    </div>
                    <div class="flex-1 min-w-0">
                      <UiSelect
                        v-model="form.clientId"
                        :options="clientOptions"
                        placeholder="Select Client"
                        custom-class="!border-none !p-0 !shadow-none !ring-0 w-full !pl-3" />
                      <div class="text-xs text-slate-500 truncate px-3">
                        {{ selectedClient?.email || "No email set" }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Manual Input Fields -->
                <div
                  v-else
                  class="space-y-4 p-4 border border-emerald-100 rounded-lg bg-emerald-50/30">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                      <label
                        class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                        >Name</label
                      >
                      <input
                        v-model="manualClient.name"
                        type="text"
                        placeholder="Client Name"
                        class="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none" />
                    </div>
                    <div>
                      <label
                        class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                        >Email</label
                      >
                      <input
                        v-model="manualClient.email"
                        type="email"
                        placeholder="Email"
                        class="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none" />
                    </div>
                    <div>
                      <label
                        class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                        >Phone</label
                      >
                      <input
                        v-model="manualClient.phone"
                        type="text"
                        placeholder="Phone"
                        class="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none" />
                    </div>
                    <div class="col-span-2">
                      <label
                        class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                        >Company (Optional)</label
                      >
                      <input
                        v-model="manualClient.company"
                        type="text"
                        placeholder="Company Name"
                        class="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 outline-none" />
                    </div>
                    <div class="col-span-2">
                      <label
                        class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                        >Address</label
                      >
                      <textarea
                        v-model="manualClient.address"
                        rows="2"
                        placeholder="Address"
                        class="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                    </div>
                  </div>
                </div>

                <!-- Toggle Button -->
                <button
                  type="button"
                  @click="showManualClient = !showManualClient"
                  class="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1 uppercase tracking-wider">
                  {{
                    showManualClient
                      ? "← Select Existing Client"
                      : "+ Add New Client Instead"
                  }}
                </button>
              </div>

              <!-- Invoice Name Input -->
              <div>
                <label
                  for="invoice-name"
                  class="block text-sm font-medium text-slate-700 mb-2"
                  >Invoice Name</label
                >
                <input
                  type="text"
                  id="invoice-name"
                  v-model="form.invoiceName"
                  placeholder="e.g. Website Overhaul"
                  class="w-full border border-slate-200 rounded-md px-3 py-2 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-950 transition-colors shadow-sm text-slate-900 font-medium text-sm" />
              </div>

              <!-- Subject Input -->
              <div>
                <label
                  for="subject"
                  class="block text-sm font-medium text-slate-700 mb-2"
                  >Subject</label
                >
                <input
                  type="text"
                  id="subject"
                  v-model="form.subject"
                  placeholder="e.g. Service per June 2023"
                  class="w-full border border-slate-200 rounded-md px-3 py-2 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-950 transition-colors shadow-sm text-slate-900 font-medium text-sm" />
              </div>

              <UiDatePicker v-model="form.dueDate" label="Due date" />

              <UiSelect
                v-model="form.currency"
                label="Currency"
                :options="currencyOptions"
                placeholder="Select Currency" />

              <UiSelect
                v-model="form.status"
                label="Status"
                :options="[
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Paid', value: 'Paid' },
                  { label: 'Overdue', value: 'Overdue' },
                ]"
                placeholder="Select Status" />

              <!-- Theme Selection -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-3"
                  >Invoice Theme</label
                >
                <div class="grid grid-cols-3 gap-3">
                  <button
                    v-for="theme in ['professional', 'modern']"
                    :key="theme"
                    type="button"
                    @click="form.template = theme"
                    class="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all group"
                    :class="
                      form.template === theme
                        ? 'border-slate-900 bg-slate-950/5'
                        : 'border-slate-100 hover:border-slate-200'
                    ">
                    <div
                      class="w-full aspect-[4/5] rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center relative">
                      <!-- Visual indicators for themes -->
                      <div
                        v-if="theme === 'professional'"
                        class="p-2 w-full h-full flex flex-col gap-1">
                        <div
                          class="h-1.5 w-1/2 bg-slate-200 rounded-full"></div>
                        <div class="h-1 w-full bg-slate-100 rounded-full"></div>
                        <div class="mt-2 h-1 w-full bg-slate-50"></div>
                        <div class="h-1 w-full bg-slate-50"></div>
                        <div class="mt-auto h-2 w-full bg-slate-100"></div>
                      </div>
                      <div
                        v-else-if="theme === 'modern'"
                        class="flex w-full h-full">
                        <div class="w-1/3 bg-slate-800 h-full"></div>
                        <div class="flex-1 p-2 flex flex-col gap-1">
                          <div
                            class="h-1.5 w-full bg-slate-200 rounded-full"></div>
                          <div
                            class="h-1 w-2/3 bg-slate-100 rounded-full"></div>
                          <div class="mt-2 h-1 w-full bg-slate-50"></div>
                        </div>
                      </div>
                      <!-- Active Check -->
                      <div
                        v-if="form.template === theme"
                        class="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
                        <div
                          class="bg-slate-900 text-white rounded-full p-1 shadow-lg">
                          <UiIcon icon="heroicons:check" class="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                    <span
                      class="text-[10px] font-semibold uppercase tracking-widest text-slate-500"
                      :class="form.template === theme ? 'text-slate-900' : ''"
                      >{{ theme }}</span
                    >
                  </button>
                </div>
              </div>
            </div>
          </section>

          <hr class="border-gray-100" />

          <!-- Product Section -->
          <section>
            <h2
              class="text-xl font-semibold text-slate-900 mb-6 tracking-tight">
              Product
            </h2>

            <!-- Line Items Header -->
            <div
              class="hidden sm:flex items-center text-xs font-semibold text-slate-500 mb-2 px-1 uppercase tracking-wider">
              <div class="flex-1">Item</div>
              <div class="w-20 text-center">
                Qty <span class="text-red-500">*</span>
              </div>
              <div class="w-10"></div>
            </div>

            <!-- Line Items List -->
            <div class="space-y-3">
              <div
                v-for="(item, index) in form.lineItems"
                :key="index"
                class="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white shadow-sm relative">
                <!-- Item Info -->
                <div class="flex-1 flex items-center gap-3 w-full sm:w-auto">
                  <div
                    class="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-200 hidden sm:flex">
                    <svg
                      class="w-5 h-5 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  </div>
                  <div class="flex flex-col gap-1 w-full relative group/input">
                    <!-- Mobile label -->
                    <span
                      class="sm:hidden text-[10px] font-semibold text-slate-400 uppercase tracking-wider"
                      >Product Description</span
                    >
                    <input
                      type="text"
                      v-model="item.name"
                      class="text-sm font-semibold text-slate-900 bg-transparent outline-none w-full p-0 border-none focus:ring-0 cursor-text"
                      placeholder="Item name" />
                    <input
                      type="text"
                      v-model="item.priceStr"
                      @input="updatePriceNum(item)"
                      class="text-xs text-slate-500 bg-transparent outline-none w-full p-0 border-none focus:ring-0 cursor-text"
                      placeholder="Price (e.g. 1,200)" />
                  </div>
                </div>

                <div
                  class="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <!-- Qty -->
                  <div class="w-20 flex-shrink-0">
                    <!-- Mobile label -->
                    <span
                      class="sm:hidden text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block"
                      >Qty</span
                    >
                    <input
                      type="number"
                      v-model.number="item.qty"
                      min="1"
                      class="w-full text-center text-sm font-medium text-slate-900 rounded-md border border-slate-200 py-2 px-2 outline-none focus:ring-2 focus:ring-slate-950 transition-colors shadow-sm" />
                  </div>
                </div>

                <!-- Delete -->
                <div
                  class="absolute sm:relative top-2 right-2 sm:top-0 sm:right-0 w-8 sm:w-10 flex items-center justify-center sm:p-2.5">
                  <button
                    type="button"
                    @click="removeLineItem(index)"
                    class="text-slate-300 hover:text-red-500 transition-colors rounded p-1 sm:p-0 bg-white">
                    <svg
                      class="w-5 h-5 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Add New Line Button -->
            <button
              type="button"
              @click="addLineItem"
              class="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors px-1 py-2 rounded-md hover:bg-emerald-50">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add New Line
            </button>

            <div class="mt-8 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <label
                    for="add-discount"
                    class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="add-discount"
                      v-model="form.addDiscount"
                      class="sr-only peer" />
                    <div
                      class="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-950 peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                  </label>
                  <label
                    for="add-discount"
                    class="text-sm font-medium text-slate-700 cursor-pointer"
                    >Add Discount</label
                  >
                </div>
                <div v-if="form.addDiscount" class="flex items-center gap-2">
                  <input
                    v-model.number="form.discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    class="w-20 border border-slate-200 rounded-md px-2 py-1 text-sm text-right focus:ring-2 focus:ring-slate-950 outline-none" />
                  <span class="text-sm font-medium text-slate-500">%</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Bottom padding for scroll -->
          <div class="h-10"></div>
        </form>
      </div>

      <!-- Action Footer -->
      <div
        class="p-4 border-t border-slate-200 flex items-center justify-between bg-white z-10 flex-shrink-0">
        <div class="text-xs font-medium text-slate-500 tracking-wide">
          Last saved: Today at 4:30 PM
        </div>
        <div class="flex items-center gap-4">
          <button
            type="button"
            @click="$router.push('/invoices')"
            class="text-sm font-medium text-slate-900 hover:text-slate-600 hover:underline underline-offset-4 transition-all px-2 py-1">
            Cancel
          </button>
          <button
            type="submit"
            @click="submitInvoice"
            class="inline-flex items-center gap-2 justify-center rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-medium text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-colors">
            Process Invoice
          </button>
        </div>
      </div>
    </div>

    <!-- Right Column (Preview) -->
    <div class="flex-1 bg-slate-50 relative overflow-y-auto rounded-xl">
      <div class="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <!-- Preview Header Actions -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              type="button"
              class="w-10 h-10 rounded-md bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-semibold text-slate-900 tracking-tight">
                Preview
              </h2>
              <button type="button" class="text-slate-400 hover:text-slate-600">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Preview Output Actions -->
          <div
            v-if="!showActionButtons"
            class="flex items-center gap-3 text-sm font-medium">
            <button
              class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white shadow-sm border border-slate-200 text-slate-900 opacity-50 cursor-not-allowed">
              <svg
                class="w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              PDF
            </button>
            <button
              class="flex items-center gap-2 px-3 py-1.5 rounded-md text-slate-700 opacity-50 cursor-not-allowed border border-transparent">
              <svg
                class="w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Email
            </button>
          </div>
          <div
            v-else
            class="flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-500">
            <button
              @click="downloadInvoice"
              class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors">
              <UiIcon icon="heroicons:arrow-down-tray" class="w-4 h-4" />
              Download PDF
            </button>
            <div class="relative group">
              <button
                @click="emailInvoice"
                :disabled="isSending || !authStore.isPro"
                class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white shadow-sm border border-slate-200 text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :title="
                  !authStore.isPro
                    ? 'Upgrade to Pro to email invoices'
                    : 'Email client'
                ">
                <UiIcon
                  v-if="!isSending"
                  icon="heroicons:envelope"
                  class="w-4 h-4 text-slate-500" />
                <UiIcon
                  v-else
                  icon="heroicons:arrow-path"
                  custom-class="w-4 h-4 animate-spin text-slate-500" />
                <span :class="{ 'opacity-50': !authStore.isPro }"
                  >Email client</span
                >
                <UiIcon
                  v-if="!authStore.isPro"
                  icon="heroicons:lock-closed"
                  class="w-3 h-3 text-slate-400 ml-1" />
              </button>
            </div>
            <div class="relative group">
              <button
                @click="whatsappInvoice"
                :disabled="!authStore.isPro"
                class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#25D366] text-white shadow-sm hover:bg-[#128C7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :title="
                  !authStore.isPro
                    ? 'Upgrade to Pro to send via WhatsApp'
                    : 'WhatsApp'
                ">
                <UiIcon icon="simple-icons:whatsapp" class="w-4 h-4" />
                <span :class="{ 'opacity-50': !authStore.isPro }"
                  >WhatsApp</span
                >
                <UiIcon
                  v-if="!authStore.isPro"
                  icon="heroicons:lock-closed"
                  class="w-3 h-3 text-white/70 ml-1" />
              </button>
            </div>
          </div>
        </div>

        <!-- The Invoice Paper -->
        <div class="relative mt-6 group">
          <div
            v-if="isProcessing"
            class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl transition-all duration-300">
            <div
              class="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
            <p
              class="text-lg font-semibold text-slate-900 tracking-tight animate-pulse">
              {{ processingStatus }}
            </p>
            <p class="text-sm text-slate-500 mt-1">
              Preparing your bill precisely...
            </p>
          </div>

          <!-- Success Badge -->
          <div
            v-if="processingComplete"
            class="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl animate-in zoom-in fade-in duration-500">
            <div
              class="w-16 h-16 rounded-full bg-emerald-100 border-4 border-white shadow-xl flex items-center justify-center mb-4">
              <UiIcon
                icon="heroicons:check-badge"
                customClass="w-8 h-8 text-emerald-600" />
            </div>
            <h3 class="text-xl font-semibold text-slate-900">
              Invoice Processed!
            </h3>
            <p class="text-sm text-slate-500 mt-1">
              Your invoice is ready for delivery.
            </p>
            <button
              @click="processingComplete = false"
              class="mt-6 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
              Dismiss
            </button>
          </div>

          <div
            class="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[800px] flex flex-col transition-all duration-700 overflow-hidden"
            :class="{
              'scale-95 opacity-50 blur-sm grayscale':
                isProcessing || processingComplete,
            }">
            <!-- PREVIEW: PROFESSIONAL THEME -->
            <template v-if="form.template === 'professional'">
              <div
                class="p-12 flex flex-col min-h-[900px] relative pb-20 font-inter">
                <div class="flex justify-between items-start mb-12">
                  <div>
                    <h1
                      class="text-3xl font-semibold text-slate-900 tracking-tight mb-1">
                      INVOICE
                    </h1>
                    <p class="text-lg text-slate-500">{{ form.invoiceName }}</p>
                  </div>
                  <div class="text-right">
                    <div
                      class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                      Invoice Number
                    </div>
                    <div class="text-xl font-semibold text-slate-900">
                      {{ form.invoiceNumber || "0000" }}
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-y-10 gap-x-12 mb-12">
                  <div>
                    <div
                      class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">
                      Billed To
                    </div>
                    <div class="text-sm font-semibold text-slate-900">
                      {{
                        showManualClient
                          ? manualClient.name || "Client Name"
                          : selectedClient?.name || "Select Client"
                      }}
                    </div>

                    <div
                      class="text-sm text-slate-500 mt-1 whitespace-pre-line">
                      <p
                        v-if="
                          showManualClient
                            ? manualClient.company
                            : selectedClient?.company
                        "
                        class="font-medium text-slate-700">
                        {{
                          showManualClient
                            ? manualClient.company
                            : selectedClient?.company
                        }}
                      </p>
                      {{
                        showManualClient
                          ? manualClient.email
                          : selectedClient?.email
                      }}
                      <p>
                        {{
                          showManualClient
                            ? manualClient.address
                            : selectedClient?.address
                        }}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div
                      class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">
                      From
                    </div>

                    <div class="text-sm font-semibold text-slate-900">
                      {{
                        form.from.name || form.from.companyName || "Our Company"
                      }}
                    </div>
                    <div
                      class="text-sm text-slate-500 mt-1 whitespace-pre-line">
                      <p
                        v-if="
                          form.from.companyName &&
                          form.from.name &&
                          form.from.companyName !== form.from.name
                        "
                        class="font-medium text-slate-700">
                        {{ form.from.companyName }}
                      </p>
                      {{ form.from.companyEmail }}
                      <p>{{ form.from.companyAddress }}</p>
                    </div>
                  </div>
                  <div>
                    <div
                      class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">
                      Dates
                    </div>
                    <div class="flex flex-col gap-1">
                      <div class="flex justify-between text-xs">
                        <span class="text-slate-500">Issued:</span
                        ><span class="font-semibold text-slate-900">{{
                          new Date().toLocaleDateString()
                        }}</span>
                      </div>
                      <div class="flex justify-between text-xs">
                        <span class="text-slate-500">Due:</span
                        ><span class="font-semibold text-slate-900">{{
                          form.dueDate || "No date set"
                        }}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div
                      class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">
                      Details
                    </div>
                    <div class="flex flex-col gap-1 text-xs">
                      <div class="flex justify-between font-semibold">
                        <span class="text-slate-500">Subject:</span
                        ><span class="text-slate-900 ml-2 font-semibold">{{
                          form.subject || "N/A"
                        }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-500">Currency:</span
                        ><span class="text-slate-900 font-semibold">{{
                          form.currency
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex-1 mt-4">
                  <div
                    class="flex items-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-900 pb-2">
                    <div class="flex-[3]">Description</div>
                    <div class="w-20 text-center">Qty</div>
                    <div class="w-32 text-right">Unit Price</div>
                    <div class="w-32 text-right">Amount</div>
                  </div>
                  <div class="space-y-4">
                    <div
                      v-for="(item, idx) in form.lineItems"
                      :key="idx"
                      class="flex items-center text-sm py-1 border-b border-slate-50 last:border-0 pb-3">
                      <div class="flex-[3] flex items-center gap-3">
                        <div
                          class="w-6 h-6 rounded bg-teal-50 flex items-center justify-center border border-teal-100 flex-shrink-0">
                          <UiIcon
                            icon="heroicons:cube"
                            class="w-4 h-4 text-teal-600" />
                        </div>
                        <span class="font-semibold text-slate-900">{{
                          item.name || "Unnamed Item"
                        }}</span>
                      </div>
                      <div class="w-20 text-center font-medium text-slate-700">
                        {{ item.qty }}
                      </div>
                      <div class="w-32 text-right font-medium text-slate-700">
                        {{ item.priceNum.toLocaleString() }} {{ form.currency }}
                      </div>
                      <div class="w-32 text-right font-semibold text-slate-900">
                        {{ (item.priceNum * item.qty).toLocaleString() }}
                        {{ form.currency }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="mt-12 border-t border-slate-200 pt-6 flex justify-end">
                    <div class="w-72 space-y-3">
                      <div class="flex justify-between text-sm">
                        <span class="font-medium text-slate-500">Subtotal</span
                        ><span class="font-semibold text-slate-900"
                          >{{ calculateSubtotal().toLocaleString() }}
                          {{ form.currency }}</span
                        >
                      </div>
                      <div
                        v-if="form.addDiscount"
                        class="flex justify-between text-sm text-red-600 font-semibold">
                        <span>Discount</span
                        ><span
                          >-{{ calculateDiscount().toLocaleString() }}
                          {{ form.currency }}</span
                        >
                      </div>
                      <div
                        class="flex justify-between text-base pt-4 border-t border-slate-900 font-semibold">
                        <span class="text-slate-900">Amount Due</span
                        ><span class="text-slate-900"
                          >{{ calculateTotal().toLocaleString() }}
                          {{ form.currency }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Footer Branding -->
                  <div
                    class="mt-10 pt-6 border-t border-slate-100 flex justify-end text-end opacity-50">
                    <div
                      class="text-[8px] text-slate-400 font-medium uppercase tracking-[0.2em]">
                      Generated by <UiLogo class="h-4 grayscale"></UiLogo>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- PREVIEW: MODERN THEME -->
            <template v-else-if="form.template === 'modern'">
              <div class="flex flex-col bg-slate-50 overflow-hidden">
                <!-- Modern Header Preview -->
                <div
                  class="bg-slate-900 text-white p-8 relative overflow-hidden">
                  <div
                    class="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                  <div class="relative z-10 flex justify-between items-start">
                    <div>
                      <UiLogo class="h-6 mb-6 brightness-0 invert opacity-90" />
                      <h1
                        class="text-2xl font-extrabold tracking-tight text-white mb-1">
                        {{ form.invoiceName || "New Project" }}
                      </h1>
                      <div class="flex items-center gap-2 text-[10px]">
                        <span class="text-slate-400 font-medium"
                          >#{{ form.invoiceNumber || "0000" }}</span
                        >
                        <span class="w-1 h-1 bg-slate-600 rounded-full"></span>
                        <span
                          class="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-400 font-bold uppercase tracking-wider rounded border border-emerald-600/20">
                          {{ form.status }}
                        </span>
                      </div>
                    </div>
                    <div class="text-right">
                      <div
                        class="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Amount Due
                      </div>
                      <div class="text-2xl font-black text-emerald-400">
                        {{ form.currency }}
                        {{ calculateTotal().toLocaleString() }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="p-8 flex flex-col flex-1 bg-white">
                  <!-- Multi-column info -->
                  <div class="grid grid-cols-2 gap-8 mb-10">
                    <div>
                      <div
                        class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">
                        From
                      </div>
                      <div class="text-xs font-bold text-slate-900">
                        {{
                          form.from.name ||
                          form.from.companyName ||
                          "Our Company"
                        }}
                      </div>
                      <div
                        class="text-[10px] text-slate-500 mt-1 whitespace-pre-line leading-relaxed">
                        <p
                          v-if="
                            form.from.companyName &&
                            form.from.name &&
                            form.from.companyName !== form.from.name
                          "
                          class="font-medium text-slate-700">
                          {{ form.from.companyName }}
                        </p>
                        {{ form.from.companyEmail }}
                        <p>{{ form.from.companyAddress }}</p>
                      </div>
                    </div>
                    <div>
                      <div
                        class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">
                        Billed To
                      </div>
                      <div class="text-xs font-bold text-slate-900">
                        {{
                          showManualClient
                            ? manualClient.name
                            : selectedClient?.name || "Client Name"
                        }}
                      </div>
                      <div
                        class="text-[10px] text-slate-500 mt-1 whitespace-pre-line leading-relaxed">
                        {{
                          showManualClient
                            ? manualClient.email
                            : selectedClient?.email
                        }}
                        <p>
                          {{
                            showManualClient
                              ? manualClient.address
                              : selectedClient?.address
                          }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-3 gap-4 mb-10 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div
                        class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Issued Date
                      </div>
                      <div class="text-xs font-bold text-slate-900">
                        {{ new Date().toLocaleDateString() }}
                      </div>
                    </div>
                    <div>
                      <div
                        class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Due Date
                      </div>
                      <div class="text-xs font-bold text-emerald-600">
                        {{ form.dueDate || "N/A" }}
                      </div>
                    </div>
                    <div>
                      <div
                        class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Subject
                      </div>
                      <div class="text-xs font-bold text-slate-900 truncate">
                        {{ form.subject || "N/A" }}
                      </div>
                    </div>
                  </div>

                  <!-- Table -->
                  <div class="flex-1">
                    <table class="w-full text-left">
                      <thead>
                        <tr class="border-b border-slate-100">
                          <th
                            class="pb-3 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                            Description
                          </th>
                          <th
                            class="pb-3 text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center w-12">
                            Qty
                          </th>
                          <th
                            class="pb-3 text-[8px] font-bold text-slate-400 uppercase tracking-widest text-right">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-50">
                        <tr v-for="(item, idx) in form.lineItems" :key="idx">
                          <td class="py-4">
                            <div class="text-xs font-bold text-slate-900">
                              {{ item.name || "Item" }}
                            </div>
                          </td>
                          <td class="py-4 text-center text-xs text-slate-600">
                            {{ item.qty }}
                          </td>
                          <td
                            class="py-4 text-right text-xs font-black text-slate-900">
                            {{ (item.priceNum * item.qty).toLocaleString() }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Summary -->
                  <div
                    class="mt-8 pt-8 border-t-2 border-slate-900 flex justify-end">
                    <div class="w-48 space-y-2">
                      <div class="flex justify-between text-[10px]">
                        <span class="text-slate-500 uppercase font-black"
                          >Total Due</span
                        >
                        <span class="font-black text-slate-900 text-sm"
                          >{{ calculateTotal().toLocaleString() }}
                          {{ form.currency }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <div
                    class="mt-16 pt-8 border-t border-slate-100 flex justify-end items-center">
                    <div
                      class="text-[10px] text-right text-slate-400 font-medium uppercase tracking-widest">
                      Generated by <UiLogo class="h-6 opacity-30 grayscale" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <UiToast v-model="toast" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick, toRaw } from "vue";
import { useRouter } from "vue-router";
import { useInvoiceStore } from "~/stores/invoiceStore";
import { useClientStore } from "~/stores/clientStore";
import { useAuthStore } from "~/stores/authStore";
import { formatDate } from "~/utils/date";

const router = useRouter();

const invoiceStore = useInvoiceStore();
const clientStore = useClientStore();
const authStore = useAuthStore();
const toast = ref({ message: "", type: "success" });
const { $api } = useNuxtApp();

onMounted(async () => {
  fetchCurrencies();
  clientStore.fetchClients();

  // Populate "From" info from user profile
  if (authStore.user) {
    form.value.from = {
      name: authStore.user.name || "",
      companyName: authStore.user.companyName || "",
      companyEmail: authStore.user.companyEmail || authStore.user.email || "",
      companyAddress: authStore.user.address || "",
    };
  }
});

const userPlan = ref("Basic"); // Mock plan state for UI demo
const showAiPreview = ref(false);
const showManualClient = ref(false);
const manualClient = ref({
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
});

const showActionButtons = ref(false);
const lastInvoiceId = ref(null);
const processingStatus = ref("Preparing Invoice...");
const isProcessing = ref(false);
const processingComplete = ref(false);

const form = ref({
  clientId: "",
  invoiceName: "Website Overhaul",
  subject: "Service per June 2023",
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  currency: "MYR",
  addDiscount: false,
  discountPercentage: 0,
  status: "Pending",
  from: {
    companyName: "Acme Inc.",
    companyEmail: "billing@acme.com",
    companyAddress: "123 Business St, Suite 100\nNew York, NY 10001",
  },
  template: "professional",
  lineItems: [
    {
      name: "Summer 2K23 T-shirt",
      priceStr: "125,000",
      priceNum: 125000,
      qty: 1,
    },
  ],
});

const selectedClient = computed(() => {
  return clientStore.clients.find((c) => c.id === form.value.clientId);
});

const clientOptions = computed(() => {
  return clientStore.clients.map((c) => ({
    label: `${c.name} (${c.company || "Personal"})`,
    value: c.id,
  }));
});

// UI State
const inputMode = ref("manual");

// AI Chat Logic
const chatInput = ref("");
const isAiTyping = ref(false);
const chatHistory = ref([]);
const chatContainer = ref(null);
const currencyOptions = ref([]);

const fetchCurrencies = async () => {
  try {
    const response = await $api.get("/currencies");
    currencyOptions.value = response.data;
  } catch (err) {
    console.error("Failed to fetch currencies:", err);
    currencyOptions.value = [
      { value: "MYR", label: "MYR (RM)" },
      { value: "USD", label: "USD ($)" },
    ];
  }
};

const clearChat = () => {
  chatHistory.value = [];
};

const scrollToBottom = async () => {
  await nextTick();
  setTimeout(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  }, 50);
};

const submitChatPrompt = async () => {
  const prompt = chatInput.value.trim();
  if (!prompt) return;

  chatHistory.value.push({ role: "user", content: prompt });
  chatInput.value = "";
  isAiTyping.value = true;
  scrollToBottom();

  try {
    const { $api } = useNuxtApp();
    // Send the current reactive state and the user's prompt to the Backend API
    const response = await $api.post("/ai/parse-invoice", {
      currentFormState: toRaw(form.value),
      instruction: prompt,
    });

    const data = response.data;

    if (data.status === "success" && data.update) {
      if (data.update.error) {
        // Groq flagged the prompt as unrelated to invoices
        chatHistory.value.push({
          role: "ai",
          content: `⚠️ ${data.update.error}`,
        });
      } else {
        // Merge the JSON diff returned by Groq into our reactive Vue form state
        Object.assign(form.value, data.update);

        chatHistory.value.push({
          role: "ai",
          content:
            "Draft updated! I've applied those changes to the invoice based on your instructions.",
        });
      }
    } else {
      console.error("Groq Parse Error:", data.message);
      chatHistory.value.push({
        role: "ai",
        content: `⚠️ API Error: ${data.message || "I couldn't process that request."}`,
      });
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    chatHistory.value.push({
      role: "ai",
      content: "⚠️ Connection Error: Failed to reach the AI parsing engine.",
    });
  } finally {
    isAiTyping.value = false;
    scrollToBottom();
  }
};

const addLineItem = () => {
  form.value.lineItems.push({
    name: "",
    priceStr: "",
    priceNum: 0,
    qty: 1,
  });
};

const removeLineItem = (index) => {
  form.value.lineItems.splice(index, 1);
};

const submitInvoice = async () => {
  let clientId = form.value.clientId;

  if (showManualClient.value) {
    if (!manualClient.value.name || !manualClient.value.email) {
      toast.value = {
        message: "Please fill in the client name and email",
        type: "warning",
      };
      return;
    }
    try {
      const newClient = await clientStore.addClient({ ...manualClient.value });
      if (newClient && newClient.id) {
        clientId = newClient.id;
      } else {
        toast.value = { message: "Failed to create client", type: "error" };
        return;
      }
    } catch (err) {
      toast.value = {
        message: err.response?.data?.message || "Failed to create client",
        type: "error",
      };
      return;
    }
  }

  if (!clientId) {
    toast.value = { message: "Please select or add a client", type: "warning" };
    return;
  }

  const payload = {
    clientId: clientId,
    invoiceName: form.value.invoiceName,
    subject: form.value.subject,
    fromName: form.value.from.name,
    fromCompanyName: form.value.from.companyName,
    fromEmail: form.value.from.companyEmail,
    fromAddress: form.value.from.companyAddress,
    date: new Date().toISOString(),
    dueDate: new Date(form.value.dueDate).toISOString(),
    currency: form.value.currency,
    status: form.value.status,
    amount: calculateTotal(),
    template: form.value.template,
    items: form.value.lineItems.map((item) => ({
      name: item.name,
      price: item.priceNum,
      quantity: item.qty,
    })),
  };

  try {
    const data = await invoiceStore.addInvoice(payload);

    // Transition to processing state
    isProcessing.value = true;
    processingStatus.value = "Saving Invoice...";

    // Simulate heavy processing/PDF generation
    setTimeout(async () => {
      processingStatus.value = "Generating PDF...";

      if (data && data.id) {
        lastInvoiceId.value = data.id;
        // Update form with response data (includes invoiceNumber from backend)
        Object.assign(form.value, data);
      }

      setTimeout(() => {
        isProcessing.value = false;
        processingComplete.value = true;
        showActionButtons.value = true;

        // Auto-dismiss success badge after 1.5 seconds
        setTimeout(() => {
          processingComplete.value = false;
        }, 1500);
      }, 1500);
    }, 1000);
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || "Failed to save invoice",
      type: "error",
    };
  }
};

const downloadInvoice = async () => {
  if (!lastInvoiceId.value) return;
  await invoiceStore.downloadPdf(
    lastInvoiceId.value,
    `Invoice-${form.value.invoiceNumber}.pdf`,
  );
};

const isSending = ref(false);
const emailInvoice = async () => {
  if (!lastInvoiceId.value) return;
  isSending.value = true;
  try {
    const res = await invoiceStore.sendInvoice(lastInvoiceId.value, "email");
    toast.value = {
      message: res?.message || "Invoice sent to client email!",
      type: "success",
    };
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || "Failed to send email",
      type: "error",
    };
  } finally {
    isSending.value = false;
  }
};

const whatsappInvoice = async () => {
  if (!lastInvoiceId.value) return;
  try {
    const result = await invoiceStore.whatsappInvoice(lastInvoiceId.value);
    toast.value = {
      message: result?.message || "WhatsApp message sent successfully!",
      type: "success",
    };
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || err.message,
      type: "error",
    };
  }
};

// Calculations for Preview
const calculateSubtotal = () => {
  return form.value.lineItems.reduce(
    (acc, obj) => acc + obj.priceNum * obj.qty,
    0,
  );
};

const calculateDiscount = () => {
  if (!form.value.addDiscount) return 0;
  return calculateSubtotal() * (form.value.discountPercentage / 100);
};

const updatePriceNum = (item) => {
  // Remove commas or dots used as thousands separators and convert to number
  const cleanStr = item.priceStr.replace(/,/g, "");
  const num = parseFloat(cleanStr);
  item.priceNum = isNaN(num) ? 0 : num;
};

const calculateTotal = () => {
  return calculateSubtotal() - calculateDiscount();
};
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom Scrollbar for scrollable containers */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e1; /* slate-300 */
  border-radius: 20px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8; /* slate-400 */
}
</style>
