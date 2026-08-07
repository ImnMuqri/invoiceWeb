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
    logo: authStore.user?.profile?.logoUrl || null,
    showClientIdentifiers: original.value?.showClientIdentifiers !== false,
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
    <div v-else class="banner">
      <UiIcon icon="heroicons:clock" custom-class="w-5 h-5" />
      <span>
        {{ cur }} {{ cash(sums.total) }} offered ·
        {{
          form.validUntil
            ? `holds until ${form.validUntil}`
            : "no expiry set"
        }}
      </span>
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
          @notify="toast = $event" />

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

    <UiToast v-model="toast" />
  </div>
</template>
