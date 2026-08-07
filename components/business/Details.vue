<script setup>
/**
 * Settings → General & profile.
 *
 * Everything here ends up printed on an invoice, which is the through-line the
 * old copy never said out loud: it described the fields ("Set your business
 * details and address for invoice headers") rather than why you would fill them
 * in.
 *
 * `form` is mutated in place, same contract as InvoiceFields — the parent owns
 * the object, submits it, and knows which endpoint it belongs to.
 */
import { computed, watch } from "vue";
import { findMsic } from "~/utils/msic";

const props = defineProps({
  form: { type: Object, required: true },
  /** The account itself: login email and name, which are not editable here. */
  account: { type: Object, default: () => ({}) },
  currencies: { type: Array, default: () => [] },
  logoUrl: { type: String, default: "" },
  uploadingLogo: { type: Boolean, default: false },
  /** Spec 05: the single dismissable prompt. The parent owns whether it shows,
      because whether it has been dismissed is server state. */
  showPrompt: { type: Boolean, default: false },
});

const emit = defineEmits([
  "upload-logo",
  "remove-logo",
  "find-msic",
  "dismiss-prompt",
]);

/* Confirms a typed or picked code back to the user in words. An unrecognised
   code is not an error — the field is free text and the list is a subset — so
   this simply goes quiet and the hint below says so instead. */
const msicDescription = computed(() => {
  const hit = findMsic(props.form.msicCode);
  return hit ? hit.label : "";
});

const logoInput = ref(null);

/* ── "Use same as" ───────────────────────────────────────────────────────────
   These were checkboxes wired to a one-shot copy: ticking one copied the value
   across once, and then nothing kept them in step. Change your personal phone
   afterwards and the company phone silently stayed on the old number while the
   box still claimed they were the same. Unticking did not clear it either, and
   neither box initialised from existing data — so two fields that already
   matched showed as unlinked.

   A watcher makes the claim true: while the box is ticked the fields track, and
   they initialise from whether the values actually match right now. */
const sameEmail = ref(false);
const samePhone = ref(false);

watch(
  () => [props.account?.email, props.form.companyEmail],
  ([login, company]) => {
    if (!sameEmail.value && login && company && login === company)
      sameEmail.value = true;
  },
  { immediate: true },
);
watch(
  () => [props.form.phoneNumber, props.form.companyPhone],
  ([personal, company]) => {
    if (!samePhone.value && personal && company && personal === company)
      samePhone.value = true;
  },
  { immediate: true },
);

watch([sameEmail, () => props.account?.email], ([on, login]) => {
  if (on && login) props.form.companyEmail = login;
});
watch([samePhone, () => props.form.phoneNumber], ([on, personal]) => {
  if (on && personal) props.form.companyPhone = personal;
});

const currencyLabel = computed(
  () =>
    props.currencies.find((c) => c.value === props.form.defaultCurrency)
      ?.label || props.form.defaultCurrency,
);
</script>

<template>
  <div>
    <!-- ── Who you are ──────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">You</h2>
        <p class="sec__note">
          How we reach you. Your login email and name are fixed — email us at
          support@invokita.my to change either.
        </p>
      </div>

      <div class="fgrid">
        <div class="f" style="margin: 0">
          <label class="f__label" for="g-login">Login email</label>
          <!-- Stated, not disabled. A greyed input invites you to click into it
               and then refuses; this is a fact about the account. -->
          <div class="fact">
            <div class="fact__body">
              <p class="cel__main">{{ account?.email || "—" }}</p>
              <p class="cel__sub">You sign in with this</p>
            </div>
          </div>
        </div>
        <div class="f" style="margin: 0">
          <span class="f__label">Your name</span>
          <div class="fact">
            <div class="fact__body">
              <p class="cel__main">{{ account?.name || "—" }}</p>
              <p class="cel__sub">Prints on invoices if you switch it on</p>
            </div>
          </div>
        </div>
      </div>

      <div class="f">
        <label class="f__label" for="g-phone">Your phone</label>
        <input
          id="g-phone"
          v-model="form.phoneNumber"
          type="tel"
          class="inp no-ik"
          placeholder="+60 12 345 6789" />
        <p class="f__hint">
          Personal number. Kept off invoices unless you say otherwise in Invoice
          configuration.
        </p>
      </div>
    </section>

    <!-- ── The business on the invoice ───────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">What clients see</h2>
        <p class="sec__note">
          This is the letterhead. Whatever you fill in here is what appears at
          the top of every invoice you send.
        </p>
      </div>

      <div class="f">
        <span class="f__label">Logo</span>
        <div class="logo-well">
          <div class="logo-well__box">
            <img v-if="logoUrl" :src="logoUrl" alt="Your logo" />
            <UiIcon v-else icon="heroicons:photo" custom-class="w-6 h-6" />
            <div v-if="uploadingLogo" class="logo-well__busy">
              <UiIcon
                icon="heroicons:arrow-path"
                custom-class="w-5 h-5 spin" />
            </div>
          </div>
          <div>
            <div class="bar">
              <button
                type="button"
                class="desk-btn desk-btn--ghost desk-btn--sm"
                :disabled="uploadingLogo"
                @click="logoInput?.click()">
                {{ logoUrl ? "Replace" : "Upload a logo" }}
              </button>
              <button
                v-if="logoUrl"
                type="button"
                class="desk-btn desk-btn--ghost desk-btn--sm"
                :disabled="uploadingLogo"
                @click="emit('remove-logo')">
                Remove
              </button>
            </div>
            <p class="f__hint">
              JPG, PNG or SVG, up to 5MB. Sits top-left on the invoice.
            </p>
          </div>
          <input
            ref="logoInput"
            type="file"
            class="sr-only"
            accept="image/*"
            @change="emit('upload-logo', $event)" />
        </div>
      </div>

      <div class="f">
        <label class="f__label" for="g-company">Business name</label>
        <input
          id="g-company"
          v-model="form.companyName"
          type="text"
          class="inp no-ik"
          placeholder="e.g. Muqri Design Studio" />
      </div>

      <div class="fgrid">
        <div class="f" style="margin: 0">
          <label class="f__label" for="g-cemail">Business email</label>
          <input
            id="g-cemail"
            v-model="form.companyEmail"
            type="email"
            class="inp no-ik"
            :disabled="sameEmail"
            placeholder="billing@yourbusiness.my" />
          <label class="tog" for="g-same-email" style="margin-top: 0.5rem">
            <input
              id="g-same-email"
              v-model="sameEmail"
              type="checkbox"
              class="tog__inp" />
            <span class="tog__track" aria-hidden="true"></span>
            <span class="tog__label">Same as my login email</span>
          </label>
        </div>
        <div class="f" style="margin: 0">
          <label class="f__label" for="g-cphone">Business phone</label>
          <input
            id="g-cphone"
            v-model="form.companyPhone"
            type="tel"
            class="inp no-ik"
            :disabled="samePhone"
            placeholder="+60 3 1234 5678" />
          <label class="tog" for="g-same-phone" style="margin-top: 0.5rem">
            <input
              id="g-same-phone"
              v-model="samePhone"
              type="checkbox"
              class="tog__inp" />
            <span class="tog__track" aria-hidden="true"></span>
            <span class="tog__label">Same as my phone</span>
          </label>
        </div>
      </div>

      <div class="f">
        <label class="f__label" for="g-address">Business address</label>
        <textarea
          id="g-address"
          v-model="form.address"
          rows="3"
          class="inp no-ik"
          placeholder="Street, city, postcode"></textarea>
      </div>
    </section>

    <!-- ── Defaults ─────────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Money</h2>
        <p class="sec__note">
          What a new invoice starts as. You can change it per invoice.
        </p>
      </div>

      <div class="fgrid">
        <UiSelect
          v-model="form.defaultCurrency"
          label="Currency"
          :options="currencies"
          placeholder="Pick a currency" />
      </div>
      <p class="f__hint">
        New invoices open in {{ currencyLabel }}.
      </p>
    </section>

    <!-- ── Tax identity (spec 05) ───────────────────────────────────────────
         Last on the page on purpose. It is the section fewest people need on
         day one, and putting it above "what clients see" would make signing up
         feel like a tax registration. -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Tax and registration</h2>
        <p class="sec__note">
          All optional. These appear on your invoices only when you fill them
          in — leave them blank and nothing changes.
        </p>
      </div>

      <!-- The one prompt. Never on the dashboard, never during onboarding, and
           never again once dismissed. -->
      <div v-if="showPrompt" class="banner">
        <UiIcon icon="heroicons:information-circle" custom-class="w-5 h-5" />
        <span>
          Some clients — larger companies especially — ask for your SSM number
          or TIN before they will pay an invoice. Worth filling in once now
          rather than when someone is waiting on it.
        </span>
        <button
          type="button"
          class="iact"
          aria-label="Dismiss"
          @click="emit('dismiss-prompt')">
          <UiIcon icon="heroicons:x-mark" custom-class="w-4 h-4" />
        </button>
      </div>

      <div class="fgrid">
        <div class="f" style="margin: 0">
          <label class="f__label" for="g-ssm">Business registration number</label>
          <input
            id="g-ssm"
            v-model="form.registrationNumber"
            type="text"
            class="inp no-ik"
            placeholder="202301012345 (1234567-A)" />
          <p class="f__hint">Your SSM number, exactly as it appears.</p>
        </div>
        <div class="f" style="margin: 0">
          <label class="f__label" for="g-tin">TIN</label>
          <input
            id="g-tin"
            v-model="form.tin"
            type="text"
            class="inp no-ik"
            placeholder="C25845632010" />
          <p class="f__hint">Your income tax number from LHDN.</p>
        </div>
      </div>

      <div class="f">
        <label class="f__label" for="g-msic">MSIC code</label>
        <div class="bar">
          <input
            id="g-msic"
            v-model="form.msicCode"
            type="text"
            class="inp no-ik bar__grow"
            placeholder="Search for it, or type it if you know it" />
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="emit('find-msic')">
            <UiIcon icon="heroicons:magnifying-glass" custom-class="w-4 h-4" />
            Find mine
          </button>
        </div>
        <p class="f__hint">
          <template v-if="msicDescription">{{ msicDescription }}</template>
          <template v-else-if="form.msicCode">
            Not in our list — it will be saved exactly as you typed it.
          </template>
          <template v-else>
            The five-digit code for what your business does. Almost nobody knows
            theirs; search by what you actually do.
          </template>
        </p>
      </div>

      <div class="f">
        <label class="f__label" for="g-sst">SST registration number</label>
        <input
          id="g-sst"
          v-model="form.sstNumber"
          type="text"
          class="inp no-ik"
          placeholder="W10-1808-32000123" />
        <p class="f__hint">
          Only if you are SST-registered. Most small businesses are not.
        </p>
      </div>
    </section>
  </div>
</template>
