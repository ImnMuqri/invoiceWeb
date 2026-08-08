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

      <!-- Payments Disabled State -->
      <div
        v-else-if="!systemStore.isPaymentsEnabled"
        class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center min-h-[400px] flex flex-col justify-center items-center">
        <div class="mb-6 p-4 bg-amber-50 rounded-full">
          <UiIcon
            icon="heroicons:wrench-screwdriver"
            custom-class="w-10 h-10 text-amber-600" />
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-2 tracking-tight">
          Payments Temporarily Unavailable
        </h2>
        <p class="text-slate-500 mb-8 text-sm max-w-sm leading-relaxed">
          Our payment systems are currently undergoing scheduled maintenance.
          Please try again later or contact the invoice issuer directly.
        </p>
        <div class="px-6 py-2 bg-slate-50 border border-slate-100 rounded-lg">
          <p
            class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Estimated Uptime: Shortly
          </p>
        </div>
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
                <span class="text-xs font-medium text-slate-500">{{
                  invoice.invoiceNumber || invoice.id
                }}</span>
              </div>

              <div class="mb-4" v-if="invoice.invoiceName">
                <h2 class="text-lg font-bold text-slate-900 tracking-tight">
                  {{ invoice.invoiceName }}
                </h2>
                <p class="text-sm text-slate-500 mt-0.5" v-if="invoice.subject">
                  {{ invoice.subject }}
                </p>
              </div>

              <p
                class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                Amount Due
              </p>
              <h1 class="text-4xl font-semibold text-slate-900 tracking-tight">
                {{ currencySymbol }}{{ cash(invoice.amount) }}
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
              <!-- Spec 05. Only when set — a client with no identifiers gets
                   the page exactly as it was. -->
              <dl v-if="clientIds.length" class="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                <template v-for="id in clientIds" :key="id.label">
                  <dt class="font-semibold text-slate-400 whitespace-nowrap">
                    {{ id.label }}
                  </dt>
                  <dd class="text-slate-600 tabular-nums break-all">
                    {{ id.value }}
                  </dd>
                </template>
              </dl>
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
              <dl v-if="senderIds.length" class="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                <template v-for="id in senderIds" :key="id.label">
                  <dt class="font-semibold text-slate-400 whitespace-nowrap">
                    {{ id.label }}
                  </dt>
                  <dd class="text-slate-600 tabular-nums break-all">
                    {{ id.value }}
                  </dd>
                </template>
              </dl>
            </div>
          </div>

          <!-- Line Items Table -->
          <div class="mb-10">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-slate-200">
                  <th class="py-3 font-semibold text-slate-500">
                    Description
                  </th>
                  <th
                    class="py-3 font-semibold text-slate-500 text-right">
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
                          }}{{ cash(item.price) }}</span
                        >
                      </div>
                    </div>
                  </td>
                  <td
                    class="py-4 text-slate-900 text-right align-top font-medium">
                    {{ currencySymbol }}{{ cash(item.total) }}
                  </td>
                </tr>
              </tbody>
              <tfoot class="border-t border-slate-200 text-sm">
                <tr>
                  <td class="pt-4 pb-2 text-slate-500 text-right">Subtotal</td>
                  <td class="pt-4 pb-2 text-slate-900 font-medium text-right">
                    {{ currencySymbol }}{{ cash(invoice.amount) }}
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
                    {{ currencySymbol }}{{ cash(invoice.amount) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Payment Action -->
          <div
            v-if="
              invoice.status !== 'Paid' &&
              (activeProvider || manualPaymentAvailable)
            "
            class="mt-12">
            <!-- Global Payment Toggle Restriction -->
            <template v-if="invoice.system?.paymentsEnabled !== false">
              <button
                @click="initiatePayment"
                class="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
                <UiIcon icon="heroicons:credit-card" custom-class="w-4 h-4" />
                Pay Now
              </button>

              <div
                class="flex items-center justify-center gap-2 mt-4 opacity-70">
                <template v-if="activeProvider">
                  <img
                    :src="activeProviderLogo"
                    class="w-4 h-4 object-contain grayscale hover:grayscale-0 transition-all"
                    :alt="activeProviderName"
                    v-if="activeProviderLogo" />
                  <p
                    class="text-[10px] text-slate-400 uppercase tracking-widest">
                    Secure Processing by {{ activeProviderName }}
                  </p>
                </template>
                <template v-else>
                  <UiIcon
                    icon="heroicons:lock-closed"
                    custom-class="w-3 h-3 text-slate-400" />
                  <p
                    class="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                    Direct Settlement via Bank Transfer
                  </p>
                </template>
              </div>
            </template>

            <!-- Disabled State Notice -->
            <div
              v-else
              class="bg-amber-50 border border-amber-100 rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
              <div
                class="p-2 bg-white border border-amber-200 rounded-full mb-3">
                <UiIcon
                  icon="heroicons:pause-circle"
                  class="w-6 h-6 text-amber-600" />
              </div>
              <h4 class="text-sm font-bold text-amber-900">
                Online Payments Temporarily Unavailable
              </h4>
              <p
                class="text-xs font-medium text-amber-700/80 mt-1 max-w-xs leading-relaxed">
                The payment gateway is currently undergoing maintenance. Please
                try again later or contact the invoice issuer.
              </p>
            </div>
          </div>

          <!-- Paid Footer -->
          <div
            v-else-if="invoice.status === 'Paid'"
            class="mt-12 text-center border-t border-slate-100 pt-8">
            <p class="text-sm font-medium text-emerald-600 mb-2">
              This invoice has been paid.
            </p>
            <button
              @click="invoiceStore.downloadReceipt(invoice.id, 'receipt-' + invoice.invoiceNumber + '.pdf')"
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

      <!-- Attribution (spec 09).
           Was `plan !== 'MAX'` — a rule invented here that agreed with nothing
           else: the PDF showed its footer unconditionally, so a Max customer
           had it stripped from this page and still printed on the document
           attached to it. The server now decides, once, for both surfaces.

           A real link with a tracked source, because a signup arriving from an
           invoice somebody was sent is the clearest evidence this loop works
           and it is invisible without the tag. rel="noopener" since it opens a
           new tab; no "nofollow" — this is our own site.

           Quiet on purpose. It sits outside the invoice card, below it, in the
           lightest text on the page. It must never look like an advert on
           somebody else's bill. -->
      <div v-if="invoice?.attribution" class="mt-8 text-center pb-12">
        <a
          :href="invoice.attribution.url"
          target="_blank"
          rel="noopener"
          class="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] inline-flex items-center justify-center gap-2 hover:text-slate-500 transition-colors">
          <span>{{ invoice.attribution.text }}</span>
        </a>
      </div>
    </div>
    <UiToast v-model="toast" />

    <!-- Manual Payment Modal -->
    <UiModal
      v-model="showManualModal"
      title="Payment Details"
      description="Review the payment amount carefully before confirming your transaction."
      max-width="lg">
      <div class="space-y-4 px-4 py-4">
        <!-- Bank Details Card -->
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <div class="flex items-center gap-2 mb-4">
            <div
              class="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
              <UiIcon
                icon="heroicons:building-library"
                custom-class="w-4 h-4 text-slate-600" />
            </div>
            <span class="text-xs font-bold uppercase tracking-widest"
              >Bank Transfer Info</span
            >
          </div>

          <div class="flex justify-between px-4 gap-2">
            <div v-if="invoice.user?.manualBankName">
              <p
                class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Bank Name
              </p>
              <p class="text-sm font-bold text-slate-900">
                {{ invoice.user.manualBankName }}
              </p>
            </div>
            <div v-if="invoice.user?.manualAccountNumber">
              <p
                class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Account Number
              </p>
              <div class="flex items-center justify-between">
                <p class="text-sm font-bold text-slate-900 tracking-tight">
                  {{ invoice.user.manualAccountNumber }}
                </p>
                <!-- Add a simple copy button if possible later -->
              </div>
            </div>
            <div v-if="invoice.user?.manualAccountName">
              <p
                class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Account Name
              </p>
              <p class="text-sm font-semibold">
                {{ invoice.user.manualAccountName }}
              </p>
            </div>
          </div>
        </div>

        <!-- QR Code Section -->
        <div v-if="qrCodeDataUrl" class="flex flex-col items-center">
          <!-- Stylized DuitNow QR Container -->
          <div class="relative mt-8">
            <!-- Top Logo Badge -->
            <div
              class="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full p-0.5 shadow-md border-4 border-[#ed2c67] flex items-center justify-center z-20 overflow-hidden">
              <img
                src="/duitnowLogo.png"
                class="w-8 h-8 object-cover -full"
                alt="DuitNow" />
            </div>

            <div
              class="bg-[#ed2c67] p-2 rounded-[1rem] shadow-lg w-40 sm:w-48 pt-10">
              <div
                class="bg-white rounded-2xl p-4 shadow-inner flex items-center justify-center">
                <img
                  :src="qrCodeDataUrl"
                  class="w-full h-auto object-contain transition-all duration-500 hover:scale-105"
                  alt="Payment QR" />
              </div>
            </div>
          </div>

          <p
            class="text-xs text-slate-500 mt-8 text-center max-w-xs leading-relaxed">
            Scan this QR code using your bank's app (DuitNow/TNG/FPX) to
            complete the payment instantly.
          </p>
          <p
            class="text-xs text-slate-500 mt-4 text-center max-w-xs leading-relaxed">
            Don't forget to include your invoice number in the payment
            reference.
          </p>
        </div>

        <div class="pt-2">
          <button
            @click="showManualModal = false"
            class="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all">
            Understood
          </button>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useInvoiceStore } from "~/stores/invoiceStore";
import { useSystemStore } from "~/stores/systemStore";
/* Every amount from /pay/invoice/:id is SEN. This page was printing them raw
   through `.toLocaleString()`, so a RM500 invoice asked the client to pay
   "RM 50,000" — on the one page in the product that is shown to somebody who is
   not a user and has no way to know it is wrong. */
import { cash, documentIdentifiers } from "~/utils/invoice";
import QRCode from "qrcode";

definePageMeta({
  layout: false,
});

const route = useRoute();
const invoiceStore = useInvoiceStore();
const systemStore = useSystemStore();
const invoiceId = route.params.id;

const loading = ref(true);
const invoice = ref(null);
const toast = ref({ message: "", type: "success" });
const showManualModal = ref(false);
const qrCodeDataUrl = ref("");

/* Spec 05. Shaped by the same function the PDF uses, so this page and the
   document a client downloads cannot disagree about which identifiers appear. */
const senderIds = computed(() => documentIdentifiers(invoice.value).from);
const clientIds = computed(() => documentIdentifiers(invoice.value).to);

const currencySymbol = computed(() => {
  if (!invoice.value) return "$";
  const curr = invoice.value.currency;
  return curr === "IDR" || curr === "MYR" ? "RM" : "$";
});

onMounted(async () => {
  // Ensure system config is latest
  await systemStore.fetchSystemConfig();

  /* The public projection, not the full row. A client opening a payment link
     has no session, and /pay/invoice/:id is the endpoint meant for them. */
  invoice.value = await invoiceStore.fetchPublicInvoice(invoiceId);

  // Handle Gateway Redirects
  const query = route.query;
  const isBillplzRedirect = !!query["billplz[id]"];
  const isToyyibRedirect = !!query.billcode;
  const isSuccessRedirect = query.status === "success";
  const isFailRedirect = query.status === "fail" || query.status === "failed";
  const billplzExplicitlyFailed = isBillplzRedirect && (query["billplz[paid]"] === "false" || query["billplz[paid]"] === false);

  if (billplzExplicitlyFailed || (isToyyibRedirect && isFailRedirect)) {
    // Explicit failure redirect — don't attempt verification
    toast.value = { message: "Payment was cancelled or declined. You can try again.", type: "error" };
  } else if ((isSuccessRedirect || isBillplzRedirect) && invoice.value?.status !== "Paid") {
    toast.value = { message: "Verifying secure payment...", type: "success" };

    try {
      const { $api } = useNuxtApp();
      const verifyRes = await $api.get(`/pay/invoice/${invoiceId}/verify`, {
        params: {
          billcode: query.billcode || "",
          transaction_id: query.transaction_id || "",
          "billplz[paid]": query["billplz[paid]"] || "",
          "billplz[id]": query["billplz[id]"] || "",
        }
      });

      if (verifyRes.data?.status === "Paid") {
        invoice.value.status = "Paid";
        toast.value = { message: "Payment successful and verified!", type: "success" };
      } else {
        // Fallback polling for ToyyibPay which may be slow to update internally
        if (isToyyibRedirect) {
          for (let i = 0; i < 4; i++) {
            await new Promise((r) => setTimeout(r, 2000));
            const pollRes = await $api.get(`/pay/invoice/${invoiceId}/verify`, {
              params: { billcode: query.billcode || "" }
            });
            if (pollRes.data?.status === "Paid") {
              invoice.value.status = "Paid";
              toast.value = { message: "Payment successful and verified!", type: "success" };
              break;
            }
          }
        }

        // If still not paid after all checks
        if (invoice.value?.status !== "Paid") {
          toast.value = { message: "Payment could not be verified. Please contact support if you were charged.", type: "error" };
        }
      }
    } catch(err) {
      console.error("Verification failed", err);
      toast.value = { message: "Verification error. Please refresh the page.", type: "error" };
    }
  }

  // Clean URL regardless of outcome
  if (window.history.replaceState && (isBillplzRedirect || isToyyibRedirect || isSuccessRedirect || isFailRedirect)) {
    window.history.replaceState(null, null, window.location.pathname);
  }

  loading.value = false;
});

const activeProvider = computed(() => {
  const providers = invoice.value?.user?.paymentProviders;
  if (!providers || providers.length === 0) return null;
  
  const preferred = providers.find(p => p.isPreferred);
  if (preferred) return preferred;

  // Fallback to manual if manual settings exist and NO online gateway is strictly preferred
  const u = invoice.value?.user;
  const manualOk = !!(u?.manualBankName || u?.manualAccountNumber || u?.manualQrCode);
  if (manualOk) return null;

  return providers[0];
});

const manualPaymentAvailable = computed(() => {
  const u = invoice.value?.user;
  return !!(u?.manualBankName || u?.manualAccountNumber || u?.manualQrCode);
});

const activeProviderName = computed(() => {
  if (!activeProvider.value) return "Secure Server";
  return activeProvider.value.provider === "TOYYIBPAY"
    ? "ToyyibPay"
    : "Billplz";
});

const activeProviderLogo = computed(() => {
  if (!activeProvider.value) return null;
  return activeProvider.value.provider === "TOYYIBPAY"
    ? "https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/e2hhr8kgl2hq5bkkqueq?ik-sanitizeSvg=true"
    : "https://make-cxp-documentation.ams3.digitaloceanspaces.com/apps-center-icons/billplz.png";
});

const initiatePayment = async () => {
  if (!invoice.value) return;

  const provider = activeProvider.value;
  if (provider) {
    try {
      loading.value = true;
      const { paymentUrl } = await invoiceStore.createPaymentBill(
        invoice.value.id,
        provider.id,
      );
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error("Payment link not generated");
      }
    } catch (err) {
      toast.value = {
        message: "Failed to initiate online payment.",
        type: "error",
      };
    } finally {
      loading.value = false;
    }
    return;
  }

  // Manual Fallback
  if (manualPaymentAvailable.value) {
    if (invoice.value.user?.manualQrCode) {
      try {
        qrCodeDataUrl.value = await QRCode.toDataURL(
          invoice.value.user.manualQrCode,
          {
            width: 300,
            margin: 2,
            color: {
              dark: "#0f172a",
              light: "#ffffff",
            },
          },
        );
      } catch (err) {
        console.error("QR Generation failed", err);
      }
    }
    showManualModal.value = true;
    return;
  }

  toast.value = {
    message: "Payment methods are currently unavailable for this invoice.",
    type: "error",
  };
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
