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

/* ─── Money ──────────────────────────────────────────────────────────────── */

/** Whole units, for screen. Amounts in a list do not need cents to be scanned. */
export const money = (n) =>
  (Number(n) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

/** Two decimals, for documents and for any figure the user is about to commit. */
export const cash = (n) =>
  (Number(n) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
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

export const totals = (form) => {
  const items = Array.isArray(form?.lineItems) ? form.lineItems : [];
  const subtotal = items.reduce(
    (sum, i) => sum + num(i.priceNum) * num(i.qty),
    0,
  );
  const discount = form?.addDiscount
    ? subtotal * (num(form.discountPercentage) / 100)
    : 0;
  const tax = (subtotal - discount) * (num(form?.taxRate) / 100);
  return {
    subtotal,
    discount,
    tax,
    total: subtotal - discount + tax,
    count: items.length,
  };
};

/** Parses what someone typed into a price field: "1,200.50" and "1 200" both work. */
export const parsePrice = (str) => {
  const n = parseFloat(String(str ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/* ─── Time ───────────────────────────────────────────────────────────────── */

export const isSettled = (status) => status === "Paid" || status === "Cancelled";

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

export const amountOutstanding = (invoice) =>
  Math.max(0, num(invoice?.amount) - num(invoice?.amountPaid));

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
    },
    to: form?.showManualClient
      ? {
          name: form?.manualClient?.name || "",
          company: form?.manualClient?.company || "",
          email: form?.manualClient?.email || "",
          address: form?.manualClient?.address || "",
        }
      : {
          name: extra.client?.name || "",
          company: extra.client?.company || "",
          email: extra.client?.email || "",
          address: extra.client?.address || "",
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
    },
    to: {
      name: invoice?.client?.name || "",
      company: invoice?.client?.company || "",
      email: invoice?.client?.email || "",
      address: invoice?.client?.address || "",
    },
    items,
    discount,
    tax: 0,
    taxRate: num(invoice?.taxRate),
    paid: extra.receipt ? 0 : num(invoice?.amountPaid),
    total: num(invoice?.amount),
    logo: extra.logo || null,
    terms: extra.terms || null,
  };
};
