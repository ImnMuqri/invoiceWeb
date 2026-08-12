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
 * Mirrors /pay/:id, and now does so by SHARING ITS CLASSES rather than by
 * having been copied from it. Both pages are built from the `.pdoc` block in
 * app-desk.css, so a client who has had an invoice from this user recognises
 * the page instantly — and still will after the next edit to either one.
 *
 * What is missing is every trace of payment: there is no gateway, no bank
 * block, no "amount due", because a quotation is an offer and nothing is owed
 * on it.
 *
 * Addressed by TOKEN, never by row id. The pay page can live on an integer
 * because the worst a stranger does by walking it is look; the buttons here
 * WRITE a commercial answer against somebody's business, so the url has to be
 * unguessable. See Backend/src/routes/quote/index.js.
 */
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { THEME_INIT_SCRIPT } from "~/composables/useTheme";
/* Every amount from the API is SEN. Formatting one without converting quotes
   the client a hundred times the price — on the one page in the product shown
   to somebody who has no way to know it is wrong. */
import { cash, documentIdentifiers } from "~/utils/invoice";

definePageMeta({ layout: false });

/* Resolves the visitor's OS preference to an explicit data-theme before first
   paint, so the desk tokens paint the right theme. Same as /pay/:id. */
useHead({
  script: [{ innerHTML: THEME_INIT_SCRIPT, tagPosition: "head" }],
});

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
   nothing on this side of the link.

   `chip` names the shared status pill each state uses. Open takes .chip--warn
   rather than .chip--idle because the ball is in the reader's court, and
   because warn is the one tone with a genuine pair in both themes. */
const standing = computed(() => {
  const q = quote.value;
  if (!q) return null;
  if (q.acceptedAt)
    return {
      tone: "good",
      chip: "chip--paid",
      label: "Accepted",
      line: `You accepted this quotation on ${formatDate(q.acceptedAt)}${
        q.acceptedName ? ` as ${q.acceptedName}` : ""
      }.`,
    };
  if (q.declinedAt)
    return {
      tone: "closed",
      chip: "chip--idle",
      label: "Declined",
      line: `You declined this quotation on ${formatDate(q.declinedAt)}.`,
    };
  if (q.expired)
    return {
      tone: "closed",
      chip: "chip--idle",
      label: "Expired",
      line: q.validUntil
        ? `This quotation was valid until ${formatDate(q.validUntil)} and has now lapsed. Ask ${senderLabel.value} for an updated one.`
        : "This quotation has lapsed.",
    };
  return {
    tone: "open",
    chip: "chip--warn",
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
  <div class="pdoc">
    <div class="pdoc__inner">
      <!-- Loading -->
      <div v-if="loading" class="pdoc__paper">
        <div class="pdoc__state">
          <UiIcon
            icon="heroicons:arrow-path"
            custom-class="w-6 h-6 pdoc__spin" />
        </div>
      </div>

      <!-- Not found -->
      <div v-else-if="notFound || !quote" class="pdoc__paper">
        <div class="pdoc__state">
          <UiIcon
            icon="heroicons:exclamation-triangle"
            custom-class="w-7 h-7"
            style="color: var(--desk-text-3)" />
          <p class="pdoc__state-title">This quotation could not be found</p>
          <p class="pdoc__state-body">
            The link may have been mistyped, or the quotation may have been
            withdrawn. Ask whoever sent it for a fresh link.
          </p>
        </div>
      </div>

      <!-- The quotation -->
      <div v-else class="pdoc__paper">
        <!-- The SENDER's letterhead (not ours).
             This page had our logo above the card and nothing of theirs
             anywhere, while the PDF of the same quotation carried their logo
             properly — so a client opening the link saw an unbranded page from
             a company they have never heard of. Their name renders whether or
             not a logo was uploaded. -->
        <div class="pdoc__brand">
          <img
            v-if="quote.logoUrl"
            :src="quote.logoUrl"
            :alt="senderLabel"
            class="pdoc__logo" />
          <p class="pdoc__from">
            {{ quote.fromCompanyName || quote.fromName || "Quotation" }}
          </p>
        </div>

        <!-- Standing + price -->
        <div class="pdoc__head">
          <div>
            <div class="pdoc__status">
              <span class="chip" :class="standing.chip">
                <i class="chip__dot" aria-hidden="true"></i>
                {{ standing.label }}
              </span>
              <span class="pdoc__ref">{{ quote.invoiceNumber }}</span>
            </div>

            <template v-if="quote.invoiceName">
              <h1 class="pdoc__name">{{ quote.invoiceName }}</h1>
              <p v-if="quote.subject" class="pdoc__subject">
                {{ quote.subject }}
              </p>
            </template>

            <p class="pdoc__label">Quoted price</p>
            <p class="pdoc__amount">
              {{ currencySymbol }}{{ cash(quote.amount) }}
            </p>
          </div>

          <div class="pdoc__dates">
            <span>Quoted {{ formatDate(quote.date) }}</span>
            <span v-if="quote.validUntil">
              Valid until {{ formatDate(quote.validUntil) }}
            </span>
          </div>
        </div>

        <!-- Parties -->
        <div class="pdoc__parties">
          <div>
            <p class="pdoc__label pdoc__party-head">Prepared for</p>
            <p class="pdoc__party-name">{{ quote.client?.name }}</p>
            <p v-if="quote.client?.company" class="pdoc__party-org">
              {{ quote.client.company }}
            </p>
            <p v-if="quote.client?.email" class="pdoc__party-line">
              {{ quote.client.email }}
            </p>
            <p v-if="quote.client?.address" class="pdoc__party-line">
              {{ quote.client.address }}
            </p>
            <dl v-if="clientIds.length" class="pdoc__ids">
              <template v-for="id in clientIds" :key="id.label">
                <dt>{{ id.label }}</dt>
                <dd>{{ id.value }}</dd>
              </template>
            </dl>
          </div>

          <div>
            <p class="pdoc__label pdoc__party-head">From</p>
            <p class="pdoc__party-name">
              {{ quote.fromName || "Our Company" }}
            </p>
            <p v-if="quote.fromCompanyName" class="pdoc__party-org">
              {{ quote.fromCompanyName }}
            </p>
            <p v-if="quote.fromEmail" class="pdoc__party-line">
              {{ quote.fromEmail }}
            </p>
            <p v-if="quote.fromAddress" class="pdoc__party-line">
              {{ quote.fromAddress }}
            </p>
            <dl v-if="senderIds.length" class="pdoc__ids">
              <template v-for="id in senderIds" :key="id.label">
                <dt>{{ id.label }}</dt>
                <dd>{{ id.value }}</dd>
              </template>
            </dl>
          </div>
        </div>

        <!-- What is being quoted -->
        <table class="pdoc__items">
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col" class="pdoc__num">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in quote.items" :key="item.id">
              <td>
                <span class="pdoc__item-name">{{ item.name }}</span>
                <span class="pdoc__item-calc">
                  {{ item.quantity }} × {{ currencySymbol
                  }}{{ cash(item.price) }}
                </span>
              </td>
              <td class="pdoc__num">
                {{ currencySymbol }}{{ cash(item.total) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total quoted</td>
              <td class="pdoc__num">
                {{ currencySymbol }}{{ cash(quote.amount) }}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- ── The decision ─────────────────────────────────────────────
             The reason this page exists. Two buttons, no account, no login.
             Accept is the primary because it is the answer both sides are
             hoping for, but decline is a real button beside it rather than a
             grey afterthought — a client who cannot find a way to say no
             simply says nothing, and silence is the outcome this whole spec
             is trying to eliminate.
        -->
        <div v-if="quote.answerable" class="pdoc__act">
          <div class="pdoc__act--split">
            <button
              type="button"
              class="desk-btn desk-btn--primary"
              @click="openDialog('accept')">
              <UiIcon icon="heroicons:check-circle" custom-class="w-4 h-4" />
              Accept this quotation
            </button>
            <button
              type="button"
              class="desk-btn desk-btn--ghost"
              @click="openDialog('decline')">
              Decline
            </button>
          </div>
          <p class="pdoc__note">
            {{ standing.line }}
            <br />
            Accepting does not charge you anything — {{ senderLabel }} will send
            an invoice separately.
          </p>
        </div>

        <!-- Already answered, or lapsed -->
        <div v-else class="pdoc__act">
          <div class="pdoc__settled">
            <p
              class="pdoc__settled-line"
              :style="
                standing.tone === 'good' ? null : 'color: var(--desk-text-2)'
              ">
              {{ standing.label }}
            </p>
            <p class="pdoc__state-body" style="margin: 0 auto">
              {{ standing.line }}
            </p>
            <p
              v-if="quote.acceptedAt && !quote.invoiced"
              class="pdoc__note">
              {{ senderLabel }} has been told. They will send the invoice
              separately.
            </p>
          </div>
        </div>
      </div>

      <!-- Ours, at the foot and nowhere else. Same placement and weight as the
           attribution line on /pay/:id, so the two documents end the same way. -->
      <div v-if="quote?.watermark" class="pdoc__foot">
        <p class="pdoc__mark">Generated by InvoKita</p>
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
      <div class="pdoc__stack">
        <div>
          <label for="quote-signature" class="pdoc__field">Your name</label>
          <input
            id="quote-signature"
            v-model="signature"
            type="text"
            autocomplete="name"
            placeholder="Type your full name"
            class="pdoc__input" />
          <p class="pdoc__note" style="text-align: left">
            Optional. This stands as a simple record of who accepted — it is not
            a certified electronic signature.
          </p>
        </div>

        <button
          type="button"
          class="desk-btn desk-btn--primary"
          :disabled="submitting"
          @click="answer('accept')">
          <UiIcon
            v-if="submitting"
            icon="heroicons:arrow-path"
            custom-class="w-4 h-4 pdoc__spin" />
          {{ submitting ? "Recording…" : "Confirm acceptance" }}
        </button>
        <button
          type="button"
          class="desk-btn desk-btn--ghost"
          :disabled="submitting"
          @click="dialog = null">
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
      <div class="pdoc__stack">
        <div>
          <label for="quote-reason" class="pdoc__field">
            Anything you want to say?
          </label>
          <textarea
            id="quote-reason"
            v-model="reason"
            rows="3"
            maxlength="500"
            placeholder="Price, timing, went with someone else — whatever is useful"
            class="pdoc__input"></textarea>
          <p class="pdoc__note" style="text-align: left">
            Optional, and only {{ senderLabel }} sees it.
          </p>
        </div>

        <button
          type="button"
          class="desk-btn desk-btn--primary"
          :disabled="submitting"
          @click="answer('decline')">
          <UiIcon
            v-if="submitting"
            icon="heroicons:arrow-path"
            custom-class="w-4 h-4 pdoc__spin" />
          {{ submitting ? "Recording…" : "Confirm decline" }}
        </button>
        <button
          type="button"
          class="desk-btn desk-btn--ghost"
          :disabled="submitting"
          @click="dialog = null">
          Cancel
        </button>
      </div>
    </UiModal>

    <UiToast v-model="toast" />
  </div>
</template>
