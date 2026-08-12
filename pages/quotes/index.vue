<script setup>
/**
 * QUOTATIONS — the list.
 *
 * Same shape as the invoice ledger, because it is the same job: find the one
 * that needs something doing and do it. What differs is what "needs something"
 * means. An invoice is waiting for money; a quote is waiting for an answer, and
 * the useful sort is by how long it has been waiting.
 *
 * Nothing here mentions payment, chasing or overdue. A quote is not owed.
 */
import { computed, onMounted, ref } from "vue";
import { useQuoteStore } from "~/stores/quoteStore";
import { useUiStore } from "~/stores/uiStore";
import { formatDate } from "~/utils/date";
import { currencySymbol, money } from "~/utils/invoice";

const quoteStore = useQuoteStore();
const uiStore = useUiStore();
const router = useRouter();
const { $api } = useNuxtApp();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

onMounted(() => quoteStore.fetchQuotes());

const search = ref("");
const view = ref("live");

/* Sending a quotation means putting the PDF in front of somebody yourself —
   nothing goes out on its own — so the one action the list owes you is the file.
   Same route as invoices; it reads `kind` and draws a quotation. */
const downloading = ref(null);

const downloadPdf = async (q) => {
  downloading.value = q.id;
  try {
    const res = await $api.get(`/invoices/${q.id}/pdf`, { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `Quotation-${q.invoiceNumber || q.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    notify("Could not build that PDF. Try again in a moment.", "error");
  } finally {
    downloading.value = null;
  }
};

/* Composes the message server-side (the wording, the price through the sen
   formatter, the public accept/decline link) and hands it to the user's own
   WhatsApp. Nothing is sent from here, so there is no allowance to spend and no
   plan to check. */
const { share, sharing } = useWhatsappShare();

const shareWhatsapp = async (q) => {
  const res = await share("quote", q.id);

  if (res.ok) {
    notify(
      res.hasPhone
        ? "WhatsApp Web is open with the message ready — press send there."
        : "WhatsApp Web is open with the message ready. No phone number saved for this client, so pick the chat yourself.",
    );
    return;
  }

  notify(
    res.blocked
      ? "Your browser blocked the new tab. Allow pop-ups for this site and try again."
      : res.error,
    "error",
  );
};

const VIEWS = [
  { key: "live", label: "Waiting" },
  { key: "won", label: "Accepted" },
  { key: "lost", label: "Closed" },
  { key: "all", label: "All" },
];

/* Expiry is decided by the API, not here.
   This page used to recompute it, and it got it wrong in a way nobody would
   have noticed for a while: it compared against midnight, so a quote that
   "holds until 30 November" showed as expired all through the 30th — a day the
   client could still legitimately accept on. The backend now returns the status
   already corrected (see effectiveStatus), and one answer beats two. */
const bucketOf = (q) => {
  if (q.status === "Accepted") return "won";
  if (["Declined", "Expired"].includes(q.status)) return "lost";
  return "live";
};

/** Accepted and not yet billed — work won and not asked for. */
const isUnbilled = (q) => q.status === "Accepted" && !q.convertedTo;

const matches = (q) => {
  const s = search.value.trim().toLowerCase();
  if (!s) return true;
  return [q.invoiceNumber, q.invoiceName, q.subject, q.client?.name, q.client?.company]
    .filter(Boolean)
    .some((f) => String(f).toLowerCase().includes(s));
};

const found = computed(() => quoteStore.quotes.filter(matches));

const viewCounts = computed(() => ({
  live: found.value.filter((q) => bucketOf(q) === "live").length,
  won: found.value.filter((q) => bucketOf(q) === "won").length,
  lost: found.value.filter((q) => bucketOf(q) === "lost").length,
  all: found.value.length,
}));

const rows = computed(() => {
  const list =
    view.value === "all"
      ? found.value
      : found.value.filter((q) => bucketOf(q) === view.value);
  /* Longest wait first. A quote nobody has answered in three weeks is the one
     worth a phone call; sorting newest-first buries it. */
  return [...list].sort(
    (a, b) => new Date(a.updatedAt || a.date) - new Date(b.updatedAt || b.date),
  );
});

/* Three figures off rows already in memory. "Out for decision" is the number
   this page exists for — money you might get, that nobody has said yes to. */
const summary = computed(() => {
  const live = quoteStore.quotes.filter((q) => bucketOf(q) === "live");
  const won = quoteStore.quotes.filter((q) => bucketOf(q) === "won");
  const unbilled = quoteStore.quotes.filter(isUnbilled);
  const decided = won.length + quoteStore.quotes.filter((q) => bucketOf(q) === "lost").length;
  return {
    outValue: live.reduce((sum, q) => sum + (Number(q.amount) || 0), 0),
    outCount: live.length,
    /* Accepted and not yet invoiced. The spec singles this out as the most
       valuable thing to remind somebody of, and it is: the work is agreed, the
       client is expecting to pay, and nobody has asked them to. */
    unbilledValue: unbilled.reduce((sum, q) => sum + (Number(q.amount) || 0), 0),
    unbilledCount: unbilled.length,
    winRate: decided ? Math.round((won.length / decided) * 100) : null,
    currency: quoteStore.quotes[0]?.currency || "MYR",
  };
});

const sym = (q) => currencySymbol(q?.currency || "MYR");
const label = (q) => q?.invoiceNumber || "this quotation";

const CHIP = {
  Draft: "chip--idle",
  Sent: "chip--idle",
  /* Viewed is not the same as Sent and should not look the same. "They opened
     it and have not replied" is a different situation from "it might still be
     sitting unread", and it is the one that tells the user a nudge by phone
     would land rather than annoy. */
  Viewed: "chip--warn",
  Accepted: "chip--paid",
  Declined: "chip--late",
  Expired: "chip--late",
};
const chipFor = (q) => CHIP[q.status] || "chip--idle";
const statusOf = (q) => q.status;

const waitingFor = (q) => {
  if (bucketOf(q) !== "live") return "";
  const days = Math.floor(
    (Date.now() - new Date(q.updatedAt || q.date).getTime()) / 86400000,
  );
  const age = days < 1 ? "today" : `${days} ${days === 1 ? "day" : "days"}`;
  if (q.status === "Draft") return "Not sent yet";
  if (q.status === "Viewed") return days < 1 ? "Opened today" : `Opened, ${age} ago`;
  return days < 1 ? "Sent today" : `Waiting ${age}`;
};

/* ─── Convert ─────────────────────────────────────────────────────────────── */
const convertFor = ref(null);
const converting = ref(false);

const doConvert = async () => {
  const q = convertFor.value;
  converting.value = true;
  try {
    const invoice = await quoteStore.convertToInvoice(q.id);
    convertFor.value = null;
    notify(`${invoice.invoiceNumber} raised from ${label(q)}.`);
    router.push(`/invoices/edit/${invoice.id}`);
  } catch (err) {
    notify(
      err.response?.data?.message ||
        "Could not raise the invoice. The quotation is untouched.",
      "error",
    );
  } finally {
    converting.value = false;
  }
};

const deleteFor = ref(null);
const deleting = ref(false);

const doDelete = async () => {
  const q = deleteFor.value;
  deleting.value = true;
  try {
    await quoteStore.deleteQuote(q.id);
    deleteFor.value = null;
    notify(`${label(q)} deleted.`);
  } catch (err) {
    notify(err.response?.data?.message || `Could not delete ${label(q)}.`, "error");
  } finally {
    deleting.value = false;
  }
};
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">Quotations</h1>
        <p class="desk__sub">
          What you have offered and who has not answered yet. Accept one and it
          becomes an invoice.
        </p>
      </div>
      <div class="desk__actions">
        <button
          type="button"
          class="desk-btn desk-btn--icon"
          aria-label="How this page works"
          @click="uiStore.openModuleHelp('quotes')">
          <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
        </button>
        <NuxtLink to="/quotes/create" class="desk-btn desk-btn--primary">
          New quotation
        </NuxtLink>
      </div>
    </header>

    <section class="strip" aria-label="Quotation summary">
      <div>
        <p class="desk__eyebrow">Out for decision</p>
        <p class="strip__v">
          {{ summary.currency }} {{ money(summary.outValue) }}
        </p>
        <p class="strip__n">
          across {{ summary.outCount }}
          {{ summary.outCount === 1 ? "quotation" : "quotations" }}
        </p>
      </div>
      <div>
        <p class="desk__eyebrow">Won, not yet billed</p>
        <p class="strip__v">
          {{ summary.currency }} {{ money(summary.unbilledValue) }}
        </p>
        <p class="strip__n">
          <template v-if="summary.unbilledCount">
            across {{ summary.unbilledCount }} accepted
            {{ summary.unbilledCount === 1 ? "quotation" : "quotations" }} — one
            click each
          </template>
          <template v-else>Everything accepted has been invoiced</template>
        </p>
      </div>
      <div>
        <p class="desk__eyebrow">You win</p>
        <p class="strip__v">
          {{ summary.winRate === null ? "—" : `${summary.winRate}%` }}
        </p>
        <p class="strip__n">
          <template v-if="summary.winRate === null">
            Nothing decided yet
          </template>
          <template v-else>of the quotations that got an answer</template>
        </p>
      </div>
    </section>

    <div class="bar">
      <div class="search bar__grow">
        <label class="sr-only" for="quote-search">Search quotations</label>
        <span class="search__icon" aria-hidden="true">
          <UiIcon icon="heroicons:magnifying-glass" custom-class="w-4 h-4" />
        </span>
        <input
          id="quote-search"
          v-model="search"
          type="search"
          class="search__inp no-ik"
          placeholder="Client, number, or what it was for" />
        <button
          v-if="search"
          type="button"
          class="search__clear"
          aria-label="Clear search"
          @click="search = ''">
          <UiIcon icon="heroicons:x-mark" custom-class="w-4 h-4" />
        </button>
      </div>

      <div class="segs" role="group" aria-label="Filter quotations">
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

    <div class="ledger">
      <div class="ledger__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Quotation</th>
              <th scope="col">Client</th>
              <th scope="col" class="num">Value</th>
              <th scope="col">Status</th>
              <th scope="col">Valid until</th>
              <th scope="col" class="acts">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody v-if="quoteStore.loading && !quoteStore.quotes.length">
            <tr v-for="i in 5" :key="i">
              <td v-for="j in 6" :key="j">
                <span class="skel" style="display: block"></span>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="quoteStore.error">
            <tr>
              <td colspan="6">
                <div class="empty empty--pad">
                  <p class="empty__title">Your quotations did not load.</p>
                  <p class="empty__body">{{ quoteStore.error }}</p>
                  <button
                    type="button"
                    class="desk-btn desk-btn--primary"
                    @click="quoteStore.fetchQuotes()">
                    Try again
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="!rows.length">
            <tr>
              <td colspan="6">
                <div class="empty empty--pad">
                  <template v-if="search">
                    <p class="empty__title">Nothing matches “{{ search }}”.</p>
                    <p class="empty__body">
                      Search covers the client, the number and what the work was
                      for.
                    </p>
                    <button
                      type="button"
                      class="desk-btn desk-btn--ghost"
                      @click="search = ''">
                      Clear the search
                    </button>
                  </template>
                  <template v-else-if="view === 'live'">
                    <p class="empty__title">Nothing waiting on a reply.</p>
                    <p class="empty__body">
                      Every quotation you have sent has been answered one way or
                      the other.
                    </p>
                  </template>
                  <template v-else-if="view === 'won'">
                    <p class="empty__title">Nothing accepted yet.</p>
                    <p class="empty__body">
                      Accepted quotations land here and keep the invoice raised
                      from them attached.
                    </p>
                  </template>
                  <template v-else>
                    <p class="empty__title">No quotations yet.</p>
                    <p class="empty__body">
                      Quote for a job before you do it, and when they say yes it
                      becomes an invoice in one click — no retyping.
                    </p>
                    <NuxtLink
                      to="/quotes/create"
                      class="desk-btn desk-btn--primary">
                      Write your first quotation
                    </NuxtLink>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="q in rows" :key="q.id">
              <td>
                <NuxtLink :to="`/quotes/edit/${q.id}`" class="cel cel__link">
                  <span class="cel__main">{{ label(q) }}</span>
                  <span class="cel__sub">
                    {{ q.invoiceName || q.subject || "Untitled" }} ·
                    {{ formatDate(q.date) }}
                  </span>
                </NuxtLink>
              </td>

              <td>
                <div class="cel">
                  <span class="cel__main">
                    {{ q.client?.name || "Unknown client" }}
                  </span>
                  <span v-if="waitingFor(q)" class="cel__sub">
                    {{ waitingFor(q) }}
                  </span>
                  <span v-else-if="q.client?.company" class="cel__sub">
                    {{ q.client.company }}
                  </span>
                </div>
              </td>

              <td class="num">{{ sym(q) }} {{ money(q.amount) }}</td>

              <td>
                <div class="cel">
                  <span class="chip" :class="chipFor(q)">
                    <i class="chip__dot" aria-hidden="true"></i>
                    {{ statusOf(q) }}
                  </span>
                  <!-- The link back to what the quote became. An accepted quote
                       without it is a dead end. -->
                  <NuxtLink
                    v-if="q.convertedTo"
                    :to="`/invoices/edit/${q.convertedTo.id}`"
                    class="cel__sub cel__act">
                    → {{ q.convertedTo.invoiceNumber }}
                  </NuxtLink>
                </div>
              </td>

              <td>
                <span class="cel__sub">
                  {{ q.validUntil ? formatDate(q.validUntil) : "No expiry" }}
                </span>
              </td>

              <td class="acts">
                <div class="cel cel--row" style="justify-content: flex-end">
                  <button
                    type="button"
                    class="iact"
                    :aria-label="`Download ${label(q)} as PDF`"
                    title="Download PDF"
                    :disabled="downloading === q.id"
                    @click="downloadPdf(q)">
                    <UiIcon
                      :icon="
                        downloading === q.id
                          ? 'heroicons:arrow-path'
                          : 'heroicons:arrow-down-tray'
                      "
                      :custom-class="
                        downloading === q.id ? 'w-4 h-4 spin' : 'w-4 h-4'
                      " />
                  </button>
                  <!-- Hand it over on WhatsApp. The user's own WhatsApp sends
                       it, so this is offered on every row regardless of plan —
                       the list's note above says a quotation goes out when you
                       put it in front of somebody, and this is that, with the
                       wording and the accept/decline link written for you. -->
                  <button
                    type="button"
                    class="iact"
                    :aria-label="`Open ${label(q)} in WhatsApp Web`"
                    title="Open in WhatsApp Web — the message is written, you press send"
                    :disabled="sharing"
                    @click="shareWhatsapp(q)">
                    <UiIcon
                      :icon="sharing ? 'heroicons:arrow-path' : 'ic:baseline-whatsapp'"
                      :custom-class="sharing ? 'w-4 h-4 spin' : 'w-4 h-4'" />
                  </button>
                  <!-- An accepted quotation gets the primary button, because
                       raising its invoice is the one action on this page that
                       is worth money today. Everything else is a ghost. -->
                  <button
                    v-if="!q.convertedTo"
                    type="button"
                    class="desk-btn desk-btn--sm"
                    :class="isUnbilled(q) ? 'desk-btn--primary' : 'desk-btn--ghost'"
                    @click="convertFor = q">
                    <!-- A literal ampersand: this is an interpolation, so an
                         &amp; entity here would print as "&amp;". -->
                    {{ isUnbilled(q) ? "Raise the invoice" : "Accept & invoice" }}
                  </button>
                  <button
                    v-if="!q.convertedTo"
                    type="button"
                    class="iact iact--danger"
                    :aria-label="`Delete ${label(q)}`"
                    title="Delete"
                    @click="deleteFor = q">
                    <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Accept and raise ─────────────────────────────────────────────── -->
    <UiModal
      :model-value="!!convertFor"
      max-width="sm"
      @update:model-value="convertFor = null">
      <div class="dlg">
        <h3 class="dlg__title">Raise an invoice from {{ label(convertFor) }}?</h3>
        <p class="dlg__body">
          This creates a new invoice for
          <b>{{ sym(convertFor) }} {{ money(convertFor?.amount) }}</b> with the
          same lines, due in 14 days. The quotation stays as the record of what
          was agreed, marked accepted — nothing is overwritten.
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="convertFor = null">
            Not yet
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--primary"
            :disabled="converting"
            @click="doConvert">
            <UiIcon
              v-if="converting"
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 spin" />
            {{ converting ? "Raising…" : "Raise the invoice" }}
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ── Delete ───────────────────────────────────────────────────────── -->
    <UiModal
      :model-value="!!deleteFor"
      max-width="sm"
      @update:model-value="deleteFor = null">
      <div class="dlg">
        <h3 class="dlg__title">Delete {{ label(deleteFor) }}?</h3>
        <p class="dlg__body">
          Nothing has been billed from it, so this removes it for good. If your
          client already has a copy, they keep theirs.
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
            @click="doDelete">
            {{ deleting ? "Deleting…" : "Delete for good" }}
          </button>
        </div>
      </div>
    </UiModal>

    <UiToast v-model="toast" />
  </div>
</template>
