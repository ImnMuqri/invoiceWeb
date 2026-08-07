<script setup>
/**
 * What has actually been settled on this invoice (spec 03).
 *
 * The running balance is the point. An invoice used to be paid or unpaid, and
 * reality is messier — half now and half later, a discount agreed after issue,
 * two bank transfers. This panel is where that becomes legible, and it is what
 * stops the chaser looking like it is pursuing someone who already paid.
 *
 * Every amount here is SEN. `cash()` is the only place it becomes ringgit, and
 * `parsePrice()` the only place typed ringgit becomes sen.
 */
import { computed, ref, watch } from "vue";
import { usePaymentStore } from "~/stores/paymentStore";
import { formatDate } from "~/utils/date";
import { cash, currencySymbol, parsePrice } from "~/utils/invoice";

const props = defineProps({
  invoiceId: { type: [Number, String], required: true },
  /** Refetch when the parent saves something that moves the total. */
  refreshKey: { type: [Number, String], default: 0 },
});

const emit = defineEmits(["changed", "notify"]);

const store = usePaymentStore();
const data = ref(null);
const loading = ref(true);
const busy = ref(false);

const payOpen = ref(false);
const creditOpen = ref(false);
const voidOpen = ref(false);
const removeFor = ref(null);

const payForm = ref({ amount: "", method: "BANK_TRANSFER", reference: "", note: "" });
const creditForm = ref({ amount: "", reason: "" });
const voidReason = ref("");

const METHODS = [
  { label: "Bank transfer", value: "BANK_TRANSFER" },
  { label: "Cash", value: "CASH" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "Something else", value: "OTHER" },
];

const load = async () => {
  loading.value = true;
  try {
    data.value = await store.fetchHistory(props.invoiceId);
  } catch {
    data.value = null;
  } finally {
    loading.value = false;
  }
};
watch(() => [props.invoiceId, props.refreshKey], load, { immediate: true });

const invoice = computed(() => data.value?.invoice);
const cur = computed(() => currencySymbol(invoice.value?.currency || "MYR"));
const due = computed(() => invoice.value?.amountDue ?? 0);
const isVoid = computed(() => invoice.value?.status === "Void");
const overpaid = computed(() => due.value < 0);

const openPay = () => {
  /* Defaults to the full remaining balance: most manual entries are somebody
     recording a settlement they have just received, not a part payment. */
  payForm.value = {
    amount: due.value > 0 ? String(due.value / 100) : "",
    method: "BANK_TRANSFER",
    reference: "",
    note: "",
  };
  payOpen.value = true;
};

const openCredit = () => {
  creditForm.value = { amount: due.value > 0 ? String(due.value / 100) : "", reason: "" };
  creditOpen.value = true;
};

const run = async (fn, done) => {
  busy.value = true;
  try {
    await fn();
    await load();
    emit("changed");
    emit("notify", { message: done, type: "success" });
    return true;
  } catch (err) {
    emit("notify", {
      message: err.response?.data?.message || "That did not work.",
      type: "error",
    });
    return false;
  } finally {
    busy.value = false;
  }
};

const submitPayment = async () => {
  const sen = parsePrice(payForm.value.amount);
  if (sen <= 0) {
    emit("notify", { message: "Enter an amount greater than zero.", type: "warning" });
    return;
  }
  const okay = await run(
    () =>
      store.recordPayment(props.invoiceId, {
        amount: sen / 100,
        method: payForm.value.method,
        reference: payForm.value.reference,
        note: payForm.value.note,
      }),
    "Payment recorded.",
  );
  if (okay) payOpen.value = false;
};

const submitCredit = async () => {
  const sen = parsePrice(creditForm.value.amount);
  if (sen <= 0 || !creditForm.value.reason.trim()) {
    emit("notify", {
      message: "A credit note needs an amount and a reason.",
      type: "warning",
    });
    return;
  }
  const okay = await run(
    () =>
      store.issueCreditNote(props.invoiceId, {
        amount: sen / 100,
        reason: creditForm.value.reason,
      }),
    "Credit note issued.",
  );
  if (okay) creditOpen.value = false;
};

const submitVoid = async () => {
  if (!voidReason.value.trim()) {
    emit("notify", { message: "Voiding needs a reason.", type: "warning" });
    return;
  }
  const okay = await run(
    () => store.voidInvoice(props.invoiceId, voidReason.value),
    "Invoice voided. Every queued reminder is cancelled.",
  );
  if (okay) voidOpen.value = false;
};

const confirmRemove = async () => {
  const row = removeFor.value;
  if (!row) return;
  const okay = await run(
    () =>
      row.type === "payment"
        ? store.deletePayment(row.id)
        : store.deleteCreditNote(row.id),
    row.type === "payment"
      ? "Payment removed. The balance has gone back up, and chasing has NOT restarted."
      : "Credit note removed.",
  );
  if (okay) removeFor.value = null;
};

const METHOD_LABEL = {
  BANK_TRANSFER: "Bank transfer",
  CASH: "Cash",
  CHEQUE: "Cheque",
  OTHER: "Other",
  BILLPLZ: "Billplz",
  TOYYIBPAY: "ToyyibPay",
  HITPAY: "HitPay",
  SENANGPAY: "senangPay",
};
</script>

<template>
  <section class="card" aria-labelledby="pay-history">
    <div class="card__head">
      <div>
        <h2 id="pay-history" class="card__title">Payments</h2>
        <p class="money__note">
          <template v-if="loading">Loading…</template>
          <template v-else-if="isVoid">
            Voided — {{ invoice.voidReason }}
          </template>
          <template v-else-if="overpaid">
            Overpaid by {{ cur }} {{ cash(-due) }}. Nothing is owed.
          </template>
          <template v-else-if="due === 0">Settled in full.</template>
          <template v-else>
            {{ cur }} {{ cash(due) }} still outstanding of
            {{ cur }} {{ cash(invoice?.amount) }}.
          </template>
        </p>
      </div>
      <div class="desk__actions">
        <button
          v-if="!isVoid && due > 0"
          type="button"
          class="desk-btn desk-btn--primary desk-btn--sm"
          :disabled="busy"
          @click="openPay">
          Record payment
        </button>
      </div>
    </div>

    <div v-if="loading" class="notes">
      <div v-for="n in 2" :key="n" class="note note--flat">
        <span></span>
        <span><i class="sk" style="width: 12rem"></i></span>
        <span><i class="sk" style="width: 4rem"></i></span>
      </div>
    </div>

    <div v-else-if="!data?.history?.length" class="empty">
      <p class="empty__title">Nothing recorded yet</p>
      <p class="empty__body">
        Payments confirmed by a gateway appear here on their own. Anything
        settled by bank transfer or cash you record yourself.
      </p>
    </div>

    <div v-else class="notes">
      <div
        v-for="row in data.history"
        :key="`${row.type}-${row.id}`"
        class="note note--flat">
        <span
          class="note__pip"
          :class="{ 'note__pip--read': row.type === 'credit' }"
          aria-hidden="true"></span>
        <span>
          <span class="note__top">
            <span class="note__title" style="white-space: normal">
              <template v-if="row.type === 'payment'">
                {{ METHOD_LABEL[row.method] || row.method }}
                <span v-if="row.automatic" class="chip chip--paid">Automatic</span>
              </template>
              <template v-else>
                Credit note {{ row.number }}
              </template>
            </span>
            <span class="note__when">{{ formatDate(row.at) }}</span>
          </span>
          <span class="note__body">
            <template v-if="row.type === 'credit'">{{ row.reason }}</template>
            <template v-else-if="row.reference">Ref {{ row.reference }}</template>
            <template v-else-if="row.note">{{ row.note }}</template>
            <template v-else>Balance after: {{ cur }} {{ cash(row.balanceAfter) }}</template>
          </span>
        </span>
        <span class="note__acts" style="opacity: 1; align-items: center">
          <span class="note__when" style="font-family: var(--font-mono)">
            −{{ cur }} {{ cash(row.amount) }}
          </span>
          <button
            type="button"
            class="iact iact--danger"
            :disabled="busy"
            :aria-label="`Remove this ${row.type}`"
            title="Remove"
            @click="removeFor = row">
            <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
          </button>
        </span>
      </div>
    </div>

    <div v-if="!isVoid" class="bar" style="margin-top: var(--space-4)">
      <button
        v-if="due > 0"
        type="button"
        class="desk-btn desk-btn--ghost desk-btn--sm"
        :disabled="busy"
        @click="openCredit">
        Issue a credit note
      </button>
      <button
        v-if="invoice && invoice.amountPaid === 0"
        type="button"
        class="desk-btn desk-btn--ghost desk-btn--sm"
        :disabled="busy"
        @click="voidOpen = true">
        Void this invoice
      </button>
    </div>

    <!-- ── Record payment ─────────────────────────────────────────────────── -->
    <UiModal v-model="payOpen" max-width="sm">
      <div class="dlg">
        <h3 class="dlg__title">Record a payment</h3>
        <p class="dlg__body">
          For money that arrived outside a payment link — a bank transfer, cash,
          a cheque. Anything a gateway confirms is recorded on its own.
        </p>

        <div class="f">
          <label class="f__label" for="pay-amount">Amount</label>
          <div class="money-inp">
            <span class="money-inp__cur">{{ cur }}</span>
            <input
              id="pay-amount"
              v-model="payForm.amount"
              type="text"
              inputmode="decimal"
              class="money-inp__inp no-ik"
              placeholder="0.00" />
          </div>
          <p class="f__hint">
            Defaulted to the full remaining balance. Enter less and the invoice
            becomes partially paid — reminders keep going, and they will ask for
            the balance rather than the original total.
          </p>
        </div>

        <div class="f">
          <UiSelect v-model="payForm.method" label="How it arrived" :options="METHODS" />
        </div>

        <div class="f">
          <label class="f__label" for="pay-ref">Reference</label>
          <input
            id="pay-ref"
            v-model="payForm.reference"
            type="text"
            class="inp no-ik"
            placeholder="Optional — a transfer reference or cheque number" />
        </div>

        <div class="dlg__acts">
          <button type="button" class="desk-btn desk-btn--ghost" @click="payOpen = false">
            Cancel
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--primary"
            :disabled="busy"
            @click="submitPayment">
            Record it
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Credit note ────────────────────────────────────────────────────── -->
    <UiModal v-model="creditOpen" max-width="sm">
      <div class="dlg">
        <h3 class="dlg__title">Issue a credit note</h3>
        <p class="dlg__body">
          Reduces what is owed without money changing hands — a discount agreed
          after you sent the invoice, a line that turned out not to apply, or a
          correction. Your client sees it as a separate line on the invoice, so
          they can tell why the amount changed.
        </p>

        <div class="f">
          <label class="f__label" for="cn-amount">Amount to credit</label>
          <div class="money-inp">
            <span class="money-inp__cur">{{ cur }}</span>
            <input
              id="cn-amount"
              v-model="creditForm.amount"
              type="text"
              inputmode="decimal"
              class="money-inp__inp no-ik"
              placeholder="0.00" />
          </div>
          <p class="f__hint">
            Cannot be more than the {{ cur }} {{ cash(due) }} still outstanding.
          </p>
        </div>

        <div class="f">
          <label class="f__label" for="cn-reason">Reason</label>
          <input
            id="cn-reason"
            v-model="creditForm.reason"
            type="text"
            class="inp no-ik"
            placeholder="Agreed discount for the delay" />
          <p class="f__hint">Kept with the credit note and shown to the client.</p>
        </div>

        <div class="dlg__acts">
          <button type="button" class="desk-btn desk-btn--ghost" @click="creditOpen = false">
            Cancel
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--primary"
            :disabled="busy"
            @click="submitCredit">
            Issue it
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Void ───────────────────────────────────────────────────────────── -->
    <UiModal v-model="voidOpen" max-width="sm">
      <div class="dlg">
        <h3 class="dlg__title">Void this invoice?</h3>
        <p class="dlg__body">
          For an invoice that should never have been issued. It keeps its number
          — gaps in a sequence are normal and reuse is not — drops out of your
          receivables, and every queued reminder is cancelled immediately.
          <br /><br />
          If money has already been received, use a credit note instead.
        </p>

        <div class="f">
          <label class="f__label" for="void-reason">Reason</label>
          <input
            id="void-reason"
            v-model="voidReason"
            type="text"
            class="inp no-ik"
            placeholder="Duplicate of INV-0042" />
          <p class="f__hint">Kept for your records. Never shown to the client.</p>
        </div>

        <div class="dlg__acts">
          <button type="button" class="desk-btn desk-btn--ghost" @click="voidOpen = false">
            Keep it
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--danger"
            :disabled="busy"
            @click="submitVoid">
            Void it
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Remove a row ───────────────────────────────────────────────────── -->
    <UiModal
      :model-value="!!removeFor"
      max-width="sm"
      @update:model-value="removeFor = null">
      <div class="dlg">
        <h3 class="dlg__title">
          Remove this {{ removeFor?.type === "credit" ? "credit note" : "payment" }}?
        </h3>
        <p class="dlg__body">
          <template v-if="removeFor?.type === 'payment'">
            The balance goes back up by {{ cur }} {{ cash(removeFor?.amount) }}.
            Chasing does <b>not</b> restart on its own — you decide when that
            happens.
          </template>
          <template v-else>
            The {{ cur }} {{ cash(removeFor?.amount) }} credited is added back to
            what is owed.
          </template>
        </p>
        <div class="dlg__acts">
          <button type="button" class="desk-btn desk-btn--ghost" @click="removeFor = null">
            Keep it
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--danger"
            :disabled="busy"
            @click="confirmRemove">
            Remove
          </button>
        </div>
      </div>
    </UiModal>
  </section>
</template>
