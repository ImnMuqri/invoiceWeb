<script setup>
/**
 * THE DESK — dashboard, rebuilt.
 *
 * The old page was an analytics dashboard: four pastel KPI tiles, a revenue
 * forecast, a client-profitability ranking. That is the right shape for someone
 * analysing a business. This audience is not analysing anything — they are
 * freelancers and small shops who open this to find out one thing: who owes me
 * money, and is anything being done about it.
 *
 * So this is a work surface, not a report. It answers, in order:
 *   1. how much am I owed          -> the money line
 *   2. what is late and unattended -> the worklist, split by whether the
 *                                     chaser is actually handling it
 *   3. what happened recently      -> recent invoices
 *   4. who costs me time           -> clients ranked by how late they pay
 *   5. is the trend okay           -> cashflow
 *   6. account admin               -> a footnote at the bottom
 *
 * Styling comes from assets/css/app-desk.css, built on the brand tokens with NO
 * Tailwind utilities. The app's dark mode works by overriding utility classes
 * with !important, and every contrast bug in this project traced back to one
 * utility meaning two different things in two places. Tokens in, no overrides
 * needed, both themes correct by construction.
 *
 * Data contracts are unchanged — same store, same endpoints, same params.
 * Previous version: .archive/dashboard.legacy.vue
 */
import { onMounted, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDashboardStore } from "~/stores/dashboardStore";
import { useAuthStore } from "~/stores/authStore";
import { useUiStore } from "~/stores/uiStore";
import { useReferralStore } from "~/stores/referralStore";
import { useSystemStore } from "~/stores/systemStore";
import { fromSen, money } from "~/utils/invoice";
import confetti from "canvas-confetti";

const route = useRoute();
const router = useRouter();
const dashboardStore = useDashboardStore();
const authStore = useAuthStore();
const uiStore = useUiStore();
const referralStore = useReferralStore();
const systemStore = useSystemStore();
const { $api } = useNuxtApp();
const toast = ref({ message: "", type: "success" });

const forecastRange = ref(30);
const selectedMonth = ref("");
const selectedYear = ref(new Date().getFullYear());
const profitabilityFilter = ref("bottom5");

const rankOptions = [
  { label: "Slowest payers", value: "bottom5" },
  { label: "Biggest clients", value: "top5" },
];

const forecastOptions = [
  { label: "Next 30 days", value: 30 },
  { label: "Next 60 days", value: 60 },
  { label: "Next 90 days", value: 90 },
  { label: "All time", value: "all" },
];

/* ── data ──────────────────────────────────────────────────────────────── */
const fetchCoreData = async (params = {}) => {
  try {
    await dashboardStore.fetchCoreData(params);
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || "Could not load your dashboard.",
      type: "error",
    };
  }
};

const fetchForecastData = async () => {
  try {
    const params = {};
    if (selectedMonth.value) {
      params.month = selectedMonth.value;
      params.year = selectedYear.value;
    } else {
      params.range = forecastRange.value;
    }
    await dashboardStore.fetchForecastData(params);
  } catch (err) {
    toast.value = {
      message:
        err.response?.data?.message || "Could not load the cashflow chart.",
      type: "error",
    };
  }
};

const copyReferralCode = () => {
  const code = referralStore.stats?.referralCode;
  if (!code) return;
  navigator.clipboard.writeText(code);
  toast.value = { message: "Referral code copied.", type: "success" };
};

watch([forecastRange, selectedMonth, selectedYear], () => fetchForecastData());
watch(profitabilityFilter, (v) => fetchCoreData({ rank: v }));

onMounted(() => {
  setGreeting();
  fetchCoreData({ rank: profitabilityFilter.value });
  fetchUsage();
  fetchForecastData();
  /* Its own request, not part of /core. Quotations are not receivables and the
     spec is emphatic that they must never appear in those totals — keeping the
     two on separate endpoints is what stops a future refactor folding one into
     the other. See the store comment. */
  dashboardStore.fetchQuotes();
  referralStore.fetchStats();

  if (route.query.welcome === "true") {
    uiStore.toggleWelcomeModal(true);
    /* Brand colours only. The old call fired emerald, blue and indigo — two of
       which are not in this product's palette. */
    confetti({
      particleCount: 140,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#059669", "#72c49f", "#c05621"],
    });
    const q = { ...route.query };
    delete q.welcome;
    router.replace({ query: q });
  }
});

/* ── derived ───────────────────────────────────────────────────────────── */
const currency = computed(() => dashboardStore.stats?.currency || "MYR");

/* `money` is imported from ~/utils/invoice, not defined here.
   The local copy that used to live on this line formatted the number without
   converting it, so every figure on the dashboard — outstanding, revenue, each
   invoice, each client total — was shown a hundred times too large: RM300 owed
   read as "30,000". It shadowed the correct import silently, which is why it
   survived. Everything from the API is SEN; `money` is the boundary. */

const firstName = computed(() => {
  const n = authStore.user?.name || authStore.user?.profile?.name || "";
  return n.trim().split(/\s+/)[0] || "";
});

/* Time-of-day and the signed-in name are both client-only facts: the server
   renders in its own timezone with no session, so computing this during SSR
   produced a hydration mismatch. Resolved after mount instead — "Dashboard" is
   the stable server-rendered value. */
const greeting = ref("Dashboard");
const setGreeting = () => {
  const h = new Date().getHours();
  const part =
    h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  greeting.value = firstName.value ? `${part}, ${firstName.value}` : part;
};
watch(firstName, setGreeting);

const daysLate = (inv) => {
  if (!inv?.dueDate) return 0;
  const diff = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000);
  return diff > 0 ? diff : 0;
};

const isUnpaid = (inv) => ["Pending", "Overdue"].includes(inv?.status);
const isLate = (inv) => isUnpaid(inv) && daysLate(inv) > 0;

/* Is this invoice's client actually being chased? The question this product
   exists to answer, and nothing on the old dashboard surfaced it. */
const isChased = (inv) =>
  !!(inv?.client?.autoChaser || inv?.client?.autoEmailChaser);

const lateInvoices = computed(() =>
  (dashboardStore.recentInvoices || [])
    .filter(isLate)
    .sort((a, b) => daysLate(b) - daysLate(a))
);
const lateUnattended = computed(() =>
  lateInvoices.value.filter((i) => !isChased(i))
);
const lateHandled = computed(() => lateInvoices.value.filter(isChased));

const statusChip = (inv) => {
  if (inv.status === "Paid") return { cls: "chip--paid", label: "Paid" };
  if (isLate(inv)) return { cls: "chip--late", label: `${daysLate(inv)}d late` };
  return { cls: "chip--idle", label: inv.status || "Draft" };
};

const rankedClients = computed(() => [...(dashboardStore.topClients || [])]);

/* The chart is the sen boundary for the cashflow endpoint.
   UiChart is a generic plotter: it draws whatever numbers it is handed and
   labels its own axis, so it cannot know the unit. Handing it sen put the y
   axis and every tooltip out by a factor of a hundred. Converted here, once,
   rather than teaching a chart component about currency. */
const chartData = computed(() => {
  const history = dashboardStore.cashflow?.history || [];
  const forecast = dashboardStore.cashflow?.forecast || [];
  return [...history, ...forecast]
    .map((i) => ({
      date: i.date,
      amount: fromSen(i.amount),
      details: (Array.isArray(i.details) ? i.details : []).map((d) => ({
        ...d,
        amount: fromSen(d.amount),
      })),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
});

/* Chased-invoice usage (spec 01). Fetched separately from the dashboard payload
   because it is period-scoped and the dashboard's own figures are not. */
const usage = ref(null);
const downgradeDismissed = ref(false);
const fetchUsage = async () => {
  try {
    const { data } = await $api.get("/usage");
    usage.value = data;
  } catch {
    usage.value = null;
  }
};

/* Usage meters. Defensive: the plan record's field names vary.

   Chased invoices leads, because it is the only metered unit — invoice
   creation, email and AI cost nothing to serve and are unlimited on paid plans.
   Showing a full "Invoices 3/100" bar next to it would put the reader's eye on
   the number that never runs out. */
const meters = computed(() => {
  const u = dashboardStore.quotaUsage || {};
  const l = dashboardStore.usageLimits || {};
  const c = usage.value;
  return [
    ...(c
      ? [
          {
            label: "Chased invoices",
            used: c.chasedInvoicesUsed,
            limit: c.chasedInvoicesAllowance + c.topUpRemaining + c.trialRemaining,
          },
        ]
      : []),
    { label: "Invoices", used: u.invoicesUsed, limit: l.invoices },
    { label: "Email", used: u.emailSendsUsed, limit: l.emailSends },
    { label: "AI drafts", used: u.aiUsed, limit: l.ai ?? l.aiCredits },
  ].map((r) => {
    const used = Number(r.used) || 0;
    const limit = Number(r.limit) || 0;
    const unlimited = limit >= 999999;
    const pct = limit > 0 && !unlimited ? Math.min(100, (used / limit) * 100) : 0;
    return { ...r, used, limit, unlimited, pct, full: pct >= 100 };
  });
});
</script>

<template>
  <div class="desk">
    <!-- ── Head ─────────────────────────────────────────────────────────── -->
    <header class="desk__head">
      <div>
        <h1 class="desk__title">{{ greeting }}</h1>
        <p class="desk__sub">
          Here is what you are owed, and what is chasing itself.
        </p>
      </div>
      <div class="desk__actions">
        <button
          type="button"
          class="desk-btn desk-btn--icon"
          aria-label="How this page works"
          @click="uiStore.openModuleHelp('dashboard')">
          <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
        </button>
        <NuxtLink
          v-if="systemStore.isInvoiceCreationEnabled"
          to="/invoices/create"
          class="desk-btn desk-btn--primary">
          New invoice
        </NuxtLink>
        <button v-else disabled class="desk-btn desk-btn--ghost">
          New invoice
        </button>
      </div>
    </header>

    <!-- ── Broadcast notice ─────────────────────────────────────────────────
         Set by an admin under System Management. The admin panel has always
         shown a preview headed "What they will see" — but nothing rendered it
         here, so what they saw was nothing. Same .banner and same icon as that
         preview, so the two cannot drift apart again.

         Above the money line on purpose: the admin copy says it "sits above the
         thing people came to do", and a notice about payments being paused is
         worth reading before the figures it might explain. -->
    <div v-if="systemStore.globalNotice" class="banner" role="status">
      <UiIcon icon="heroicons:megaphone" custom-class="w-5 h-5" />
      <span>{{ systemStore.globalNotice }}</span>
    </div>

    <!-- ── WhatsApp allowance spent ─────────────────────────────────────────
         Reminders are still going out, by email. Says so plainly, because the
         alternative reading — that chasing has stopped — is the one that makes
         someone switch the chaser off entirely. -->
    <div
      v-if="usage && usage.downgrades > 0 && !downgradeDismissed"
      class="banner banner--warn"
      role="status">
      <UiIcon icon="heroicons:exclamation-triangle" custom-class="w-5 h-5" />
      <span>
        Your WhatsApp allowance is used up. Reminders are still going out — by
        email — until it resets{{ usage.daysUntilReset ? ` in ${usage.daysUntilReset} days` : "" }}.
      </span>
      <NuxtLink to="/settings?tab=billing" class="desk-btn desk-btn--ghost desk-btn--sm">
        Top up
      </NuxtLink>
      <button
        type="button"
        class="iact"
        aria-label="Dismiss"
        @click="downgradeDismissed = true">
        <UiIcon icon="heroicons:x-mark" custom-class="w-4 h-4" />
      </button>
    </div>

    <!-- ── The money line ───────────────────────────────────────────────── -->
    <section class="money" aria-label="Money summary">
      <div class="money__lead">
        <div>
          <p class="desk__eyebrow">Outstanding</p>
          <p class="money__value">
            <span class="money__cur">{{ currency }}</span>
            {{ money(dashboardStore.stats?.outstandingAmount) }}
          </p>
          <p class="money__note">
            Billed and not yet paid, converted to your default currency.
          </p>
        </div>

        <!-- The state of the chase, not just a count. -->
        <NuxtLink
          v-if="lateUnattended.length"
          to="/clients"
          class="banner banner--late">
          <UiIcon
            icon="heroicons:exclamation-triangle-solid"
            custom-class="w-5 h-5" />
          <span>
            {{ lateUnattended.length }} late
            {{ lateUnattended.length === 1 ? "invoice is" : "invoices are" }}
            not being chased
          </span>
          <span class="banner__more">Turn on chasing &rarr;</span>
        </NuxtLink>
        <div v-else-if="lateHandled.length" class="banner">
          <UiIcon
            icon="heroicons:arrow-path-rounded-square-solid"
            custom-class="w-5 h-5" />
          <span>
            {{ lateHandled.length }} late
            {{ lateHandled.length === 1 ? "invoice is" : "invoices are" }}
            being chased for you
          </span>
        </div>
        <div v-else class="banner">
          <UiIcon icon="heroicons:check-circle-solid" custom-class="w-5 h-5" />
          <span>Nothing is overdue.</span>
        </div>
      </div>

      <div class="money__side">
        <div
          class="stat"
          :class="{ 'stat--late': dashboardStore.stats?.overdueCount > 0 }">
          <p class="desk__eyebrow">Overdue</p>
          <p class="stat__value">{{ dashboardStore.stats?.overdueCount || 0 }}</p>
        </div>
        <div class="stat">
          <p class="desk__eyebrow">Collected</p>
          <p class="stat__value">
            {{ currency }} {{ money(dashboardStore.stats?.totalRevenue) }}
          </p>
        </div>
      </div>
    </section>

    <!-- ── Needs you ────────────────────────────────────────────────────── -->
    <section class="card" aria-labelledby="needs-you">
      <div class="card__head">
        <h2 id="needs-you" class="card__title">Needs you</h2>
        <NuxtLink to="/invoices" class="card__link">All invoices &rarr;</NuxtLink>
      </div>

      <ul v-if="lateUnattended.length" class="work">
        <li v-for="inv in lateUnattended" :key="inv.id">
          <NuxtLink :to="`/invoices/edit/${inv.id}`" class="work__row">
            <span class="work__client">{{
              inv.client?.name || "Unknown client"
            }}</span>
            <span class="work__meta">
              {{ inv.invoiceNumber }} · {{ daysLate(inv) }} days late · chasing off
            </span>
            <span class="work__amount">
              {{ inv.currency || currency }} {{ money(inv.amount) }}
            </span>
          </NuxtLink>
        </li>
      </ul>

      <div v-else-if="lateHandled.length" class="empty">
        <p class="empty__title">Nothing needs you right now.</p>
        <p class="empty__body">
          {{ lateHandled.length }} late
          {{ lateHandled.length === 1 ? "invoice is" : "invoices are" }}
          already being chased on the schedule you set. You will only hear from
          us if something changes.
        </p>
      </div>

      <div v-else class="empty">
        <p class="empty__title">Nothing is late.</p>
        <p class="empty__body">
          When an invoice passes its due date it shows up here — and if chasing
          is switched on for that client, it is handled without you.
        </p>
        <NuxtLink to="/invoices/create" class="desk-btn desk-btn--ghost">
          Create an invoice
        </NuxtLink>
      </div>
    </section>

    <!-- ── Quotations ───────────────────────────────────────────────────────
         Deliberately BELOW the money line and visually separate from it. A
         quotation is not money owed: nobody has agreed to anything, and the
         spec is explicit that these figures must never appear in receivables
         or overdue totals. They are fetched from their own endpoint into their
         own state precisely so they cannot be summed with the row above by
         accident. The words matter as much as the placement — "waiting on a
         reply", never "outstanding".

         The second panel is the one worth the space. Accepted and not yet
         invoiced is work already won that nobody has been asked to pay for,
         which is the most valuable thing this page can point at.
    -->
    <section
      v-if="dashboardStore.quotes.waiting.length || dashboardStore.quotes.won.length"
      class="grid2"
      aria-label="Quotations">
      <div class="card" aria-labelledby="quotes-won">
        <div class="card__head">
          <div>
            <h2 id="quotes-won" class="card__title">Won, not yet billed</h2>
            <p class="money__note">
              <template v-if="dashboardStore.quotes.wonCount">
                {{ dashboardStore.quotes.currency }}
                {{ money(dashboardStore.quotes.wonValue) }} of accepted work
                nobody has been invoiced for.
              </template>
              <template v-else>
                Accepted work nobody has been invoiced for.
              </template>
            </p>
          </div>
          <NuxtLink to="/quotes" class="card__link">All &rarr;</NuxtLink>
        </div>

        <ul v-if="dashboardStore.quotes.won.length" class="work">
          <li v-for="q in dashboardStore.quotes.won" :key="q.id">
            <NuxtLink :to="`/quotes/edit/${q.id}`" class="work__row">
              <span class="work__client">{{
                q.client?.name || "Unknown client"
              }}</span>
              <span class="work__meta">
                {{ q.invoiceNumber }}
                <span class="chip chip--paid">
                  <i class="chip__dot" aria-hidden="true"></i>Accepted
                </span>
                <template v-if="q.ageDays">
                  · {{ q.ageDays }} {{ q.ageDays === 1 ? "day" : "days" }} ago
                </template>
              </span>
              <span class="work__amount">
                {{ q.currency || dashboardStore.quotes.currency }}
                {{ money(q.amount) }}
              </span>
            </NuxtLink>
          </li>
        </ul>

        <div v-else class="empty">
          <p class="empty__title">Nothing waiting to be billed.</p>
          <p class="empty__body">
            Every quotation your clients have accepted has an invoice against
            it.
          </p>
        </div>

        <!-- Never let a capped list read as the whole set. -->
        <p
          v-if="dashboardStore.quotes.wonCount > dashboardStore.quotes.won.length"
          class="money__note">
          Showing {{ dashboardStore.quotes.won.length }} of
          {{ dashboardStore.quotes.wonCount }}.
        </p>
      </div>

      <div class="card" aria-labelledby="quotes-open">
        <div class="card__head">
          <div>
            <h2 id="quotes-open" class="card__title">Out for decision</h2>
            <p class="money__note">
              <template v-if="dashboardStore.quotes.waitingCount">
                {{ dashboardStore.quotes.currency }}
                {{ money(dashboardStore.quotes.waitingValue) }} sent and
                unanswered. Nothing chases these.
              </template>
              <template v-else>
                Sent, and nobody has answered. Nothing chases these.
              </template>
            </p>
          </div>
          <NuxtLink to="/quotes" class="card__link">All &rarr;</NuxtLink>
        </div>

        <ul v-if="dashboardStore.quotes.waiting.length" class="work">
          <li v-for="q in dashboardStore.quotes.waiting" :key="q.id">
            <NuxtLink :to="`/quotes/edit/${q.id}`" class="work__row">
              <span class="work__client">{{
                q.client?.name || "Unknown client"
              }}</span>
              <span class="work__meta">
                {{ q.invoiceNumber }}
                <span
                  class="chip"
                  :class="q.status === 'Viewed' ? 'chip--warn' : 'chip--idle'">
                  <i class="chip__dot" aria-hidden="true"></i
                  >{{ q.status === "Viewed" ? "Opened" : "Sent" }}
                </span>
                <template v-if="q.ageDays">
                  · waiting {{ q.ageDays }}
                  {{ q.ageDays === 1 ? "day" : "days" }}
                </template>
              </span>
              <span class="work__amount">
                {{ q.currency || dashboardStore.quotes.currency }}
                {{ money(q.amount) }}
              </span>
            </NuxtLink>
          </li>
        </ul>

        <div v-else class="empty">
          <p class="empty__title">Nothing out for decision.</p>
          <p class="empty__body">
            Quotations you have sent appear here until your client answers.
          </p>
        </div>

        <p
          v-if="dashboardStore.quotes.waitingCount > dashboardStore.quotes.waiting.length"
          class="money__note">
          Showing {{ dashboardStore.quotes.waiting.length }} of
          {{ dashboardStore.quotes.waitingCount }}.
        </p>
      </div>
    </section>

    <!-- ── Recent + clients ─────────────────────────────────────────────── -->
    <div class="grid2">
      <section class="card" aria-labelledby="recent">
        <div class="card__head">
          <h2 id="recent" class="card__title">Recent invoices</h2>
          <NuxtLink to="/invoices" class="card__link">All &rarr;</NuxtLink>
        </div>

        <ul v-if="dashboardStore.recentInvoices?.length" class="work">
          <li v-for="inv in dashboardStore.recentInvoices" :key="inv.id">
            <NuxtLink :to="`/invoices/edit/${inv.id}`" class="work__row">
              <span class="work__client">{{
                inv.client?.name || "Unknown client"
              }}</span>
              <span class="work__meta">
                {{ inv.invoiceNumber }}
                <span class="chip" :class="statusChip(inv).cls">
                  <i class="chip__dot" aria-hidden="true"></i
                  >{{ statusChip(inv).label }}
                </span>
              </span>
              <span class="work__amount">
                {{ inv.currency || currency }} {{ money(inv.amount) }}
              </span>
            </NuxtLink>
          </li>
        </ul>

        <div v-else class="empty">
          <p class="empty__title">No invoices yet.</p>
          <p class="empty__body">
            Your five most recent invoices appear here once you send one.
          </p>
          <NuxtLink to="/invoices/create" class="desk-btn desk-btn--ghost">
            Send your first invoice
          </NuxtLink>
        </div>
      </section>

      <section class="card" aria-labelledby="clients">
        <div class="card__head">
          <h2 id="clients" class="card__title">Your clients</h2>
          <UiSelect
            v-model="profitabilityFilter"
            :options="rankOptions"
            class="w-40" />
        </div>

        <table v-if="rankedClients.length" class="tbl">
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col" class="num">Pays in</th>
              <th scope="col" class="num">Billed</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in rankedClients" :key="c.id">
              <td>{{ c.name }}</td>
              <td class="num">
                <span
                  class="chip"
                  :class="
                    (c.averageDelayDays || 0) > 7 ? 'chip--late' : 'chip--idle'
                  ">
                  {{ Math.round(c.averageDelayDays || 0) }}d
                </span>
              </td>
              <td class="num">{{ currency }} {{ money(c.totalRevenue) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty">
          <p class="empty__title">No client history yet.</p>
          <p class="empty__body">
            Once invoices start getting paid, this ranks your clients by how long
            they actually take — worth knowing before you take the next job.
          </p>
        </div>
      </section>
    </div>

    <!-- ── Cashflow ─────────────────────────────────────────────────────── -->
    <section class="card" aria-labelledby="cashflow">
      <div class="card__head">
        <div>
          <h2 id="cashflow" class="card__title">Expected cashflow</h2>
          <p class="money__note">
            What is due to land, based on unpaid invoice dates.
          </p>
        </div>
        <UiSelect
          v-model="forecastRange"
          :options="forecastOptions"
          class="w-44" />
      </div>

      <div :class="chartData.length ? 'chart' : 'chart--empty'">
        <UiChart
          v-if="chartData.length"
          :data="chartData"
          index="date"
          :categories="['amount']" />
        <div v-else class="empty">
          <p class="empty__title">Nothing due in this range.</p>
          <p class="empty__body">
            Try a wider range, or send an invoice with a due date and it will
            appear here.
          </p>
        </div>
      </div>
    </section>

    <!-- ── AI insights ──────────────────────────────────────────────────── -->
    <section
      v-if="dashboardStore.insights?.length"
      class="card"
      aria-labelledby="insights">
      <div class="card__head">
        <h2 id="insights" class="card__title">What we noticed</h2>
      </div>
      <ul class="work">
        <li
          v-for="(ins, i) in dashboardStore.insights"
          :key="i"
          class="work__row">
          <span class="work__client">{{ ins.title }}</span>
          <span class="work__meta">{{ ins.description }}</span>
        </li>
      </ul>
    </section>

    <!-- ── Account admin, deliberately last ─────────────────────────────── -->
    <section class="usage" aria-labelledby="usage">
      <div class="card__head" style="margin-bottom: 0">
        <div>
          <h2 id="usage" class="card__title">This month's allowance</h2>
          <p v-if="usage" class="money__note">
            Resets in {{ usage.daysUntilReset }}
            {{ usage.daysUntilReset === 1 ? "day" : "days" }}.
            <template v-if="usage.topUpRemaining">
              {{ usage.topUpRemaining }} from top-ups still available.
            </template>
            <template v-else-if="usage.trialRemaining">
              {{ usage.trialRemaining }} free trial
              {{ usage.trialRemaining === 1 ? "chase" : "chases" }} left.
            </template>
          </p>
        </div>
        <NuxtLink to="/settings?tab=billing" class="card__link">
          Top up &rarr;
        </NuxtLink>
      </div>
      <div class="usage__grid">
        <div v-for="m in meters" :key="m.label">
          <div class="meter__top">
            <span class="meter__label">{{ m.label }}</span>
            <span class="meter__val">
              {{ m.unlimited ? "Unlimited" : `${m.used} / ${m.limit}` }}
            </span>
          </div>
          <div
            class="meter__track"
            role="progressbar"
            :aria-valuenow="Math.round(m.pct)"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`${m.label} allowance used`">
            <div
              class="meter__fill"
              :class="{ 'meter__fill--full': m.full }"
              :style="{ width: m.unlimited ? '100%' : m.pct + '%' }"></div>
          </div>
        </div>
      </div>
    </section>

    <UiToast v-model="toast" />
  </div>
</template>
