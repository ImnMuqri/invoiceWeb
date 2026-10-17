<script setup lang="ts">
/**
 * The bento — six capabilities, each with a small generated visual of it
 * doing its job.
 *
 * Every claim is verifiable:
 *   ai        -> Groq draft builder, Backend/src/utils/aiService.js
 *   risk      -> latePrediction from client.averageDelayDays,
 *                Backend/src/routes/invoices/index.js:191
 *   perClient -> client.autoChaser / client.autoEmailChaser (schema.prisma)
 *   money     -> invoice.currency (MYR default) + tax settings
 *   deliver   -> tokenised /pay/:id page + puppeteer PDF export
 *   quotes    -> tokenised /quote/:token accept-decline page + one-click
 *                conversion, Backend/src/routes/quote/index.js
 *
 * Layout: a 4-column grid with mixed spans and mixed grounds (ink, green,
 * clay tint, raised paper) so it never reads as six equal SaaS cards. Each
 * tile carries a pointer-following light; the position is written straight to
 * CSS custom properties, so moving the mouse never re-renders Vue.
 */
import type { LandingCopy } from '~/composables/useLandingCopy'

const props = defineProps<{ copy: LandingCopy }>()
const t = computed(() => props.copy.bento.tiles)

function spot(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/* Bar widths: average days to pay, against a two-week scale. */
const SCALE_DAYS = 14
const riskRows = computed(() =>
  t.value.risk.rows.map((r) => {
    const days = Number(r.meta.match(/\d+/)?.[0] ?? 0)
    return { ...r, width: `${Math.min(100, (days / SCALE_DAYS) * 100)}%` }
  })
)
</script>

<template>
  <section id="features" class="bento k-section" aria-labelledby="bento-title">
    <div class="k-container k-container--wide">
      <header class="bento__head" data-reveal>
        <div class="bento__head-main">
          <p class="k-eyebrow">{{ copy.bento.eyebrow }}</p>
          <h2 id="bento-title" class="k-headline bento__title">
            <KirimText :text="copy.bento.title" />
          </h2>
        </div>
        <p class="k-lead bento__lead">{{ copy.bento.lead }}</p>
      </header>

      <div class="grid">
        <!-- AI: the big ink tile -->
        <article class="tile tile--ink tile--wide tile--tall" @pointermove="spot">
          <div class="tile__copy">
            <span class="tile__kicker k-num">AI</span>
            <h3 class="tile__title tile__title--xl">{{ t.ai.title }}</h3>
            <p class="tile__body">{{ t.ai.body }}</p>
          </div>
          <div class="ai" aria-hidden="true">
            <div class="ai__prompt k-num">
              <span class="ai__caret">&gt;</span>
              <span class="ai__type">{{ t.ai.prompt }}</span>
              <span class="ai__send">
                <svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </span>
            </div>
            <div class="ai__draft">
              <div class="ai__row ai__row--head"><span class="ai__ok">✓ {{ copy.steps.vis.draft }}</span><span class="k-num">INV-0043</span></div>
              <div v-for="(r, i) in t.ai.rows" :key="r.label" class="ai__row ai__row--in" :style="{ '--_d': `${0.6 + i * 0.5}s` }">
                <span class="ai__muted">{{ r.label }}</span><b>{{ r.value }}</b>
              </div>
              <div class="ai__row ai__row--in ai__total" :style="{ '--_d': '2.1s' }">
                <b>{{ t.ai.totalLabel }}</b><span class="k-num">{{ t.ai.total }}</span>
              </div>
            </div>
          </div>
        </article>

        <!-- Late risk: bars -->
        <article class="tile tile--paper tile--wide" @pointermove="spot">
          <div class="tile__copy">
            <h3 class="tile__title">{{ t.risk.title }}</h3>
            <p class="tile__body">{{ t.risk.body }}</p>
          </div>
          <ul class="risk">
            <li v-for="r in riskRows" :key="r.client" class="risk__row">
              <div class="risk__top">
                <b>{{ r.client }}</b>
                <span :class="r.risk === 'high' ? 'risk__lvl--high' : 'risk__lvl--low'">{{ t.risk.riskLabel }}: {{ t.risk.levels[r.risk] }}</span>
              </div>
              <div class="risk__track" aria-hidden="true">
                <div class="risk__bar" :class="{ 'risk__bar--high': r.risk === 'high' }" :style="{ width: r.width }"></div>
              </div>
              <span class="risk__meta">{{ r.meta }}</span>
            </li>
          </ul>
        </article>

        <!-- Per-client switch: green -->
        <article class="tile tile--green" @pointermove="spot">
          <h3 class="tile__title tile__title--sm">{{ t.perClient.title }}</h3>
          <ul class="switches" aria-hidden="true">
            <li class="switch is-on"><b>{{ t.perClient.names[0] }}</b><i></i></li>
            <li class="switch"><b>{{ t.perClient.names[1] }}</b><i></i></li>
          </ul>
          <p class="tile__body tile__body--sm">{{ t.perClient.body }}</p>
        </article>

        <!-- Money: clay tint -->
        <article class="tile tile--clay" @pointermove="spot">
          <span class="money__rm k-serif" aria-hidden="true">RM</span>
          <ul class="chips" aria-hidden="true">
            <li v-for="(c, i) in t.money.chips" :key="c" :class="{ 'is-on': i === 0 }" class="k-num">{{ c }}</li>
            <li class="k-num">{{ t.money.taxLabel }} {{ t.money.taxValue }}</li>
          </ul>
          <div class="tile__copy tile__copy--end">
            <h3 class="tile__title tile__title--sm">{{ t.money.title }}</h3>
            <p class="tile__body tile__body--sm">{{ t.money.body }}</p>
          </div>
        </article>

        <!-- Deliver: link → pay -->
        <article class="tile tile--paper tile--wide" @pointermove="spot">
          <div class="flow" aria-hidden="true">
            <span class="flow__link k-num">{{ t.deliver.link }}</span>
            <span class="flow__wire"></span>
            <span class="flow__pay"><span class="k-num">RM 2,400</span>{{ t.deliver.payCta }}</span>
          </div>
          <span class="flow__pdf k-num" aria-hidden="true">{{ t.deliver.pdf }}</span>
          <div class="tile__copy tile__copy--end">
            <h3 class="tile__title">{{ t.deliver.title }}</h3>
            <p class="tile__body">{{ t.deliver.body }}</p>
          </div>
        </article>

        <!-- Quotes: cursor clicks Accept -->
        <article class="tile tile--sunken tile--wide tile--row" @pointermove="spot">
          <div class="tile__copy">
            <h3 class="tile__title">{{ t.quotes.title }}</h3>
            <p class="tile__body">{{ t.quotes.body }}</p>
          </div>
          <div class="quote" aria-hidden="true">
            <div class="quote__top k-num"><b>{{ t.quotes.number }}</b><span>RM 3,500.00</span></div>
            <div class="quote__btns">
              <span class="quote__btn quote__btn--go">{{ t.quotes.accept }}</span>
              <span class="quote__btn">{{ t.quotes.decline }}</span>
            </div>
            <span class="quote__done">✓ {{ t.quotes.convert }}</span>
            <svg class="quote__cursor" viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" /></svg>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bento__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-6);
  margin-bottom: var(--space-10);
}
.bento__head-main {
  max-width: 44rem;
}
.bento__title {
  margin-top: var(--space-3);
}
.bento__lead {
  max-width: 24rem;
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: minmax(16rem, auto);
  gap: var(--space-4);
}
.tile--wide {
  grid-column: span 2;
}
.tile--tall {
  grid-row: span 2;
}
@media (max-width: 980px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .tile--tall {
    grid-row: auto;
  }
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .tile--wide {
    grid-column: auto;
  }
}

.tile {
  --mx: 50%;
  --my: 50%;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-7);
  border-radius: var(--radius-2xl);
}
.tile::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(22rem circle at var(--mx) var(--my), var(--a-green-20), transparent 65%);
  opacity: 0;
  transition: opacity var(--dur-base) var(--ease-out);
  pointer-events: none;
}
.tile:hover::before {
  opacity: 1;
}
.tile--row {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}
.tile--row > * {
  flex: 1 1 14rem;
}

.tile--ink {
  background-color: var(--surface-slab);
  color: var(--text-on-slab);
}
.tile--paper {
  background-color: var(--surface-raised);
  border: 1px solid var(--border-subtle);
}
.tile--sunken {
  background-color: var(--surface-sunken);
}
.tile--green {
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
  padding: var(--space-6);
}
.tile--green::before {
  background: radial-gradient(18rem circle at var(--mx) var(--my), var(--a-paper-24), transparent 65%);
}
.tile--clay {
  background-color: var(--clay-100);
  color: var(--ink-950);
  padding: var(--space-6);
}

.tile__copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: 28rem;
}
.tile__copy--end {
  margin-top: auto;
}
.tile__kicker {
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  color: var(--green-400);
}
.tile__title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  line-height: 1.15;
}
.tile__title--xl {
  font-size: clamp(1.75rem, 3vw, 2.4rem);
  line-height: 1.05;
}
.tile__title--sm {
  font-size: var(--text-lg);
}
.tile__body {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.tile__body--sm {
  font-size: var(--text-xs);
}
.tile--ink .tile__body {
  color: var(--text-on-slab-muted);
}
.tile--green .tile__body {
  color: var(--green-950);
}
.tile--clay .tile__body {
  color: var(--gray-700);
}

/* AI */
.ai {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.ai__prompt {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
  border: 1px solid var(--ink-800);
  border-radius: var(--radius-lg);
  background-color: var(--a-paper-08);
  font-size: var(--text-sm);
  overflow: hidden;
}
.ai__caret {
  color: var(--green-400);
}
.ai__type {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid var(--green-400);
  animation:
    reveal-w 4.2s steps(44) infinite alternate,
    caret 0.8s step-end infinite;
}
@keyframes reveal-w {
  0%, 10% { max-width: 0; }
  80%, 100% { max-width: 100%; }
}
@keyframes caret {
  50% { border-color: transparent; }
}
.ai__send {
  flex: none;
  display: grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: var(--radius-md);
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
}
.ai__send svg {
  width: 1rem;
  height: 1rem;
}
.ai__draft {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5);
  border-radius: var(--radius-xl);
  background-color: var(--receipt-bg);
  color: var(--receipt-ink);
  font-size: var(--text-sm);
}
.ai__row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}
.ai__row--head {
  font-size: var(--text-xs);
  color: var(--receipt-ink-muted);
}
.ai__ok {
  font-weight: var(--weight-extrabold);
  color: var(--text-accent);
}
.ai__muted {
  color: var(--receipt-ink-muted);
}
.ai__total {
  padding-top: var(--space-2);
  border-top: 1px solid var(--receipt-rule);
}
.ai__row--in {
  animation: row-in 6s var(--ease-out) var(--_d) infinite both;
}
@keyframes row-in {
  0% { opacity: 0; transform: translateY(6px); }
  6%, 88% { opacity: 1; transform: none; }
  100% { opacity: 0; }
}

/* Risk */
.risk {
  margin: auto 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.risk__row {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.risk__top {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  font-size: var(--text-sm);
}
.risk__lvl--low {
  color: var(--text-accent);
  font-weight: var(--weight-bold);
}
.risk__lvl--high {
  color: var(--text-warm);
  font-weight: var(--weight-bold);
}
.risk__track {
  height: 12px;
  border-radius: var(--radius-full);
  background-color: var(--surface-sunken);
  overflow: hidden;
}
.risk__bar {
  height: 100%;
  border-radius: var(--radius-full);
  background-color: var(--surface-accent);
  transform-origin: left;
  animation: grow 1.2s var(--ease-out) both;
}
.risk__bar--high {
  background-color: var(--brand-clay);
}
@keyframes grow {
  from { transform: scaleX(0); }
}
.risk__meta {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Switches */
.switches {
  margin: auto 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background-color: var(--a-paper-64);
  font-size: var(--text-xs);
}
.switch.is-on {
  background-color: var(--a-paper-90);
}
.switch i {
  position: relative;
  flex: none;
  width: 2.4rem;
  height: 1.4rem;
  border-radius: var(--radius-full);
  background-color: var(--a-ink-24);
}
.switch i::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: calc(1.4rem - 6px);
  height: calc(1.4rem - 6px);
  border-radius: var(--radius-full);
  background-color: var(--paper-25);
}
.switch.is-on i {
  background-color: var(--ink-950);
}
.switch.is-on i::after {
  left: auto;
  right: 3px;
  background-color: var(--green-400);
}

/* Money */
.money__rm {
  font-size: 5.25rem;
  line-height: 0.85;
  letter-spacing: -0.03em;
}
.chips {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}
.chips li {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--a-ink-24);
  border-radius: var(--radius-sm);
  font-size: var(--text-2xs);
}
.chips li.is-on {
  border-color: transparent;
  background-color: var(--ink-950);
  color: var(--paper-50);
}

/* Deliver */
.flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}
.flow__link {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background-color: var(--surface-accent-soft);
  color: var(--text-accent);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.flow__wire {
  flex: 1 1 2.5rem;
  min-width: 2.5rem;
  height: 2px;
  background-color: var(--border-default);
  background-image: linear-gradient(90deg, transparent, var(--surface-accent), transparent);
  background-size: 40% 100%;
  background-repeat: no-repeat;
  animation: wire 2.6s linear infinite;
}
@keyframes wire {
  from { background-position: -40% 0; }
  to { background-position: 140% 0; }
}
.flow__pay {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-2);
  border-radius: var(--radius-md);
  background-color: var(--ink-950);
  color: var(--paper-50);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}
.flow__pay .k-num {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
}
.flow__pdf {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Quote */
.quote {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border-radius: var(--radius-xl);
  background-color: var(--receipt-bg);
  color: var(--receipt-ink);
  box-shadow: var(--shadow-md);
}
.quote__top {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
}
.quote__btns {
  display: flex;
  gap: var(--space-2);
}
.quote__btn {
  flex: 1 1 0;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  text-align: center;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--receipt-ink-muted);
}
.quote__btn--go {
  border-color: transparent;
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
  font-weight: var(--weight-bold);
  animation: press 5s var(--ease-out) infinite;
}
@keyframes press {
  0%, 47% { transform: none; box-shadow: none; }
  50% { transform: scale(0.95); }
  56%, 100% { transform: none; box-shadow: 0 0 0 4px var(--a-green-20); }
}
.quote__done {
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--text-accent);
  animation: done 5s var(--ease-out) infinite;
}
@keyframes done {
  0%, 54% { opacity: 0; transform: translateY(4px); }
  60%, 100% { opacity: 1; transform: none; }
}
.quote__cursor {
  position: absolute;
  left: 22%;
  top: 3rem;
  width: 22px;
  height: 22px;
  fill: var(--ink-950);
  stroke: var(--paper-25);
  stroke-width: 1.5;
  stroke-linejoin: round;
  animation: cursor 5s var(--ease-in-out) infinite;
}
@keyframes cursor {
  0% { transform: translate(110px, 50px); opacity: 0; }
  15% { opacity: 1; }
  45% { transform: translate(0, 0); }
  50% { transform: translate(0, 0) scale(0.85); }
  55%, 90% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ai__type,
  .ai__row--in,
  .risk__bar,
  .flow__wire,
  .quote__btn--go,
  .quote__done,
  .quote__cursor {
    animation: none;
  }
  .ai__type {
    border-right: 0;
  }
  .quote__cursor {
    display: none;
  }
}
</style>
