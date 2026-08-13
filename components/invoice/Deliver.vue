<script setup>
/**
 * What you can do with an invoice that now exists.
 *
 * This replaces a sequence the old pages ran after every save: a spinner
 * captioned "Generating PDF…", then "Preparing your bill precisely…", then a
 * full-card success badge over the invoice — 4,000ms of setTimeout that began
 * *after* the API had already returned. Nothing was being generated. The PDF is
 * produced on demand when someone asks for it.
 *
 * An invoice is not finished when it is saved; it is finished when the client
 * has it. So the moment after saving names the three ways to get it to them and
 * hands over the payment link, which the product's own help text promised
 * existed and which neither page had ever surfaced.
 */
import { computed, ref } from "vue";
import { useInvoiceStore } from "~/stores/invoiceStore";
import { useAuthStore } from "~/stores/authStore";
import { useSystemStore } from "~/stores/systemStore";

const props = defineProps({
  invoiceId: { type: [String, Number], required: true },
  invoiceNumber: { type: [String, Number], default: "" },
  /** Paid invoices can still be downloaded; chasing them would be rude. */
  status: { type: String, default: "Pending" },
  /** Shown on create only — on edit the invoice was already there. */
  justSaved: { type: Boolean, default: false },
});

const emit = defineEmits(["notify"]);

const invoiceStore = useInvoiceStore();
const authStore = useAuthStore();
const systemStore = useSystemStore();

const busy = ref("");
const copied = ref(false);

const isSettled = computed(
  () => props.status === "Paid" || props.status === "Cancelled",
);

/* `useRequestURL()` rather than `window.location`: the latter is undefined
   during SSR, so any fallback produces different markup on the server than on
   the client and Vue reports a hydration mismatch on every render of this
   panel. This resolves to the same origin in both places. */
const origin = useRequestURL().origin;
const publicUrl = computed(() => `${origin}/pay/${props.invoiceId}`);

/* One place that decides whether a channel is available, and — the part the old
   pages got wrong — one place that says why it is not. A disabled button with no
   explanation is a dead end; the tooltip below always has a reason. */
const channel = (kind) => {
  const enabled =
    kind === "email"
      ? systemStore.isEmailEnabled
      : systemStore.isWhatsappEnabled;
  if (!enabled)
    return {
      ok: false,
      why: `${kind === "email" ? "Email" : "WhatsApp"} sending is paused for maintenance. Download the PDF and send it yourself in the meantime.`,
    };
  if (!authStore.isPro)
    return {
      ok: false,
      why: `Sending from InvoKita is a paid feature. You can still download the PDF and send it however you like.`,
    };
  if (isSettled.value)
    return {
      ok: false,
      why: `This invoice is ${props.status.toLowerCase()} — there is nothing to chase.`,
    };
  return { ok: true, why: "" };
};

const email = computed(() => channel("email"));
const whatsapp = computed(() => channel("whatsapp"));

const run = async (kind, fn, done) => {
  busy.value = kind;
  try {
    const res = await fn();
    emit("notify", { message: done(res), type: "success" });
    return res;
  } catch (err) {
    emit("notify", {
      message:
        err.response?.data?.message ||
        err.message ||
        "That did not go through. Try again in a moment.",
      type: "error",
    });
  } finally {
    busy.value = "";
  }
};

const download = () =>
  run(
    "pdf",
    () =>
      invoiceStore.downloadPdf(
        props.invoiceId,
        `Invoice-${props.invoiceNumber || props.invoiceId}.pdf`,
      ),
    () => "PDF downloaded.",
  );

const sendEmail = () =>
  run(
    "email",
    () => invoiceStore.sendInvoice(props.invoiceId, "email"),
    (res) => res?.message || "Emailed to your client.",
  );

const sendWhatsapp = () =>
  run(
    "wa",
    () => invoiceStore.whatsappInvoice(props.invoiceId),
    (res) => {
      if (res?.waLink) window.open(res.waLink, "_blank");
      return res?.message || "WhatsApp message ready to send.";
    },
  );

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(publicUrl.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    emit("notify", {
      message: "Could not reach your clipboard — select the link and copy it.",
      type: "error",
    });
  }
};

/* ── Share by hand ─────────────────────────────────────────────────────────
   Opens the user's own WhatsApp with our wording already in the box. Not gated
   on isPro or on the platform WhatsApp switch, and correctly so: both of those
   govern messages WE send through Twilio, and this sends nothing. Gating it
   would be charging for the clipboard.

   It is offered even on a settled invoice — a client asking for a copy of
   something they have already paid is a normal request. */
const { share, sharing, isMobile } = useWhatsappShare();

const shareWhatsapp = async () => {
  const res = await share("invoice", props.invoiceId);

  if (res.ok) {
    emit("notify", {
      message: "WhatsApp is open on your client's chat — press send there.",
      type: "success",
    });
    return;
  }

  emit("notify", {
    message: res.noPhone
      ? res.phoneProblem === "unusable"
        ? "That client's phone number is not one WhatsApp can open — it usually needs the country code, e.g. 016… saved as +6016…. Fix it on their record and try again."
        : "No phone number saved for this client, so there is no chat to open. Add one on their record and this will go straight to them."
      : res.blocked
        ? "Your browser blocked the new tab. Allow pop-ups for this site, or copy the payment link below and paste it into WhatsApp."
        : res.error,
    type: "error",
  });
};
</script>

<template>
  <section class="card" aria-labelledby="deliver-title">
    <div class="card__head">
      <div>
        <h2 id="deliver-title" class="card__title">
          {{
            justSaved
              ? `Invoice ${invoiceNumber || ""} is saved`
              : "Send it to your client"
          }}
        </h2>
        <p class="money__note">
          {{
            isSettled
              ? "Settled. You can still download a copy for your records."
              : "It is not really an invoice until they have it."
          }}
        </p>
      </div>
    </div>

    <div class="deliver">
      <!-- A settled invoice does not get send buttons at all. Rendering them
           greyed out puts two dead controls on the page, tells you why only if
           you can hover, and drops their labels to ~3:1 into the bargain. The
           sentence below carries the same information and takes less room. -->
      <div class="deliver__grid" :class="{ 'deliver__grid--few': isSettled }">
        <button
          type="button"
          class="desk-btn desk-btn--primary desk-btn--block"
          :disabled="!!busy"
          @click="download">
          <UiIcon
            :icon="
              busy === 'pdf' ? 'heroicons:arrow-path' : 'heroicons:arrow-down-tray'
            "
            :custom-class="busy === 'pdf' ? 'w-4 h-4 spin' : 'w-4 h-4'" />
          Download PDF
        </button>

        <template v-if="!isSettled">
          <button
            type="button"
            class="desk-btn desk-btn--ghost desk-btn--block"
            :disabled="!!busy || !email.ok"
            :title="email.why"
            @click="sendEmail">
            <UiIcon
              :icon="busy === 'email' ? 'heroicons:arrow-path' : 'heroicons:envelope'"
              :custom-class="busy === 'email' ? 'w-4 h-4 spin' : 'w-4 h-4'" />
            Send by email
          </button>

          <!-- "We send it" versus "you send it" below. Two WhatsApp buttons
               reading "WhatsApp it" and "Share on WhatsApp" would be a guess
               about which one spends an allowance, so each says who presses
               send. -->
          <button
            type="button"
            class="desk-btn desk-btn--wa desk-btn--block"
            :disabled="!!busy || !whatsapp.ok"
            :title="whatsapp.why"
            @click="sendWhatsapp">
            <UiIcon
              :icon="busy === 'wa' ? 'heroicons:arrow-path' : 'simple-icons:whatsapp'"
              :custom-class="busy === 'wa' ? 'w-4 h-4 spin' : 'w-4 h-4'" />
            Send on WhatsApp
          </button>
        </template>

        <!-- Always offered, settled or not, paid plan or not: this sends nothing
             from us, so there is nothing to gate and nothing to meter. -->
        <button
          type="button"
          class="desk-btn desk-btn--ghost desk-btn--block"
          :disabled="!!busy || sharing"
          :title="
            isMobile
              ? 'Opens the WhatsApp app on your client\'s chat with the message already written. You press send.'
              : 'Opens WhatsApp Web on your client\'s chat with the message already written. You press send.'
          "
          @click="shareWhatsapp">
          <UiIcon
            :icon="sharing ? 'heroicons:arrow-path' : 'simple-icons:whatsapp'"
            :custom-class="sharing ? 'w-4 h-4 spin' : 'w-4 h-4'" />
          <!-- "Web" only where it is true. On a phone this hands off to the
               installed app, and a button promising WhatsApp Web there is
               describing something the reader will never see. -->
          {{
            sharing
              ? "Opening…"
              : isMobile
                ? "Open in WhatsApp"
                : "Open in WhatsApp Web"
          }}
        </button>
      </div>

      <!-- The distinction between the two WhatsApp actions, said in words rather
           than left to the button labels. -->
      <p class="f__hint">
        <b>{{ isMobile ? "Open in WhatsApp" : "Open in WhatsApp Web" }}</b>
        opens {{ isMobile ? "the WhatsApp app" : "WhatsApp Web" }}
        <b>on your client's number</b> with the message already typed — nothing
        goes out until you press send there, and it costs nothing. Needs a phone
        number on the client's record.
        <template v-if="!isSettled">
          <b>Send on WhatsApp</b> delivers it from InvoKita for you.
        </template>
        Both use the wording from your WhatsApp settings.
      </p>

      <!-- Why a channel is unavailable, said once, in words. -->
      <p v-if="!isSettled && (!email.ok || !whatsapp.ok)" class="f__hint">
        {{ !email.ok ? email.why : whatsapp.why }}
      </p>

      <div>
        <span class="f__label">Payment link</span>
        <div class="deliver__link">
          <span class="deliver__url">{{ publicUrl }}</span>
          <button
            type="button"
            class="desk-btn desk-btn--ghost desk-btn--sm"
            @click="copyLink">
            {{ copied ? "Copied" : "Copy" }}
          </button>
          <NuxtLink
            :to="`/pay/${invoiceId}`"
            target="_blank"
            class="desk-btn desk-btn--ghost desk-btn--sm">
            Open
          </NuxtLink>
        </div>
        <p class="f__hint">
          <template v-if="isSettled">
            Kept live so your client can still find their receipt.
          </template>
          <template v-else>
            Anyone with this link can view and pay this invoice — no account
            needed. Paste it into a chat and you are done.
          </template>
        </p>
      </div>
    </div>
  </section>
</template>
