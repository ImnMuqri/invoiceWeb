/**
 * Invoice module — shared logic.
 *
 * The four invoice pages were each computing "is this late", "what is the
 * total", "what does the document look like" on their own, which is how the
 * edit page ended up sending `amount: NaN` to the API while the create page
 * next to it was fine: `taxRate` existed in one page's form object and not the
 * other's, and `x * (undefined / 100)` is NaN all the way to the database.
 *
 * One set of functions, so a fix lands once.
 */

/* ─── Money ───────────────────────────────────────────────────────────────────
   EVERY amount crossing the API is an integer number of SEN, never ringgit and
   never a float. 0.1 + 0.2 is 0.30000000000000004, and an invoicing product
   cannot promise its totals reconcile while carrying that.

   So there are exactly two boundaries, and they are the only places the two
   units meet:

     fromSen()  sen -> ringgit, for display
     toSen()    what a person typed -> sen, for storage

   Anything between those is sen. If you find yourself dividing by 100 anywhere
   else, that is the bug.                                                    */

/** Sen to ringgit, as a number. The single read boundary. */
export const fromSen = (n) => (Number(n) || 0) / 100;

/** A typed value to sen. The single write boundary. Rounds, never truncates. */
export const toSen = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

/** Whole units, for screen. Amounts in a list do not need cents to be scanned. */
export const money = (sen) =>
  fromSen(sen).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

/** Two decimals, for documents and for any figure the user is about to commit. */
export const cash = (sen) =>
  fromSen(sen).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * A subscription price, for pricing cards.
 *
 * Plan.price, Subscription.amount and TopUp.price are sen like everything else.
 * Cents only when there are cents: "RM 29", not "RM 29.00" — a price tag with
 * trailing zeros reads as a form field rather than a price. This exists so the
 * five surfaces showing a plan price (landing, onboarding, billing settings and
 * two admin tables) share one boundary instead of each rolling a formatter and
 * each forgetting to convert, which is exactly what had happened.
 */
export const price = (sen) =>
  fromSen(sen).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

/** The symbol people actually recognise, with a safe fall-back to the code. */
export const currencySymbol = (code) =>
  ({ MYR: "RM", USD: "$", SGD: "S$", EUR: "€", GBP: "£" })[code] || code || "";

/* Every total in the module goes through here. `num()` is the whole point: a
   missing field contributes zero instead of poisoning the arithmetic. */
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* Everything here is sen. Percentages are the one place a fraction appears, so
   each result is rounded straight back to whole sen — otherwise the subtotal and
   the sum of the lines can disagree by a sen, which is exactly the drift the
   integer model exists to prevent. */
export const totals = (form) => {
  const items = Array.isArray(form?.lineItems) ? form.lineItems : [];
  const subtotal = items.reduce(
    (sum, i) => sum + num(i.priceNum) * num(i.qty),
    0,
  );
  const discount = form?.addDiscount
    ? Math.round(subtotal * (num(form.discountPercentage) / 100))
    : 0;
  const tax = Math.round((subtotal - discount) * (num(form?.taxRate) / 100));
  return {
    subtotal,
    discount,
    tax,
    total: subtotal - discount + tax,
    count: items.length,
  };
};

/** What someone typed into a price field, in SEN. "1,200.50" and "1 200" both work. */
export const parsePrice = (str) => {
  const n = parseFloat(String(str ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

/** Sen back into a price field, for editing. The inverse of parsePrice. */
export const priceToInput = (sen) => {
  const n = Number(sen) || 0;
  return n ? String(n / 100) : "";
};

/* ─── Time ───────────────────────────────────────────────────────────────── */

export const isSettled = (status) =>
  status === "Paid" || status === "Cancelled" || status === "Void";

/** Days past the due date, or 0. Never negative, so callers can just truthy-test. */
export const daysLate = (invoice) => {
  if (!invoice?.dueDate || isSettled(invoice.status)) return 0;
  const diff = Math.floor(
    (Date.now() - new Date(invoice.dueDate).getTime()) / 86400000,
  );
  return diff > 0 ? diff : 0;
};

/** Days until due. Negative once it is late. */
export const daysUntilDue = (invoice) => {
  if (!invoice?.dueDate) return null;
  return Math.ceil(
    (new Date(invoice.dueDate).getTime() - Date.now()) / 86400000,
  );
};

/** The due date in words, because "12 days late" is a decision and a date is not. */
export const dueInWords = (invoice) => {
  if (isSettled(invoice?.status)) return "";
  const late = daysLate(invoice);
  if (late) return `${late} ${late === 1 ? "day" : "days"} late`;
  const left = daysUntilDue(invoice);
  if (left === null) return "";
  if (left === 0) return "Due today";
  if (left === 1) return "Due tomorrow";
  if (left <= 7) return `Due in ${left} days`;
  return "";
};

/**
 * What is still owed, in SEN.
 *
 * Prefers the server's `amountDue`, which already accounts for credit notes as
 * well as payments and is the same column the chaser reads. The subtraction is
 * only a fallback for a payload that predates spec 03 — computing it here
 * independently is how the dashboard and the reminder end up disagreeing.
 */
export const amountOutstanding = (invoice) =>
  invoice?.amountDue !== undefined && invoice?.amountDue !== null
    ? Math.max(0, num(invoice.amountDue))
    : Math.max(0, num(invoice?.amount) - num(invoice?.amountPaid));

export const isUnpaid = (invoice) =>
  !isSettled(invoice?.status) && amountOutstanding(invoice) > 0;

/* ─── Chasing ────────────────────────────────────────────────────────────────
   The question this product exists to answer, and the reason it is a column of
   its own in the ledger rather than a detail on a settings page. */
export const isChased = (invoice) =>
  !!(invoice?.client?.autoChaser || invoice?.client?.autoEmailChaser);

/** The most recent nudge of any kind, or null. */
export const lastNudge = (invoice) => {
  const stamps = [
    invoice?.emailLastSent && { at: invoice.emailLastSent, via: "email" },
    invoice?.whatsappLastSent && {
      at: invoice.whatsappLastSent,
      via: "WhatsApp",
    },
  ].filter(Boolean);
  if (!stamps.length) return null;
  return stamps.sort((a, b) => new Date(b.at) - new Date(a.at))[0];
};

/**
 * How a client has behaved before, in plain words.
 *
 * Takes the client, so the clients list and the invoice ledger describe the same
 * person the same way. The clients table used to print `{{ averageDelayDays }}
 * days` raw, which said "0 days" for somebody who has never paid you anything —
 * indistinguishable from somebody who always pays on the dot — and " days" when
 * the field was null.
 *
 * `history` is false when there is nothing to go on, so callers can say so
 * rather than implying punctuality nobody has earned yet.
 */
export const payDelay = (client) => {
  const raw = client?.averageDelayDays;
  if (raw === null || raw === undefined || raw === "") {
    return { history: false, tone: "unknown", level: "none", label: "No history yet" };
  }
  const delay = Math.round(num(raw));
  if (delay <= 0)
    return { history: true, tone: "ok", level: "none", label: "Pays on time" };
  if (delay <= 3)
    return {
      history: true,
      tone: "ok",
      level: "none",
      label: `Pays ${delay}d late`,
    };
  return {
    history: true,
    tone: delay > 10 ? "high" : "mild",
    level: delay > 10 ? "high" : "medium",
    label: `Usually pays ${delay}d late`,
  };
};

/**
 * The same fact, shaped for the invoice ledger, where it is only worth a line if
 * it is bad enough to change what you do next.
 *
 * Same thresholds the old "Late Risk" column used, minus the column, the
 * lightning-bolt icon and the tooltip that had to explain its own scoring. A
 * risk score you have to look up is not information; "usually pays 14 days
 * late" is the same fact and needs no legend.
 */
export const payHabit = (invoice) => {
  const d = payDelay(invoice?.client);
  return d.level === "none" ? null : { level: d.level, label: d.label };
};

/* ─── The document ───────────────────────────────────────────────────────────
   One normaliser per source shape, both producing the object InvoicePaper
   draws. Adding a field to the document means adding it in exactly two places
   instead of in three page templates. */

/**
 * Tax identifiers, shaped for printing (spec 05).
 *
 * Returns a list of `{ label, value }` rather than an object, so the document
 * template loops instead of asking four questions — and so "only when present"
 * is decided once, here, instead of in every place that draws a document.
 *
 * An empty list means the block does not render at all. That is what makes the
 * spec's first acceptance criterion true: a user who fills nothing in sees an
 * invoice identical to the one they got before these fields existed.
 */
const identifierList = (source, keys) => {
  const out = [];
  for (const [key, label] of keys) {
    const value = source?.[key];
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      out.push({ label, value: String(value).trim() });
    }
  }
  return out;
};

const BUSINESS_KEYS = [
  ["registrationNumber", "Reg. No."],
  ["tin", "TIN"],
  ["msicCode", "MSIC"],
  ["sstNumber", "SST No."],
];

/** The frozen copy on an invoice row uses `from`-prefixed column names. */
const SNAPSHOT_KEYS = [
  ["fromRegistrationNumber", "Reg. No."],
  ["fromTin", "TIN"],
  ["fromMsicCode", "MSIC"],
  ["fromSstNumber", "SST No."],
];

/**
 * A client's identifiers.
 *
 * `isIndividual` suppresses the registration number rather than the whole
 * block: a person has a TIN but cannot have a company registration number, so
 * printing "Reg. No." for one would be stating something false. This is the
 * flag's entire job — the spec says it "changes which identifiers are
 * relevant", and this is where that becomes true on the page.
 */
const clientIdentifiers = (client) => {
  if (!client) return [];
  const keys = client.isIndividual
    ? [["tin", "TIN"]]
    : [
        ["registrationNumber", "Reg. No."],
        ["tin", "TIN"],
      ];
  return identifierList(client, keys);
};

/**
 * Both identifier blocks for an invoice as the API returns it.
 *
 * Exported because two different surfaces draw the same invoice: the PDF (via
 * InvoicePaper) and the public payment page, which is hand-built markup and
 * shares none of the document's components. They have to reach the same answer
 * about what is shown and what is hidden — a payment page listing a TIN that
 * the PDF omits is a contradiction the client can see — so the decision lives
 * here once and both call it.
 */
export const documentIdentifiers = (invoice) => ({
  from:
    invoice?.showTaxIdentifiers === false
      ? []
      : identifierList(invoice, SNAPSHOT_KEYS),
  to:
    invoice?.showClientIdentifiers === false
      ? []
      : clientIdentifiers(invoice?.client),
});

/** From the builder's live form state (create + edit preview). */
export const docFromForm = (form, extra = {}) => {
  const t = totals(form);
  const isQuote = (form?.type || extra.type) === "quote";
  return {
    /* Drives every quotation difference in Paper.vue. Kept off `kind`, which is
       the printed word at the top ("INVOICE", "OFFICIAL RECEIPT"), because a
       receipt is an invoice and a quotation is not. */
    type: isQuote ? "quote" : "invoice",
    kind: isQuote ? "QUOTATION" : "INVOICE",
    layout: form?.template || "professional",
    number: form?.invoiceNumber || "",
    name: form?.invoiceName || "",
    subject: form?.subject || "",
    currency: form?.currency || "MYR",
    status: form?.status || "Pending",
    issuedAt: form?.date || new Date(),
    dueAt: isQuote ? null : form?.dueDate || null,
    validUntil: isQuote ? form?.validUntil || null : null,
    from: {
      name: form?.from?.name || "",
      companyName: form?.from?.companyName || "",
      email: form?.from?.companyEmail || "",
      phone: form?.from?.phone || "",
      address: form?.from?.companyAddress || "",
      /* Live from the profile here, because the invoice does not exist yet and
         so has nothing frozen on it. The preview therefore shows what WILL be
         stamped on the document the moment it is saved. */
      identifiers: identifierList(form?.from?.identifiers, BUSINESS_KEYS),
    },
    to: form?.showManualClient
      ? {
          name: form?.manualClient?.name || "",
          company: form?.manualClient?.company || "",
          email: form?.manualClient?.email || "",
          address: form?.manualClient?.address || "",
          /* A one-off client typed straight onto the invoice has no record to
             carry identifiers on. */
          identifiers: [],
        }
      : {
          name: extra.client?.name || "",
          company: extra.client?.company || "",
          email: extra.client?.email || "",
          address: extra.client?.address || "",
          identifiers:
            extra.showClientIdentifiers === false
              ? []
              : clientIdentifiers(extra.client),
        },
    items: (form?.lineItems || []).map((i) => ({
      name: i.name,
      price: num(i.priceNum),
      quantity: num(i.qty),
    })),
    discount: t.discount,
    tax: t.tax,
    taxRate: num(form?.taxRate),
    paid: num(extra.paid),
    total: t.total,
    logo: extra.logo || null,
    terms: extra.terms || null,
    /* Spec 09, on the builder preview too — "what your client will see" has to
       actually be what they see, attribution line included. Supplied by the
       caller from the account's own settings. */
    attribution: extra.attribution || null,
  };
};

/** From an invoice as the API returns it (the export page and the PDF). */
export const docFromInvoice = (invoice, extra = {}) => {
  let items = (invoice?.items || []).map((i) => ({
    name: i.name,
    price: num(i.price),
    quantity: num(i.quantity) || 1,
  }));

  /* Invoices exist with a stored `amount` and no line-item rows. Left alone,
     the document printed "Subtotal 0.00" directly above "Amount due 25,000.00"
     — a bill that contradicts itself, sent to a client. One synthesised line
     makes the arithmetic on the page add up to the figure being charged. */
  if (!items.length && num(invoice?.amount) > 0) {
    items = [
      {
        name: invoice.invoiceName || invoice.subject || "Agreed amount",
        price: num(invoice.amount),
        quantity: 1,
      },
    ];
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  /* The API stores the final amount, not the breakdown, so anything the lines
     do not account for is shown as a discount — which is what it is. */
  const discount = Math.max(0, subtotal - num(invoice?.amount));
  const isQuote = invoice?.kind === "QUOTE";
  return {
    type: isQuote ? "quote" : "invoice",
    kind: extra.receipt
      ? "OFFICIAL RECEIPT"
      : isQuote
        ? "QUOTATION"
        : "INVOICE",
    layout: extra.layout || invoice?.template || "professional",
    number: invoice?.invoiceNumber || "",
    name: invoice?.invoiceName || "",
    subject: invoice?.subject || "",
    currency: invoice?.currency || "MYR",
    status: extra.receipt ? "Paid" : invoice?.status || "Pending",
    issuedAt: invoice?.date || null,
    dueAt: isQuote ? null : invoice?.dueDate || null,
    validUntil: isQuote ? invoice?.validUntil || null : null,
    from: {
      name: invoice?.fromName || "",
      companyName: invoice?.fromCompanyName || "",
      email: invoice?.fromEmail || "",
      phone: invoice?.fromPhone || "",
      address: invoice?.fromAddress || "",
      /* The FROZEN copy on the row, not the current profile. This is the whole
         point of snapshotting: re-reading the profile here would make an old
         PDF disagree with the one the client is holding. */
      identifiers: documentIdentifiers(invoice).from,
    },
    to: {
      name: invoice?.client?.name || "",
      company: invoice?.client?.company || "",
      email: invoice?.client?.email || "",
      address: invoice?.client?.address || "",
      identifiers: documentIdentifiers(invoice).to,
    },
    items,
    discount,
    tax: 0,
    taxRate: num(invoice?.taxRate),
    paid: extra.receipt ? 0 : num(invoice?.amountPaid),
    total: num(invoice?.amount),
    logo: extra.logo || null,
    terms: extra.terms || null,
    /* Spec 09. Decided by the SERVER (utils/attribution.js) and carried here
       verbatim — never recomputed from the plan on this side. Two different
       surfaces draw this document, and a second opinion about whether to show
       attribution is exactly how a paying customer ends up with it stripped
       from the payment page and still printed on the PDF attached to it.
       Null means draw nothing. */
    attribution: extra.attribution || invoice?.attribution || null,
  };
};
