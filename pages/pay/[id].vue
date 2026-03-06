<template>
  <div
    class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-center items-center selection:bg-indigo-100 selection:text-indigo-900 relative">
    <!-- Decorative Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-50/50 blur-3xl"></div>
      <div
        class="absolute -bottom-40 -left-32 w-[500px] h-[500px] rounded-full bg-sky-50/50 blur-3xl"></div>
    </div>

    <!-- Main Container -->
    <div class="w-full max-w-lg mx-auto relative z-10">
      <!-- Brand Header -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center gap-2.5 text-slate-900 font-bold text-2xl tracking-tight justify-center">
          <svg
            class="w-8 h-8 text-indigo-600"
            viewBox="0 0 24 24"
            fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
          </svg>
          InvoMate
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-16 flex flex-col items-center justify-center">
        <svg
          class="w-12 h-12 text-indigo-500 animate-spin"
          fill="none"
          viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Not Found State -->
      <div
        v-else-if="!invoice"
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-12 text-center">
        <div
          class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            class="w-10 h-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">
          Invoice Not Found
        </h2>
        <p class="text-slate-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
          The requested document could not be located. It may have been removed
          or the link has expired.
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >Return Home</NuxtLink
        >
      </div>

      <!-- Invoice View State -->
      <div
        v-else
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <!-- Status Header Banner -->
        <div
          class="px-8 py-5 flex items-center justify-between border-b"
          :class="{
            'bg-emerald-500 text-white border-emerald-600':
              invoice.status === 'Paid',
            'bg-rose-500 text-white border-rose-600':
              invoice.status === 'Overdue',
            'bg-amber-500 text-white border-amber-600':
              invoice.status !== 'Paid' && invoice.status !== 'Overdue',
          }">
          <div class="flex items-center gap-2">
            <!-- Status Icons -->
            <svg
              v-if="invoice.status === 'Paid'"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg
              v-else-if="invoice.status === 'Overdue'"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-bold tracking-wide uppercase text-sm">{{
              invoice.status === "Paid"
                ? "Payment Completed"
                : invoice.status === "Overdue"
                  ? "Payment Overdue"
                  : "Awaiting Payment"
            }}</span>
          </div>
          <div
            class="text-sm font-medium opacity-90 border-l border-white/20 pl-4">
            {{ invoice.id }}
          </div>
        </div>

        <div class="p-8 sm:p-10">
          <!-- Amount Display -->
          <div
            class="text-center mb-10 pb-10 border-b border-slate-100 pl-4 pr-4">
            <p
              class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Total Amount Due
            </p>
            <h1 class="text-6xl font-black text-slate-900 tracking-tight">
              ${{ invoice.amount.toLocaleString() }}
            </h1>
            <p
              v-if="invoice.status === 'Overdue'"
              class="text-rose-600 text-sm font-medium mt-3 bg-rose-50 inline-block px-3 py-1 rounded-full">
              Due since {{ invoice.date }} (Net 30)
            </p>
            <p v-else class="text-slate-500 text-sm font-medium mt-3">
              Due on {{ invoice.date }} (Net 30)
            </p>
          </div>

          <!-- Core Details Grid -->
          <div class="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Billed To
              </p>
              <p class="text-base font-semibold text-slate-900">
                {{ invoice.client }}
              </p>
              <p class="text-sm text-slate-500 mt-0.5">client@example.com</p>
            </div>
            <div class="text-right">
              <p
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                From
              </p>
              <p class="text-base font-semibold text-slate-900">Your Company</p>
              <p class="text-sm text-slate-500 mt-0.5">hello@yourco.com</p>
            </div>
          </div>

          <!-- Line Items Summary (Condensed) -->
          <div
            class="bg-slate-50 rounded-2xl p-6 mb-10 border border-slate-100">
            <p
              class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Invoice Items
            </p>

            <div class="space-y-3">
              <div class="flex justify-between items-center text-sm">
                <span class="font-medium text-slate-900"
                  >Professional Services</span
                >
                <span class="text-slate-600 font-semibold"
                  >${{ (invoice.amount * 0.8).toLocaleString() }}</span
                >
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="font-medium text-slate-900"
                  >Platform Licensing</span
                >
                <span class="text-slate-600 font-semibold"
                  >${{ (invoice.amount * 0.2).toLocaleString() }}</span
                >
              </div>
              <div
                class="pt-3 mt-3 border-t border-slate-200/60 flex justify-between items-center">
                <span class="text-slate-500 text-xs font-medium">Subtotal</span>
                <span class="text-slate-900 font-bold"
                  >${{ invoice.amount.toLocaleString() }}</span
                >
              </div>
            </div>
          </div>

          <!-- Payment Action -->
          <div v-if="invoice.status !== 'Paid'">
            <button
              @click="markAsPaid"
              class="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group hover:-translate-y-0.5">
              <svg
                class="w-5 h-5 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Pay ${{ invoice.amount.toLocaleString() }} Now
            </button>
            <p
              class="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
              <svg
                class="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure 256-bit SSL encryption
            </p>
          </div>

          <!-- Paid Footer -->
          <div v-else class="text-center pt-2">
            <button
              class="w-full px-8 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Receipt
            </button>
            <p class="text-xs text-slate-500 mt-4">
              Thank you for your business.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
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

onMounted(() => {
  // Simulate network delay for realism
  setTimeout(() => {
    // Try finding the invoice in the store
    const found = invoiceStore.invoices.find(
      (inv) => inv.id === invoiceId || inv.id === `INV-${invoiceId}`,
    );
    if (found) {
      invoice.value = found;
    }
    loading.value = false;
  }, 800);
});

const markAsPaid = () => {
  if (invoice.value) {
    // In a real app we would trigger Stripe/FPX checkout here
    // For demo, we just update the store
    const index = invoiceStore.invoices.findIndex(
      (inv) => inv.id === invoice.value.id,
    );
    if (index > -1) {
      invoiceStore.invoices[index].status = "Paid";
    }
    alert("Payment successful! Thank you.");
  }
};
</script>
