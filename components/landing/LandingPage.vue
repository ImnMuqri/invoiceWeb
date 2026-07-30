<script setup lang="ts">
/**
 * Composition shell for the landing page. Rendered by pages/index.vue (en)
 * and pages/ms/index.vue (ms) so each locale gets a real, crawlable URL with
 * its own <html lang>, canonical and hreflang set — no client-side language
 * switching that search engines cannot see.
 */
import type { Locale } from '~/composables/useLandingCopy'
import { useLandingCopy, SITE_URL, localePath } from '~/composables/useLandingCopy'
import { THEME_INIT_SCRIPT } from '~/composables/useTheme'
import { BRAND } from '~/composables/useBrandTokens'
import { useReveal } from '~/composables/useReveal'

const props = defineProps<{ locale: Locale }>()

const copy = useLandingCopy(props.locale)
const root = ref<HTMLElement | null>(null)
useReveal(root)

const canonical = `${SITE_URL}${localePath(props.locale)}`
const ogImage = `${SITE_URL}/og/og-${props.locale}.png`

/* Deduped with the same useFetch key the pricing section uses, so the Offer
   data in structured markup can never disagree with the rendered prices. */
interface Plan { name: string; price: number; currency: string; isActive: boolean }
const config = useRuntimeConfig()
const { data: planData } = await useFetch<Plan[]>(
  () => `${config.public.apiBase}/api/plans`,
  { key: 'landing-plans', server: true, timeout: 4000, default: () => [] }
)

const offers = computed(() => {
  const active = (planData.value ?? []).filter((p) => p.isActive)
  if (!active.length) return null
  const prices = active.map((p) => p.price)
  return {
    '@type': 'AggregateOffer',
    priceCurrency: active[0]?.currency ?? 'MYR',
    lowPrice: Math.min(...prices),
    highPrice: Math.max(...prices),
    offerCount: active.length,
  }
})

const jsonLd = computed(() => {
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'InvoKita',
      legalName: 'BSYX LABS SDN BHD',
      identifier: '202603086039',
      url: SITE_URL,
      logo: `${SITE_URL}/InvoKitaLogo.png`,
      areaServed: { '@type': 'Country', name: 'Malaysia' },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'InvoKita',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: [copy.htmlLang],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'InvoKita',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Invoicing',
      operatingSystem: 'Web',
      url: canonical,
      description: copy.meta.description,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: copy.htmlLang,
      /* No aggregateRating: there are no ratings yet, and inventing one is
         both dishonest and a structured-data policy violation. */
      ...(offers.value ? { offers: offers.value } : {}),
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
  ]

  // Breadcrumbs only make sense once there is a level to climb back to.
  if (props.locale !== 'en') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'InvoKita', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: copy.localeName, item: canonical },
      ],
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
})

useHead({
  htmlAttrs: { lang: copy.htmlLang },
  title: copy.meta.title,
  link: [
    { rel: 'canonical', href: canonical },
    { rel: 'alternate', hreflang: 'en-MY', href: `${SITE_URL}${localePath('en')}` },
    { rel: 'alternate', hreflang: 'ms-MY', href: `${SITE_URL}${localePath('ms')}` },
    { rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}${localePath('en')}` },
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: '/fonts/plus-jakarta-sans-latin-var.woff2',
      crossorigin: 'anonymous',
    },
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: '/fonts/instrument-serif-latin.woff2',
      crossorigin: 'anonymous',
    },
  ],
  script: [{ innerHTML: THEME_INIT_SCRIPT, tagPosition: 'head' }],
  noscript: [
    // Safety net 1: reveals are opt-in on JS, so without JS nothing hides.
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
  ogImageAlt: copy.meta.ogAlt,
  twitterCard: 'summary_large_image',
  twitterTitle: copy.meta.title,
  twitterDescription: copy.meta.description,
  twitterImage: ogImage,
  twitterImageAlt: copy.meta.ogAlt,
  /* theme-color is read before any CSS is parsed, so it cannot use a custom
     property. Both values come from composables/useBrandTokens.ts, the one
     sanctioned mirror of a locked colour outside design-tokens.css. */
  themeColor: [
    { content: BRAND.paper, media: '(prefers-color-scheme: light)' },
    { content: BRAND.ink, media: '(prefers-color-scheme: dark)' },
  ],
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(jsonLd.value)),
    },
  ],
})
</script>

<template>
  <div ref="root" class="kirim">
    <a href="#main" class="k-skip">{{ copy.nav.skip }}</a>

    <LandingNav :copy="copy" :locale="locale" />

    <main id="main">
      <LandingHero :copy="copy" :locale="locale" />
      <LandingStory :copy="copy" :locale="locale" />
      <LandingSteps :copy="copy" />
      <LandingPayments :copy="copy" />
      <LandingChaser :copy="copy" />
      <LandingBento :copy="copy" />
      <LandingPricing :copy="copy" />
      <LandingFaq :copy="copy" />
      <LandingClose :copy="copy" />
    </main>

    <LandingFooter :copy="copy" :locale="locale" />
  </div>
</template>
