<template>
  <div
    class="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 font-sans flex flex-col items-center selection:bg-slate-200 selection:text-slate-900">
    <!-- Main Container -->
    <div class="w-full max-w-2xl mx-auto">
      <!-- Brand Header (Outside Card) -->
      <div class="mb-6 flex flex-col items-center text-center px-2">
        <UiLogo size="lg" :showText="true" containerClass="flex-col" />
        <p class="text-slate-500 font-medium text-sm mt-1 max-w-sm">
          A secure, fast, and transparent platform for managing your
          professional invoices and payments.
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="bg-white rounded-xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center min-h-[400px]">
        <UiIcon
          icon="heroicons:arrow-path"
          custom-class="w-6 h-6 text-slate-400 animate-spin" />
      </div>

      <!-- Not Found State -->
      <div
        v-else-if="!invoice"
        class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center min-h-[400px] flex flex-col justify-center items-center">
        <svg
          class="w-8 h-8 text-slate-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-lg font-semibold text-slate-900 mb-2">
          Invoice Not Found
        </h2>
        <p class="text-slate-500 mb-6 text-sm">
          The requested document could not be located.
        </p>
        <NuxtLink
          to="/"
          class="text-sm font-medium text-slate-900 border-b border-slate-900 pb-0.5 hover:text-slate-600 transition-colors"
          >Return Home</NuxtLink
        >
      </div>

      <!-- Invoice View State -->
      <div
        v-else
        class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div class="p-8 sm:p-10">
          <!-- Header Grid: Status & Amount -->
          <div
            class="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-12 border-b border-slate-100 pb-8">
            <div>
              <!-- Subtle Status Indicator -->
              <div class="flex items-center gap-2 mb-4">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="{
                    'bg-emerald-600': invoice.status === 'Paid',
                    'bg-red-500': invoice.status === 'Overdue',
                    'bg-amber-400':
                      invoice.status !== 'Paid' && invoice.status !== 'Overdue',
                  }"></div>
                <span
                  class="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {{
                    invoice.status === "Paid"
                      ? "Paid"
                      : invoice.status === "Overdue"
                        ? "Overdue"
                        : "Pending Payment"
                  }}
                </span>
                <span class="text-xs text-slate-300 px-1">•</span>
                <span class="text-xs font-medium text-slate-500"
                  >INVM - {{ invoice.id }}</span
                >
              </div>

              <div class="mb-4" v-if="invoice.invoiceName">
                <h2 class="text-lg font-bold text-slate-900 tracking-tight">
                  {{ invoice.invoiceName }}
                </h2>
              </div>

              <p
                class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                Amount Due
              </p>
              <h1 class="text-4xl font-semibold text-slate-900 tracking-tight">
                {{ currencySymbol }}{{ invoice.amount.toLocaleString() }}
              </h1>
            </div>

            <div class="mt-6 sm:mt-0 text-left sm:text-right">
              <p class="text-sm text-slate-500 font-medium">
                Due {{ formatDate(invoice.dueDate) }}
              </p>
            </div>
          </div>

          <!-- Core Details Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-12">
            <div>
              <p
                class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
                Billed To
              </p>
              <p class="text-sm font-bold text-slate-900 mt-3">
                {{ invoice.client?.name }}
              </p>
              <p
                class="text-xs font-semibold text-slate-600 mt-0.5"
                v-if="invoice.client?.company">
                {{ invoice.client.company }}
              </p>
              <p class="text-sm text-slate-500 mt-2">
                {{ invoice.client?.email }}
              </p>
              <p class="text-sm text-slate-500 mt-1">
                {{ invoice.client?.address }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
                From
              </p>
              <p class="text-sm font-bold text-slate-900 mt-3">
                {{ invoice.fromName || "Our Company" }}
              </p>
              <p
                class="text-xs font-semibold text-slate-600 mt-0.5"
                v-if="invoice.fromCompanyName">
                {{ invoice.fromCompanyName }}
              </p>
              <p class="text-sm text-slate-500 mt-2">{{ invoice.fromEmail }}</p>
              <p class="text-sm text-slate-500 mt-1">
                {{ invoice.fromAddress }}
              </p>
            </div>
          </div>

          <!-- Line Items Table -->
          <div class="mb-10">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-slate-200">
                  <th class="py-3 font-semibold text-slate-500 font-normal">
                    Description
                  </th>
                  <th
                    class="py-3 font-semibold text-slate-500 font-normal text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="item in invoice.items" :key="item.id">
                  <td class="py-4 text-slate-900 font-medium">
                    <div class="flex items-start gap-2">
                      <UiIcon
                        icon="heroicons:cube"
                        class="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <div>
                        {{ item.name }}<br />
                        <span class="text-slate-400 text-[11px] font-normal"
                          >Qty: {{ item.quantity }} × {{ currencySymbol
                          }}{{ item.price.toLocaleString() }}</span
                        >
                      </div>
                    </div>
                  </td>
                  <td
                    class="py-4 text-slate-900 text-right align-top font-medium">
                    {{ currencySymbol }}{{ item.total.toLocaleString() }}
                  </td>
                </tr>
              </tbody>
              <tfoot class="border-t border-slate-200 text-sm">
                <tr>
                  <td class="pt-4 pb-2 text-slate-500 text-right">Subtotal</td>
                  <td class="pt-4 pb-2 text-slate-900 font-medium text-right">
                    {{ currencySymbol }}{{ invoice.amount.toLocaleString() }}
                  </td>
                </tr>
                <tr>
                  <td class="py-2 text-slate-500 text-right">Tax (0%)</td>
                  <td class="py-2 text-slate-900 font-medium text-right">
                    {{ currencySymbol }}0.00
                  </td>
                </tr>
                <tr>
                  <td class="pt-4 text-slate-900 font-bold text-right">
                    Total Amount
                  </td>
                  <td class="pt-4 text-slate-900 font-bold text-right">
                    {{ currencySymbol }}{{ invoice.amount.toLocaleString() }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Payment Action -->
          <div v-if="invoice.status !== 'Paid'" class="mt-12">
            <button
              @click="markAsPaid"
              class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Pay {{ currencySymbol }}{{ invoice.amount.toLocaleString() }}
            </button>
            <p
              class="text-center text-[10px] text-slate-400 uppercase tracking-widest mt-4">
              Secure Processing by Stripe
            </p>
          </div>

          <!-- Paid Footer -->
          <div v-else class="mt-12 text-center border-t border-slate-100 pt-8">
            <p class="text-sm font-medium text-emerald-600 mb-2">
              This invoice has been paid.
            </p>
            <button
              class="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Download Receipt
              <svg
                class="w-4 h-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Watermark -->
      <div class="mt-8 text-center pb-12">
        <p
          class="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <span>Generated by</span>
          <span class="text-slate-400">InvoKita</span>
        </p>
      </div>
    </div>
    <UiToast v-model="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
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
const toast = ref({ message: "", type: "success" });

const currencySymbol = computed(() => {
  if (!invoice.value) return "$";
  const curr = invoice.value.currency;
  return curr === "IDR" || curr === "MYR" ? "RM" : "$";
});

onMounted(async () => {
  // Fetch from API directly using the numeric ID
  invoice.value = await invoiceStore.fetchInvoiceById(invoiceId);
  loading.value = false;
});

const markAsPaid = async () => {
  if (invoice.value) {
    // In a real app we would trigger Stripe/FPX checkout here
    // For demo, we just alert. In the future we should call an API to mark as paid.
    toast.value = {
      message: "Payment successful! Thank you.",
      type: "success",
    };
    invoice.value.status = "Paid";
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>
