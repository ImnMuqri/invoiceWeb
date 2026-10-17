<script setup lang="ts">
/**
 * Objection — "setting this up is a whole afternoon I don't have."
 *
 * An interactive stepper: four steps on the left that play through on their
 * own, and an ink panel on the right that shows what each step looks like in
 * the product. Clicking a step stops the auto-play and holds it.
 */
import type { LandingCopy } from '~/composables/useLandingCopy'

const props = defineProps<{ copy: LandingCopy }>()

const active = ref(0)
const auto = ref(true)
const STEP_MS = 4400

let timer: ReturnType<typeof setInterval> | undefined
function stop() {
  if (timer) clearInterval(timer)
  timer = undefined
}
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    auto.value = false
    return
  }
  timer = setInterval(() => {
    active.value = (active.value + 1) % props.copy.steps.items.length
  }, STEP_MS)
})
onBeforeUnmount(stop)

function pick(i: number) {
  stop()
  auto.value = false
  active.value = i
}

const v = computed(() => props.copy.steps.vis)
</script>

<template>
  <section id="how" class="steps k-section" aria-labelledby="steps-title">
    <div class="k-container k-container--wide">
      <header class="steps__head" data-reveal>
        <div class="steps__head-main">
          <p class="k-eyebrow">{{ copy.steps.eyebrow }}</p>
          <h2 id="steps-title" class="k-headline steps__title"><KirimText :text="copy.steps.title" /></h2>
        </div>
        <p class="k-lead steps__lead">{{ copy.steps.lead }}</p>
      </header>

      <div class="steps__body">
        <ol class="steps__list">
          <li v-for="(s, i) in copy.steps.items" :key="s.n">
            <button
              type="button"
              class="step"
              :class="{ 'is-on': i === active }"
              :aria-pressed="i === active"
              @click="pick(i)">
              <span class="step__n k-num">{{ s.n }}</span>
              <span class="step__text">
                <span class="step__title">{{ s.title }}</span>
                <Transition name="fade">
                  <span v-if="i === active" class="step__body">{{ s.body }}</span>
                </Transition>
              </span>
              <span v-if="i === active && auto" :key="`bar-${active}`" class="step__bar" aria-hidden="true"></span>
            </button>
          </li>
        </ol>

        <div class="panel" aria-hidden="true">
          <span class="panel__count k-num">0{{ active + 1 }} / 0{{ copy.steps.items.length }}</span>
          <div class="panel__glow"></div>

          <Transition name="swap" mode="out-in">
            <!-- 01 quote -->
            <div v-if="active === 0" key="q" class="pv pv--card">
              <div class="pv__row pv__meta"><b>Studio Kirana</b><span class="k-num">QUO-0018</span></div>
              <span class="pv__muted">{{ v.quoteFor }}</span>
              <span class="pv__big k-num">RM 3,500.00</span>
              <div class="pv__btns">
                <span class="pv__btn pv__btn--go">{{ v.accept }}</span>
                <span class="pv__btn">{{ v.decline }}</span>
              </div>
              <span class="pv__muted pv__center">{{ v.quoteNote }}</span>
            </div>

            <!-- 02 AI draft -->
            <div v-else-if="active === 1" key="ai" class="pv pv--stack">
              <div class="pv__prompt k-num">
                <span class="pv__caret">&gt; ask InvoKita</span>
                <span class="pv__type">{{ copy.bento.tiles.ai.prompt }}</span>
              </div>
              <div class="pv pv--card">
                <span class="pv__ok">✓ {{ v.draft }}</span>
                <div v-for="r in copy.bento.tiles.ai.rows" :key="r.label" class="pv__row">
                  <span class="pv__muted">{{ r.label }}</span><b>{{ r.value }}</b>
                </div>
              </div>
            </div>

            <!-- 03 send -->
            <div v-else-if="active === 2" key="send" class="pv pv--stack">
              <div class="pv__toggle"><span class="pv__chan"><i class="pv__ico pv__ico--wa"></i>WhatsApp</span><span class="pv__switch"></span></div>
              <div class="pv__toggle"><span class="pv__chan"><i class="pv__ico"></i>{{ v.email }}</span><span class="pv__switch"></span></div>
              <div class="pv__link">
                <span class="k-num">{{ copy.bento.tiles.deliver.link }}</span>
                <span>{{ v.linkNote }}</span>
              </div>
            </div>

            <!-- 04 chase -->
            <div v-else key="chase" class="pv pv--card">
              <span class="pv__label">{{ v.every }}</span>
              <div class="pv__seg">
                <span v-for="(o, i) in v.intervals" :key="o" :class="{ 'is-on': i === 1 }">{{ o }}</span>
              </div>
              <ul class="pv__queue">
                <li v-for="r in v.reminders" :key="r"><i></i>{{ r }}</li>
                <li class="is-stop"><i></i>{{ v.stops }}</li>
              </ul>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.steps__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-6);
  margin-bottom: var(--space-10);
}
.steps__head-main {
  max-width: 42rem;
}
.steps__title {
  margin-top: var(--space-3);
}
.steps__lead {
  max-width: 24rem;
  margin: 0;
}

.steps__body {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-7);
  align-items: stretch;
}
.steps__list {
  flex: 1 1 22rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  position: relative;
  overflow: hidden;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: var(--space-5);
  padding: var(--space-5) var(--space-6);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out);
}
.step:hover {
  transform: translateX(4px);
}
.step.is-on {
  background-color: var(--surface-raised);
  border-color: var(--border-default);
  box-shadow: var(--shadow-md);
}
.step__n {
  min-width: 2.75rem;
  font-size: var(--text-3xl);
  line-height: 1;
  color: var(--ink-400);
}
.step.is-on .step__n {
  color: var(--surface-accent);
}
.step__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.step__title {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
}
.step__body {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.step__bar {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  background-color: var(--surface-accent);
  animation: bar 4.4s linear forwards;
}
@keyframes bar {
  from { width: 0; }
  to { width: 100%; }
}

/* ── Preview panel ───────────────────────────────────────── */
.panel {
  flex: 1.25 1 28rem;
  min-width: 0;
  min-height: 29rem;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-9) var(--space-6);
  border-radius: var(--radius-2xl);
  background-color: var(--surface-slab);
  color: var(--text-on-slab);
  background-image: radial-gradient(var(--a-paper-12) 1px, transparent 1.5px);
  background-size: 20px 20px;
}
.panel__glow {
  position: absolute;
  width: 22rem;
  height: 22rem;
  border-radius: var(--radius-full);
  background: radial-gradient(circle, var(--a-green-32), transparent 65%);
  pointer-events: none;
}
.panel__count {
  position: absolute;
  top: var(--space-5);
  left: var(--space-6);
  font-size: var(--text-xs);
  color: var(--text-on-slab-muted);
}

.pv {
  position: relative;
  width: 22rem;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.pv--card {
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  background-color: var(--receipt-bg);
  color: var(--receipt-ink);
  box-shadow: var(--shadow-xl);
}
.pv--stack .pv--card {
  width: 100%;
  padding: var(--space-5);
}
.pv__row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  font-size: var(--text-sm);
}
.pv__meta {
  font-size: var(--text-xs);
  color: var(--receipt-ink-muted);
}
.pv__muted {
  font-size: var(--text-sm);
  color: var(--receipt-ink-muted);
}
.pv__center {
  text-align: center;
  font-size: var(--text-xs);
}
.pv__big {
  font-size: var(--text-3xl);
  font-weight: var(--weight-semibold);
}
.pv__btns {
  display: flex;
  gap: var(--space-2);
}
.pv__btn {
  flex: 1 1 0;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  text-align: center;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--receipt-ink-muted);
}
.pv__btn--go {
  border-color: transparent;
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
  font-weight: var(--weight-bold);
}
.pv__ok {
  font-size: var(--text-xs);
  font-weight: var(--weight-extrabold);
  color: var(--text-accent);
}

.pv__prompt {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--ink-800);
  border-radius: var(--radius-lg);
  background-color: var(--a-paper-08);
  font-size: var(--text-xs);
  overflow: hidden;
}
.pv__caret {
  color: var(--green-400);
}
.pv__type {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid var(--green-400);
  animation:
    type 2.6s steps(44) both,
    caret 0.8s step-end infinite;
}
@keyframes type {
  from { width: 0; }
  to { width: 100%; }
}
@keyframes caret {
  50% { border-color: transparent; }
}

.pv__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-lg);
  background-color: var(--receipt-bg);
  color: var(--receipt-ink);
  font-weight: var(--weight-bold);
}
.pv__chan {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.pv__ico {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
  background-color: var(--ink-100);
}
.pv__ico--wa {
  background-color: var(--bubble-out-bg);
}
.pv__switch {
  position: relative;
  width: 2.75rem;
  height: 1.6rem;
  border-radius: var(--radius-full);
  background-color: var(--surface-accent);
}
.pv__switch::after {
  content: '';
  position: absolute;
  right: 3px;
  top: 3px;
  width: calc(1.6rem - 6px);
  height: calc(1.6rem - 6px);
  border-radius: var(--radius-full);
  background-color: var(--paper-25);
}
.pv__link {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-5);
  border: 1px dashed var(--ink-700);
  border-radius: var(--radius-lg);
  font-size: var(--text-xs);
  color: var(--text-on-slab-muted);
}
.pv__link .k-num {
  font-size: var(--text-sm);
  color: var(--green-400);
}

.pv__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--receipt-ink-muted);
}
.pv__seg {
  display: flex;
  padding: 4px;
  border-radius: var(--radius-md);
  background-color: var(--ink-100);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}
.pv__seg span {
  flex: 1 1 0;
  padding: var(--space-2) 0;
  text-align: center;
  border-radius: var(--radius-sm);
  color: var(--receipt-ink-muted);
}
.pv__seg span.is-on {
  background-color: var(--ink-950);
  color: var(--paper-50);
}
.pv__queue {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.pv__queue li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.pv__queue i {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  border: 2px solid var(--surface-accent);
}
.pv__queue li.is-stop {
  color: var(--text-accent);
  font-weight: var(--weight-bold);
}
.pv__queue li.is-stop i {
  background-color: var(--surface-accent);
}

.fade-enter-active {
  transition: opacity var(--dur-slow) var(--ease-out);
}
.fade-enter-from {
  opacity: 0;
}
.swap-enter-active,
.swap-leave-active {
  transition:
    opacity var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out);
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.swap-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .step,
  .step:hover {
    transform: none;
  }
  .pv__type {
    animation: none;
    border-right: 0;
  }
}
</style>
