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
import { computed, onMounted, ref } from "vue";
/* No `money` import: this file already aliases it to `price` below, which is
   the sen boundary the plan cards use. Importing the other one would give the
   top-up prices a different formatter from the plan prices sitting under them. */
import { price, toSen } from "~/utils/invoice";
import { useTopUpStore } from "~/stores/topUpStore";
import { useSystemStore } from "~/stores/systemStore";

const props = defineProps({
  plans: { type: Array, default: () => [] },
  plan: { type: String, default: "FREE" },
  subscription: { type: Object, default: null },
  cancelling: { type: Boolean, default: false },
  promo: { type: Object, required: true },
});

/* ── Top-ups (spec 01) ──────────────────────────────────────────────────────
   The backend has had this since spec 01 and the dashboard has had two "Top up"
   links, but neither had anywhere to land: this tab rendered a promo box and a
   plan list, so somebody whose WhatsApp allowance ran out mid-month was offered
   a bigger subscription instead of the small thing they came for. */
const topUps = useTopUpStore();
const topUpError = ref("");

onMounted(() => topUps.fetchTopUps());

const buyTopUp = async (blockKey) => {
  topUpError.value = "";
  try {
    const url = await topUps.buy(blockKey);
    if (url) {
      /* A full navigation, not a new tab: the gateway sends the user back to
         this exact page with ?topup=success, and a popup would strand that
         return on a window the original page cannot see. */
      window.location.href = url;
    } else {
      topUpError.value = "Could not open checkout. Try again in a moment.";
    }
  } catch (err) {
    topUpError.value = topUps.error || "Could not start that purchase.";
  }
};

const emit = defineEmits([
  "choose",
  "cancel",
  "apply-promo",
  "clear-promo",
  "update:code",
]);

const norm = (v) => String(v ?? "").trim().toUpperCase();
const same = (a, b) => norm(a) === norm(b);

/* ── The admin's "paid plans" switch ────────────────────────────────────────
   Off means nobody may move onto a paid plan. It does NOT touch a plan somebody
   already has, and it does NOT block cancelling down to Free — `cta()` below
   keeps both of those paths open, and the server agrees (systemGuards lets FREE
   through, since that is the cancellation path). The cards stay on the page,
   dimmed, so this reads as paused rather than as a product with one plan.

   The layout fetches the switches on mount; the default is on, so the worst a
   slow response does is show a live button for a moment. Pressing it in that
   moment gets a 403 with the same explanation rather than a charge. */
const system = useSystemStore();
const upgradesOn = computed(() => system.arePlanUpgradesEnabled);
const paused = (p) => !upgradesOn.value && !same(p.name, current.value) && Number(p.price) > 0;

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

/**
 * Both arguments and the result are SEN, matching Plan.price.
 *
 * The FIXED branch is the one place the two units genuinely meet: PromoCode
 * .discountValue is a Float an admin typed, and nobody types "500" meaning
 * RM5 off. It is read as ringgit and converted, the same reading the backend's
 * `applyDiscount` uses when it charges the card — the two must agree, or the
 * card is charged something other than the price on the card.
 */
const discounted = (senPrice) => {
  const n = Number(senPrice);
  if (!Number.isFinite(n) || n === 0) return n || 0;
  const d = props.promo.applied;
  if (!props.promo.valid || !d) return n;
  const off =
    d.discountType === "PERCENTAGE"
      ? n * (Number(d.discountValue) / 100)
      : toSen(d.discountValue);
  return Math.max(0, Math.round(n - (Number.isFinite(off) ? off : 0)));
};

const cheaper = (senPrice) => discounted(senPrice) < (Number(senPrice) || 0);

/* `money` here is the shared sen formatter — a local one used to shadow it and
   print Plan.price raw, so the PRO card offered the plan at "MYR 2,900". */
const money = price;

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
  /* Checked before the "cancel first" rule: when both apply, the pause is the
     one that is actually binding, and telling somebody to cancel their plan so
     they can switch to one they cannot buy would be the worst possible advice
     to give them. */
  if (paused(p))
    return {
      label: "Paused",
      variant: "ghost",
      ok: false,
      why: "Plan changes are paused right now. Your current plan is unaffected.",
    };
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

    <!-- ── Promo ──────────────────────────────────────────────────────────
         Hidden while paid plans are paused. A code only ever changes the price
         of a plan, so with every paid plan out of reach this is a box that can
         do nothing but say "Applied" and then leave you nowhere to spend it. -->
    <section v-if="upgradesOn" class="sec">
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

    <!-- ── Top-ups (spec 01) ────────────────────────────────────────────────
         Deliberately ABOVE the plan list. Everybody who arrives here from a
         "Top up" link has one specific question — how do I send more messages
         this month — and answering it with a plan comparison is answering a
         small question with a big one. The plans are still underneath for
         anybody who decides the bigger answer is the right one.
    -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Need more this month?</h2>
        <p class="sec__note">
          Extra chased invoices for
          {{ topUps.periodKey || "the current period" }}, on top of your plan.
        </p>
      </div>

      <div v-if="topUps.balance" class="banner" style="margin-bottom: var(--space-4)">
        <UiIcon icon="heroicons:bolt" custom-class="w-5 h-5" />
        <span>
          You have <b>{{ topUps.balance }}</b> topped-up
          {{ topUps.balance === 1 ? "chase" : "chases" }} left this period.
        </span>
      </div>

      <div v-if="topUps.loading && !topUps.blocks.length" class="empty empty--pad">
        <p class="empty__body">Loading…</p>
      </div>

      <div v-else-if="!topUps.blocks.length" class="empty empty--pad">
        <p class="empty__title">Top-ups are not available right now.</p>
        <p class="empty__body">
          {{ topUps.error || "Try again in a moment." }}
        </p>
      </div>

      <div v-else class="topups">
        <article v-for="b in topUps.blocks" :key="b.key" class="topup">
          <div class="topup__body">
            <p class="topup__n">
              {{ b.chasedInvoices }}
              <span>extra {{ b.chasedInvoices === 1 ? "chase" : "chases" }}</span>
            </p>
            <p class="topup__price">RM {{ money(b.price) }}</p>
          </div>
          <button
            type="button"
            class="desk-btn desk-btn--primary desk-btn--sm"
            :disabled="!!topUps.buying"
            @click="buyTopUp(b.key)">
            <UiIcon
              v-if="topUps.buying === b.key"
              icon="heroicons:arrow-path"
              custom-class="w-4 h-4 spin" />
            {{ topUps.buying === b.key ? "Opening…" : "Buy" }}
          </button>
        </article>
      </div>

      <!-- Said plainly at the point of purchase, per the spec, rather than
           buried in terms somebody reads afterwards. -->
      <p v-if="topUps.note" class="f__hint">{{ topUps.note }}</p>
      <p v-if="topUpError" class="f__hint" style="color: var(--desk-late)">
        {{ topUpError }}
      </p>
    </section>

    <!-- ── Plans ────────────────────────────────────────────────────────── -->
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">Plans</h2>
      </div>

      <div v-if="!upgradesOn" class="banner" style="margin-bottom: var(--space-4)">
        <UiIcon icon="heroicons:pause-circle" custom-class="w-5 h-5" />
        <span>
          Plan changes are paused across the platform for now, so these cannot be
          selected. Whatever you are on keeps running exactly as it is, and you
          can still cancel down to Free.
        </span>
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
          :class="{ 'plan--now': same(p.name, current), 'plan--locked': paused(p) }"
          :aria-disabled="paused(p) || undefined">
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

<style scoped>
/* ─── Paused by the admin switch ──────────────────────────────────────────
   The card stays — it is the reason somebody would come back — but plainly out
   of reach. Dimmed, desaturated, and inert: nothing inside can be clicked or
   tabbed to. The button carries `disabled` as well, so the state is announced
   and not merely drawn. `.plan.plan--locked` rather than `.plan--locked` so it
   outranks `.desk .plan` in app-desk.css whichever way the sheets are ordered.
   ───────────────────────────────────────────────────────────────────────── */
.plan.plan--locked {
  opacity: 0.5;
  filter: saturate(0.55);
  pointer-events: none;
}

/* ─── Top-up blocks (spec 01) ─────────────────────────────────────────────
   Deliberately not styled like the plan cards below. A top-up is a small,
   reversible, one-off purchase and a plan is a commitment; making them look
   alike invites somebody to buy the wrong one. Two flat rows, price stated,
   nothing selling. */
.topups {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
}
.topup {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--desk-line);
  border-radius: var(--desk-radius-inset);
  background-color: var(--desk-card);
}
.topup__n {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--desk-text);
  line-height: 1.2;
}
.topup__n span {
  display: block;
  font-size: var(--text-xs);
  font-weight: var(--weight-normal);
  color: var(--desk-text-3);
  margin-top: 2px;
}
.topup__price {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
  color: var(--desk-text-2);
}
</style>
