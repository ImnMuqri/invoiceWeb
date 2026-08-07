<script setup>
/**
 * The schedule form — shared by create and edit.
 *
 * Extracted for the same reason components/invoice/Fields.vue was: two pages
 * that are ninety per cent the same markup drift, and the drift is never
 * cosmetic. The invoice pair had reached the point where the edit page was
 * missing `taxRate` entirely and wrote NaN into the database on every save.
 *
 * `form` is mutated in place. Deliberate rather than lazy: the alternative is an
 * emit per field across a twenty-field form, and the parent owns the object
 * either way — it built it, it submits it, and it is the one that knows whether
 * this is a create or an edit.
 */
import { computed, ref } from "vue";
import { useCatalogueStore } from "~/stores/catalogueStore";
import { cash, currencySymbol, parsePrice } from "~/utils/invoice";

const props = defineProps({
  form: { type: Object, required: true },
  clients: { type: Array, default: () => [] },
  currencies: { type: Array, default: () => [] },
  /** 'create' lets you choose the client; 'edit' states which one it is. */
  mode: { type: String, default: "create" },
  /** An ended schedule is a record, not a draft. */
  locked: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

const catalogue = useCatalogueStore();
const pickerOpen = ref(false);

const FREQUENCIES = [
  { label: "Every week", value: "WEEKLY" },
  { label: "Every month", value: "MONTHLY" },
  { label: "Every quarter", value: "QUARTERLY" },
  { label: "Every year", value: "YEARLY" },
];

const END_MODES = [
  { label: "Keep going until I stop it", value: "NEVER" },
  { label: "After a set number of invoices", value: "AFTER_N" },
  { label: "On a date", value: "ON_DATE" },
];

const clientOptions = computed(() =>
  props.clients.map((c) => ({
    label: c.company ? `${c.name} · ${c.company}` : c.name,
    value: c.id,
  })),
);

const selectedClient = computed(() =>
  props.clients.find((c) => c.id === props.form.clientId),
);

const cur = computed(() => currencySymbol(props.form.currency));

const lineAmount = (i) => (Number(i.priceNum) || 0) * (Number(i.quantity) || 0);
const subtotal = computed(() =>
  props.form.items.reduce((n, i) => n + lineAmount(i), 0),
);
const total = computed(
  () => subtotal.value * (1 + (Number(props.form.taxRate) || 0) / 100),
);

const onPrice = (item) => (item.priceNum = parsePrice(item.priceStr));

const addLine = () =>
  props.form.items.push({ name: "", priceStr: "", priceNum: 0, quantity: 1 });

/* Never leave the schedule with zero lines — a schedule that issues an empty
   invoice every month is not a state worth being able to reach. */
const removeLine = (i) => {
  props.form.items.splice(i, 1);
  if (!props.form.items.length) addLine();
};

const addFromCatalogue = (item) => {
  const price = Number(item.price) || 0;
  const first = props.form.items[0];
  const blank =
    props.form.items.length === 1 &&
    !first?.name?.trim() &&
    !Number(first?.priceNum);
  const line = {
    name: item.unit ? `${item.name} (per ${item.unit})` : item.name,
    priceStr: price ? String(price) : "",
    priceNum: price,
    quantity: 1,
  };
  if (blank) props.form.items.splice(0, 1, line);
  else props.form.items.push(line);
  catalogue.markUsed([item.id]);
};

const toggleChannel = (c) => {
  const set = new Set(props.form.channels);
  set.has(c) ? set.delete(c) : set.add(c);
  props.form.channels = [...set];
};

const cadenceWord = computed(() =>
  (FREQUENCIES.find((f) => f.value === props.form.frequency)?.label || "")
    .toLowerCase()
    .replace("every ", ""),
);
defineExpose({ total, cadenceWord });
</script>

<template>
  <div>
    <!-- ── Who and what ───────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head"><h2 class="sec__title">Who and what</h2></div>

      <div class="f">
        <template v-if="loading">
          <span class="f__label">Client</span>
          <div class="inp sk sk--fill"></div>
        </template>
        <UiSelect
          v-else-if="mode === 'create'"
          v-model="form.clientId"
          label="Client"
          :options="clientOptions"
          placeholder="Pick a client" />
        <template v-else>
          <span class="f__label">Client</span>
          <p class="f__static">
            <b>{{ selectedClient?.name || "This client" }}</b>
          </p>
          <p class="f__hint">
            Who a schedule bills is fixed once it exists. Invoices it has already
            issued name this client, and moving it would leave them pointing at
            someone else. Cancel this one and set up another instead.
          </p>
        </template>
      </div>

      <div class="fgrid">
        <div class="f" style="margin: 0">
          <label class="f__label" for="rec-name">What to call it</label>
          <input
            id="rec-name"
            v-model="form.invoiceName"
            type="text"
            class="inp no-ik"
            :disabled="locked"
            placeholder="Monthly retainer" />
        </div>
        <div class="f" style="margin: 0">
          <UiSelect
            v-model="form.currency"
            label="Currency"
            :disabled="locked"
            :options="currencies"
            placeholder="Pick a currency" />
        </div>
      </div>
    </section>

    <!-- ── Lines ──────────────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">What they are paying for</h2>
        <p v-if="mode === 'edit'" class="sec__note">
          Changing these affects invoices issued from now on. Anything already
          sent keeps the figures it was sent with.
        </p>
      </div>

      <div class="lines">
        <div v-if="loading" class="line">
          <div class="line__desc">
            <span class="f__label">Item</span>
            <div class="inp sk sk--fill"></div>
          </div>
          <div><span class="f__label">Unit price</span><div class="inp sk sk--fill"></div></div>
          <div><span class="f__label">Qty</span><div class="inp sk sk--fill"></div></div>
          <span class="line__sum"><i class="sk" style="width: 4.5rem"></i></span>
          <div class="line__del"></div>
        </div>

        <div v-for="(item, index) in form.items" v-else :key="index" class="line">
          <div class="line__desc">
            <label class="f__label" :for="`ri-name-${index}`">Item</label>
            <input
              :id="`ri-name-${index}`"
              v-model="item.name"
              type="text"
              class="inp no-ik"
              :disabled="locked"
              placeholder="What do you do for them?" />
          </div>
          <div>
            <label class="f__label" :for="`ri-price-${index}`">Unit price</label>
            <div class="money-inp">
              <span class="money-inp__cur">{{ cur }}</span>
              <input
                :id="`ri-price-${index}`"
                v-model="item.priceStr"
                type="text"
                inputmode="decimal"
                class="money-inp__inp no-ik"
                :disabled="locked"
                placeholder="0.00"
                @input="onPrice(item)" />
            </div>
          </div>
          <div>
            <label class="f__label" :for="`ri-qty-${index}`">Qty</label>
            <input
              :id="`ri-qty-${index}`"
              v-model.number="item.quantity"
              type="number"
              min="1"
              class="inp no-ik"
              :disabled="locked"
              style="text-align: center" />
          </div>
          <span class="line__sum">{{ cur }} {{ cash(lineAmount(item)) }}</span>
          <div class="line__del">
            <button
              type="button"
              class="iact"
              :disabled="locked"
              :aria-label="`Remove line ${index + 1}`"
              @click="removeLine(index)">
              <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="desk-btn desk-btn--ghost desk-btn--sm"
        style="margin-top: 0.75rem"
        :disabled="locked || loading"
        @click="addLine">
        <UiIcon icon="heroicons:plus" custom-class="w-4 h-4" />
        Add another line
      </button>
      <button
        type="button"
        class="desk-btn desk-btn--ghost desk-btn--sm"
        style="margin-top: 0.75rem; margin-left: 0.5rem"
        :disabled="locked || loading"
        @click="pickerOpen = true">
        <UiIcon icon="heroicons:squares-2x2" custom-class="w-4 h-4" />
        Add from catalogue
      </button>

      <InvoiceCataloguePicker
        v-model="pickerOpen"
        :currency="cur"
        @pick="addFromCatalogue" />
    </section>

    <!-- ── Cadence ────────────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">How often</h2>
        <p class="sec__note">
          Issued on this day each period. A day later than the month is long —
          the 31st in February — falls back to the last day rather than skipping
          the period.
        </p>
      </div>

      <div class="fgrid">
        <div class="f" style="margin: 0">
          <UiSelect
            v-model="form.frequency"
            label="Cadence"
            :disabled="locked"
            :options="FREQUENCIES" />
        </div>
        <div class="f" style="margin: 0">
          <label class="f__label" for="rec-start">Starting</label>
          <input
            id="rec-start"
            v-model="form.startDate"
            type="date"
            class="inp no-ik"
            :disabled="locked || mode === 'edit'" />
          <p v-if="mode === 'edit'" class="f__hint">
            Fixed once the schedule exists — it anchors every date the schedule
            has already issued on.
          </p>
        </div>
      </div>

      <div class="fgrid" style="margin-top: var(--space-4)">
        <div v-if="form.frequency !== 'WEEKLY'" class="f" style="margin: 0">
          <label class="f__label" for="rec-day">Issue on day</label>
          <input
            id="rec-day"
            v-model.number="form.issueDay"
            type="number"
            min="1"
            max="31"
            class="inp no-ik"
            :disabled="locked" />
        </div>
        <div class="f" style="margin: 0">
          <label class="f__label" for="rec-terms">Payment terms (days)</label>
          <input
            id="rec-terms"
            v-model.number="form.paymentTermsDays"
            type="number"
            min="0"
            max="365"
            class="inp no-ik"
            :disabled="locked" />
          <p class="f__hint">
            Each invoice is due this many days after it is issued.
          </p>
        </div>
      </div>

      <div class="f" style="margin-top: var(--space-4)">
        <UiSelect
          v-model="form.endMode"
          label="Ending"
          :disabled="locked"
          :options="END_MODES" />
      </div>
      <div v-if="form.endMode === 'AFTER_N'" class="f">
        <label class="f__label" for="rec-after">Number of invoices</label>
        <input
          id="rec-after"
          v-model.number="form.endAfter"
          type="number"
          min="1"
          class="inp no-ik"
          :disabled="locked" />
      </div>
      <div v-else-if="form.endMode === 'ON_DATE'" class="f">
        <label class="f__label" for="rec-end">Last invoice on or before</label>
        <input
          id="rec-end"
          v-model="form.endDate"
          type="date"
          class="inp no-ik"
          :disabled="locked" />
      </div>
    </section>

    <!-- ── Delivery ───────────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head"><h2 class="sec__title">How it goes out</h2></div>

      <div class="f">
        <span class="f__label">Channels</span>
        <div class="bar">
          <button
            v-for="c in ['EMAIL', 'WHATSAPP']"
            :key="c"
            type="button"
            class="desk-btn desk-btn--ghost desk-btn--sm"
            :class="{ 'seg--on': form.channels.includes(c) }"
            :aria-pressed="form.channels.includes(c)"
            :disabled="locked"
            @click="toggleChannel(c)">
            {{ c === "EMAIL" ? "Email" : "WhatsApp" }}
            <UiIcon
              v-if="form.channels.includes(c)"
              icon="heroicons:check"
              custom-class="w-4 h-4" />
          </button>
        </div>
        <p class="f__hint">
          If your WhatsApp allowance runs out, the invoice still goes — by
          email. It is never simply skipped.
        </p>
      </div>

      <div class="f">
        <label class="tog" for="rec-mode">
          <input
            id="rec-mode"
            type="checkbox"
            class="tog__inp"
            :disabled="locked"
            :checked="form.mode === 'AUTO'"
            @change="form.mode = form.mode === 'AUTO' ? 'REVIEW' : 'AUTO'" />
          <span class="tog__mark" aria-hidden="true"></span>
          <span>
            <span class="tog__title">Send without asking me</span>
            <span class="tog__note">
              Off by default. The first two are drafted for your approval, then
              we offer to switch this on.
            </span>
          </span>
        </label>
      </div>

      <div class="f">
        <label class="tog" for="rec-skip">
          <input
            id="rec-skip"
            v-model="form.skipWhileUnpaid"
            type="checkbox"
            class="tog__inp"
            :disabled="locked" />
          <span class="tog__mark" aria-hidden="true"></span>
          <span>
            <span class="tog__title">Hold off while the last one is unpaid</span>
            <span class="tog__note">
              Stops stacking retainers on a client who has stopped paying.
            </span>
          </span>
        </label>
      </div>
    </section>
  </div>
</template>
