<script setup lang="ts">
/**
 * Pricing, read live from the same source of truth the app bills against
 * (GET {apiBase}/api/plans -> the Plan table).
 *
 * Deliberately NOT hardcoded, and with no static fallback either. Plans are
 * admin-editable records, so a hardcoded copy here would drift out of date and
 * start misleading people — which is exactly what happened to `Plan.features`
 * itself, where bullets written before the metering change went on advertising
 * caps the backend had stopped enforcing. When the API cannot be reached the
 * section says so and links to the app, because showing prices we are no longer
 * sure of is worse than showing none.
 *
 * Prices, plan names and feature bullets all come from the DB. The one thing
 * that does NOT is which plans are auto-chased: that is governed by cron.js,
 * not by the plan row, so it is mirrored explicitly in CHASER_PLANS below.
 * See the comment there.
 */
import type { LandingCopy } from '~/composables/useLandingCopy'
import { price } from '~/utils/invoice'

const props = defineProps<{ copy: LandingCopy }>()

interface Plan {
  id: number
  name: string
  description: string | null
  /** SEN, as Plan.price is stored. Never render it without `price()`. */
  price: number
  currency: string
  interval: string
  features: string[]
  isActive: boolean
  /** Monthly invoice cap (Free). Very large for "unlimited". */
  invoices?: number
  /** THE metered unit: invoices that get auto-chased per month. */
  chasedInvoices?: number
}

const config = useRuntimeConfig()
const endpoint = computed(() => `${config.public.apiBase}/api/plans`)

const { data, error, status } = await useFetch<Plan[]>(endpoint, {
  key: 'landing-plans',
  server: true,
  // Never let a slow plans call hold up the whole page render.
  timeout: 4000,
  default: () => [],
})

const plans = computed(() =>
  (data.value ?? [])
    .filter((p) => p.isActive)
    .slice()
    .sort((a, b) => a.price - b.price)
)

const failed = computed(() => !!error.value || (status.value !== 'pending' && plans.value.length === 0))

/**
 * How many columns the plan row gets on a wide screen.
 *
 * Capped at four: beyond that the cards get too narrow to read a feature list
 * in, and a fifth plan is better wrapped onto a second row than squeezed. The
 * floor of one keeps `repeat()` valid if the API ever returns a single plan.
 */
const columns = computed(() => Math.min(Math.max(plans.value.length, 1), 4))

/**
 * Which plans actually get auto-chased.
 *
 * This MUST stay in sync with Backend/src/plugins/cron.js, which selects users
 * with `plan: { in: [...] }` before queueing any reminder. A plan that is not
 * in that list never gets processed, no matter what its feature row in the DB
 * says — so the page will not sell a capability the backend does not deliver.
 * It caught Starter advertising "Auto Chaser" while the cron skipped those
 * subscribers entirely; Starter has since been retired.
 *
 * `visibleFeatures()` is the other half of the same rule and applies to Free:
 * any bullet mentioning chasing is dropped from a plan without the chaser, so
 * word a free-tier bullet in terms of what the user does by hand.
 */
const CHASER_PLANS = new Set(['PRO', 'MAX'])

function hasChaser(plan: Plan) {
  return CHASER_PLANS.has(plan.name.toUpperCase())
}

/** Hide any "auto chaser" bullet on a plan that the cron will never process. */
function visibleFeatures(plan: Plan) {
  const features = plan.features ?? []
  if (hasChaser(plan)) return features
  return features.filter((f) => !/chas/i.test(f))
}

/* The API returns the ISO code, but nobody in Malaysia writes "MYR 19" on a
   price tag — they write "RM 19". Display symbol, keep the ISO code in the
   structured data where machines read it. */
const CURRENCY_SYMBOL: Record<string, string> = { MYR: 'RM' }

function priceLabel(plan: Plan) {
  if (plan.price === 0) return props.copy.pricing.free
  const symbol = CURRENCY_SYMBOL[plan.currency] ?? plan.currency
  /* `price()` is the sen boundary. Interpolating plan.price directly put
     "RM 2900" on the public pricing page — the first number a visitor sees. */
  return `${symbol} ${price(plan.price)}`
}

/* ─── Plan finder ─────────────────────────────────────────────────────────
   "How many invoices do you send a month?" → the cheapest plan that covers
   it. Every threshold comes from the live plan rows (Free's `invoices` cap,
   each chaser plan's `chasedInvoices`), so editing a plan in admin moves the
   recommendation with it. Nothing here is a hardcoded number. */
const count = ref(12)
const freePlan = computed(() => plans.value.find((p) => p.price === 0))
const chaserPlans = computed(() =>
  plans.value.filter((p) => hasChaser(p) && (p.chasedInvoices ?? 0) > 0)
)
const maxChased = computed(() => Math.max(0, ...chaserPlans.value.map((p) => p.chasedInvoices ?? 0)))
const sliderMax = computed(() => Math.max(100, maxChased.value + 25))
const ticks = computed(() => {
  const m = sliderMax.value
  return [1, Math.round(m / 4), Math.round(m / 2), Math.round((3 * m) / 4), m]
})

const recommended = computed<Plan | null>(() => {
  const n = count.value
  const free = freePlan.value
  if (free && n <= (free.invoices ?? 0)) return free
  return chaserPlans.value.find((p) => n <= (p.chasedInvoices ?? 0)) ?? null
})

const fill = (s: string, n: number | undefined) => s.replace('{n}', String(n ?? ''))
const recWhy = computed(() => {
  const f = props.copy.pricing.finder
  const r = recommended.value
  if (!r) return fill(f.whyCustom, maxChased.value)
  if (r.price === 0) return fill(f.whyFree, r.invoices)
  return fill(f.whyChaser, r.chasedInvoices)
})

function onSlide(e: Event) {
  count.value = Number((e.target as HTMLInputElement).value) || 1
}
</script>

<template>
  <section id="pricing" class="pricing k-section k-section--loose" aria-labelledby="pricing-title">
    <div class="k-container k-container--wide pricing__inner">
      <div class="pricing__top">
        <header class="pricing__head" data-reveal>
          <p class="k-eyebrow">{{ copy.pricing.eyebrow }}</p>
          <h2 id="pricing-title" class="k-headline pricing__title"><KirimText :text="copy.pricing.title" /></h2>
          <p class="k-lead pricing__lead">{{ copy.pricing.lead }}</p>
        </header>

        <aside class="custom" data-reveal>
          <h3 class="custom__title">{{ copy.pricing.customTitle }}</h3>
          <p class="custom__body">{{ copy.pricing.customBody }}</p>
          <a
            href="mailto:support@invokita.my?subject=Custom%20plan%20enquiry"
            class="k-btn k-btn--secondary custom__cta">
            {{ copy.pricing.customCta }}
          </a>
        </aside>
      </div>

      <p v-if="status === 'pending'" class="pricing__status">{{ copy.pricing.loading }}</p>

      <div v-else-if="failed" class="pricing__status pricing__status--error">
        <p>{{ copy.pricing.error }}</p>
        <a href="/register" class="k-btn k-btn--secondary">{{ copy.pricing.errorAction }}</a>
      </div>

      <!-- The column count follows the DATA, not a guess. This was hardcoded
           to four, which was right while there were four plans and wrong the
           moment one was retired: three cards laid out in a four-column grid
           left a dangling empty column and squeezed every card to 25% of the
           row. Plans come from the API, so the count is genuinely variable and
           the layout has to be too. -->
      <template v-else>
      <div class="finder" data-reveal>
        <div class="finder__glow" aria-hidden="true"></div>
        <div class="finder__input">
          <label for="plan-count" class="finder__q">{{ copy.pricing.finder.question }}</label>
          <p class="finder__value">
            <output for="plan-count" class="finder__n k-serif">{{ count }}</output>
            <span class="finder__unit">{{ copy.pricing.finder.unit }}</span>
          </p>
          <input
            id="plan-count"
            class="finder__range"
            type="range"
            min="1"
            :max="sliderMax"
            step="1"
            :value="count"
            :style="{ '--_p': `${((count - 1) / (sliderMax - 1)) * 100}%` }"
            @input="onSlide" />
          <p class="finder__ticks k-num" aria-hidden="true">
            <span v-for="t in ticks" :key="t">{{ t }}</span>
          </p>
        </div>

        <div class="finder__result" aria-live="polite">
          <p class="finder__fit">{{ copy.pricing.finder.fit }}</p>
          <p class="finder__plan">
            <span class="finder__name">{{ recommended ? recommended.name : copy.pricing.finder.custom }}</span>
            <span class="finder__price k-num">
              {{ recommended ? priceLabel(recommended) : copy.pricing.finder.customPrice }}<small v-if="recommended && recommended.price > 0">{{ copy.pricing.perMonth }}</small>
            </span>
          </p>
          <p class="finder__why">{{ recWhy }}</p>
          <a
            :href="recommended ? '/register' : 'mailto:support@invokita.my?subject=Custom%20plan%20enquiry'"
            class="k-btn k-btn--primary finder__cta">
            {{ recommended ? (recommended.price === 0 ? copy.pricing.ctaFree : copy.pricing.cta) : copy.pricing.customCta }}
          </a>
        </div>
      </div>

      <ul class="plans" :style="{ '--_cols': columns }">
        <li
          v-for="plan in plans"
          :key="plan.id"
          class="plan"
          :class="{
            'plan--accent': hasChaser(plan) && plan.price > 0,
            'plan--rec': recommended && recommended.id === plan.id,
          }"
          data-reveal
          data-reveal-group="plans">
          <header class="plan__head">
            <h3 class="plan__name">
              {{ plan.name }}
              <span v-if="recommended && recommended.id === plan.id" class="plan__fit">{{ copy.pricing.finder.fitShort }}</span>
            </h3>
            <p v-if="plan.description" class="plan__desc">{{ plan.description }}</p>
          </header>

          <p class="plan__price">
            <span class="plan__amount k-num">{{ priceLabel(plan) }}</span>
            <span v-if="plan.price > 0" class="plan__interval">{{ copy.pricing.perMonth }}</span>
          </p>

          <p v-if="hasChaser(plan)" class="plan__badge">
            <svg viewBox="0 0 16 16" class="plan__badge-ico" aria-hidden="true">
              <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.5" />
              <path
                d="M8 4.4V8l2.4 1.7"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            {{ copy.pricing.chaserBadge }}
          </p>
          <p v-else class="plan__badge plan__badge--muted">{{ copy.pricing.noChaserNote }}</p>

          <ul class="plan__features">
            <li v-for="f in visibleFeatures(plan)" :key="f" class="feature">
              <svg viewBox="0 0 16 16" class="feature__tick" aria-hidden="true">
                <path
                  d="M3.4 8.4 6.4 11.4 12.6 4.6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <span>{{ f }}</span>
            </li>
          </ul>

          <a
            href="/register"
            class="k-btn plan__cta"
            :class="hasChaser(plan) && plan.price > 0 ? 'k-btn--primary' : 'k-btn--secondary'">
            {{ plan.price === 0 ? copy.pricing.ctaFree : copy.pricing.cta }}
          </a>
        </li>
      </ul>
      </template>

      <p class="pricing__footnote">{{ copy.pricing.footnote }}</p>
    </div>
  </section>
</template>

<style scoped>
.pricing {
  background-color: var(--surface-sunken);
}

.pricing__top {
  display: grid;
  gap: var(--space-7);
  margin-bottom: clamp(2.5rem, 5vw, 3.5rem);
}
.pricing__head {
  max-width: var(--measure);
}
.pricing__title {
  margin-block: var(--space-4) var(--space-5);
}

.pricing__status {
  padding: var(--space-8);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
  color: var(--text-secondary);
}
.pricing__status--error {
  display: grid;
  gap: var(--space-4);
  justify-items: center;
}

/* ─── Plan finder ───────────────────────────────────────────────────────── */
.finder {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-8);
  margin-bottom: var(--space-6);
  padding: clamp(1.5rem, 4vw, 2.75rem);
  border-radius: var(--radius-2xl);
  background-color: var(--surface-slab);
  color: var(--text-on-slab);
}
.finder__glow {
  position: absolute;
  z-index: -1;
  right: -8rem;
  top: -12rem;
  width: 28rem;
  height: 28rem;
  border-radius: var(--radius-full);
  background: radial-gradient(circle, var(--a-green-32), transparent 65%);
}
.finder__input {
  flex: 1.4 1 22rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.finder__q {
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
}
.finder__value {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  margin: 0;
}
.finder__n {
  min-width: 1.4ch;
  font-size: clamp(5rem, 10vw, 8rem);
  line-height: 0.85;
  letter-spacing: -0.03em;
  color: var(--text-on-slab-accent);
}
.finder__unit {
  color: var(--text-on-slab-muted);
}
.finder__range {
  --_p: 10%;
  width: 100%;
  height: 1.75rem;
  margin: 0;
  background: transparent;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}
.finder__range::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, var(--green-400) var(--_p), var(--a-paper-12) var(--_p));
}
.finder__range::-moz-range-track {
  height: 6px;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, var(--green-400) var(--_p), var(--a-paper-12) var(--_p));
}
.finder__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 26px;
  height: 26px;
  margin-top: -10px;
  border-radius: var(--radius-full);
  border: 4px solid var(--surface-slab);
  background-color: var(--green-400);
  box-shadow: 0 0 0 2px var(--green-400);
}
.finder__range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  border: 4px solid var(--surface-slab);
  background-color: var(--green-400);
  box-shadow: 0 0 0 2px var(--green-400);
}
.finder__range:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 4px;
}
.finder__ticks {
  display: flex;
  justify-content: space-between;
  margin: 0;
  font-size: var(--text-2xs);
  color: var(--ink-500);
}
.finder__result {
  flex: 1 1 18rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  background-color: var(--receipt-bg);
  color: var(--receipt-ink);
}
.finder__fit {
  margin: 0;
  font-size: var(--text-xs);
  font-weight: var(--weight-extrabold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-accent);
}
.finder__plan {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  margin: 0;
}
.finder__name {
  font-size: var(--text-3xl);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
}
.finder__price {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
}
.finder__price small {
  font-size: var(--text-sm);
  color: var(--receipt-ink-muted);
}
.finder__why {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--receipt-ink-muted);
}
.finder__cta {
  margin-top: var(--space-2);
  justify-content: center;
}

/* Recommended plan: ink card with a light travelling round its border. */
@property --ang {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
.plan--rec,
.plan--rec:hover {
  border: 2px solid transparent;
  background:
    linear-gradient(var(--surface-slab), var(--surface-slab)) padding-box,
    conic-gradient(from var(--ang), var(--ink-800) 0 70%, var(--green-400) 85%, var(--green-50) 90%, var(--ink-800) 100%) border-box;
  transform: translateY(-6px);
  box-shadow: var(--shadow-xl);
  animation: ang 4.5s linear infinite;
}
@keyframes ang {
  to { --ang: 360deg; }
}
.plan--rec .plan__name,
.plan--rec .plan__amount {
  color: var(--text-on-slab);
}
.plan--rec .plan__desc,
.plan--rec .plan__interval,
.plan--rec .plan__badge--muted,
.plan--rec .feature {
  color: var(--text-on-slab-muted);
}
.plan--rec .feature__tick {
  color: var(--green-400);
}
.plan__fit {
  margin-left: var(--space-2);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  background-color: var(--green-400);
  color: var(--ink-950);
  font-size: var(--text-2xs);
  font-weight: var(--weight-extrabold);
  vertical-align: middle;
}

@media (prefers-reduced-motion: reduce) {
  .plan--rec,
  .plan--rec:hover {
    animation: none;
  }
}

/* ─── Plans ─────────────────────────────────────────────────────────────── */
.plans {
  display: grid;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.plan {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background-color: var(--surface-raised);
  transition:
    border-color var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out);
}
.plan:hover {
  border-color: var(--border-accent);
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}
.plan--accent {
  border-color: var(--border-accent);
  box-shadow: var(--shadow-md);
}

.plan__name {
  font-size: var(--text-lg);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}
.plan__desc {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.plan__price {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}
.plan__amount {
  font-size: var(--text-2xl);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  color: var(--text-primary);
  line-height: 1;
}
.plan__interval {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.plan__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  align-self: flex-start;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  background-color: var(--surface-accent-soft);
  color: var(--text-accent);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
.plan__badge--muted {
  background-color: transparent;
  padding-inline: 0;
  color: var(--text-tertiary);
  text-transform: none;
  letter-spacing: var(--tracking-normal);
  font-weight: var(--weight-regular);
  font-size: var(--text-xs);
}
.plan__badge-ico {
  width: 13px;
  height: 13px;
}

.plan__features {
  display: grid;
  gap: var(--space-3);
  align-content: start; /* rows must not stretch to fill a taller card */
  margin: 0;
  padding: 0;
  list-style: none;
  flex: 1;
}
.feature {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-3);
  align-items: start;
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}
.feature__tick {
  width: 15px;
  height: 15px;
  margin-top: 3px;
  color: var(--text-accent);
}

.plan__cta {
  width: 100%;
  margin-top: var(--space-2);
}

/* ─── Foot ──────────────────────────────────────────────────────────────── */
.pricing__footnote {
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-default);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}
.custom {
  align-self: end;
  padding: var(--space-6);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background-color: var(--surface-raised);
}
.custom__title {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}
.custom__body {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
  margin-bottom: var(--space-5);
}
.custom__cta {
  width: 100%;
}

/* ─── Breakpoints ───────────────────────────────────────────────────────── */

/* Below 1024 the two-column header collapses, which would drop the "need
   something bigger" upsell between the heading and the plans — asking for a
   custom quote before showing a single price. display:contents promotes the
   header's children into the section flow so they can be reordered. */
@media (max-width: 1023px) {
  .pricing__top {
    display: contents;
  }
  .pricing__inner {
    display: flex;
    flex-direction: column;
  }
  .pricing__head {
    order: 1;
    margin-bottom: clamp(2rem, 5vw, 3rem);
  }
  .plans,
  .pricing__status {
    order: 2;
  }
  .custom {
    order: 3;
    margin-top: var(--space-7);
  }
  .pricing__footnote {
    order: 4;
  }
}

@media (min-width: 640px) {
  .plans {
    grid-template-columns: repeat(min(var(--_cols, 3), 2), minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .plans {
    grid-template-columns: repeat(var(--_cols, 3), minmax(0, 1fr));
    gap: var(--space-3);
  }
  .plan {
    padding: var(--space-5);
  }
  .pricing__top {
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 0.85fr);
    gap: clamp(2.5rem, 5vw, 4rem);
    align-items: end;
  }
  .custom__cta {
    width: auto;
  }
}
@media (min-width: 1600px) {
  .plans {
    gap: var(--space-4);
  }
  .plan {
    padding: var(--space-6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .plan:hover {
    transform: none;
  }
}
</style>
