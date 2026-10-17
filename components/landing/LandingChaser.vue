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

const props = defineProps<{ copy: LandingCopy }>()

/*
 * The receipt sits at its full height from the start (so the section never
 * grows under the reader) and its lines print in one per second, then the
 * PAID stamp lands. The cycle restarts after a hold. It only starts once the
 * receipt is on screen, and reduced motion shows the finished log.
 */
const figure = ref<HTMLElement | null>(null)
const ROWS = props.copy.chaser.log.length
const CYCLE = ROWS + 8
const tick = ref(0)
const printed = computed(() => Math.min(tick.value + 1, ROWS))
const stamped = computed(() => tick.value >= ROWS)

let timer: ReturnType<typeof setInterval> | undefined
let io: IntersectionObserver | undefined
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tick.value = ROWS
    return
  }
  const start = () => {
    if (timer) return
    timer = setInterval(() => {
      tick.value = (tick.value + 1) % CYCLE
    }, 1000)
  }
  if (typeof IntersectionObserver === 'undefined' || !figure.value) return start()
  io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      start()
      io?.disconnect()
    }
  }, { threshold: 0.3 })
  io.observe(figure.value)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  io?.disconnect()
})

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
  <section class="chaser k-section" aria-labelledby="chaser-title">
    <div class="chaser__stripes" aria-hidden="true"></div>
    <div class="k-container k-container--wide chaser__inner">
      <header class="chaser__head" data-reveal>
        <p class="chaser__eyebrow">{{ copy.chaser.eyebrow }}</p>
        <h2 id="chaser-title" class="k-headline chaser__title"><KirimText :text="copy.chaser.title" /></h2>
        <p class="k-lead chaser__lead">{{ copy.chaser.lead }}</p>
        <div class="zero">
          <span class="zero__n k-serif" aria-hidden="true">0</span>
          <span class="zero__text">
            <span class="zero__label k-num">{{ copy.chaser.totalLabel }}</span>
            <span class="zero__note">{{ copy.chaser.zero }}</span>
          </span>
        </div>
        <p class="chaser__foot">{{ copy.chaser.footnote }}</p>
      </header>

      <figure ref="figure" class="chaser__figure" data-reveal>
        <div class="printer" aria-hidden="true">
          <span class="printer__status"><i></i>{{ copy.chaser.printing }}</span>
          <span>INVOKITA · AUTO</span>
        </div>
        <div class="receipt-wrap">
        <div class="receipt" :style="{ clipPath }">
          <div class="receipt__paper">
            <header class="receipt__head">
              <p class="receipt__title">{{ copy.chaser.receiptTitle }}</p>
              <p class="receipt__sub">{{ copy.chaser.receiptSub }}</p>
            </header>

            <div class="receipt__divider" aria-hidden="true"></div>

            <ol class="receipt__log">
              <li v-for="(row, i) in copy.chaser.log" :key="i" class="entry" :class="{ 'is-printed': printed > i }">
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
        <Transition name="stamp">
          <span v-if="stamped" class="stamp k-num" aria-hidden="true">{{ copy.chaser.stamp }}</span>
        </Transition>
        </div>
        <figcaption class="chaser__caption">{{ copy.chaser.receiptNote }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
/* A full green slab: the one section where the accent is the ground. */
.chaser {
  position: relative;
  overflow: hidden;
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
}
.chaser__stripes {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(135deg, var(--a-ink-08) 0 2px, transparent 2px 22px);
  pointer-events: none;
}
.chaser__inner {
  position: relative;
  display: grid;
  gap: clamp(2.5rem, 6vw, 4rem);
}
.chaser__eyebrow {
  display: inline-block;
  margin: 0;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background-color: var(--ink-950);
  color: var(--green-400);
  font-size: var(--text-xs);
  font-weight: var(--weight-extrabold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.chaser .k-lead {
  color: var(--text-on-accent);
}
.zero {
  display: flex;
  align-items: flex-end;
  gap: var(--space-5);
  margin-top: var(--space-6);
}
.zero__n {
  font-size: clamp(9rem, 17vw, 15rem);
  line-height: 0.78;
  letter-spacing: -0.04em;
  color: var(--ink-950);
}
.zero__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-bottom: var(--space-4);
}
.zero__label {
  max-width: 12rem;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.06em;
  line-height: 1.4;
}
.zero__note {
  font-size: var(--text-sm);
  color: var(--green-950);
}

/* The printer the receipt feeds out of. */
.printer {
  position: relative;
  z-index: 2;
  width: min(27rem, 100%);
  height: 2.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: var(--space-5);
  border-radius: var(--radius-lg);
  background-color: var(--ink-950);
  box-shadow: inset 0 -8px 0 var(--ink-900), var(--shadow-lg);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--ink-400);
}
.printer__status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--green-400);
}
.printer__status i {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background-color: var(--green-400);
  animation: blink 1.2s step-end infinite;
}
@keyframes blink {
  50% { opacity: 0.25; }
}
.receipt-wrap {
  position: relative;
  margin-top: -12px;
  width: min(24rem, 100%);
}
.entry {
  opacity: 0;
  transform: translateY(-6px);
  transition:
    opacity var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out);
}
.entry.is-printed {
  opacity: 1;
  transform: none;
}
.stamp {
  position: absolute;
  z-index: 3;
  right: var(--space-5);
  top: 8rem;
  padding: var(--space-1) var(--space-4);
  border: 4px solid var(--surface-accent);
  border-radius: var(--radius-md);
  background-color: var(--a-paper-90);
  color: var(--green-700);
  font-size: var(--text-2xl);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.14em;
  transform: rotate(-14deg);
}
.stamp-enter-active {
  transition:
    opacity var(--dur-fast) var(--ease-out),
    transform var(--dur-slow) var(--ease-out);
}
.stamp-enter-from {
  opacity: 0;
  transform: rotate(-14deg) scale(1.6);
}
.chaser .chaser__caption {
  color: var(--green-950);
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
  border-top: 1px solid var(--a-ink-24);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--green-950);
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
  .printer__status i {
    animation: none;
  }
  .entry {
    opacity: 1;
    transform: none;
  }
}
</style>
