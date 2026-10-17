<script setup>
/**
 * Admin → Users.
 *
 * The row menu here suspends accounts, cancels people's subscriptions and
 * deletes everything they own. Two changes beyond the migration off UiTable:
 *
 *  - The destructive items were plain menu rows in the same grey as "Edit
 *    subscription". Delete is the only clay row, and the two that cost money
 *    sit below a divider.
 *  - "Cancel subscription" and "Delete account" went through window.confirm().
 *    They emit now, and the page confirms in a modal that names the account.
 */
import { computed } from "vue";
import { formatDate } from "~/utils/date";

const props = defineProps({
  users: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  search: { type: String, default: "" },
});

const emit = defineEmits([
  "update:search",
  "refresh",
  "edit-billing",
  "toggle-status",
  "cancel-sub",
  "delete",
]);

const initials = (name) => String(name || "?").trim().charAt(0).toUpperCase() || "?";

const renews = (user) => {
  const sub = user.subscriptions?.[0];
  if (!sub || sub.status !== "ACTIVE" || !sub.subscriptionEnds) return "";
  return formatDate(sub.subscriptionEnds);
};

const suspended = computed(() => props.users.filter((u) => !u.isActive).length);
const paying = computed(
  () => props.users.filter((u) => String(u.plan || "FREE").toUpperCase() !== "FREE").length,
);
</script>

<template>
  <div>
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Accounts</h2>
        <p class="sec__note">
          {{ users.length }} shown · {{ paying }} paying ·
          {{ suspended }} suspended
        </p>
      </div>

      <div class="bar">
        <div class="search bar__grow">
          <label class="sr-only" for="user-search">Search users</label>
          <span class="search__icon" aria-hidden="true">
            <UiIcon icon="heroicons:magnifying-glass" custom-class="w-4 h-4" />
          </span>
          <input
            id="user-search"
            :value="search"
            type="search"
            class="search__inp no-ik"
            placeholder="Name or email"
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
              <th scope="col">User</th>
              <th scope="col">Plan</th>
              <th scope="col" class="num">Made</th>
              <th scope="col">Status</th>
              <th scope="col">Joined</th>
              <th scope="col" class="acts">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody v-if="loading && !users.length">
            <tr v-for="i in 5" :key="i">
              <td v-for="j in 6" :key="j">
                <span class="skel" style="display: block"></span>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="!users.length">
            <tr>
              <td colspan="6">
                <div class="empty empty--pad">
                  <p class="empty__title">
                    {{ search ? `Nothing matches “${search}”.` : "No accounts." }}
                  </p>
                  <p class="empty__body">
                    {{
                      search
                        ? "Search covers the name and the email."
                        : "Nobody has signed up yet."
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
            <tr v-for="u in users" :key="u.id">
              <td>
                <div class="cel cel--row">
                  <span class="fact__av" aria-hidden="true">{{ initials(u.name) }}</span>
                  <span class="cel">
                    <span class="cel__main">{{ u.name || "Unnamed" }}</span>
                    <span class="cel__sub">{{ u.email }}</span>
                  </span>
                </div>
              </td>

              <td>
                <div class="cel">
                  <span
                    class="chip"
                    :class="
                      String(u.plan || 'FREE').toUpperCase() === 'FREE'
                        ? 'chip--idle'
                        : 'chip--paid'
                    ">
                    <i class="chip__dot" aria-hidden="true"></i>
                    {{ u.plan || "FREE" }}
                  </span>
                  <span v-if="renews(u)" class="cel__sub">
                    Renews {{ renews(u) }}
                  </span>
                </div>
              </td>

              <!-- Two counts that used to be a column called "Stats" with the
                   numbers stacked over 9px uppercase labels. -->
              <td class="num">
                <div class="cel">
                  <span class="cel__main">{{ u._count?.invoices || 0 }} inv</span>
                  <span class="cel__sub">{{ u._count?.clients || 0 }} clients</span>
                </div>
              </td>

              <td>
                <div class="cel">
                  <span class="chip" :class="u.isActive ? 'chip--paid' : 'chip--late'">
                    <i class="chip__dot" aria-hidden="true"></i>
                    {{ u.isActive ? "Active" : "Suspended" }}
                  </span>
                  <span v-if="u.role === 'ADMIN'" class="cel__sub">Admin</span>
                </div>
              </td>

              <td>
                <span class="cel__sub">{{ formatDate(u.createdAt) }}</span>
              </td>

              <td class="acts">
                <UiPopover placement="bottom-end" bare>
                  <template #trigger>
                    <button
                      type="button"
                      class="iact"
                      :aria-label="`Actions for ${u.email}`">
                      <UiIcon
                        icon="heroicons:ellipsis-horizontal"
                        custom-class="w-5 h-5" />
                    </button>
                  </template>
                  <template #default="{ close }">
                    <div class="mnu">
                      <p class="mnu__head">Account</p>
                      <button
                        type="button"
                        class="mnu__item"
                        @click="close(); emit('edit-billing', u)">
                        <UiIcon icon="heroicons:calendar-days" custom-class="w-4 h-4" />
                        Change renewal date
                      </button>
                      <button
                        type="button"
                        class="mnu__item"
                        @click="close(); emit('toggle-status', u)">
                        <UiIcon
                          :icon="u.isActive ? 'heroicons:no-symbol' : 'heroicons:check-circle'"
                          custom-class="w-4 h-4" />
                        {{ u.isActive ? "Suspend this account" : "Reactivate" }}
                      </button>

                      <div class="mnu__sep" role="none"></div>
                      <p class="mnu__head">Costs them money</p>
                      <button
                        v-if="String(u.plan || 'FREE').toUpperCase() !== 'FREE'"
                        type="button"
                        class="mnu__item"
                        @click="close(); emit('cancel-sub', u)">
                        <UiIcon icon="heroicons:x-circle" custom-class="w-4 h-4" />
                        Cancel subscription
                      </button>
                      <button
                        type="button"
                        class="mnu__item mnu__item--danger"
                        @click="close(); emit('delete', u)">
                        <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
                        Delete everything
                      </button>
                    </div>
                  </template>
                </UiPopover>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
