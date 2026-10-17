<script setup>
/**
 * Admin → Plans & analytics.
 *
 * Five metrics and the plan table.
 *
 * The metric row was five cards each with its own coloured icon tile and its own
 * coloured corner pill — emerald, blue, purple, amber, indigo — three of those
 * hues from outside the palette entirely. Five equally loud boxes do not rank,
 * and ranking is the only reason to put numbers in a row. One surface now; the
 * figures carry it, in the ledger face like every other figure in the product.
 *
 * The month/year pickers were bare <select> elements styled with `border-none`
 * and `text-[9px]` — 9px, which is below anything else in the app and not a step
 * on the scale.
 */
import { computed } from "vue";
import { price } from "~/utils/invoice";

const props = defineProps({
  analytics: { type: Object, default: null },
  plans: { type: Array, default: () => [] },
  month: { type: [Number, String], default: 1 },
  year: { type: [Number, String], default: 2026 },
  monthlyRevenue: { type: Number, default: 0 },
  loadingMonthly: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:month",
  "update:year",
  "create-plan",
  "edit-plan",
  "delete-plan",
]);

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const monthOptions = MONTHS.map((m, i) => ({ value: i + 1, label: m }));

const yearOptions = computed(() => {
  const now = new Date().getFullYear();
  const out = [];
  for (let y = now; y >= 2024; y--) out.push({ value: y, label: String(y) });
  return out;
});

/* `n` counts things — invoices, sends, credits. It must NOT touch money.
   `price` is the sen boundary, and the two are deliberately separate: the price
   column used to go through `n` and read "MYR 2,900/month" for a RM29 plan. */
const n = (v) => Number(v || 0).toLocaleString();
const summary = computed(() => props.analytics?.summary || null);

/** 999999 is the store's stand-in for "no limit". */
const cap = (v) => (Number(v) >= 999999 ? "∞" : n(v));

/* The delete button was hidden with `disabled:opacity-0` for four hard-coded
   plan names — an invisible button that still occupied its space and still took
   the click target. Locked plans say why instead. */
const LOCKED = ["FREE", "PRO", "MAX", "STARTER PACK"];
const isLocked = (plan) => LOCKED.includes(String(plan?.name ?? "").toUpperCase());
</script>

<template>
  <div>
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Where the business is</h2>
      </div>

      <div v-if="!summary" class="empty empty--pad">
        <p class="empty__title">Analytics are not loading.</p>
        <p class="empty__body">Refresh the page, or check the analytics endpoint.</p>
      </div>

      <div v-else class="metrics">
        <div class="metric">
          <p class="desk__eyebrow">Revenue, lifetime</p>
          <p class="metric__v">MYR {{ price(summary.revenue?.lifetime) }}</p>
          <p class="metric__n">Everything ever collected</p>
        </div>

        <div class="metric">
          <p class="desk__eyebrow">Users</p>
          <p class="metric__v">{{ n(summary.users?.total) }}</p>
          <p class="metric__n">
            <span
              class="metric__delta"
              :class="
                Number(summary.users?.growth) >= 0
                  ? 'metric__delta--up'
                  : 'metric__delta--down'
              ">
              <UiIcon
                :icon="
                  Number(summary.users?.growth) >= 0
                    ? 'heroicons:arrow-trending-up'
                    : 'heroicons:arrow-trending-down'
                "
                custom-class="w-3 h-3" />
              {{ Math.abs(Number(summary.users?.growth) || 0) }}%
            </span>
            on last month
          </p>
        </div>

        <div class="metric">
          <p class="desk__eyebrow">Revenue, one month</p>
          <p class="metric__v" :class="{ skel: loadingMonthly }">
            MYR {{ n(monthlyRevenue) }}
          </p>
          <div class="bar" style="gap: var(--space-2); margin-top: var(--space-2)">
            <UiSelect
              :model-value="month"
              :options="monthOptions"
              @update:model-value="emit('update:month', $event)" />
            <UiSelect
              :model-value="year"
              :options="yearOptions"
              @update:model-value="emit('update:year', $event)" />
          </div>
        </div>

        <div class="metric">
          <p class="desk__eyebrow">Transactions</p>
          <p class="metric__v">{{ n(summary.totalTransactions) }}</p>
          <p class="metric__n">Payment attempts on record</p>
        </div>

        <div class="metric">
          <p class="desk__eyebrow">Who is on what</p>
          <p class="metric__v">
            {{ n(analytics?.web?.planDistribution?.length || 0) }}
          </p>
          <p class="metric__n">
            <template v-for="(d, i) in analytics?.web?.planDistribution" :key="d.plan">
              <template v-if="i">· </template>{{ d.plan }} {{ d.count }}
            </template>
            <template v-if="!analytics?.web?.planDistribution?.length">
              No breakdown available
            </template>
          </p>
        </div>
      </div>
    </section>

    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Plans</h2>
        <p class="sec__note">
          What users can buy. Changing a price here changes what new subscribers
          pay; people already on a plan keep the terms they signed up on.
        </p>
      </div>

      <div class="bar">
        <span class="bar__grow bar__count">
          {{ plans.length }} {{ plans.length === 1 ? "plan" : "plans" }}
        </span>
        <button
          type="button"
          class="desk-btn desk-btn--primary desk-btn--sm"
          @click="emit('create-plan')">
          New plan
        </button>
      </div>
    </section>

    <div class="ledger">
      <div class="ledger__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Plan</th>
              <th scope="col" class="num">Price</th>
              <th scope="col" class="num">Invoices</th>
              <th scope="col" class="num">AI credits</th>
              <th scope="col">Status</th>
              <th scope="col" class="acts">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody v-if="!plans.length">
            <tr>
              <td colspan="6">
                <div class="empty empty--pad">
                  <p class="empty__title">No plans yet.</p>
                  <p class="empty__body">
                    Without at least one plan the billing page has nothing to
                    show and nobody can subscribe.
                  </p>
                  <button
                    type="button"
                    class="desk-btn desk-btn--primary"
                    @click="emit('create-plan')">
                    Create the first plan
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="p in plans" :key="p.id">
              <td>
                <div class="cel">
                  <span class="cel__main">{{ p.name }}</span>
                  <span class="cel__sub">{{ p.description || "No description" }}</span>
                </div>
              </td>
              <td class="num">{{ p.currency }} {{ price(p.price) }}/{{ p.interval }}</td>
              <td class="num">{{ cap(p.invoices) }}</td>
              <td class="num">{{ cap(p.aiCredits) }}</td>
              <td>
                <span class="chip" :class="p.isActive ? 'chip--paid' : 'chip--idle'">
                  <i class="chip__dot" aria-hidden="true"></i>
                  {{ p.isActive ? "On sale" : "Hidden" }}
                </span>
              </td>
              <td class="acts">
                <div class="cel cel--row" style="justify-content: flex-end">
                  <button
                    type="button"
                    class="iact"
                    :aria-label="`Edit ${p.name}`"
                    title="Edit"
                    @click="emit('edit-plan', p)">
                    <UiIcon icon="heroicons:pencil-square" custom-class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="iact iact--danger"
                    :aria-label="`Delete ${p.name}`"
                    :disabled="isLocked(p)"
                    :title="
                      isLocked(p)
                        ? 'Built-in plans cannot be deleted'
                        : `Delete ${p.name}`
                    "
                    @click="emit('delete-plan', p)">
                    <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
