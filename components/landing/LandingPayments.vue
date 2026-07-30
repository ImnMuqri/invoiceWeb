<script setup lang="ts">
/**
 * Objection 3 — "can my customer actually pay it, and is my money safe?"
 *
 * The one full ink slab in the middle of the page. It breaks the warm-paper
 * rhythm exactly once, at the moment the page talks about money custody, which
 * is where the reader most needs the page to feel solid.
 */
import type { LandingCopy } from '~/composables/useLandingCopy'

defineProps<{ copy: LandingCopy }>()

const GATEWAYS = ['Billplz', 'ToyyibPay', 'HitPay', 'senangPay']
</script>

<template>
  <section
    id="payments"
    class="pay k-section k-section--inverse k-section--loose k-grain-host"
    aria-labelledby="pay-title">
    <KirimGrain id="pay" :opacity="0.2" />

    <div class="k-container k-container--wide pay__inner">
      <div class="pay__top">
        <header class="pay__head" data-reveal>
          <p class="k-eyebrow pay__eyebrow">{{ copy.payments.eyebrow }}</p>
          <h2 id="pay-title" class="k-headline pay__title"><KirimText :text="copy.payments.title" /></h2>
          <p class="k-lead pay__lead">{{ copy.payments.lead }}</p>
        </header>

        <div class="pay__gateways" data-reveal>
          <p class="pay__gateways-label">{{ copy.payments.gatewaysLabel }}</p>
          <ul class="pay__gateways-list">
            <li v-for="g in GATEWAYS" :key="g" class="gw">
              <span class="gw__dot" aria-hidden="true"></span>
              {{ g }}
            </li>
          </ul>
        </div>
      </div>

      <hr class="pay__rule" />

      <!-- Reconciliation flow -->
      <div class="recon">
        <h3 class="k-title recon__title" data-reveal>{{ copy.payments.reconTitle }}</h3>
        <ol class="recon__list">
          <li
            v-for="(r, i) in copy.payments.reconSteps"
            :key="r.label"
            class="recon__item"
            data-reveal
            data-reveal-group="recon">
            <div class="recon__marker" aria-hidden="true">
              <span class="recon__dot"></span>
              <span v-if="i < copy.payments.reconSteps.length - 1" class="recon__line"></span>
            </div>
            <div class="recon__body">
              <p class="recon__label">{{ r.label }}</p>
              <p class="recon__text">{{ r.body }}</p>
            </div>
          </li>
        </ol>
      </div>

      <hr class="pay__rule" />

      <!-- Local specifics -->
      <div class="local">
        <h3 class="k-title local__title" data-reveal>{{ copy.payments.localTitle }}</h3>
        <ul class="local__grid">
          <li
            v-for="p in copy.payments.localPoints"
            :key="p.title"
            class="local__item"
            data-reveal
            data-reveal-group="local">
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
}
.pay__inner {
  position: relative;
  z-index: 1;
}

.pay__eyebrow {
  color: var(--text-on-slab-accent);
}

.pay__top {
  display: grid;
  gap: clamp(2.5rem, 5vw, 3.5rem);
  margin-bottom: clamp(2.5rem, 5vw, 4rem);
}
.pay__head {
  max-width: 40rem;
}
.pay__title {
  margin-block: var(--space-4) var(--space-5);
}

.pay__gateways-label {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-on-slab-muted);
  margin-bottom: var(--space-4);
}
.pay__gateways-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
.gw {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border: 1px solid var(--border-on-slab);
  border-radius: var(--radius-full);
  background-color: var(--chip-on-slab-bg);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-on-slab);
}
.gw__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: var(--text-on-slab-accent);
}

.pay__rule {
  border: 0;
  border-top: 1px solid var(--border-on-slab);
  margin-block: clamp(2.5rem, 5vw, 4rem);
}

/* ─── Reconciliation ────────────────────────────────────────────────────── */
.recon__title {
  color: var(--text-on-slab);
  margin-bottom: var(--space-7);
}
.recon__list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}
.recon__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-4);
}
.recon__marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}
.recon__dot {
  width: 11px;
  height: 11px;
  margin-top: 6px;
  border-radius: var(--radius-full);
  background-color: var(--text-on-slab-accent);
  box-shadow: 0 0 0 5px var(--a-green-20);
  flex: none;
}
.recon__line {
  flex: 1;
  width: 1.5px;
  background: linear-gradient(to bottom, var(--a-green-32), var(--border-on-slab));
}
.recon__body {
  padding-bottom: var(--space-7);
}
.recon__label {
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-on-slab);
  margin-bottom: var(--space-2);
}
.recon__text {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-on-slab-muted);
  max-width: 34rem;
}

/* ─── Local specifics ───────────────────────────────────────────────────── */
.local__title {
  color: var(--text-on-slab);
  margin-bottom: var(--space-7);
}
.local__grid {
  display: grid;
  gap: var(--space-6);
  margin: 0;
  padding: 0;
  list-style: none;
}
.local__item {
  padding-top: var(--space-5);
  border-top: 2px solid var(--a-green-32);
}
.local__item-title {
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-on-slab);
  margin-bottom: var(--space-2);
}
.local__item-body {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-on-slab-muted);
}

/* ─── Breakpoints ───────────────────────────────────────────────────────── */
@media (min-width: 768px) {
  .local__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-6);
  }
  .recon__list {
    gap: 0;
  }
}

@media (min-width: 1024px) {
  .pay__top {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    align-items: end;
    gap: clamp(3rem, 6vw, 5rem);
  }
  .recon {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: clamp(2rem, 5vw, 4rem);
    align-items: start;
  }
  .recon__title {
    margin-bottom: 0;
    position: sticky;
    top: 7rem;
  }
  .local {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: clamp(2rem, 5vw, 4rem);
    align-items: start;
  }
  .local__title {
    margin-bottom: 0;
  }
}
</style>
