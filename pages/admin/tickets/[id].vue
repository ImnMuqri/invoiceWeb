<script setup>
/**
 * A SUPPORT CONVERSATION.
 *
 * The thread reuses .msg / .chat from the invoice assistant rather than
 * rebuilding chat bubbles — see the Support tickets block in app-desk.css.
 *
 * Four things beyond the styling:
 *
 *  1. Two native alert() calls — "Failed to send reply. Please check logs." and
 *     "Failed to update status." The first tells a support agent to read server
 *     logs, which is not something they can do, and neither says whether the
 *     message was sent. Both are toasts now, and the reply survives a failure so
 *     it can be sent again rather than being lost with the dialog.
 *
 *  2. A failed load rendered as nothing at all: `ticket` stayed null, the
 *     `v-else-if="ticket"` never matched, and the page showed an empty div under
 *     the back link. Failure is its own state with a retry.
 *
 *  3. `getStatusClass` ended `'... text-slate-500 text-emerald-600'` — two text
 *     colours on one branch, last one winning, so an unrecognised status came
 *     out green. Statuses map to chip modifiers now.
 *
 *  4. `authStore` was imported and never used.
 */
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { formatDate, formatTime } from "~/utils/date";

definePageMeta({ title: "Ticket", middleware: "admin" });

const route = useRoute();
const { $api } = useNuxtApp();

const ticket = ref(null);
const loading = ref(true);
const loadError = ref("");
const sending = ref(false);
const reply = ref("");
const closeAfter = ref(false);
const toast = ref({ message: "", type: "success" });
const notify = (message, type = "success") => (toast.value = { message, type });

const threadEnd = ref(null);

const scrollToEnd = async () => {
  await nextTick();
  threadEnd.value?.scrollIntoView({ block: "end", behavior: "smooth" });
};

const fetchTicket = async () => {
  loading.value = true;
  loadError.value = "";
  try {
    const { data } = await $api.get(`/support/${route.params.id}`);
    ticket.value = data;
  } catch (err) {
    loadError.value =
      err.response?.status === 404
        ? "That ticket does not exist, or it has been deleted."
        : err.response?.data?.message ||
          "Could not load this conversation. Try again in a moment.";
    ticket.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchTicket();
  scrollToEnd();
});

const sendReply = async () => {
  const body = reply.value.trim();
  if (!body || sending.value) return;
  /* Captured before the reset below, or the message reports the flag we have
     just cleared rather than the one we sent with. */
  const alsoClosed = closeAfter.value;
  sending.value = true;
  try {
    await $api.post(`/support/${route.params.id}/reply`, {
      content: body,
      closeTicket: alsoClosed,
    });
    /* Only cleared once the server has it. The old version cleared the box
       first, so a failed send lost what had been written. */
    reply.value = "";
    closeAfter.value = false;
    await fetchTicket();
    scrollToEnd();
    notify(alsoClosed ? "Replied, and the ticket is closed." : "Reply sent.");
  } catch (err) {
    notify(
      err.response?.data?.message ||
        "That did not send. Your reply is still in the box — try again.",
      "error",
    );
  } finally {
    sending.value = false;
  }
};

const updateStatus = async (status) => {
  const previous = ticket.value?.status;
  try {
    await $api.patch(`/support/${route.params.id}/status`, { status });
    await fetchTicket();
    notify(`Marked ${label(status).toLowerCase()}.`);
  } catch (err) {
    notify(
      err.response?.data?.message ||
        `Could not change this from ${label(previous).toLowerCase()}.`,
      "error",
    );
  }
};

const CHIP = { OPEN: "chip--late", PENDING: "chip--idle", CLOSED: "chip--paid" };
const chipFor = (s) => CHIP[s] || "chip--idle";

const label = (s) =>
  ({ OPEN: "Open", PENDING: "Waiting on them", CLOSED: "Closed" })[s] || s || "Unknown";

const STATUSES = ["OPEN", "PENDING", "CLOSED"];

const who = computed(() => ticket.value?.fromName || "Guest");

const messages = computed(() => ticket.value?.messages || []);

/* Ctrl/Cmd+Enter sends, which is what anyone who answers tickets all day will
   try first. */
const onKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") sendReply();
};
</script>

<template>
  <div class="desk">
    <header class="desk__head">
      <div>
        <NuxtLink to="/admin/tickets" class="card__link card__link--target">
          &larr; Back to support
        </NuxtLink>
        <h1 class="desk__title" style="margin-top: var(--space-2)">
          {{ loading ? "Loading…" : ticket?.subject || "Ticket" }}
        </h1>
        <!-- Each fact is kept whole. Without the nowrap the line broke inside
             the date — "opened 2 / Aug 2026" — which reads as two facts. -->
        <p v-if="ticket" class="desk__sub">
          <span style="white-space: nowrap">{{ who }}</span> ·
          <span style="white-space: nowrap">{{ ticket.fromEmail }}</span>
          <template v-if="ticket.user">
            · <span style="white-space: nowrap">{{ ticket.user.plan }} customer</span>
          </template>
          · <span style="white-space: nowrap">
            opened {{ formatDate(ticket.createdAt) }}
          </span>
        </p>
      </div>

      <div v-if="ticket" class="desk__actions">
        <span class="chip" :class="chipFor(ticket.status)">
          <i class="chip__dot" aria-hidden="true"></i>
          {{ label(ticket.status) }}
        </span>
        <UiPopover placement="bottom-end" bare>
          <template #trigger>
            <button
              type="button"
              class="desk-btn desk-btn--icon"
              aria-label="Change ticket status">
              <UiIcon icon="heroicons:ellipsis-horizontal" custom-class="w-5 h-5" />
            </button>
          </template>
          <template #default="{ close }">
            <div class="mnu">
              <p class="mnu__head">Status</p>
              <button
                v-for="s in STATUSES"
                :key="s"
                type="button"
                class="mnu__item"
                :disabled="ticket.status === s"
                @click="close(); updateStatus(s)">
                <i class="mnu__dot" :class="`mnu__dot--${s === 'CLOSED' ? 'paid' : s === 'OPEN' ? 'late' : 'idle'}`" aria-hidden="true"></i>
                {{ label(s) }}
              </button>
            </div>
          </template>
        </UiPopover>
      </div>
    </header>

    <!-- ── Loading ──────────────────────────────────────────────────────── -->
    <div v-if="loading" class="chat">
      <div class="chat__log">
        <div v-for="i in 3" :key="i" class="msg" :class="{ 'msg--me': i === 2 }">
          <div class="msg__body" style="min-width: 16rem">
            <i class="sk" style="width: 90%"></i><br />
            <i class="sk" style="width: 60%"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Failed ───────────────────────────────────────────────────────── -->
    <div v-else-if="loadError" class="card">
      <div class="empty empty--pad">
        <p class="empty__title">This conversation did not load.</p>
        <p class="empty__body">{{ loadError }}</p>
        <div class="bar" style="justify-content: center">
          <NuxtLink to="/admin/tickets" class="desk-btn desk-btn--ghost">
            Back to support
          </NuxtLink>
          <button type="button" class="desk-btn desk-btn--primary" @click="fetchTicket">
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- ── The thread ───────────────────────────────────────────────────── -->
    <template v-else-if="ticket">
      <div class="chat">
        <div class="chat__log">
          <div v-if="!messages.length" class="empty">
            <p class="empty__title">Nothing in this thread yet.</p>
            <p class="empty__body">
              The ticket exists but carries no messages. Replying below starts it.
            </p>
          </div>

          <div
            v-for="m in messages"
            :key="m.id"
            class="msg msg--wide"
            :class="{ 'msg--me': m.sender === 'ADMIN' }">
            <div class="msg__body">
              <span class="msg__meta">
                <span class="msg__who">
                  {{ m.sender === "ADMIN" ? "You" : who }}
                </span>
                <span class="msg__when">{{ formatTime(m.createdAt) }}</span>
              </span>
              <span style="display: block; white-space: pre-wrap">{{ m.content }}</span>
            </div>
          </div>
          <div ref="threadEnd"></div>
        </div>
      </div>

      <!-- ── Reply ──────────────────────────────────────────────────────── -->
      <form class="reply" @submit.prevent="sendReply">
        <div class="f" style="margin: 0">
          <label class="sr-only" for="reply">Your reply</label>
          <textarea
            id="reply"
            v-model="reply"
            rows="4"
            class="inp no-ik"
            :disabled="sending"
            placeholder="Write back to them. This goes to their email."
            @keydown="onKeydown"></textarea>
        </div>

        <div class="reply__acts">
          <label class="tog" for="close-after">
            <input
              id="close-after"
              v-model="closeAfter"
              type="checkbox"
              class="tog__inp" />
            <span class="tog__track" aria-hidden="true"></span>
            <span class="tog__label">Close the ticket once this sends</span>
          </label>

          <div class="bar">
            <span class="set__dirty">⌘↵ to send</span>
            <button
              type="submit"
              class="desk-btn desk-btn--primary"
              :disabled="!reply.trim() || sending">
              <UiIcon
                v-if="sending"
                icon="heroicons:arrow-path"
                custom-class="w-4 h-4 spin" />
              {{ sending ? "Sending…" : "Send reply" }}
            </button>
          </div>
        </div>
      </form>
    </template>

    <UiToast v-model="toast" />
  </div>
</template>
