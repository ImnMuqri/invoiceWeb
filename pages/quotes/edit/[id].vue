<script setup>
/**
 * EDIT A QUOTATION.
 *
 * Same builder again. The one rule that is not in the invoice editor: a quote
 * that has already become an invoice is read-only. It is the record of what was
 * agreed, and editing it afterwards would leave the quote and the invoice raised
 * from it saying different things — with the client holding the older one.
 */
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuoteStore } from "~/stores/quoteStore";
import { useClientStore } from "~/stores/clientStore";
import { useAuthStore } from "~/stores/authStore";
import { useUiStore } from "~/stores/uiStore";
import { toInputDate } from "~/utils/date";
import {
  cash,
  currencySymbol,
  docFromForm,
  priceToInput,
  totals,
} from "~/utils/invoice";

const route = useRoute();
const router = useRouter();
const quoteId = route.params.id;

const quoteStore = useQuoteStore();
const clientStore = useClientStore();
const authStore = useAuthStore();
const uiStore = useUiStore();
const { $api } = useNuxtApp();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const loading = ref(true);
const saving = ref(false);
const converting = ref(false);
const convertOpen = ref(false);
const original = ref(null);
const currencyOptions = ref([]);
/* Spec 09. Held on the component because the preview renders long after the
   onMounted fetch that produced it — a local `cfg` in that function is gone by
   the time the computed runs, so the footer would silently never draw. */
const attribution = ref(null);

const form = ref({
  type: "quote",
  clientId: "",
  invoiceNumber: "",
  invoiceName: "",
  subject: "",
  validUntil: "",
  currency: "MYR",
  addDiscount: false,
  discountPercentage: 0,
  taxRate: 0,
  status: "Draft",
  template: "professional",
  from: { name: "", companyName: "", companyEmail: "", companyAddress: "", phone: "" },
  lineItems: [],
  showManualClient: false,
  manualClient: { name: "", email: "", phone: "", company: "", address: "" },
});

/** Already invoiced — the quote is now a record, not a draft. */
const locked = computed(() => !!original.value?.convertedTo);

/* ─── Where this quotation stands ─────────────────────────────────────────
   The status comes from the API already corrected for expiry, so this page
   never has to re-derive it — see effectiveStatus in the backend for why the
   stored value and the shown value can differ for up to a day. */
const status = computed(() => original.value?.status || "Draft");
const answered = computed(() =>
  ["Accepted", "Declined"].includes(status.value),
);
const accepted = computed(() => status.value === "Accepted");

/**
 * The conversion prompt.
 *
 * Offered the moment a quotation is accepted, and never taken automatically.
 * The spec is explicit about this and it is right: people invoice on their own
 * schedule — at the end of the month, on completion, after a deposit — and a
 * product that raised the invoice by itself would be putting a payment demand
 * in front of a client on a day the user did not choose.
 */
const showConvertPrompt = computed(() => accepted.value && !locked.value);

/* Recording an answer that arrived somewhere else — a phone call, a meeting.
   A product that only knows about answers pressed through its own button knows
   about half of them. */
const decisionOpen = ref(false);
const decisionKind = ref("accept");
const decisionName = ref("");
const decisionReason = ref("");
const recording = ref(false);

const openDecision = (kind) => {
  decisionKind.value = kind;
  decisionName.value = "";
  decisionReason.value = "";
  decisionOpen.value = true;
};

const recordDecision = async () => {
  recording.value = true;
  try {
    const updated = await quoteStore.recordDecision(quoteId, decisionKind.value, {
      name: decisionName.value.trim() || undefined,
      reason: decisionReason.value.trim() || undefined,
    });
    original.value = { ...original.value, ...updated };
    form.value.status = updated.status;
    decisionOpen.value = false;
    notify(updated.message);
  } catch (err) {
    notify(
      err.response?.data?.message || "Could not record that. Nothing changed.",
      "error",
    );
  } finally {
    recording.value = false;
  }
};

/** Refresh after a send so the banner stops saying Draft. */
const onSent = (data) => {
  if (data?.status) {
    original.value = { ...original.value, ...data };
    form.value.status = data.status;
  }
};

const when = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

const fetchCurrencies = async () => {
  try {
    const { data } = await $api.get("/currencies");
    currencyOptions.value = data;
  } catch {
    currencyOptions.value = [
      { value: "MYR", label: "MYR (RM)" },
      { value: "USD", label: "USD ($)" },
    ];
  }
};

onMounted(async () => {
  fetchCurrencies();
  clientStore.fetchClients();
  const cfg = (await authStore.fetchInvoiceConfig()) || {};
  attribution.value = cfg.attribution ?? null;
  const u = authStore.user;

  try {
    const data = await quoteStore.fetchQuoteById(quoteId);
    if (!data) throw new Error("Not found");
    original.value = data;

    form.value = {
      type: "quote",
      clientId: data.clientId,
      invoiceNumber: data.invoiceNumber || "",
      invoiceName: data.invoiceName || "",
      subject: data.subject || "",
      validUntil: toInputDate(data.validUntil),
      currency: data.currency || "MYR",
      status: data.status || "Draft",
      addDiscount: false,
      discountPercentage: 0,
      taxRate: Number(data.taxRate) || Number(cfg.defaultTaxRate) || 0,
      template: data.template || "professional",
      from: {
        name: data.fromName || (cfg.invoiceIncludeName ? u?.name : "") || "",
        companyName:
          data.fromCompanyName ||
          (cfg.invoiceIncludeCompanyName ? u?.companyName : "") ||
          "",
        companyEmail:
          data.fromEmail ||
          (cfg.invoiceIncludeEmail ? u?.companyEmail || u?.email : "") ||
          "",
        companyAddress:
          data.fromAddress || (cfg.invoiceIncludeAddress ? u?.address : "") || "",
        phone: data.fromPhone || "",
        /* Frozen at issue, no fallback to the live profile — see the same
           block in the invoice editor for why. */
        identifiers:
          data.showTaxIdentifiers === false
            ? null
            : {
                registrationNumber: data.fromRegistrationNumber,
                tin: data.fromTin,
                msicCode: data.fromMsicCode,
                sstNumber: data.fromSstNumber,
              },
      },
      lineItems: (data.items || []).map((i) => ({
        name: i.name,
        priceNum: Number(i.price) || 0,
        priceStr: priceToInput(i.price),
        qty: Number(i.quantity) || 1,
      })),
      showManualClient: false,
      manualClient: { name: "", email: "", phone: "", company: "", address: "" },
    };

    if (!form.value.lineItems.length) {
      form.value.lineItems = [{ name: "", priceStr: "", priceNum: 0, qty: 1 }];
    }
  } catch {
    notify("That quotation could not be opened.", "error");
    router.push("/quotes");
  } finally {
    loading.value = false;
  }
});

const selectedClient = computed(() =>
  clientStore.clients.find((c) => c.id === form.value.clientId),
);
const sums = computed(() => totals(form.value));
const cur = computed(() => currencySymbol(form.value.currency));

const doc = computed(() =>
  docFromForm(form.value, {
    client: selectedClient.value,
    logo: authStore.user?.logoUrl || null,
    showClientIdentifiers: original.value?.showClientIdentifiers !== false,
    /* Spec 09 — the preview draws the same footer the PDF will. */
    attribution: attribution.value,
  }),
);

const save = async () => {
  if (locked.value) return;
  saving.value = true;
  try {
    await quoteStore.updateQuote(quoteId, {
      clientId: form.value.clientId,
      invoiceName: form.value.invoiceName,
      subject: form.value.subject,
      fromName: form.value.from.name,
      fromCompanyName: form.value.from.companyName,
      fromEmail: form.value.from.companyEmail,
      fromPhone: form.value.from.phone,
      fromAddress: form.value.from.companyAddress,
      validUntil: form.value.validUntil
        ? new Date(form.value.validUntil).toISOString()
        : null,
      currency: form.value.currency,
      status: form.value.status,
      amount: sums.value.total,
      taxRate: form.value.taxRate,
      template: form.value.template,
      items: form.value.lineItems.map((i) => ({
        name: i.name,
        price: Number(i.priceNum) || 0,
        quantity: Number(i.qty) || 0,
      })),
    });
    notify("Updated. Send it again if they already have the old version.");
  } catch (err) {
    notify(
      err.response?.data?.message ||
        "Could not save those changes. Your edits are still on screen.",
      "error",
    );
  } finally {
    saving.value = false;
  }
};

const convert = async () => {
  converting.value = true;
  try {
    const invoice = await quoteStore.convertToInvoice(quoteId);
    convertOpen.value = false;
    notify(`${invoice.invoiceNumber} raised.`);
    router.push(`/invoices/edit/${invoice.id}`);
  } catch (err) {
    notify(
      err.response?.data?.message ||
        "Could not raise the invoice. The quotation is untouched.",
      "error",
    );
  } finally {
    converting.value = false;
  }
};
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">
          {{ form.invoiceNumber ? `Quotation ${form.invoiceNumber}` : "Quotation" }}
        </h1>
        <p class="desk__sub">
          <i v-if="loading" class="sk" style="width: 18rem"></i>
          <template v-else>
            {{ selectedClient?.name || "This client" }} ·
            {{ form.invoiceName || "Untitled" }}
          </template>
        </p>
      </div>
      <div class="desk__actions">
        <NuxtLink to="/quotes" class="desk-btn desk-btn--ghost">
          Back to quotations
        </NuxtLink>
        <button
          v-if="!loading && !locked"
          type="button"
          class="desk-btn desk-btn--primary"
          @click="convertOpen = true">
          Accept &amp; invoice
        </button>
      </div>
    </header>

    <div v-if="loading" class="banner">
      <i class="sk" style="width: 1.25rem; height: 1.25rem; border-radius: 50%"></i>
      <span><i class="sk" style="width: 16rem"></i></span>
    </div>
    <div v-else-if="locked" class="banner">
      <UiIcon icon="heroicons:lock-closed" custom-class="w-5 h-5" />
      <span>
        This quotation was accepted and
        <b>{{ original.convertedTo.invoiceNumber }}</b> was raised from it, so it
        is read-only now — it is the record of what was agreed.
      </span>
      <NuxtLink
        :to="`/invoices/edit/${original.convertedTo.id}`"
        class="desk-btn desk-btn--ghost desk-btn--sm">
        Open the invoice
      </NuxtLink>
    </div>
    <!-- ── Accepted: the prompt, offered the moment it lands ──────────────
         The single most valuable thing this page can say. Work agreed and not
         yet billed is money the user has already earned and not asked for. It
         is a prompt and not an action: converting automatically would put a
         payment demand in front of a client on a day the user did not pick.
    -->
    <div v-else-if="showConvertPrompt" class="banner">
      <UiIcon icon="heroicons:check-circle" custom-class="w-5 h-5" />
      <span>
        <b>{{ selectedClient?.name || "Your client" }} accepted this</b>
        <template v-if="original?.acceptedAt">
          on {{ when(original.acceptedAt) }}</template
        ><template v-if="original?.acceptedName">
          as {{ original.acceptedName }}</template
        >. Nothing has been billed yet.
      </span>
      <button
        type="button"
        class="desk-btn desk-btn--primary desk-btn--sm"
        @click="convertOpen = true">
        Raise the invoice
      </button>
    </div>

    <div v-else-if="status === 'Declined'" class="banner banner--warn">
      <UiIcon icon="heroicons:x-circle" custom-class="w-5 h-5" />
      <span>
        Declined<template v-if="original?.declinedAt">
          on {{ when(original.declinedAt) }}</template
        >.
        <template v-if="original?.declineReason">
          They said: “{{ original.declineReason }}”
        </template>
        <template v-else> No reason was given. </template>
      </span>
      <button
        type="button"
        class="desk-btn desk-btn--ghost desk-btn--sm"
        @click="openDecision('reopen')">
        Reopen it
      </button>
    </div>

    <div v-else-if="status === 'Expired'" class="banner banner--warn">
      <UiIcon icon="heroicons:clock" custom-class="w-5 h-5" />
      <span>
        This lapsed on {{ when(original?.validUntil) }} without an answer.
        Nothing was sent to your client about it. Change the date and send it
        again if the work is still live.
      </span>
    </div>

    <div v-else class="banner">
      <UiIcon icon="heroicons:clock" custom-class="w-5 h-5" />
      <span>
        {{ cur }} {{ cash(sums.total) }} offered ·
        {{
          form.validUntil
            ? `holds until ${form.validUntil}`
            : "no expiry set"
        }}
        <template v-if="status === 'Viewed' && original?.viewedAt">
          · opened by your client on {{ when(original.viewedAt) }}
        </template>
        <template v-else-if="status === 'Sent'">
          · sent, not opened yet
        </template>
      </span>
      <button
        type="button"
        class="desk-btn desk-btn--ghost desk-btn--sm"
        @click="openDecision('accept')">
        They said yes
      </button>
      <button
        type="button"
        class="desk-btn desk-btn--ghost desk-btn--sm"
        @click="openDecision('decline')">
        They said no
      </button>
    </div>

    <div class="build">
      <div class="build__pane">
        <div class="build__body">
          <InvoiceFields
            :form="form"
            :clients="clientStore.clients"
            :currencies="currencyOptions"
            mode="edit"
            kind="quote"
            :locked="locked"
            :loading="loading" />
        </div>

        <div class="build__foot">
          <p class="build__total">
            <b v-if="loading"><i class="sk" style="width: 6rem"></i></b>
            <b v-else>{{ cur }} {{ cash(sums.total) }}</b>
            <span v-if="loading"><i class="sk" style="width: 5rem"></i></span>
            <span v-else>
              across {{ sums.count }}
              {{ sums.count === 1 ? "line" : "lines" }}
            </span>
          </p>
          <div class="desk__actions">
            <NuxtLink to="/quotes" class="desk-btn desk-btn--ghost">Back</NuxtLink>
            <button
              v-if="!locked"
              type="button"
              class="desk-btn desk-btn--primary"
              :disabled="saving || loading"
              @click="save">
              <UiIcon
                v-if="saving"
                icon="heroicons:arrow-path"
                custom-class="w-4 h-4 spin" />
              {{ saving ? "Saving…" : "Update quotation" }}
            </button>
          </div>
        </div>
      </div>

      <div class="pv">
        <div class="pv__head">
          <div>
            <h2 class="card__title">What your client will see</h2>
            <p class="money__note">
              A quotation, not a bill — no payment link, and nothing chases it.
              They can accept or decline in one tap.
            </p>
          </div>
        </div>
        <InvoiceSendQuote
          v-if="!loading && !locked"
          :quote-id="quoteId"
          :quote-number="form.invoiceNumber"
          :client="selectedClient"
          :amount="sums.total"
          :currency="form.currency"
          :valid-until="form.validUntil"
          :public-url="original?.publicUrl || ''"
          :answered="answered"
          @notify="toast = $event"
          @sent="onSent" />

        <div class="pv__stage">
          <InvoicePaper :doc="doc" variant="screen" :loading="loading" />
        </div>
      </div>
    </div>

    <UiModal v-model="convertOpen" max-width="sm">
      <div class="dlg">
        <h3 class="dlg__title">Raise an invoice from this?</h3>
        <p class="dlg__body">
          Creates a new invoice for <b>{{ cur }} {{ cash(sums.total) }}</b> with
          the same lines, due in 14 days. This quotation stays exactly as it is,
          marked accepted, with the invoice attached to it.
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="convertOpen = false">
            Not yet
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--primary"
            :disabled="converting"
            @click="convert">
            <UiIcon
              v-if="converting"
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 spin" />
            {{ converting ? "Raising…" : "Raise the invoice" }}
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Record an answer that arrived somewhere else ─────────────────── -->
    <UiModal v-model="decisionOpen" max-width="sm">
      <div class="dlg">
        <h3 class="dlg__title">
          {{
            decisionKind === "accept"
              ? "Mark this accepted?"
              : decisionKind === "decline"
                ? "Mark this declined?"
                : "Put this back to waiting?"
          }}
        </h3>
        <p class="dlg__body">
          <template v-if="decisionKind === 'accept'">
            For when they said yes on the phone or in person. Nothing is sent to
            your client, and you can raise the invoice straight after.
          </template>
          <template v-else-if="decisionKind === 'decline'">
            For when they told you no somewhere else. Nothing is sent to your
            client. You can reopen it later if they change their mind.
          </template>
          <template v-else>
            Clears the answer and puts it back to waiting on a reply. Their link
            starts working again.
          </template>
        </p>

        <div v-if="decisionKind === 'accept'" class="f">
          <label class="f__label" for="decision-name">Who agreed to it</label>
          <input
            id="decision-name"
            v-model="decisionName"
            type="text"
            class="inp"
            placeholder="Their name — optional" />
        </div>

        <div v-else-if="decisionKind === 'decline'" class="f">
          <label class="f__label" for="decision-reason">Why, if they said</label>
          <textarea
            id="decision-reason"
            v-model="decisionReason"
            rows="2"
            maxlength="500"
            class="inp"
            placeholder="Price, timing, went elsewhere — optional"></textarea>
        </div>

        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="decisionOpen = false">
            Cancel
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--primary"
            :disabled="recording"
            @click="recordDecision">
            <UiIcon
              v-if="recording"
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 spin" />
            {{ recording ? "Saving…" : "Record it" }}
          </button>
        </div>
      </div>
    </UiModal>

    <UiToast v-model="toast" />
  </div>
</template>
