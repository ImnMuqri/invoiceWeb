<script setup>
/**
 * Admin → Promo codes.
 *
 * The active/inactive chip was a <button> styled as a status pill — it looked
 * exactly like the read-only status chips two columns over in the users table,
 * and toggled a live discount code when clicked. It is a switch now, which is
 * what it does.
 */
import { computed } from "vue";
import { formatDate } from "~/utils/date";

const props = defineProps({
  codes: { type: Array, default: () => [] },
  search: { type: String, default: "" },
});

const emit = defineEmits([
  "update:search",
  "refresh",
  "create",
  "edit",
  "toggle",
  "delete",
]);

const benefit = (p) =>
  p.discountType === "PERCENTAGE"
    ? `${p.discountValue}% off`
    : `MYR ${p.discountValue} off`;

const spent = (p) => {
  if (!p.maxUses) return `${p.uses || 0} used`;
  return `${p.uses || 0} of ${p.maxUses} used`;
};

const exhausted = (p) => !!p.maxUses && Number(p.uses || 0) >= Number(p.maxUses);

const expired = (p) =>
  !!p.expiresAt && new Date(p.expiresAt).getTime() < Date.now();

/* A code can be switched on and still be doing nothing — out of uses, or past
   its date. The old table showed "Active" for all three. */
const live = computed(() =>
  props.codes.filter((p) => p.isActive && !exhausted(p) && !expired(p)).length,
);
</script>

<template>
  <div>
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Promo codes</h2>
        <p class="sec__note">
          {{ codes.length }} on record · {{ live }} actually redeemable right now
        </p>
      </div>

      <div class="bar">
        <div class="search bar__grow">
          <label class="sr-only" for="promo-search">Search codes</label>
          <span class="search__icon" aria-hidden="true">
            <UiIcon icon="heroicons:magnifying-glass" custom-class="w-4 h-4" />
          </span>
          <input
            id="promo-search"
            :value="search"
            type="search"
            class="search__inp no-ik"
            placeholder="Code or discount type"
            @input="emit('update:search', $event.target.value)" />
        </div>
        <button
          type="button"
          class="desk-btn desk-btn--ghost desk-btn--sm"
          @click="emit('refresh')">
          <UiIcon icon="heroicons:arrow-path" custom-class="w-4 h-4" />
          Refresh
        </button>
        <button
          type="button"
          class="desk-btn desk-btn--primary desk-btn--sm"
          @click="emit('create')">
          New code
        </button>
      </div>
    </section>

    <div class="ledger">
      <div class="ledger__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Code</th>
              <th scope="col">Gives</th>
              <th scope="col" class="num">Used</th>
              <th scope="col">Expires</th>
              <th scope="col">Live</th>
              <th scope="col" class="acts">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody v-if="!codes.length">
            <tr>
              <td colspan="6">
                <div class="empty empty--pad">
                  <p class="empty__title">
                    {{ search ? `Nothing matches “${search}”.` : "No codes yet." }}
                  </p>
                  <p class="empty__body">
                    {{
                      search
                        ? "Search covers the code and the discount type."
                        : "Create one and it can be applied on the billing page."
                    }}
                  </p>
                  <button
                    type="button"
                    class="desk-btn desk-btn--ghost"
                    @click="search ? emit('update:search', '') : emit('create')">
                    {{ search ? "Clear the search" : "Create a code" }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="p in codes" :key="p.id">
              <td>
                <span class="cel__main" style="font-family: var(--font-mono)">
                  {{ p.code }}
                </span>
              </td>
              <td>
                <span class="cel__main">{{ benefit(p) }}</span>
              </td>
              <td class="num">
                <div class="cel">
                  <span class="cel__main">{{ p.uses || 0 }}</span>
                  <span class="cel__sub">{{ spent(p) }}</span>
                </div>
              </td>
              <td>
                <div class="cel">
                  <span class="cel__main">
                    {{ p.expiresAt ? formatDate(p.expiresAt) : "No end date" }}
                  </span>
                  <span v-if="expired(p)" class="cel__sub cel__sub--late">
                    Expired
                  </span>
                  <span v-else-if="exhausted(p)" class="cel__sub cel__sub--late">
                    Out of uses
                  </span>
                </div>
              </td>
              <td>
                <!-- A switch, not a chip that happens to be clickable. -->
                <label class="tog" :for="`promo-${p.id}`">
                  <input
                    :id="`promo-${p.id}`"
                    type="checkbox"
                    class="tog__inp"
                    :checked="!!p.isActive"
                    @change="emit('toggle', p)" />
                  <span class="tog__track" aria-hidden="true"></span>
                  <span class="sr-only">{{ p.code }} enabled</span>
                </label>
              </td>
              <td class="acts">
                <div class="cel cel--row" style="justify-content: flex-end">
                  <button
                    type="button"
                    class="iact"
                    :aria-label="`Edit ${p.code}`"
                    title="Edit"
                    @click="emit('edit', p)">
                    <UiIcon icon="heroicons:pencil-square" custom-class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="iact iact--danger"
                    :aria-label="`Delete ${p.code}`"
                    title="Delete"
                    @click="emit('delete', p)">
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
