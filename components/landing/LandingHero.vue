<script setup lang="ts">
/**
 * Hero — the whole product in one loop.
 *
 * An ink slab with a centred promise and, under it, the chase track: one
 * invoice moving through Sent → Overdue → Reminder → Paid. The cards above the
 * track are the same example thread the rest of the page uses (useThread.ts),
 * so the reminder text is the product's real default template, verbatim.
 *
 * The slab sits behind the sticky nav (negative top margin), and LandingNav
 * switches to its on-slab colours until the page scrolls.
 *
 * Motion: the track advances on a 1.1s beat and loops. Reduced motion skips
 * straight to the finished state so the argument still completes.
 */
import type { Locale, LandingCopy } from '~/composables/useLandingCopy'
import { useThread } from '~/composables/useThread'

const props = defineProps<{ copy: LandingCopy; locale: Locale }>()

const { messages, labels } = useThread(props.locale)
const byId = (id: string) => messages.find((m) => m.id === id)
const invoice = byId('m0')?.invoice
const reminder = byId('m3')?.lines?.[1] ?? ''
const reply = byId('m5')?.lines?.[0] ?? ''
const cancelled = byId('m7')?.lines?.[0] ?? ''

const GATEWAYS = [
  { name: 'Billplz', logo: '/gateways/billplz.png' },
  { name: 'ToyyibPay', logo: '/gateways/toyyibpay.jpg' },
  { name: 'HitPay', logo: '/gateways/hitpay.png' },
  { name: 'senangPay', logo: '' },
]

/* 0 sent · 1 overdue · 2 reminder · 3 paid */
const tick = ref(0)
const stage = computed(() => (tick.value >= 6 ? 3 : tick.value >= 4 ? 2 : tick.value >= 2 ? 1 : 0))
const fill = computed(() => `${(stage.value * 100) / 3}%`)

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tick.value = 6
    return
  }
  timer = setInterval(() => {
    tick.value = (tick.value + 1) % 11
  }, 1100)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <section class="hero k-grain-host" aria-labelledby="hero-title">
    <KirimGrain id="hero" :opacity="0.22" />
    <div class="hero__glow" aria-hidden="true"></div>

    <div class="hero__inner k-container k-container--wide">
      <p class="hero__eyebrow">
        <span class="hero__pin" aria-hidden="true"></span>
        {{ copy.hero.eyebrow }}
      </p>

      <h1 id="hero-title" class="hero__title">
        <span class="hero__lead-line">{{ copy.hero.titleLead }}</span>
        <span class="k-serif hero__serif">{{ copy.hero.titleSerif }}</span>
      </h1>

      <p class="hero__body">{{ copy.hero.lead }}</p>

      <div class="hero__actions">
        <a href="/register" class="k-btn k-btn--primary k-btn--lg hero__cta">
          {{ copy.hero.ctaPrimary }}
          <svg class="hero__arrow" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M4 10h11M10.5 5.5 15 10l-4.5 4.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </a>
        <a href="#payments" class="hero__ghost">{{ copy.hero.ctaSecondary }}</a>
      </div>
      <p class="hero__note">{{ copy.hero.ctaNote }}</p>

      <!-- Chase track -->
      <div class="track" role="img" :aria-label="`${labels.label}: ${copy.hero.track.stops.map((s) => s.event).join(', ')}`">
        <div class="track__scroll">
          <div class="track__head" aria-hidden="true">
            <span class="track__id">{{ invoice?.number }} · {{ invoice?.business?.toUpperCase() }} → {{ labels.contact.toUpperCase() }}</span>
            <span class="track__tag">{{ labels.label }}</span>
          </div>

          <div class="track__cards" aria-hidden="true">
            <div class="track__cell">
              <Transition name="pop">
                <div v-if="stage >= 0" class="tc tc--invoice">
                  <div class="tc__row tc__meta"><b>{{ invoice?.business }}</b><span class="k-num">{{ invoice?.number }}</span></div>
                  <div class="tc__amount k-num">{{ invoice?.amount }}</div>
                  <div class="tc__btn">{{ invoice?.action }}</div>
                </div>
              </Transition>
            </div>
            <div class="track__cell">
              <Transition name="pop">
                <div v-if="stage >= 1" class="tc tc--overdue">
                  <span class="tc__chip">{{ copy.hero.track.overdue }}</span>
                  <span class="tc__text">{{ copy.hero.track.overdueBody }}</span>
                </div>
              </Transition>
            </div>
            <div class="track__cell">
              <Transition name="pop">
                <div v-if="stage >= 2" class="tc tc--bubble">
                  <span class="tc__auto">{{ labels.automaticTag }}</span>
                  <span class="tc__text">{{ reminder }}</span>
                </div>
              </Transition>
            </div>
            <div class="track__cell">
              <Transition name="pop">
                <div v-if="stage >= 3" class="tc__stack">
                  <div class="tc tc--reply">{{ reply }}</div>
                  <div class="tc tc--paid">
                    <span class="tc__paid-label">{{ copy.hero.track.paidVia }}</span>
                    <span class="tc__paid-amount k-num">+ RM <span class="count"></span>.00</span>
                    <span class="tc__paid-note">{{ cancelled }}</span>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <div class="track__rail" aria-hidden="true">
            <div class="track__line"><div class="track__fill" :style="{ width: fill }"></div></div>
            <div class="track__stops">
              <span
                v-for="(s, i) in copy.hero.track.stops"
                :key="s.event"
                class="stop"
                :class="{ 'is-done': stage >= i, 'is-now': stage === i, 'is-warn': i === 1 }"></span>
            </div>
          </div>

          <ol class="track__labels">
            <li v-for="(s, i) in copy.hero.track.stops" :key="s.event" :class="{ 'is-done': stage >= i }">
              <span class="track__date k-num">{{ s.date }}</span>
              <span class="track__event">{{ s.event }}</span>
            </li>
          </ol>
        </div>
      </div>

      <!-- Proof: real integrations, not a fake metric. -->
      <div class="proof">
        <p class="proof__label">{{ copy.hero.proofLabel }}</p>
        <ul class="proof__list">
          <li v-for="g in GATEWAYS" :key="g.name" class="proof__item">
            <img v-if="g.logo" :src="g.logo" alt="" width="24" height="24" loading="lazy" />
            {{ g.name }}
          </li>
        </ul>
        <p class="proof__alt">
          {{ copy.hero.noGateway }}
          <a href="#payments">{{ copy.hero.noGatewayLink }}</a>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  /* Sit behind the sticky nav so the slab reaches the top of the viewport. */
  margin-top: -4.25rem;
  padding-block: calc(4.25rem + clamp(3rem, 7vw, 5rem)) clamp(4rem, 8vw, 6rem);
  background-color: var(--surface-slab);
  color: var(--text-on-slab);
  text-align: center;
}

.hero__glow {
  position: absolute;
  z-index: -1;
  left: 50%;
  top: -26rem;
  width: 48rem;
  height: 48rem;
  margin-left: -24rem;
  border-radius: var(--radius-full);
  background: radial-gradient(circle, var(--a-green-32) 0%, transparent 62%);
}

.hero__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.hero__eyebrow {
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
.hero__pin {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background-color: var(--green-400);
  animation: pin 2s var(--ease-out) infinite;
}
@keyframes pin {
  from { box-shadow: 0 0 0 0 var(--a-green-50); }
  to { box-shadow: 0 0 0 12px transparent; }
}

.hero__title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin: 0;
  max-width: 100%;
  text-wrap: balance;
}
.hero__lead-line {
  font-size: clamp(2.6rem, 6.6vw, 5.75rem);
  font-weight: var(--weight-extrabold);
  line-height: 1;
  letter-spacing: -0.05em;
}
/* The serif is one of exactly two appearances on the page. */
.hero__serif {
  font-size: clamp(3.1rem, 8vw, 7.25rem);
  line-height: 1.02;
  color: var(--text-on-slab-accent);
}

.hero__body {
  max-width: 39rem;
  margin: 0;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--text-on-slab-muted);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
}
.hero__cta {
  box-shadow: 0 0 0 6px var(--a-green-20);
}
.hero__arrow {
  width: 1.1rem;
  height: 1.1rem;
}
.hero__ghost {
  display: inline-flex;
  align-items: center;
  padding: 0 var(--space-5);
  min-height: 3.25rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-on-slab);
  color: var(--text-on-slab);
  font-weight: var(--weight-semibold);
  text-decoration: none;
  transition: background-color var(--dur-fast) var(--ease-out);
}
.hero__ghost:hover {
  background-color: var(--a-paper-08);
}
.hero__note {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-on-slab-muted);
}

/* ── Chase track ─────────────────────────────────────────── */
.track {
  width: 100%;
  margin-top: var(--space-8);
  border: 1px solid var(--border-on-slab);
  border-radius: var(--radius-2xl);
  background: linear-gradient(180deg, var(--a-paper-08), transparent);
  text-align: left;
  overflow-x: auto;
}
.track__scroll {
  min-width: 52rem;
  padding: var(--space-6) var(--space-6) var(--space-7);
}
.track__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-5);
  font-size: var(--text-xs);
  color: var(--text-on-slab-muted);
}
.track__id {
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
}
.track__tag {
  padding: 2px var(--space-3);
  border: 1px solid var(--border-on-slab);
  border-radius: var(--radius-full);
  font-weight: var(--weight-semibold);
}

.track__cards,
.track__stops,
.track__labels {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-5);
}
.track__cards {
  align-items: end;
  min-height: 11rem;
}
.track__cell {
  display: flex;
  justify-content: center;
}

.tc {
  width: 100%;
  max-width: 15rem;
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  box-shadow: var(--shadow-lg);
}
.tc__row {
  display: flex;
  justify-content: space-between;
}
.tc__meta {
  font-size: var(--text-2xs);
  color: var(--receipt-ink-muted);
}
.tc--invoice {
  background-color: var(--receipt-bg);
  color: var(--receipt-ink);
}
.tc__amount {
  white-space: nowrap;
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
}
.tc__btn {
  text-align: center;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
}
.tc--overdue {
  background-color: var(--a-clay-16);
  border: 1px solid var(--a-clay-32);
  box-shadow: none;
}
.tc__chip {
  align-self: flex-start;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  background-color: var(--clay-300);
  color: var(--ink-950);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
}
.tc__text {
  font-size: var(--text-xs);
  line-height: var(--leading-snug);
}
.tc--overdue .tc__text {
  color: var(--clay-100);
}
.tc--bubble {
  background-color: var(--bubble-out-bg);
  color: var(--bubble-out-text);
  border-radius: var(--radius-bubble) var(--radius-bubble) var(--radius-bubble-tail) var(--radius-bubble);
  box-shadow: 0 0 0 2px var(--green-400), var(--shadow-lg);
}
.tc__auto {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  color: var(--text-accent);
}
.tc__stack {
  width: 100%;
  max-width: 15rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.tc--reply {
  align-self: flex-start;
  width: auto;
  padding: var(--space-2) var(--space-3);
  background-color: var(--bubble-in-bg);
  color: var(--bubble-in-text);
  border-radius: var(--radius-bubble) var(--radius-bubble) var(--radius-bubble) var(--radius-bubble-tail);
  font-size: var(--text-xs);
}
.tc--paid {
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
  gap: 2px;
}
.tc__paid-label {
  font-size: var(--text-2xs);
  font-weight: var(--weight-extrabold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.tc__paid-amount {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
}
.tc__paid-note {
  font-size: var(--text-2xs);
  font-weight: var(--weight-semibold);
}

/* Count-up: an animatable integer custom property, no JS frame loop. */
@property --kn {
  syntax: '<integer>';
  initial-value: 0;
  inherits: false;
}
.count {
  counter-reset: kn var(--kn);
  animation: count 1.3s var(--ease-out) forwards;
}
.count::after {
  content: counter(kn);
}
@keyframes count {
  to { --kn: 2400; }
}

.track__rail {
  position: relative;
  height: 2.75rem;
  margin-top: var(--space-4);
}
.track__line {
  position: absolute;
  left: 12.5%;
  right: 12.5%;
  top: calc(50% - 1px);
  height: 2px;
  background-color: var(--a-paper-12);
}
.track__fill {
  height: 100%;
  background-color: var(--green-400);
  box-shadow: 0 0 14px var(--green-400);
  transition: width 1s var(--ease-in-out);
}
.track__stops {
  position: absolute;
  inset: 0;
  align-items: center;
  justify-items: center;
}
.stop {
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  border: 2px solid var(--a-paper-24);
  background-color: var(--surface-slab);
  transition: all var(--dur-slow) var(--ease-out);
}
.stop.is-done {
  border-color: var(--green-400);
  background-color: var(--green-400);
}
.stop.is-warn.is-done {
  border-color: var(--clay-300);
  background-color: var(--clay-300);
}
.stop.is-now {
  box-shadow: 0 0 0 6px var(--a-green-20), 0 0 18px var(--green-400);
}

.track__labels {
  margin: var(--space-2) 0 0;
  padding: 0;
  list-style: none;
}
.track__labels li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}
.track__date {
  font-size: var(--text-xs);
  color: var(--text-on-slab-muted);
}
.track__event {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--ink-500);
  transition: color var(--dur-slow) var(--ease-out);
}
.track__labels li.is-done .track__event {
  color: var(--text-on-slab);
}

.pop-enter-active {
  transition:
    opacity var(--dur-slow) var(--ease-out),
    transform var(--dur-slow) var(--ease-out);
}
.pop-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}
.pop-leave-active {
  transition: opacity var(--dur-fast) var(--ease-out);
}
.pop-leave-to {
  opacity: 0;
}

/* ── Proof ───────────────────────────────────────────────── */
.proof {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-3) var(--space-5);
  margin-top: var(--space-3);
}
.proof__label {
  margin: 0;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-on-slab-muted);
}
.proof__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.proof__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 2.25rem;
  padding: 0 var(--space-3);
  border: 1px solid var(--border-on-slab);
  border-radius: var(--radius-md);
  background-color: var(--a-paper-08);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.proof__item img {
  width: 24px;
  height: 24px;
  margin-left: calc(var(--space-2) * -1);
  border-radius: var(--radius-xs);
  object-fit: contain;
  background-color: var(--paper-25);
}
.proof__alt {
  flex-basis: 100%;
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-on-slab-muted);
}
.proof__alt a {
  color: var(--text-on-slab-accent);
  font-weight: var(--weight-bold);
  text-underline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .hero__pin,
  .count {
    animation: none;
  }
  .count {
    --kn: 2400;
  }
}
</style>
