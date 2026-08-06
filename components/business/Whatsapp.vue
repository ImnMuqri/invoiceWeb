<script setup>
/**
 * Settings → WhatsApp.
 *
 * Two decisions: which number messages come from, and what they say.
 *
 * The old tab put a `backdrop-blur` overlay across the whole panel for free
 * users — content visible but unreadable underneath, which is a screenshot of a
 * paywall rather than an explanation of one. The gate is a sentence at the top
 * now and the controls below it are simply disabled, so you can read what you
 * would be getting.
 */
import { computed } from "vue";

const props = defineProps({
  form: { type: Object, required: true },
  isPro: { type: Boolean, default: false },
  companyName: { type: String, default: "" },
  senderName: { type: String, default: "" },
  currency: { type: String, default: "MYR" },
});

const emit = defineEmits(["go"]);

/* One definition each, used as the textarea's placeholder AND as what the
   preview falls back to — so "leave it blank and we use ours" can be seen
   rather than taken on trust. Two copies of these strings would drift. */
const DEFAULTS = {
  send: "Hi {{clientName}}, here is invoice *{{invoiceNumber}}* for {{currency}} {{totalAmount}}, due {{dueDate}}.\n\nYou can view and pay it here: {{invoiceUrl}}\n\nThank you,\n{{companyName}}",
  remind:
    "Hi {{clientName}}, a quick reminder that invoice *{{invoiceNumber}}* for {{currency}} {{totalAmount}} was due on {{dueDate}}.\n\nHere is the link again: {{invoiceUrl}}\n\nThanks,\n{{companyName}}",
};

const previewOf = ref("send");

/** True when the box for the message being previewed has something in it. */
const showingOwn = computed(() =>
  Boolean(
    (previewOf.value === "send"
      ? props.form.whatsappSendTemplate
      : props.form.whatsappReminderTemplate
    )?.trim(),
  ),
);

const MODES = [
  {
    value: "SYSTEM",
    name: "Our number",
    note: "Nothing to set up. Messages come from the InvoKita business number.",
  },
  {
    value: "CUSTOM",
    name: "Your own Twilio",
    note: "Messages come from your number. You supply the Twilio credentials.",
  },
];

const TOKENS = [
  "{{userName}}",
  "{{companyName}}",
  "{{clientName}}",
  "{{invoiceNumber}}",
  "{{totalAmount}}",
  "{{currency}}",
  "{{dueDate}}",
  "{{invoiceUrl}}",
];

const copied = ref("");

const copyToken = async (t) => {
  try {
    await navigator.clipboard.writeText(t);
    copied.value = t;
    setTimeout(() => (copied.value = ""), 1500);
  } catch {
    /* Clipboard refused; the token is selectable either way. */
  }
};

/* Custom mode is only actually usable once all three credentials are in. Saying
   so beats letting someone pick it, save, and find out from a failed send. */
const twilioReady = computed(
  () =>
    !!props.form.twilioSid &&
    !!props.form.twilioAuthToken &&
    !!props.form.twilioPhoneNumber,
);
</script>

<template>
  <div>
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Where messages come from</h2>
      </div>

      <div v-if="!isPro" class="gate" style="margin-bottom: 1rem">
        <UiIcon icon="heroicons:lock-closed" custom-class="w-4 h-4" />
        <span class="gate__grow">
          Sending over WhatsApp is a paid feature. Everything below is what you
          would be setting up.
        </span>
        <button
          type="button"
          class="desk-btn desk-btn--ghost desk-btn--sm"
          @click="emit('go', 'billing')">
          See plans
        </button>
      </div>

      <div class="pickcard pickcard--two">
        <label
          v-for="m in MODES"
          :key="m.value"
          class="pickcard__opt"
          :class="{
            'pickcard__opt--on': form.whatsappMode === m.value,
            'pickcard__opt--off': !isPro,
          }">
          <input
            type="radio"
            name="wa-mode"
            class="pickcard__inp"
            :value="m.value"
            :checked="form.whatsappMode === m.value"
            :disabled="!isPro"
            @change="form.whatsappMode = m.value" />
          <span class="pickcard__body">
            <span class="pickcard__name">{{ m.name }}</span>
            <span class="pickcard__note">{{ m.note }}</span>
          </span>
          <span class="pickcard__mark" aria-hidden="true">
            <UiIcon icon="heroicons:check-16-solid" custom-class="w-3 h-3" />
          </span>
        </label>
      </div>

      <template v-if="form.whatsappMode === 'CUSTOM'">
        <div class="sums" style="margin-top: 1rem; display: block">
          <div class="f" style="margin: 0">
            <label class="f__label" for="wa-sid">Twilio account SID</label>
            <input
              id="wa-sid"
              v-model="form.twilioSid"
              type="text"
              class="inp no-ik"
              autocomplete="off"
              :disabled="!isPro"
              placeholder="AC…" />
          </div>
          <div class="fgrid" style="margin-top: 1rem">
            <div class="f" style="margin: 0">
              <label class="f__label" for="wa-token">Auth token</label>
              <input
                id="wa-token"
                v-model="form.twilioAuthToken"
                type="password"
                class="inp no-ik"
                autocomplete="off"
                :disabled="!isPro"
                placeholder="••••••••" />
            </div>
            <div class="f" style="margin: 0">
              <label class="f__label" for="wa-number">WhatsApp number</label>
              <input
                id="wa-number"
                v-model="form.twilioPhoneNumber"
                type="text"
                class="inp no-ik"
                :disabled="!isPro"
                placeholder="whatsapp:+60…" />
            </div>
          </div>
          <p class="f__hint">
            <template v-if="twilioReady">
              Saved credentials are encrypted. We use them only to send your
              messages.
            </template>
            <template v-else>
              All three are needed before anything can send from your own number.
            </template>
          </p>
        </div>
      </template>
    </section>

    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">When they go out</h2>
      </div>
      <BusinessReminders
        v-model="form.whatsappReminderInterval"
        channel="WhatsApp"
        :is-pro="isPro"
        @go="emit('go', $event)" />
    </section>

    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">What they say</h2>
        <p class="sec__note">
          Leave either blank to use ours. Anything in braces is filled in per
          invoice — click one to copy it.
        </p>
      </div>

      <div class="tokens" style="margin-bottom: 1rem">
        <button
          v-for="t in TOKENS"
          :key="t"
          type="button"
          class="token"
          @click="copyToken(t)">
          {{ copied === t ? "copied" : t }}
        </button>
      </div>

      <div class="f">
        <label class="f__label" for="wa-send">Sending an invoice</label>
        <textarea
          id="wa-send"
          v-model="form.whatsappSendTemplate"
          rows="5"
          class="inp no-ik"
          :disabled="!isPro"
          :placeholder="DEFAULTS.send"
          @focus="previewOf = 'send'"></textarea>
      </div>

      <div class="f">
        <label class="f__label" for="wa-remind">Chasing a late one</label>
        <textarea
          id="wa-remind"
          v-model="form.whatsappReminderTemplate"
          rows="5"
          class="inp no-ik"
          :disabled="!isPro"
          :placeholder="DEFAULTS.remind"
          @focus="previewOf = 'remind'"></textarea>
        <p class="f__hint">
          Keep it short and friendly. A reminder that reads like a legal notice
          gets ignored more often than one that reads like a person.
        </p>
      </div>
    </section>

    <!-- ── On their phone ───────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">On their phone</h2>
        <p class="sec__note">
          <template v-if="showingOwn">
            Your wording, with the placeholders filled in.
          </template>
          <template v-else>
            You have not written this one, so this is what we would send.
          </template>
          WhatsApp's own formatting works here — <b>*bold*</b>,
          <i>_italic_</i>, <s>~strikethrough~</s> and <code>```mono```</code>.
        </p>
      </div>

      <div class="bar" style="margin-bottom: var(--space-3)">
        <div class="segs" role="group" aria-label="Which message to preview">
          <button
            type="button"
            class="seg"
            :class="{ 'seg--on': previewOf === 'send' }"
            :aria-pressed="previewOf === 'send'"
            @click="previewOf = 'send'">
            Sending it
          </button>
          <button
            type="button"
            class="seg"
            :class="{ 'seg--on': previewOf === 'remind' }"
            :aria-pressed="previewOf === 'remind'"
            @click="previewOf = 'remind'">
            Chasing it
          </button>
        </div>
        <!-- Whose wording is on screen. Not `.bar__count` — that class is in
             the mono numeral group, so this sentence was rendering in Geist
             Mono, which is for figures. -->
        <span class="set__dirty">
          {{ showingOwn ? "Your version" : "Our default" }}
        </span>
      </div>

      <BusinessWaPreview
        :template="
          previewOf === 'send'
            ? form.whatsappSendTemplate
            : form.whatsappReminderTemplate
        "
        :fallback="previewOf === 'send' ? DEFAULTS.send : DEFAULTS.remind"
        :company-name="companyName"
        :sender-name="senderName"
        :currency="currency" />
    </section>
  </div>
</template>
