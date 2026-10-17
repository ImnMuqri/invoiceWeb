<script setup lang="ts">
import type { ThreadMessage } from '~/composables/useThread'

defineProps<{
  message: ThreadMessage
  automaticTag: string
}>()
</script>

<template>
  <!-- SYSTEM: a status event from InvoKita, not a chat message -->
  <li v-if="message.kind === 'system'" class="row row--center">
    <p class="system">
      <svg class="system__mark" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5" />
        <path
          d="M4.8 8.2 6.9 10.3 11.2 6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
      <span>{{ message.lines?.[0] }}</span>
    </p>
  </li>

  <!-- META: delivery receipt -->
  <li v-else-if="message.kind === 'meta'" class="row row--out">
    <p class="meta">
      <span>{{ message.lines?.[0] }}</span>
      <svg class="meta__ticks" viewBox="0 0 20 12" aria-hidden="true" focusable="false">
        <path
          d="M1 6.6 4.2 9.8 10.4 2.4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round" />
        <path
          d="M8.4 6.6 11.6 9.8 17.8 2.4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </p>
  </li>

  <!-- INVOICE CARD -->
  <li v-else-if="message.kind === 'invoice'" class="row row--out">
    <div class="bubble bubble--out bubble--invoice">
      <div class="invoice">
        <div class="invoice__head">
          <span class="invoice__num k-num">{{ message.invoice?.number }}</span>
          <span class="invoice__biz">{{ message.invoice?.business }}</span>
        </div>
        <p class="invoice__amount k-num">{{ message.invoice?.amount }}</p>
        <p class="invoice__due">{{ message.invoice?.due }}</p>
        <p class="invoice__action" aria-hidden="true">
          {{ message.invoice?.action }}
        </p>
      </div>
      <time v-if="message.time" class="bubble__time">{{ message.time }}</time>
    </div>
  </li>

  <!-- TEXT -->
  <li v-else class="row" :class="message.side === 'in' ? 'row--in' : 'row--out'">
    <div class="stack">
      <p v-if="message.automatic" class="autotag">
        <svg class="autotag__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <circle cx="8" cy="8" r="6.4" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path
            d="M8 4.6V8l2.3 1.6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
        {{ automaticTag }}
      </p>
      <div
        class="bubble"
        :class="message.side === 'in' ? 'bubble--in' : 'bubble--out'">
        <p
          v-for="(line, i) in message.lines"
          :key="i"
          class="bubble__line"
          :class="{ 'bubble__line--sender': i === 0 && message.lines!.length > 1 }">
          {{ line }}
        </p>
        <time v-if="message.time" class="bubble__time">{{ message.time }}</time>
      </div>
    </div>
  </li>
</template>

<style scoped>
.row {
  display: flex;
  width: 100%;
}
.row--out {
  justify-content: flex-end;
}
.row--in {
  justify-content: flex-start;
}
.row--center {
  justify-content: center;
}

.stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
  max-width: 88%;
}
.row--in .stack {
  align-items: flex-start;
}

/* ─── Bubbles ─────────────────────────────────────────────────────────────
   Outgoing uses green-100 (a tint of --brand-green) rather than the locked
   green itself: --brand-green as a bubble fill would force white or ink text
   at 3.77:1 / 4.70:1, and at 14px inside a phone that is too tight. The tint
   carries --text-primary at 14:1+.
   ───────────────────────────────────────────────────────────────────────── */
.bubble {
  position: relative;
  max-width: 100%;
  padding: var(--space-3) var(--space-4) var(--space-2);
  border-radius: var(--radius-bubble);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  box-shadow: var(--shadow-xs);
  overflow-wrap: anywhere;
}

.bubble--out {
  background-color: var(--bubble-out-bg);
  color: var(--bubble-out-text);
  border-bottom-right-radius: var(--radius-bubble-tail);
}
.bubble--in {
  background-color: var(--bubble-in-bg);
  color: var(--bubble-in-text);
  border: 1px solid var(--border-subtle);
  border-bottom-left-radius: var(--radius-bubble-tail);
}


.bubble__line + .bubble__line {
  margin-top: var(--space-2);
}
.bubble__line--sender {
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--text-accent);
  letter-spacing: var(--tracking-tight);
}

.bubble__time {
  display: block;
  margin-top: var(--space-1);
  text-align: right;
  font-size: var(--text-2xs);
  font-variant-numeric: tabular-nums;
  color: var(--text-tertiary);
}
.bubble--in .bubble__time {
  text-align: left;
}

/* ─── "Sent automatically" chip — the whole product in two words ────────── */
.autotag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 3px var(--space-2) 3px var(--space-1);
  border-radius: var(--radius-full);
  background-color: var(--surface-accent-soft);
  color: var(--text-accent);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
.autotag__icon {
  width: 12px;
  height: 12px;
  flex: none;
}

/* ─── Invoice card ──────────────────────────────────────────────────────── */
.bubble--invoice {
  padding: var(--space-2) var(--space-2) var(--space-2);
  width: 15rem;
  max-width: 88%;
}
.invoice {
  border-radius: var(--radius-md);
  background-color: var(--invoice-card-bg);
  border: 1px solid var(--border-subtle);
  padding: var(--space-4);
}
.invoice__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.invoice__num {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  color: var(--text-tertiary);
}
.invoice__biz {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
  text-align: right;
}
.invoice__amount {
  font-size: var(--text-xl);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  line-height: 1.1;
  color: var(--text-primary);
}
.invoice__due {
  margin-top: 2px;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
.invoice__action {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-subtle);
  text-align: center;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--text-accent);
}

/* ─── System event ──────────────────────────────────────────────────────── */
.system {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  max-width: 92%;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  background-color: var(--surface-accent-soft);
  color: var(--text-accent);
  font-size: var(--text-2xs);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-normal);
  text-align: center;
}
.system__mark {
  width: 14px;
  height: 14px;
  flex: none;
}

/* ─── Delivery receipt ──────────────────────────────────────────────────── */
.meta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding-right: var(--space-2);
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
}
.meta__ticks {
  width: 16px;
  height: 10px;
  color: var(--text-accent);
}
</style>
