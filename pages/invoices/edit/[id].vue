<script setup>
/**
 * THE BUILDER — existing invoice.
 *
 * The same components as /invoices/create, differing only in what it loads and
 * where it saves. It used to be a 1,592-line near-copy of that page, and the
 * copy had drifted in ways that mattered:
 *
 *  1. `taxRate` was missing from its form object. `calculateTax()` therefore
 *     evaluated `amount * (undefined / 100)` — NaN — and `calculateTotal()`
 *     carried the NaN into the "Amount Due" line AND into the PUT payload. Every
 *     edit of every invoice was sending `amount: NaN` to the API. Totals now go
 *     through one function in ~/utils/invoice that coerces missing fields to
 *     zero, and the rate is read from the invoice and from the user's settings.
 *
 *  2. The professional preview rendered its Tax row twice, one block directly
 *     beneath an identical one.
 *
 *  3. The client picker was a disabled, greyed-out copy of the create page's
 *     dropdown. Being locked is not a failure state — it is a fact about a
 *     document that has been sent — so it now reads as a statement with the
 *     reason attached.
 *
 *  4. A paid or cancelled invoice showed a one-line amber warning and left every
 *     control enabled-looking. The lock is now stated once, up top, along with
 *     what you can still do.
 */
import { computed, onMounted, ref, toRaw } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useInvoiceStore } from "~/stores/invoiceStore";
import { useClientStore } from "~/stores/clientStore";
import { useAuthStore } from "~/stores/authStore";
import { useSystemStore } from "~/stores/systemStore";
import { useUiStore } from "~/stores/uiStore";
import { formatDate, toInputDate } from "~/utils/date";
import {
  amountOutstanding,
  cash,
  currencySymbol,
  daysLate,
  docFromForm,
  dueInWords,
  isSettled,
  parsePrice,
  priceToInput,
  totals,
} from "~/utils/invoice";

const route = useRoute();
const router = useRouter();
const invoiceId = route.params.id;

const invoiceStore = useInvoiceStore();
const clientStore = useClientStore();
const authStore = useAuthStore();
const systemStore = useSystemStore();
const uiStore = useUiStore();
const { $api } = useNuxtApp();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const mode = ref("form");
const loading = ref(true);
const saving = ref(false);
const usedAi = ref(false);
const currencyOptions = ref([]);
/** The invoice as loaded, kept for the facts the form does not own. */
const original = ref(null);
/** True when the loaded invoice had no line items and one was reconstructed. */
const recoveredAmount = ref(false);
/* Bumped whenever a payment, credit note or void lands, so the panel refetches
   and the page's own figures follow. */
const moneyKey = ref(0);
const reloadMoney = async () => {
  moneyKey.value += 1;
  try {
    original.value = await invoiceStore.fetchInvoiceById(invoiceId);
    form.value.status = original.value?.status || form.value.status;
  } catch {
    /* The panel has already reported the failure. */
  }
};

const form = ref({
  clientId: "",
  invoiceNumber: "",
  invoiceName: "",
  subject: "",
  dueDate: "",
  currency: "MYR",
  addDiscount: false,
  discountPercentage: 0,
  /* Present, and a number. Its absence here is the whole reason this page used
     to write NaN into the database. */
  taxRate: 0,
  status: "Pending",
  template: "professional",
  from: {
    name: "",
    companyName: "",
    companyEmail: "",
    companyAddress: "",
    phone: "",
  },
  lineItems: [],
  showManualClient: false,
  manualClient: { name: "", email: "", phone: "", company: "", address: "" },
});

const locked = computed(() => isSettled(form.value.status));

/* ─── Load ─────────────────────────────────────────────────────────────────── */
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
  await systemStore.fetchSystemConfig();
  fetchCurrencies();
  clientStore.fetchClients();

  const cfg = (await authStore.fetchInvoiceConfig()) || {};
  const u = authStore.user;

  try {
    const data = await invoiceStore.fetchInvoiceById(invoiceId);
    if (!data) throw new Error("Not found");
    original.value = data;

    const phoneFallback = () => {
      if (!u) return "";
      const phones = [];
      if (cfg.invoiceIncludeCompanyPhone && u.companyPhone)
        phones.push(u.companyPhone);
      if (cfg.invoiceIncludePersonalPhone && u.phoneNumber)
        phones.push(u.phoneNumber);
      return phones.join(" / ");
    };

    form.value = {
      clientId: data.clientId,
      invoiceNumber: data.invoiceNumber || "",
      invoiceName: data.invoiceName || "",
      subject: data.subject || "",
      dueDate: toInputDate(data.dueDate),
      currency: data.currency || "MYR",
      status: data.status || "Pending",
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
        phone: data.fromPhone || phoneFallback(),
        /* The FROZEN values off the row, with no fallback to the live profile
           — unlike every field above it. Those fall back because a blank one
           is a gap worth filling; these do not, because a blank one is a
           statement that this invoice was issued without them. Falling back
           here would show the user identifiers that are not on the document
           their client is holding. */
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

    /* Older invoices exist with a stored `amount` and no line-item rows at all.
       The total on this page is derived from the lines — as it must be, or the
       figure and the breakdown can disagree — which means opening one of those
       invoices and pressing update would have quietly written `amount: 0` over a
       real bill. Seeding one line from the stored amount makes the form a
       faithful picture of the invoice, so saving preserves it and the user can
       break it into proper lines if they want to. */
    if (!form.value.lineItems.length) {
      const stored = Number(data.amount) || 0;
      form.value.lineItems = [
        {
          name: data.invoiceName || data.subject || "Agreed amount",
          priceNum: stored,
          priceStr: priceToInput(stored),
          qty: 1,
        },
      ];
      recoveredAmount.value = stored > 0;
    }

    /* The API stores the final amount, not the breakdown, so a stored amount
       below the line total means a discount was applied. Recovering it as a
       percentage keeps the form honest instead of silently dropping it and
       re-saving a higher figure than the client was sent. */
    const lineTotal = (data.items || []).reduce(
      (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
      0,
    );
    const taxed = lineTotal * (1 + form.value.taxRate / 100);
    if (taxed > Number(data.amount) && lineTotal > 0) {
      form.value.addDiscount = true;
      form.value.discountPercentage =
        Math.round(((taxed - Number(data.amount)) / taxed) * 1000) / 10;
    }
  } catch {
    notify("That invoice could not be opened.", "error");
    router.push("/invoices");
  } finally {
    loading.value = false;
  }
});

/* ─── Derived ─────────────────────────────────────────────────────────────── */
const selectedClient = computed(() =>
  clientStore.clients.find((c) => c.id === form.value.clientId),
);
const sums = computed(() => totals(form.value));
const cur = computed(() => currencySymbol(form.value.currency));

const paidSoFar = computed(() => Number(original.value?.amountPaid) || 0);

const doc = computed(() =>
  docFromForm(form.value, {
    client: selectedClient.value,
    paid: paidSoFar.value,
    logo: authStore.user?.profile?.logoUrl || null,
    /* Taken from the invoice, which is the same flag the document renders
       under — so the preview cannot show a client's TIN that the PDF omits. */
    showClientIdentifiers: original.value?.showClientIdentifiers !== false,
  }),
);

/** Where this invoice stands, in one sentence, for the page header. */
const standing = computed(() => {
  const inv = original.value;
  if (!inv) return "";
  if (inv.status === "Paid") return "Paid in full.";
  if (inv.status === "Cancelled") return "Cancelled.";
  const late = daysLate({ ...inv, status: form.value.status });
  /* The stored amount, not the live form total: this line says where the
     invoice stands today, and nothing typed above has been saved yet. */
  const owed = amountOutstanding(inv);
  const owedStr = `${cur.value} ${cash(owed)} outstanding`;
  if (late) return `${owedStr} · ${late} ${late === 1 ? "day" : "days"} late`;
  const words = dueInWords({ ...inv, status: form.value.status });
  return words ? `${owedStr} · ${words.toLowerCase()}` : owedStr;
});

/* ─── The assistant ───────────────────────────────────────────────────────── */
const chat = ref([]);
const thinking = ref(false);

const ask = async (instruction) => {
  chat.value.push({ role: "user", content: instruction });
  thinking.value = true;
  try {
    const { data } = await $api.post("/ai/parse-invoice", {
      currentFormState: toRaw(form.value),
      instruction,
      isEdit: true,
    });

    if (data.status === "success" && data.update) {
      usedAi.value = true;
      if (data.update.error) {
        chat.value.push({ role: "ai", content: data.update.error });
      } else {
        Object.assign(form.value, data.update);
        /* The model returns prices as numbers; the price inputs are text, so
           without this the field and the total disagree until you retype it. */
        form.value.lineItems = (form.value.lineItems || []).map((i) => ({
          ...i,
          priceNum: Number(i.priceNum) || parsePrice(i.priceStr),
          priceStr:
            i.priceStr ?? String(Number(i.priceNum) || 0),
        }));
        chat.value.push({
          role: "ai",
          content:
            "Changed in the draft. Nothing is saved until you press update.",
        });
      }
    } else {
      chat.value.push({
        role: "ai",
        content:
          data.message || "I could not make sense of that. Try it another way.",
      });
    }
  } catch {
    chat.value.push({
      role: "ai",
      content:
        "I could not reach the drafting service. Edit it by hand and nothing is lost.",
    });
  } finally {
    thinking.value = false;
  }
};

/* ─── Save ────────────────────────────────────────────────────────────────── */
const save = async () => {
  if (locked.value) return;
  saving.value = true;
  try {
    const payload = {
      clientId: form.value.clientId,
      invoiceName: form.value.invoiceName,
      subject: form.value.subject,
      fromName: form.value.from.name,
      fromCompanyName: form.value.from.companyName,
      fromEmail: form.value.from.companyEmail,
      fromPhone: form.value.from.phone,
      fromAddress: form.value.from.companyAddress,
      dueDate: new Date(form.value.dueDate).toISOString(),
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
      usedAi: usedAi.value,
    };

    const data = await invoiceStore.updateInvoice(invoiceId, payload);
    if (data) original.value = data;
    notify(
      "Updated. Send it again if your client already has the old version.",
    );
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
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <!-- Never fall back to the route id. That is the database primary key,
             and showing it reads as an invoice number the client does not have
             — briefly, on every load, but wrongly. Wait for the real one. -->
        <h1 class="desk__title">
          Invoice
          <template v-if="form.invoiceNumber">{{ form.invoiceNumber }}</template>
          <i v-else-if="loading" class="sk" style="width: 6rem"></i>
        </h1>
        <p class="desk__sub">
          <i v-if="loading" class="sk" style="width: 18rem"></i>
          <template v-else>
            {{ selectedClient?.name || "This client" }} ·
            {{ form.invoiceName || "Untitled" }} · due
            {{ formatDate(form.dueDate) }}
          </template>
        </p>
      </div>
      <div class="desk__actions">
        <button
          type="button"
          class="desk-btn desk-btn--icon"
          aria-label="How this page works"
          @click="uiStore.openModuleHelp('invoices')">
          <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
        </button>
        <NuxtLink to="/invoices" class="desk-btn desk-btn--ghost">
          Back to invoices
        </NuxtLink>
      </div>
    </header>

    <!-- Where it stands, before anything else on the page. It renders in both
         states so its height is spoken for from the first frame — appearing
         only once loaded would have pushed the entire builder down the screen
         at the moment the fetch resolved. -->
    <div v-if="loading" class="banner">
      <i class="sk" style="width: 1.25rem; height: 1.25rem; border-radius: 50%"></i>
      <span><i class="sk" style="width: 16rem"></i></span>
    </div>
    <div
      v-else
      class="banner"
      :class="{ 'banner--late': daysLate(original) > 0 && !locked }">
      <UiIcon
        :icon="
          locked
            ? 'heroicons:lock-closed'
            : daysLate(original) > 0
              ? 'heroicons:exclamation-triangle-solid'
              : 'heroicons:clock'
        "
        custom-class="w-5 h-5" />
      <span>{{ standing }}</span>
      <span v-if="paidSoFar > 0" class="banner__more">
        {{ cur }} {{ cash(paidSoFar) }} already received
      </span>
    </div>

    <p v-if="loading" class="sk-say" role="status">
      Opening invoice {{ form.invoiceNumber || invoiceId }}…
    </p>

    <div class="build" :aria-busy="loading">
      <!-- ── Editor ───────────────────────────────────────────────────────── -->
      <div class="build__pane">
        <div class="tabs" role="tablist" aria-label="How to edit this">
          <button
            id="tab-form"
            type="button"
            role="tab"
            class="tab"
            :class="{ 'tab--on': mode === 'form' }"
            :aria-selected="mode === 'form'"
            aria-controls="panel-form"
            @click="mode = 'form'">
            <UiIcon icon="heroicons:pencil-square" custom-class="w-4 h-4" />
            Change it
          </button>
          <button
            id="tab-ai"
            type="button"
            role="tab"
            class="tab"
            :class="{ 'tab--on': mode === 'ai' }"
            :aria-selected="mode === 'ai'"
            aria-controls="panel-ai"
            @click="mode = 'ai'">
            <UiIcon icon="heroicons:sparkles" custom-class="w-4 h-4" />
            Just say what changed
          </button>
        </div>

        <div
          v-if="mode === 'ai'"
          id="panel-ai"
          role="tabpanel"
          aria-labelledby="tab-ai"
          class="build__body build__body--flush">
          <InvoiceAssistant
            :messages="chat"
            :busy="thinking"
            :disabled="locked"
            greeting="Say what changed and I will adjust the draft. Nothing is saved until you press update."
            :examples="[
              'Change the first line to RM1,500',
              'Push the due date out two weeks',
            ]"
            placeholder="e.g. Add a line for 3 hours of revisions at RM150"
            @send="ask"
            @clear="chat = []" />
        </div>

        <div
          v-show="mode === 'form'"
          id="panel-form"
          role="tabpanel"
          aria-labelledby="tab-form"
          class="build__body">
          <template v-if="loading">
            <InvoiceFields
              :form="form"
              :clients="[]"
              :currencies="[]"
              mode="edit"
              loading />
          </template>
          <template v-else>
            <div v-if="locked" class="banner" style="margin-bottom: 1.5rem">
              <UiIcon icon="heroicons:lock-closed" custom-class="w-5 h-5" />
              <span>
                {{ form.status }} invoices are read-only, so your records match
                what your client has. You can still download it below.
              </span>
            </div>
            <div v-if="recoveredAmount" class="banner" style="margin-bottom: 1.5rem">
              <UiIcon icon="heroicons:information-circle" custom-class="w-5 h-5" />
              <span>
                This invoice was saved before itemised lines existed, so its
                total is shown as a single line. Split it up if you like — the
                amount stays the same either way.
              </span>
            </div>
            <InvoiceFields
              :form="form"
              :clients="clientStore.clients"
              :currencies="currencyOptions"
              mode="edit"
              :locked="locked"
              :paid-so-far="paidSoFar" />
          </template>
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
            <NuxtLink to="/invoices" class="desk-btn desk-btn--ghost">
              Back
            </NuxtLink>
            <!-- No disabled "Locked" button when the invoice is settled. The
                 banner above already says what state it is in and why; a greyed
                 primary action adds nothing except a control that looks like the
                 page is broken. -->
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
              {{ saving ? "Saving…" : "Update invoice" }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── The invoice ──────────────────────────────────────────────────── -->
      <div class="pv">
        <div class="pv__head">
          <div>
            <h2 class="card__title">What your client will see</h2>
            <p class="money__note">
              Unsaved edits show here first. The PDF is built from this same
              file.
            </p>
          </div>
        </div>

        <InvoicePaymentHistory
          v-if="!loading && original"
          :invoice-id="invoiceId"
          :refresh-key="moneyKey"
          @changed="reloadMoney"
          @notify="toast = $event" />

        <InvoiceDeliver
          :invoice-id="invoiceId"
          :invoice-number="form.invoiceNumber"
          :status="form.status"
          @notify="toast = $event" />

        <div class="pv__stage">
          <InvoicePaper :doc="doc" variant="screen" :loading="loading" />
        </div>
      </div>
    </div>

    <UiToast v-model="toast" />
  </div>
</template>
