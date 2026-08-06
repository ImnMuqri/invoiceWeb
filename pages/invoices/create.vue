<script setup>
/**
 * THE BUILDER — new invoice.
 *
 * Same two-column idea as before, on the dashboard's design layer, with the
 * duplicated 1,700 lines lifted into components (InvoiceFields, InvoiceAssistant,
 * InvoicePaper, InvoiceDeliver) shared with the edit page.
 *
 * Four things about the old page were working against the person using it:
 *
 *  1. The form opened pre-filled with real-looking values — invoiceName
 *     "Website Overhaul", subject "Service per June 2023", a line item literally
 *     called "Item Name" priced 0. Not placeholders: actual form values, which
 *     save to actual invoices. Anyone who did not notice sent a client an
 *     invoice for someone else's project. It now opens empty, with the same
 *     strings as placeholders where they were genuinely useful examples.
 *
 *  2. Saving ran 4,000ms of setTimeout captioned "Saving Invoice…" then
 *     "Generating PDF…", *after* the API had already returned, then covered the
 *     invoice with a success badge for another 1,500ms. No PDF was being
 *     generated — that happens on demand, server-side, when someone asks for
 *     one. The theatre is gone; what replaces it is the invoice, saved, with the
 *     three ways to get it to the client and the payment link.
 *
 *  3. "Last saved: Today at 4:30 PM" was a hard-coded string. There is no draft
 *     autosave in this product, so it was telling people their work was safe
 *     when it was not. The footer now shows the live total, which is both true
 *     and the thing worth knowing next to a save button.
 *
 *  4. The WhatsApp button read `systemStore.isWhatsAppEnabled` — capital A,
 *     where the store defines `isWhatsappEnabled`. It was permanently
 *     `undefined`, so `!undefined` disabled the button for every user forever.
 *     Channel availability is now decided in one place (InvoiceDeliver).
 *
 * Data contracts unchanged: same store, same payload, same endpoints.
 */
import { computed, onMounted, ref, toRaw } from "vue";
import { useRouter } from "vue-router";
import { useInvoiceStore } from "~/stores/invoiceStore";
import { useClientStore } from "~/stores/clientStore";
import { useAuthStore } from "~/stores/authStore";
import { useSystemStore } from "~/stores/systemStore";
import { useUiStore } from "~/stores/uiStore";
import { cash, currencySymbol, docFromForm, totals } from "~/utils/invoice";

const router = useRouter();
const invoiceStore = useInvoiceStore();
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

/* Two weeks out. The only pre-filled value on the page, because a due date is
   the one field where a sensible default is better than an empty box — and it
   is the field the chaser counts from. */
const inTwoWeeks = () =>
  new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

const form = ref({
  clientId: "",
  invoiceNumber: "",
  invoiceName: "",
  subject: "",
  dueDate: inTwoWeeks(),
  currency: "MYR",
  addDiscount: false,
  discountPercentage: 0,
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
  lineItems: [{ name: "", priceStr: "", priceNum: 0, qty: 1 }],
  showManualClient: false,
  manualClient: { name: "", email: "", phone: "", company: "", address: "" },
});

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
  if (!systemStore.isInvoiceCreationEnabled) {
    router.push("/dashboard");
    return;
  }

  fetchCurrencies();
  clientStore.fetchClients();

  const u = authStore.user;
  const cfg = (await authStore.fetchInvoiceConfig()) || {};

  if (u) {
    const phones = [];
    if (cfg.invoiceIncludeCompanyPhone && u.companyPhone)
      phones.push(u.companyPhone);
    if (cfg.invoiceIncludePersonalPhone && u.phoneNumber)
      phones.push(u.phoneNumber);

    form.value.from = {
      name: cfg.invoiceIncludeName ? u.name || "" : "",
      companyName: cfg.invoiceIncludeCompanyName ? u.companyName || "" : "",
      companyEmail: cfg.invoiceIncludeEmail
        ? u.companyEmail || u.email || ""
        : "",
      companyAddress: cfg.invoiceIncludeAddress ? u.address || "" : "",
      phone: phones.join(" / "),
    };
    if (Number(cfg.defaultTaxRate) > 0) {
      form.value.taxRate = Number(cfg.defaultTaxRate);
    }
  }
});

/* ─── Derived ─────────────────────────────────────────────────────────────── */
const selectedClient = computed(() =>
  clientStore.clients.find((c) => c.id === form.value.clientId),
);

const sums = computed(() => totals(form.value));
const cur = computed(() => currencySymbol(form.value.currency));

const doc = computed(() =>
  docFromForm(form.value, {
    client: selectedClient.value,
    logo: authStore.user?.profile?.logoUrl || null,
  }),
);

/* Everything that must be true before this is a sendable invoice, each with the
   sentence to show if it is not. The old page validated on submit and told you
   one problem at a time; this can also disable the button honestly. */
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
        chat.value.push({
          role: "ai",
          content:
            "Done — take a look at the preview and change anything that is off.",
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

    const payload = {
      clientId,
      invoiceName: form.value.invoiceName,
      subject: form.value.subject,
      fromName: form.value.from.name,
      fromCompanyName: form.value.from.companyName,
      fromEmail: form.value.from.companyEmail,
      fromPhone: form.value.from.phone,
      fromAddress: form.value.from.companyAddress,
      date: new Date().toISOString(),
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

    const saved = await invoiceStore.addInvoice(payload);
    if (saved?.id) {
      savedId.value = saved.id;
      /* The response carries the server-assigned invoice number, which the
         preview and the PDF filename both need. */
      Object.assign(form.value, saved);
    }
    /* If a client was created along the way, keep the list in step so the
       preview stops showing a blank "Billed to". */
    if (form.value.showManualClient) {
      form.value.showManualClient = false;
      form.value.clientId = clientId;
      clientStore.fetchClients();
    }
    notify("Saved. Now get it in front of them.");
  } catch (err) {
    notify(
      err.response?.data?.message ||
        err.message ||
        "Could not save that invoice. Nothing has been sent.",
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
        <h1 class="desk__title">New invoice</h1>
        <p class="desk__sub">
          Fill it in on the left; your client's copy builds itself on the right.
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

    <div class="build">
      <!-- ── Editor ───────────────────────────────────────────────────────── -->
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
            greeting="Tell me what you are billing for and I will draft it. Anything I get wrong, fix it on the other tab — nothing is sent until you say so."
            :examples="[
              'Invoice Wayne RM1,200 for the software build',
              'Due 15 Nov, currency USD, subject: web design',
            ]"
            placeholder="e.g. Bill Aisyah RM800 for two days of consulting"
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
            mode="create" />
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
            <NuxtLink to="/invoices" class="desk-btn desk-btn--ghost">
              {{ savedId ? "Done" : "Discard" }}
            </NuxtLink>
            <!-- Once it exists, this page cannot update it — so the button
                 hands over to the page that can, instead of sitting there
                 disabled and saying "Saved". -->
            <NuxtLink
              v-if="savedId"
              :to="`/invoices/edit/${savedId}`"
              class="desk-btn desk-btn--primary">
              Keep editing
            </NuxtLink>
            <!-- Deliberately NOT disabled when the form is incomplete. A greyed
                 primary action with the reason hidden in a `title` is a dead end
                 on any touch device, and the 0.5-opacity disabled state drops the
                 label to 2.5:1 besides. Pressing it names what is missing; the
                 panel on the right says the same thing without being asked. -->
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
              {{ saving ? "Saving…" : "Save invoice" }}
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
              This is the document, not an impression of it — the PDF is built
              from the same file.
            </p>
          </div>
        </div>

        <!-- Delivery appears when there is something to deliver, and not one
             moment before. -->
        <InvoiceDeliver
          v-if="savedId"
          :invoice-id="savedId"
          :invoice-number="form.invoiceNumber"
          :status="form.status"
          just-saved
          @notify="toast = $event" />

        <div v-else-if="!ready" class="card">
          <p class="empty__title">
            {{ problems.length === 1 ? "One thing to go" : "Nearly there" }}
          </p>
          <p class="empty__body" style="margin-top: 0.5rem">
            To save this you need to
            <b>{{ problems.join(", and ") }}</b>. Everything else is optional —
            an invoice can be edited after it exists.
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
