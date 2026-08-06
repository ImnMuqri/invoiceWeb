<script setup>
/**
 * Settings → Billing.
 *
 * What you are on, what a promo code does to the price, and what else exists.
 *
 * THE CRASH. Three places did `authStore.user?.plan.toUpperCase()`. The `?.`
 * guards `user` and not `plan`, so an account whose `plan` is null threw a
 * TypeError and blanked the tab — while the same template twelve lines up wrote
 * `authStore.user?.plan || "Free"`, so absence was already known to be possible.
 * Plan comparison goes through `same()` now, which coerces before it compares.
 *
 * THE COLOUR. Tiers were painted by name: emerald for Starter, slate-900 for
 * Pro, an indigo gradient for Max, rose for cancel — four ramps for one job, two
 * from outside the palette, plus `shadow-emerald-600/20` and
 * `shadow-indigo-600/30` glows. Worse, it keyed off four hard-coded strings, so
 * a fifth plan coming back from /plans rendered with no styling at all.
 *
 * Tiers are told apart by surface and weight instead. Every card is paper with a
 * hairline; the one you are on steps up to the ink slab the marketing site
 * already uses for emphasis. One treatment, from the brand, and it works for
 * however many plans the API returns.
 *
 * THE BUTTON. Its class list was a twenty-five-line nested ternary and its label
 * a three-deep `v-if`. Both come from `cta()` now — one function returning the
 * label, the variant and whether it is available, so the rules are readable and
 * the disabled reason is a sentence rather than an inference.
 */
import { computed } from "vue";

const props = defineProps({
  plans: { type: Array, default: () => [] },
  plan: { type: String, default: "FREE" },
  subscription: { type: Object, default: null },
  cancelling: { type: Boolean, default: false },
  promo: { type: Object, required: true },
});

const emit = defineEmits([
  "choose",
  "cancel",
  "apply-promo",
  "clear-promo",
  "update:code",
]);

const norm = (v) => String(v ?? "").trim().toUpperCase();
const same = (a, b) => norm(a) === norm(b);

const current = computed(() => norm(props.plan) || "FREE");
const isFree = computed(() => current.value === "FREE");

const renews = computed(() => {
  const end = props.subscription?.subscriptionEnds;
  if (!end) return "";
  return new Date(end).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});

const discounted = (price) => {
  const n = parseFloat(price);
  if (!Number.isFinite(n) || n === 0) return n || 0;
  const d = props.promo.applied;
  if (!props.promo.valid || !d) return n;
  const off =
    d.discountType === "PERCENTAGE" ? n * (Number(d.discountValue) / 100) : Number(d.discountValue);
  return Math.max(0, n - (Number.isFinite(off) ? off : 0));
};

const cheaper = (price) => discounted(price) < parseFloat(price || 0);

const money = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

/**
 * One place deciding what the button on a plan card says and does.
 * `why` is only set when unavailable, and it is shown rather than implied.
 */
const cta = (p) => {
  const mine = same(p.name, current.value);
  if (mine && norm(p.name) === "FREE")
    return { label: "You are on this", variant: "ghost", ok: false, why: "" };
  if (mine && props.cancelling)
    return {
      label: "Ending soon",
      variant: "ghost",
      ok: false,
      why: renews.value ? `Runs until ${renews.value}, then drops to Free.` : "",
    };
  if (mine)
    return { label: "Cancel this plan", variant: "ghost", ok: true, why: "" };
  if (!isFree.value && !props.cancelling)
    return {
      label: "Switch",
      variant: "ghost",
      ok: false,
      why: "Cancel your current plan first, then pick this one.",
    };
  return { label: `Choose ${p.name}`, variant: "primary", ok: true, why: "" };
};
</script>

<template>
  <div>
    <!-- ── Where you stand ──────────────────────────────────────────────── -->
    <section class="sec">
      <div class="banner" :class="{ 'banner--late': cancelling }">
        <UiIcon
          :icon="cancelling ? 'heroicons:clock' : 'heroicons:check-circle-solid'"
          custom-class="w-5 h-5" />
        <span>
          You are on the <b>{{ current }}</b> plan.
          <template v-if="cancelling && renews">
            It ends {{ renews }}, and you move to Free after that.
          </template>
          <template v-else-if="renews">It renews {{ renews }}.</template>
          <template v-else-if="isFree">
            No card on file, nothing to cancel.
          </template>
        </span>
        <button
          v-if="!isFree && !cancelling"
          type="button"
          class="desk-btn desk-btn--ghost desk-btn--sm"
          @click="emit('cancel')">
          Cancel plan
        </button>
      </div>
    </section>

    <!-- ── Promo ────────────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Got a code?</h2>
      </div>
      <div class="bar">
        <div class="f bar__grow" style="margin: 0; max-width: 20rem">
          <label class="sr-only" for="promo">Promo code</label>
          <input
            id="promo"
            :value="promo.code"
            type="text"
            class="inp no-ik"
            style="text-transform: uppercase"
            placeholder="Enter a code"
            :disabled="promo.valid || promo.loading"
            @input="emit('update:code', $event.target.value)" />
        </div>
        <button
          v-if="!promo.valid"
          type="button"
          class="desk-btn desk-btn--ghost"
          :disabled="!promo.code || promo.loading"
          @click="emit('apply-promo')">
          <UiIcon
            v-if="promo.loading"
            icon="heroicons:arrow-path"
            custom-class="w-4 h-4 spin" />
          {{ promo.loading ? "Checking…" : "Apply" }}
        </button>
        <button
          v-else
          type="button"
          class="desk-btn desk-btn--ghost"
          @click="emit('clear-promo')">
          Remove
        </button>
      </div>
      <p v-if="promo.error" class="f__hint" style="color: var(--desk-late)">
        {{ promo.error }}
      </p>
      <p v-else-if="promo.valid" class="f__hint" style="color: var(--desk-accent)">
        {{ promo.text }} off — the prices below already include it.
      </p>
    </section>

    <!-- ── Plans ────────────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Plans</h2>
      </div>

      <div v-if="!plans.length" class="empty empty--pad">
        <p class="empty__title">Plans are not loading.</p>
        <p class="empty__body">
          Refresh the page. If it keeps happening, email support@invokita.my and
          we will sort it out.
        </p>
      </div>

      <div v-else class="plans">
        <article
          v-for="p in plans"
          :key="p.id"
          class="plan"
          :class="{ 'plan--now': same(p.name, current) }">
          <div class="plan__top">
            <div style="min-width: 0">
              <h3 class="plan__name">{{ p.name }}</h3>
              <p class="plan__desc">{{ p.description }}</p>
            </div>
            <span v-if="same(p.name, current)" class="plan__tag">Current</span>
          </div>

          <p class="plan__price">
            <span v-if="cheaper(p.price)" class="plan__was">
              {{ p.currency }} {{ money(p.price) }}
            </span>
            <span>{{ p.currency }} {{ money(discounted(p.price)) }}</span>
            <span class="plan__per">/{{ p.interval }}</span>
          </p>

          <ul class="plan__feats">
            <li v-for="f in p.features" :key="f" class="plan__feat">
              <UiIcon icon="heroicons:check-16-solid" custom-class="w-3 h-3" />
              {{ f }}
            </li>
          </ul>

          <button
            type="button"
            class="desk-btn desk-btn--block"
            :class="
              cta(p).variant === 'primary'
                ? 'desk-btn--primary'
                : 'desk-btn--ghost'
            "
            :disabled="!cta(p).ok"
            @click="emit('choose', p)">
            {{ cta(p).label }}
          </button>
          <p v-if="cta(p).why" class="plan__desc" style="margin: 0">
            {{ cta(p).why }}
          </p>
        </article>
      </div>

      <p class="f__hint" style="margin-top: 1.5rem">
        Need something these do not cover?
        <a href="mailto:contact@invokita.com" class="card__link">Tell us what you need</a>.
      </p>
    </section>
  </div>
</template>
