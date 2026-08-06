<script setup>
/**
 * The invoice form — shared by create and edit.
 *
 * These two pages were 1,719 and 1,592 lines and about ninety per cent of that
 * was the same markup twice. It had already cost something real: the edit page
 * rendered its tax row twice, its client picker was a disabled copy of the
 * create page's rather than a statement of fact, and `taxRate` was simply
 * missing from its form object. One component, one place to fix.
 *
 * `form` is mutated in place. That is deliberate rather than lazy: the
 * alternative is an emit per field on a twenty-field form, and the parent owns
 * the object either way — it built it, it submits it, and it is the one that
 * knows whether this is a create or an edit.
 */
import { computed, ref } from "vue";
import { useCatalogueStore } from "~/stores/catalogueStore";
import { totals, parsePrice, cash, currencySymbol } from "~/utils/invoice";

const props = defineProps({
  form: { type: Object, required: true },
  clients: { type: Array, default: () => [] },
  currencies: { type: Array, default: () => [] },
  /** 'create' lets you choose the client; 'edit' states which one it is. */
  mode: { type: String, default: "create" },
  /** Paid and cancelled invoices are read-only. */
  locked: { type: Boolean, default: false },
  /**
   * Still fetching. Renders the same form with blocks where the values will be,
   * rather than handing the page to a separate skeleton component: the layout
   * is then produced by one set of rules in both states, so it cannot shift
   * when the data lands. See the .sk block in app-desk.css.
   */
  loading: { type: Boolean, default: false },
  /** 'invoice' | 'quote'. Changes the date field and hides the status picker. */
  kind: { type: String, default: "invoice" },
});

const isQuote = computed(() => props.kind === "quote");

const LAYOUTS = [
  {
    value: "professional",
    name: "Professional",
    note: "Plain, formal, hairline rules. The one to send to a finance department.",
  },
  {
    value: "modern",
    name: "Modern",
    note: "Dark header with the amount due at the top. Harder to skim past.",
  },
];

const STATUSES = [
  { label: "Pending — not paid yet", value: "Pending" },
  { label: "Paid", value: "Paid" },
  { label: "Overdue", value: "Overdue" },
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

const sums = computed(() => totals(props.form));
const cur = computed(() => currencySymbol(props.form.currency));

const lineAmount = (item) =>
  (Number(item.priceNum) || 0) * (Number(item.qty) || 0);

const onPriceInput = (item) => {
  item.priceNum = parsePrice(item.priceStr);
};

const addLine = () => {
  props.form.lineItems.push({ name: "", priceStr: "", priceNum: 0, qty: 1 });
};

/* ─── The catalogue ───────────────────────────────────────────────────────
   Both builders go through this component, so wiring the picker here is what
   gets it onto invoices and quotations at once. */
const catalogue = useCatalogueStore();
const pickerOpen = ref(false);

const addFromCatalogue = (item) => {
  const price = Number(item.price) || 0;
  /* If the only line is the blank one the form starts with, fill it rather than
     leaving an empty row above everything the user just picked. */
  const first = props.form.lineItems[0];
  const blank =
    props.form.lineItems.length === 1 &&
    !first?.name?.trim() &&
    !Number(first?.priceNum);

  const line = {
    name: item.unit ? `${item.name} (per ${item.unit})` : item.name,
    priceStr: price ? String(price) : "",
    priceNum: price,
    qty: 1,
  };

  if (blank) props.form.lineItems.splice(0, 1, line);
  else props.form.lineItems.push(line);

  /* Sort order only, and deliberately not awaited — see markUsed. */
  catalogue.markUsed([item.id]);
};

/* Never leave the form with zero lines — an invoice with nothing on it is not a
   state worth being able to reach, and the old version let you delete your way
   into it and then submit. */
const removeLine = (index) => {
  props.form.lineItems.splice(index, 1);
  if (!props.form.lineItems.length) addLine();
};
</script>

<template>
  <div>
    <!-- ── Who it goes to ─────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Who it goes to</h2>
        <p class="sec__note">
          Their name and address print on the invoice, so it is worth getting
          right once.
        </p>
      </div>

      <!-- Edit mode: the client is a fact about this invoice, not a field.
           Stating it plainly beats a greyed-out dropdown that looks like
           something you are being denied. -->
      <div v-if="mode === 'edit'" class="f">
        <span class="f__label">Billed to</span>
        <div class="fact">
          <span
            class="fact__av"
            :class="{ 'sk sk--fill': loading }"
            aria-hidden="true">
            {{ loading ? "" : (selectedClient?.name || "?").charAt(0) }}
          </span>
          <div class="fact__body">
            <p class="cel__main">
              <i v-if="loading" class="sk" style="width: 9rem"></i>
              <template v-else>{{ selectedClient?.name || "This client" }}</template>
            </p>
            <p class="cel__sub">
              <i v-if="loading" class="sk" style="width: 12rem"></i>
              <template v-else>
                {{ selectedClient?.email || "No email on file" }}
              </template>
            </p>
          </div>
        </div>
        <p class="f__hint">
          The client stays fixed once an invoice exists — otherwise a sent
          invoice could quietly change who owed you. Send a new one instead.
        </p>
      </div>

      <template v-else>
        <div v-if="!form.showManualClient" class="f">
          <label class="f__label">
            Client <span class="f__req" aria-hidden="true">*</span>
          </label>
          <UiSelect
            v-model="form.clientId"
            :options="clientOptions"
            placeholder="Pick a client"
            empty-message="No clients saved yet — add one below." />
          <p class="f__hint">
            {{
              selectedClient?.email
                ? `We'll send to ${selectedClient.email}.`
                : "Pick someone you have billed before, or add them below."
            }}
          </p>
          <button
            type="button"
            class="desk-btn desk-btn--ghost desk-btn--sm"
            style="margin-top: 0.75rem"
            @click="form.showManualClient = true">
            Add someone new
          </button>
        </div>

        <div v-else class="f">
          <div class="bar" style="margin-bottom: 0.75rem">
            <span class="f__label bar__grow" style="margin: 0">New client</span>
            <button
              type="button"
              class="desk-btn desk-btn--ghost desk-btn--sm"
              @click="form.showManualClient = false">
              Use a saved client
            </button>
          </div>
          <div class="fgrid">
            <div class="f" style="grid-column: 1 / -1; margin: 0">
              <label class="f__label" for="nc-name">
                Name <span class="f__req" aria-hidden="true">*</span>
              </label>
              <input
                id="nc-name"
                v-model="form.manualClient.name"
                type="text"
                class="inp no-ik"
                placeholder="Who are you billing?" />
            </div>
            <div class="f" style="margin: 0">
              <label class="f__label" for="nc-email">
                Email <span class="f__req" aria-hidden="true">*</span>
              </label>
              <input
                id="nc-email"
                v-model="form.manualClient.email"
                type="email"
                class="inp no-ik"
                placeholder="name@company.com" />
            </div>
            <div class="f" style="margin: 0">
              <label class="f__label" for="nc-phone">Phone</label>
              <input
                id="nc-phone"
                v-model="form.manualClient.phone"
                type="tel"
                class="inp no-ik"
                placeholder="For WhatsApp reminders" />
            </div>
            <div class="f" style="margin: 0">
              <label class="f__label" for="nc-company">Company</label>
              <input
                id="nc-company"
                v-model="form.manualClient.company"
                type="text"
                class="inp no-ik"
                placeholder="Optional" />
            </div>
            <div class="f" style="grid-column: 1 / -1; margin: 0">
              <label class="f__label" for="nc-address">Address</label>
              <textarea
                id="nc-address"
                v-model="form.manualClient.address"
                rows="2"
                class="inp no-ik"
                placeholder="Optional — prints on the invoice"></textarea>
            </div>
          </div>
          <p class="f__hint">
            We save them to your client list when you save this invoice, so next
            time is one click.
          </p>
        </div>
      </template>
    </section>

    <!-- ── What it says ───────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">What it says</h2>
      </div>

      <div class="f">
        <label class="f__label" for="inv-name">Invoice name</label>
        <div v-if="loading" class="inp sk sk--fill"></div>
        <input
          v-else
          id="inv-name"
          v-model="form.invoiceName"
          type="text"
          class="inp no-ik"
          placeholder="e.g. Website overhaul" />
        <p class="f__hint">Your client sees this at the top of the {{ isQuote ? "quotation" : "invoice" }}.</p>
      </div>

      <div class="f">
        <label class="f__label" for="inv-subject">Subject line</label>
        <div v-if="loading" class="inp sk sk--fill"></div>
        <input
          v-else
          id="inv-subject"
          v-model="form.subject"
          type="text"
          class="inp no-ik"
          placeholder="e.g. Design retainer, June" />
        <p class="f__hint">
          One line on what the work covers. Useful when they file it.
        </p>
      </div>

      <div class="f">
        <template v-if="loading">
          <span class="f__label">{{ isQuote ? "Valid until" : "Due date" }}</span>
          <div class="inp sk sk--fill"></div>
        </template>
        <UiDatePicker
          v-else-if="isQuote"
          v-model="form.validUntil"
          label="Valid until" />
        <UiDatePicker v-else v-model="form.dueDate" label="Due date" />
        <p class="f__hint">
          <template v-if="isQuote">
            Thirty days by default. After this the quotation reads as expired —
            a price you offered months ago is not a price you still mean.
          </template>
          <template v-else>
            Two weeks by default. Shorter terms get paid sooner — this is the
            date the chaser counts from.
          </template>
        </p>
      </div>

      <div class="fgrid" style="margin-top: 1rem">
        <template v-if="loading">
          <div>
            <span class="f__label">Currency</span>
            <div class="inp sk sk--fill"></div>
          </div>
          <div>
            <span class="f__label">Status</span>
            <div class="inp sk sk--fill"></div>
          </div>
        </template>
        <template v-else>
          <UiSelect
            v-model="form.currency"
            label="Currency"
            :options="currencies"
            placeholder="Pick a currency" />
          <!-- Invoices only. A quotation's status is decided by whether the
               client accepts it, not by a dropdown on the sender's side. -->
          <UiSelect
            v-if="!isQuote"
            v-model="form.status"
            label="Status"
            :disabled="locked"
            :options="STATUSES"
            placeholder="Pick a status" />
        </template>
      </div>

      <div class="f" style="margin-top: 1rem">
        <span class="f__label">How it looks to your client</span>
        <div class="pick">
          <button
            v-for="opt in LAYOUTS"
            :key="opt.value"
            type="button"
            class="pick__opt"
            :class="{ 'pick__opt--on': !loading && form.template === opt.value }"
            :aria-pressed="!loading && form.template === opt.value"
            :disabled="loading"
            @click="form.template = opt.value">
            <!-- The thumb carries the whole height of this control (4:3), so
                 filling it rather than replacing it keeps the picker the same
                 size. It is also the one control here whose loading state would
                 otherwise be a lie: rendering it live would show a layout as
                 chosen before we know which one the invoice actually uses. -->
            <span
              v-if="loading"
              class="pick__thumb sk sk--fill"
              aria-hidden="true"></span>
            <span
              v-else
              class="pick__thumb"
              :class="
                opt.value === 'modern'
                  ? 'pick__thumb--band'
                  : 'pick__thumb--plain'
              "
              aria-hidden="true">
              <span v-if="opt.value === 'modern'" class="pick__band"></span>
              <span
                :class="opt.value === 'modern' ? 'pick__rows' : ''"
                style="display: flex; flex-direction: column; gap: 4px">
                <i style="height: 5px; width: 45%"></i>
                <i style="height: 3px; width: 100%"></i>
                <i style="height: 3px; width: 80%"></i>
                <i style="height: 3px; width: 90%"></i>
              </span>
            </span>
            <span class="pick__name">{{ opt.name }}</span>
            <span class="pick__note">{{ opt.note }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ── What they are paying for ───────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">What they are paying for</h2>
        <p class="sec__note">
          Each line shows its own amount, so you can check the invoice without
          doing the multiplication yourself.
        </p>
      </div>

      <div class="lines">
        <!-- One placeholder row. Most invoices have one or two lines, so this
             is the closest guess available; anything more elaborate would be
             inventing a shape for data nobody has seen yet. -->
        <div v-if="loading" class="line">
          <div class="line__desc">
            <span class="f__label">Item</span>
            <div class="inp sk sk--fill"></div>
          </div>
          <div>
            <span class="f__label">Unit price</span>
            <div class="inp sk sk--fill"></div>
          </div>
          <div>
            <span class="f__label">Qty</span>
            <div class="inp sk sk--fill"></div>
          </div>
          <span class="line__sum"><i class="sk" style="width: 4.5rem"></i></span>
          <div class="line__del"></div>
        </div>

        <div
          v-for="(item, index) in form.lineItems"
          v-else
          :key="index"
          class="line">
          <div class="line__desc">
            <label class="f__label" :for="`li-name-${index}`">Item</label>
            <input
              :id="`li-name-${index}`"
              v-model="item.name"
              type="text"
              class="inp no-ik"
              placeholder="What did you do?" />
          </div>

          <div>
            <label class="f__label" :for="`li-price-${index}`">
              Unit price
            </label>
            <div class="money-inp">
              <span class="money-inp__cur">{{ cur }}</span>
              <input
                :id="`li-price-${index}`"
                v-model="item.priceStr"
                type="text"
                inputmode="decimal"
                class="money-inp__inp no-ik"
                placeholder="0.00"
                @input="onPriceInput(item)" />
            </div>
          </div>

          <div>
            <label class="f__label" :for="`li-qty-${index}`">
              Qty <span class="f__req" aria-hidden="true">*</span>
            </label>
            <input
              :id="`li-qty-${index}`"
              v-model.number="item.qty"
              type="number"
              min="1"
              step="1"
              class="inp no-ik"
              style="text-align: center" />
          </div>

          <span class="line__sum">
            {{ cur }} {{ cash(lineAmount(item)) }}
          </span>

          <div class="line__del">
            <button
              type="button"
              class="iact"
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
        :disabled="loading"
        @click="addLine">
        <UiIcon icon="heroicons:plus" custom-class="w-4 h-4" />
        Add another line
      </button>

      <button
        type="button"
        class="desk-btn desk-btn--ghost desk-btn--sm"
        style="margin-top: 0.75rem; margin-left: 0.5rem"
        :disabled="loading"
        @click="pickerOpen = true">
        <UiIcon icon="heroicons:squares-2x2" custom-class="w-4 h-4" />
        Add from catalogue
      </button>

      <InvoiceCataloguePicker
        v-model="pickerOpen"
        :currency="cur"
        @pick="addFromCatalogue" />

      <div class="f" style="margin-top: 1.5rem">
        <label class="tog" for="add-discount">
          <input
            id="add-discount"
            v-model="form.addDiscount"
            type="checkbox"
            class="tog__inp" />
          <span class="tog__track" aria-hidden="true"></span>
          <span class="tog__label">Apply a discount</span>
        </label>

        <div v-if="form.addDiscount" class="disc">
          <label class="f__label" for="discount-pct">How much off</label>
          <div class="money-inp disc__inp">
            <input
              id="discount-pct"
              v-model.number="form.discountPercentage"
              type="number"
              min="0"
              max="100"
              class="money-inp__inp no-ik"
              placeholder="0" />
            <span class="money-inp__cur">%</span>
          </div>
          <p class="f__hint">
            Comes off the subtotal before tax. Your client sees it as its own
            line, so the discount reads as something you gave them.
          </p>
        </div>
      </div>

      <div class="sums">
        <p class="sums__row">
          <span>Subtotal</span>
          <b v-if="loading"><i class="sk" style="width: 5rem"></i></b>
          <b v-else>{{ cur }} {{ cash(sums.subtotal) }}</b>
        </p>
        <p v-if="!loading && sums.discount > 0" class="sums__row sums__row--off">
          <span>Discount ({{ form.discountPercentage || 0 }}%)</span
          ><b>−{{ cur }} {{ cash(sums.discount) }}</b>
        </p>
        <p v-if="!loading && sums.tax > 0" class="sums__row">
          <span>Tax ({{ form.taxRate }}%)</span
          ><b>+{{ cur }} {{ cash(sums.tax) }}</b>
        </p>
        <p class="sums__row sums__row--total">
          <span>Amount due</span>
          <b v-if="loading"><i class="sk" style="width: 6.5rem"></i></b>
          <b v-else>{{ cur }} {{ cash(sums.total) }}</b>
        </p>
      </div>
    </section>
  </div>
</template>
