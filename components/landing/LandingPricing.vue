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
      <ul v-else class="plans" :style="{ '--_cols': columns }">
        <li
          v-for="plan in plans"
          :key="plan.id"
          class="plan"
          :class="{ 'plan--accent': hasChaser(plan) && plan.price > 0 }"
          data-reveal
          data-reveal-group="plans">
          <header class="plan__head">
            <h3 class="plan__name">{{ plan.name }}</h3>
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
