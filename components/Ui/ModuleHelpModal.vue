<template>
  <!-- surface="light": the content below is still hardcoded Tailwind slate, so
       it needs the fixed-white shell rather than the themed one. -->
  <UiModal
    v-model="uiStore.isModuleHelpOpen"
    maxWidth="md"
    surface="light"
    :showClose="true">
    <!-- Capped and split into three bands: the heading and the button stay put
         and only the tips scroll. Before this the panel simply grew with the
         number of tips — the Invoices guide came out 749px tall, which spills
         off a 768px laptop and pushes "Got it" behind the fold on anything
         shorter. A guide you have to scroll the page to dismiss is worse than
         one that is a little dense. -->
    <div class="relative overflow-hidden flex flex-col max-h-[85vh]">
      <!-- Background Accents -->
      <div
        class="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20"
        :class="moduleConfig.accentBase"></div>

      <div class="relative flex flex-col min-h-0">
        <!-- Header -->
        <div class="flex items-center gap-4 px-6 pt-6 pb-5 shrink-0">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm border"
            :class="moduleConfig.iconBg">
            <UiIcon
              :icon="moduleConfig.icon"
              :custom-class="'w-6 h-6 ' + moduleConfig.iconColor" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              {{ moduleConfig.title }}
            </h3>
            <p class="text-xs font-medium text-slate-500">Module Guide</p>
          </div>
        </div>

        <!-- Content Steps -->
        <div class="deskbar space-y-4 px-6 overflow-y-auto min-h-0">
          <div
            v-for="(tip, index) in moduleConfig.tips"
            :key="index"
            class="flex gap-3 group">
            <div
              class="shrink-0 w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors border border-slate-100">
              <span class="text-xs font-bold">{{ index + 1 }}</span>
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-900">{{ tip.label }}</h4>
              <p class="text-[13px] text-slate-500 mt-1 leading-relaxed">
                {{ tip.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Action -->
        <div class="px-6 pt-5 pb-6 shrink-0">
          <button
            @click="uiStore.closeModuleHelp"
            class="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-all shadow-lg shadow-slate-900/10">
            Got it, Thanks!
          </button>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<script setup>
import { computed } from "vue";
import { useUiStore } from "@/stores/uiStore";

const uiStore = useUiStore();

const configs = {
  dashboard: {
    title: "Dashboard Overview",
    icon: "heroicons:presentation-chart-bar",
    iconBg: "bg-indigo-50 border-indigo-100",
    iconColor: "text-indigo-600",
    accentBase: "bg-indigo-500",
    tips: [
      {
        label: "Module Statistics",
        description:
          "View your Total Revenue, Pending Payments, Active Clients, and Overdue count at a glance.",
      },
      {
        label: "Monthly Revenue Forecast",
        description:
          "Track your income performance and projects with our interactive revenue chart.",
      },
      {
        label: "AI Chaser Insights",
        description:
          "Review automated suggestions on client payment health and follow-up priorities.",
      },
      {
        label: "Activity History",
        description:
          "Monitor the latest invoice events, including sent, viewed, and paid updates.",
      },
    ],
  },
  /* Rewritten alongside the invoice module rework. The old tips described a
     screen that no longer exists ("Click the 'Check' icon in the table action
     menu") and were written about the software rather than about the job. */
  invoices: {
    title: "Your invoices",
    icon: "heroicons:document-duplicate",
    iconBg: "bg-emerald-50 border-emerald-100",
    iconColor: "text-emerald-600",
    accentBase: "bg-emerald-500",
    tips: [
      {
        label: "Open is the default view",
        description:
          "The list starts on what has not been paid, most overdue first, so the invoice you need is at the top. The counts on Open, Late and Paid tell you where things stand before you click anything.",
      },
      {
        label: "Search finds anything",
        description:
          "One box covers the client, the invoice number and what the work was for. Faster than scrolling once you have more than a page of them.",
      },
      {
        label: "The Chasing column is the point",
        description:
          "It says whether anyone is following up. 'On, automatic' means we handle the reminders; 'Off' means it is on you. You can switch chasing on per client from the Clients page.",
      },
      {
        label: "The payment link needs no account",
        description:
          "Every invoice has one. Copy it from the row and paste it into a chat — your client can view and pay without signing up for anything. Set up ToyyibPay or Billplz in Settings to take card and FPX payments through it.",
      },
      {
        label: "Record part payments as they land",
        description:
          "Use 'Record a payment' in the row menu. Put in what actually arrived; we settle the invoice automatically once the balance reaches zero and stop chasing.",
      },
      {
        label: "Cancel rather than delete",
        description:
          "Deleting removes an invoice you may have already sent. Cancelling keeps your records and your client's copy intact and switches the payment link off.",
      },
    ],
  },
  /* Rewritten with the page. The old tips described a screen that no longer
     exists — an "Avg Delay" column and a "Chaser switch" that was read-only —
     and they were written about the software rather than about the job. */
  quotes: {
    title: "Quotations",
    icon: "heroicons:document-duplicate",
    iconBg: "bg-emerald-50 border-emerald-100",
    iconColor: "text-emerald-600",
    accentBase: "bg-emerald-500",
    tips: [
      {
        label: "A quotation is not a bill",
        description:
          "It carries no payment link, nothing chases it, and it never appears in what you are owed. Until somebody accepts it, it is an offer.",
      },
      {
        label: "They answer it themselves",
        description:
          "Send it and your client gets a page with accept and decline on it — one tap, no account, no login. Accepting records who agreed and when, so you are not tracking the outcome in your head.",
      },
      {
        label: "You can see they opened it",
        description:
          "A quotation that has been read and not answered is a different situation from one that might still be sitting unread. The first is worth a phone call; the second is worth waiting a day.",
      },
      {
        label: "Accepting it writes the invoice",
        description:
          "One click copies the client, the lines and the total into a new invoice with a fresh number and a due date. You never retype it — and it is offered, never done for you, because most people invoice on their own schedule.",
      },
      {
        label: "The quotation survives",
        description:
          "It stays exactly as it was, marked accepted, with the invoice attached — so you can show a client what they agreed to and what you billed for it.",
      },
      {
        label: "Valid until, not due",
        description:
          "Thirty days by default. After that it expires and we tell you — once — because a price you offered months ago is not a price you still mean. Your client is never messaged about it: they agreed to nothing, so chasing them would be sales pressure rather than collections.",
      },
      {
        label: "Their own numbering",
        description:
          "Quotes run QUO-0001 upward on a sequence of their own, so issuing one never leaves a gap in your invoice numbers.",
      },
    ],
  },
  clients: {
    title: "Your clients",
    icon: "heroicons:user-group",
    iconBg: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-600",
    accentBase: "bg-amber-500",
    tips: [
      {
        label: "Bring the whole list in at once",
        description:
          "Paste your clients straight from a spreadsheet or drop in a CSV — the columns are worked out for you and you check everything before anything is saved. Phone numbers are tidied into one format, and anything that cannot be read is flagged rather than imported broken.",
      },
      {
        label: "A name, and a way to reach them",
        description:
          "That is all that is required — an email or a phone number, either will do. Everything else you fill in prints on their invoices, so you only type it the once.",
      },
      {
        label: "Let us do the chasing",
        description:
          "Turn on WhatsApp or email reminders per client and we nudge them the day an invoice goes past its due date, and keep going until it is paid.",
      },
      {
        label: "The list is sorted by who keeps you waiting",
        description:
          "Slowest payers sit at the top. “Usually pays 14d late” is worth knowing before you agree to the next job for them.",
      },
      {
        label: "Nobody chasing",
        description:
          "The figure at the top counts clients you would have to chase yourself. Switch reminders on for them and it goes to zero.",
      },
      {
        label: "Deleting is not the same as hiding",
        description:
          "Invoices you have already sent stay in your records, but they lose the client details attached to them, and any reminders queued for that client stop.",
      },
    ],
  },
  settings: {
    title: "Settings",
    icon: "heroicons:cog-6-tooth",
    iconBg: "bg-slate-50 border-slate-200",
    iconColor: "text-slate-600",
    accentBase: "bg-slate-400",
    tips: [], // Dynamic below
  },
  business: {
    title: "Business",
    icon: "heroicons:building-office-2",
    iconBg: "bg-slate-50 border-slate-200",
    iconColor: "text-slate-600",
    accentBase: "bg-slate-400",
    tips: [], // Dynamic below, same table as Settings
  },
  /* Recurring and Exports both had a help button on the page and no entry
     here, and a missing key falls back to `configs.dashboard` — so pressing
     help on either explained a completely different screen. A silent wrong
     answer is worse than no button. */
  recurring: {
    title: "Recurring invoices",
    icon: "heroicons:arrow-path-rounded-square",
    iconBg: "bg-violet-50 border-violet-100",
    iconColor: "text-violet-600",
    accentBase: "bg-violet-500",
    tips: [
      {
        label: "A schedule is not an invoice",
        description:
          "It is a template plus a cadence. Nothing is owed by a schedule — it issues real invoices on the dates you set, and those behave like any other invoice from then on.",
      },
      {
        label: "It issues before the working day",
        description:
          "Generation runs early each morning, Malaysian time, so an invoice dated today is out before your client opens their inbox — and before the reminder sweep, so nothing is chased the same morning it was created.",
      },
      {
        label: "Running it twice changes nothing",
        description:
          "Each schedule can produce only one invoice per period. A retry, a restart or a double-run cannot bill your client twice for the same month.",
      },
      {
        label: "The schedule holds the price",
        description:
          "A retainer agreed at one rate keeps issuing at that rate, even if you later change your default tax rate or currency. Editing the schedule is the only thing that changes what it issues.",
      },
      {
        label: "Pausing stops the next one, not the last one",
        description:
          "Invoices already issued stay exactly as they are, and keep being chased. Pausing only stops the next one being created.",
      },
    ],
  },
  exports: {
    title: "Exports",
    icon: "heroicons:arrow-down-tray",
    iconBg: "bg-sky-50 border-sky-100",
    iconColor: "text-sky-600",
    accentBase: "bg-sky-500",
    tips: [
      {
        label: "Built for your accountant",
        description:
          "A CSV with one row per invoice and the columns an accountant actually asks for — dates, client, amounts, tax identifiers and what has been paid against each one.",
      },
      {
        label: "Pick the months you need",
        description:
          "Export any range. Most people take one month at a time when the books are done, or a full year when it is time to file.",
      },
      {
        label: "Have it sent automatically",
        description:
          "Put your accountant's email in Business settings and last month's records go to them on the first of each month. The address is the switch — leave it blank and nothing is sent.",
      },
      {
        label: "Empty months are sent too",
        description:
          "A month with no invoices is information. An accountant expecting twelve files a year should get twelve.",
      },
      {
        label: "Voided invoices are left out",
        description:
          "Unless you ask for them. A voided invoice was never owed, so including it by default would overstate what you billed.",
      },
    ],
  },
  catalogue: {
    title: "Catalogue",
    icon: "heroicons:squares-2x2",
    iconBg: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-600",
    accentBase: "bg-amber-500",
    tips: [
      {
        label: "A price list, not a stock room",
        description:
          "Nothing here counts units or warns you when you run low — saving something does not mean you have one. It is here so you stop retyping the same line on every invoice.",
      },
      {
        label: "Prices are copied, not linked",
        description:
          "Adding an item to an invoice takes a copy of the price. Raise your day rate later and old invoices keep saying what they said when you sent them.",
      },
      {
        label: "Sorted by what you actually use",
        description:
          "The picker puts your most-used items first rather than A to Z, because most people sell four things constantly and forty things occasionally.",
      },
      {
        label: "Archive keeps your history honest",
        description:
          "Something you have billed for gets archived rather than deleted — it leaves the picker, and every document that used it is untouched.",
      },
    ],
  },
  referrals: {
    title: "Rewards Program",
    icon: "heroicons:gift",
    iconBg: "bg-pink-50 border-pink-100",
    iconColor: "text-pink-600",
    accentBase: "bg-pink-500",
    tips: [
      {
        label: "They get something too",
        description:
          "Their first month is discounted. That is deliberate — it makes the link worth sending, rather than feeling like you are taking a commission off a friend.",
      },
      {
        label: "Credit, not a claim",
        description:
          "When somebody you referred subscribes, credit lands on your account and comes off your next subscription payment by itself. There is nothing to redeem and no payout to request.",
      },
      {
        label: "It pays when they pay",
        description:
          "Not when they sign up. An account that signs up and never subscribes earns nothing, which is what keeps the programme worth running.",
      },
      {
        label: "Four numbers, not one",
        description:
          "Opened, signed up, subscribed and credit earned are shown separately. Clicks with no signups is a different problem from signups with no subscriptions, and one figure would hide which you have.",
      },
      {
        label: "Refunds come back off",
        description:
          "If a referred subscription is refunded, the credit for it is reversed. Your balance never goes below zero — you are not charged for somebody else's refund.",
      },
    ],
  },
};

const settingsSubTips = {
  general: [
    {
      label: "This is your letterhead",
      description:
        "Everything under “What clients see” prints at the top of every invoice. Fill it in once here rather than typing it per invoice.",
    },
    {
      label: "Login email and name are fixed",
      description:
        "They identify the account, so we change them by hand — email support@invokita.my and we will sort it.",
    },
    {
      label: "“Same as” actually stays the same",
      description:
        "Tick it and the two fields track each other from then on. Untick it to set a different one.",
    },
  ],
  invoice_config: [
    {
      label: "Anything greyed out is missing a value",
      description:
        "You cannot print a business address you have not given us. Add it under General and the switch turns on.",
    },
    {
      label: "The chasing switch is the master one",
      description:
        "Off means nobody gets chased, even clients you switched on individually. To stop chasing one client, do it in Clients instead.",
    },
    {
      label: "Prefix and tax are only defaults",
      description:
        "They set what a new invoice opens as. You can change either on the invoice itself.",
    },
    {
      label: "Your tax identifiers are frozen at issue",
      description:
        "An invoice keeps the SSM number and TIN it was sent with. Correcting a typo here fixes your next invoice, never one your client already holds a copy of.",
    },
    {
      label: "Our name on your invoices",
      description:
        "Free accounts carry a single quiet line at the foot of the payment page and the PDF. Any paid plan can switch it off — not just the top one.",
    },
  ],
  whatsapp: [
    {
      label: "Our number or yours",
      description:
        "Ours works immediately. Your own Twilio sends from your business number, and needs all three credentials before anything will go out.",
    },
    {
      label: "Templates are optional",
      description:
        "Leave them blank and we use ours. Anything in braces gets filled in per invoice — click a token to copy it.",
    },
    {
      label: "Reminders spend quota",
      description:
        "Every automatic message counts against your monthly limit. A 3-day interval across a lot of late invoices spends it fast.",
    },
  ],
  email: [
    {
      label: "The first email is not a reminder",
      description:
        "That one goes out when you send the invoice. This tab is only about what happens after it falls due.",
    },
    {
      label: "The preview is what they get",
      description:
        "Your business name and currency in it are real. The amount and dates are a sample.",
    },
  ],
  payments: [
    {
      label: "One method goes on the invoice",
      description:
        "Connect as many as you like, but the one marked “On your invoices” is what your client is offered.",
    },
    {
      label: "Bank transfer is the fallback",
      description:
        "It is what clients get when no gateway is preferred. We cannot detect those payments, so you mark them paid yourself.",
    },
    {
      label: "Your keys stay encrypted",
      description:
        "We use them to raise a payment for your own invoices and nothing else. We never see your bank login.",
    },
  ],
  billing: [
    {
      label: "Top up without changing plan",
      description:
        "Run out of WhatsApp allowance mid-month and you can buy a block of extra chases here. It is used only after your plan allowance, and it does not carry into next month — which is said at the point of purchase, not buried.",
    },
    {
      label: "A top-up lands when the bank confirms it",
      description:
        "Not when you close the checkout tab. That is a few seconds, and it is why closing the tab early buys nothing.",
    },
    {
      label: "Cancelling is not immediate",
      description:
        "You keep everything you are paying for until the period ends, then move to Free.",
    },
    {
      label: "Free means you do the chasing",
      description:
        "Automatic reminders stop on Free. You can still send them by hand from any invoice.",
    },
    {
      label: "Promo codes apply before you commit",
      description:
        "Apply one and the prices on the cards update, so you see what you will actually be charged.",
    },
  ],
  security: [
    {
      label: "Long beats complicated",
      description:
        "Three or four unrelated words is harder to crack than one word with symbols in it, and easier to remember.",
    },
    {
      label: "Changing it does not sign you out",
      description:
        "Other devices stay signed in. If you think someone else has access, change the password and email us.",
    },
  ],
};

/* Details and Documents were General and Invoices before the Business module
   split off. The tip copy did not change with the tab name, so both ids resolve
   to the same entry rather than the table being duplicated. */
const SUB_ALIASES = { details: "general", documents: "invoice_config" };

const moduleConfig = computed(() => {
  /* A missing key used to fall back to the Dashboard guide silently, so a page
     whose guide had never been written answered "how does this work?" with an
     explanation of a different screen — which is worse than saying nothing,
     because it reads as an answer. Recurring and Exports were both in that
     state. The fallback stays (a blank modal helps nobody) but it is now loud
     in development, so the next module that ships without a guide is noticed
     while it is being built rather than by a user. */
  const known = configs[uiStore.activeModuleHelp];
  if (!known && import.meta.dev) {
    console.warn(
      `[ModuleHelp] No guide for "${uiStore.activeModuleHelp}" — showing the Dashboard guide instead. Add an entry in ModuleHelpModal.vue.`,
    );
  }
  const baseConfig = known || configs.dashboard;
  const tabbed = ["settings", "business"].includes(uiStore.activeModuleHelp);

  if (tabbed && uiStore.activeSubContext) {
    const key = SUB_ALIASES[uiStore.activeSubContext] || uiStore.activeSubContext;
    return { ...baseConfig, tips: settingsSubTips[key] || baseConfig.tips };
  }

  return baseConfig;
});
</script>

<style scoped></style>
