<script setup>
/**
 * Getting a quotation to the client (spec 07).
 *
 * Deliberately not InvoiceDeliver. That component offers a payment link and
 * talks about being paid, neither of which applies here — a quotation is an
 * offer, and the only thing to do with it is put it in front of somebody and
 * wait for an answer.
 *
 * What changed with spec 07: this used to hand the user a PDF and a block of
 * text to paste somewhere themselves, which meant the answer came back — if it
 * came back at all — into a WhatsApp thread the product knew nothing about. Now
 * the send goes through the same channels invoices do, and what the client
 * receives is a LINK to a page with accept and decline on it. The answer lands
 * in the product.
 *
 * What has not changed, and must not: nothing here schedules a follow-up. A
 * quotation is sent when the user presses this button, and never again unless
 * they press it again. The client who does not reply is not chased.
 */
import { computed, ref } from "vue";
import { cash } from "~/utils/invoice";
import { useQuoteStore } from "~/stores/quoteStore";

const props = defineProps({
  quoteId: { type: [Number, String], required: true },
  quoteNumber: { type: String, default: "" },
  client: { type: Object, default: null },
  amount: { type: [Number, String], default: 0 },
  currency: { type: String, default: "MYR" },
  validUntil: { type: String, default: "" },
  /** The client-facing url, from GET /quotes/:id. */
  publicUrl: { type: String, default: "" },
  /** Already answered — sending again would be talking past the answer. */
  answered: { type: Boolean, default: false },
});

const emit = defineEmits(["notify", "sent"]);

const { $api } = useNuxtApp();
const quoteStore = useQuoteStore();

const busy = ref("");
const copied = ref(false);

/* Deliberately not falling back to the row id. This label is read by the client
   — it goes in the message and on the PDF filename — and a database key dressed
   up as a reference number is one they will quote back at you. If there is no
   quote number yet, say nothing rather than something wrong. */
const label = computed(() => props.quoteNumber || "");

const hasEmail = computed(() => !!props.client?.email);
const hasPhone = computed(() => !!props.client?.phone);
const canSend = computed(() => hasEmail.value || hasPhone.value);

const send = async (channel) => {
  busy.value = channel;
  try {
    const data = await quoteStore.sendQuote(props.quoteId, channel);

    /* A partial send comes back 207 with `failed` alongside `sent`. Reporting
       "sent" when only half of it went is the kind of small lie that costs
       somebody a deal, so the half that failed is named. */
    if (data?.failed?.length) {
      emit("notify", {
        message: `${data.message} The email went; WhatsApp did not.`,
        type: "error",
      });
    } else {
      emit("notify", { message: data.message, type: "success" });
    }
    emit("sent", data);
  } catch (err) {
    emit("notify", {
      message:
        err.response?.data?.message ||
        "Could not send that. Nothing has gone to your client.",
      type: "error",
    });
  } finally {
    busy.value = "";
  }
};

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
    emit("notify", { message: "Downloaded.", type: "success" });
  } catch {
    emit("notify", {
      message: "Could not build the PDF. Try again in a moment.",
      type: "error",
    });
  } finally {
    busy.value = "";
  }
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.publicUrl);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    emit("notify", {
      message: "Could not reach your clipboard — select the link and copy it.",
      type: "error",
    });
  }
};
</script>

<template>
  <section class="card" aria-labelledby="send-quote">
    <div class="card__head">
      <div>
        <h2 id="send-quote" class="card__title">Send it to them</h2>
        <p class="money__note">
          They get a page with accept and decline on it — no account, no login.
          Nothing follows up on its own.
        </p>
      </div>
    </div>

    <div class="deliver">
      <!-- Already answered: sending again talks past the answer. -->
      <p v-if="answered" class="f__hint">
        This quotation has been answered, so there is nothing left to send. You
        can still download the PDF for your records.
      </p>

      <div v-else class="deliver__grid">
        <button
          type="button"
          class="desk-btn desk-btn--primary desk-btn--block"
          :disabled="!!busy || !hasEmail"
          @click="send('email')">
          <UiIcon
            :icon="busy === 'email' ? 'heroicons:arrow-path' : 'heroicons:envelope'"
            :custom-class="busy === 'email' ? 'w-4 h-4 spin' : 'w-4 h-4'" />
          {{ busy === "email" ? "Sending…" : "Send by email" }}
        </button>

        <button
          type="button"
          class="desk-btn desk-btn--ghost desk-btn--block"
          :disabled="!!busy || !hasPhone"
          @click="send('whatsapp')">
          <UiIcon
            :icon="busy === 'whatsapp' ? 'heroicons:arrow-path' : 'ic:baseline-whatsapp'"
            :custom-class="busy === 'whatsapp' ? 'w-4 h-4 spin' : 'w-4 h-4'" />
          {{ busy === "whatsapp" ? "Sending…" : "Send on WhatsApp" }}
        </button>
      </div>

      <p v-if="!answered && !canSend" class="f__hint">
        This client has neither an email address nor a phone number saved, so
        there is nowhere to send it. Add one on their record and the buttons
        come alive.
      </p>
      <p v-else-if="!answered && !hasPhone" class="f__hint">
        No phone number saved for this client, so WhatsApp is unavailable.
      </p>
      <p v-else-if="!answered && !hasEmail" class="f__hint">
        No email address saved for this client, so email is unavailable.
      </p>

      <!-- The link itself, for the user who would rather paste it into a thread
           they already have open. Same url, same page, same buttons. -->
      <div v-if="publicUrl">
        <span class="f__label">Their link</span>
        <p class="deliver__msg" style="word-break: break-all">{{ publicUrl }}</p>
        <div class="deliver__msg-acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost desk-btn--sm"
            @click="copyLink">
            <UiIcon
              :icon="copied ? 'heroicons:check' : 'heroicons:clipboard'"
              custom-class="w-4 h-4" />
            {{ copied ? "Copied" : "Copy link" }}
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--ghost desk-btn--sm"
            :disabled="!!busy"
            @click="download">
            <UiIcon
              :icon="busy === 'pdf' ? 'heroicons:arrow-path' : 'heroicons:arrow-down-tray'"
              :custom-class="busy === 'pdf' ? 'w-4 h-4 spin' : 'w-4 h-4'" />
            Download PDF
          </button>
        </div>
        <p class="f__hint">
          Anyone with this link can accept or decline, so send it to your client
          and nobody else. The quoted price of
          {{ currency }} {{ cash(amount) }}
          <template v-if="validUntil"> holds until {{ validUntil }}</template>
          <template v-else> has no expiry date set</template>.
        </p>
      </div>
    </div>
  </section>
</template>
