<script setup>
/**
 * Settings → Email.
 *
 * The reminder interval, and a preview of the email a client receives.
 *
 * The preview was 90 lines of Tailwind rebuilding the email by hand — `bg-white`,
 * `bg-[#f8fafc]`, `bg-[#eff6ff]`, `text-blue-600`, `bg-[#0f172a]` — with a
 * hard-coded client name ("Iman Muqri"), a hard-coded invoice number and a
 * hard-coded amount of 20.99. Three problems with that: the literal hex values
 * are outside the palette entirely; `bg-white` and `text-slate-*` get remapped
 * by the dark-mode layer, so a user in dark mode was shown a dark email their
 * client will never receive; and it is a second, drifting copy of a template
 * that actually lives on the server.
 *
 * It now uses the same fixed brand ramps as the invoice document, for the same
 * reason — an email preview is a picture of something that leaves the building,
 * so it cannot be theme-dependent — and the sample values come from the user's
 * own settings where they exist, so what you tune is what you see.
 */
import { computed } from "vue";

const props = defineProps({
  form: { type: Object, required: true },
  isPro: { type: Boolean, default: false },
  senderName: { type: String, default: "" },
});

const emit = defineEmits(["go"]);

const from = computed(
  () => props.form.companyName || props.senderName || "Your business",
);
const currency = computed(() => props.form.defaultCurrency || "MYR");
</script>

<template>
  <div>
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Chasing by email</h2>
        <p class="sec__note">
          The first email goes out when you send the invoice. This is about what
          happens after that.
        </p>
      </div>
      <BusinessReminders
        v-model="form.reminderInterval"
        channel="email"
        :is-pro="isPro"
        @go="emit('go', $event)" />
    </section>

    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">What lands in their inbox</h2>
        <p class="sec__note">
          Sample figures. Your business name and currency are the real ones.
        </p>
      </div>

      <div class="pv__stage">
        <article class="mail">
          <div class="mail__pad">
            <p class="mail__brand">InvoKita</p>

            <p class="mail__hi">Hi Aisyah,</p>
            <p class="mail__intro">
              You have received an invoice from <b>{{ from }}</b>.
            </p>

            <div class="mail__card">
              <span class="mail__tag">Due</span>
              <p class="mail__ref">INV-0005</p>
              <p class="mail__eyebrow">Amount due</p>
              <p class="mail__amount">{{ currency }} 1,200.00</p>
              <p class="mail__due">Due 18 August 2026</p>
            </div>

            <p class="mail__cta">View and pay</p>

            <p class="mail__foot">
              A PDF copy is attached to the email.
            </p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Scoped to this preview, and built from the same fixed brand ramps the invoice
   document uses — never a semantic alias — because this is a picture of an
   artefact that leaves the building. See assets/css/invoice-paper.css. */
.mail {
  width: 100%;
  max-width: 26rem;
  border: 1px solid var(--a-ink-12);
  background-color: var(--paper-25);
  color: var(--ink-950);
  font-family: var(--font-sans);
}
.mail__pad {
  padding: var(--space-6) var(--space-5);
  text-align: center;
}
.mail__brand {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--ink-950);
}
.mail__hi {
  margin-top: var(--space-5);
  text-align: left;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--ink-950);
}
.mail__intro {
  margin-top: var(--space-1);
  text-align: left;
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
  color: var(--ink-800);
}
.mail__card {
  margin-top: var(--space-5);
  padding: var(--space-5) var(--space-4);
  border: 1px solid var(--a-ink-08);
  background-color: var(--paper-50);
}
.mail__tag {
  display: inline-block;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  background-color: var(--clay-50);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--clay-700);
}
.mail__ref {
  margin-top: var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--ink-700);
}
.mail__eyebrow {
  margin-top: var(--space-3);
  font-size: var(--text-2xs);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--ink-700);
}
.mail__amount {
  margin-top: var(--space-1);
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--ink-950);
}
.mail__due {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--a-ink-08);
  font-size: var(--text-2xs);
  color: var(--ink-700);
}
.mail__cta {
  display: inline-block;
  margin-top: var(--space-5);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  background-color: var(--green-700);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: #ffffff;
}
.mail__foot {
  margin-top: var(--space-5);
  font-size: var(--text-2xs);
  color: var(--ink-700);
}
</style>
