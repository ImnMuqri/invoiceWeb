<script setup>
/**
 * THE CLIENT-FACING PAYMENT PAGE.
 *
 * One of two pages in the product shown to somebody who is not a user, and the
 * only one where money changes hands. Everything is arranged around the single
 * question the visitor opened the link to answer — what do I owe, and how do I
 * pay it — with the amount as the largest thing on the page and the action
 * directly under the document it belongs to.
 *
 * ON THE DESK DESIGN SYSTEM (`.pdoc` in app-desk.css), shared with
 * /quote/:token. This page was raw Tailwind slate utilities: hardcoded
 * #f8fafc, light-only, and unable to follow any change made to the app around
 * it. A client who has been sent an invoice from this product should recognise
 * the surface, and that only holds if it is drawn from the same tokens.
 *
 * THE SENDER'S BRAND LEADS. The page used to open with the InvoKita logo at
 * full size above the card and carried nothing of the sender's anywhere — so a
 * stranger was asked to pay a company whose name appeared nowhere near the top,
 * by a brand they have no relationship with. Their letterhead is now the first
 * thing in the paper; ours is the quiet attribution line at the foot, which is
 * where spec 09 puts it and where a paying account can remove it.
 *
 * READS ONE SOURCE FOR THE PAYMENTS SWITCH. It used to call
 * `systemStore.fetchSystemConfig()` on mount — the ADMIN route, guaranteed to
 * 401 for an unauthenticated visitor — and then gate the whole page on the
 * result, while separately consulting `invoice.system` for the same fact. The
 * public payload already carries the switch (see routes/pay/index.js); that is
 * the one this page uses.
 */
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useInvoiceStore } from "~/stores/invoiceStore";
import { THEME_INIT_SCRIPT } from "~/composables/useTheme";
/* Every amount from /pay/invoice/:id is SEN. This page was printing them raw
   through `.toLocaleString()`, so a RM500 invoice asked the client to pay
   "RM 50,000" — on the one page in the product that is shown to somebody who is
   not a user and has no way to know it is wrong. */
import { cash, documentIdentifiers } from "~/utils/invoice";
import QRCode from "qrcode";

definePageMeta({
  layout: false,
});

/* Resolves the visitor's OS preference into an explicit data-theme before first
   paint, the same way every other page outside the app shell does. Without it
   the desk tokens would only ever paint their light values. */
useHead({
  script: [{ innerHTML: THEME_INIT_SCRIPT, tagPosition: "head" }],
});

const route = useRoute();
const invoiceStore = useInvoiceStore();
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

const senderLabel = computed(
  () =>
    invoice.value?.fromCompanyName ||
    invoice.value?.fromName ||
    "whoever sent this",
);

/* Payments are switched off platform-wide. Read from the invoice payload, not
   from the admin route — see the note at the top. Undefined counts as ON, so a
   payload from an older backend does not lock the page. */
const paymentsOff = computed(
  () => invoice.value?.system?.paymentsEnabled === false,
);

/* WHAT IS STILL OWED, which is not the same as what the invoice was for.
   `amountOutstanding` is computed by the same function that raises the gateway
   bill (routes/pay/index.js), so the figure on this page and the figure at the
   checkout cannot disagree. Falls back to the same subtraction, then to the
   total, so an older payload still renders something true.

   This page used to print `invoice.amount` under the words "Amount Due" — the
   original total, ignoring every payment and credit note against it. */
const outstanding = computed(() => {
  const inv = invoice.value;
  if (!inv) return 0;
  if (typeof inv.amountOutstanding === "number") return inv.amountOutstanding;
  return Math.max(
    0,
    (Number(inv.amount) || 0) -
      (Number(inv.amountPaid) || 0) -
      (Number(inv.amountAdjusted) || 0),
  );
});

/* True when something has already come off the total. The client knows they
   paid; what they cannot see anywhere else is whether it was received. */
const partly = computed(
  () =>
    invoice.value?.status !== "Paid" &&
    outstanding.value > 0 &&
    outstanding.value < (Number(invoice.value?.amount) || 0),
);

/* Where the invoice stands, said in the client's words rather than the
   product's. "Partially Paid" is passed through rather than folded into
   "pending": it is a fact the visitor already knows and hiding it makes the
   page look wrong to the one person who cannot check it anywhere else. */
const standing = computed(() => {
  const s = invoice.value?.status;
  if (s === "Paid") return { label: "Paid", chip: "chip--paid" };
  if (s === "Overdue") return { label: "Overdue", chip: "chip--late" };
  if (s === "Partially Paid")
    return { label: "Partially paid", chip: "chip--warn" };
  return { label: "Awaiting payment", chip: "chip--idle" };
});

onMounted(async () => {
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

<template>
  <div class="pdoc">
    <div class="pdoc__inner">
      <!-- ── Loading ──────────────────────────────────────────────────── -->
      <div v-if="loading" class="pdoc__paper">
        <div class="pdoc__state">
          <UiIcon
            icon="heroicons:arrow-path"
            custom-class="w-6 h-6 pdoc__spin" />
        </div>
      </div>

      <!-- ── Not found ────────────────────────────────────────────────────
           A stranger with a dead link has nowhere to go and nobody to ask, so
           this names the one action that actually works: go back to whoever
           sent it. "Return Home" sent them to our marketing site, which is of
           no use to somebody trying to pay a bill. -->
      <div v-else-if="!invoice" class="pdoc__paper">
        <div class="pdoc__state">
          <UiIcon
            icon="heroicons:exclamation-triangle"
            custom-class="w-7 h-7"
            style="color: var(--desk-text-3)" />
          <p class="pdoc__state-title">This invoice could not be found</p>
          <p class="pdoc__state-body">
            The link may have been mistyped, or the invoice may have been
            withdrawn. Ask whoever sent it for a fresh link.
          </p>
        </div>
      </div>

      <!-- ── The invoice ──────────────────────────────────────────────── -->
      <div v-else class="pdoc__paper">
        <!-- The SENDER's letterhead. Their name always renders, logo or not:
             a client has to see who this is from above the fold. -->
        <!-- The standing and the reference ride this row rather than opening a
             band of their own below it: they describe the document, and as a
             separate line they cost a full row on a page that should not need
             scrolling. -->
        <div class="pdoc__brand">
          <img
            v-if="invoice.logoUrl"
            :src="invoice.logoUrl"
            :alt="senderLabel"
            class="pdoc__logo" />
          <p class="pdoc__from">
            {{ invoice.fromCompanyName || invoice.fromName || "Invoice" }}
          </p>
          <div class="pdoc__status">
            <span class="chip" :class="standing.chip">
              <i class="chip__dot" aria-hidden="true"></i>
              {{ standing.label }}
            </span>
            <span class="pdoc__ref">
              {{ invoice.invoiceNumber || invoice.id }}
            </span>
          </div>
        </div>

        <!-- What it is, and what is owed — side by side rather than stacked.
             The figure, its label and the dates all share the right column, so
             this band is only as tall as its taller half. -->
        <div class="pdoc__head">
          <div>
            <template v-if="invoice.invoiceName">
              <h1 class="pdoc__name">{{ invoice.invoiceName }}</h1>
              <p v-if="invoice.subject" class="pdoc__subject">
                {{ invoice.subject }}
              </p>
            </template>
          </div>

          <div class="pdoc__head-side">
            <p class="pdoc__label">
              {{ invoice.status === "Paid" ? "Amount" : "Amount due" }}
            </p>
            <p class="pdoc__amount">
              {{ currencySymbol
              }}{{ cash(invoice.status === "Paid" ? invoice.amount : outstanding) }}
            </p>
            <!-- Only when the two figures differ, so an ordinary invoice is
                 unchanged. Without it the headline drops without explanation
                 and the reader cannot tell whether their payment landed or the
                 invoice was wrong all along. -->
            <p v-if="partly" class="pdoc__reduced">
              {{ currencySymbol }}{{ cash(invoice.amount) }} invoiced ·
              {{ currencySymbol
              }}{{ cash((invoice.amount || 0) - outstanding) }} already received
            </p>

            <div class="pdoc__dates">
              <span>Issued {{ formatDate(invoice.date) }}</span>
              <span>Due {{ formatDate(invoice.dueDate) }}</span>
            </div>
          </div>
        </div>

        <!-- Who to who -->
        <div class="pdoc__parties">
          <div>
            <p class="pdoc__label pdoc__party-head">Billed to</p>
            <p class="pdoc__party-name">{{ invoice.client?.name }}</p>
            <p v-if="invoice.client?.company" class="pdoc__party-org">
              {{ invoice.client.company }}
            </p>
            <p v-if="invoice.client?.email" class="pdoc__party-line">
              {{ invoice.client.email }}
            </p>
            <p v-if="invoice.client?.address" class="pdoc__party-line">
              {{ invoice.client.address }}
            </p>
            <!-- Spec 05. Only when set — a client with no identifiers gets
                 the page exactly as it was. -->
            <dl v-if="clientIds.length" class="pdoc__ids">
              <template v-for="id in clientIds" :key="id.label">
                <dt>{{ id.label }}</dt>
                <dd>{{ id.value }}</dd>
              </template>
            </dl>
          </div>

          <div>
            <p class="pdoc__label pdoc__party-head">From</p>
            <p class="pdoc__party-name">
              {{ invoice.fromName || "Our Company" }}
            </p>
            <p v-if="invoice.fromCompanyName" class="pdoc__party-org">
              {{ invoice.fromCompanyName }}
            </p>
            <p v-if="invoice.fromEmail" class="pdoc__party-line">
              {{ invoice.fromEmail }}
            </p>
            <p v-if="invoice.fromAddress" class="pdoc__party-line">
              {{ invoice.fromAddress }}
            </p>
            <dl v-if="senderIds.length" class="pdoc__ids">
              <template v-for="id in senderIds" :key="id.label">
                <dt>{{ id.label }}</dt>
                <dd>{{ id.value }}</dd>
              </template>
            </dl>
          </div>
        </div>

        <!-- What it is for.
             The subtotal and "Tax (0%)" rows were removed: both restated the
             total, and a hardcoded zero-rate line on a document that never
             calculates tax is a claim about somebody's tax position that this
             page is in no position to make. -->
        <table class="pdoc__items">
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col" class="pdoc__num">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in invoice.items" :key="item.id">
              <td>
                <span class="pdoc__item-name">{{ item.name }}</span>
                <span class="pdoc__item-calc">
                  {{ item.quantity }} × {{ currencySymbol
                  }}{{ cash(item.price) }}
                </span>
              </td>
              <td class="pdoc__num">
                {{ currencySymbol }}{{ cash(item.total) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td class="pdoc__num">
                {{ currencySymbol }}{{ cash(invoice.amount) }}
              </td>
            </tr>
            <!-- The arithmetic, shown rather than asserted. A client querying
                 the balance is querying whether we received their money, and a
                 single adjusted figure gives them nothing to check. -->
            <template v-if="partly">
              <tr class="pdoc__row-soft">
                <td>Already received</td>
                <td class="pdoc__num">
                  −{{ currencySymbol
                  }}{{ cash((invoice.amount || 0) - outstanding) }}
                </td>
              </tr>
              <tr>
                <td>Balance due</td>
                <td class="pdoc__num">
                  {{ currencySymbol }}{{ cash(outstanding) }}
                </td>
              </tr>
            </template>
          </tfoot>
        </table>

        <!-- ── Pay ──────────────────────────────────────────────────────── -->
        <div
          v-if="
            invoice.status !== 'Paid' &&
            (activeProvider || manualPaymentAvailable)
          "
          class="pdoc__act">
          <template v-if="!paymentsOff">
            <button
              type="button"
              class="desk-btn desk-btn--primary"
              @click="initiatePayment">
              <UiIcon
                v-if="activeProvider"
                icon="heroicons:credit-card"
                custom-class="w-4 h-4" />
              <UiIcon
                v-else
                icon="heroicons:building-library"
                custom-class="w-4 h-4" />
              {{ activeProvider ? "Pay now" : "Show bank details" }}
            </button>

            <p class="pdoc__assure">
              <template v-if="activeProvider">
                <img
                  v-if="activeProviderLogo"
                  :src="activeProviderLogo"
                  :alt="activeProviderName" />
                <span>Processed securely by {{ activeProviderName }}</span>
              </template>
              <template v-else>
                <UiIcon icon="heroicons:lock-closed" custom-class="w-3 h-3" />
                <span>Paid directly by bank transfer</span>
              </template>
            </p>
          </template>

          <!-- Payments switched off platform-wide. Says what still works —
               the invoice is real and the sender can still be paid another
               way — because "unavailable" alone reads as "this is a scam". -->
          <div v-else class="banner banner--warn" role="status">
            <UiIcon icon="heroicons:pause-circle" custom-class="w-5 h-5" />
            <span>
              Online payment is temporarily unavailable while we carry out
              maintenance. This invoice is unaffected — contact
              {{ senderLabel }} to arrange payment another way.
            </span>
          </div>
        </div>

        <!-- ── Already settled ──────────────────────────────────────────── -->
        <div v-else-if="invoice.status === 'Paid'" class="pdoc__act">
          <div class="pdoc__settled">
            <p class="pdoc__settled-line">This invoice has been paid.</p>
            <button
              type="button"
              class="desk-btn desk-btn--ghost"
              @click="
                invoiceStore.downloadReceipt(
                  invoice.id,
                  'receipt-' + invoice.invoiceNumber + '.pdf',
                )
              ">
              <UiIcon
                icon="heroicons:arrow-down-tray"
                custom-class="w-4 h-4" />
              Download receipt
            </button>
          </div>
        </div>

        <!-- No gateway and no bank details: the sender has set up neither.
             Silence here left the visitor staring at a document with no way to
             act on it and no explanation. -->
        <div v-else class="pdoc__act">
          <p class="pdoc__note">
            {{ senderLabel }} has not set up online payment for this invoice.
            Contact them directly to arrange it.
          </p>
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

           Quiet on purpose. It sits outside the paper, below it, in the
           lightest text on the page. It must never look like an advert on
           somebody else's bill. -->
      <div v-if="invoice?.attribution" class="pdoc__foot">
        <a
          :href="invoice.attribution.url"
          target="_blank"
          rel="noopener"
          class="pdoc__mark">
          <!-- alt="" on purpose: the text beside it already names us, so a
               described image here would just repeat itself to a screen reader. -->
          <img src="/InvoKitaLogo.png" alt="" />
          {{ invoice.attribution.text }}
        </a>
      </div>
    </div>

    <UiToast v-model="toast" />

    <!-- ── Bank transfer details ──────────────────────────────────────────
         Shown only when the sender has no gateway connected, so it is the
         whole of how they get paid rather than a secondary option. -->
    <UiModal
      v-model="showManualModal"
      title="Bank transfer details"
      description="Transfer the amount shown on the invoice, then keep your receipt."
      max-width="lg">
      <div class="pdoc__stack">
        <div class="pdoc__bank">
          <div v-if="invoice?.user?.manualBankName">
            <p class="pdoc__label">Bank</p>
            <p class="pdoc__bank-v">{{ invoice.user.manualBankName }}</p>
          </div>
          <div v-if="invoice?.user?.manualAccountNumber">
            <p class="pdoc__label">Account number</p>
            <p class="pdoc__bank-v">{{ invoice.user.manualAccountNumber }}</p>
          </div>
          <div v-if="invoice?.user?.manualAccountName">
            <p class="pdoc__label">Account name</p>
            <p class="pdoc__bank-v">{{ invoice.user.manualAccountName }}</p>
          </div>
          <!-- The BALANCE, matching the headline and the gateway. Transferring
               the original total on a part-paid invoice is an overpayment the
               sender then has to refund by hand.

               Given its own full-width row at the foot of the panel rather than
               a fourth cell in the grid: it is the figure the payer has to type
               into their banking app, and as a peer of the bank name it read as
               one more detail to skim past. -->
          <div class="pdoc__bank-amount">
            <p class="pdoc__label">Amount to transfer</p>
            <p class="pdoc__bank-v pdoc__bank-v--total">
              {{ currencySymbol }}{{ cash(outstanding) }}
            </p>
          </div>
        </div>

        <div v-if="qrCodeDataUrl" class="pdoc__qr">
          <div class="pdoc__qr-plate">
            <img :src="qrCodeDataUrl" alt="Payment QR code" />
          </div>
          <p class="pdoc__note">
            Scan with your banking app (DuitNow, TNG or FPX) to pay instantly.
          </p>
        </div>

        <p class="pdoc__note">
          Put invoice
          {{ invoice?.invoiceNumber || invoice?.id }} in the payment reference
          so {{ senderLabel }} can match it to your transfer.
        </p>

        <button
          type="button"
          class="desk-btn desk-btn--ghost"
          @click="showManualModal = false">
          Done
        </button>
      </div>
    </UiModal>
  </div>
</template>
