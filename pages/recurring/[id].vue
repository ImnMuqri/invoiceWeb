<script setup>
/**
 * ONE SCHEDULE, and everything it has issued.
 *
 * The instance list is the point of this page: a schedule is only trustworthy
 * if you can see what it actually did.
 */
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRecurringStore } from "~/stores/recurringStore";
import { formatDate } from "~/utils/date";
import { currencySymbol, money } from "~/utils/invoice";

const route = useRoute();
const router = useRouter();
const store = useRecurringStore();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const schedule = ref(null);
const loading = ref(true);
const busy = ref(false);

const load = async () => {
  try {
    schedule.value = await store.fetchSchedule(route.params.id);
  } catch {
    notify("That schedule could not be opened.", "error");
    router.push("/recurring");
  } finally {
    loading.value = false;
  }
};
onMounted(load);

const CADENCE = { WEEKLY: "week", MONTHLY: "month", QUARTERLY: "quarter", YEARLY: "year" };
const cadenceOf = (s) =>
  s.interval > 1
    ? `Every ${s.interval} ${CADENCE[s.frequency]}s`
    : `Every ${CADENCE[s.frequency]}`;

const cur = computed(() => currencySymbol(schedule.value?.currency || "MYR"));
const total = computed(() => {
  const s = schedule.value;
  if (!s) return 0;
  const sub = s.items.reduce((n, i) => n + i.price * i.quantity, 0);
  return sub * (1 + (s.taxRate || 0) / 100);
});

const chip = (inv) => {
  if (inv.status === "Paid") return { cls: "chip--paid", label: "Paid" };
  if (inv.status === "Draft") return { cls: "chip--idle", label: "Draft" };
  if (inv.amountPaid > 0) return { cls: "chip--paid", label: "Part paid" };
  if (inv.dueDate && new Date(inv.dueDate) < new Date())
    return { cls: "chip--late", label: "Overdue" };
  return { cls: "chip--idle", label: inv.status || "Sent" };
};

const act = async (action, done) => {
  busy.value = true;
  try {
    await store.act(schedule.value.id, action);
    await load();
    notify(done);
  } catch (err) {
    notify(err.response?.data?.message || "Could not do that.", "error");
  } finally {
    busy.value = false;
  }
};
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">
          <template v-if="schedule">
            {{ schedule.client?.name }}
          </template>
          <i v-else-if="loading" class="sk" style="width: 10rem"></i>
        </h1>
        <p class="desk__sub">
          <i v-if="loading" class="sk" style="width: 18rem"></i>
          <template v-else-if="schedule">
            {{ cadenceOf(schedule) }} · {{ cur }} {{ money(total) }} ·
            {{ schedule.occurrences }}
            {{ schedule.occurrences === 1 ? "invoice" : "invoices" }} issued
          </template>
        </p>
      </div>
      <div class="desk__actions">
        <NuxtLink to="/recurring" class="desk-btn desk-btn--ghost">Back</NuxtLink>
        <NuxtLink
          v-if="schedule && schedule.status !== 'ENDED'"
          :to="`/recurring/edit/${schedule.id}`"
          class="desk-btn desk-btn--ghost">
          Edit
        </NuxtLink>
        <button
          v-if="schedule?.status === 'ACTIVE'"
          type="button"
          class="desk-btn desk-btn--ghost"
          :disabled="busy"
          @click="act('pause', 'Paused. Outstanding invoices are still chased.')">
          Pause
        </button>
        <button
          v-else-if="schedule?.status === 'PAUSED'"
          type="button"
          class="desk-btn desk-btn--primary"
          :disabled="busy"
          @click="act('resume', 'Resumed.')">
          Resume
        </button>
      </div>
    </header>

    <div v-if="schedule?.statusReason" class="banner banner--warn">
      <UiIcon icon="heroicons:exclamation-triangle" custom-class="w-5 h-5" />
      <span>{{ schedule.statusReason }}</span>
    </div>

    <div
      v-else-if="schedule?.mode === 'REVIEW'"
      class="banner">
      <UiIcon icon="heroicons:eye" custom-class="w-5 h-5" />
      <span>
        Invoices from this schedule are drafted for your approval. Nothing
        reaches your client until you send it.
      </span>
      <button
        type="button"
        class="desk-btn desk-btn--ghost desk-btn--sm"
        :disabled="busy"
        @click="act('auto', 'This schedule now sends without asking.')">
        Send automatically
      </button>
    </div>

    <div class="grid2">
      <section class="card">
        <div class="card__head"><h2 class="card__title">The agreement</h2></div>
        <div v-if="schedule" class="notes">
          <div v-for="i in schedule.items" :key="i.id" class="note note--flat">
            <span></span>
            <span>
              <span class="note__title" style="white-space: normal">{{ i.name }}</span>
              <span class="note__body">
                {{ i.quantity }} × {{ cur }} {{ money(i.price) }}
              </span>
            </span>
            <span class="note__when">{{ cur }} {{ money(i.price * i.quantity) }}</span>
          </div>
        </div>
        <p v-if="schedule" class="f__hint" style="margin-top: var(--space-3)">
          Issued {{ cadenceOf(schedule).toLowerCase() }}, due
          {{ schedule.paymentTermsDays }} days after each issue.
          <template v-if="schedule.nextIssueAt">
            Next on <b>{{ formatDate(schedule.nextIssueAt) }}</b>.
          </template>
          <template v-else>No further invoices are scheduled.</template>
        </p>
      </section>

      <section class="card">
        <div class="card__head">
          <h2 class="card__title">What it has issued</h2>
        </div>
        <div v-if="schedule && !schedule.invoices.length" class="empty">
          <p class="empty__title">Nothing yet</p>
          <p class="empty__body">
            The first invoice appears here once the start date arrives.
          </p>
        </div>
        <div v-else-if="schedule" class="notes">
          <NuxtLink
            v-for="inv in schedule.invoices"
            :key="inv.id"
            :to="`/invoices/edit/${inv.id}`"
            class="note note--flat"
            style="text-decoration: none">
            <span></span>
            <span>
              <span class="note__top">
                <span class="note__title">{{ inv.invoiceNumber }}</span>
                <span class="note__when">{{ formatDate(inv.date) }}</span>
              </span>
              <span class="note__body">
                {{ currencySymbol(inv.currency) }} {{ money(inv.amount) }}
              </span>
            </span>
            <span class="note__acts" style="opacity: 1">
              <span class="chip" :class="chip(inv).cls">
                <i class="chip__dot" aria-hidden="true"></i>
                {{ chip(inv).label }}
              </span>
            </span>
          </NuxtLink>
        </div>
      </section>
    </div>

    <UiToast v-model="toast" />
  </div>
</template>
