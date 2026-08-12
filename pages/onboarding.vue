<script setup>
/**
 * Workspace setup, in the KIRIM system.
 *
 * Same five steps and the same payload as before — role, discovery, profile,
 * client import, plan. What changed is that the screen is now built from the
 * design tokens instead of raw Tailwind slate/emerald, so it is the same room
 * as the landing page and the register screen the user just came from, and it
 * follows the theme instead of being permanently light.
 *
 * Three things that were not just paint:
 *
 *   1. `zoom: 0.9` on the page root is gone. It shrank every dimension by 10%,
 *      including the ones that make a tap target legal and the ones that make
 *      16px inputs not trigger iOS Safari's zoom-on-focus.
 *   2. Step 3 validated all five fields into one sentence at the bottom of the
 *      form. It now marks the field that is actually wrong, like register.vue.
 *   3. The Xendit failure URL has always come back to `?payment_failed=true`
 *      and the page has never said anything about it, so a declined card
 *      landed silently on the plan grid. It is now acknowledged.
 *
 * The client import is still the Clients page's own modal — one implementation,
 * so the onboarding path cannot drift from the permanent one.
 */
import { useAuthStore } from '~/stores/authStore'
import { useSubscribeStore } from '~/stores/subscribeStore'
import { useSystemStore } from '~/stores/systemStore'
import { price, currencySymbol } from '~/utils/invoice'

definePageMeta({ layout: false })

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const subscribeStore = useSubscribeStore()
const systemStore = useSystemStore()

/* The rail reads this. Hints are written for the person on that step, not as
   descriptions of the feature. */
const STEPS = [
  { label: 'What you do', hint: 'So we lead with the parts you will actually use.' },
  { label: 'Where you found us', hint: 'One tap. It tells us what is worth doing again.' },
  { label: 'Your details', hint: 'You, and what prints at the top of an invoice.' },
  { label: 'Your clients', hint: 'Paste a list now, or do it later from Clients.', optional: true },
  { label: 'Choose a plan', hint: 'Start free. Change it whenever you like.' },
]
const LAST = STEPS.length

const ROLES = [
  { value: 'Freelancer / Solopreneur', description: 'Just me, billing my own clients.' },
  { value: 'Small Business Owner', description: 'A business name goes on the invoice.' },
  { value: 'Agency / Studio', description: 'Retainers and project work, several clients at once.' },
  { value: 'Finance Team', description: 'I invoice on behalf of the business.' },
  { value: 'Other', description: '' },
]

const SOURCES = [
  'Social Media',
  'Google Search',
  'Friend / Colleague',
  'Advertisement',
  'Blog / Article',
  'Other',
]

const step = ref(parseInt(route.query.step) || 1)

watch(step, (next) => {
  router.replace({ query: { ...route.query, step: next } })
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
})

/* Backwards only — forwards has to clear validation. */
const goTo = (n) => {
  if (n < step.value) step.value = n
}

/* ── Form ─────────────────────────────────────────────────────────────────── */
const form = reactive({
  currentStatus: '',
  heardAbout: '',
  name: '',
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  phoneNumber: '',
})

const useUserEmail = ref(false)
const useUserPhone = ref(false)

const syncEmail = () => {
  form.companyEmail = useUserEmail.value ? authStore.user?.email || '' : ''
}

const syncPhone = () => {
  form.companyPhone = useUserPhone.value ? form.phoneNumber || '' : ''
}

/* The mirror has to keep mirroring. Ticking "same as mine" and then typing the
   personal number — which is the order most people do it in — used to leave the
   company number on whatever had been copied at the moment of the tick. */
watch(
  () => form.phoneNumber,
  (v) => {
    if (useUserPhone.value) form.companyPhone = v
  }
)

onMounted(() => {
  const u = authStore.user
  if (!u) return
  if (u.name) form.name = u.name
  if (u.email) form.companyEmail = u.email
  if (u.companyName) form.companyName = u.companyName
  if (u.companyPhone) form.companyPhone = u.companyPhone
  if (u.phoneNumber) form.phoneNumber = u.phoneNumber
  /* The company email is prefilled from the login email above, so the checkbox
     that says so must start ticked. It did not, which read as "this was typed
     for you and we do not know why". */
  if (u.email && form.companyEmail === u.email) useUserEmail.value = true
  if (u.phoneNumber && form.companyPhone === u.phoneNumber) useUserPhone.value = true
})

/* ── Validation ───────────────────────────────────────────────────────────── */
const stepError = ref('')
const fieldErrors = ref({})
const error = ref('')

const clearField = (key) => {
  if (fieldErrors.value[key]) fieldErrors.value = { ...fieldErrors.value, [key]: undefined }
}
watch(() => form.name, () => clearField('name'))
watch(() => form.phoneNumber, () => clearField('phoneNumber'))
watch(() => form.companyName, () => clearField('companyName'))
watch(() => form.companyEmail, () => clearField('companyEmail'))
watch(() => form.companyPhone, () => clearField('companyPhone'))
watch(() => form.currentStatus, () => (stepError.value = ''))
watch(() => form.heardAbout, () => (stepError.value = ''))

const validateProfile = () => {
  const next = {}
  if (!form.name.trim()) next.name = 'We need a name to put on your invoices.'
  if (!form.phoneNumber.trim()) next.phoneNumber = 'Add a number we can reach you on.'
  if (!form.companyName.trim()) next.companyName = 'This is the name your clients will see.'
  if (!form.companyEmail.trim()) next.companyEmail = 'Add the email replies should go to.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.companyEmail.trim()))
    next.companyEmail = 'That does not look like an email address.'
  if (!form.companyPhone.trim()) next.companyPhone = 'Add the number printed on the invoice.'
  fieldErrors.value = next
  return Object.keys(next).length === 0
}

const nextStep = () => {
  stepError.value = ''
  if (step.value === 1 && !form.currentStatus) {
    stepError.value = 'Pick the one that fits closest — none of them lock anything in.'
    return
  }
  if (step.value === 2 && !form.heardAbout) {
    stepError.value = 'Pick one so we know what is working.'
    return
  }
  if (step.value === 3 && !validateProfile()) return
  if (step.value < LAST) step.value++
}

/* ── Client import (spec 08) ──────────────────────────────────────────────────
   `importedCount` only changes what step 4 SAYS. Nothing about it gates
   Continue, because a new user who does not have their client list to hand must
   never be stuck behind an optional step. */
const showImport = ref(false)
const importedCount = ref(0)

/* The import modal is the app's own component, so its dark styling answers to
   `html.dark` while this page answers to [data-theme]. The class is borrowed
   for exactly as long as the modal is open — not for the whole page, which
   would race the head script that clears it, and not never, which would open a
   white modal on a dark screen. `flush: 'sync'` so the class lands before the
   modal renders rather than a frame after it. */
watch(
  showImport,
  (open) => {
    if (!import.meta.client) return
    const root = document.documentElement
    root.classList.toggle('dark', open && root.getAttribute('data-theme') === 'dark')
  },
  { flush: 'sync' }
)

const onImported = (result) => {
  importedCount.value += (result?.counts?.created || 0) + (result?.counts?.updated || 0)
  showImport.value = false
}

/* ── Plans ────────────────────────────────────────────────────────────────── */
const rawPlans = ref([])
const plansLoading = ref(true)
const plansFailed = ref(false)

const fetchPlans = async () => {
  const { $api } = useNuxtApp()
  plansLoading.value = true
  try {
    const { data } = await $api.get('/plans')
    rawPlans.value = Array.isArray(data) ? data : []
    plansFailed.value = rawPlans.value.length === 0
  } catch (err) {
    console.error('Failed to fetch plans', err)
    plansFailed.value = true
  } finally {
    plansLoading.value = false
  }
}

/* This page runs with no layout, so nothing else fetches the platform switches
   for it. Soft-fails to "everything on"; the server enforces regardless. */
onMounted(() => {
  fetchPlans()
  systemStore.fetchConfig()
})

/* The admin switch. Off means Free is the only plan anyone can start on — the
   rest stay on screen, dimmed and inert, because a plan list that silently
   shrinks reads as "this product has one plan" rather than "this is paused". */
const canUpgrade = computed(() => systemStore.arePlanUpgradesEnabled)
const isFreePlan = (plan) => Number(plan.price) === 0
const canChoose = (plan) => canUpgrade.value || isFreePlan(plan)

/* Cheapest first, and retired plans stay out — the page was rendering whatever
   order the API returned and showing inactive rows, which the public pricing
   page has never done. */
const plans = computed(() =>
  rawPlans.value
    .filter((p) => p.isActive !== false)
    .slice()
    .sort((a, b) => a.price - b.price)
)
const columns = computed(() => Math.min(Math.max(plans.value.length, 1), 4))

/* Which plan gets which treatment. These mirror the public pricing page — the
   plan it accents is the plan someone will expect to see accented here, one
   screen later — and they are names, not colours: the accent and the ink slab
   both come out of the palette, so no plan needs a hue the brand does not have.
   Anything not named here renders as a plain card. */
const RECOMMENDED = 'PRO'
const FLAGSHIP = 'MAX'
const isRecommended = (plan) => plan.name.toUpperCase() === RECOMMENDED
const isFlagship = (plan) => plan.name.toUpperCase() === FLAGSHIP

/* Nobody in Malaysia writes "MYR 19" on a price tag. The mapping already
   exists in utils/invoice — a second copy here is how the two drift. */
const symbolFor = (plan) => currencySymbol(plan.currency)

/* ── Promo ────────────────────────────────────────────────────────────────── */
const promoCodeInput = ref('')
const isPromoValid = ref(false)
const promoLoading = ref(false)
const promoError = ref('')
const appliedDiscount = ref(null)

const validatePromo = async () => {
  if (!promoCodeInput.value) return
  promoLoading.value = true
  promoError.value = ''
  try {
    const { $api } = useNuxtApp()
    const { data } = await $api.post('/promo/validate', { code: promoCodeInput.value })
    appliedDiscount.value = data
    isPromoValid.value = true
  } catch (err) {
    promoError.value = err.response?.data?.message || 'That code did not work.'
    isPromoValid.value = false
  } finally {
    promoLoading.value = false
  }
}

const clearPromo = () => {
  promoCodeInput.value = ''
  isPromoValid.value = false
  appliedDiscount.value = null
  promoError.value = ''
}

/**
 * Sen in, sen out — Plan.price is sen, like every money column.
 *
 * The FIXED branch converts `discountValue`, which is a Float an admin typed
 * and therefore ringgit. This has to match the backend's `applyDiscount`
 * exactly: this function decides the number on the card, that one decides the
 * number on the customer's statement, and the two disagreeing is the worst
 * possible bug in a checkout.
 */
const getDiscountedPrice = (senPrice) => {
  const base = Number(senPrice) || 0
  if (!base) return 0
  if (!isPromoValid.value || !appliedDiscount.value) return base

  const d = appliedDiscount.value
  const discounted =
    d.discountType === 'PERCENTAGE'
      ? base - base * (Number(d.discountValue) / 100)
      : base - Number(d.discountValue) * 100
  return Math.max(0, Math.round(discounted))
}

const isDiscounted = (plan) =>
  isPromoValid.value && !!appliedDiscount.value && getDiscountedPrice(plan.price) < plan.price

const appliedDiscountText = computed(() => {
  if (!appliedDiscount.value) return ''
  const d = appliedDiscount.value
  return d.discountType === 'PERCENTAGE' ? `${d.discountValue}%` : `RM ${d.discountValue}`
})

/* ── Submit ───────────────────────────────────────────────────────────────── */
const loading = ref(false)

/* Xendit sends a declined card back here. Nothing used to read it. */
const paymentFailed = ref(route.query.payment_failed === 'true')

const selectPlan = async (plan) => {
  /* Belt and braces. The card is inert and its button disabled, so this only
     catches a stale view — the switch having flipped while this step was open. */
  if (!canUpgrade.value && String(plan).toUpperCase() !== 'FREE') return

  error.value = ''
  paymentFailed.value = false
  loading.value = true

  try {
    await authStore.updateProfile({ ...form, onboardingCompleted: true })

    if (plan === 'FREE') {
      router.push('/dashboard?welcome=true')
    } else {
      const successUrl = `${window.location.origin}/dashboard?welcome=true`
      /* Back to the PLAN step, which is 5 since the client import was added
         between the profile and the plan. A stale 4 here would drop somebody
         whose card was declined onto the import screen with no explanation. */
      const failureUrl = `${window.location.origin}/onboarding?step=5&payment_failed=true`

      const res = await subscribeStore.subscribe(
        plan,
        isPromoValid.value ? promoCodeInput.value : null,
        successUrl,
        failureUrl
      )
      if (res?.checkoutUrl) window.location.href = res.checkoutUrl
      else router.push('/dashboard?welcome=true')
    }
  } catch (err) {
    error.value = err.message || 'We could not finish setting up your account.'
    loading.value = false
  }
}
</script>

<template>
  <OnboardingShell
    :steps="STEPS"
    :current="step"
    :wide="step === LAST"
    :identity="authStore.user?.email"
    @navigate="goTo">
    <form class="flow" novalidate @submit.prevent="step < LAST ? nextStep() : null">
      <!-- ── 1 · Role ────────────────────────────────────────────────────
           A radiogroup rather than a fieldset: `legend` cannot be laid out
           reliably inside a grid container, and the group still gets its name
           from the heading through aria-labelledby.
      -->
      <div v-show="step === 1" class="panel" role="radiogroup" aria-labelledby="role-title">
        <div class="panel__head">
          <h2 id="role-title" class="panel__title">What best describes you?</h2>
          <p class="panel__lead">
            It decides what the dashboard shows first. Nothing here is locked in.
          </p>
        </div>

        <div class="choices">
          <OnboardingChoice
            v-for="role in ROLES"
            :key="role.value"
            v-model="form.currentStatus"
            name="role"
            :value="role.value"
            :description="role.description" />
        </div>
      </div>

      <!-- ── 2 · Discovery ─────────────────────────────────────────────── -->
      <div v-show="step === 2" class="panel" role="radiogroup" aria-labelledby="source-title">
        <div class="panel__head">
          <h2 id="source-title" class="panel__title">Where did you hear about us?</h2>
          <p class="panel__lead">
            We are a small team and this is the only analytics we trust.
          </p>
        </div>

        <div class="choices choices--two">
          <OnboardingChoice
            v-for="source in SOURCES"
            :key="source"
            v-model="form.heardAbout"
            name="source"
            :value="source" />
        </div>
      </div>

      <!-- ── 3 · Profile ───────────────────────────────────────────────── -->
      <div v-show="step === 3" class="panel">
        <div class="panel__head">
          <h2 class="panel__title">Your details</h2>
          <p class="panel__lead">
            The company block is what prints at the top of every invoice and
            quotation you send.
          </p>
        </div>

        <section class="group">
          <h3 class="group__title">You</h3>

          <AuthField
            id="name"
            v-model="form.name"
            label="Full name"
            type="text"
            autocomplete="name"
            placeholder="Aina Rahman"
            :error="fieldErrors.name"
            required />

          <div class="pair">
            <!-- Read-only by nature, not by a disabled input: a greyed-out
                 field invites people to try to type in it and then wonder what
                 they did wrong. -->
            <div class="locked">
              <span class="locked__label">Login email</span>
              <span class="locked__value">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <rect
                    x="3.2" y="7" width="9.6" height="6.4" rx="1.6"
                    fill="none" stroke="currentColor" stroke-width="1.4" />
                  <path
                    d="M5.6 7V5.4a2.4 2.4 0 0 1 4.8 0V7"
                    fill="none" stroke="currentColor" stroke-width="1.4"
                    stroke-linecap="round" />
                </svg>
                {{ authStore.user?.email }}
              </span>
            </div>

            <AuthField
              id="phoneNumber"
              v-model="form.phoneNumber"
              label="Phone number"
              type="tel"
              autocomplete="tel"
              inputmode="tel"
              placeholder="+60 12-345 6789"
              :error="fieldErrors.phoneNumber"
              required />
          </div>
        </section>

        <section class="group">
          <h3 class="group__title">Your business</h3>

          <AuthField
            id="companyName"
            v-model="form.companyName"
            label="Business name"
            type="text"
            autocomplete="organization"
            placeholder="Acme Enterprise"
            hint="Printed at the top of the invoice, above everything else."
            :error="fieldErrors.companyName"
            required />

          <div class="pair">
            <div class="mirrored">
              <AuthField
                id="companyEmail"
                v-model="form.companyEmail"
                label="Business email"
                type="email"
                autocomplete="off"
                inputmode="email"
                placeholder="billing@acme.com"
                :error="fieldErrors.companyEmail"
                required />
              <label class="mirror">
                <input v-model="useUserEmail" type="checkbox" class="no-ik" @change="syncEmail" />
                <span>Same as my login email</span>
              </label>
            </div>

            <div class="mirrored">
              <AuthField
                id="companyPhone"
                v-model="form.companyPhone"
                label="Business phone"
                type="tel"
                autocomplete="off"
                inputmode="tel"
                placeholder="+60 12-345 6789"
                :error="fieldErrors.companyPhone"
                required />
              <label class="mirror">
                <input v-model="useUserPhone" type="checkbox" class="no-ik" @change="syncPhone" />
                <span>Same as my phone number</span>
              </label>
            </div>
          </div>
        </section>
      </div>

      <!-- ── 4 · Clients (spec 08) ─────────────────────────────────────────
           Optional, and it says so in three places — the rail, the heading and
           the button that leaves. The empty account is the drop-off point for
           exactly the users worth having, so the offer belongs here; but
           Continue is never gated on it and never validates anything.
      -->
      <div v-show="step === 4" class="panel">
        <div class="panel__head">
          <h2 class="panel__title">
            Bring your clients in
            <span class="panel__optional">optional</span>
          </h2>
          <p class="panel__lead">
            Already have them in a spreadsheet or your phone contacts? Paste the
            list and we will work out the columns. You can also do this any time
            from the Clients page.
          </p>
        </div>

        <div v-if="importedCount" class="imported">
          <span class="imported__tick" aria-hidden="true">
            <svg viewBox="0 0 16 16">
              <path
                d="M3.4 8.4 6.4 11.4 12.6 4.6"
                fill="none" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <div>
            <p class="imported__title">
              <span class="k-num">{{ importedCount }}</span>
              {{ importedCount === 1 ? 'client' : 'clients' }} added
            </p>
            <p class="imported__note">You can import more whenever you like.</p>
          </div>
          <button type="button" class="imported__more" @click="showImport = true">
            Import more
          </button>
        </div>

        <button v-else type="button" class="dropzone" @click="showImport = true">
          <span class="dropzone__ico" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 16V5m0 0L8 9m4-4 4 4M4.5 15.5V18a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2.5"
                fill="none" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="dropzone__title">Paste or upload your client list</span>
          <span class="dropzone__hint">Name, phone and email, in any order</span>
        </button>
      </div>

      <!-- ── 5 · Plan ──────────────────────────────────────────────────── -->
      <div v-show="step === LAST" class="panel panel--wide">
        <div class="panel__head panel__head--center">
          <h2 class="panel__title">Pick a starting plan</h2>
          <p class="panel__lead">
            Start free if you are not sure. Upgrading and downgrading is a
            two-click job in Settings, and nothing is lost either way.
          </p>
        </div>

        <p v-if="paymentFailed" class="alert alert--warn" role="alert">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.5" />
            <path d="M8 4.6v4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
          </svg>
          That payment did not go through, so nothing was charged and no plan was
          started. Try again, or start free and upgrade later.
        </p>

        <p v-if="!canUpgrade" class="alert alert--info" role="status">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.5" />
            <path d="M8 7.2v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            <circle cx="8" cy="4.6" r="0.9" fill="currentColor" />
          </svg>
          Paid plans are paused at the moment, so start on Free — it is a working
          account, not a trial. The others are here waiting, and you can move up
          from Settings the day they are back.
        </p>

        <!-- Promo. Hidden while paid plans are paused: a discount code can only
             be applied to a purchase, and offering to check one for a plan
             nobody can buy is a dead end with a spinner on it. -->
        <div v-if="canUpgrade" class="promo">
          <label for="promo" class="promo__label">Promo code</label>
          <div class="promo__row">
            <input
              id="promo"
              v-model="promoCodeInput"
              class="promo__input no-ik"
              type="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="Optional"
              :disabled="isPromoValid"
              @keydown.enter.prevent="validatePromo" />
            <button
              v-if="!isPromoValid"
              type="button"
              class="k-btn k-btn--secondary promo__btn"
              :disabled="!promoCodeInput || promoLoading"
              @click="validatePromo">
              {{ promoLoading ? 'Checking…' : 'Apply' }}
            </button>
            <button v-else type="button" class="k-btn k-btn--secondary promo__btn" @click="clearPromo">
              Remove
            </button>
          </div>
          <p v-if="promoError" class="promo__msg promo__msg--error" role="alert">{{ promoError }}</p>
          <p v-else-if="isPromoValid" class="promo__msg promo__msg--ok">
            {{ appliedDiscountText }} off your first term.
          </p>
        </div>

        <p v-if="plansLoading" class="plans__status">Loading plans…</p>

        <div v-else-if="plansFailed" class="plans__status plans__status--error">
          <p>We could not load the plans just now.</p>
          <button type="button" class="k-btn k-btn--secondary" @click="fetchPlans">Try again</button>
        </div>

        <ul v-else class="plans" :style="{ '--_cols': columns }">
          <li
            v-for="plan in plans"
            :key="plan.id"
            class="plan"
            :class="{
              'plan--accent': isRecommended(plan),
              'plan--slab': isFlagship(plan),
              'plan--locked': !canChoose(plan),
            }"
            :aria-disabled="!canChoose(plan) || undefined">
            <p v-if="isRecommended(plan)" class="plan__flag">
              {{ canChoose(plan) ? 'Recommended' : 'Paused' }}
            </p>

            <header class="plan__head">
              <h3 class="plan__name">{{ plan.name }}</h3>
              <p v-if="plan.description" class="plan__desc">{{ plan.description }}</p>
            </header>

            <p class="plan__price">
              <span v-if="isDiscounted(plan)" class="plan__was k-num">
                {{ symbolFor(plan) }} {{ price(plan.price) }}
              </span>
              <span class="plan__amount k-num">
                {{ plan.price === 0 ? 'Free' : `${symbolFor(plan)} ${price(getDiscountedPrice(plan.price))}` }}
              </span>
              <span v-if="plan.price > 0" class="plan__interval">/{{ plan.interval }}</span>
            </p>
            <p v-if="isDiscounted(plan)" class="plan__discount">First term discount applied</p>

            <ul class="plan__features">
              <li v-for="feature in plan.features ?? []" :key="feature" class="feature">
                <svg viewBox="0 0 16 16" class="feature__tick" aria-hidden="true">
                  <path
                    d="M3.4 8.4 6.4 11.4 12.6 4.6"
                    fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span>{{ feature }}</span>
              </li>
            </ul>

            <button
              type="button"
              class="k-btn plan__cta"
              :class="isRecommended(plan) || isFlagship(plan) ? 'k-btn--primary' : 'k-btn--secondary'"
              :disabled="loading || !canChoose(plan)"
              @click="selectPlan(plan.name)">
              {{
                !canChoose(plan)
                  ? 'Paused'
                  : plan.price === 0
                    ? 'Start free'
                    : `Choose ${plan.name}`
              }}
            </button>
          </li>
        </ul>
      </div>

      <!-- ── Errors + navigation ───────────────────────────────────────── -->
      <p v-if="stepError || error" class="alert" role="alert">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M8 4.6v4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
        </svg>
        {{ stepError || error }}
      </p>

      <!-- Back stays on the plan step. The ledger is the way back on a desktop,
           but below 1024 the rail is a banner with nothing to click, so hiding
           this row on the last step left a phone with no way to correct
           anything typed on the one before it. -->
      <div v-show="step > 1 || step < LAST" class="nav">
        <button v-if="step > 1" type="button" class="k-btn k-btn--secondary" @click="step--">
          Back
        </button>
        <button
          v-if="step < LAST"
          type="button"
          class="k-btn k-btn--primary nav__next"
          @click="nextStep">
          {{ step === 4 && !importedCount ? 'Skip for now' : 'Continue' }}
          <svg viewBox="0 0 20 20" aria-hidden="true" class="nav__arrow">
            <path
              d="M4 10h11M10.5 5.5 15 10l-4.5 4.5"
              fill="none" stroke="currentColor" stroke-width="1.9"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </form>

    <!-- Saving. It covers the viewport rather than the card because the plan
         step is wider than the card ever was, and a spinner floating over one
         corner of a four-column grid does not read as "wait". -->
    <Teleport to="body">
      <div v-if="loading" class="saving kirim" role="status" aria-live="polite">
        <div class="saving__card">
          <span class="saving__ring" aria-hidden="true">
            <svg viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="19" fill="none" stroke="currentColor" stroke-width="2" opacity="0.15" />
              <circle
                cx="22" cy="22" r="19" fill="none" stroke="currentColor" stroke-width="3"
                stroke-linecap="round" stroke-dasharray="34 200" />
            </svg>
          </span>
          <p class="saving__title">Setting up your workspace</p>
          <p class="saving__note">One moment — do not close this tab.</p>
        </div>
      </div>
    </Teleport>

    <!-- The same import component the Clients page uses. One implementation,
         so the onboarding path cannot drift from the permanent one. -->
    <UiModal v-model="showImport" max-width="4xl">
      <ClientsImportModal v-if="showImport" @close="showImport = false" @imported="onImported" />
    </UiModal>
  </OnboardingShell>
</template>

<style scoped>
.flow {
  display: grid;
  gap: var(--space-6);
}

/* ─── Panels ─────────────────────────────────────────────────────────────── */
.panel {
  display: grid;
  gap: var(--space-5);
  /* fieldset reset — the survey steps are real fieldsets so the legend names
     the group for a screen reader. */
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.panel--wide {
  gap: var(--space-6);
}

.panel__head {
  display: block;
  padding: 0;
}
.panel__head--center {
  text-align: center;
  max-width: var(--measure);
  margin-inline: auto;
}
.panel__title {
  font-size: var(--text-xl);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  line-height: var(--leading-snug);
  color: var(--text-primary);
  text-wrap: balance;
}
.panel__optional {
  margin-left: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
  vertical-align: middle;
}
.panel__lead {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

/* ─── Choices ────────────────────────────────────────────────────────────── */
.choices {
  display: grid;
  gap: var(--space-3);
}
@media (min-width: 560px) {
  .choices--two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* ─── Profile ────────────────────────────────────────────────────────────── */
.group {
  display: grid;
  gap: var(--space-5);
}
.group__title {
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-default);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.pair {
  display: grid;
  gap: var(--space-5);
}
@media (min-width: 560px) {
  .pair {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}

.locked {
  display: grid;
  gap: var(--space-2);
  align-content: start;
}
.locked__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}
.locked__value {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 3rem;
  padding: var(--space-3) var(--space-4);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-md);
  background-color: var(--surface-sunken);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  word-break: break-all;
}
.locked__value svg {
  width: 15px;
  height: 15px;
  flex: none;
  color: var(--text-tertiary);
}

.mirrored {
  display: grid;
  gap: var(--space-2);
}
.mirror {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  cursor: pointer;
}
.mirror:hover {
  color: var(--text-secondary);
}
.mirror input {
  width: 0.95rem;
  height: 0.95rem;
  flex: none;
  accent-color: var(--surface-accent);
  cursor: pointer;
}

/* ─── Client import ──────────────────────────────────────────────────────── */
.dropzone {
  display: grid;
  justify-items: center;
  gap: var(--space-1);
  width: 100%;
  padding: var(--space-8) var(--space-5);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  background-color: var(--surface-raised);
  font-family: inherit;
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) var(--ease-out);
}
.dropzone:hover {
  border-color: var(--surface-accent);
  background-color: var(--surface-accent-soft);
}
.dropzone__ico {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  margin-bottom: var(--space-2);
  border-radius: var(--radius-full);
  background-color: var(--surface-accent-soft);
  color: var(--text-accent);
}
.dropzone:hover .dropzone__ico {
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
}
.dropzone__ico svg {
  width: 22px;
  height: 22px;
}
.dropzone__title {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}
.dropzone__hint {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.imported {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-lg);
  background-color: var(--surface-accent-soft);
}
.imported__tick {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-full);
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
}
.imported__tick svg {
  width: 15px;
  height: 15px;
}
.imported__title {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
}
.imported__note {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
.imported__more {
  border: 0;
  background: none;
  padding: var(--space-2);
  font-family: inherit;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--text-accent);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ─── Promo ──────────────────────────────────────────────────────────────── */
.promo {
  display: grid;
  gap: var(--space-2);
  width: 100%;
  max-width: 26rem;
  margin-inline: auto;
}
.promo__label {
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
}
.promo__row {
  display: flex;
  gap: var(--space-2);
}
.promo__input {
  flex: 1;
  min-width: 0;
  min-height: 3rem;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background-color: var(--surface-raised);
  color: var(--text-primary);
  font-family: inherit;
  font-size: var(--text-base);
  text-transform: uppercase;
  transition: border-color var(--dur-fast) var(--ease-out);
}
.promo__input::placeholder {
  color: var(--text-tertiary);
  text-transform: none;
}
.promo__input:focus {
  border-color: var(--surface-accent);
}
.promo__input:disabled {
  border-style: dashed;
  background-color: var(--surface-sunken);
  color: var(--text-secondary);
  cursor: not-allowed;
}
.promo__btn {
  flex: none;
  padding-inline: var(--space-5);
}
.promo__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.promo__msg {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
}
.promo__msg--error {
  color: var(--state-error);
}
.promo__msg--ok {
  color: var(--text-accent);
}

/* ─── Plans ──────────────────────────────────────────────────────────────── */
.plans__status {
  display: grid;
  gap: var(--space-4);
  justify-items: center;
  padding: var(--space-8);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
  color: var(--text-secondary);
}

.plans {
  display: grid;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.plan {
  position: relative;
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
/* The top tier gets the ink slab rather than a colour the palette does not
   own. It is the same slab as the rail, so "premium" is said in the brand's
   own vocabulary and stays itself in both themes. */
.plan--slab {
  border-color: transparent;
  background-color: var(--surface-slab);
  color: var(--text-on-slab);
}
.plan--slab .plan__name,
.plan--slab .plan__amount {
  color: var(--text-on-slab);
}
.plan--slab .plan__desc,
.plan--slab .plan__interval,
.plan--slab .plan__was,
.plan--slab .feature {
  color: var(--text-on-slab-muted);
}
.plan--slab .feature__tick,
.plan--slab .plan__discount {
  color: var(--text-on-slab-accent);
}
.plan--slab .plan__price {
  border-bottom-color: var(--border-on-slab);
}

/* Paused by the admin switch. Still legible — this is the reason somebody would
   come back — but plainly out of reach: dimmed, desaturated, no hover lift, and
   nothing inside it can be clicked or tabbed to. The button carries `disabled`
   as well, so the state is announced rather than only drawn. */
.plan--locked {
  opacity: 0.5;
  filter: saturate(0.55);
  pointer-events: none;
  box-shadow: none;
  transform: none;
}
.plan--locked .plan__flag {
  background-color: var(--surface-sunken);
  color: var(--text-tertiary);
}

.plan__flag {
  position: absolute;
  top: 0;
  left: var(--space-6);
  transform: translateY(-50%);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
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
  line-height: var(--leading-normal);
  color: var(--text-tertiary);
}

.plan__price {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}
.plan__was {
  font-size: var(--text-base);
  color: var(--text-tertiary);
  text-decoration: line-through;
}
.plan__amount {
  font-size: var(--text-2xl);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  line-height: 1;
  color: var(--text-primary);
}
.plan__interval {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}
.plan__discount {
  margin-top: calc(var(--space-3) * -1);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-accent);
}

.plan__features {
  display: grid;
  gap: var(--space-3);
  align-content: start;
  flex: 1;
  margin: 0;
  padding: 0;
  list-style: none;
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
  flex: none;
  color: var(--text-accent);
}

.plan__cta {
  width: 100%;
  margin-top: var(--space-2);
}
.plan__cta:disabled {
  opacity: 0.55;
  cursor: progress;
}

@media (min-width: 640px) {
  .plans {
    grid-template-columns: repeat(min(var(--_cols, 3), 2), minmax(0, 1fr));
  }
}
@media (min-width: 1280px) {
  .plans {
    grid-template-columns: repeat(var(--_cols, 3), minmax(0, 1fr));
  }
}

/* ─── Alerts and navigation ──────────────────────────────────────────────── */
.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--state-error);
  border-radius: var(--radius-md);
  background-color: var(--state-error-surface);
  color: var(--state-error);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-normal);
}
.alert--warn {
  border-color: var(--state-warning);
  background-color: var(--state-warning-surface);
  color: var(--state-warning);
}
/* Not an error and not a warning — nothing has gone wrong for this person, they
   are just being told what is available today. */
.alert--info {
  max-width: var(--measure);
  margin-inline: auto;
  border-color: var(--border-default);
  background-color: var(--surface-sunken);
  color: var(--text-secondary);
  font-weight: var(--weight-regular);
}
.alert--info svg {
  color: var(--text-tertiary);
}
.alert svg {
  width: 16px;
  height: 16px;
  flex: none;
  margin-top: 2px;
}

.nav {
  display: flex;
  gap: var(--space-3);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-default);
}
.nav__next {
  flex: 1;
}
.nav__arrow {
  width: 18px;
  height: 18px;
}

/* ─── Saving ─────────────────────────────────────────────────────────────── */
.saving {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  padding: var(--gutter);
  background-color: var(--a-ink-72);
  backdrop-filter: blur(4px);
}
.saving__card {
  display: grid;
  justify-items: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-7);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background-color: var(--surface-raised);
  box-shadow: var(--shadow-xl);
  text-align: center;
}
.saving__ring {
  display: block;
  width: 2.75rem;
  height: 2.75rem;
  margin-bottom: var(--space-4);
  color: var(--surface-accent);
  animation: saving-spin 1.1s linear infinite;
}
.saving__title {
  font-size: var(--text-base);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}
.saving__note {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
@keyframes saving-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .plan:hover {
    transform: none;
  }
  .saving__ring {
    animation-duration: 2.4s;
  }
}
</style>
