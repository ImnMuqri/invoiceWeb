<script setup>
/**
 * THE LEDGER — /invoices, rebuilt on the dashboard's design layer.
 *
 * The old page was a ten-column data grid. Four of those columns were facts
 * nobody acts on: an "Email Sent" date, a "WhatsApp Sent" date, an "Issued
 * Date", and a "Late Risk" column whose own tooltip had to explain its scoring
 * thresholds. Meanwhile the page had a `searchQuery` ref wired into a filter
 * with no input anywhere on screen to set it, no status filter, and no total —
 * so the one thing a freelancer opens a list of invoices to do, find the one
 * they are thinking about, was the one thing it could not do.
 *
 * Rebuilt around the three jobs this page actually has:
 *   1. how much is out there        -> the strip
 *   2. find the one I mean          -> search + status segments with counts
 *   3. act on it without leaving    -> row actions, in one menu each
 *
 * Nothing was deleted. Every column that came out was re-homed under the
 * heading whose decision it informs — that is the rent a column pays.
 *
 * Styling is app-desk.css, on tokens, no Tailwind utilities and therefore no
 * dependence on the ~40 `!important` dark-mode utility remaps in main.css. Data
 * contracts are unchanged: same store, same endpoints.
 * Previous version: git history / .archive.
 */
import { computed, onMounted, reactive, ref } from "vue";
import { useInvoiceStore } from "~/stores/invoiceStore";
import { usePaymentStore } from "~/stores/paymentStore";
import { useAuthStore } from "~/stores/authStore";
import { useUiStore } from "~/stores/uiStore";
import { useSystemStore } from "~/stores/systemStore";
import { formatDate, formatRelativeDate } from "~/utils/date";
import {
  amountOutstanding,
  cash,
  currencySymbol,
  daysLate,
  dueInWords,
  isChased,
  isSettled,
  lastNudge,
  money,
  payHabit,
  toSen,
} from "~/utils/invoice";

const invoiceStore = useInvoiceStore();
const paymentStore = usePaymentStore();
const authStore = useAuthStore();
const uiStore = useUiStore();
const systemStore = useSystemStore();

const toast = ref({ message: "", type: "success" });
const search = ref("");
const view = ref("open");
const busy = reactive({});

/* ─── Load ─────────────────────────────────────────────────────────────────── */
const load = async () => {
  try {
    await invoiceStore.fetchInvoices();
  } catch (err) {
    toast.value = {
      message:
        err.response?.data?.message ||
        "Could not load your invoices. Try the refresh button.",
      type: "error",
    };
  }
};
onMounted(load);

/* ─── Filtering ─────────────────────────────────────────────────────────────
   "Open" leads and is the default, because the reason to be here is almost
   always an invoice that has not been paid. The old page defaulted to
   everything, sorted by whatever order the API happened to return. */
const all = computed(() => invoiceStore.invoices || []);

const inView = (inv, key) => {
  switch (key) {
    case "open":
      return !isSettled(inv?.status);
    case "late":
      return daysLate(inv) > 0;
    case "paid":
      return inv?.status === "Paid";
    default:
      return true;
  }
};

const VIEWS = [
  { key: "open", label: "Open" },
  { key: "late", label: "Late" },
  { key: "paid", label: "Paid" },
  { key: "all", label: "Everything" },
];

const viewCounts = computed(() =>
  VIEWS.reduce((acc, v) => {
    acc[v.key] = all.value.filter((inv) => inView(inv, v.key)).length;
    return acc;
  }, {}),
);

const rows = computed(() => {
  const q = search.value.trim().toLowerCase();
  return all.value
    .filter((inv) => inv && inView(inv, view.value))
    .filter((inv) => {
      if (!q) return true;
      return [
        inv.invoiceNumber,
        inv.invoiceName,
        inv.subject,
        inv.client?.name || inv.client,
        inv.client?.company,
        inv.status,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    })
    /* Most overdue first, then soonest due. The row you need is at the top. */
    .sort((a, b) => {
      const late = daysLate(b) - daysLate(a);
      if (late) return late;
      return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
    });
});

/* ─── The strip ─────────────────────────────────────────────────────────────
   Derived from rows already in memory — no extra request, and it stays true as
   you mark things paid without a refetch. */
const summary = computed(() => {
  let outstanding = 0;
  let overdue = 0;
  let lateCount = 0;
  let unattended = 0;
  const currencies = new Set();

  for (const inv of all.value) {
    if (isSettled(inv?.status)) continue;
    const owed = amountOutstanding(inv);
    outstanding += owed;
    currencies.add(inv.currency || "MYR");
    if (daysLate(inv) > 0) {
      overdue += owed;
      lateCount += 1;
      if (!isChased(inv)) unattended += 1;
    }
  }
  return {
    outstanding,
    overdue,
    lateCount,
    unattended,
    openCount: viewCounts.value.open || 0,
    /* Mixed currencies are added up as-is, exactly as the dashboard does, so
       the figure is labelled rather than silently wrong. */
    mixed: currencies.size > 1,
    currency: currencies.size === 1 ? [...currencies][0] : "",
  };
});

const sym = (inv) => currencySymbol(inv?.currency || "MYR");

/* Invoice numbers are assigned by the API and can legitimately be null on rows
   created before numbering existed. Naming an invoice "null" in a confirmation
   dialog is worse than naming it by id, so there is one helper and no template
   does its own fallback. */
const label = (inv) =>
  inv?.invoiceNumber || "this invoice";

const chip = (inv) => {
  if (inv?.status === "Paid") return { cls: "chip--paid", label: "Paid" };
  if (inv?.status === "Cancelled")
    return { cls: "chip--idle", label: "Cancelled" };
  if (daysLate(inv) > 0) return { cls: "chip--late", label: "Overdue" };
  if (inv?.amountPaid > 0)
    return { cls: "chip--paid", label: "Part paid" };
  return { cls: "chip--idle", label: "Pending" };
};

const paidShare = (inv) => {
  const total = Number(inv?.amount) || 0;
  if (!total) return 0;
  return Math.min(100, ((Number(inv?.amountPaid) || 0) / total) * 100);
};

/* ─── Actions ─────────────────────────────────────────────────────────────── */
const notify = (message, type = "success") => (toast.value = { message, type });

const act = async (inv, key, fn, done) => {
  busy[inv.id] = key;
  try {
    const res = await fn();
    notify(done(res));
  } catch (err) {
    notify(
      err.response?.data?.message ||
        err.message ||
        "That did not go through. Try again in a moment.",
      "error",
    );
  } finally {
    delete busy[inv.id];
  }
};

/* Only ever called with a status the API will actually accept — which is
   "Cancelled" and "Draft", and only Cancelled is offered here. Status otherwise
   follows the payment rows (spec 03), so there is no "Paid" branch to write: the
   route rejects it, and the way to make an invoice paid is to record the money. */
const setStatus = (inv, status) =>
  act(
    inv,
    status,
    () => invoiceStore.updateInvoice(inv.id, { status }, true),
    () => `${label(inv)} is now ${status.toLowerCase()}.`,
  );

const send = (inv, method, isReminder) =>
  act(
    inv,
    method + (isReminder ? "-again" : ""),
    () => invoiceStore.sendInvoice(inv.id, method, null, isReminder, true),
    (res) => {
      if (method === "whatsapp" && res?.waLink) {
        window.open(res.waLink, "_blank");
        return "WhatsApp message ready to send.";
      }
      return res?.message || (isReminder ? "Reminder sent." : "Invoice sent.");
    },
  );

/* Manual share. Not routed through act() on purpose: act() sets the row's busy
   flag and reports "sent", and neither is true here — nothing was sent by us,
   and the row's chasing state has not changed. */
const { share, sharing } = useWhatsappShare();

const shareWhatsapp = async (inv) => {
  const res = await share("invoice", inv.id);

  if (res.ok) {
    notify(
      res.hasPhone
        ? "WhatsApp Web is open with the message ready — press send there."
        : `WhatsApp Web is open with the message ready. No phone number saved for ${label(inv)}'s client, so pick the chat yourself.`,
    );
    return;
  }

  notify(
    res.blocked
      ? "Your browser blocked the new tab. Allow pop-ups for this site, or copy the payment link and paste it into WhatsApp."
      : res.error,
    "error",
  );
};

const copyPayLink = async (inv) => {
  try {
    await navigator.clipboard.writeText(
      `${window.location.origin}/pay/${inv.id}`,
    );
    notify("Payment link copied. Paste it into a chat.");
  } catch {
    notify("Could not reach your clipboard.", "error");
  }
};

/* ─── Record a payment ────────────────────────────────────────────────────── */
const payFor = ref(null);
const payAmount = ref(0);
const paying = ref(false);

const openPayment = (inv) => {
  payFor.value = inv;
  /* Ringgit, because a person types into this field. Everything else in the
     page is sen — these two lines are the entire boundary. */
  payAmount.value = amountOutstanding(inv) / 100;
};

const remainingAfter = computed(() => {
  if (!payFor.value) return 0;
  return amountOutstanding(payFor.value) - toSen(payAmount.value);
});

const submitPayment = async () => {
  const inv = payFor.value;
  if (!inv || Number(payAmount.value) <= 0) return;
  paying.value = true;
  /* Records a PAYMENT rather than overwriting a running total (spec 03).
     This used to compute `amountPaid = old + new` and set the status itself,
     which meant two places in the product decided what an invoice was worth.
     Now the payment is a row, and the balance and status are derived from the
     rows by one function — so a part payment, a credit note and a gateway
     confirmation can never disagree about what is owed. */
  try {
    await paymentStore.recordPayment(inv.id, {
      amount: Number(payAmount.value),
      method: "BANK_TRANSFER",
    });
    await invoiceStore.fetchInvoices();
    notify(
      remainingAfter.value <= 0
        ? `${label(inv)} is settled in full.`
        : `Recorded. ${sym(inv)} ${cash(Math.max(0, remainingAfter.value))} still to come.`,
    );
    payFor.value = null;
  } catch (err) {
    notify(
      err.response?.data?.message || "Could not record that payment.",
      "error",
    );
  } finally {
    paying.value = false;
  }
};

/* ─── Delete ──────────────────────────────────────────────────────────────── */
const deleteFor = ref(null);
const deleting = ref(false);

const confirmDelete = async () => {
  const inv = deleteFor.value;
  if (!inv) return;
  deleting.value = true;
  try {
    await invoiceStore.deleteInvoice(inv.id);
    notify(`${label(inv)} deleted.`);
    deleteFor.value = null;
  } catch (err) {
    notify(
      err.response?.data?.message || "Could not delete that invoice.",
      "error",
    );
  } finally {
    deleting.value = false;
  }
};

const isPayModalOpen = computed({
  get: () => !!payFor.value,
  set: (v) => {
    if (!v) payFor.value = null;
  },
});
const isDeleteModalOpen = computed({
  get: () => !!deleteFor.value,
  set: (v) => {
    if (!v) deleteFor.value = null;
  },
});
</script>

<template>
  <div class="desk">
    <!-- ── Head ─────────────────────────────────────────────────────────── -->
    <header class="desk__head">
      <div>
        <h1 class="desk__title">Invoices</h1>
        <p class="desk__sub">
          Every bill you have sent, and exactly where it stands.
        </p>
      </div>
      <div class="desk__actions">
        <button
          type="button"
          class="desk-btn desk-btn--icon"
          aria-label="How this page works"
          @click="uiStore.openModuleHelp('invoices')">
          <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
        </button>
        <button
          type="button"
          class="desk-btn desk-btn--icon"
          aria-label="Reload invoices"
          @click="load">
          <UiIcon
            icon="heroicons:arrow-path"
            :custom-class="invoiceStore.loading ? 'w-5 h-5 spin' : 'w-5 h-5'" />
        </button>
        <NuxtLink
          v-if="systemStore.isInvoiceCreationEnabled"
          to="/invoices/create"
          class="desk-btn desk-btn--primary">
          New invoice
        </NuxtLink>
        <button
          v-else
          disabled
          class="desk-btn desk-btn--ghost"
          title="An administrator has paused invoice creation. Existing invoices are unaffected.">
          New invoice
        </button>
      </div>
    </header>

    <!-- ── What is out there ────────────────────────────────────────────── -->
    <section class="strip" aria-label="Summary">
      <div>
        <p class="desk__eyebrow">Still owed to you</p>
        <p class="strip__v">
          {{ summary.currency }} {{ money(summary.outstanding) }}
        </p>
        <p class="strip__n">
          {{ summary.openCount }} open
          {{ summary.openCount === 1 ? "invoice" : "invoices" }}
          <template v-if="summary.mixed">· mixed currencies, added as-is</template>
        </p>
      </div>
      <div>
        <p class="desk__eyebrow">Past its due date</p>
        <p class="strip__v" :class="{ 'strip__v--late': summary.overdue > 0 }">
          {{ summary.currency }} {{ money(summary.overdue) }}
        </p>
        <p class="strip__n">
          {{ summary.lateCount }}
          {{ summary.lateCount === 1 ? "invoice" : "invoices" }}
        </p>
      </div>
      <div>
        <p class="desk__eyebrow">Nobody chasing</p>
        <p class="strip__v" :class="{ 'strip__v--late': summary.unattended > 0 }">
          {{ summary.unattended }}
        </p>
        <p class="strip__n">
          <NuxtLink
            v-if="summary.unattended"
            to="/clients"
            class="card__link card__link--target">
            Turn on chasing &rarr;
          </NuxtLink>
          <template v-else>Late invoices are handled for you.</template>
        </p>
      </div>
    </section>

    <!-- ── Find it ──────────────────────────────────────────────────────── -->
    <div class="bar">
      <div class="search bar__grow">
        <label class="sr-only" for="inv-search">Search invoices</label>
        <span class="search__icon" aria-hidden="true">
          <UiIcon icon="heroicons:magnifying-glass" custom-class="w-4 h-4" />
        </span>
        <input
          id="inv-search"
          v-model="search"
          type="search"
          class="search__inp no-ik"
          placeholder="Client, invoice number, or what it was for" />
        <button
          v-if="search"
          type="button"
          class="search__clear"
          aria-label="Clear search"
          @click="search = ''">
          <UiIcon icon="heroicons:x-mark" custom-class="w-4 h-4" />
        </button>
      </div>

      <div class="segs" role="group" aria-label="Filter by status">
        <button
          v-for="v in VIEWS"
          :key="v.key"
          type="button"
          class="seg"
          :class="{ 'seg--on': view === v.key }"
          :aria-pressed="view === v.key"
          @click="view = v.key">
          {{ v.label }}
          <span class="seg__n">{{ viewCounts[v.key] }}</span>
        </button>
      </div>
    </div>

    <!-- ── The ledger ───────────────────────────────────────────────────── -->
    <div class="ledger">
      <div class="ledger__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Invoice</th>
              <th scope="col">Client</th>
              <th scope="col" class="num">Amount</th>
              <th scope="col">Status</th>
              <th scope="col">Due</th>
              <th scope="col">Chasing</th>
              <th scope="col" class="acts">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <!-- Loading: rows shaped like the table, so nothing jumps when the
               data lands. -->
          <tbody v-if="invoiceStore.loading && !all.length">
            <tr v-for="i in 5" :key="i">
              <td v-for="j in 7" :key="j">
                <span class="skel" style="display: block"></span>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="!rows.length">
            <tr>
              <td colspan="7">
                <div class="empty empty--pad">
                  <template v-if="search">
                    <p class="empty__title">Nothing matches “{{ search }}”.</p>
                    <p class="empty__body">
                      Search covers the client, the invoice number and what the
                      work was for. Try a shorter word.
                    </p>
                    <button
                      type="button"
                      class="desk-btn desk-btn--ghost"
                      @click="search = ''">
                      Clear the search
                    </button>
                  </template>
                  <template v-else-if="view === 'late'">
                    <p class="empty__title">Nothing is late.</p>
                    <p class="empty__body">
                      Everything you have sent is either paid or still inside its
                      terms. This is the view worth being empty.
                    </p>
                  </template>
                  <template v-else-if="view === 'paid'">
                    <p class="empty__title">Nothing settled yet.</p>
                    <p class="empty__body">
                      Paid invoices land here and stay, so you always have the
                      record.
                    </p>
                  </template>
                  <template v-else-if="view === 'open'">
                    <p class="empty__title">Nothing outstanding.</p>
                    <p class="empty__body">
                      Every invoice you have sent has been paid. Enjoy it, then
                      send the next one.
                    </p>
                    <NuxtLink
                      to="/invoices/create"
                      class="desk-btn desk-btn--ghost">
                      New invoice
                    </NuxtLink>
                  </template>
                  <template v-else>
                    <p class="empty__title">No invoices yet.</p>
                    <p class="empty__body">
                      Bill someone and it shows up here with a payment link you
                      can send over WhatsApp. Takes about a minute.
                    </p>
                    <NuxtLink
                      to="/invoices/create"
                      class="desk-btn desk-btn--primary">
                      Send your first invoice
                    </NuxtLink>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="inv in rows" :key="inv.id">
              <!-- Invoice: number, what it was for, when it went out.
                   "Issued Date" used to be its own column. -->
              <td>
                <NuxtLink :to="`/invoices/edit/${inv.id}`" class="cel cel__link">
                  <span class="cel__main">{{ label(inv) }}</span>
                  <span class="cel__sub">
                    {{ inv.invoiceName || inv.subject || "Untitled" }} · sent
                    {{ formatDate(inv.date) }}
                  </span>
                </NuxtLink>
              </td>

              <!-- Client: who, and how they have behaved before. "Late Risk"
                   used to be its own column with a tooltip explaining its own
                   thresholds; the same fact reads better as a sentence. -->
              <td>
                <div class="cel">
                  <span class="cel__main">{{
                    inv.client?.name || inv.client || "Unknown client"
                  }}</span>
                  <span
                    v-if="payHabit(inv)"
                    class="cel__sub"
                    :class="{
                      'cel__sub--late': payHabit(inv).level === 'high',
                    }">
                    {{ payHabit(inv).label }}
                  </span>
                  <span v-else-if="inv.client?.company" class="cel__sub">
                    {{ inv.client.company }}
                  </span>
                </div>
              </td>

              <!-- Amount, and how much of it has actually landed -->
              <td class="num">
                <div class="amt">
                  <span class="amt__v">
                    {{ sym(inv) }} {{ money(inv.amount) }}
                  </span>
                  <template v-if="inv.amountPaid > 0 && inv.status !== 'Paid'">
                    <span class="amt__bar" aria-hidden="true">
                      <span
                        class="amt__fill"
                        :style="{ width: paidShare(inv) + '%' }"></span>
                    </span>
                    <span class="amt__part">
                      {{ sym(inv) }} {{ money(inv.amountPaid) }} in
                    </span>
                  </template>
                </div>
              </td>

              <td>
                <span class="chip" :class="chip(inv).cls">
                  <i class="chip__dot" aria-hidden="true"></i
                  >{{ chip(inv).label }}
                </span>
              </td>

              <!-- Due: the date, and what it means today -->
              <td>
                <div class="cel">
                  <span class="cel__main" style="font-weight: 600">
                    {{ formatDate(inv.dueDate) }}
                  </span>
                  <span
                    v-if="dueInWords(inv)"
                    class="cel__sub"
                    :class="{ 'cel__sub--late': daysLate(inv) > 0 }">
                    {{ dueInWords(inv) }}
                  </span>
                </div>
              </td>

              <!-- Chasing: whether anything is being done about it, plus when
                   it was last nudged. "Email Sent" and "WhatsApp Sent" used to
                   be two columns of raw dates. -->
              <td>
                <div class="cel">
                  <span
                    v-if="isSettled(inv.status)"
                    class="cel__sub">Not needed</span>
                  <span
                    v-else-if="isChased(inv)"
                    class="cel__main cel__sub--ok"
                    style="font-size: var(--text-2xs)">
                    On, automatic
                  </span>
                  <NuxtLink
                    v-else
                    to="/clients"
                    class="cel__sub cel__sub--late cel__act"
                    style="text-decoration: underline">
                    Off — turn on
                  </NuxtLink>
                  <span class="cel__sub">
                    {{
                      lastNudge(inv)
                        ? `Last nudge ${formatRelativeDate(lastNudge(inv).at)} · ${lastNudge(inv).via}`
                        : "Never nudged"
                    }}
                  </span>
                </div>
              </td>

              <!-- Actions: two clicks maximum to anything -->
              <td class="acts">
                <div class="iacts">
                  <button
                    type="button"
                    class="iact"
                    aria-label="Copy payment link"
                    title="Copy payment link"
                    @click="copyPayLink(inv)">
                    <UiIcon icon="heroicons:link" custom-class="w-4 h-4" />
                  </button>

                  <NuxtLink
                    :to="`/pay/${inv.id}`"
                    target="_blank"
                    class="iact"
                    aria-label="See what your client sees"
                    title="See what your client sees">
                    <UiIcon
                      icon="heroicons:arrow-top-right-on-square"
                      custom-class="w-4 h-4" />
                  </NuxtLink>

                  <!-- `bare`: the menu below is `.mnu`, which already carries
                       its own fill, hairline, radius and shadow. Without this
                       the popover wraps it in a second one. -->
                  <UiPopover placement="bottom-end" bare>
                    <template #trigger>
                      <button
                        type="button"
                        class="iact"
                        :disabled="!!busy[inv.id]"
                        :aria-label="`Actions for ${label(inv)}`"
                        title="More">
                        <UiIcon
                          :icon="
                            busy[inv.id]
                              ? 'heroicons:arrow-path'
                              : 'heroicons:ellipsis-horizontal'
                          "
                          :custom-class="
                            busy[inv.id] ? 'w-5 h-5 spin' : 'w-5 h-5'
                          " />
                      </button>
                    </template>

                    <template #default="{ close }">
                      <div class="mnu">
                        <!-- "Mark paid in full" and "Flag as overdue" used to sit
                             here and neither could ever work. Status is DERIVED
                             from the payment and credit-note rows (spec 03), and
                             PATCH /invoices/:id accepts only "Cancelled" and
                             "Draft" — anything else comes back 400 with "an
                             invoice's status follows what has been paid". So both
                             items were guaranteed errors dressed as actions.

                             Overdue was doubly meaningless: deriveStatus() already
                             returns it the moment the due date passes.

                             Recording a payment is the real version of "mark paid
                             in full" — the modal opens with the whole outstanding
                             balance filled in, so settling is still one click, and
                             the money ends up on the ledger where the balance,
                             the status and the chaser all read it. -->
                        <p class="mnu__head">Money</p>
                        <button
                          v-if="!isSettled(inv.status)"
                          type="button"
                          class="mnu__item"
                          @click="close(); openPayment(inv)">
                          <UiIcon
                            icon="heroicons:banknotes"
                            custom-class="w-4 h-4" />
                          Record a payment
                          <!-- What the field will be pre-filled with, so "paid in
                               full" is one glance and one confirm. -->
                          <span class="mnu__tail">
                            {{ sym(inv) }} {{ cash(amountOutstanding(inv)) }}
                          </span>
                        </button>
                        <p v-else class="mnu__note">
                          {{
                            inv.status === "Cancelled"
                              ? "Cancelled — nothing outstanding."
                              : "Settled in full."
                          }}
                        </p>

                        <div class="mnu__sep" role="none"></div>
                        <p class="mnu__head">Chasing</p>
                        <button
                          type="button"
                          class="mnu__item"
                          :disabled="
                            isSettled(inv.status) || !systemStore.isEmailEnabled
                          "
                          :title="
                            !systemStore.isEmailEnabled
                              ? 'Email sending is paused for maintenance'
                              : isSettled(inv.status)
                                ? 'Nothing left to chase'
                                : ''
                          "
                          @click="close(); send(inv, 'email', false)">
                          <UiIcon
                            icon="heroicons:envelope"
                            custom-class="w-4 h-4" />
                          Send the invoice by email
                        </button>
                        <button
                          type="button"
                          class="mnu__item"
                          :disabled="
                            isSettled(inv.status) || !systemStore.isEmailEnabled
                          "
                          @click="close(); send(inv, 'email', true)">
                          <UiIcon icon="heroicons:bell" custom-class="w-4 h-4" />
                          Send a reminder by email
                        </button>
                        <button
                          type="button"
                          class="mnu__item"
                          :disabled="
                            isSettled(inv.status) ||
                            !systemStore.isWhatsappEnabled ||
                            !authStore.isPro
                          "
                          :title="
                            !authStore.isPro
                              ? 'WhatsApp sending is a paid feature'
                              : !systemStore.isWhatsappEnabled
                                ? 'WhatsApp sending is paused for maintenance'
                                : ''
                          "
                          @click="close(); send(inv, 'whatsapp', false)">
                          <UiIcon
                            icon="simple-icons:whatsapp"
                            custom-class="w-4 h-4" />
                          Send on WhatsApp for me
                          <span v-if="!authStore.isPro" class="mnu__tail">Pro</span>
                        </button>
                        <!-- The manual share. No plan gate and no maintenance
                             gate, because nothing is sent from here — it opens
                             the user's own WhatsApp with our wording in it. That
                             is also why it is worded "I'll send it": the three
                             items above all end with us doing the sending, and
                             this one does not. -->
                        <button
                          type="button"
                          class="mnu__item"
                          :disabled="sharing"
                          title="Opens WhatsApp Web with the message already written. You press send. On a phone it opens the WhatsApp app instead."
                          @click="close(); shareWhatsapp(inv)">
                          <UiIcon
                            icon="simple-icons:whatsapp"
                            custom-class="w-4 h-4" />
                          Open in WhatsApp Web — I'll send it
                        </button>

                        <div class="mnu__sep" role="none"></div>
                        <p class="mnu__head">This invoice</p>
                        <NuxtLink
                          :to="`/invoices/edit/${inv.id}`"
                          class="mnu__item">
                          <UiIcon
                            icon="heroicons:pencil-square"
                            custom-class="w-4 h-4" />
                          Open and edit
                        </NuxtLink>
                        <button
                          v-if="inv.status !== 'Cancelled'"
                          type="button"
                          class="mnu__item"
                          @click="close(); setStatus(inv, 'Cancelled')">
                          <UiIcon
                            icon="heroicons:no-symbol"
                            custom-class="w-4 h-4" />
                          Cancel it
                        </button>
                        <button
                          type="button"
                          class="mnu__item mnu__item--danger"
                          @click="close(); deleteFor = inv">
                          <UiIcon
                            icon="heroicons:trash"
                            custom-class="w-4 h-4" />
                          Delete for good
                        </button>
                      </div>
                    </template>
                  </UiPopover>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p v-if="rows.length" class="bar__count">
      Showing {{ rows.length }} of {{ all.length }}
      {{ all.length === 1 ? "invoice" : "invoices" }}, most overdue first.
    </p>

    <!-- ── Record a payment ─────────────────────────────────────────────── -->
    <UiModal v-model="isPayModalOpen" max-width="sm">
      <div class="dlg">
        <h3 class="dlg__title">
          Record a payment on {{ label(payFor) }}
        </h3>
        <p class="dlg__body">
          {{ payFor?.client?.name || "Your client" }} owes
          <b>{{ sym(payFor) }} {{ cash(amountOutstanding(payFor)) }}</b>. Put in
          what has actually landed — part payments are fine.
        </p>

        <div class="f" style="margin-top: 1.5rem">
          <label class="f__label" for="pay-amount">Amount received</label>
          <div class="money-inp">
            <span class="money-inp__cur">{{ sym(payFor) }}</span>
            <input
              id="pay-amount"
              v-model.number="payAmount"
              type="number"
              step="0.01"
              min="0"
              class="money-inp__inp no-ik"
              placeholder="0.00" />
          </div>
          <p class="f__hint">
            <template v-if="remainingAfter > 0">
              {{ sym(payFor) }} {{ cash(remainingAfter) }} would still be
              outstanding, and chasing carries on for the rest.
            </template>
            <template v-else-if="remainingAfter < 0">
              That is more than the balance. Save it and the invoice is marked
              paid in full.
            </template>
            <template v-else>
              This settles it — we will mark the invoice paid and stop chasing.
            </template>
          </p>
        </div>

        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="payFor = null">
            Never mind
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--primary"
            :disabled="paying || !(Number(payAmount) > 0)"
            @click="submitPayment">
            <UiIcon
              v-if="paying"
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 spin" />
            Record it
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Delete ───────────────────────────────────────────────────────── -->
    <UiModal v-model="isDeleteModalOpen" max-width="sm">
      <div class="dlg">
        <h3 class="dlg__title">Delete {{ label(deleteFor) }}?</h3>
        <p class="dlg__body">
          This removes the invoice and its history for good. If you have already
          sent it, <b>cancel it instead</b> — your client's copy and your records
          stay intact, and the payment link stops working.
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="deleteFor = null">
            Keep it
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--danger"
            :disabled="deleting"
            @click="confirmDelete">
            <UiIcon
              v-if="deleting"
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 spin" />
            {{ deleting ? "Deleting…" : "Delete for good" }}
          </button>
        </div>
      </div>
    </UiModal>

    <UiToast v-model="toast" />
  </div>
</template>
