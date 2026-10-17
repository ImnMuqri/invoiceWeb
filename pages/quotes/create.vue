<script setup>
/**
 * NEW QUOTATION.
 *
 * The same builder as an invoice, because it is the same act: pick a client,
 * list what you are doing, price it. The differences are small enough to be
 * flags rather than a second 450-line page — a validity date instead of a due
 * date, no status picker, and a document that says QUOTATION.
 *
 * InvoiceFields, InvoicePaper and InvoiceAssistant are reused untouched; the
 * form object carries `type: "quote"`, which is what docFromForm reads.
 */
import { computed, onMounted, ref, toRaw } from "vue";
import { useRouter } from "vue-router";
import { useQuoteStore } from "~/stores/quoteStore";
import { useClientStore } from "~/stores/clientStore";
import { useAuthStore } from "~/stores/authStore";
import { useSystemStore } from "~/stores/systemStore";
import { useUiStore } from "~/stores/uiStore";
import { cash, currencySymbol, docFromForm, totals } from "~/utils/invoice";

const router = useRouter();
const quoteStore = useQuoteStore();
const clientStore = useClientStore();
const authStore = useAuthStore();
const systemStore = useSystemStore();
const uiStore = useUiStore();
const { $api } = useNuxtApp();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const mode = ref("form");
const saving = ref(false);
const savedId = ref(null);
const usedAi = ref(false);
const currencyOptions = ref([]);
const invoiceConfig = ref(null);

/* Thirty days. Quotes are held open longer than invoices are given to be paid,
   and a price you offered three months ago is not a price you still mean. */
const inThirtyDays = () =>
  new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

const form = ref({
  type: "quote",
  clientId: "",
  invoiceNumber: "",
  invoiceName: "",
  subject: "",
  validUntil: inThirtyDays(),
  currency: "MYR",
  addDiscount: false,
  discountPercentage: 0,
  taxRate: 0,
  status: "Draft",
  template: "professional",
  from: {
    name: "",
    companyName: "",
    companyEmail: "",
    companyAddress: "",
    phone: "",
  },
  lineItems: [{ name: "", priceStr: "", priceNum: 0, qty: 1 }],
  showManualClient: false,
  manualClient: { name: "", email: "", phone: "", company: "", address: "" },
});

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
  if (!systemStore.isInvoiceCreationEnabled) {
    router.push("/dashboard");
    return;
  }
  fetchCurrencies();
  clientStore.fetchClients();

  const u = authStore.user;
  const cfg = (await authStore.fetchInvoiceConfig()) || {};
  invoiceConfig.value = cfg;
  if (u) {
    const phones = [];
    if (cfg.invoiceIncludeCompanyPhone && u.companyPhone) phones.push(u.companyPhone);
    if (cfg.invoiceIncludePersonalPhone && u.phoneNumber) phones.push(u.phoneNumber);
    form.value.from = {
      name: cfg.invoiceIncludeName ? u.name || "" : "",
      companyName: cfg.invoiceIncludeCompanyName ? u.companyName || "" : "",
      companyEmail: cfg.invoiceIncludeEmail ? u.companyEmail || u.email || "" : "",
      companyAddress: cfg.invoiceIncludeAddress ? u.address || "" : "",
      phone: phones.join(" / "),
      /* Spec 05. A quotation carries them too — the client keeps it, and the
         invoice that follows must say the same thing. */
      identifiers: cfg.invoiceIncludeTaxIdentifiers === false ? null : cfg,
    };
    if (Number(cfg.defaultTaxRate) > 0) form.value.taxRate = Number(cfg.defaultTaxRate);
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
    showClientIdentifiers:
      invoiceConfig.value?.invoiceIncludeClientIdentifiers !== false,
    /* Spec 09 — the preview draws the same footer the PDF will. */
    attribution: invoiceConfig.value?.attribution ?? null,
  }),
);

const problems = computed(() => {
  const f = form.value;
  const out = [];
  if (f.showManualClient) {
    if (!f.manualClient.name.trim()) out.push("give your new client a name");
    if (!f.manualClient.email.trim()) out.push("add an email to send it to");
  } else if (!f.clientId) {
    out.push("pick who this is for");
  }
  if (!f.lineItems.some((i) => Number(i.priceNum) > 0))
    out.push("put a price on at least one line");
  return out;
});

const ready = computed(() => problems.value.length === 0);

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
    });
    if (data.status === "success" && data.update) {
      usedAi.value = true;
      if (data.update.error) {
        chat.value.push({ role: "ai", content: data.update.error });
      } else {
        Object.assign(form.value, data.update);
        /* The parser is an invoice parser and will happily set a due date. A
           quotation has none — leaving one on the form would send it. */
        form.value.type = "quote";
        delete form.value.dueDate;
        chat.value.push({
          role: "ai",
          content: "Done — check the preview and change anything that is off.",
        });
      }
    } else {
      chat.value.push({
        role: "ai",
        content:
          data.message ||
          "I could not make sense of that. Try naming the client, the work and the amount.",
      });
    }
  } catch {
    chat.value.push({
      role: "ai",
      content:
        "I could not reach the drafting service. Fill it in by hand and nothing is lost.",
    });
  } finally {
    thinking.value = false;
  }
};

/* ─── Save ────────────────────────────────────────────────────────────────── */
const save = async () => {
  if (!ready.value) {
    notify(`Almost — ${problems.value.join(", ")}.`, "warning");
    return;
  }
  saving.value = true;
  let clientId = form.value.clientId;
  try {
    if (form.value.showManualClient) {
      const created = await clientStore.addClient({ ...form.value.manualClient });
      if (!created?.id) throw new Error("Could not save that client.");
      clientId = created.id;
    }

    const saved = await quoteStore.addQuote({
      clientId,
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
      status: "Sent",
      amount: sums.value.total,
      taxRate: form.value.taxRate,
      template: form.value.template,
      items: form.value.lineItems.map((i) => ({
        name: i.name,
        price: Number(i.priceNum) || 0,
        quantity: Number(i.qty) || 0,
      })),
      usedAi: usedAi.value,
    });

    if (saved?.id) {
      savedId.value = saved.id;
      Object.assign(form.value, saved, { type: "quote" });
    }
    if (form.value.showManualClient) {
      form.value.showManualClient = false;
      form.value.clientId = clientId;
      clientStore.fetchClients();
    }
    notify("Saved. Send it over and see what they say.");
  } catch (err) {
    notify(
      err.response?.data?.message ||
        err.message ||
        "Could not save that quotation. Nothing has been sent.",
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
        <h1 class="desk__title">New quotation</h1>
        <p class="desk__sub">
          Price the job before you do it. If they say yes, this becomes an
          invoice without you retyping any of it.
        </p>
      </div>
      <div class="desk__actions">
        <button
          type="button"
          class="desk-btn desk-btn--icon"
          aria-label="How this page works"
          @click="uiStore.openModuleHelp('quotes')">
          <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
        </button>
        <NuxtLink to="/quotes" class="desk-btn desk-btn--ghost">
          Back to quotations
        </NuxtLink>
      </div>
    </header>

    <div class="build">
      <div class="build__pane">
        <div class="tabs" role="tablist" aria-label="How to fill this in">
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
            Fill it in
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
            Just describe it
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
            greeting="Tell me what you are quoting for and I will draft it. Anything I get wrong, fix it on the other tab — nothing is sent until you say so."
            :examples="[
              'Quote Wayne RM4,000 for a five page website',
              'Two days of consulting at RM900 a day',
            ]"
            placeholder="e.g. Quote Aisyah RM2,500 for a brand refresh"
            @send="ask"
            @clear="chat = []" />
        </div>

        <div
          v-show="mode === 'form'"
          id="panel-form"
          role="tabpanel"
          aria-labelledby="tab-form"
          class="build__body">
          <InvoiceFields
            :form="form"
            :clients="clientStore.clients"
            :currencies="currencyOptions"
            mode="create"
            kind="quote" />
        </div>

        <div class="build__foot">
          <p class="build__total">
            <b>{{ cur }} {{ cash(sums.total) }}</b>
            <span>
              across {{ sums.count }}
              {{ sums.count === 1 ? "line" : "lines" }}
            </span>
          </p>
          <div class="desk__actions">
            <NuxtLink to="/quotes" class="desk-btn desk-btn--ghost">
              {{ savedId ? "Done" : "Discard" }}
            </NuxtLink>
            <NuxtLink
              v-if="savedId"
              :to="`/quotes/edit/${savedId}`"
              class="desk-btn desk-btn--primary">
              Keep editing
            </NuxtLink>
            <button
              v-else
              type="button"
              class="desk-btn desk-btn--primary"
              :disabled="saving"
              @click="save">
              <UiIcon
                v-if="saving"
                icon="heroicons:arrow-path"
                custom-class="w-4 h-4 spin" />
              {{ saving ? "Saving…" : "Save quotation" }}
            </button>
          </div>
        </div>
      </div>

      <div class="pv">
        <div class="pv__head">
          <div>
            <h2 class="card__title">What your client will see</h2>
            <p class="money__note">
              A quotation, not a bill — it carries no payment link and nothing
              chases it.
            </p>
          </div>
        </div>

        <InvoiceSendQuote
          v-if="savedId"
          :quote-id="savedId"
          :quote-number="form.invoiceNumber"
          :client="selectedClient"
          :amount="sums.total"
          :currency="form.currency"
          :valid-until="form.validUntil"
          @notify="toast = $event" />

        <div v-else-if="!ready" class="card">
          <p class="empty__title">
            {{ problems.length === 1 ? "One thing to go" : "Nearly there" }}
          </p>
          <p class="empty__body" style="margin-top: 0.5rem">
            To save this you need to <b>{{ problems.join(", and ") }}</b>.
            Everything else is optional.
          </p>
        </div>

        <div class="pv__stage">
          <InvoicePaper :doc="doc" variant="screen" />
        </div>
      </div>
    </div>

    <UiToast v-model="toast" />
  </div>
</template>
