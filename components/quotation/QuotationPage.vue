<script setup lang="ts">
/**
 * The quotations landing page (spec 07).
 *
 * Rendered by pages/quotation.vue (en) and pages/ms/sebut-harga.vue (ms), so
 * each language is a real crawlable URL with its own canonical and its own
 * <html lang> — the same reasoning as the landing page and the e-Invoice
 * checker, and the same shell (LandingNav, LandingFooter, the kirim tokens).
 *
 * The BM route deliberately carries a Malay slug rather than a translation of
 * the English one. Somebody searching for this types "sebut harga", and a Malay
 * page living on /ms/quotation ranks for a phrase nobody uses.
 *
 * WHAT THIS PAGE MUST NOT BECOME: a second homepage. The hero of the site is
 * about chasing invoices and stays that way — quoting is a supporting
 * capability. This page exists to catch a different search intent and hand it
 * back to the same product, which is why every CTA lands on /register rather
 * than on a quotation-specific funnel.
 */
import type { Locale } from '~/composables/useLandingCopy'
import { useLandingCopy, SITE_URL, localePath, quotationPath } from '~/composables/useLandingCopy'
import { useQuotationCopy } from '~/composables/useQuotationCopy'
import { THEME_INIT_SCRIPT } from '~/composables/useTheme'
import { BRAND } from '~/composables/useBrandTokens'
import { useReveal } from '~/composables/useReveal'

const props = defineProps<{ locale: Locale }>()

const copy = useQuotationCopy(props.locale)
const site = useLandingCopy(props.locale)

const root = ref<HTMLElement | null>(null)
useReveal(root)

/* LandingClose takes the whole LandingCopy object and reads copy.close from it,
   so this hands it the site copy with the quotation page's closing words
   substituted — type-correct, and no second implementation to keep in step. */
const closeCopy = computed(() => ({ ...site, close: copy.close }))

const canonical = `${SITE_URL}${quotationPath(props.locale)}`
const homeHref = computed(() => localePath(props.locale))
const ogImage = `${SITE_URL}/og/og-${props.locale}.png`

useHead({
  htmlAttrs: { lang: copy.htmlLang, class: 'kirim-scroll' },
  title: copy.meta.title,
  link: [
    { rel: 'canonical', href: canonical },
    { rel: 'alternate', hreflang: 'en-MY', href: `${SITE_URL}${quotationPath('en')}` },
    { rel: 'alternate', hreflang: 'ms-MY', href: `${SITE_URL}${quotationPath('ms')}` },
    { rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}${quotationPath('en')}` },
  ],
  script: [{ innerHTML: THEME_INIT_SCRIPT, tagPosition: 'head' }],
  noscript: [
    { innerHTML: '<style>[data-reveal]{opacity:1!important;transform:none!important}</style>' },
  ],
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
  ogImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/png',
  twitterCard: 'summary_large_image',
  twitterTitle: copy.meta.title,
  twitterDescription: copy.meta.description,
  twitterImage: ogImage,
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
              '@type': 'WebPage',
              '@id': `${canonical}#page`,
              url: canonical,
              name: copy.meta.title,
              description: copy.meta.description,
              inLanguage: copy.htmlLang,
              isPartOf: { '@id': `${SITE_URL}/#website` },
              publisher: { '@id': `${SITE_URL}/#organization` },
            },
            {
              '@type': 'HowTo',
              '@id': `${canonical}#howto`,
              name: copy.how.title,
              inLanguage: copy.htmlLang,
              step: copy.how.items.map((s, i) => ({
                '@type': 'HowToStep',
                position: i + 1,
                name: s.title,
                text: s.body,
              })),
            },
            {
              '@type': 'FAQPage',
              '@id': `${canonical}#faq`,
              inLanguage: copy.htmlLang,
              mainEntity: copy.faq.items.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a },
              })),
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
  <div ref="root" class="kirim quo">
    <a href="#main" class="k-skip">{{ site.nav.skip }}</a>

    <LandingNav :copy="site" :locale="locale" :section-base="homeHref" />

    <main id="main">
      <!-- ── Masthead ──────────────────────────────────────────────────── -->
      <header class="mast">
        <div class="k-container mast__grid">
          <div class="mast__inner">
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

          <div class="mast__acts">
            <a href="/register" class="k-btn k-btn--primary">{{ copy.ctaPrimary }}</a>
            <a :href="`${homeHref}#how`" class="k-btn k-btn--secondary">
              {{ copy.ctaSecondary }}
            </a>
          </div>
          <p class="mast__note">{{ copy.ctaNote }}</p>
          </div>

          <!-- The masthead visual.
               This page shipped as an unbroken wall of text on a site where
               every other page carries generated art, which reads as an
               unfinished page rather than a considered one. It draws the one
               thing the page is selling — the client's screen, with the two
               buttons on it — so the promise is shown before it is explained. -->
          <figure class="art" aria-hidden="true">
            <figcaption class="art__cap">{{ copy.art.caption }}</figcaption>

            <div class="art__sheet">
              <p class="art__num">{{ copy.art.number }}</p>
              <p class="art__subject">{{ copy.art.subject }}</p>

              <p class="art__label">{{ copy.art.amountLabel }}</p>
              <p class="art__amount k-num">{{ copy.art.amount }}</p>
              <p class="art__valid">{{ copy.art.validUntil }}</p>

              <div class="art__acts">
                <span class="art__btn art__btn--yes">{{ copy.art.accept }}</span>
                <span class="art__btn">{{ copy.art.decline }}</span>
              </div>
            </div>

            <p class="art__result">
              <svg viewBox="0 0 16 16" class="art__tick">
                <path
                  d="M3.5 8.5 6.5 11.5 12.5 5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              {{ copy.art.result }}
            </p>
            <p class="art__convert">{{ copy.art.convert }}</p>
          </figure>
        </div>
      </header>

      <!-- ── The promise ───────────────────────────────────────────────────
           Placed directly under the masthead, before any feature copy, because
           it is the single claim that separates this from every other quoting
           tool and the one a prospect is most likely to disbelieve.
      -->
      <section class="k-section promise" aria-labelledby="promise-title">
        <div class="k-container">
          <div class="promise__card" data-reveal>
            <h2 id="promise-title" class="k-title promise__title">
              {{ copy.promise.title }}
            </h2>
            <p class="k-body promise__body">{{ copy.promise.body }}</p>
          </div>
        </div>
      </section>

      <!-- ── How it works ──────────────────────────────────────────────── -->
      <section class="k-section" aria-labelledby="quo-how">
        <div class="k-container">
          <header class="head" data-reveal>
            <p class="k-eyebrow">{{ copy.how.eyebrow }}</p>
            <h2 id="quo-how" class="k-headline head__title">
              <KirimText :text="copy.how.title" />
            </h2>
          </header>

          <ol class="steps">
            <li
              v-for="(s, i) in copy.how.items"
              :key="s.n"
              class="step"
              :style="{ '--_i': i }"
              data-reveal
              data-reveal-group="quo-steps">
              <span class="step__n k-num" aria-hidden="true">{{ s.n }}</span>
              <div>
                <h3 class="k-title step__title">{{ s.title }}</h3>
                <p class="k-body step__text">{{ s.body }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- ── What you get ──────────────────────────────────────────────── -->
      <section class="k-section feats" aria-labelledby="quo-feats">
        <div class="k-container k-container--wide">
          <header class="head" data-reveal>
            <p class="k-eyebrow">{{ copy.features.eyebrow }}</p>
            <h2 id="quo-feats" class="k-headline head__title">
              <KirimText :text="copy.features.title" />
            </h2>
          </header>

          <ul class="feats__grid">
            <li
              v-for="f in copy.features.items"
              :key="f.title"
              class="feat"
              data-reveal
              data-reveal-group="quo-feats">
              <h3 class="feat__title">{{ f.title }}</h3>
              <p class="feat__body">{{ f.body }}</p>
            </li>
          </ul>
        </div>
      </section>

      <!-- ── FAQ ───────────────────────────────────────────────────────────
           Native <details>/<summary>, matching LandingFaq: it works without
           JavaScript, it is keyboard-accessible for free, and the answer text
           is in the delivered HTML where a crawler can read it.
      -->
      <section class="k-section" aria-labelledby="quo-faq">
        <!-- Two columns at desktop, the same 0.8fr/1.4fr split LandingFaq uses.
             Single-column, this section capped itself at reading width and sat
             against the left edge of a much wider container, leaving half the
             viewport empty on a large screen. -->
        <div class="k-container faq__grid">
          <header class="head head--sticky" data-reveal>
            <p class="k-eyebrow">{{ copy.faq.eyebrow }}</p>
            <h2 id="quo-faq" class="k-headline head__title">
              <KirimText :text="copy.faq.title" />
            </h2>
          </header>

          <ul class="faq">
            <li v-for="item in copy.faq.items" :key="item.q" data-reveal data-reveal-group="quo-faq">
              <details class="faq__item">
                <summary class="faq__q">
                  <span>{{ item.q }}</span>
                  <span class="faq__sign" aria-hidden="true"></span>
                </summary>
                <p class="faq__a">{{ item.a }}</p>
              </details>
            </li>
          </ul>
        </div>
      </section>

      <!-- ── Close ─────────────────────────────────────────────────────────
           THE ACTUAL LandingClose, not a lookalike. This page had its own
           hand-rolled version — plain, left-aligned, no slab — sitting directly
           above the shared footer, so the page ended on a different note from
           every other page on the site. The real one is an inverse slab with
           the grain, the glow and the serif that bookends the landing page, and
           reusing it means the two cannot drift again. Only the WORDS differ,
           which is the only thing that should. -->
      <LandingClose :copy="closeCopy" />
    </main>

    <LandingFooter :copy="site" :locale="locale" />
  </div>
</template>

<style scoped>
/* ─── Masthead ──────────────────────────────────────────────────────────── */
.mast {
  padding-block: clamp(2rem, 6vw, 3.5rem) clamp(2.5rem, 6vw, 4rem);
  background-color: var(--surface-sunken);
  border-bottom: 1px solid var(--border-default);
}
/* Two columns at desktop, like the landing hero: copy left, the client's screen
   right. Stacks on anything narrower, art last, because on a phone the headline
   has to come first. */
.mast__grid {
  display: grid;
  gap: clamp(2.5rem, 5vw, 4rem);
  align-items: center;
}
.mast__inner {
  max-width: 44rem;
}
.crumbs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
.crumbs a {
  color: var(--text-secondary);
  text-decoration: none;
}
.crumbs a:hover {
  color: var(--text-accent);
}
.mast__title {
  margin-block: var(--space-4) var(--space-5);
}
.mast__accent {
  display: block;
  color: var(--text-accent);
}
.mast__lead {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.mast__acts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-7);
}
.mast__note {
  margin-top: var(--space-4);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}


/* ─── Masthead art ──────────────────────────────────────────────────────────
   The client's screen, drawn rather than screenshotted so it stays correct when
   the real page changes and costs nothing to load. Same vocabulary as the bento
   tile on the landing page, so the two read as one system. */
.art {
  margin: 0;
  display: grid;
  gap: var(--space-2);
  justify-items: stretch;
}
.art__cap {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: var(--space-1);
}
.art__sheet {
  padding: var(--space-6);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background-color: var(--surface-raised);
  box-shadow: var(--shadow-lg);
}
.art__num {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: var(--tracking-wide);
  color: var(--text-tertiary);
}
.art__subject {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  margin-top: 2px;
}
.art__label {
  margin-top: var(--space-5);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
}
.art__amount {
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  line-height: 1.1;
  margin-top: 2px;
}
.art__valid {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
  margin-top: var(--space-2);
}
.art__acts {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-5);
}
.art__btn {
  flex: 1;
  text-align: center;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--text-secondary);
}
/* Filled, so it uses the accent PAIR — the same two tokens .k-btn--primary
   uses. Both resolve to the same green in either theme because the accent is a
   fixed brand colour on the marketing surface; what changes underneath is
   --surface-raised, so the card reads differently in dark even though the pill
   does not. */
.art__btn--yes {
  background-color: var(--surface-accent);
  border-color: var(--surface-accent);
  color: var(--text-on-accent);
}
.art__result {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-md);
  background-color: var(--surface-accent-soft);
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  color: var(--text-accent);
}
.art__tick {
  width: 14px;
  height: 14px;
  flex: none;
}
.art__convert {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
  padding-left: var(--space-4);
}

@media (min-width: 1024px) {
  .mast__grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  }
  .faq__grid {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.4fr);
    align-items: start;
  }
  /* The heading rides alongside the questions rather than scrolling away from
     them — the list is long enough that it otherwise loses its title. */
  .head--sticky {
    position: sticky;
    /* 6rem clears the sticky nav, matching the legal pages' TOC. An earlier
       version referenced a --nav-h token that does not exist anywhere in this
       codebase and only worked because of its fallback. */
    top: 6rem;
    margin-bottom: 0;
  }
}

/* ─── Section heads ─────────────────────────────────────────────────────── */
.head {
  max-width: var(--measure);
  margin-bottom: clamp(2rem, 5vw, 3rem);
}
.head__title {
  margin-top: var(--space-4);
}

/* ─── The promise ───────────────────────────────────────────────────────── */
/* Centred, not left-aligned. A single 44rem card inside a container twice that
   wide read as a layout that had lost its second column. */
.promise__card {
  max-width: 48rem;
  margin-inline: auto;
  padding: clamp(var(--space-6), 4vw, var(--space-8));
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-xl);
  background-color: var(--surface-accent-soft);
}
.promise__title {
  margin-bottom: var(--space-4);
  color: var(--text-accent);
}
.promise__body {
  color: var(--text-secondary);
}

.faq__grid {
  display: grid;
  gap: clamp(2rem, 4vw, 3rem);
}

/* ─── Steps ─────────────────────────────────────────────────────────────── */
.steps {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--border-default);
}
.step {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
  padding-block: var(--space-7);
  border-bottom: 1px solid var(--border-default);
}
.step__n {
  font-size: var(--text-lg);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-widest);
  color: var(--text-accent);
  line-height: 1.35;
}
.step__title {
  margin-bottom: var(--space-2);
}
.step__text {
  max-width: 42rem;
}

@media (min-width: 768px) {
  .step {
    grid-template-columns: 5.5rem minmax(0, 1fr);
    gap: var(--space-6);
    padding-block: var(--space-8);
  }
  .step__n {
    font-size: var(--text-3xl);
    line-height: 0.9;
    letter-spacing: var(--tracking-tighter);
    /* --text-muted-large, not --border-strong: a numeral at this size is
       content and needs 3:1, which the border token does not reach. */
    color: var(--text-muted-large);
  }
}

/* ─── Features ──────────────────────────────────────────────────────────── */
.feats {
  background-color: var(--surface-sunken);
}
.feats__grid {
  display: grid;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.feat {
  padding: var(--space-6);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background-color: var(--surface-raised);
}
.feat__title {
  font-size: var(--text-title);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-snug);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  text-wrap: balance;
}
.feat__body {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

@media (min-width: 640px) {
  .feats__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .feats__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* ─── FAQ ───────────────────────────────────────────────────────────────── */
.faq {
  margin: 0;
  padding: 0;
  list-style: none;
  /* No max-width: the grid column is the constraint now. Capping it as well
     would re-create the dead space one level in — the questions would sit
     against the left of their own column instead of the page's. The ANSWER
     text still caps, which is where reading width actually matters. */
  border-top: 1px solid var(--border-default);
}
.faq__item {
  border-bottom: 1px solid var(--border-default);
}
.faq__q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding-block: var(--space-5);
  cursor: pointer;
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  list-style: none;
}
.faq__q::-webkit-details-marker {
  display: none;
}
.faq__q:hover {
  color: var(--text-accent);
}
/* A visible focus ring: the summary is the interactive element here, and
   removing the marker must not also remove the keyboard affordance. */
.faq__q:focus-visible {
  outline: 2px solid var(--border-accent);
  outline-offset: 2px;
}
.faq__sign {
  position: relative;
  flex: none;
  width: 14px;
  height: 14px;
}
.faq__sign::before,
.faq__sign::after {
  content: '';
  position: absolute;
  inset: 50% 0 auto 0;
  height: 1.5px;
  background-color: currentColor;
  transition: transform var(--dur-base) var(--ease-out);
}
.faq__sign::after {
  transform: rotate(90deg);
}
.faq__item[open] .faq__sign::after {
  transform: rotate(0deg);
}
.faq__a {
  padding-bottom: var(--space-6);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
  max-width: 42rem;
}
@media (prefers-reduced-motion: reduce) {
  .faq__sign::before,
  .faq__sign::after {
    transition: none;
  }
}

/* ─── Close ─────────────────────────────────────────────────────────────── */
/* No .close rules here any more — LandingClose brings its own, and a second set
   under the same names would be the start of exactly the drift that made this
   page's ending look wrong in the first place. */
</style>
