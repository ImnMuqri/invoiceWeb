<script setup>
/**
 * Admin → Transactions.
 *
 * Read-only history. The status map lived in the page's script as five Tailwind
 * class strings (`"bg-emerald-50 text-emerald-700 border-emerald-100"` and so
 * on) — colour decided in JavaScript, in a palette the rest of the app does not
 * use. It maps to chip modifiers now, so the same status reads the same here as
 * it does everywhere else.
 */
import { computed } from "vue";
import { formatDate } from "~/utils/date";

const props = defineProps({
  transactions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  search: { type: String, default: "" },
});

const emit = defineEmits(["update:search", "refresh"]);

const CHIP = {
  ACTIVE: "chip--paid",
  PENDING: "chip--idle",
  INACTIVE: "chip--idle",
  CANCELLED: "chip--late",
  CANCELED: "chip--late",
  FAILED: "chip--late",
};
const chipFor = (status) => CHIP[String(status || "").toUpperCase()] || "chip--idle";

const money = (n) => Number(n || 0).toLocaleString();

const collected = computed(() =>
  props.transactions
    .filter((t) => String(t.status || "").toUpperCase() === "ACTIVE")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
);
</script>

<template>
  <div>
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Transactions</h2>
        <p class="sec__note">
          {{ transactions.length }} shown · MYR {{ money(collected) }} of them
          active
        </p>
      </div>

      <div class="bar">
        <div class="search bar__grow">
          <label class="sr-only" for="tx-search">Search transactions</label>
          <span class="search__icon" aria-hidden="true">
            <UiIcon icon="heroicons:magnifying-glass" custom-class="w-4 h-4" />
          </span>
          <input
            id="tx-search"
            :value="search"
            type="search"
            class="search__inp no-ik"
            placeholder="Name, email, plan or status"
            @input="emit('update:search', $event.target.value)" />
        </div>
        <button
          type="button"
          class="desk-btn desk-btn--ghost desk-btn--sm"
          @click="emit('refresh')">
          <UiIcon
            icon="heroicons:arrow-path"
            :custom-class="loading ? 'w-4 h-4 spin' : 'w-4 h-4'" />
          Refresh
        </button>
      </div>
    </section>

    <div class="ledger">
      <div class="ledger__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Who</th>
              <th scope="col">Plan</th>
              <th scope="col" class="num">Amount</th>
              <th scope="col">Status</th>
              <th scope="col">When</th>
            </tr>
          </thead>

          <tbody v-if="loading && !transactions.length">
            <tr v-for="i in 5" :key="i">
              <td v-for="j in 5" :key="j">
                <span class="skel" style="display: block"></span>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="!transactions.length">
            <tr>
              <td colspan="5">
                <div class="empty empty--pad">
                  <p class="empty__title">
                    {{ search ? `Nothing matches “${search}”.` : "No transactions." }}
                  </p>
                  <p class="empty__body">
                    {{
                      search
                        ? "Search covers the name, email, plan and status."
                        : "Nothing has been charged yet."
                    }}
                  </p>
                  <button
                    v-if="search"
                    type="button"
                    class="desk-btn desk-btn--ghost"
                    @click="emit('update:search', '')">
                    Clear the search
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="tx in transactions" :key="tx.id">
              <td>
                <div class="cel">
                  <span class="cel__main">{{ tx.user?.name || "Unnamed" }}</span>
                  <span class="cel__sub">{{ tx.user?.email || "No email" }}</span>
                </div>
              </td>
              <td>
                <div class="cel">
                  <span class="cel__main">{{ tx.plan }}</span>
                  <span v-if="tx.xenditSubscriptionId" class="cel__sub">
                    ref {{ String(tx.xenditSubscriptionId).split("_").pop() }}
                  </span>
                </div>
              </td>
              <td class="num">{{ tx.currency }} {{ money(tx.amount) }}</td>
              <td>
                <span class="chip" :class="chipFor(tx.status)">
                  <i class="chip__dot" aria-hidden="true"></i>
                  {{ tx.status }}
                </span>
              </td>
              <td>
                <span class="cel__sub">{{ formatDate(tx.createdAt) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
