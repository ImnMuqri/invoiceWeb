<script setup lang="ts">
/**
 * The ink panel beside each auth form. One component, four scenes, so the
 * panel keeps the same frame (eyebrow → scene → headline) from page to page:
 *
 *   feed    sign in   — what the chaser did while you were away
 *   steps   sign up   — the four steps from account to paid
 *   mail    forgot    — the reset email arriving; reminders still going out
 *   queue   reset     — the account is untouched, the next reminder still runs
 *
 * Everything shown is an illustration of real behaviour and is tagged
 * "Example" where it shows specific names or amounts.
 */
import type { AuthCopy } from '~/composables/useAuthCopy'

const props = defineProps<{
  kind: 'feed' | 'steps' | 'mail' | 'queue'
  t: AuthCopy
}>()

const tick = ref(99)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  tick.value = 0
  timer = setInterval(() => {
    tick.value = (tick.value + 1) % 10
  }, 950)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const stage = computed(() => Math.min(3, Math.floor(tick.value / 2)))

const head = computed(() => {
  const t = props.t
  switch (props.kind) {
    case 'feed':
      return { eyebrow: t.login.panelEyebrow, title: t.login.panelTitle, body: t.login.panelBody, example: true }
    case 'steps':
      return { eyebrow: t.register.panelEyebrow, title: t.register.panelTitle, body: '', example: false }
    case 'mail':
      return { eyebrow: t.forgot.panelEyebrow, title: t.forgot.panelTitle, body: t.forgot.panelBody, example: false }
    default:
      return { eyebrow: t.reset.panelEyebrow, title: t.reset.panelTitle, body: t.reset.panelBody, example: true }
  }
})
</script>

<template>
  <div class="ap__top">
    <span class="ap__eyebrow"><i class="ap__pulse"></i>{{ head.eyebrow }}</span>
    <span v-if="head.example" class="ap__tag">{{ t.shell.example }}</span>
  </div>

  <!-- sign in: activity feed -->
  <div v-if="kind === 'feed'" class="ap__scene">
    <TransitionGroup name="ap-in" tag="ul" class="feed">
      <li
        v-for="(f, i) in t.login.feed"
        v-show="tick >= i"
        :key="f.title"
        class="feed__row"
        :class="{ 'is-paid': f.paid }">
        <span class="feed__icon k-num">{{ f.icon }}</span>
        <span class="feed__text">
          <b>{{ f.title }}</b>
          <span>{{ f.detail }}</span>
        </span>
        <span class="feed__meta">
          <span class="k-num">{{ f.time }}</span>
          <span v-if="f.auto" class="feed__auto k-num">AUTO</span>
        </span>
      </li>
    </TransitionGroup>
  </div>

  <!-- sign up: four steps in a row -->
  <div v-else-if="kind === 'steps'" class="ap__scene">
    <div class="steps">
      <div class="steps__rail">
        <div class="steps__line"><div class="steps__fill" :style="{ width: `${(stage * 100) / 3}%` }"></div></div>
        <div class="steps__dots">
          <span
            v-for="(s, i) in t.register.steps"
            :key="s.title"
            class="steps__dot k-num"
            :class="{ 'is-done': i <= stage, 'is-now': i === stage }">0{{ i + 1 }}</span>
        </div>
      </div>
      <div class="steps__labels">
        <span v-for="(s, i) in t.register.steps" :key="s.title" :class="{ 'is-done': i <= stage }">
          <b>{{ s.title }}</b>
          <small class="k-num">{{ s.when }}</small>
        </span>
      </div>
    </div>
  </div>

  <!-- forgot: the reset email -->
  <div v-else-if="kind === 'mail'" class="ap__scene">
    <div class="mail">
      <div class="mail__card">
        <div class="mail__from">
          <svg viewBox="0 0 64 64" class="mail__k">
            <rect width="64" height="64" rx="15" class="mail__tile" />
            <g fill="none" class="mail__glyph" stroke-width="8.5" stroke-linecap="round">
              <path d="M21.5 15V49" />
              <path d="M25 32 42.5 17" />
              <path d="M25 32 44 47" />
            </g>
          </svg>
          <span><b>InvoKita</b><small>invo@invokita.my</small></span>
          <span class="mail__time k-num">{{ t.forgot.now }}</span>
        </div>
        <b class="mail__subject">{{ t.forgot.mailSubject }}</b>
        <span class="mail__body">{{ t.forgot.mailBody }}</span>
        <span class="mail__cta">{{ t.forgot.mailCta }}</span>
      </div>
      <span class="mail__note"><i>✓</i>{{ t.forgot.stillChasing }}</span>
    </div>
  </div>

  <!-- reset: the account is untouched, next reminder still runs -->
  <div v-else class="ap__scene">
    <p class="acct__label k-num">STUDIO KIRANA · {{ t.reset.untouched }}</p>
    <ul class="acct">
      <li v-for="s in t.reset.stats" :key="s.label">
        <span class="acct__n k-serif">{{ s.n }}</span>
        <span>{{ s.label }}</span>
      </li>
    </ul>
    <div class="queue">
      <span class="queue__dot"></span>
      <span>{{ t.reset.queue }}</span>
      <span class="queue__time k-num">09:00</span>
    </div>
  </div>

  <div class="ap__bottom">
    <h2 class="ap__title k-serif">{{ head.title }}</h2>
    <p v-if="head.body" class="ap__body">{{ head.body }}</p>
    <ul v-if="kind === 'steps'" class="ap__points">
      <li v-for="p in t.register.points" :key="p"><i>✓</i>{{ p }}</li>
    </ul>
  </div>
</template>

<style scoped>
.ap__top {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
}
.ap__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-on-slab);
  border-radius: var(--radius-full);
  background-color: var(--a-paper-08);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-on-slab-muted);
}
.ap__pulse {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background-color: var(--green-400);
  animation: ap-pulse 2s var(--ease-out) infinite;
}
@keyframes ap-pulse {
  from { box-shadow: 0 0 0 0 var(--a-green-50); }
  to { box-shadow: 0 0 0 10px transparent; }
}
.ap__tag {
  padding: 2px var(--space-3);
  border: 1px solid var(--border-on-slab);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-on-slab-muted);
}
.ap__scene {
  position: relative;
  width: 100%;
  max-width: 31rem;
  align-self: center;
}
.ap__bottom {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 31rem;
}
.ap__title {
  margin: 0;
  font-size: clamp(2.1rem, 3.2vw, 3rem);
  font-style: normal;
  line-height: 1;
  letter-spacing: -0.02em;
}
.ap__body {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-on-slab-muted);
}
.ap__points {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--text-sm);
  color: var(--text-on-slab-muted);
}
.ap__points li {
  display: flex;
  gap: var(--space-3);
}
.ap__points i {
  font-style: normal;
  font-weight: var(--weight-extrabold);
  color: var(--green-400);
}

/* feed */
.feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.feed__row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-on-slab);
  border-radius: var(--radius-lg);
  background-color: var(--a-paper-08);
}
.feed__row.is-paid {
  border-color: transparent;
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
}
.feed__icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-md);
  background-color: var(--a-paper-08);
  color: var(--green-400);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.feed__row.is-paid .feed__icon {
  background-color: var(--ink-950);
}
.feed__text {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--text-sm);
}
.feed__text span {
  font-size: var(--text-xs);
  color: var(--text-on-slab-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.feed__row.is-paid .feed__text span,
.feed__row.is-paid .feed__meta {
  color: var(--green-950);
}
.feed__meta {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--text-on-slab-muted);
}
.feed__auto {
  padding: 1px 6px;
  border-radius: var(--radius-xs);
  background-color: var(--green-800);
  color: var(--green-50);
  font-size: 0.62rem;
  font-weight: var(--weight-semibold);
}
.ap-in-enter-active {
  transition:
    opacity var(--dur-slow) var(--ease-out),
    transform var(--dur-slow) var(--ease-out);
}
.ap-in-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

/* steps */
.steps {
  padding: var(--space-6) var(--space-5) var(--space-5);
  border: 1px solid var(--border-on-slab);
  border-radius: var(--radius-xl);
  background-color: var(--a-paper-08);
}
.steps__rail {
  position: relative;
  height: 2.25rem;
}
.steps__line {
  position: absolute;
  left: 12.5%;
  right: 12.5%;
  top: calc(50% - 1px);
  height: 2px;
  background-color: var(--a-paper-12);
}
.steps__fill {
  height: 100%;
  background-color: var(--green-400);
  box-shadow: 0 0 12px var(--green-400);
  transition: width 0.9s var(--ease-in-out);
}
.steps__dots,
.steps__labels {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-2);
}
.steps__dots {
  position: absolute;
  inset: 0;
  align-items: center;
  justify-items: center;
}
.steps__dot {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 2px solid var(--a-paper-24);
  border-radius: var(--radius-full);
  background-color: var(--surface-slab);
  color: var(--text-on-slab-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  transition: all var(--dur-slow) var(--ease-out);
}
.steps__dot.is-done {
  border-color: var(--green-400);
  background-color: var(--green-400);
  color: var(--ink-950);
}
.steps__dot.is-now {
  box-shadow: 0 0 0 5px var(--a-green-20), 0 0 16px var(--green-400);
}
.steps__labels {
  margin-top: var(--space-3);
}
.steps__labels span {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-align: center;
  color: var(--ink-500);
  transition: color var(--dur-slow) var(--ease-out);
}
.steps__labels span.is-done {
  color: var(--text-on-slab);
}
.steps__labels b {
  font-size: var(--text-sm);
  line-height: 1.25;
}
.steps__labels small {
  font-size: var(--text-2xs);
  color: var(--ink-500);
}

/* mail */
.mail {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 25rem;
  margin-inline: auto;
}
.mail__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border-radius: var(--radius-xl);
  background-color: var(--receipt-bg);
  color: var(--receipt-ink);
  box-shadow: var(--shadow-xl);
  transform: rotate(-2deg);
  animation: mail 7s var(--ease-out) infinite;
}
@keyframes mail {
  0% { opacity: 0; transform: translateY(24px) rotate(-2deg); }
  10%, 85% { opacity: 1; transform: rotate(-2deg); }
  100% { opacity: 0; transform: translateY(-8px) rotate(-2deg); }
}
.mail__from {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
}
.mail__from > span:nth-child(2) {
  display: flex;
  flex-direction: column;
}
.mail__from small {
  font-size: var(--text-xs);
  color: var(--receipt-ink-muted);
}
.mail__k {
  width: 34px;
  height: 34px;
}
.mail__tile {
  fill: var(--brand-green);
}
.mail__glyph {
  stroke: var(--brand-ink);
}
.mail__time {
  margin-left: auto;
  font-size: var(--text-2xs);
  color: var(--receipt-ink-muted);
}
.mail__subject {
  font-size: var(--text-md);
  letter-spacing: -0.02em;
}
.mail__body {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--receipt-ink-muted);
}
.mail__cta {
  align-self: flex-start;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
  font-size: var(--text-sm);
  font-weight: var(--weight-extrabold);
}
.mail__note {
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-on-slab);
  border-radius: var(--radius-md);
  background-color: var(--a-paper-08);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-on-slab-muted);
}
.mail__note i {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-sm);
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
  font-style: normal;
  font-size: var(--text-xs);
  font-weight: var(--weight-extrabold);
}

/* account (reset) */
.acct__label {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  color: var(--text-on-slab-muted);
}
.acct {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
  margin: 0 0 var(--space-3);
  padding: 0;
  list-style: none;
}
.acct li {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--border-on-slab);
  border-radius: var(--radius-lg);
  background-color: var(--a-paper-08);
  font-size: var(--text-sm);
  color: var(--text-on-slab-muted);
}
.acct__n {
  font-size: 2.75rem;
  font-style: normal;
  line-height: 0.9;
  color: var(--text-on-slab);
}

/* queue */
.queue {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-lg);
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}
.queue__dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background-color: var(--ink-950);
  animation: q 2.4s var(--ease-in-out) infinite;
}
@keyframes q {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.queue__time {
  margin-left: auto;
  font-size: var(--text-xs);
}

@media (prefers-reduced-motion: reduce) {
  .ap__pulse,
  .mail__card,
  .queue__dot {
    animation: none;
  }
}
</style>
