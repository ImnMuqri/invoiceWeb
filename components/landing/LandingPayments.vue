<script setup lang="ts">
/**
 * Objection — "can my customer actually pay it, and is my money safe?"
 *
 * Ink slab. Three beats:
 *   1. the custody promise ("it goes to your account, we never hold it"),
 *   2. a slow logo loop of the gateways and rails the client can pay through,
 *   3. what happens the moment they pay, as three numbered steps on a line a
 *      light runs along, then the local specifics as three cards.
 *
 * The loop is decorative repetition of a list that is also in the hero, so
 * the duplicated half is aria-hidden; screen readers hear each name once.
 */
import type { LandingCopy } from '~/composables/useLandingCopy'

defineProps<{ copy: LandingCopy }>()

const RAILS = [
  { name: 'Billplz', logo: '/gateways/billplz.png' },
  { name: 'ToyyibPay', logo: '/gateways/toyyibpay.jpg' },
  { name: 'HitPay', logo: '/gateways/hitpay.png' },
  { name: 'senangPay', logo: '' },
  { name: 'DuitNow QR', logo: '/duitnowLogo.png' },
  { name: 'FPX', logo: '' },
]
const LOCAL_TAGS = ['MYR', 'SST', 'QR · FPX']
</script>

<template>
  <section
    id="payments"
    class="pay k-section k-section--inverse k-section--loose k-grain-host"
    aria-labelledby="pay-title">
    <KirimGrain id="pay" :opacity="0.2" />
    <div class="pay__grid" aria-hidden="true"></div>

    <div class="k-container k-container--wide pay__inner">
      <header class="pay__head" data-reveal>
        <p class="k-eyebrow pay__eyebrow">{{ copy.payments.eyebrow }}</p>
        <h2 id="pay-title" class="k-headline pay__title"><KirimText :text="copy.payments.title" /></h2>
        <p class="k-lead pay__lead">{{ copy.payments.lead }}</p>
      </header>

      <!-- Logo loop -->
      <div class="loop" data-reveal>
        <p class="k-sr">{{ copy.payments.gatewaysLabel }}: {{ RAILS.map((r) => r.name).join(', ') }}</p>
        <div class="loop__row" aria-hidden="true">
          <template v-for="half in 2" :key="half">
            <span v-for="r in RAILS" :key="`${half}-${r.name}`" class="rail">
              <img v-if="r.logo" :src="r.logo" alt="" width="40" height="40" loading="lazy" />
              <span v-else class="rail__pad"></span>
              {{ r.name }}
            </span>
          </template>
        </div>
      </div>

      <!-- What happens the moment they pay -->
      <div class="recon">
        <h3 class="recon__title" data-reveal>{{ copy.payments.reconTitle }}</h3>
        <div class="recon__wrap">
          <div class="recon__line" aria-hidden="true"></div>
          <ol class="recon__list">
            <li
              v-for="(r, i) in copy.payments.reconSteps"
              :key="r.label"
              class="recon__item"
              data-reveal
              data-reveal-group="recon">
              <span class="recon__n k-num" :class="{ 'is-last': i === copy.payments.reconSteps.length - 1 }">0{{ i + 1 }}</span>
              <p class="recon__label">{{ r.label }}</p>
              <p class="recon__text">{{ r.body }}</p>
            </li>
          </ol>
        </div>
      </div>

      <!-- Local specifics -->
      <div class="local">
        <h3 class="k-sr">{{ copy.payments.localTitle }}</h3>
        <ul class="local__grid">
          <li
            v-for="(p, i) in copy.payments.localPoints"
            :key="p.title"
            class="local__item"
            data-reveal
            data-reveal-group="local">
            <span class="local__tag k-num">{{ LOCAL_TAGS[i] }}</span>
            <h4 class="local__item-title">{{ p.title }}</h4>
            <p class="local__item-body">{{ p.body }}</p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pay {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}
.pay__grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(var(--a-paper-08) 1px, transparent 1px),
    linear-gradient(90deg, var(--a-paper-08) 1px, transparent 1px);
  background-size: 56px 56px;
  opacity: 0.6;
  -webkit-mask-image: radial-gradient(80% 70% at 30% 20%, var(--brand-ink) 20%, transparent 80%);
  mask-image: radial-gradient(80% 70% at 30% 20%, var(--brand-ink) 20%, transparent 80%);
  pointer-events: none;
}
.pay__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: clamp(3rem, 6vw, 4.5rem);
}

.pay__head {
  max-width: 48rem;
}
.pay__eyebrow {
  color: var(--text-on-slab-accent);
}
.pay__title {
  margin-block: var(--space-4) var(--space-5);
}

/* ── Logo loop ─────────────────────────────────────────── */
.loop {
  overflow: hidden;
  margin-inline: calc(var(--gutter, 1.5rem) * -1);
  -webkit-mask-image: linear-gradient(90deg, transparent, var(--brand-ink) 10%, var(--brand-ink) 90%, transparent);
  mask-image: linear-gradient(90deg, transparent, var(--brand-ink) 10%, var(--brand-ink) 90%, transparent);
}
.loop__row {
  display: flex;
  gap: var(--space-4);
  width: max-content;
  animation: loop 28s linear infinite;
}
.loop:hover .loop__row {
  animation-play-state: paused;
}
@keyframes loop {
  to { transform: translateX(calc(-50% - var(--space-4) / 2)); }
}
.rail {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  height: 4rem;
  padding: 0 var(--space-6) 0 var(--space-3);
  border-radius: var(--radius-xl);
  background-color: var(--paper-50);
  color: var(--ink-950);
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
  white-space: nowrap;
}
.rail img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  object-fit: contain;
}
.rail__pad {
  width: var(--space-2);
}

/* ── Reconciliation ────────────────────────────────────── */
.recon__title {
  margin: 0 0 var(--space-6);
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
}
.recon__wrap {
  position: relative;
}
/* The line a light runs along, through the three markers. */
.recon__line {
  position: absolute;
  left: 0;
  right: 0;
  top: 1.5rem;
  height: 2px;
  background-color: var(--a-paper-12);
  background-image: linear-gradient(90deg, transparent, var(--green-400), transparent);
  background-size: 40% 100%;
  background-repeat: no-repeat;
  animation: flow 2.6s linear infinite;
}
@keyframes flow {
  from { background-position: -40% 0; }
  to { background-position: 140% 0; }
}
.recon__list {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: var(--space-6);
  margin: 0;
  padding: 0;
  list-style: none;
}
.recon__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.recon__n {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--ink-800);
  background-color: var(--ink-900);
  color: var(--green-400);
  font-weight: var(--weight-semibold);
}
.recon__n.is-last {
  border-color: transparent;
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
}
.recon__label {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
}
.recon__text {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-on-slab-muted);
}

/* ── Local cards ───────────────────────────────────────── */
.local__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.local__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-6);
  border: 1px solid var(--ink-800);
  border-radius: var(--radius-xl);
  transition: border-color var(--dur-base) var(--ease-out);
}
.local__item:hover {
  border-color: var(--green-700);
}
.local__tag {
  font-size: var(--text-xs);
  color: var(--green-400);
}
.local__item-title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
}
.local__item-body {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-on-slab-muted);
}

@media (prefers-reduced-motion: reduce) {
  .loop__row,
  .recon__line {
    animation: none;
  }
}
</style>
