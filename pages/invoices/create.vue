<template>
  <div
    class="flex flex-col xl:flex-row gap-6 h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)] w-full pb-0 relative">
    <!-- Left Column (Form) block -->
    <div
      class="w-full xl:w-1/2 flex-shrink-0 bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden min-h-0">
      <!-- Page Header -->
      <div class="px-6 pt-6 pb-4 border-b border-slate-200">
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
          Create Invoice
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Generate a new invoice manually or with AI.
        </p>
      </div>

      <!-- Input Mode Tabs -->
      <div
        class="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3 gap-6">
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
              ? 'border-indigo-600 text-indigo-600'
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
        <div class="absolute top-4 right-4 z-10" v-if="chatHistory.length > 0">
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

        <!-- Chat History -->
        <div
          class="flex-1 overflow-y-auto p-6 front-sans text-sm space-y-4 min-h-0"
          ref="chatContainer">
          <!-- Initial greeting -->
          <div class="flex items-start gap-3">
            <div
              class="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
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
              <span class="text-indigo-600 font-medium italic"
                >"create invoice for Wayne, software RM1200"</span
              ><br />
              <span class="text-indigo-600 font-medium italic mt-1 block"
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
              class="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
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
                  ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
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
              class="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <svg
                class="w-4 h-4 text-white animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </div>
            <div
              class="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-500 shadow-sm mt-1">
              Drafting...
            </div>
          </div>
        </div>

        <!-- Chat Input Area -->
        <div class="p-5 border-t border-slate-200 bg-slate-50">
          <form @submit.prevent="submitChatPrompt" class="relative">
            <input
              type="text"
              v-model="chatInput"
              placeholder="Type instructions here..."
              class="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 shadow-sm" />
            <button
              type="submit"
              :disabled="!chatInput.trim() || isAiTyping"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
              <svg
                class="w-4 h-4"
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
                  class="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer group bg-white shadow-sm">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      <!-- Mock Avatar -->
                      <svg
                        class="w-full h-full text-slate-400"
                        fill="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-slate-900">
                        {{ form.clientName || "Select Client" }}
                      </div>
                      <div class="text-xs text-slate-500">
                        {{ form.clientEmail || "No email set" }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700"
                      >On Arto+</span
                    >
                    <button
                      type="button"
                      class="text-gray-400 group-hover:text-gray-600 transition-colors">
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </button>
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

              <!-- Due Date Input -->
              <div>
                <label
                  for="due-date"
                  class="block text-sm font-medium text-slate-700 mb-2"
                  >Due date</label
                >
                <div class="relative">
                  <input
                    type="text"
                    id="date"
                    v-model="form.dueDate"
                    placeholder="10 November 2023"
                    class="w-full border border-slate-200 rounded-md pl-10 pr-3 py-2 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-950 transition-colors shadow-sm text-slate-900 font-medium text-sm" />
                  <div
                    class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      class="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Currency Select -->
              <div>
                <label
                  for="currency"
                  class="block text-sm font-medium text-slate-700 mb-2"
                  >Currency</label
                >
                <div class="relative group">
                  <select
                    id="currency"
                    v-model="form.currency"
                    class="w-full appearance-none border border-slate-200 rounded-md pl-10 pr-3 py-2 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-950 transition-colors shadow-sm cursor-pointer text-slate-900 font-medium text-sm">
                    <option value="IDR">Indonesian Rupiah</option>
                    <option value="USD">US Dollar</option>
                  </select>
                  <div
                    class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <div
                      class="w-4 h-4 rounded-full bg-red-500 overflow-hidden relative">
                      <!-- Simplified ID flag mock -->
                      <div
                        class="absolute top-0 left-0 right-0 h-1/2 bg-red-500"></div>
                      <div
                        class="absolute bottom-0 left-0 right-0 h-1/2 bg-white"></div>
                    </div>
                  </div>
                  <div
                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span
                      class="text-sm font-medium text-slate-700 bg-white px-1 mr-4"
                      >IDR</span
                    >
                    <svg
                      class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
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
              class="flex items-center text-xs font-semibold text-slate-500 mb-2 px-1 uppercase tracking-wider">
              <div class="flex-1">Item</div>
              <div class="w-20 text-center">
                Qty <span class="text-red-500">*</span>
              </div>
              <div class="w-24 ml-2">Tax</div>
              <div class="w-10"></div>
            </div>

            <!-- Line Items List -->
            <div class="space-y-3">
              <div
                v-for="(item, index) in form.lineItems"
                :key="index"
                class="flex items-start gap-2 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white shadow-sm">
                <!-- Item Info -->
                <div class="flex-1 flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-200">
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
                    <input
                      type="text"
                      v-model="item.name"
                      class="text-sm font-semibold text-slate-900 bg-transparent outline-none w-full p-0 border-none focus:ring-0 cursor-text"
                      placeholder="Item name" />
                    <input
                      type="text"
                      v-model="item.priceStr"
                      class="text-xs text-slate-500 bg-transparent outline-none w-full p-0 border-none focus:ring-0 cursor-text"
                      placeholder="Price (e.g. 125.000 IDR)" />
                  </div>
                </div>

                <!-- Qty -->
                <div class="w-20">
                  <input
                    type="number"
                    v-model.number="item.qty"
                    min="1"
                    class="w-full text-center text-sm font-medium text-slate-900 rounded-md border border-slate-200 py-2 px-2 outline-none focus:ring-2 focus:ring-slate-950 transition-colors shadow-sm" />
                </div>

                <!-- Tax Select -->
                <div class="w-24 relative group/tax">
                  <select
                    v-model="item.tax"
                    class="appearance-none block w-full rounded-md border-slate-200 shadow-sm focus:ring-2 focus:ring-slate-950 sm:text-sm py-2 pl-3 pr-8 border transition-colors outline-none hover:border-slate-300 bg-white cursor-pointer font-medium text-slate-700">
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                  </select>
                  <div
                    class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      class="w-4 h-4 text-slate-400 group-hover/tax:text-slate-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>

                <!-- Delete -->
                <div class="w-10 flex items-center justify-center p-2.5">
                  <button
                    type="button"
                    @click="removeLineItem(index)"
                    class="text-gray-400 hover:text-red-500 transition-colors rounded">
                    <svg
                      class="w-5 h-5"
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
              class="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors px-1 py-2 rounded-md hover:bg-indigo-50">
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

            <!-- Toggles (Coupon / Discount) -->
            <div class="mt-8 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <label
                    for="add-coupon"
                    class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="add-coupon"
                      class="sr-only peer" />
                    <div
                      class="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-950 peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                  </label>
                  <label
                    for="add-coupon"
                    class="text-sm font-medium text-slate-700 cursor-pointer"
                    >Add Coupon</label
                  >
                </div>
              </div>

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
                <div class="relative">
                  <select
                    class="appearance-none bg-white border border-slate-200 rounded-md pl-3 pr-8 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-950 shadow-sm cursor-pointer hover:border-slate-300 transition-colors">
                    <option>Summer Sale 10th</option>
                  </select>
                  <div
                    class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      class="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
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
            Processing Invoice
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
          <div class="flex items-center gap-3 text-sm font-medium">
            <button
              class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white shadow-sm border border-slate-200 text-slate-900 hover:bg-slate-50 transition-colors">
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
              class="flex items-center gap-2 px-3 py-1.5 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent">
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
            <button
              class="flex items-center gap-2 px-3 py-1.5 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent">
              <svg
                class="w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Payment page
            </button>
          </div>
        </div>

        <!-- The Invoice Paper -->
        <div
          class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-6 min-h-[600px] flex flex-col">
          <h1 class="text-2xl font-semibold text-slate-900 tracking-tight mb-8">
            <span v-if="form.invoiceName">{{ form.invoiceName }} - </span
            >INV2398-08-087
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
                {{ form.clientName }}
              </div>
              <div class="text-sm text-slate-500 mt-0.5">
                {{ form.clientEmail }}
              </div>
            </div>
            <div>
              <div class="text-xs text-slate-500 mb-1">Currency</div>
              <div class="text-sm font-semibold text-slate-900">
                {{ form.currency }} -
                {{
                  form.currency === "IDR" ? "Indonesian Rupiah" : "US Dollar"
                }}
              </div>
            </div>
          </div>

          <!-- Preview Product Table -->
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
                    <svg
                      class="w-4 h-4 text-teal-600"
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
                  <span class="font-medium text-slate-900">{{
                    item.name || "Unnamed Item"
                  }}</span>
                </div>
                <div class="flex-1 text-center font-medium text-slate-900">
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

            <!-- Calculations -->
            <div class="mt-8 border-t border-slate-200 pt-6 flex justify-end">
              <div class="w-64 space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="font-medium text-slate-600">Subtotal</span>
                  <span class="font-semibold text-slate-900"
                    >{{ calculateSubtotal().toLocaleString() }}
                    {{ form.currency }}</span
                  >
                </div>
                <div
                  v-if="form.addDiscount"
                  class="flex justify-between text-sm">
                  <span class="font-medium text-slate-600"
                    >Discount <span class="text-xs">-10%</span></span
                  >
                  <span class="font-semibold text-slate-900"
                    >{{ calculateDiscount().toLocaleString() }}
                    {{ form.currency }}</span
                  >
                </div>
                <div class="flex justify-between text-sm">
                  <span class="font-medium text-slate-600">Total</span>
                  <span class="font-semibold text-slate-900"
                    >{{ calculateTotal().toLocaleString() }}
                    {{ form.currency }}</span
                  >
                </div>
                <div
                  class="flex justify-between text-sm pt-3 border-t border-slate-200 font-semibold">
                  <span class="text-slate-900">Amount due</span>
                  <span class="text-slate-900"
                    >{{ calculateTotal().toLocaleString() }}
                    {{ form.currency }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Attachment -->
          <div class="mt-12 pt-6 border-t border-slate-200">
            <div class="text-xs font-semibold text-slate-900 mb-3">
              Attachment
            </div>
            <div
              class="inline-flex items-center gap-4 p-3 pr-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors shadow-sm w-auto">
              <div class="flex items-center gap-3">
                <div
                  class="p-2 rounded-md bg-white border border-slate-200 text-slate-500 shadow-sm">
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-medium text-slate-900 leading-tight">
                    Product list.PDF
                  </div>
                  <div class="text-xs text-slate-500">512kb</div>
                </div>
              </div>
              <a
                href="#"
                class="text-xs font-medium text-slate-900 hover:text-slate-700 transition-colors flex items-center gap-1 ml-4 border-l border-slate-200 pl-4">
                Download
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useInvoiceStore } from "~/stores/invoiceStore";
import { useClientStore } from "~/stores/clientStore";

const router = useRouter();
const invoiceStore = useInvoiceStore();
const clientStore = useClientStore();

const form = ref({
  invoiceName: "Website Overhaul",
  clientName: "John Smith",
  clientEmail: "john_s@gmail.com",
  subject: "Service per June 2023",
  dueDate: "10 November 2023",
  currency: "MYR",
  addDiscount: true,
  lineItems: [
    {
      name: "Summer 2K23 T-shirt",
      priceStr: "125,000",
      priceNum: 125000,
      qty: 1,
      tax: "10",
    },
  ],
});

// UI State
const inputMode = ref("manual");

// AI Chat Logic
const chatInput = ref("");
const isAiTyping = ref(false);
const chatHistory = ref([]);
const chatContainer = ref(null);

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
    // Send the current reactive state and the user's prompt to the Nuxt backend
    const response = await $fetch("/api/parse-invoice", {
      method: "POST",
      body: {
        currentFormState: toRaw(form.value),
        instruction: prompt,
      },
    });

    if (response.status === "success" && response.update) {
      if (response.update.error) {
        // Groq flagged the prompt as unrelated to invoices
        chatHistory.value.push({
          role: "ai",
          content: `⚠️ ${response.update.error}`,
        });
      } else {
        // Merge the JSON diff returned by Groq into our reactive Vue form state
        Object.assign(form.value, response.update);

        chatHistory.value.push({
          role: "ai",
          content:
            "Draft updated! I've applied those changes to the invoice based on your instructions.",
        });
      }
    } else {
      console.error("Groq Parse Error:", response.message);
      chatHistory.value.push({
        role: "ai",
        content: `⚠️ API Error: ${response.message || "I couldn't process that request."}`,
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
    tax: "0",
  });
};

const removeLineItem = (index) => {
  form.value.lineItems.splice(index, 1);
};

const submitInvoice = () => {
  // simplified mock save
  invoiceStore.addInvoice({
    ...form.value,
    client: "John Smith",
    amount: calculateTotal(),
    id: "INV2398-08-087",
    status: "Pending",
    date: form.value.dueDate,
  });
  router.push("/invoices");
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
  // Mock 10% discount
  return calculateSubtotal() * -0.1;
};

const calculateTotal = () => {
  return calculateSubtotal() + calculateDiscount();
};
</script>
<style scoped>
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
