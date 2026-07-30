<script setup lang="ts">
/**
 * The torn-receipt device, carried over from the RECEIPT PRINTER direction.
 *
 * It earns its place here specifically: this section's job is to prove the
 * chaser did work while the owner was elsewhere, and a printed audit log is
 * the most credible possible form for that claim. The "TIMES YOU HAD TO ASK:
 * NONE" line is the whole product argument in five words.
 *
 * Motion stays on the KIRIM cadence (fade + 14px rise) rather than borrowing
 * the mechanical typewriter motion of Direction B — one motion philosophy per
 * page, or the reveals stop feeling like one system.
 */
import type { LandingCopy } from '~/composables/useLandingCopy'

defineProps<{ copy: LandingCopy }>()

/* Torn paper edge, generated. 24 teeth, 10px deep, top and bottom. */
const TEETH = 24
const DEPTH = 10
const clipPath = computed(() => {
  const step = 100 / TEETH
  const top: string[] = []
  const bottom: string[] = []
  for (let i = 0; i <= TEETH; i++) {
    const x = +(i * step).toFixed(3)
    top.push(`${x}% ${i % 2 === 0 ? `${DEPTH}px` : '0px'}`)
  }
  for (let i = TEETH; i >= 0; i--) {
    const x = +(i * step).toFixed(3)
    bottom.push(`${x}% ${i % 2 === 0 ? `calc(100% - ${DEPTH}px)` : '100%'}`)
  }
  return `polygon(${[...top, ...bottom].join(', ')})`
})
</script>

<template>
  <section class="chaser k-section k-section--tight" aria-labelledby="chaser-title">
    <div class="k-container chaser__inner">
      <header class="chaser__head" data-reveal>
        <p class="k-eyebrow">{{ copy.chaser.eyebrow }}</p>
        <h2 id="chaser-title" class="k-headline chaser__title"><KirimText :text="copy.chaser.title" /></h2>
        <p class="k-lead chaser__lead">{{ copy.chaser.lead }}</p>
        <p class="chaser__foot">{{ copy.chaser.footnote }}</p>
      </header>

      <figure class="chaser__figure" data-reveal>
        <div class="receipt" :style="{ clipPath }">
          <div class="receipt__paper">
            <header class="receipt__head">
              <p class="receipt__title">{{ copy.chaser.receiptTitle }}</p>
              <p class="receipt__sub">{{ copy.chaser.receiptSub }}</p>
            </header>

            <div class="receipt__divider" aria-hidden="true"></div>

            <ol class="receipt__log">
              <li v-for="(row, i) in copy.chaser.log" :key="i" class="entry">
                <div class="entry__stamp k-num">
                  <span>{{ row.date }}</span>
                  <span>{{ row.time }}</span>
                </div>
                <div class="entry__main">
                  <p class="entry__event">
                    {{ row.event }}
                    <span
                      class="entry__by"
                      :class="row.by === copy.chaser.byAuto ? 'entry__by--auto' : 'entry__by--you'">
                      {{ row.by }}
                    </span>
                  </p>
                  <p class="entry__detail k-num">{{ row.detail }}</p>
                </div>
              </li>
            </ol>

            <div class="receipt__divider" aria-hidden="true"></div>

            <p class="receipt__total">
              <span class="receipt__total-label">{{ copy.chaser.totalLabel }}</span>
              <span class="receipt__total-value">{{ copy.chaser.totalValue }}</span>
            </p>

            <p class="receipt__barcode" aria-hidden="true">
              <span v-for="n in 42" :key="n" :style="{ '--w': (n % 4) + 1 }"></span>
            </p>
          </div>
        </div>
        <figcaption class="chaser__caption">{{ copy.chaser.receiptNote }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.chaser__inner {
  display: grid;
  gap: clamp(2.5rem, 6vw, 4rem);
}

.chaser__head {
  max-width: var(--measure);
}
.chaser__title {
  margin-block: var(--space-4) var(--space-5);
}
.chaser__foot {
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-default);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-tertiary);
  max-width: 30rem;
}

.chaser__figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

/* ─── The paper ─────────────────────────────────────────────────────────── */
.receipt {
  width: min(24rem, 100%);
  background-color: var(--receipt-bg);
  box-shadow: var(--shadow-lg);
  /* clip-path is bound inline — teeth are generated, not hand-authored */
}

.receipt__paper {
  padding: calc(var(--space-7) + 10px) var(--space-6) calc(var(--space-6) + 10px);
  font-family: var(--font-mono);
  /* Thermal-print ink is never pure black; ink-900 on paper is 11:1 */
  color: var(--receipt-ink);
  font-size: var(--text-2xs);
  line-height: 1.55;
  letter-spacing: 0.01em;
  /* faint print banding */
  background-image: repeating-linear-gradient(
    to bottom,
    var(--a-ink-04) 0 1px,
    transparent 1px 4px
  );
}

.receipt__head {
  text-align: center;
}
.receipt__title {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.16em;
}
.receipt__sub {
  margin-top: 2px;
  letter-spacing: 0.14em;
  color: var(--receipt-ink-muted);
}

.receipt__divider {
  margin-block: var(--space-4);
  border-top: 1.5px dashed var(--receipt-rule);
}

.receipt__log {
  display: grid;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.entry {
  display: grid;
  grid-template-columns: 4.6rem minmax(0, 1fr);
  gap: var(--space-2);
}
.entry__stamp {
  display: flex;
  flex-direction: column;
  color: var(--receipt-ink-muted);
  letter-spacing: 0.06em;
}
.entry__event {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
}
.entry__by {
  padding: 1px 5px;
  border-radius: var(--radius-xs);
  font-size: 0.58rem;
  letter-spacing: 0.1em;
}
/* Green = the machine did it. Clay = a human had to. */
.entry__by--auto {
  background-color: var(--green-800);
  color: var(--green-50);
}
.entry__by--you {
  background-color: var(--clay-700);
  color: var(--clay-50);
}
.entry__detail {
  color: var(--receipt-ink-muted);
  letter-spacing: 0.04em;
}

.receipt__total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}
.receipt__total-label {
  font-weight: var(--weight-bold);
  letter-spacing: 0.1em;
}
.receipt__total-value {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  color: var(--green-800);
}

/* Generated barcode — bar widths from a modulo, not an image */
.receipt__barcode {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 2.2rem;
  margin-top: var(--space-5);
}
.receipt__barcode span {
  display: block;
  flex: var(--w);
  height: 100%;
  background-color: var(--receipt-ink);
}
.receipt__barcode span:nth-child(3n) {
  height: 82%;
  background-color: var(--receipt-ink-muted);
}

.chaser__caption {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-align: center;
  max-width: 24rem;
}

/* ─── Breakpoints ───────────────────────────────────────────────────────── */
@media (min-width: 1024px) {
  .chaser__inner {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: clamp(3rem, 7vw, 6rem);
    align-items: center;
  }
  .chaser__figure {
    /* a printed page is never perfectly square to the grid */
    transform: rotate(-1.1deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .chaser__figure {
    transform: none;
  }
}
</style>
