<script setup>
/**
 * RECURRING — the list.
 *
 * A schedule is not an invoice: it has no amount owed, no due date and no paid
 * status. So this list answers different questions from the invoice ledger —
 * who, how much, how often, and when the next one goes out.
 */
import { computed, onMounted, ref } from "vue";
import { useRecurringStore } from "~/stores/recurringStore";
import { useUiStore } from "~/stores/uiStore";
import { formatDate } from "~/utils/date";
import { currencySymbol, money } from "~/utils/invoice";

const store = useRecurringStore();
const uiStore = useUiStore();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const search = ref("");
const busy = ref(null);
const confirmCancel = ref(null);

onMounted(() => store.fetchSchedules());

const CADENCE = {
  WEEKLY: "week",
  MONTHLY: "month",
  QUARTERLY: "quarter",
  YEARLY: "year",
};

const cadenceOf = (s) => {
  const unit = CADENCE[s.frequency] || "period";
  return s.interval > 1 ? `Every ${s.interval} ${unit}s` : `Every ${unit}`;
};

const STATUS = {
  ACTIVE: { cls: "chip--paid", label: "Active" },
  PAUSED: { cls: "chip--idle", label: "Paused" },
  ENDED: { cls: "chip--idle", label: "Ended" },
  CANCELLED: { cls: "chip--idle", label: "Cancelled" },
};

const rows = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return store.schedules;
  return store.schedules.filter((s) =>
    [s.client?.name, s.client?.company, s.invoiceName, s.subject]
      .filter(Boolean)
      .some((f) => String(f).toLowerCase().includes(q)),
  );
});

const active = computed(() => store.schedules.filter((s) => s.status === "ACTIVE"));

/** What the active schedules bill in a month, normalised to a monthly figure. */
const monthlyValue = computed(() =>
  active.value.reduce((sum, s) => {
    const per = { WEEKLY: 52 / 12, MONTHLY: 1, QUARTERLY: 1 / 3, YEARLY: 1 / 12 }[
      s.frequency
    ] ?? 1;
    return sum + (Number(s.amount) || 0) * (per / (s.interval || 1));
  }, 0),
);

const act = async (s, action, done) => {
  busy.value = s.id;
  try {
    await store.act(s.id, action);
    notify(done);
  } catch (err) {
    notify(err.response?.data?.message || "Could not do that.", "error");
  } finally {
    busy.value = null;
  }
};

const doCancel = async () => {
  const s = confirmCancel.value;
  if (!s) return;
  await act(s, "cancel", "Schedule cancelled. Invoices already issued are unaffected.");
  confirmCancel.value = null;
};
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">Recurring</h1>
        <p class="desk__sub">
          Retainers and anything else you bill on a cycle. Set it once and the
          invoice goes out on its own.
        </p>
      </div>
      <div class="desk__actions">
        <button
          type="button"
          class="desk-btn desk-btn--icon"
          aria-label="How this page works"
          @click="uiStore.openModuleHelp('recurring')">
          <UiIcon icon="formkit:help" custom-class="w-5 h-5" />
        </button>
        <NuxtLink to="/recurring/create" class="desk-btn desk-btn--primary">
          New schedule
        </NuxtLink>
      </div>
    </header>

    <section v-if="store.schedules.length" class="strip" aria-label="Recurring summary">
      <div>
        <p class="desk__eyebrow">Active schedules</p>
        <p class="strip__v">{{ active.length }}</p>
        <p class="strip__n">Issuing without you</p>
      </div>
      <div>
        <p class="desk__eyebrow">Billed monthly</p>
        <p class="strip__v">
          {{ currencySymbol(active[0]?.currency || "MYR") }}
          {{ money(monthlyValue) }}
        </p>
        <p class="strip__n">Across every active schedule</p>
      </div>
      <div>
        <p class="desk__eyebrow">Next issue</p>
        <p class="strip__v strip__v--name">
          {{
            active.filter((s) => s.nextIssueAt).length
              ? formatDate(
                  active
                    .filter((s) => s.nextIssueAt)
                    .sort((a, b) => new Date(a.nextIssueAt) - new Date(b.nextIssueAt))[0]
                    .nextIssueAt,
                )
              : "—"
          }}
        </p>
        <p class="strip__n">The soonest one due</p>
      </div>
    </section>

    <div v-if="store.schedules.length" class="bar">
      <div class="search bar__grow">
        <label class="sr-only" for="rec-search">Search schedules</label>
        <span class="search__icon" aria-hidden="true">
          <UiIcon icon="heroicons:magnifying-glass" custom-class="w-4 h-4" />
        </span>
        <input
          id="rec-search"
          v-model="search"
          type="search"
          class="search__inp no-ik"
          placeholder="Client or what it is for" />
      </div>
    </div>

    <div class="ledger">
      <div class="ledger__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col">Cadence</th>
              <th scope="col" class="num">Amount</th>
              <th scope="col">Next issue</th>
              <th scope="col">Status</th>
              <th scope="col" class="acts"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>

          <tbody v-if="store.loading && !store.schedules.length">
            <tr v-for="i in 3" :key="i">
              <td v-for="j in 6" :key="j"><span class="skel" style="display: block"></span></td>
            </tr>
          </tbody>

          <tbody v-else-if="!rows.length">
            <tr>
              <td colspan="6">
                <div class="empty empty--pad">
                  <template v-if="search">
                    <p class="empty__title">Nothing matches “{{ search }}”</p>
                    <button
                      type="button"
                      class="desk-btn desk-btn--ghost desk-btn--sm"
                      @click="search = ''">
                      Clear the search
                    </button>
                  </template>
                  <template v-else>
                    <p class="empty__title">No recurring schedules yet</p>
                    <p class="empty__body">
                      If you bill someone the same amount every month, set it up
                      once here and stop remembering it. You can also turn an
                      invoice you have already sent into a schedule from its own
                      page.
                    </p>
                    <NuxtLink to="/recurring/create" class="desk-btn desk-btn--primary desk-btn--sm">
                      Set up your first one
                    </NuxtLink>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="s in rows" :key="s.id">
              <td>
                <NuxtLink :to="`/recurring/${s.id}`" class="cel cel__link">
                  <span class="cel__main">{{ s.client?.name || "Unknown client" }}</span>
                  <span class="cel__sub">
                    {{ s.invoiceName || s.subject || "Untitled" }}
                  </span>
                </NuxtLink>
              </td>
              <td><span class="cel__sub">{{ cadenceOf(s) }}</span></td>
              <td class="num">
                {{ currencySymbol(s.currency) }} {{ money(s.amount) }}
              </td>
              <td>
                <span class="cel__sub">
                  {{ s.nextIssueAt ? formatDate(s.nextIssueAt) : "—" }}
                </span>
              </td>
              <td>
                <div class="cel">
                  <span class="chip" :class="STATUS[s.status]?.cls">
                    <i class="chip__dot" aria-hidden="true"></i>
                    {{ STATUS[s.status]?.label || s.status }}
                  </span>
                  <span v-if="s.mode === 'REVIEW'" class="cel__sub">
                    Drafts for your approval
                  </span>
                  <span v-else-if="s.statusReason" class="cel__sub">
                    {{ s.statusReason }}
                  </span>
                </div>
              </td>
              <td class="acts">
                <div class="cel cel--row" style="justify-content: flex-end">
                  <button
                    v-if="s.status === 'ACTIVE'"
                    type="button"
                    class="desk-btn desk-btn--ghost desk-btn--sm"
                    :disabled="busy === s.id"
                    @click="act(s, 'pause', 'Paused. Outstanding invoices are still chased.')">
                    Pause
                  </button>
                  <button
                    v-else-if="s.status === 'PAUSED'"
                    type="button"
                    class="desk-btn desk-btn--ghost desk-btn--sm"
                    :disabled="busy === s.id"
                    @click="act(s, 'resume', 'Resumed.')">
                    Resume
                  </button>
                  <button
                    v-if="['ACTIVE', 'PAUSED'].includes(s.status)"
                    type="button"
                    class="iact iact--danger"
                    :aria-label="`Cancel the schedule for ${s.client?.name}`"
                    title="Cancel"
                    @click="confirmCancel = s">
                    <UiIcon icon="heroicons:x-mark" custom-class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UiModal
      :model-value="!!confirmCancel"
      max-width="sm"
      @update:model-value="confirmCancel = null">
      <div class="dlg">
        <h3 class="dlg__title">Cancel this schedule?</h3>
        <p class="dlg__body">
          No more invoices will be created for
          <b>{{ confirmCancel?.client?.name }}</b>. Invoices it has already
          issued are unaffected — they stay exactly as they are and carry on
          being chased.
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="confirmCancel = null">
            Keep it running
          </button>
          <button type="button" class="desk-btn desk-btn--danger" @click="doCancel">
            Cancel schedule
          </button>
        </div>
      </div>
    </UiModal>

    <UiToast v-model="toast" />
  </div>
</template>
