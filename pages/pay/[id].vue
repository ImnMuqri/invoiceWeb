<template>
  <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-2xl mx-auto">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-32">
        <svg
          class="w-10 h-10 text-indigo-600 animate-spin"
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
        <p class="mt-4 text-slate-500 font-medium">
          Loading Invoice {{ invoiceId }}...
        </p>
      </div>

      <!-- Not Found State -->
      <div
        v-else-if="!invoice"
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center mt-12">
        <div
          class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            class="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">
          Invoice Not Found
        </h2>
        <p class="text-slate-500 mb-6">
          The invoice you are looking for does not exist or has been removed.
        </p>
        <NuxtLink
          to="/"
          class="text-indigo-600 font-medium hover:text-indigo-700"
          >Return to InvoMate</NuxtLink
        >
      </div>

      <!-- Invoice View State -->
      <div
        v-else
        class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <!-- Brand Header -->
        <div class="bg-slate-900 px-8 py-6 flex items-center justify-between">
          <div
            class="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            InvoMate
          </div>
          <div class="text-slate-300 text-sm font-medium">
            Secure Payment Portal
          </div>
        </div>

        <div class="p-8">
          <div
            class="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
            <div>
              <h1
                class="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                INVOICE {{ invoice.id }}
              </h1>
              <p class="text-slate-500 font-medium">
                Issued on {{ invoice.date }}
              </p>
            </div>
            <div class="text-left md:text-right">
              <p
                class="text-sm text-slate-500 mb-1 tracking-wide uppercase font-semibold">
                Amount Due
              </p>
              <p class="text-4xl font-bold text-indigo-600">
                ${{ invoice.amount.toLocaleString() }}
              </p>
              <span
                v-if="invoice.status === 'Paid'"
                class="inline-flex mt-3 items-center rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700 border border-emerald-100"
                >Paid in Full</span
              >
              <span
                v-else-if="invoice.status === 'Overdue'"
                class="inline-flex mt-3 items-center rounded-md bg-red-50 px-2.5 py-1 text-sm font-semibold text-red-700 border border-red-100"
                >Overdue</span
              >
              <span
                v-else
                class="inline-flex mt-3 items-center rounded-md bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700 border border-amber-100"
                >Pending Payment</span
              >
            </div>
          </div>

          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 border-b border-t border-slate-100 py-8">
            <div>
              <h3
                class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Billed To
              </h3>
              <p class="text-lg font-semibold text-slate-900 mb-1">
                {{ invoice.client }}
              </p>
              <p class="text-slate-500 text-sm">client@example.com</p>
            </div>
            <div>
              <h3
                class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                From
              </h3>
              <p class="text-lg font-semibold text-slate-900 mb-1">
                Your Company Name
              </p>
              <p class="text-slate-500 text-sm">hello@yourcompany.com</p>
            </div>
          </div>

          <!-- Payment Action -->
          <div
            class="bg-indigo-50 rounded-xl p-6 border border-indigo-100 text-center"
            v-if="invoice.status !== 'Paid'">
            <h3 class="font-semibold text-indigo-900 mb-2">Ready to pay?</h3>
            <p class="text-sm text-indigo-700 mb-6">
              Complete your payment securely using our encrypted checkout.
            </p>
            <button
              @click="markAsPaid"
              class="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all">
              <svg
                class="w-5 h-5 mr-2"
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
          </div>

          <div class="text-center mt-12">
            <p class="text-xs text-slate-400">
              Powered by
              <span class="font-semibold text-slate-500">InvoMate</span>.
              Secure, instant payments.
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
