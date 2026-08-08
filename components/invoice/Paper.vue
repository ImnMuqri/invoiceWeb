<script setup>
/**
 * THE INVOICE DOCUMENT — one definition, three callers.
 *
 * Rendered by the builder preview (create + edit) and by /invoices/:id/export,
 * which is the page Puppeteer prints to produce the PDF the client receives.
 * There used to be three copies of this markup and they had already drifted
 * apart; a preview that does not match the artefact is worse than no preview,
 * because people trust it.
 *
 * Presentational only. No store, no fetch, no theme conditional — it takes a
 * normalised object and draws it, so the same props always produce the same
 * page whether that page is on screen, in a headless Chrome, or in an email
 * attachment. Styling lives in assets/css/invoice-paper.css, which explains why
 * the document ignores dark mode.
 *
 * The two `layout` values are skins of one structure rather than two templates,
 * for the same reason: they cannot drift if there is only one of them.
 */
import { computed } from "vue";
import { formatDate } from "~/utils/date";
import { cash } from "~/utils/invoice";

const props = defineProps({
  /** Normalised document. See `emptyDoc()` in ~/utils/invoice for the shape. */
  doc: { type: Object, required: true },
  /** 'screen' scales the type down for the builder pane; 'print' is A4. */
  variant: { type: String, default: "print" },
  /**
   * Screen only, and only while the invoice is being fetched. Without it the
   * empty form renders as a finished document that says "Nothing billed yet",
   * which is a claim about the invoice rather than about the network — and it
   * is wrong, since the lines are on their way.
   */
  loading: { type: Boolean, default: false },
});

/* On the export page this document IS the page, so its masthead is the h1. In
   the builder it is a preview embedded in a page that already has one, and two
   h1s leave a screen-reader user with two competing answers to "what is this
   page". Same visual weight either way — the class carries that, not the tag. */
const mastTag = computed(() => (props.variant === "print" ? "h1" : "h2"));

const d = computed(() => props.doc || {});
const layout = computed(() =>
  d.value.layout === "modern" ? "modern" : "professional",
);
const items = computed(() =>
  Array.isArray(d.value.items) ? d.value.items : [],
);

/* `cash` is imported, not defined here.
   It used to be a local copy that formatted to two decimal places and stopped
   there — correct when amounts were ringgit, silently wrong once they became
   sen. A RM100 line item printed as "10,000.00" on the preview AND on the PDF
   the client receives, because a local formatter shadowed the shared one for
   every caller of this component at once.

   Every number reaching this file is SEN. The single sen→ringgit boundary is
   `cash` in ~/utils/invoice. Do not reintroduce a formatter here. */
const cur = computed(() => d.value.currency || "MYR");

/* Tax identifiers (spec 05). Already filtered and labelled by the normaliser
   in ~/utils/invoice — this component only decides where they sit, which is
   directly under the party they belong to rather than in a footer, because
   that is where an accountant looks for them. */
const fromIds = computed(() =>
  Array.isArray(d.value.from?.identifiers) ? d.value.from.identifiers : [],
);
const toIds = computed(() =>
  Array.isArray(d.value.to?.identifiers) ? d.value.to.identifiers : [],
);
const withCur = (n) => `${cash(n)} ${cur.value}`;

const subtotal = computed(() =>
  items.value.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
    0,
  ),
);
const discount = computed(() => Number(d.value.discount) || 0);
const tax = computed(() => Number(d.value.tax) || 0);
const paid = computed(() => Number(d.value.paid) || 0);
const total = computed(() =>
  Number.isFinite(Number(d.value.total))
    ? Number(d.value.total)
    : subtotal.value - discount.value + tax.value,
);
const outstanding = computed(() => Math.max(0, total.value - paid.value));

/* True for quotations. Drives the three differences below; everything else on
   the page is identical, which is the reason this is one component. */
const isQuote = computed(() => d.value.type === "quote");

const isPaid = computed(
  () =>
    !isQuote.value &&
    (d.value.status === "Paid" || d.value.kind === "OFFICIAL RECEIPT"),
);

/* A quotation past its date is stale, not overdue — nobody owes anything on it,
   so it is stated as expiry and never in the late colour. */
const expired = computed(() => {
  if (!isQuote.value || !d.value.validUntil) return false;
  return new Date(d.value.validUntil).getTime() < Date.now();
});

/* Overdue is stated on the client's copy on purpose. It is the politest
   possible reminder: a fact, printed where they are already looking. */
const daysLate = computed(() => {
  if (isQuote.value || isPaid.value || !d.value.dueAt) return 0;
  const diff = Math.floor(
    (Date.now() - new Date(d.value.dueAt).getTime()) / 86400000,
  );
  return diff > 0 ? diff : 0;
});

const fromLines = computed(() => {
  const f = d.value.from || {};
  return {
    who: f.name || f.companyName || "",
    company: f.companyName && f.companyName !== f.name ? f.companyName : "",
    rest: [f.email, f.phone, f.address].filter(Boolean),
  };
});
const toLines = computed(() => {
  const t = d.value.to || {};
  return {
    who: t.name || "",
    /* Plenty of clients are saved with company === name, and printing it twice
       makes the document look auto-generated. Same guard the "From" block has. */
    company: t.company && t.company !== t.name ? t.company : "",
    rest: [t.email, t.address].filter(Boolean),
  };
});
</script>

<template>
  <article
    class="doc"
    :class="[
      layout === 'modern' ? 'doc--band' : 'doc--plain',
      variant === 'screen' ? 'doc--preview' : 'doc--print',
    ]">
    <!-- ── Masthead ─────────────────────────────────────────────────────── -->
    <header v-if="layout === 'modern'" class="doc__mast">
      <div>
        <img v-if="d.logo" :src="d.logo" alt="" class="doc__logo" />
        <component :is="mastTag" class="doc__kind">{{ d.name || d.kind || (isQuote ? "Quotation" : "Invoice") }}</component>
        <div class="doc__tags">
          <span v-if="d.number" class="doc__ref">#{{ d.number }}</span>
          <!-- An "OVERDUE" chip in the same green as "PAID" tells the reader
               nothing. The status is the one place on this document where the
               colour has to carry meaning. -->
          <span
            class="doc__tag"
            :class="{ 'doc__tag--late': daysLate > 0 || d.status === 'Overdue' }">
            {{ d.status || "Pending" }}
          </span>
        </div>
      </div>
      <div class="doc__no">
        <span class="doc__eyebrow">{{
          isQuote ? "Estimated total" : isPaid ? "Amount paid" : "Amount due"
        }}</span>
        <span class="doc__hero">{{ cur }} {{ cash(outstanding || total) }}</span>
      </div>
    </header>

    <div :class="layout === 'modern' ? 'doc__body' : 'doc__pad'">
      <header v-if="layout !== 'modern'" class="doc__mast">
        <div>
          <img v-if="d.logo" :src="d.logo" alt="" class="doc__logo" />
          <component :is="mastTag" class="doc__kind">{{ d.kind || (isQuote ? "QUOTATION" : "INVOICE") }}</component>
          <p v-if="loading" class="doc__name">
            <i class="sk" style="width: 9em"></i>
          </p>
          <p v-else-if="d.name" class="doc__name">{{ d.name }}</p>
        </div>
        <div class="doc__no">
          <span class="doc__eyebrow">{{ isQuote ? "Quotation no." : "Invoice no." }}</span>
          <strong>
            <i v-if="loading" class="sk" style="width: 5em"></i>
            <template v-else>{{ d.number || "—" }}</template>
          </strong>
        </div>
      </header>

      <!-- ── Who and who ────────────────────────────────────────────────── -->
      <section class="doc__parties">
        <div class="doc__party">
          <span class="doc__eyebrow">{{ isQuote ? "Prepared for" : "Billed to" }}</span>
          <p class="doc__who">
            <i v-if="loading" class="sk" style="width: 8em"></i>
            <template v-else>{{ toLines.who || "—" }}</template>
          </p>
          <p v-if="loading" class="doc__lines-of-text">
            <i class="sk" style="width: 10em"></i><br />
            <i class="sk" style="width: 7em"></i>
          </p>
          <p
            v-else-if="toLines.company || toLines.rest.length"
            class="doc__lines-of-text">
            <b v-if="toLines.company">{{ toLines.company }}<br /></b
            >{{ toLines.rest.join("\n") }}
          </p>

          <!-- Only when present. An empty list renders nothing at all, which is
               what keeps a document with no identifiers byte-identical to the
               one this product produced before spec 05. -->
          <dl v-if="!loading && toIds.length" class="doc__ids">
            <div v-for="id in toIds" :key="id.label">
              <dt>{{ id.label }}</dt>
              <dd>{{ id.value }}</dd>
            </div>
          </dl>
        </div>

        <div class="doc__party">
          <span class="doc__eyebrow">From</span>
          <p class="doc__who">
            <i v-if="loading" class="sk" style="width: 7em"></i>
            <template v-else>{{ fromLines.who || "—" }}</template>
          </p>
          <p v-if="loading" class="doc__lines-of-text">
            <i class="sk" style="width: 9em"></i><br />
            <i class="sk" style="width: 6em"></i>
          </p>
          <p
            v-else-if="fromLines.company || fromLines.rest.length"
            class="doc__lines-of-text">
            <b v-if="fromLines.company">{{ fromLines.company }}<br /></b
            >{{ fromLines.rest.join("\n") }}
          </p>

          <dl v-if="!loading && fromIds.length" class="doc__ids">
            <div v-for="id in fromIds" :key="id.label">
              <dt>{{ id.label }}</dt>
              <dd>{{ id.value }}</dd>
            </div>
          </dl>
        </div>

        <!-- The dates and the reference live side by side in the plain skin;
             the band skin gets its own strip below, since its masthead has
             already used the width. -->
        <template v-if="layout !== 'modern'">
          <div class="doc__party">
            <span class="doc__eyebrow">Dates</span>
            <p class="doc__kv">
              <span>Issued</span>
              <b v-if="loading"><i class="sk" style="width: 5em"></i></b>
              <b v-else>{{ formatDate(d.issuedAt) }}</b>
            </p>
            <p class="doc__kv" :class="{ 'doc__kv--late': daysLate > 0 }">
              <span>{{ isQuote ? "Valid until" : "Due" }}</span>
              <b v-if="loading"><i class="sk" style="width: 5em"></i></b>
              <b v-else>{{
                isQuote
                  ? d.validUntil
                    ? formatDate(d.validUntil)
                    : "No expiry"
                  : formatDate(d.dueAt)
              }}</b>
            </p>
            <p v-if="!loading && expired" class="doc__kv">
              <span>Expired</span><b>Ask us for an updated price</b>
            </p>
            <p v-if="!loading && daysLate > 0" class="doc__kv doc__kv--late">
              <span>Overdue by</span
              ><b>{{ daysLate }} {{ daysLate === 1 ? "day" : "days" }}</b>
            </p>
          </div>
          <div class="doc__party">
            <span class="doc__eyebrow">Details</span>
            <p class="doc__kv">
              <span>Subject</span>
              <b v-if="loading"><i class="sk" style="width: 6em"></i></b>
              <b v-else>{{ d.subject || "—" }}</b>
            </p>
            <p class="doc__kv">
              <span>Currency</span>
              <b v-if="loading"><i class="sk" style="width: 2.5em"></i></b>
              <b v-else>{{ cur }}</b>
            </p>
            <p class="doc__kv">
              <span>Status</span>
              <b v-if="loading"><i class="sk" style="width: 4em"></i></b>
              <b v-else>{{ d.status || "Pending" }}</b>
            </p>
          </div>
        </template>
      </section>

      <div v-if="layout === 'modern'" class="doc__meta">
        <div>
          <span class="doc__eyebrow">Issued</span>
          <b>{{ formatDate(d.issuedAt) }}</b>
        </div>
        <div>
          <span class="doc__eyebrow">{{
            isQuote
              ? "Valid until"
              : daysLate > 0
                ? `Due — ${daysLate}d overdue`
                : "Due"
          }}</span>
          <b>{{
            isQuote
              ? d.validUntil
                ? formatDate(d.validUntil)
                : "No expiry"
              : formatDate(d.dueAt)
          }}</b>
        </div>
        <div>
          <span class="doc__eyebrow">Subject</span>
          <b>{{ d.subject || "—" }}</b>
        </div>
      </div>

      <!-- ── What for ───────────────────────────────────────────────────── -->
      <table class="doc__lines">
        <thead>
          <tr>
            <th scope="col">Description</th>
            <th scope="col" class="c">Qty</th>
            <th scope="col" class="n">Unit price</th>
            <th scope="col" class="n">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td><i class="sk" style="width: 68%"></i></td>
            <td class="c"><i class="sk" style="width: 1rem"></i></td>
            <td class="n"><i class="sk" style="width: 3.2rem"></i></td>
            <td class="n"><i class="sk" style="width: 3.2rem"></i></td>
          </tr>
          <template v-else>
            <tr v-for="(item, i) in items" :key="i">
              <td>{{ item.name || "Untitled item" }}</td>
              <td class="c">{{ item.quantity }}</td>
              <td class="n">{{ cash(item.price) }}</td>
              <td class="n">
                {{ cash((item.price || 0) * (item.quantity || 0)) }}
              </td>
            </tr>
            <tr v-if="!items.length">
              <td colspan="4" class="doc__none">
                Nothing billed yet — add a line and it appears here.
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <!-- ── How much ───────────────────────────────────────────────────── -->
      <div class="doc__totals">
        <div class="doc__tbox">
          <p class="doc__trow">
            <span>Subtotal</span>
            <b v-if="loading"><i class="sk" style="width: 6em"></i></b>
            <b v-else>{{ withCur(subtotal) }}</b>
          </p>
          <template v-if="!loading">
            <p v-if="discount > 0" class="doc__trow doc__trow--off">
              <span>Discount</span><b>−{{ withCur(discount) }}</b>
            </p>
            <p v-if="tax > 0" class="doc__trow">
              <span>Tax{{ d.taxRate ? ` (${d.taxRate}%)` : "" }}</span
              ><b>+{{ withCur(tax) }}</b>
            </p>
            <p v-if="paid > 0" class="doc__trow doc__trow--paid">
              <span>Already received</span><b>−{{ withCur(paid) }}</b>
            </p>
          </template>
          <p class="doc__trow doc__trow--total">
            <span>{{ isQuote ? "Estimated total" : isPaid ? "Paid in full" : "Amount due" }}</span>
            <b v-if="loading"><i class="sk" style="width: 7em"></i></b>
            <b v-else>{{ withCur(isPaid ? total : outstanding) }}</b>
          </p>
        </div>
      </div>

      <p v-if="loading" class="doc__terms">
        <i class="sk" style="width: 40%"></i><br />
        <i class="sk" style="width: 88%"></i>
      </p>
      <p v-else-if="isQuote" class="doc__terms">
        <b>This is a quotation, not a bill — nothing is owed yet.</b>
        {{
          d.terms ||
          (d.validUntil
            ? `Prices hold until ${formatDate(d.validUntil)}. Reply to accept and we will raise the invoice.`
            : "Reply to accept and we will raise the invoice.")
        }}
      </p>
      <p v-else-if="!isPaid" class="doc__terms">
        <b>Payment is due by {{ formatDate(d.dueAt) }}.</b>
        {{ d.terms || "Pay online using the link in the message this invoice came with, or transfer to the account above and reply once it is sent." }}
      </p>
      <p v-else class="doc__terms">
        <b>Paid in full — thank you.</b> Keep this for your records; no further
        action is needed.
      </p>

      <!-- Attribution (spec 09).
           Was unconditional — every plan, no way off, and worded "Generated by"
           which reads like the document was produced BY us rather than sent
           with our help. Now it draws only when the server says so: always for
           free accounts, and for paid accounts unless they have switched it
           off. `d.attribution` is null when it should not appear at all, so
           there is no hidden-but-present block to get wrong.

           Kept deliberately quiet. The spec is blunt about this never competing
           with the user's own logo or making their invoice look like an advert
           — a user who thinks their invoice looks cheap either upgrades to
           remove it, which is fine, or leaves, which is not. -->
      <footer v-if="d.attribution" class="doc__foot">
        <span>{{ d.attribution.text }}</span>
        <img src="/InvoKitaLogo.png" alt="InvoKita" />
      </footer>
    </div>

    <div v-if="isPaid" class="doc__stamp" aria-hidden="true">Paid</div>
  </article>
</template>
