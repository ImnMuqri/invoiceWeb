<script setup lang="ts">
/**
 * The signature device: one WhatsApp-style thread that advances as the reader
 * scrolls. Built entirely from HTML, CSS and inline SVG — no screenshot, no
 * image request, fully themeable, and translatable without re-exporting art.
 *
 * Cadence: when the visible count increases, a typing indicator appears for
 * one beat before the message lands, so the thread reads as a conversation
 * happening rather than a list being revealed.
 */
import type { ThreadMessage } from '~/composables/useThread'

const props = withDefaults(
  defineProps<{
    messages: ThreadMessage[]
    labels: {
      label: string
      contact: string
      contactStatus: string
      automaticTag: string
    }
    /** How many messages should be visible. Driven by scroll position. */
    visibleCount: number
    /** Disables the typing beat — used for the static hero instance. */
    instant?: boolean
  }>(),
  { instant: false }
)

const shown = ref(props.instant ? props.visibleCount : Math.min(1, props.visibleCount))
const typing = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const TYPING_BEAT = 420

function reduced() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

watch(
  () => props.visibleCount,
  (next, prev) => {
    if (timer) clearTimeout(timer)

    // Going backwards (scrolling up) is immediate — no fake typing in reverse.
    if (next <= (prev ?? 0) || props.instant || reduced()) {
      typing.value = false
      shown.value = next
      return
    }

    const advance = () => {
      if (shown.value >= next) {
        typing.value = false
        return
      }
      const nextMsg = props.messages[shown.value]
      // Only inbound text messages get a typing indicator — a system event or
      // a delivery receipt is not something a person is composing.
      const wantsTyping = nextMsg?.kind === 'text' && nextMsg.side === 'in'
      typing.value = wantsTyping
      timer = setTimeout(
        () => {
          typing.value = false
          shown.value += 1
          timer = setTimeout(advance, 90)
        },
        wantsTyping ? TYPING_BEAT : 140
      )
    }
    advance()
  },
  { immediate: false }
)

onMounted(() => {
  if (!props.instant && props.visibleCount > shown.value) {
    shown.value = props.visibleCount
  }
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

const visible = computed(() => props.messages.slice(0, shown.value))
</script>

<template>
  <figure class="phone-wrap">
    <p class="phone-label">
      <span class="phone-label__dot" aria-hidden="true"></span>
      {{ labels.label }}
    </p>

    <div class="phone">
      <div class="phone__screen">
        <!-- status bar -->
        <div class="status" aria-hidden="true">
          <span class="status__time k-num">09:12</span>
          <span class="status__island"></span>
          <span class="status__icons">
            <svg viewBox="0 0 18 12" class="status__ico">
              <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
              <rect x="4.5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" />
              <rect x="9" y="3" width="3" height="9" rx="1" fill="currentColor" />
              <rect x="13.5" y="0.5" width="3" height="11.5" rx="1" fill="currentColor" />
            </svg>
            <svg viewBox="0 0 26 12" class="status__ico status__ico--batt">
              <rect
                x="0.75"
                y="0.75"
                width="21"
                height="10.5"
                rx="3"
                fill="none"
                stroke="currentColor"
                stroke-width="1.2" />
              <rect x="2.5" y="2.5" width="14" height="7" rx="1.6" fill="currentColor" />
              <path
                d="M24 4.2v3.6a2.4 2.4 0 0 0 0-3.6Z"
                fill="currentColor" />
            </svg>
          </span>
        </div>

        <!-- conversation header -->
        <header class="chead">
          <svg class="chead__back" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M12.5 4 6.5 10l6 6"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          <span class="chead__avatar" aria-hidden="true">
            {{ labels.contact.split(' ').map((w) => w[0]).join('').slice(0, 2) }}
          </span>
          <span class="chead__meta">
            <span class="chead__name">{{ labels.contact }}</span>
            <span class="chead__status">{{ labels.contactStatus }}</span>
          </span>
        </header>

        <!-- thread -->
        <div class="thread">
          <TransitionGroup tag="ol" name="msg" class="thread__list">
            <KirimBubble
              v-for="m in visible"
              :key="m.id"
              :message="m"
              :automatic-tag="labels.automaticTag" />
          </TransitionGroup>

          <Transition name="msg">
            <div v-if="typing" class="typing" aria-hidden="true">
              <span class="typing__bubble">
                <i></i><i></i><i></i>
              </span>
            </div>
          </Transition>
        </div>

        <!-- composer (decorative — this is a rendering of the client's phone) -->
        <div class="composer" aria-hidden="true">
          <span class="composer__field"></span>
          <span class="composer__send">
            <svg viewBox="0 0 20 20">
              <path
                d="M3 10 17 3.5 13.5 17 10 11.5 3 10Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.phone-wrap {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.phone-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
}
.phone-label__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: var(--surface-accent);
}

/* ─── Frame ─────────────────────────────────────────────────────────────── */
.phone {
  width: min(19.5rem, 100%);
  border-radius: 2.6rem;
  padding: 0.55rem;
  background: linear-gradient(
    170deg,
    var(--phone-frame-top) 0%,
    var(--phone-frame-mid) 45%,
    var(--phone-frame-bot) 100%
  );
  box-shadow:
    var(--shadow-xl),
    inset 0 0 0 1px var(--a-paper-12);
}

.phone__screen {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 32rem;
  border-radius: 2.1rem;
  overflow: hidden;
  background-color: var(--surface-sunken);
  /* Faint paper-tinted wash so the thread does not sit on flat gray */
  background-image: radial-gradient(
    120% 80% at 50% 0%,
    var(--a-green-08) 0%,
    transparent 60%
  );
}

/* ─── Status bar ────────────────────────────────────────────────────────── */
.status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5) var(--space-2);
  color: var(--text-primary);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
}
.status__island {
  flex: 1;
  max-width: 4.5rem;
  height: 1.1rem;
  border-radius: var(--radius-full);
  background-color: var(--ink-950);
}
.status__icons {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}
.status__ico {
  width: 15px;
  height: 10px;
}
.status__ico--batt {
  width: 22px;
}

/* ─── Conversation header ───────────────────────────────────────────────── */
.chead {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4) var(--space-3);
  border-bottom: 1px solid var(--border-subtle);
  background-color: var(--surface-raised);
}
.chead__back {
  width: 18px;
  height: 18px;
  flex: none;
  color: var(--text-tertiary);
}
.chead__avatar {
  display: grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  flex: none;
  border-radius: var(--radius-full);
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
  font-size: var(--text-2xs);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-wide);
}
.chead__meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.chead__name {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  line-height: 1.2;
}
.chead__status {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
}

/* ─── Thread ────────────────────────────────────────────────────────────────
   justify-content:flex-end pins the conversation to the bottom, so new
   messages push older ones up and out — exactly how a real thread behaves —
   without a scroll container that could trap the page scroll.
   ─────────────────────────────────────────────────────────────────────────── */
.thread {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-3) var(--space-2);
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, var(--brand-ink) 1.75rem);
  mask-image: linear-gradient(to bottom, transparent 0, var(--brand-ink) 1.75rem);
}
.thread__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ─── Typing indicator ──────────────────────────────────────────────────── */
.typing {
  display: flex;
  padding-left: var(--space-1);
}
.typing__bubble {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-bubble);
  border-bottom-left-radius: var(--radius-bubble-tail);
  background-color: var(--bubble-in-bg);
  border: 1px solid var(--border-subtle);
}
.typing__bubble i {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: var(--text-tertiary);
  animation: k-typing 1.1s var(--ease-in-out) infinite;
}
.typing__bubble i:nth-child(2) {
  animation-delay: 0.16s;
}
.typing__bubble i:nth-child(3) {
  animation-delay: 0.32s;
}
@keyframes k-typing {
  0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}

/* ─── Composer ──────────────────────────────────────────────────────────── */
.composer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4) var(--space-5);
}
.composer__field {
  flex: 1;
  height: 2.2rem;
  border-radius: var(--radius-full);
  background-color: var(--surface-raised);
  border: 1px solid var(--border-subtle);
}
.composer__send {
  display: grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  flex: none;
  border-radius: var(--radius-full);
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
}
.composer__send svg {
  width: 15px;
  height: 15px;
}

/* ─── Message arrival ───────────────────────────────────────────────────── */
.msg-enter-active {
  transition:
    opacity var(--dur-bubble) var(--ease-out),
    transform var(--dur-bubble) var(--ease-out);
}
.msg-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
.msg-leave-active {
  transition: opacity var(--dur-fast) var(--ease-out);
  position: absolute;
}
.msg-leave-to {
  opacity: 0;
}
.msg-move {
  transition: transform var(--dur-bubble) var(--ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .msg-enter-active,
  .msg-leave-active,
  .msg-move {
    transition: none;
  }
  .typing__bubble i {
    animation: none;
  }
}

/* ─── Responsive: the phone is the hero on mobile, not a decoration ─────── */
/* Mobile is not the desktop layout squeezed. The phone grows to fit the whole
   conversation and the page scrolls it, rather than clipping the thread to a
   fixed window where the reader would only ever see the last few messages. */
@media (max-width: 1023px) {
  .phone {
    width: min(20rem, 100%);
    border-radius: 2.3rem;
  }
  .phone__screen {
    height: auto;
    min-height: 26rem;
    border-radius: 1.9rem;
  }
  .thread {
    overflow: visible;
    -webkit-mask-image: none;
    mask-image: none;
    padding-top: var(--space-3);
  }
}
</style>
