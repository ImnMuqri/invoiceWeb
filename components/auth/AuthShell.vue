<script setup lang="ts">
/**
 * Two-panel auth shell, in the KIRIM system.
 *
 * Reassurance on the ink slab at the left, form on warm paper at the right.
 * The panel carries no
 * invented proof — no logos, no testimonials, no counters. Just the three
 * commitments that are actually true and checkable (free plan, no card, cancel
 * yourself) and the real gateway names. At the moment someone is deciding
 * whether to hand over an email address, verifiable specifics beat adjectives.
 *
 * Auth pages are noindex: they are thin, duplicated across every SaaS, and
 * indexing them dilutes the marketing pages that should rank instead.
 */
import { BRAND } from '~/composables/useBrandTokens'
import { THEME_INIT_SCRIPT } from '~/composables/useTheme'

const props = defineProps<{
  eyebrow: string
  title: string
  titleAccent: string
  lead: string
  metaTitle: string
  /** Shown under the ink panel heading. */
  panelTitle: string
  panelPoints: string[]
}>()

const GATEWAYS = ['Billplz', 'ToyyibPay', 'HitPay', 'senangPay']

useHead({
  htmlAttrs: { lang: 'en-MY', class: 'kirim-scroll' },
  title: props.metaTitle,
  script: [{ innerHTML: THEME_INIT_SCRIPT, tagPosition: 'head' }],
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})

useSeoMeta({
  themeColor: [
    { content: BRAND.paper, media: '(prefers-color-scheme: light)' },
    { content: BRAND.ink, media: '(prefers-color-scheme: dark)' },
  ],
})
</script>

<template>
  <div class="kirim auth">
    <a href="#auth-form" class="k-skip">Skip to the form</a>

    <!-- ── Form panel ─────────────────────────────────────────────────────── -->
    <main class="auth__main">
      <div class="auth__inner">
        <!-- One control, not two: a bare wordmark is not a recognisable way
             back, and a separate "home" link next to a linked logo would be two
             anchors to the same destination. The arrow supplies the affordance. -->
        <a href="/" class="back" aria-label="Back to the InvoKita home page">
          <span class="back__arrow" aria-hidden="true">
            <svg viewBox="0 0 20 20">
              <path
                d="M16 10H5M9.5 5.5 5 10l4.5 4.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </span>
          <span class="back__label">Back to</span>
          <!-- wordmark and its full stop must be ONE flex item, or the parent's
               gap opens a space between "InvoKita" and the green dot -->
          <span class="back__mark"
            >InvoKita<span class="mark__dot" aria-hidden="true">.</span></span
          >
        </a>

        <header class="auth__head">
          <p class="k-eyebrow">{{ eyebrow }}</p>
          <h1 class="auth__title">
            {{ title }} <span class="auth__accent"><KirimText :text="titleAccent" /></span>
          </h1>
          <p class="auth__lead">{{ lead }}</p>
        </header>

        <div id="auth-form" class="auth__form">
          <slot />
        </div>

        <p class="auth__alt"><slot name="alt" /></p>
      </div>

      <footer class="auth__foot">
        <a href="/legal/terms">Terms</a>
        <span aria-hidden="true">·</span>
        <a href="/legal/privacy">Privacy</a>
        <span aria-hidden="true">·</span>
        <a href="mailto:support@invokita.my">Support</a>
      </footer>
    </main>

    <!-- ── Reassurance panel ──────────────────────────────────────────────── -->
    <aside class="auth__aside k-grain-host" aria-label="What you get">
      <KirimGrain id="auth" :opacity="0.18" />
      <AuthLedger />

      <div class="aside__inner">
        <h2 class="aside__title">{{ panelTitle }}</h2>

        <ul class="aside__list">
          <li v-for="p in panelPoints" :key="p" class="aside__item">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M3.4 8.4 6.4 11.4 12.6 4.6"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>{{ p }}</span>
          </li>
        </ul>

        <div class="aside__gw">
          <p class="aside__gw-label">Connects to the gateways you already use</p>
          <ul class="aside__gw-list">
            <li v-for="g in GATEWAYS" :key="g">{{ g }}</li>
          </ul>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
}

/* ─── Form side ───────────────────────────────────────────────────────────── */
.auth__main {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-8);
  padding: var(--space-6) var(--gutter) var(--space-6);
  background-color: var(--surface-page);
}

.auth__inner {
  width: 100%;
  max-width: 25rem;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  gap: var(--space-7);
}

.back {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: var(--space-2);
  min-height: 2.5rem;
  margin-left: calc(var(--space-2) * -1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  text-decoration: none;
  font-size: var(--text-lg);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  color: var(--text-primary);
  transition: background-color var(--dur-fast) var(--ease-out);
}
.back:hover {
  background-color: var(--chip-hover-bg);
}
.back__arrow {
  display: grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  flex: none;
  color: var(--text-tertiary);
  transition:
    transform var(--dur-base) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}
.back__arrow svg {
  width: 18px;
  height: 18px;
}
.back:hover .back__arrow {
  transform: translateX(-3px);
  color: var(--text-accent);
}
/* "Back to" is the affordance; the wordmark is the destination. Hidden on the
   narrowest screens where the arrow alone carries it and space is tight. */
.back__label {
  display: none;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-normal);
  color: var(--text-secondary);
}
.back__mark {
  white-space: nowrap;
}
.mark__dot {
  color: var(--text-accent);
}

@media (min-width: 480px) {
  .back__label {
    display: inline;
  }
}

@media (prefers-reduced-motion: reduce) {
  .back:hover .back__arrow {
    transform: none;
  }
}

.auth__title {
  margin-top: var(--space-4);
  font-size: clamp(1.9531rem, 1.6rem + 1.6vw, 2.4414rem);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  line-height: var(--leading-tight);
  color: var(--text-primary);
  text-wrap: balance;
}
.auth__accent {
  color: var(--text-accent);
}
.auth__lead {
  margin-top: var(--space-4);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

.auth__alt {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-align: center;
}

.auth__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
.auth__foot a {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  color: var(--text-tertiary);
  text-decoration: none;
}
.auth__foot a:hover {
  color: var(--text-accent);
}

/* ─── Reassurance side ────────────────────────────────────────────────────── */
.auth__aside {
  display: none;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background-color: var(--surface-slab);
  color: var(--text-on-slab);
  padding: var(--space-10) var(--space-9);
  align-content: center;
}
.aside__inner {
  position: relative;
  z-index: 1;
  max-width: 26rem;
}

.aside__title {
  font-size: clamp(1.5625rem, 1.3rem + 1vw, 1.9531rem);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  line-height: var(--leading-snug);
  color: var(--text-on-slab);
  text-wrap: balance;
}

.aside__list {
  display: grid;
  gap: var(--space-4);
  margin: var(--space-7) 0 0;
  padding: 0;
  list-style: none;
}
.aside__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-3);
  align-items: start;
  font-size: var(--text-md);
  line-height: var(--leading-relaxed);
  color: var(--text-on-slab-muted);
}
.aside__item svg {
  width: 18px;
  height: 18px;
  margin-top: 4px;
  color: var(--text-on-slab-accent);
}

.aside__gw {
  margin-top: var(--space-9);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-on-slab);
}
.aside__gw-label {
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-on-slab-muted);
  margin-bottom: var(--space-4);
}
.aside__gw-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.aside__gw-list li {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-on-slab);
  border-radius: var(--radius-full);
  background-color: var(--chip-on-slab-bg);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-on-slab);
}

/* ─── Breakpoints ─────────────────────────────────────────────────────────── */
@media (min-width: 1024px) {
  /* Columns are [panel, form]. The form stays FIRST in the DOM — it is the
     reason the page exists, so it should be what a screen reader and the tab
     key reach first — and is only moved visually with `order`. That is safe
     here because the aside contains no interactive elements at all, so there is
     no focus-order mismatch to create (WCAG 2.4.3). */
  .auth {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .auth__aside {
    order: 1;
    display: grid;
    /* In dark mode the slab (ink-975) and the form side (ink-950) are one step
       apart, which reads as a smudge rather than a division. A hairline does
       the work that a colour difference cannot. */
    border-right: 1px solid var(--border-default);
  }
  .auth__main {
    order: 2;
    padding: var(--space-8) var(--space-9);
  }
}

@media (min-width: 1440px) {
  .auth {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  }
}
</style>
