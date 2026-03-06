<template>
  <div
    class="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
    <div class="max-w-3xl mx-auto">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-32">
        <svg
          class="w-10 h-10 text-slate-400 animate-spin"
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
        class="bg-white p-12 text-center shadow-sm border border-slate-200 mt-12">
        <div
          class="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            class="w-8 h-8"
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
        <h2 class="text-xl font-medium text-slate-900 mb-2">
          Invoice Not Found
        </h2>
        <p class="text-slate-500 mb-8 text-sm">
          The requested document could not be located.
        </p>
        <NuxtLink
          to="/"
          class="text-sm font-medium text-slate-900 border-b border-slate-900 pb-0.5 hover:text-slate-600 hover:border-slate-600 transition-colors"
          >Return Home</NuxtLink
        >
      </div>

      <!-- Invoice View State (A4 Paper Aesthetic) -->
      <div
        v-else
        class="bg-white shadow-xl shadow-slate-200/40 border border-slate-200 p-8 sm:p-14 mb-8">
        <!-- Header: Logo & Status -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start gap-6 mb-16">
          <div
            class="flex items-center gap-2.5 text-slate-900 font-bold text-2xl tracking-tight">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            InvoMate
          </div>

          <div class="text-left sm:text-right">
            <h1
              class="text-4xl font-light text-slate-400 tracking-wider uppercase mb-3">
              Invoice
            </h1>
            <span
              v-if="invoice.status === 'Paid'"
              class="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-widest uppercase border border-slate-900 text-slate-900"
              >Paid</span
            >
            <span
              v-else-if="invoice.status === 'Overdue'"
              class="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-widest uppercase bg-slate-900 text-white"
              >Overdue</span
            >
            <span
              v-else
              class="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-widest uppercase border border-slate-300 text-slate-500"
              >Pending</span
            >
          </div>
        </div>

        <!-- Meta Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-16">
          <!-- From / To -->
          <div class="space-y-8">
            <div>
              <h3
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                From
              </h3>
              <p class="text-base font-semibold text-slate-900">
                Your Company Name
              </p>
              <p class="text-sm text-slate-500 mt-1 leading-relaxed">
                123 Business Avenue<br />
                Suite 100<br />
                hello@yourcompany.com
              </p>
            </div>
            <div>
              <h3
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Billed To
              </h3>
              <p class="text-base font-semibold text-slate-900">
                {{ invoice.client }}
              </p>
              <p class="text-sm text-slate-500 mt-1 leading-relaxed">
                Client Address Line 1<br />
                Client City, State<br />
                client@example.com
              </p>
            </div>
          </div>

          <!-- Invoice Details -->
          <div class="sm:text-right space-y-4">
            <div>
              <h3
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Invoice Number
              </h3>
              <p class="text-sm font-medium text-slate-900">{{ invoice.id }}</p>
            </div>
            <div>
              <h3
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Date of Issue
              </h3>
              <p class="text-sm font-medium text-slate-900">
                {{ invoice.date }}
              </p>
            </div>
            <div>
              <h3
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Due Date
              </h3>
              <p class="text-sm font-medium text-slate-900">Net 30 Days</p>
            </div>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="mb-12">
          <div
            class="border-b-2 border-slate-900 pb-3 mb-4 flex text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div class="flex-1">Description</div>
            <div class="w-16 text-center">Qty</div>
            <div class="w-32 text-right">Unit Price</div>
            <div class="w-32 text-right">Amount</div>
          </div>

          <!-- Mock Line Items (We'll use standard pricing for the demo to match the total) -->
          <div class="space-y-4 text-sm text-slate-700">
            <div class="flex items-start py-2 border-b border-slate-100">
              <div class="flex-1 pr-4">
                <p class="font-medium text-slate-900">Professional Services</p>
                <p class="text-xs text-slate-500 mt-1">
                  Consulting and development work as agreed.
                </p>
              </div>
              <div class="w-16 text-center pt-0.5">1</div>
              <div class="w-32 text-right pt-0.5">
                ${{ (invoice.amount * 0.8).toLocaleString() }}
              </div>
              <div class="w-32 text-right font-medium text-slate-900 pt-0.5">
                ${{ (invoice.amount * 0.8).toLocaleString() }}
              </div>
            </div>
            <div class="flex items-start py-2 border-b border-slate-100">
              <div class="flex-1 pr-4">
                <p class="font-medium text-slate-900">Platform Licensing</p>
                <p class="text-xs text-slate-500 mt-1">
                  Annual software license fee.
                </p>
              </div>
              <div class="w-16 text-center pt-0.5">1</div>
              <div class="w-32 text-right pt-0.5">
                ${{ (invoice.amount * 0.2).toLocaleString() }}
              </div>
              <div class="w-32 text-right font-medium text-slate-900 pt-0.5">
                ${{ (invoice.amount * 0.2).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="flex justify-end mb-16">
          <div class="w-full sm:w-72 space-y-3 text-sm">
            <div class="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>${{ invoice.amount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between text-slate-500">
              <span>Tax (0%)</span>
              <span>$0.00</span>
            </div>
            <div
              class="flex justify-between items-center border-t-2 border-slate-900 pt-4 mt-4">
              <span
                class="text-xs font-bold text-slate-900 uppercase tracking-widest"
                >Total Due</span
              >
              <span class="text-2xl font-light text-slate-900"
                >${{ invoice.amount.toLocaleString() }}</span
              >
            </div>
          </div>
        </div>

        <!-- Payment Action Area -->
        <div
          v-if="invoice.status !== 'Paid'"
          class="border-t border-slate-200 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="text-center sm:text-left">
            <p class="text-sm font-medium text-slate-900 mb-1">
              Make a Payment
            </p>
            <p class="text-xs text-slate-500">
              Secure transactions powered by Stripe.
            </p>
          </div>
          <button
            @click="markAsPaid"
            class="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all flex items-center justify-center gap-2">
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
            Pay ${{ invoice.amount.toLocaleString() }}
          </button>
        </div>

        <!-- Paid State Footer -->
        <div
          v-else
          class="border-t border-slate-200 pt-8 text-center sm:text-left text-sm">
          <p
            class="font-medium text-emerald-600 mb-1 flex items-center justify-center sm:justify-start gap-2">
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7" />
            </svg>
            Payment Complete
          </p>
          <p class="text-slate-500 text-xs">
            Thank you for your business. This invoice has been paid in full.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center pb-8">
        <p
          class="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
          Powered by <span class="text-slate-900">InvoMate</span>
        </p>
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
