<template>
  <div
    class="min-h-screen bg-transparent p-0 sm:p-8 flex justify-center items-start print:p-0">
    <!-- Selected Template -->
    <div
      v-if="invoice"
      class="w-full max-w-4xl bg-white shadow-none border-none animate-in fade-in duration-700">
      <!-- 1. PROFESSIONAL THEME (Clean & Formal) -->
      <div
        v-if="currentTemplate === 'professional'"
        class="p-12 flex flex-col min-h-[900px] border border-slate-100 relative pb-20">
        <div class="flex justify-between items-start mb-12">
          <div>
            <h1
              class="text-3xl font-semibold text-slate-900 tracking-tight mb-1">
              INVOICE
            </h1>
            <p class="text-lg text-slate-500">{{ invoice.invoiceName }}</p>
          </div>
          <div class="text-right">
            <div
              class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
              Invoice Number
            </div>
            <div class="text-xl font-semibold text-slate-900">
              {{ invoice.invoiceNumber }}
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
              {{ invoice.client?.name }}
            </div>
            <div class="text-sm text-slate-500 mt-1 whitespace-pre-line">
              {{ invoice.client?.email }}
              <p>{{ invoice.client?.address }}</p>
            </div>
          </div>
          <div>
            <div
              class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">
              From
            </div>
            <div class="text-sm font-semibold text-slate-900">
              {{ invoice.fromName || "Our Company" }}
            </div>
            <div class="text-sm text-slate-500 mt-1 whitespace-pre-line">
              {{ invoice.fromEmail }}
              <p>{{ invoice.fromAddress }}</p>
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
                  formatDate(invoice.date)
                }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-500">Due:</span
                ><span class="font-semibold text-slate-900">{{
                  formatDate(invoice.dueDate)
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
                ><span class="text-slate-900 ml-2">{{
                  invoice.subject || "N/A"
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Currency:</span
                ><span class="text-slate-900">{{ invoice.currency }}</span>
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
              v-for="(item, idx) in invoice.items"
              :key="idx"
              class="flex items-center text-sm py-1 border-b border-slate-50 last:border-0 pb-3">
              <div class="flex-[3]">
                <span class="font-semibold text-slate-900">{{
                  item.name || "Unnamed Item"
                }}</span>
              </div>
              <div class="w-20 text-center font-medium text-slate-700">
                {{ item.quantity }}
              </div>
              <div class="w-32 text-right font-medium text-slate-700">
                {{ item.price.toLocaleString() }} {{ invoice.currency }}
              </div>
              <div class="w-32 text-right font-semibold text-slate-900">
                {{ (item.price * item.quantity).toLocaleString() }}
                {{ invoice.currency }}
              </div>
            </div>
          </div>
          <div class="mt-12 border-t border-slate-200 pt-6 flex justify-end">
            <div class="w-72 space-y-3">
              <div class="flex justify-between text-sm">
                <span class="font-medium text-slate-500">Subtotal</span
                ><span class="font-semibold text-slate-900"
                  >{{ subtotal.toLocaleString() }} {{ invoice.currency }}</span
                >
              </div>
              <div
                v-if="discount > 0"
                class="flex justify-between text-sm text-red-600 font-semibold">
                <span>Discount</span
                ><span
                  >-{{ discount.toLocaleString() }} {{ invoice.currency }}</span
                >
              </div>
              <div
                class="flex justify-between text-base pt-4 border-t border-slate-900 font-semibold">
                <span class="text-slate-900">Amount Due</span
                ><span class="text-slate-900"
                  >{{ invoice.amount.toLocaleString() }}
                  {{ invoice.currency }}</span
                >
              </div>
            </div>
          </div>
          <!-- Footer Branding moved inside -->
          <div
            class="mt-10 pt-6 border-t border-slate-100 flex justify-end text-end opacity-50">
            <div
              class="text-[8px] text-slate-400 font-medium uppercase tracking-[0.2em]">
              Generated by <UiLogo class="h-4 grayscale"></UiLogo>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. MODERN THEME (Premium & Sleek) -->
      <div
        v-else-if="currentTemplate === 'modern'"
        class="flex flex-col min-h-[900px] bg-slate-50 overflow-hidden border border-slate-200 relative pb-20">
        <!-- Modern Header -->
        <div class="bg-slate-900 text-white p-12 relative overflow-hidden">
          <!-- Subtle background pattern or gradient -->
          <div
            class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

          <div class="relative z-10 flex justify-between items-start">
            <div>
              <UiLogo class="h-8 mb-8 brightness-0 invert opacity-90" />
              <h1
                class="text-4xl font-extrabold tracking-tight text-white mb-2">
                {{ invoice.invoiceName }}
              </h1>
              <div class="flex items-center gap-3">
                <span class="text-slate-400 font-medium"
                  >#{{ invoice.invoiceNumber }}</span
                >
                <span class="w-1 h-1 bg-slate-600 rounded-full"></span>
                <span
                  class="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider rounded border border-emerald-500/20">
                  {{ invoice.status }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <div
                class="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Amount Due
              </div>
              <div class="text-4xl font-black text-emerald-400">
                {{ invoice.currency }} {{ invoice.amount.toLocaleString() }}
              </div>
            </div>
          </div>
        </div>

        <div class="p-12 flex flex-col flex-1 bg-white">
          <!-- Multi-column info -->
          <div class="grid grid-cols-3 gap-12 mb-16">
            <div>
              <div
                class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                From
              </div>
              <div class="text-sm font-semibold text-slate-900 mb-1">
                {{ invoice.fromName || "Our Company" }}
              </div>
              <div
                class="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
                {{ invoice.fromEmail }}
                <p>{{ invoice.fromAddress }}</p>
              </div>
            </div>
            <div>
              <div
                class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                Billed To
              </div>
              <div class="text-sm font-semibold text-slate-900 mb-1">
                {{ invoice.client?.name }}
              </div>
              <div
                class="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
                {{ invoice.client?.email }}
                <p>{{ invoice.client?.address }}</p>
              </div>
            </div>
            <div class="space-y-4">
              <div>
                <div
                  class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">
                  Issued Date
                </div>
                <div class="text-sm font-semibold text-slate-900">
                  {{ formatDate(invoice.date) }}
                </div>
              </div>
              <div>
                <div
                  class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">
                  Due Date
                </div>
                <div class="text-sm font-semibold text-emerald-600">
                  {{ formatDate(invoice.dueDate) }}
                </div>
              </div>
              <div v-if="invoice.subject">
                <div
                  class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">
                  Subject
                </div>
                <div class="text-sm font-semibold text-slate-900">
                  {{ invoice.subject }}
                </div>
              </div>
            </div>
          </div>

          <!-- Modern Table -->
          <div class="flex-1">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50">
                  <th
                    class="py-4 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest rounded-l-lg">
                    Description
                  </th>
                  <th
                    class="py-4 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest text-center">
                    Qty
                  </th>
                  <th
                    class="py-4 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest text-right">
                    Unit Price
                  </th>
                  <th
                    class="py-4 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest text-right rounded-r-lg">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="(item, idx) in invoice.items"
                  :key="idx"
                  class="group">
                  <td class="py-6 px-4">
                    <div class="font-semibold text-slate-900">
                      {{ item.name }}
                    </div>
                  </td>
                  <td class="py-6 px-4 text-center text-slate-600 font-medium">
                    {{ item.quantity }}
                  </td>
                  <td class="py-6 px-4 text-right text-slate-600 font-medium">
                    {{ item.price.toLocaleString() }}
                  </td>
                  <td class="py-6 px-4 text-right font-black text-slate-900">
                    {{ (item.price * item.quantity).toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bottom Summary -->
          <div class="mt-12 pt-12 border-t border-slate-100 flex justify-end">
            <div class="w-80 space-y-4">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500 font-medium">Subtotal</span>
                <span class="font-semibold text-slate-900"
                  >{{ subtotal.toLocaleString() }} {{ invoice.currency }}</span
                >
              </div>
              <div v-if="discount > 0" class="flex justify-between text-sm">
                <span class="text-slate-500 font-medium">Discount Applied</span>
                <span class="font-semibold text-red-500"
                  >-{{ discount.toLocaleString() }} {{ invoice.currency }}</span
                >
              </div>
              <div
                class="flex justify-between items-center pt-6 border-t-2 border-slate-900">
                <span
                  class="text-lg font-black text-slate-900 uppercase tracking-tighter"
                  >Amount Due</span
                >
                <span class="text-3xl font-black text-slate-900">
                  {{ invoice.amount.toLocaleString() }}
                  <span class="text-sm font-semibold text-slate-400">{{
                    invoice.currency
                  }}</span>
                </span>
              </div>
            </div>
          </div>
          <!-- Footer Branding moved inside -->
          <div
            class="mt-10 pt-6 border-t border-slate-100 flex justify-end text-end opacity-50">
            <div
              class="text-[8px] text-slate-400 font-medium uppercase tracking-[0.2em]">
              Generated by <UiLogo class="h-4 grayscale brightness-0"></UiLogo>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-else-if="loading"
      class="p-20 text-slate-400 animate-pulse font-medium text-center w-full">
      <div class="mb-4">
        <UiIcon
          icon="heroicons:arrow-path"
          custom-class="w-12 h-12 mx-auto animate-spin text-slate-200" />
      </div>
      Preparing your specialized template...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useInvoiceStore } from "~/stores/invoiceStore";

definePageMeta({
  layout: false,
});

const route = useRoute();
const invoiceStore = useInvoiceStore();
const invoiceId = route.params.id;

const loading = ref(true);
const invoice = ref(null);

// Get template from invoice property, fallback to professional, or query param for live preview
const currentTemplate = computed(() => {
  return route.query.template || invoice.value?.template || "professional";
});

onMounted(async () => {
  invoice.value = await invoiceStore.fetchInvoiceById(invoiceId);
  loading.value = false;
});

const subtotal = computed(() => {
  if (!invoice.value?.items) return 0;
  return invoice.value.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
});

const discount = computed(() => {
  if (!invoice.value) return 0;
  return subtotal.value - invoice.value.amount;
});

// formatDate is already available via props or imported globally in some setups,
// but here we define it locally for the template to use if not using auto-imports
import { formatDate } from "~/utils/date";
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

.min-h-screen {
  font-family: "Inter", sans-serif;
}

@media print {
  .min-h-screen {
    background: white !important;
  }
}
</style>
