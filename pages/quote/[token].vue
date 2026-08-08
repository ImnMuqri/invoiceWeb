<script setup>
/**
 * THE CLIENT-FACING QUOTATION PAGE (spec 07).
 *
 * This page is where the value of the whole module sits. A quotation emailed as
 * a PDF is a document somebody means to reply to and then does not; the same
 * quotation on a page with two buttons is a decision they can make standing up,
 * on a phone, in thirty seconds. Everything here is arranged around that: the
 * price is the biggest thing on the page, the two actions are directly under
 * it, and nothing asks the visitor to make an account or log in.
 *
 * Deliberately mirrors /pay/:id — same shell, same typography, same card. A
 * client who has had an invoice from this user before should recognise the
 * page instantly. What is missing is every trace of payment: there is no
 * gateway, no bank block, no "amount due", because a quotation is an offer and
 * nothing is owed on it.
 *
 * Addressed by TOKEN, never by row id. The pay page can live on an integer
 * because the worst a stranger does by walking it is look; the buttons here
 * WRITE a commercial answer against somebody's business, so the url has to be
 * unguessable. See Backend/src/routes/quote/index.js.
 */
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
/* Every amount from the API is SEN. Formatting one without converting quotes
   the client a hundred times the price — on the one page in the product shown
   to somebody who has no way to know it is wrong. */
import { cash, documentIdentifiers } from "~/utils/invoice";

definePageMeta({ layout: false });

const route = useRoute();
const { $api } = useNuxtApp();
const token = route.params.token;

const loading = ref(true);
const quote = ref(null);
const notFound = ref(false);
const toast = ref({ message: "", type: "success" });

/* Which dialog is open: "accept", "decline" or null. */
const dialog = ref(null);
const submitting = ref(false);
const signature = ref("");
const reason = ref("");

const senderIds = computed(() => documentIdentifiers(quote.value).from);
const clientIds = computed(() => documentIdentifiers(quote.value).to);

const currencySymbol = computed(() => {
  const curr = quote.value?.currency;
  return curr === "IDR" || curr === "MYR" ? "RM" : "$";
});

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const senderLabel = computed(
  () => quote.value?.fromCompanyName || quote.value?.fromName || "your supplier",
);

/* One sentence describing where this quotation stands, written for the CLIENT
   rather than for the user. "Awaiting your response" is a fact about them; the
   product's internal words — Sent, Viewed — are facts about the sender and mean
   nothing on this side of the link. */
const standing = computed(() => {
  const q = quote.value;
  if (!q) return null;
  if (q.acceptedAt)
    return {
      tone: "good",
      label: "Accepted",
      line: `You accepted this quotation on ${formatDate(q.acceptedAt)}${
        q.acceptedName ? ` as ${q.acceptedName}` : ""
      }.`,
    };
  if (q.declinedAt)
    return {
      tone: "closed",
      label: "Declined",
      line: `You declined this quotation on ${formatDate(q.declinedAt)}.`,
    };
  if (q.expired)
    return {
      tone: "closed",
      label: "Expired",
      line: q.validUntil
        ? `This quotation was valid until ${formatDate(q.validUntil)} and has now lapsed. Ask ${senderLabel.value} for an updated one.`
        : "This quotation has lapsed.",
    };
  return {
    tone: "open",
    label: "Awaiting your response",
    line: q.validUntil
      ? `This price holds until ${formatDate(q.validUntil)}.`
      : "No expiry date has been set on this quotation.",
  };
});

const load = async () => {
  try {
    const { data } = await $api.get(`/quote/${token}`);
    quote.value = data;
  } catch {
    notFound.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const answer = async (kind) => {
  submitting.value = true;
  try {
    const body =
      kind === "accept"
        ? { name: signature.value.trim() || undefined }
        : { reason: reason.value.trim() || undefined };

    const { data } = await $api.post(`/quote/${token}/${kind}`, body);
    quote.value = data;
    dialog.value = null;
    toast.value = {
      message:
        kind === "accept"
          ? "Accepted. They have been told."
          : "Declined. They have been told.",
      type: "success",
    };
  } catch (err) {
    const status = err.response?.status;
    /* 409 and 410 are not failures of this page — they mean the quotation moved
       on while it was open in a tab. Reloading is the honest response: show
       what it says now rather than an error about what it used to say. */
    if (status === 409 || status === 410) {
      toast.value = {
        message:
          err.response?.data?.message ||
          "This quotation is no longer open for a response.",
        type: "error",
      };
      dialog.value = null;
      await load();
    } else {
      toast.value = {
        message: "That did not go through. Check your connection and try again.",
        type: "error",
      };
    }
  } finally {
    submitting.value = false;
  }
};

const openDialog = (kind) => {
  signature.value = "";
  reason.value = "";
  dialog.value = kind;
};
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 font-sans flex flex-col items-center selection:bg-slate-200 selection:text-slate-900">
    <div class="w-full max-w-2xl mx-auto">
      <!-- Brand header, outside the card -->
      <div class="mb-6 flex flex-col items-center text-center px-2">
        <UiLogo size="lg" :showText="true" containerClass="flex-col" />
        <p class="text-slate-500 font-medium text-sm mt-1 max-w-sm">
          A quotation, not a bill. Nothing is owed unless you accept it.
        </p>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="bg-white rounded-xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center min-h-[400px]">
        <UiIcon
          icon="heroicons:arrow-path"
          custom-class="w-6 h-6 text-slate-400 animate-spin" />
      </div>

      <!-- Not found -->
      <div
        v-else-if="notFound || !quote"
        class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center min-h-[400px] flex flex-col justify-center items-center">
        <UiIcon
          icon="heroicons:exclamation-triangle"
          custom-class="w-8 h-8 text-slate-300 mb-4" />
        <h2 class="text-lg font-semibold text-slate-900 mb-2">
          Quotation Not Found
        </h2>
        <p class="text-slate-500 mb-6 text-sm max-w-sm">
          This link may have been mistyped, or the quotation may have been
          withdrawn. Ask whoever sent it for a fresh link.
        </p>
        <NuxtLink
          to="/"
          class="text-sm font-medium text-slate-900 border-b border-slate-900 pb-0.5 hover:text-slate-600 transition-colors">
          Return Home
        </NuxtLink>
      </div>

      <!-- The quotation -->
      <div
        v-else
        class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div class="p-8 sm:p-10">
          <!-- The SENDER's letterhead (not ours).
               This page had our logo above the card and nothing of theirs
               anywhere, while the PDF of the same quotation carried their logo
               properly — so a client opening the link saw an unbranded page
               from a company they have never heard of. Capped in height so a
               large upload cannot dominate the document. -->
          <div v-if="quote.logoUrl" class="mb-8">
            <img
              :src="quote.logoUrl"
              :alt="senderLabel"
              class="h-12 w-auto max-w-[12rem] object-contain object-left" />
          </div>

          <!-- Status + price -->
          <div
            class="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end gap-6 mb-12 border-b border-slate-100 pb-8">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-4">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="{
                    'bg-emerald-600': standing.tone === 'good',
                    'bg-slate-400': standing.tone === 'closed',
                    'bg-amber-400': standing.tone === 'open',
                  }"></div>
                <span
                  class="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {{ standing.label }}
                </span>
                <span class="text-xs text-slate-300 px-1">•</span>
                <span class="text-xs font-medium text-slate-500">
                  {{ quote.invoiceNumber }}
                </span>
              </div>

              <div class="mb-4" v-if="quote.invoiceName">
                <h2 class="text-lg font-bold text-slate-900 tracking-tight">
                  {{ quote.invoiceName }}
                </h2>
                <p class="text-sm text-slate-500 mt-0.5" v-if="quote.subject">
                  {{ quote.subject }}
                </p>
              </div>

              <p
                class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                Quoted Price
              </p>
              <h1 class="text-4xl font-semibold text-slate-900 tracking-tight">
                {{ currencySymbol }}{{ cash(quote.amount) }}
              </h1>
            </div>

            <div class="text-left sm:text-right sm:whitespace-nowrap">
              <p class="text-sm text-slate-500 font-medium">
                Quoted {{ formatDate(quote.date) }}
              </p>
              <p
                v-if="quote.validUntil"
                class="text-sm text-slate-500 font-medium mt-1">
                Valid until {{ formatDate(quote.validUntil) }}
              </p>
            </div>
          </div>

          <!-- Parties -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-12">
            <div>
              <p
                class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
                Prepared For
              </p>
              <p class="text-sm font-bold text-slate-900 mt-3">
                {{ quote.client?.name }}
              </p>
              <p
                class="text-xs font-semibold text-slate-600 mt-0.5"
                v-if="quote.client?.company">
                {{ quote.client.company }}
              </p>
              <p class="text-sm text-slate-500 mt-2">
                {{ quote.client?.email }}
              </p>
              <p class="text-sm text-slate-500 mt-1">
                {{ quote.client?.address }}
              </p>
              <dl
                v-if="clientIds.length"
                class="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                <template v-for="id in clientIds" :key="id.label">
                  <dt class="font-semibold text-slate-400 whitespace-nowrap">
                    {{ id.label }}
                  </dt>
                  <dd class="text-slate-600 tabular-nums break-all">
                    {{ id.value }}
                  </dd>
                </template>
              </dl>
            </div>
            <div>
              <p
                class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
                From
              </p>
              <p class="text-sm font-bold text-slate-900 mt-3">
                {{ quote.fromName || "Our Company" }}
              </p>
              <p
                class="text-xs font-semibold text-slate-600 mt-0.5"
                v-if="quote.fromCompanyName">
                {{ quote.fromCompanyName }}
              </p>
              <p class="text-sm text-slate-500 mt-2">{{ quote.fromEmail }}</p>
              <p class="text-sm text-slate-500 mt-1">{{ quote.fromAddress }}</p>
              <dl
                v-if="senderIds.length"
                class="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                <template v-for="id in senderIds" :key="id.label">
                  <dt class="font-semibold text-slate-400 whitespace-nowrap">
                    {{ id.label }}
                  </dt>
                  <dd class="text-slate-600 tabular-nums break-all">
                    {{ id.value }}
                  </dd>
                </template>
              </dl>
            </div>
          </div>

          <!-- What is being quoted -->
          <div class="mb-10">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-slate-200">
                  <th class="py-3 font-semibold text-slate-500">Description</th>
                  <th class="py-3 font-semibold text-slate-500 text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="item in quote.items" :key="item.id">
                  <td class="py-4 text-slate-900 font-medium">
                    <div class="flex items-start gap-2">
                      <UiIcon
                        icon="heroicons:cube"
                        class="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <div>
                        {{ item.name }}<br />
                        <span class="text-slate-400 text-[11px] font-normal">
                          Qty: {{ item.quantity }} × {{ currencySymbol
                          }}{{ cash(item.price) }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td
                    class="py-4 text-slate-900 text-right align-top font-medium">
                    {{ currencySymbol }}{{ cash(item.total) }}
                  </td>
                </tr>
              </tbody>
              <!-- One row, where the invoice page has three (subtotal, tax,
                   total). Its spacing came from having three; with one, `pt-4`
                   alone left the total hugging the last line item. -->
              <tfoot class="border-t border-slate-200 text-sm">
                <tr>
                  <td class="pt-5 pb-1 text-slate-900 font-bold text-right">
                    Total Quoted
                  </td>
                  <td class="pt-5 pb-1 text-slate-900 font-bold text-right">
                    {{ currencySymbol }}{{ cash(quote.amount) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- ── The decision ─────────────────────────────────────────────
               The reason this page exists. Two buttons, no account, no login.
               Accept is the primary because it is the answer both sides are
               hoping for, but decline is a real button beside it rather than a
               grey afterthought — a client who cannot find a way to say no
               simply says nothing, and silence is the outcome this whole spec
               is trying to eliminate.
          -->
          <div v-if="quote.answerable" class="mt-12 border-t border-slate-100 pt-8">
            <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
              <button
                @click="openDialog('accept')"
                class="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
                <UiIcon icon="heroicons:check-circle" custom-class="w-4 h-4" />
                Accept this quotation
              </button>
              <button
                @click="openDialog('decline')"
                class="w-full sm:w-auto py-3.5 px-6 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]">
                Decline
              </button>
            </div>
            <p class="text-center text-xs text-slate-400 mt-4 leading-relaxed">
              {{ standing.line }}
              <br />
              Accepting does not charge you anything — {{ senderLabel }} will
              send an invoice separately.
            </p>
          </div>

          <!-- Already answered, or lapsed -->
          <div v-else class="mt-12 border-t border-slate-100 pt-8 text-center">
            <p
              class="text-sm font-medium mb-1"
              :class="
                standing.tone === 'good' ? 'text-emerald-600' : 'text-slate-600'
              ">
              {{ standing.label }}
            </p>
            <p class="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              {{ standing.line }}
            </p>
            <p
              v-if="quote.acceptedAt && !quote.invoiced"
              class="text-xs text-slate-400 mt-4 max-w-sm mx-auto leading-relaxed">
              {{ senderLabel }} has been told. They will send the invoice
              separately.
            </p>
          </div>
        </div>
      </div>

      <div v-if="quote?.watermark" class="mt-8 text-center pb-12">
        <p
          class="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <span>Generated by</span>
          <span class="text-slate-400">InvoKita</span>
        </p>
      </div>
    </div>

    <!-- ── Accept ─────────────────────────────────────────────────────────
         One field, and it is optional. A required signature box turns a
         one-tap decision into a form, and the spec asks for one tap.
    -->
    <UiModal
      :model-value="dialog === 'accept'"
      title="Accept this quotation"
      description="Your name is recorded with the date so both sides have the same record of what was agreed."
      max-width="sm"
      @update:model-value="dialog = null">
      <div class="px-4 py-4 space-y-4">
        <div>
          <label
            for="quote-signature"
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Your name
          </label>
          <input
            id="quote-signature"
            v-model="signature"
            type="text"
            autocomplete="name"
            placeholder="Type your full name"
            class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Optional. This stands as a simple record of who accepted — it is not
            a certified electronic signature.
          </p>
        </div>

        <button
          :disabled="submitting"
          @click="answer('accept')"
          class="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
          <UiIcon
            v-if="submitting"
            icon="heroicons:arrow-path"
            custom-class="w-4 h-4 animate-spin" />
          {{ submitting ? "Recording…" : "Confirm acceptance" }}
        </button>
        <button
          :disabled="submitting"
          @click="dialog = null"
          class="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all">
          Cancel
        </button>
      </div>
    </UiModal>

    <!-- ── Decline ────────────────────────────────────────────────────────
         The reason is optional too. Asking is useful; requiring it gets you an
         empty box or a polite lie, and a decline with no reason is still far
         better for the sender than silence.
    -->
    <UiModal
      :model-value="dialog === 'decline'"
      title="Decline this quotation"
      description="They will be told. Nothing further will be sent to you about it."
      max-width="sm"
      @update:model-value="dialog = null">
      <div class="px-4 py-4 space-y-4">
        <div>
          <label
            for="quote-reason"
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Anything you want to say?
          </label>
          <textarea
            id="quote-reason"
            v-model="reason"
            rows="3"
            maxlength="500"
            placeholder="Price, timing, went with someone else — whatever is useful"
            class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 resize-none"></textarea>
          <p class="text-xs text-slate-400 mt-2">
            Optional, and only {{ senderLabel }} sees it.
          </p>
        </div>

        <button
          :disabled="submitting"
          @click="answer('decline')"
          class="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
          <UiIcon
            v-if="submitting"
            icon="heroicons:arrow-path"
            custom-class="w-4 h-4 animate-spin" />
          {{ submitting ? "Recording…" : "Confirm decline" }}
        </button>
        <button
          :disabled="submitting"
          @click="dialog = null"
          class="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all">
          Cancel
        </button>
      </div>
    </UiModal>

    <UiToast v-model="toast" />
  </div>
</template>
