<script setup lang="ts">
/**
 * Ambient background for the auth panel — "the ledger settles".
 *
 * The concept, rather than decoration for its own sake: the panel is a dark
 * ledger, and one row at a time quietly settles — a green bar draws across it
 * and a tick lands at the end. It is the product's whole promise (invoices
 * getting paid without you) running as ambient motion. No floating blobs, no
 * gradient mesh.
 *
 * Driven by motion.dev (`animate` from motion/mini — the Web Animations driver,
 * already in the bundle for the landing page). The loop is sequenced in JS
 * rather than with CSS keyframes because each beat needs to target a different
 * row and wait for the previous one to clear, which keyframes cannot express.
 *
 * Timing is deliberately far slower than the page's scroll-reveal budget. That
 * budget exists so reveals never outpace a chat message; this is ambient, sits
 * behind text, and must never pull the eye off the form. Nothing here moves
 * faster than 900ms or further than a few pixels, and opacity stays low.
 *
 * prefers-reduced-motion: the loop never starts, and a couple of rows are left
 * in their settled state so the panel still reads as intended.
 */
const ROWS = 7

const root = ref<HTMLElement | null>(null)
const rowEls = ref<HTMLElement[]>([])

let cancelled = false
let timer: ReturnType<typeof setTimeout> | undefined

function setRowEl(el: Element | ComponentPublicInstance | null, i: number) {
  if (el instanceof HTMLElement) rowEls.value[i] = el
}

function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

onMounted(async () => {
  const rows = rowEls.value.filter(Boolean)
  if (!rows.length) return

  if (reducedMotion()) {
    // Static settled state: two rows done, no motion at all.
    for (const i of [1, 4]) {
      const r = rows[i]
      if (!r) continue
      r.style.opacity = '1'
      const bar = r.querySelector<HTMLElement>('.row__bar')
      const tick = r.querySelector<HTMLElement>('.row__tick')
      if (bar) bar.style.transform = 'scaleX(1)'
      if (tick) tick.style.opacity = '1'
    }
    return
  }

  let animate: typeof import('motion/mini')['animate']
  try {
    ;({ animate } = await import('motion/mini'))
  } catch {
    return // no motion library, no ambient layer — the panel still works
  }
  if (cancelled) return

  const EASE = [0.16, 1, 0.3, 1] as const

  const settle = (i: number) => {
    const row = rows[i % rows.length]
    if (!row) return
    const bar = row.querySelector<HTMLElement>('.row__bar')
    const tick = row.querySelector<HTMLElement>('.row__tick')

    animate(row, { opacity: [0, 1] }, { duration: 0.5, ease: EASE })
    if (bar)
      animate(
        bar,
        { transform: ['scaleX(0)', 'scaleX(1)'] },
        { duration: 0.9, ease: EASE }
      )
    if (tick)
      animate(
        tick,
        { opacity: [0, 1], transform: ['scale(0.6)', 'scale(1)'] },
        { duration: 0.45, delay: 0.75, ease: EASE }
      )

    // Hold, then clear the row before the next one starts.
    timer = setTimeout(() => {
      if (cancelled) return
      animate(row, { opacity: [1, 0] }, { duration: 0.7, ease: EASE })
      timer = setTimeout(() => {
        if (cancelled) return
        if (bar) bar.style.transform = 'scaleX(0)'
        if (tick) tick.style.opacity = '0'
        settle(i + 3) // step by 3 so consecutive beats are not adjacent rows
      }, 800)
    }, 2600)
  }

  timer = setTimeout(() => !cancelled && settle(1), 700)
})

onBeforeUnmount(() => {
  cancelled = true
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div ref="root" class="ledger" aria-hidden="true">
    <!-- Slow drifting green wash. CSS, because a single looping transform is
         exactly what keyframes are for and it costs no JS. -->
    <div class="ledger__wash"></div>

    <!-- Static ruled paper -->
    <div class="ledger__rules"></div>

    <!-- The rows that settle -->
    <div class="ledger__rows">
      <div
        v-for="i in ROWS"
        :key="i"
        :ref="(el) => setRowEl(el, i - 1)"
        class="row"
        :style="{ '--_row': i - 1 }">
        <span class="row__bar"></span>
        <span class="row__tick">
          <svg viewBox="0 0 16 16">
            <path
              d="M3.4 8.4 6.4 11.4 12.6 4.6"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ledger {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

/* ─── Drifting wash — alpha of the locked green only ─────────────────────── */
.ledger__wash {
  position: absolute;
  inset: -25%;
  background:
    radial-gradient(38% 32% at 30% 30%, var(--a-green-20) 0%, transparent 70%),
    radial-gradient(42% 36% at 72% 68%, var(--a-green-12) 0%, transparent 72%);
  animation: ledger-drift 34s var(--ease-in-out) infinite alternate;
  will-change: transform;
}
@keyframes ledger-drift {
  from {
    transform: translate3d(-3%, -2%, 0) scale(1);
  }
  to {
    transform: translate3d(3%, 2%, 0) scale(1.12);
  }
}

/* ─── Ruled paper ───────────────────────────────────────────────────────── */
.ledger__rules {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    to bottom,
    var(--border-on-slab) 0 1px,
    transparent 1px 5.5rem
  );
  -webkit-mask-image: radial-gradient(72% 64% at 34% 44%, var(--brand-ink) 0%, transparent 80%);
  mask-image: radial-gradient(72% 64% at 34% 44%, var(--brand-ink) 0%, transparent 80%);
}

/* ─── Settling rows ─────────────────────────────────────────────────────── */
.ledger__rows {
  position: absolute;
  inset: 0;
}

.row {
  position: absolute;
  /* inset to the panel's own content padding so a settled row reads as part of
     the layout rather than a line bleeding off the viewport edge */
  left: var(--space-9);
  right: var(--space-9);
  /* sits on the same 5.5rem rhythm as the rules, offset to straddle a line */
  top: calc(var(--_row) * 5.5rem + 3.6rem);
  height: 2px;
  display: flex;
  align-items: center;
  opacity: 0;
}

.row__bar {
  display: block;
  height: 2px;
  /* varying widths so the rows do not read as a progress bar */
  width: calc(38% + (var(--_row) * 7%));
  max-width: 76%;
  transform: scaleX(0);
  transform-origin: left center;
  border-radius: var(--radius-full);
  background: linear-gradient(
    to right,
    var(--a-green-32),
    var(--text-on-slab-accent)
  );
  will-change: transform;
}

.row__tick {
  display: grid;
  place-items: center;
  width: 1.15rem;
  height: 1.15rem;
  margin-left: var(--space-3);
  flex: none;
  border-radius: var(--radius-full);
  background-color: var(--a-green-20);
  color: var(--text-on-slab-accent);
  opacity: 0;
  will-change: opacity, transform;
}
.row__tick svg {
  width: 11px;
  height: 11px;
}

@media (prefers-reduced-motion: reduce) {
  .ledger__wash {
    animation: none;
    transform: none;
  }
}
</style>
