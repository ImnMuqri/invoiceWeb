<script setup>
/**
 * Settings → Payments.
 *
 * How a client can actually pay. One card per method, and exactly one of them
 * marked as the one that goes on the invoice.
 *
 * This was about 400 lines: the same ~75-line card copied four times with a
 * different provider string, plus a fifth variant for bank transfer, plus a
 * "security" panel. The four gateways now come from GATEWAYS below, so adding a
 * fifth is a line of config rather than another copy.
 *
 * Two things that were wrong beyond the duplication:
 *
 *  - The "preferred" control was an absolutely-positioned div in the card's
 *    corner with a click handler, no input, no label and no accessible name — a
 *    radio group built out of four unrelated divs, unreachable by keyboard. It
 *    is a real radio group now, in each card's footer where a label fits.
 *
 *  - It only appeared once `paymentProviders.length > 1`, so with a single
 *    gateway connected there was no way to see which method your invoices were
 *    using. It always shows now, because "which one do my clients get" is a
 *    question you can have with one provider connected.
 *
 * The logos were hot-linked from crunchbase.com, a DigitalOcean bucket,
 * githubusercontent and glassdoor.com — four third-party URLs that could break
 * or change without notice, each leaking a referrer hit from this page. Three
 * are now in /public/gateways; glassdoor blocks fetching, so SenangPay falls
 * back to a monogram, which is also what any logo that fails to load gets.
 */
import { computed } from "vue";

const props = defineProps({
  form: { type: Object, required: true },
  providers: { type: Array, default: () => [] },
});

const emit = defineEmits(["connect", "disconnect", "prefer", "prefer-manual", "edit-manual"]);

const GATEWAYS = [
  {
    key: "TOYYIBPAY",
    name: "ToyyibPay",
    note: "FPX, DuitNow and cards",
    logo: "/gateways/toyyibpay.jpg",
  },
  {
    key: "BILLPLZ",
    name: "Billplz",
    note: "FPX and cards",
    logo: "/gateways/billplz.png",
  },
  {
    key: "HITPAY",
    name: "HitPay",
    note: "Cards, FPX and e-wallets",
    logo: "/gateways/hitpay.png",
  },
  {
    key: "SENANGPAY",
    name: "SenangPay",
    note: "Cards and FPX",
    logo: null,
  },
];

/** Logos that failed to load fall back to a monogram rather than a broken icon. */
const broken = ref({});

const monogram = (name) => name.slice(0, 2).toUpperCase();

const connected = (key) => props.providers.some((p) => p.provider === key);
const preferred = (key) =>
  props.providers.some((p) => p.provider === key && p.isPreferred);

const manualReady = computed(
  () => !!props.form.manualBankName && !!props.form.manualAccountNumber,
);

/* Bank transfer is the fallback: it is what clients get when no gateway is
   marked preferred, which is also the state when nothing is connected at all. */
const manualPreferred = computed(() => !props.providers.some((p) => p.isPreferred));

const liveCount = computed(
  () => props.providers.length + (manualReady.value ? 1 : 0),
);
</script>

<template>
  <div>
    <section class="sec">
      <div class="sec__head">
        <h2 class="sec__title">How clients pay you</h2>
        <p class="sec__note">
          <template v-if="!liveCount">
            Nothing is set up yet, so invoices go out without a way to pay them.
            Bank transfer is the quickest to add.
          </template>
          <template v-else>
            {{ liveCount }} {{ liveCount === 1 ? "method" : "methods" }} set up.
            The one marked below is what appears on your invoices.
          </template>
        </p>
      </div>

      <div class="gw">
        <!-- ── Bank transfer ────────────────────────────────────────────── -->
        <div class="gw__card" :class="{ 'gw__card--on': manualPreferred && manualReady }">
          <div class="gw__head">
            <span class="gw__logo" aria-hidden="true">
              <UiIcon icon="heroicons:banknotes" custom-class="w-4 h-4" />
            </span>
            <span style="min-width: 0">
              <span class="gw__name">Bank transfer</span>
              <span class="gw__note">They transfer, you confirm</span>
            </span>
          </div>

          <p class="gw__state" :class="{ 'gw__state--on': manualReady }">
            {{ manualReady ? `${form.manualBankName} · set up` : "Not set up" }}
          </p>

          <div class="gw__acts">
            <button
              type="button"
              class="desk-btn desk-btn--sm"
              :class="manualReady ? 'desk-btn--ghost' : 'desk-btn--primary'"
              @click="emit('edit-manual')">
              {{ manualReady ? "Edit details" : "Add your account" }}
            </button>
          </div>

          <label v-if="manualReady" class="gw__prefer" :class="{ 'gw__prefer--on': manualPreferred }">
            <input
              type="radio"
              name="preferred-method"
              class="pickcard__inp"
              :checked="manualPreferred"
              @change="emit('prefer-manual')" />
            <span class="pickcard__mark" aria-hidden="true">
              <UiIcon icon="heroicons:check-16-solid" custom-class="w-3 h-3" />
            </span>
            {{ manualPreferred ? "On your invoices" : "Use this one" }}
          </label>
        </div>

        <!-- ── Gateways ─────────────────────────────────────────────────── -->
        <div
          v-for="g in GATEWAYS"
          :key="g.key"
          class="gw__card"
          :class="{ 'gw__card--on': preferred(g.key) }">
          <div class="gw__head">
            <span class="gw__logo" aria-hidden="true">
              <img
                v-if="g.logo && !broken[g.key]"
                :src="g.logo"
                :alt="g.name"
                @error="broken[g.key] = true" />
              <template v-else>{{ monogram(g.name) }}</template>
            </span>
            <span style="min-width: 0">
              <span class="gw__name">{{ g.name }}</span>
              <span class="gw__note">{{ g.note }}</span>
            </span>
          </div>

          <p class="gw__state" :class="{ 'gw__state--on': connected(g.key) }">
            {{ connected(g.key) ? "Connected" : "Not connected" }}
          </p>

          <div class="gw__acts">
            <template v-if="connected(g.key)">
              <button
                type="button"
                class="desk-btn desk-btn--ghost desk-btn--sm"
                @click="emit('connect', g.key)">
                Edit keys
              </button>
              <button
                type="button"
                class="desk-btn desk-btn--danger desk-btn--sm"
                @click="emit('disconnect', g)">
                Disconnect
              </button>
            </template>
            <button
              v-else
              type="button"
              class="desk-btn desk-btn--primary desk-btn--sm"
              @click="emit('connect', g.key)">
              Connect
            </button>
          </div>

          <label
            v-if="connected(g.key)"
            class="gw__prefer"
            :class="{ 'gw__prefer--on': preferred(g.key) }">
            <input
              type="radio"
              name="preferred-method"
              class="pickcard__inp"
              :checked="preferred(g.key)"
              @change="emit('prefer', g.key)" />
            <span class="pickcard__mark" aria-hidden="true">
              <UiIcon icon="heroicons:check-16-solid" custom-class="w-3 h-3" />
            </span>
            {{ preferred(g.key) ? "On your invoices" : "Use this one" }}
          </label>
        </div>
      </div>
    </section>

    <section class="sec">
      <div class="banner">
        <UiIcon icon="heroicons:lock-closed" custom-class="w-5 h-5" />
        <span>
          Your gateway keys are stored encrypted and used only to raise a payment
          for your own invoices. We never see your bank login, and bank transfers
          are not something we can detect — you mark those paid yourself.
        </span>
      </div>
    </section>
  </div>
</template>
