<script setup>
/**
 * NOTIFICATIONS — the full list.
 *
 * The bell popover shows the eight most recent and is built for a glance. This
 * is the place where you can actually deal with them: read one, read all, throw
 * one away, or sweep the ones you have already read.
 *
 * Clearing defaults to read-only. "Delete everything" is a separate, named
 * action behind a confirmation, because a notification you have not read yet is
 * the one thing on this page you might still need.
 */
import { computed, onMounted, ref } from "vue";
import { useNotificationStore } from "~/stores/notificationStore";
import { useUiStore } from "~/stores/uiStore";
import { formatDate } from "~/utils/date";

const store = useNotificationStore();
const uiStore = useUiStore();

const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const view = ref("all");
const busy = ref(false);
const confirmClear = ref(null);

onMounted(() => store.fetchNotifications());

const readCount = computed(() => store.notifications.filter((n) => n.isRead).length);

const rows = computed(() =>
  view.value === "unread"
    ? store.notifications.filter((n) => !n.isRead)
    : store.notifications,
);

const VIEWS = computed(() => [
  { key: "all", label: "All", n: store.notifications.length },
  { key: "unread", label: "Unread", n: store.unreadCount },
]);

const readAll = async () => {
  busy.value = true;
  try {
    await store.markAllAsRead();
    notify("All marked as read.");
  } catch {
    notify("Could not mark those as read.", "error");
  } finally {
    busy.value = false;
  }
};

const removeOne = async (n) => {
  try {
    await store.remove(n.id);
    notify("Deleted.");
  } catch {
    notify("Could not delete that one — it is still in your list.", "error");
  }
};

const doClear = async () => {
  const scope = confirmClear.value;
  if (!scope) return;
  busy.value = true;
  try {
    const res = await store.clear(scope);
    confirmClear.value = null;
    notify(
      res?.count
        ? `${res.count} ${res.count === 1 ? "notification" : "notifications"} deleted.`
        : "Nothing to delete.",
    );
  } catch {
    notify("Could not clear those. Nothing was deleted.", "error");
  } finally {
    busy.value = false;
  }
};
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <h1 class="desk__title">Notifications</h1>
        <p class="desk__sub">
          <template v-if="store.unreadCount">
            {{ store.unreadCount }} unread of {{ store.notifications.length }}.
          </template>
          <template v-else-if="store.notifications.length">
            Nothing unread. {{ store.notifications.length }} kept.
          </template>
          <template v-else>Everything that happens to your account shows up here.</template>
        </p>
      </div>
      <div class="desk__actions">
        <button
          v-if="store.unreadCount > 0"
          type="button"
          class="desk-btn desk-btn--ghost"
          :disabled="busy"
          @click="readAll">
          <UiIcon icon="heroicons:check" custom-class="w-4 h-4" />
          Mark all read
        </button>
        <button
          v-if="readCount > 0"
          type="button"
          class="desk-btn desk-btn--ghost"
          :disabled="busy"
          @click="confirmClear = 'read'">
          <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
          Clear read
        </button>
      </div>
    </header>

    <div v-if="store.notifications.length" class="bar">
      <div class="segs bar__grow" role="tablist" aria-label="Which notifications">
        <button
          v-for="v in VIEWS"
          :key="v.key"
          type="button"
          role="tab"
          class="seg"
          :class="{ 'seg--on': view === v.key }"
          :aria-selected="view === v.key"
          @click="view = v.key">
          {{ v.label }}
          <span class="seg__n">{{ v.n }}</span>
        </button>
      </div>
      <button
        type="button"
        class="desk-btn desk-btn--ghost desk-btn--sm"
        :disabled="busy"
        @click="confirmClear = 'all'">
        Delete everything
      </button>
    </div>

    <div class="card">
      <div v-if="store.loading && !store.notifications.length" class="notes">
        <div v-for="n in 4" :key="n" class="note note--flat">
          <span class="note__pip note__pip--read" aria-hidden="true"></span>
          <span>
            <span class="note__top">
              <i class="sk" style="width: 12rem"></i>
              <i class="sk" style="width: 4rem"></i>
            </span>
            <i class="sk" style="width: 20rem; margin-top: 6px"></i>
          </span>
          <span></span>
        </div>
      </div>

      <div v-else-if="!rows.length" class="empty empty--pad">
        <p class="empty__title">
          {{ view === "unread" ? "Nothing unread" : "No notifications" }}
        </p>
        <p class="empty__body">
          <template v-if="view === 'unread'">
            You are up to date. Everything you have read is still under All.
          </template>
          <template v-else>
            Invoices being paid, reminders going out and plan changes all appear
            here. Nothing has happened yet.
          </template>
        </p>
        <button
          v-if="view === 'unread'"
          type="button"
          class="desk-btn desk-btn--ghost desk-btn--sm"
          @click="view = 'all'">
          Show all
        </button>
      </div>

      <div v-else class="notes">
        <div
          v-for="n in rows"
          :key="n.id"
          class="note note--flat"
          :class="{ 'note--read': n.isRead }">
          <span
            class="note__pip"
            :class="{ 'note__pip--read': n.isRead }"
            aria-hidden="true"></span>
          <span>
            <span class="note__top">
              <span class="note__title" style="white-space: normal">
                {{ n.title }}
              </span>
              <span class="note__when">{{ formatDate(n.createdAt) }}</span>
            </span>
            <span class="note__body">{{ n.message }}</span>
          </span>
          <span class="note__acts">
            <button
              v-if="!n.isRead"
              type="button"
              class="iact"
              :aria-label="`Mark ${n.title} as read`"
              title="Mark as read"
              @click="store.markAsRead(n.id)">
              <UiIcon icon="heroicons:check" custom-class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="iact iact--danger"
              :aria-label="`Delete ${n.title}`"
              title="Delete"
              @click="removeOne(n)">
              <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
            </button>
          </span>
        </div>
      </div>
    </div>

    <UiModal
      :model-value="!!confirmClear"
      max-width="sm"
      @update:model-value="confirmClear = null">
      <div class="dlg">
        <h3 class="dlg__title">
          {{ confirmClear === "all" ? "Delete every notification?" : "Clear the ones you have read?" }}
        </h3>
        <p class="dlg__body">
          <template v-if="confirmClear === 'all'">
            This removes all {{ store.notifications.length }}, including
            <b>{{ store.unreadCount }}</b> you have not read yet. Nothing else is
            affected — your invoices, clients and payments are untouched.
          </template>
          <template v-else>
            {{ readCount }} {{ readCount === 1 ? "notification" : "notifications" }}
            you have already read will be deleted. Anything unread stays.
          </template>
        </p>
        <div class="dlg__acts">
          <button
            type="button"
            class="desk-btn desk-btn--ghost"
            @click="confirmClear = null">
            Keep them
          </button>
          <button
            type="button"
            class="desk-btn desk-btn--danger"
            :disabled="busy"
            @click="doClear">
            {{ confirmClear === "all" ? "Delete everything" : "Clear read" }}
          </button>
        </div>
      </div>
    </UiModal>

    <UiToast v-model="toast" />
  </div>
</template>
