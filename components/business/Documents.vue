<script setup>
/**
 * Settings → Invoice configuration.
 *
 * Which of your details print on an invoice, whether chasing runs at all, and
 * what a new invoice defaults to.
 *
 * The display-field cards used to be built inline: a checkbox with a hand-drawn
 * tick inside an emerald circle, a second hand-drawn icon tile, and the whole
 * list defined as a literal array inside the `v-for` in the template. The array
 * moved into script where it can be read, and the card is `.pickcard`, shared
 * with the WhatsApp mode picker.
 */
import { computed } from "vue";

const props = defineProps({
  form: { type: Object, required: true },
  isPro: { type: Boolean, default: false },
});

const emit = defineEmits(["go"]);

/* Each field, plus what has to be filled in before it can be switched on. The
   dependency is named rather than implied, so the "why is this greyed out"
   sentence writes itself from the same place the rule lives. */
const FIELDS = computed(() => [
  {
    key: "invoiceIncludeName",
    label: "Your name",
    icon: "heroicons:user",
    needs: null,
  },
  {
    key: "invoiceIncludeCompanyName",
    label: "Business name",
    icon: "heroicons:building-office-2",
    needs: props.form.companyName ? null : "a business name",
  },
  {
    key: "invoiceIncludeEmail",
    label: "Business email",
    icon: "heroicons:envelope",
    needs: props.form.companyEmail ? null : "a business email",
  },
  {
    key: "invoiceIncludeCompanyPhone",
    label: "Business phone",
    icon: "heroicons:phone",
    needs: props.form.companyPhone ? null : "a business phone",
  },
  {
    key: "invoiceIncludePersonalPhone",
    label: "Your personal phone",
    icon: "heroicons:device-phone-mobile",
    needs: props.form.phoneNumber ? null : "your phone number",
  },
  {
    key: "invoiceIncludeAddress",
    label: "Business address",
    icon: "heroicons:map-pin",
    needs: props.form.address ? null : "a business address",
  },
  /* Spec 05. One switch per block rather than one per identifier — four more
     rows here would bury the six above them, and nobody turns their TIN on but
     their SSM number off. Greys out until at least one is filled in, same rule
     as every other row. */
  {
    key: "invoiceIncludeTaxIdentifiers",
    label: "Your tax identifiers",
    icon: "heroicons:identification",
    needs:
      props.form.registrationNumber ||
      props.form.tin ||
      props.form.msicCode ||
      props.form.sstNumber
        ? null
        : "an SSM number, TIN, MSIC or SST number",
  },
  {
    key: "invoiceIncludeClientIdentifiers",
    label: "Client tax identifiers",
    icon: "heroicons:building-storefront",
    /* No `needs`: whether there is anything to show is a per-client fact, so
       it cannot be answered from this page. Each document still prints only
       what that client actually has. */
    needs: null,
  },
]);

const onCount = computed(
  () => FIELDS.value.filter((f) => props.form[f.key]).length,
);

const toggle = (field) => {
  if (field.needs) return;
  props.form[field.key] = !props.form[field.key];
};

/* Spec 09. Guarded here as well as by the `disabled` attribute, because
   `disabled` is a hint to the browser and not a rule — and the real rule is
   enforced server-side anyway: attributionFor() ignores this flag entirely for
   a free account, so a tampered request changes nothing a client would see. */
const toggleAttribution = () => {
  if (!props.form.canRemoveAttribution) return;
  props.form.attributionEnabled = !props.form.attributionEnabled;
};
</script>

<template>
  <div>
    <!-- ── What prints ──────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">What prints on your invoices</h2>
        <p class="sec__note">
          {{ onCount }} of {{ FIELDS.length }} switched on. Anything greyed out
          needs filling in under
          <button type="button" class="card__link" @click="emit('go', 'general')">
            General
          </button>
          first.
        </p>
      </div>

      <div class="pickcard pickcard--two">
        <label
          v-for="field in FIELDS"
          :key="field.key"
          class="pickcard__opt"
          :class="{
            'pickcard__opt--on': form[field.key],
            'pickcard__opt--off': !!field.needs,
          }">
          <input
            type="checkbox"
            class="pickcard__inp"
            :checked="!!form[field.key]"
            :disabled="!!field.needs"
            @change="toggle(field)" />
          <UiIcon :icon="field.icon" custom-class="w-4 h-4" />
          <span class="pickcard__body">
            <span class="pickcard__name">{{ field.label }}</span>
            <span v-if="field.needs" class="pickcard__note pickcard__note--warn">
              Add {{ field.needs }} to use this
            </span>
          </span>
          <span class="pickcard__mark" aria-hidden="true">
            <UiIcon icon="heroicons:check-16-solid" custom-class="w-3 h-3" />
          </span>
        </label>
      </div>
    </section>

    <!-- ── Attribution (spec 09) ────────────────────────────────────────────
         Its own section rather than a tenth card in the grid above. That grid
         answers "which of MY details print"; this is our line, on their
         document, and the difference is worth a heading. It is also the only
         switch on this page whose availability depends on the plan, and
         burying that in a greyed-out card would read as a bug.
    -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Our name on your invoices</h2>
        <p class="sec__note">
          A single quiet line at the foot of the payment page and the PDF.
        </p>
      </div>

      <div class="pickcard">
        <label
          class="pickcard__opt"
          :class="{
            'pickcard__opt--on': form.attributionEnabled,
            'pickcard__opt--off': !form.canRemoveAttribution,
          }">
          <input
            type="checkbox"
            class="pickcard__inp"
            :checked="form.attributionEnabled"
            :disabled="!form.canRemoveAttribution"
            @change="toggleAttribution" />
          <UiIcon icon="heroicons:sparkles" custom-class="w-4 h-4" />
          <span class="pickcard__body">
            <span class="pickcard__name">Show “Sent with InvoKita”</span>
            <span
              class="pickcard__note"
              :class="{ 'pickcard__note--warn': !form.canRemoveAttribution }">
              <template v-if="!form.canRemoveAttribution">
                Included on the free plan. Any paid plan can switch it off — not
                just the top one.
              </template>
              <template v-else-if="form.attributionEnabled">
                On. Turn it off and your documents carry nothing of ours.
              </template>
              <template v-else>
                Off. Your invoices and payment pages show only your own
                branding.
              </template>
            </span>
          </span>
          <span class="pickcard__mark" aria-hidden="true">
            <UiIcon icon="heroicons:check-16-solid" custom-class="w-3 h-3" />
          </span>
        </label>
      </div>
    </section>

    <!-- ── Chasing ──────────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Chasing, across the whole account</h2>
        <p class="sec__note">
          The master switch. Turn it off and no client gets an automatic
          reminder, whatever their own setting says.
        </p>
      </div>

      <div v-if="!isPro" class="gate">
        <UiIcon icon="heroicons:lock-closed" custom-class="w-4 h-4" />
        <span class="gate__grow">
          Automatic chasing is a paid feature. On the free plan you send
          reminders yourself from the invoice list.
        </span>
        <button
          type="button"
          class="desk-btn desk-btn--ghost desk-btn--sm"
          @click="emit('go', 'billing')">
          See plans
        </button>
      </div>

      <label v-else class="tog" for="ic-chaser">
        <input
          id="ic-chaser"
          v-model="form.globalAutoChaser"
          type="checkbox"
          class="tog__inp" />
        <span class="tog__track" aria-hidden="true"></span>
        <span class="tog__label">Chase late invoices automatically</span>
      </label>

      <p v-if="isPro" class="f__hint">
        <template v-if="form.globalAutoChaser">
          On. Reminders go out per client — switch individual clients off in
          <button type="button" class="card__link" @click="emit('go', null)">
            Clients
          </button>
          rather than turning this off for everyone. How often they go out is set
          under
          <button type="button" class="card__link" @click="emit('go', 'email')">
            Email
          </button>
          and
          <button type="button" class="card__link" @click="emit('go', 'whatsapp')">
            WhatsApp
          </button>.
        </template>
        <template v-else>
          Off. Nothing is chasing anyone, including clients you have switched on
          individually.
        </template>
      </p>
    </section>

    <!-- ── Defaults ─────────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">How your documents are numbered</h2>
      </div>

      <div class="fgrid">
        <div class="f" style="margin: 0">
          <label class="f__label" for="ic-prefix">Invoice prefix</label>
          <input
            id="ic-prefix"
            v-model="form.invoicePrefix"
            type="text"
            class="inp no-ik"
            style="text-transform: uppercase"
            placeholder="INV" />
          <p class="f__hint">
            Your next invoice will be
            <b>{{ (form.invoicePrefix || "INV").toUpperCase() }}-0001</b> and up.
          </p>
        </div>

        <!-- Quotations run on their own counter. Sharing one with invoices would
             leave a gap in the invoice run every time you quoted for work you
             did not win, which is the first thing an accountant asks about. -->
        <div class="f" style="margin: 0">
          <label class="f__label" for="ic-qprefix">Quotation prefix</label>
          <input
            id="ic-qprefix"
            v-model="form.quotePrefix"
            type="text"
            class="inp no-ik"
            style="text-transform: uppercase"
            placeholder="QUO" />
          <p class="f__hint">
            Counted separately, so quoting never puts a gap in your invoice
            numbers. Next up is
            <b>{{ (form.quotePrefix || "QUO").toUpperCase() }}-0001</b>.
          </p>
        </div>
      </div>

      <div class="fgrid" style="margin-top: var(--space-4)">
        <div class="f" style="margin: 0">
          <label class="f__label" for="ic-tax">Tax rate</label>
          <div class="money-inp">
            <input
              id="ic-tax"
              v-model.number="form.defaultTaxRate"
              type="number"
              step="0.01"
              min="0"
              class="money-inp__inp no-ik"
              placeholder="0" />
            <span class="money-inp__cur">%</span>
          </div>
          <p class="f__hint">
            <template v-if="Number(form.defaultTaxRate) > 0">
              Added to every new invoice. You can still change it per invoice.
            </template>
            <template v-else>
              No tax added. Set a rate if you charge SST or VAT.
            </template>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
