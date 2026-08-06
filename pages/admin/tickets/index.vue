<script setup>
/**
 * SUPPORT INBOX.
 *
 * On the desk layer, same as the rest of admin. Four things were wrong beyond
 * the styling:
 *
 *  1. A failed request looked like an empty inbox. `fetchTickets` caught its
 *     error, logged it to the console and left `tickets` as [] — so the page
 *     rendered "No tickets found. We couldn't find any tickets matching your
 *     search criteria", blaming a search the user had not typed for a request
 *     that had failed. Support staff would reasonably conclude nobody had
 *     written in. Failure is now its own state, with a retry.
 *
 *  2. The rows could not be opened from a keyboard. Each was a <tr> with a click
 *     handler and no link inside it, so tabbing through the inbox skipped every
 *     ticket. There is a real link per row now, stretched across it.
 *
 *  3. `t.subject.toLowerCase()` and `t.fromEmail.toLowerCase()` in the filter,
 *     with no optional chaining — while `t.fromName?.` two lines down has it.
 *     One ticket with a null subject and searching threw.
 *
 *  4. `authStore` was imported and never used.
 */
import { computed, onMounted, ref } from "vue";
import { formatDate, formatRelativeDate } from "~/utils/date";

definePageMeta({ title: "Support inbox", middleware: "admin" });

const { $api } = useNuxtApp();

const tickets = ref([]);
const loading = ref(true);
const loadError = ref("");
const search = ref("");
const view = ref("open");

const VIEWS = [
  { key: "open", label: "Open" },
  { key: "pending", label: "Waiting" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
];

const fetchTickets = async () => {
  loading.value = true;
  loadError.value = "";
  try {
    const { data } = await $api.get("/support");
    tickets.value = Array.isArray(data) ? data : [];
  } catch (err) {
    loadError.value =
      err.response?.data?.message ||
      "Could not reach the support inbox. Nothing has been lost — try again.";
    tickets.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTickets);

const matches = (t) => {
  const q = search.value.trim().toLowerCase();
  if (!q) return true;
  return [t.subject, t.fromEmail, t.fromName]
    .filter(Boolean)
    .some((f) => String(f).toLowerCase().includes(q));
};

const found = computed(() => tickets.value.filter(matches));

const viewCounts = computed(() => ({
  open: found.value.filter((t) => t.status === "OPEN").length,
  pending: found.value.filter((t) => t.status === "PENDING").length,
  closed: found.value.filter((t) => t.status === "CLOSED").length,
  all: found.value.length,
}));

const rows = computed(() => {
  const want = { open: "OPEN", pending: "PENDING", closed: "CLOSED" }[view.value];
  const list = want ? found.value.filter((t) => t.status === want) : found.value;
  /* Oldest untouched first. An inbox sorted newest-first buries the person who
     has been waiting longest, which is the one the queue exists to surface. */
  return [...list].sort((a, b) => {
    const rank = { OPEN: 0, PENDING: 1, CLOSED: 2 };
    const ra = rank[a.status] ?? 3;
    const rb = rank[b.status] ?? 3;
    if (ra !== rb) return ra - rb;
    return new Date(a.updatedAt) - new Date(b.updatedAt);
  });
});

const waiting = computed(
  () => tickets.value.filter((t) => t.status === "OPEN").length,
);

/** Hours since the oldest open ticket was last touched. */
const oldestWait = computed(() => {
  const open = tickets.value.filter((t) => t.status === "OPEN");
  if (!open.length) return null;
  const oldest = open.reduce((a, b) =>
    new Date(a.updatedAt) < new Date(b.updatedAt) ? a : b,
  );
  const hours = Math.floor((Date.now() - new Date(oldest.updatedAt)) / 3600000);
  if (hours < 1) return "under an hour";
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
});

const CHIP = { OPEN: "chip--late", PENDING: "chip--idle", CLOSED: "chip--paid" };
const chipFor = (s) => CHIP[s] || "chip--idle";

/* MEDIUM is deliberately the empty string: base .pay is already the neutral
   secondary colour, and inventing a fourth tone for "normal" would mean three
   of the four priorities are coloured, which is the same as none of them being. */
const PRIORITY = { HIGH: "pay--high", MEDIUM: "", LOW: "pay--ok" };
const priorityFor = (p) =>
  p in PRIORITY ? PRIORITY[p] : "pay--unknown";

const ref_ = (t) => `#${String(t.id).padStart(4, "0")}`;
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">Support</h1>
        <p class="desk__sub">
          <template v-if="waiting">
            {{ waiting }} {{ waiting === 1 ? "person is" : "people are" }} waiting
            <template v-if="oldestWait">
              — the longest for {{ oldestWait }}
            </template>.
          </template>
          <template v-else>Nobody is waiting on a reply.</template>
        </p>
      </div>
    </header>

    <!-- ── Find it ──────────────────────────────────────────────────────── -->
    <div class="bar">
      <div class="search bar__grow">
        <label class="sr-only" for="ticket-search">Search tickets</label>
        <span class="search__icon" aria-hidden="true">
          <UiIcon icon="heroicons:magnifying-glass" custom-class="w-4 h-4" />
        </span>
        <input
          id="ticket-search"
          v-model="search"
          type="search"
          class="search__inp no-ik"
          placeholder="Subject, name or email" />
        <button
          v-if="search"
          type="button"
          class="search__clear"
          aria-label="Clear search"
          @click="search = ''">
          <UiIcon icon="heroicons:x-mark" custom-class="w-4 h-4" />
        </button>
      </div>

      <div class="segs" role="group" aria-label="Filter by status">
        <button
          v-for="v in VIEWS"
          :key="v.key"
          type="button"
          class="seg"
          :class="{ 'seg--on': view === v.key }"
          :aria-pressed="view === v.key"
          @click="view = v.key">
          {{ v.label }}
          <span class="seg__n">{{ viewCounts[v.key] }}</span>
        </button>
      </div>

      <button
        type="button"
        class="desk-btn desk-btn--ghost desk-btn--sm"
        @click="fetchTickets">
        <UiIcon
          icon="heroicons:arrow-path"
          :custom-class="loading ? 'w-4 h-4 spin' : 'w-4 h-4'" />
        Refresh
      </button>
    </div>

    <!-- ── The inbox ────────────────────────────────────────────────────── -->
    <div class="ledger">
      <div class="ledger__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Ticket</th>
              <th scope="col">From</th>
              <th scope="col">Priority</th>
              <th scope="col">Status</th>
              <th scope="col">Last reply</th>
            </tr>
          </thead>

          <tbody v-if="loading && !tickets.length">
            <tr v-for="i in 5" :key="i">
              <td v-for="j in 5" :key="j">
                <span class="skel" style="display: block"></span>
              </td>
            </tr>
          </tbody>

          <!-- A failed request is not an empty inbox. -->
          <tbody v-else-if="loadError">
            <tr>
              <td colspan="5">
                <div class="empty empty--pad">
                  <p class="empty__title">The inbox did not load.</p>
                  <p class="empty__body">{{ loadError }}</p>
                  <button
                    type="button"
                    class="desk-btn desk-btn--primary"
                    @click="fetchTickets">
                    Try again
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="!rows.length">
            <tr>
              <td colspan="5">
                <div class="empty empty--pad">
                  <template v-if="search">
                    <p class="empty__title">Nothing matches “{{ search }}”.</p>
                    <p class="empty__body">
                      Search covers the subject, the name and the email address.
                    </p>
                    <button
                      type="button"
                      class="desk-btn desk-btn--ghost"
                      @click="search = ''">
                      Clear the search
                    </button>
                  </template>
                  <template v-else-if="view === 'open'">
                    <p class="empty__title">Nothing open.</p>
                    <p class="empty__body">
                      Everyone who has written in has had a reply. This is the
                      view worth being empty.
                    </p>
                  </template>
                  <template v-else-if="view === 'pending'">
                    <p class="empty__title">Nothing waiting on them.</p>
                    <p class="empty__body">
                      No tickets are sitting with a reply sent and no answer back
                      yet.
                    </p>
                  </template>
                  <template v-else>
                    <p class="empty__title">No tickets here.</p>
                    <p class="empty__body">
                      Messages sent to support arrive in this list.
                    </p>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="t in rows" :key="t.id" class="row-link">
              <td>
                <div class="cel">
                  <!-- The row's one link. Stretched over the whole <tr> by
                       .row-link__hit::after, so the row stays clickable while
                       there is exactly one thing to tab to and one accessible
                       name for it. -->
                  <NuxtLink
                    :to="`/admin/tickets/${t.id}`"
                    class="cel__main cel__link row-link__hit">
                    {{ t.subject || "No subject" }}
                  </NuxtLink>
                  <span class="cel__sub">
                    {{ ref_(t) }} · {{ t._count?.messages || 0 }}
                    {{ (t._count?.messages || 0) === 1 ? "message" : "messages" }}
                  </span>
                </div>
              </td>

              <td>
                <div class="cel">
                  <span class="cel__main">{{ t.fromName || "Guest" }}</span>
                  <span class="cel__sub">
                    {{ t.fromEmail }}
                    <template v-if="t.user"> · {{ t.user.plan }} customer</template>
                  </span>
                </div>
              </td>

              <td>
                <span class="pay" :class="priorityFor(t.priority)">
                  {{ (t.priority || "None").toLowerCase() }}
                </span>
              </td>

              <td>
                <span class="chip" :class="chipFor(t.status)">
                  <i class="chip__dot" aria-hidden="true"></i>
                  {{ t.status === "PENDING" ? "Waiting" : t.status }}
                </span>
              </td>

              <td>
                <div class="cel">
                  <span class="cel__main">{{ formatRelativeDate(t.updatedAt) }}</span>
                  <span class="cel__sub">{{ formatDate(t.updatedAt) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
