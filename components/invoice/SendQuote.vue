<script setup>
/**
 * Getting a quotation to the client.
 *
 * Deliberately not InvoiceDeliver. That component offers a payment link and
 * talks about being paid, neither of which applies here — a quotation is an
 * offer, and the only thing to do with it is put it in front of somebody.
 *
 * The PDF comes from the invoice PDF route, which renders /invoices/:id/export;
 * that page reads `kind` off the record and draws a quotation, so one route
 * serves both and the two can never disagree about what the document says.
 */
import { computed, ref } from "vue";

const props = defineProps({
  quoteId: { type: [Number, String], required: true },
  quoteNumber: { type: String, default: "" },
  client: { type: Object, default: null },
  amount: { type: [Number, String], default: 0 },
  currency: { type: String, default: "MYR" },
  validUntil: { type: String, default: "" },
});

const emit = defineEmits(["notify"]);

const { $api } = useNuxtApp();
const busy = ref("");
const copied = ref(false);

/* Deliberately not falling back to the row id. This label is read by the client
   — it goes in the message and on the PDF filename — and a database key dressed
   up as a reference number is one they will quote back at you. If there is no
   quote number yet, say nothing rather than something wrong. */
const label = computed(() => props.quoteNumber || "");

const download = async () => {
  busy.value = "pdf";
  try {
    const res = await $api.get(`/invoices/${props.quoteId}/pdf`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = label.value ? `Quotation-${label.value}.pdf` : "Quotation.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    emit("notify", { message: "Downloaded. Send it however you like.", type: "success" });
  } catch {
    emit("notify", {
      message: "Could not build the PDF. Try again in a moment.",
      type: "error",
    });
  } finally {
    busy.value = "";
  }
};

/* A ready-made message, because the alternative is the user writing the same
   three sentences every time. Clipboard, not a mailto: — a mailto with a body
   this long is truncated by several clients and mangled by others. */
const message = computed(() => {
  const who = props.client?.name ? props.client.name.split(/\s+/)[0] : "there";
  const sum = `${props.currency} ${Number(props.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const holds = props.validUntil
    ? ` The price holds until ${props.validUntil}.`
    : "";
  const ref = label.value ? ` ${label.value}` : "";
  return `Hi ${who}, here is quotation${ref} for ${sum}.${holds} The PDF is attached — let me know if you would like to go ahead and I will send the invoice.`;
});

const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(message.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    emit("notify", {
      message: "Could not reach your clipboard — select the text and copy it.",
      type: "error",
    });
  }
};

const mailto = computed(() => {
  const to = props.client?.email || "";
  const subject = label.value ? `Quotation ${label.value}` : "Quotation";
  return `mailto:${to}?subject=${encodeURIComponent(subject)}`;
});
</script>

<template>
  <section class="card" aria-labelledby="send-quote">
    <div class="card__head">
      <div>
        <h2 id="send-quote" class="card__title">Send it to them</h2>
        <p class="money__note">
          Download the PDF and attach it. Quotations are not emailed
          automatically — nothing goes out until you send it.
        </p>
      </div>
    </div>

    <div class="deliver">
      <div class="deliver__grid deliver__grid--one">
        <button
          type="button"
          class="desk-btn desk-btn--primary desk-btn--block"
          :disabled="!!busy"
          @click="download">
          <UiIcon
            :icon="busy === 'pdf' ? 'heroicons:arrow-path' : 'heroicons:arrow-down-tray'"
            :custom-class="busy === 'pdf' ? 'w-4 h-4 spin' : 'w-4 h-4'" />
          Download PDF
        </button>
      </div>

      <div>
        <span class="f__label">A message to go with it</span>
        <p class="deliver__msg">{{ message }}</p>
        <div class="deliver__msg-acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost desk-btn--sm"
            @click="copyMessage">
            <UiIcon
              :icon="copied ? 'heroicons:check' : 'heroicons:clipboard'"
              custom-class="w-4 h-4" />
            {{ copied ? "Copied" : "Copy message" }}
          </button>
          <a
            v-if="client?.email"
            :href="mailto"
            class="desk-btn desk-btn--ghost desk-btn--sm">
            <UiIcon icon="heroicons:envelope" custom-class="w-4 h-4" />
            Open email
          </a>
        </div>
        <p class="f__hint">
          <template v-if="client?.email">
            Opens a new email to {{ client.email }} with the subject filled in.
            Paste the message and attach the PDF.
          </template>
          <template v-else>
            No email saved for this client, so there is nobody to open a message
            to — add one on their record and it appears here.
          </template>
        </p>
      </div>
    </div>
  </section>
</template>
