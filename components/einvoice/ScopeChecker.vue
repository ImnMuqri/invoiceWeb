<script setup lang="ts">
/**
 * The public LHDN e-Invoice scope checker (spec 06).
 *
 * Rendered by pages/e-invoice-check.vue (en) and pages/ms/e-invoice-check.vue
 * (ms), so each language is a real crawlable URL rather than a client-side
 * toggle — the same reasoning as the landing page.
 *
 * WHERE THE ANSWERS COME FROM
 *
 * This component contains no rules. It renders bands from the rule set the API
 * serves, and renders the verdict from the sentences the API returns. That is
 * the whole point: LHDN has revised these thresholds more than once, and when
 * they revise them again the only edit is one config file on the server. If
 * you are about to type a ringgit figure or a phase date into this file, stop.
 *
 * NO GATE ON THE ANSWER. The result renders for everyone, immediately. The
 * email offer sits underneath it, after the answer is already on screen.
 * Gating it would kill the sharing this tool exists to earn.
 */
import type { Locale } from '~/composables/useLandingCopy'
import { useLandingCopy, SITE_URL, localePath } from '~/composables/useLandingCopy'
import { useScopeCheckerCopy, scopeCheckerPath } from '~/composables/useScopeCheckerCopy'
import { THEME_INIT_SCRIPT } from '~/composables/useTheme'
import { BRAND } from '~/composables/useBrandTokens'
import { money } from '~/utils/invoice'

const props = defineProps<{ locale: Locale }>()

const copy = useScopeCheckerCopy(props.locale)
const site = useLandingCopy(props.locale)
const config = useRuntimeConfig()

const canonical = `${SITE_URL}${scopeCheckerPath(props.locale)}`
const homeHref = computed(() => localePath(props.locale))

/* ── The rule set ─────────────────────────────────────────────────────────── */

interface Band {
  id: string
  minSen: number | null
  maxSen: number | null
  exclusiveMin: boolean
  exclusiveMax: boolean
  unknown: boolean
}
interface Ruleset {
  version: string
  reviewedOn: string
  baseFinancialYear: number
  minStartYear: number
  sources: { timeline: string; guidelines: string; portal: string }
  turnoverBands: Band[]
  businessTypes: string[]
}

/* Fetched server-side so the dropdown is in the delivered HTML: a crawler that
   runs no JavaScript still sees what the tool asks and what the bands are. */
const { data: rules, error: rulesError } = await useFetch<Ruleset>(
  () => `${config.public.apiBase}/api/einvoice/rules`,
  { key: 'einvoice-rules', server: true, timeout: 4000 }
)

/**
 * A band's label, built from its own numbers.
 *
 * money() is the money boundary — the figures arrive as sen like every other
 * amount in this codebase, and this is the one place they become ringgit.
 */
function bandLabel(band: Band) {
  const b = copy.form.turnover.bands
  if (band.unknown) return b.unknown
  const min = band.minSen == null ? '' : `RM${money(band.minSen)}`
  const max = band.maxSen == null ? '' : `RM${money(band.maxSen)}`

  if (band.maxSen == null) return b.above.replace('{min}', min)
  if (!band.minSen) return b.lessThan.replace('{max}', max)
  const tpl = band.exclusiveMin ? b.rangeAbove : b.rangeFrom
  return tpl.replace('{min}', min).replace('{max}', max)
}

const reviewedOn = computed(() => rules.value?.reviewedOn ?? '')
const reviewedLong = computed(() => (reviewedOn.value ? longDate(reviewedOn.value) : ''))

const MONTHS: Record<string, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June',
       'July', 'August', 'September', 'October', 'November', 'December'],
  ms: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
       'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'],
}
function longDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[props.locale][m - 1]} ${y}`
}

/* ── The form ─────────────────────────────────────────────────────────────── */

const form = reactive({
  turnoverBand: '',
  startYear: '' as string | number,
  partOfGroup: null as boolean | null,
  businessType: '',
})

const thisYear = new Date().getFullYear()
const complete = computed(
  () =>
    !!form.turnoverBand &&
    !!form.businessType &&
    form.partOfGroup !== null &&
    Number(form.startYear) >= (rules.value?.minStartYear ?? 1900) &&
    Number(form.startYear) <= thisYear
)

interface Rendered {
  status: string
  headline: string
  paragraphs: string[]
  nextTitle: string
  steps: string[]
  disclaimerTitle: string
  disclaimer: string
  reviewedLabel: string
  portalLabel: string
}
interface CheckResponse {
  verdict: { outcome: string }
  copy: Record<string, Rendered>
}

const result = ref<CheckResponse | null>(null)
const checking = ref(false)
const checkError = ref('')
const resultEl = ref<HTMLElement | null>(null)

/* The four answers as they were when the result was produced, so the echo on
   the result card can never describe a form the reader has since edited. */
const answered = ref<{ turnover: string; startYear: string; group: string; type: string } | null>(null)

const rendered = computed(() => result.value?.copy[props.locale] ?? null)
const outcome = computed(() => result.value?.verdict.outcome ?? '')

async function check() {
  if (!complete.value || checking.value) return
  checking.value = true
  checkError.value = ''
  emailState.value = 'idle'

  try {
    const body = {
      turnoverBand: form.turnoverBand,
      startYear: Number(form.startYear),
      partOfGroup: form.partOfGroup === true,
      businessType: form.businessType,
    }
    result.value = await $fetch<CheckResponse>(`${config.public.apiBase}/api/einvoice/check`, {
      method: 'POST',
      body,
    })

    const band = rules.value?.turnoverBands.find((b) => b.id === form.turnoverBand)
    answered.value = {
      turnover: band ? bandLabel(band) : '',
      startYear: String(form.startYear),
      group: form.partOfGroup ? copy.form.group.yes : copy.form.group.no,
      type: (copy.form.businessType.options as Record<string, string>)[form.businessType] ?? '',
    }

    /* Move the reader to the answer, and move focus with them — a result that
       appears below the fold has not been delivered, and one that appears
       without moving focus has not been delivered to a screen reader. */
    await nextTick()
    resultEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    resultEl.value?.focus({ preventScroll: true })
  } catch (e) {
    result.value = null
    checkError.value = copy.form.error
  } finally {
    checking.value = false
  }
}

/* ── Email a copy ─────────────────────────────────────────────────────────── */

const email = ref('')
const emailState = ref<'idle' | 'sending' | 'sent' | 'error' | 'invalid'>('idle')

async function sendCopy() {
  if (emailState.value === 'sending' || !result.value) return
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailState.value = 'invalid'
    return
  }
  emailState.value = 'sending'
  try {
    await $fetch(`${config.public.apiBase}/api/einvoice/email`, {
      method: 'POST',
      body: {
        turnoverBand: form.turnoverBand,
        startYear: Number(form.startYear),
        partOfGroup: form.partOfGroup === true,
        businessType: form.businessType,
        locale: props.locale,
        email: email.value,
      },
    })
    emailState.value = 'sent'
  } catch {
    emailState.value = 'error'
  }
}

/* ── Head ─────────────────────────────────────────────────────────────────── */

useHead({
  htmlAttrs: { lang: copy.htmlLang, class: 'kirim-scroll' },
  title: copy.meta.title,
  link: [
    { rel: 'canonical', href: canonical },
    { rel: 'alternate', hreflang: 'en-MY', href: `${SITE_URL}${scopeCheckerPath('en')}` },
    { rel: 'alternate', hreflang: 'ms-MY', href: `${SITE_URL}${scopeCheckerPath('ms')}` },
    { rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}${scopeCheckerPath('en')}` },
  ],
  script: [{ innerHTML: THEME_INIT_SCRIPT, tagPosition: 'head' }],
})

useSeoMeta({
  description: copy.meta.description,
  ogType: 'website',
  ogSiteName: 'InvoKita',
  ogTitle: copy.meta.title,
  ogDescription: copy.meta.description,
  ogUrl: canonical,
  ogLocale: props.locale === 'ms' ? 'ms_MY' : 'en_MY',
  ogLocaleAlternate: props.locale === 'ms' ? 'en_MY' : 'ms_MY',
  ogImage: `${SITE_URL}/og/og-${props.locale}.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterTitle: copy.meta.title,
  twitterDescription: copy.meta.description,
  themeColor: [
    { content: BRAND.paper, media: '(prefers-color-scheme: light)' },
    { content: BRAND.ink, media: '(prefers-color-scheme: dark)' },
  ],
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebApplication',
              '@id': `${canonical}#tool`,
              name: copy.meta.title,
              url: canonical,
              applicationCategory: 'BusinessApplication',
              /* Free, and no account. Both are the point of the page, and both
                 are things search results can surface. */
              isAccessibleForFree: true,
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'MYR' },
              inLanguage: copy.htmlLang,
              description: copy.meta.description,
              publisher: { '@id': `${SITE_URL}/#organization` },
              ...(reviewedOn.value ? { dateModified: reviewedOn.value } : {}),
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${canonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'InvoKita', item: `${SITE_URL}${localePath(props.locale)}` },
                { '@type': 'ListItem', position: 2, name: copy.crumb, item: canonical },
              ],
            },
          ],
        })
      ),
    },
  ],
})
</script>

<template>
  <div class="kirim check">
    <a href="#main" class="k-skip">{{ site.nav.skip }}</a>

    <LandingNav :copy="site" :locale="locale" :section-base="homeHref" />

    <main id="main">
      <!-- ── Masthead ────────────────────────────────────────────────────── -->
      <header class="mast">
        <div class="k-container mast__inner">
          <nav class="crumbs" aria-label="Breadcrumb">
            <a :href="homeHref">InvoKita</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{{ copy.crumb }}</span>
          </nav>

          <p class="k-eyebrow">{{ copy.eyebrow }}</p>
          <h1 class="k-display mast__title">
            {{ copy.title }}
            <span class="mast__accent">{{ copy.titleAccent }}</span>
          </h1>
          <p class="mast__lead">{{ copy.lead }}</p>

          <p v-if="reviewedLong" class="stamp">
            <span class="stamp__dot" aria-hidden="true"></span>
            {{ copy.reviewedPrefix }} <time :datetime="reviewedOn">{{ reviewedLong }}</time>
          </p>
        </div>
      </header>

      <div class="k-container body">
        <!-- ── Form ──────────────────────────────────────────────────────── -->
        <section class="card form" aria-labelledby="form-title">
          <h2 id="form-title" class="card__h">{{ copy.form.title }}</h2>

          <p v-if="rulesError" class="alert alert--error" role="alert">
            {{ copy.form.rulesError }}
          </p>

          <form v-else class="fields" novalidate @submit.prevent="check">
            <!-- Turnover -->
            <div class="field">
              <label class="field__label" for="f-turnover">{{ copy.form.turnover.label }}</label>
              <p class="field__help" id="f-turnover-help">{{ copy.form.turnover.help }}</p>
              <select
                id="f-turnover"
                v-model="form.turnoverBand"
                class="input"
                aria-describedby="f-turnover-help">
                <option value="" disabled>{{ copy.form.turnover.placeholder }}</option>
                <option v-for="b in rules?.turnoverBands ?? []" :key="b.id" :value="b.id">
                  {{ bandLabel(b) }}
                </option>
              </select>
            </div>

            <!-- Start year -->
            <div class="field">
              <label class="field__label" for="f-year">{{ copy.form.startYear.label }}</label>
              <p class="field__help" id="f-year-help">{{ copy.form.startYear.help }}</p>
              <input
                id="f-year"
                v-model="form.startYear"
                class="input"
                type="number"
                inputmode="numeric"
                :min="rules?.minStartYear ?? 1900"
                :max="thisYear"
                :placeholder="copy.form.startYear.placeholder"
                aria-describedby="f-year-help" />
            </div>

            <!-- Group -->
            <fieldset class="field field--fieldset">
              <legend class="field__label">{{ copy.form.group.label }}</legend>
              <p class="field__help">{{ copy.form.group.help }}</p>
              <div class="choice">
                <label class="choice__opt" :class="{ 'is-on': form.partOfGroup === false }">
                  <input v-model="form.partOfGroup" type="radio" name="group" :value="false" />
                  <span>{{ copy.form.group.no }}</span>
                </label>
                <label class="choice__opt" :class="{ 'is-on': form.partOfGroup === true }">
                  <input v-model="form.partOfGroup" type="radio" name="group" :value="true" />
                  <span>{{ copy.form.group.yes }}</span>
                </label>
              </div>
            </fieldset>

            <!-- Business type -->
            <div class="field">
              <label class="field__label" for="f-type">{{ copy.form.businessType.label }}</label>
              <select id="f-type" v-model="form.businessType" class="input">
                <option value="" disabled>{{ copy.form.businessType.placeholder }}</option>
                <option v-for="t in rules?.businessTypes ?? []" :key="t" :value="t">
                  {{ (copy.form.businessType.options as Record<string, string>)[t] ?? t }}
                </option>
              </select>
            </div>

            <div class="form__foot">
              <button type="submit" class="k-btn k-btn--primary k-btn--lg" :disabled="!complete || checking">
                {{ checking ? copy.form.submitting : copy.form.submit }}
              </button>
              <p class="form__note">{{ complete ? copy.form.note : copy.form.incomplete }}</p>
            </div>

            <p v-if="checkError" class="alert alert--error" role="alert">{{ checkError }}</p>
          </form>
        </section>

        <!-- ── Result ────────────────────────────────────────────────────── -->
        <!-- Everything a reader needs is inside this one box: the brand, the
             answers it was given, the verdict, the next steps, the disclaimer
             and the date the rules were checked. That is deliberate — this is
             the part that gets screenshotted into a WhatsApp group, where the
             page around it does not travel. -->
        <section
          v-if="rendered"
          ref="resultEl"
          tabindex="-1"
          class="card result"
          :class="`result--${outcome.toLowerCase()}`"
          aria-labelledby="result-headline"
          aria-live="polite">
          <div class="result__top">
            <p class="result__brand">
              InvoKita<span class="result__dot" aria-hidden="true">.</span>
              <span class="result__brand-sub">{{ copy.crumb }}</span>
            </p>
            <p class="pill">{{ rendered.status }}</p>
          </div>

          <h2 id="result-headline" class="result__headline">{{ rendered.headline }}</h2>

          <p v-for="(p, i) in rendered.paragraphs" :key="i" class="result__p">{{ p }}</p>

          <dl v-if="answered" class="answers">
            <div class="answers__row">
              <dt>{{ copy.result.turnoverLabel }}</dt>
              <dd>{{ answered.turnover }}</dd>
            </div>
            <div class="answers__row">
              <dt>{{ copy.result.startYearLabel }}</dt>
              <dd>{{ answered.startYear }}</dd>
            </div>
            <div class="answers__row">
              <dt>{{ copy.result.groupLabel }}</dt>
              <dd>{{ answered.group }}</dd>
            </div>
            <div class="answers__row">
              <dt>{{ copy.result.typeLabel }}</dt>
              <dd>{{ answered.type }}</dd>
            </div>
          </dl>

          <h3 class="result__next">{{ rendered.nextTitle }}</h3>
          <ol class="steps">
            <li v-for="(s, i) in rendered.steps" :key="i">{{ s }}</li>
          </ol>

          <!-- The disclaimer sits inside the result, above its footer, so it
               cannot be scrolled past or cropped out of a screenshot. -->
          <aside class="disclaimer">
            <p class="disclaimer__h">{{ rendered.disclaimerTitle }}</p>
            <p class="disclaimer__p">{{ rendered.disclaimer }}</p>
            <a
              :href="rules?.sources.portal ?? 'https://myinvois.hasil.gov.my/'"
              class="disclaimer__link"
              target="_blank"
              rel="noopener">
              {{ rendered.portalLabel }} →
            </a>
          </aside>

          <div class="result__foot">
            <p class="result__stamp">{{ rendered.reviewedLabel }}</p>
            <p class="result__url">invokita.my{{ scopeCheckerPath(locale) }}</p>
          </div>
        </section>

        <!-- ── Email a copy ──────────────────────────────────────────────── -->
        <section v-if="rendered" class="card mail" aria-labelledby="mail-title">
          <h2 id="mail-title" class="card__h">{{ copy.email.title }}</h2>
          <p class="mail__body">{{ copy.email.body }}</p>
          <p class="mail__share">{{ copy.result.shareNote }}</p>

          <form class="mail__form" novalidate @submit.prevent="sendCopy">
            <label class="k-sr" for="f-email">{{ copy.email.label }}</label>
            <input
              id="f-email"
              v-model="email"
              class="input"
              type="email"
              autocomplete="email"
              :placeholder="copy.email.placeholder"
              :disabled="emailState === 'sent'" />
            <button
              type="submit"
              class="k-btn k-btn--secondary"
              :disabled="emailState === 'sending' || emailState === 'sent'">
              {{ emailState === 'sending' ? copy.email.sending : copy.email.submit }}
            </button>
          </form>

          <p v-if="emailState === 'sent'" class="alert alert--ok" role="status">{{ copy.email.sent }}</p>
          <p v-else-if="emailState === 'invalid'" class="alert alert--error" role="alert">{{ copy.email.invalid }}</p>
          <p v-else-if="emailState === 'error'" class="alert alert--error" role="alert">{{ copy.email.error }}</p>
        </section>

        <!-- ── Position ──────────────────────────────────────────────────── -->
        <section class="card position" aria-labelledby="position-title">
          <h2 id="position-title" class="card__h">{{ copy.position.title }}</h2>
          <p v-for="(p, i) in copy.position.body" :key="i" class="position__p">{{ p }}</p>
          <p class="position__links">
            <a :href="`${homeHref}#faq`" class="k-link">{{ copy.position.faqLink }}</a>
            <a :href="homeHref" class="k-link">{{ copy.position.home }}</a>
          </p>
        </section>
      </div>
    </main>

    <LandingFooter :copy="site" :locale="locale" />
  </div>
</template>

<style scoped>
/* ─── Masthead ────────────────────────────────────────────────────────────── */
.mast {
  padding-block: clamp(2rem, 6vw, 3.5rem) clamp(2rem, 5vw, 3rem);
  background-color: var(--surface-sunken);
  border-bottom: 1px solid var(--border-default);
}
/* Same max-width as .body below. Both are centred, so any difference between
   them shows up as the headline and the form card starting at two different
   left edges — which is what it looked like before this line. */
.mast__inner {
  max-width: 44rem;
}

.crumbs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-tertiary);
  margin-bottom: var(--space-5);
}
.crumbs a {
  color: var(--text-accent);
  text-decoration: none;
}
.crumbs a:hover {
  text-decoration: underline;
}

.mast__title {
  margin-top: var(--space-3);
  max-width: 16ch;
}
.mast__accent {
  color: var(--text-accent);
}
.mast__lead {
  max-width: var(--measure);
  margin-top: var(--space-5);
  font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

/* The review date is a promise about currency, so it is on the page before
   the form, not buried under the result. */
.stamp {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-6);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background-color: var(--surface-raised);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
}
.stamp__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: var(--surface-accent);
}

/* ─── Layout ──────────────────────────────────────────────────────────────── */
.body {
  display: grid;
  gap: var(--space-6);
  max-width: 44rem;
  padding-block: clamp(2rem, 5vw, 3rem) clamp(3.5rem, 8vw, 6rem);
}

.card {
  padding: clamp(1.5rem, 4vw, 2.25rem);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background-color: var(--surface-raised);
}
.card__h {
  font-size: var(--text-lg);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

/* ─── Form ────────────────────────────────────────────────────────────────── */
.fields {
  display: grid;
  gap: var(--space-6);
  margin-top: var(--space-6);
}

.field {
  display: grid;
  gap: var(--space-2);
}
.field--fieldset {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.field__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  padding: 0;
}
.field__help {
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
  color: var(--text-tertiary);
}

.input {
  width: 100%;
  min-height: 3rem;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background-color: var(--surface-page);
  color: var(--text-primary);
  font: inherit;
  font-size: var(--text-base);
  transition:
    border-color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out);
}
.input:focus-visible {
  outline: none;
  border-color: var(--border-accent);
  box-shadow: 0 0 0 3px var(--surface-accent-soft);
}
/* The native arrow is drawn by the platform in the platform's colour, which in
   dark mode is a light arrow on a light chip. Replacing it with a token-drawn
   one is the only way both themes get an arrow that can actually be seen. */
select.input {
  appearance: none;
  padding-right: var(--space-8);
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%),
    linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position:
    calc(100% - 20px) calc(50% + 2px),
    calc(100% - 15px) calc(50% + 2px);
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}

.choice {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-1);
}
.choice__opt {
  /* The real radio is hidden inside this label, and it is absolutely
     positioned. Without a positioned ancestor it anchors to the page instead
     of the control, which puts the focus target somewhere near the top of the
     document — invisible, but it is what the browser scrolls to. */
  position: relative;
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding-inline: var(--space-4);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background-color: var(--surface-page);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}
.choice__opt input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.choice__opt:hover {
  border-color: var(--border-accent);
}
/* Selected state uses the accent surface plus its own text token rather than
   a tint of the page: a "selected" that is only a 4% background difference
   reads as unselected in one of the two themes. */
.choice__opt.is-on {
  border-color: var(--border-accent);
  background-color: var(--surface-accent-soft);
  color: var(--text-accent);
}
.choice__opt:focus-within {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.form__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  padding-top: var(--space-2);
}
.form__note {
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
  color: var(--text-tertiary);
  max-width: 22rem;
}
.k-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.alert {
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}
.alert--error {
  border: 1px solid var(--state-error);
  background-color: var(--state-error-surface);
  color: var(--state-error);
}
.alert--ok {
  border: 1px solid var(--state-success);
  background-color: var(--state-success-surface);
  color: var(--state-success);
}

/* ─── Result ──────────────────────────────────────────────────────────────── */
.result {
  border-width: 2px;
  scroll-margin-top: 5.5rem;
}
.result:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}
/* One accent per outcome. All three pairs are per-theme tokens, so the card
   is not the same colour in light and dark with the text left behind. */
.result--exempt {
  border-color: var(--state-success);
}
.result--in_scope {
  border-color: var(--state-warning);
}
.result--cannot_determine {
  border-color: var(--border-strong);
}

.result__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
}
.result__brand {
  font-size: var(--text-sm);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  color: var(--text-primary);
}
.result__dot {
  color: var(--text-accent);
}
.result__brand-sub {
  margin-left: var(--space-2);
  font-size: var(--text-2xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.pill {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}
.result--exempt .pill {
  background-color: var(--state-success-surface);
  color: var(--state-success);
}
.result--in_scope .pill {
  background-color: var(--state-warning-surface);
  color: var(--state-warning);
}
.result--cannot_determine .pill {
  background-color: var(--state-info-surface);
  color: var(--state-info);
}

.result__headline {
  margin-top: var(--space-5);
  font-size: var(--text-title);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-snug);
  color: var(--text-primary);
  text-wrap: balance;
}
.result__p {
  margin-top: var(--space-4);
  max-width: var(--measure);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

.answers {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3) var(--space-5);
  margin-top: var(--space-6);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-lg);
  background-color: var(--surface-sunken);
}
.answers__row dt {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: 2px;
}
.answers__row dd {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
}

.result__next {
  margin-top: var(--space-7);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
}
.steps {
  display: grid;
  gap: var(--space-3);
  margin: var(--space-4) 0 0;
  padding-left: var(--space-6);
  max-width: var(--measure);
  /* .kirim resets every ol to list-style:none for the marketing sections.
     Here the numbers carry meaning — these are steps in an order — so the
     marker is put back explicitly rather than left to inherit the reset. */
  list-style: decimal;
}
.steps li {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.steps li::marker {
  color: var(--text-accent);
  font-weight: var(--weight-bold);
}

.disclaimer {
  margin-top: var(--space-7);
  padding: var(--space-5);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background-color: var(--surface-sunken);
}
.disclaimer__h {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}
.disclaimer__p {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.disclaimer__link {
  display: inline-flex;
  align-items: center;
  min-height: 1.75rem;
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--text-accent);
  text-decoration: none;
}
.disclaimer__link:hover {
  text-decoration: underline;
}

.result__foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-2) var(--space-4);
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
.result__url {
  font-weight: var(--weight-semibold);
}

/* ─── Email ───────────────────────────────────────────────────────────────── */
.mail__body {
  margin-top: var(--space-3);
  max-width: var(--measure);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.mail__share {
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
.mail__form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-5);
}
.mail__form .input {
  flex: 1 1 14rem;
}

/* ─── Position ────────────────────────────────────────────────────────────── */
.position__p {
  margin-top: var(--space-4);
  max-width: var(--measure);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.position__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
  margin-top: var(--space-5);
}

/* ─── Breakpoints ─────────────────────────────────────────────────────────── */
@media (min-width: 640px) {
  /* Not four equal columns: the turnover band is by far the longest value
     ("More than RM5,000,000, up to RM25,000,000") and an equal split broke it
     over four lines while "No" sat alone in a column of its own. */
  .answers {
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 0.7fr) minmax(0, 0.8fr) minmax(0, 1.2fr);
  }
}
</style>
