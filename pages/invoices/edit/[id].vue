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
          Edit Invoice
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Modify the details for invoice {{ form.invoiceNumber }}.
        </p>
      </div>

      <!-- Manual Form -->
      <div class="flex-1 overflow-y-auto px-8 py-6">
        <div
          v-if="loadingInvoice"
          class="flex items-center justify-center h-64">
          <UiIcon
            icon="heroicons:arrow-path"
            class="w-8 h-8 animate-spin text-slate-400" />
        </div>
        <form v-else class="space-y-8" @submit.prevent="submitInvoice">
          <!-- Invoice Details Section -->
          <section>
            <h2
              class="text-xl font-semibold text-slate-900 mb-6 tracking-tight">
              Invoice Details
            </h2>
            <div class="space-y-6">
              <!-- People Input -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2"
                  >People <span class="text-red-500">*</span></label
                >
                <div
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

              <!-- Currency Selection -->
              <UiSelect
                v-model="form.currency"
                label="Currency"
                :options="[
                  { label: 'MYR - Malaysian Ringgit', value: 'MYR' },
                  { label: 'USD - US Dollar', value: 'USD' },
                ]"
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
                      <div
                        v-if="theme === 'professional'"
                        class="p-2 w-full h-full flex flex-col gap-1">
                        <div
                          class="h-1.5 w-1/2 bg-slate-200 rounded-full"></div>
                        <div class="h-1 w-full bg-slate-100 rounded-full"></div>
                        <div class="mt-2 h-1 w-full bg-slate-50"></div>
                        <div class="h-1 w-full bg-slate-50"></div>
                      </div>
                      <div
                        v-else-if="theme === 'modern'"
                        class="flex w-full h-full">
                        <div class="w-1/3 bg-slate-800 h-full"></div>
                        <div class="flex-1 p-2 flex flex-col gap-1">
                          <div class="h-1.5 w-full bg-slate-200"></div>
                          <div class="h-1 w-2/3 bg-slate-100"></div>
                        </div>
                      </div>
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
          Editing Mode
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
            :disabled="isProcessing"
            class="inline-flex items-center gap-2 justify-center rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-medium text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-colors disabled:opacity-50">
            <UiIcon
              v-if="isProcessing"
              icon="heroicons:arrow-path"
              class="w-4 h-4 animate-spin" />
            Update Invoice
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
              @click="$router.push('/invoices')"
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
            </div>
          </div>

          <!-- Preview Output Actions -->
          <div
            v-if="!showActionButtons"
            class="flex items-center gap-3 text-sm font-medium">
            <button
              class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white shadow-sm border border-slate-200 text-slate-900 opacity-50 cursor-not-allowed">
              <UiIcon
                icon="heroicons:document-text"
                class="w-4 h-4 text-slate-500" />
              PDF
            </button>
            <button
              class="flex items-center gap-2 px-3 py-1.5 rounded-md text-slate-700 opacity-50 cursor-not-allowed border border-transparent">
              <UiIcon
                icon="heroicons:envelope"
                class="w-4 h-4 text-slate-500" />
              Email
            </button>
            <button
              class="flex items-center gap-2 px-3 py-1.5 rounded-md text-slate-700 opacity-50 cursor-not-allowed border border-transparent">
              <UiIcon
                icon="simple-icons:whatsapp"
                class="w-4 h-4 text-slate-500" />
              WhatsApp
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
                  class="w-4 h-4 animate-spin" />
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
          <!-- Drizzle Animation Overlay -->
          <div
            v-if="isProcessing"
            class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-xl">
            <div class="relative w-24 h-24 mb-6">
              <!-- The "Drizzle" effect -->
              <div
                v-for="n in 8"
                :key="n"
                class="absolute w-1 bg-emerald-500/60 rounded-full animate-drizzle"
                :style="{
                  left: Math.random() * 100 + '%',
                  top: '-20px',
                  height: 12 + Math.random() * 20 + 'px',
                  animationDelay: Math.random() * 1.5 + 's',
                  animationDuration: 0.8 + Math.random() * 0.4 + 's',
                }"></div>
              <div
                class="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div
                class="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p class="text-lg font-semibold text-slate-900 tracking-tight">
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
              class="w-20 h-20 rounded-full bg-emerald-100 border-4 border-white shadow-xl flex items-center justify-center mb-4">
              <UiIcon
                icon="heroicons:check-badge"
                class="w-12 h-12 text-emerald-600" />
            </div>
            <h3 class="text-xl font-semibold text-slate-900">
              Invoice Updated!
            </h3>
            <p class="text-sm text-slate-500 mt-1">
              Changes have been saved successfully.
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
              <div class="p-8 flex flex-col h-full">
                <h1
                  class="text-2xl font-semibold text-slate-900 tracking-tight mb-8">
                  <span v-if="form.invoiceName">{{ form.invoiceName }} - </span
                  >{{ form.invoiceNumber }}
                </h1>

                <div class="grid grid-cols-2 gap-y-8 gap-x-12 mb-12">
                  <div>
                    <div class="text-xs text-slate-500 mb-1">Due date</div>
                    <div class="text-sm font-semibold text-slate-900">
                      {{ form.dueDate || "No date set" }}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-slate-500 mb-1">Subject</div>
                    <div class="text-sm font-semibold text-slate-900">
                      {{ form.subject || "No subject set" }}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-slate-500 mb-1">Billed to</div>
                    <div class="text-sm font-semibold text-slate-900">
                      {{ selectedClient?.name || "Select Client" }}
                    </div>
                    <div
                      class="text-sm text-slate-500 mt-0.5 whitespace-pre-line">
                      {{ selectedClient?.email }}
                      <p>{{ selectedClient?.address }}</p>
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-slate-500 mb-1">Currency</div>
                    <div class="text-sm font-semibold text-slate-900">
                      {{ form.currency }} -
                      {{
                        form.currency === "MYR"
                          ? "Malaysian Ringgit"
                          : "US Dollar"
                      }}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-slate-500 mb-1">From</div>
                    <div class="text-sm font-semibold text-slate-900">
                      {{ form.from.companyName }}
                    </div>
                    <div
                      class="text-sm text-slate-500 mt-0.5 whitespace-pre-line">
                      {{ form.from.companyEmail }}
                      <p>{{ form.from.companyAddress }}</p>
                    </div>
                  </div>
                </div>

                <div class="flex-1">
                  <div
                    class="flex items-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
                    <div class="flex-[2]">Description</div>
                    <div class="flex-1 text-center">Qty</div>
                    <div class="flex-1 text-right">Unit Price</div>
                    <div class="flex-1 text-right">Amount</div>
                  </div>
                  <div class="space-y-4">
                    <div
                      v-for="(item, idx) in form.lineItems"
                      :key="idx"
                      class="flex items-center text-sm">
                      <div class="flex-[2] flex items-center gap-3">
                        <div
                          class="w-6 h-6 rounded bg-teal-50 flex items-center justify-center border border-teal-100 flex-shrink-0">
                          <UiIcon
                            icon="heroicons:cube"
                            class="w-4 h-4 text-teal-600" />
                        </div>
                        <span class="font-medium text-slate-900">{{
                          item.name || "Unnamed Item"
                        }}</span>
                      </div>
                      <div
                        class="flex-1 text-center font-medium text-slate-900">
                        {{ item.qty }}
                      </div>
                      <div
                        class="flex-1 text-right font-medium text-slate-900 whitespace-nowrap">
                        {{ item.priceNum.toLocaleString() }} {{ form.currency }}
                      </div>
                      <div
                        class="flex-1 text-right font-semibold text-slate-900 whitespace-nowrap">
                        {{ (item.priceNum * item.qty).toLocaleString() }}
                        {{ form.currency }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="mt-8 border-t border-slate-200 pt-6 flex justify-end">
                    <div class="w-64 space-y-3">
                      <div class="flex justify-between text-sm">
                        <span class="font-medium text-slate-600">Subtotal</span
                        ><span class="font-semibold text-slate-900"
                          >{{ calculateSubtotal().toLocaleString() }}
                          {{ form.currency }}</span
                        >
                      </div>
                      <div
                        v-if="form.addDiscount"
                        class="flex justify-between text-sm">
                        <span class="font-medium text-slate-600"
                          >Discount
                          <span class="text-xs"
                            >{{ form.discountPercentage }}%</span
                          ></span
                        ><span class="font-semibold text-slate-900"
                          >{{ calculateDiscount().toLocaleString() }}
                          {{ form.currency }}</span
                        >
                      </div>
                      <div
                        class="flex justify-between text-base pt-4 border-t border-slate-900 font-semibold">
                        <span class="text-slate-900 font-semibold"
                          >Amount Due</span
                        ><span class="text-slate-900"
                          >{{ calculateTotal().toLocaleString() }}
                          {{ form.currency }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <div
                    class="mt-8 pt-8 border-t border-slate-100 flex justify-end items-center">
                    <div
                      class="text-[10px] text-right text-slate-400 font-medium uppercase tracking-widest">
                      Generated by <UiLogo class="h-6 opacity-30 grayscale" />
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- PREVIEW: MODERN THEME -->
            <template v-else-if="form.template === 'modern'">
              <div
                class="flex flex-col min-h-[800px] bg-slate-50 overflow-hidden">
                <!-- Modern Header Preview -->
                <div
                  class="bg-slate-900 text-white p-8 relative overflow-hidden">
                  <div
                    class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                  <div class="relative z-10 flex justify-between items-start">
                    <div>
                      <UiLogo class="h-6 mb-6 brightness-0 invert opacity-90" />
                      <h1
                        class="text-2xl font-extrabold tracking-tight text-white mb-1">
                        {{ form.invoiceName || "Project Revision" }}
                      </h1>
                      <div class="flex items-center gap-2 text-[10px]">
                        <span class="text-slate-400 font-medium"
                          >#{{ form.invoiceNumber || "0000" }}</span
                        >
                        <span class="w-1 h-1 bg-slate-600 rounded-full"></span>
                        <span
                          class="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-semibold uppercase tracking-wider rounded border border-emerald-500/20">
                          {{ form.status }}
                        </span>
                      </div>
                    </div>
                    <div class="text-right">
                      <div
                        class="text-[8px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
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
                        class="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">
                        From
                      </div>
                      <div class="text-xs font-semibold text-slate-900">
                        {{ form.from.companyName }}
                      </div>
                      <div
                        class="text-[10px] text-slate-500 mt-1 whitespace-pre-line leading-relaxed">
                        {{ form.from.companyEmail }}
                        <p>{{ form.from.companyAddress }}</p>
                      </div>
                    </div>
                    <div>
                      <div
                        class="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">
                        Billed To
                      </div>
                      <div class="text-xs font-semibold text-slate-900">
                        {{ selectedClient?.name || "Client Name" }}
                      </div>
                      <div
                        class="text-[10px] text-slate-500 mt-1 whitespace-pre-line leading-relaxed">
                        {{ selectedClient?.email }}
                        <p>{{ selectedClient?.address }}</p>
                      </div>
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-3 gap-4 mb-10 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div
                        class="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                        Issued Date
                      </div>
                      <div class="text-xs font-semibold text-slate-900">
                        {{ new Date().toLocaleDateString() }}
                      </div>
                    </div>
                    <div>
                      <div
                        class="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                        Due Date
                      </div>
                      <div class="text-xs font-semibold text-emerald-600">
                        {{ form.dueDate || "N/A" }}
                      </div>
                    </div>
                    <div>
                      <div
                        class="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                        Subject
                      </div>
                      <div
                        class="text-xs font-semibold text-slate-900 truncate">
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
                            class="pb-3 text-[8px] font-semibold text-slate-400 uppercase tracking-widest">
                            Description
                          </th>
                          <th
                            class="pb-3 text-[8px] font-semibold text-slate-400 uppercase tracking-widest text-center w-12">
                            Qty
                          </th>
                          <th
                            class="pb-3 text-[8px] font-semibold text-slate-400 uppercase tracking-widest text-right">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-50">
                        <tr v-for="(item, idx) in form.lineItems" :key="idx">
                          <td class="py-4">
                            <div class="text-xs font-semibold text-slate-900">
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
import { useRouter, useRoute } from "vue-router";
import { useInvoiceStore } from "~/stores/invoiceStore";
import { useClientStore } from "~/stores/clientStore";
import { useAuthStore } from "~/stores/authStore";
import { formatDate } from "~/utils/date";

const router = useRouter();
const route = useRoute();
const invoiceId = route.params.id;

const invoiceStore = useInvoiceStore();
const clientStore = useClientStore();
const authStore = useAuthStore();
const toast = ref({ message: "", type: "success" });

const loadingInvoice = ref(true);
const isProcessing = ref(false);
const processingComplete = ref(false);
const showActionButtons = ref(false);
const processingStatus = ref("Preparing Invoice...");
const isSending = ref(false);

const form = ref({
  clientId: "",
  invoiceNumber: "",
  invoiceName: "",
  subject: "",
  dueDate: "",
  currency: "MYR",
  addDiscount: false,
  discountPercentage: 0,
  template: "professional",
  status: "Pending",
  from: {
    companyName: "",
    companyEmail: "",
    companyAddress: "",
  },
  lineItems: [],
});

onMounted(async () => {
  await clientStore.fetchClients();

  try {
    const data = await invoiceStore.fetchInvoiceById(invoiceId);
    if (data) {
      form.value = {
        clientId: data.clientId,
        invoiceNumber: data.invoiceNumber,
        invoiceName: data.invoiceName,
        subject: data.subject,
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString().split("T")[0]
          : "",
        currency: data.currency || "MYR",
        status: data.status || "Pending",
        addDiscount: false,
        discountPercentage: 0,
        from: {
          companyName: data.fromName || "",
          companyEmail: data.fromEmail || "",
          companyAddress: data.fromAddress || "",
        },
        lineItems: data.items.map((item) => ({
          name: item.name,
          priceNum: item.price,
          priceStr: item.price.toLocaleString(),
          qty: item.quantity,
          tax: "0",
        })),
        template: data.template || "professional",
      };

      // Calculate discount percentage if amount is different from subtotal
      const subtotal = data.items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
      if (subtotal > data.amount && subtotal > 0) {
        form.value.addDiscount = true;
        form.value.discountPercentage = Math.round(
          ((subtotal - data.amount) / subtotal) * 100,
        );
      }

      // Enable actions by default on edit
      showActionButtons.value = true;
    }
  } catch (err) {
    console.error("Failed to fetch invoice:", err);
    router.push("/invoices");
  } finally {
    loadingInvoice.value = false;
  }
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

const updatePriceNum = (item) => {
  const cleanStr = item.priceStr.replace(/,/g, "");
  const num = parseFloat(cleanStr);
  item.priceNum = isNaN(num) ? 0 : num;
};

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

const calculateTotal = () => {
  return calculateSubtotal() - calculateDiscount();
};

const submitInvoice = async () => {
  if (!form.value.clientId) {
    toast.value = { message: "Please select a client", type: "warning" };
    return;
  }

  const payload = {
    clientId: form.value.clientId,
    invoiceName: form.value.invoiceName,
    subject: form.value.subject,
    fromName: form.value.from.companyName,
    fromEmail: form.value.from.companyEmail,
    fromAddress: form.value.from.companyAddress,
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

  isProcessing.value = true;
  processingStatus.value = "Updating Invoice...";

  try {
    const data = await invoiceStore.updateInvoice(invoiceId, payload);
    if (data) {
      Object.assign(form.value, data);
    }

    setTimeout(() => {
      processingStatus.value = "Regenerating PDF...";
      setTimeout(() => {
        isProcessing.value = false;
        processingComplete.value = true;
        showActionButtons.value = true;
        setTimeout(() => {
          processingComplete.value = false;
        }, 5000);
      }, 1500);
    }, 1000);
  } catch (err) {
    toast.value = { message: "Failed to update invoice", type: "error" };
    isProcessing.value = false;
  }
};

const downloadInvoice = async () => {
  await invoiceStore.downloadPdf(
    invoiceId,
    `Invoice-${form.value.invoiceNumber}.pdf`,
  );
};

const emailInvoice = async () => {
  isSending.value = true;
  try {
    await invoiceStore.sendInvoice(invoiceId, "email");
    toast.value = { message: "Invoice sent to client email!", type: "success" };
  } catch (err) {
    toast.value = { message: "Failed to send email", type: "error" };
  } finally {
    isSending.value = false;
  }
};

const whatsappInvoice = async () => {
  try {
    const result = await invoiceStore.whatsappInvoice(invoiceId);
    toast.value = {
      message: result.message || "WhatsApp message sent successfully!",
      type: "success",
    };
  } catch (err) {
    toast.value = {
      message:
        "Failed to send WhatsApp message: " +
        (err.response?.data?.message || err.message),
      type: "error",
    };
  }
};
</script>

<style scoped>
@keyframes drizzle {
  0% {
    transform: translateY(0) scaleY(1);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateY(120px) scaleY(0.5);
    opacity: 0;
  }
}

.animate-drizzle {
  animation: drizzle linear infinite;
}

/* Custom Scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
