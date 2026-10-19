<script setup lang="ts">
/**
 * Auth shell — sign in, sign up, forgot password, set new password.
 *
 * One screen, no scroll on a laptop: form on the left (paper), an ink panel on
 * the right that shows the product working (each page passes its own panel
 * through the `panel` slot). The panel hides below 900px; on a phone the form
 * is the whole page.
 *
 * Top bar: K mark home, the page's alternate action (sign in ↔ sign up), the
 * EN | BM switch and the theme toggle — the same light/dark the landing page
 * uses (useTheme writes data-theme on <html>, tokens remap against it).
 *
 * Auth pages are noindex: thin, duplicated across every SaaS, and indexing them
 * dilutes the marketing pages that should rank instead.
 */
import { BRAND } from '~/composables/useBrandTokens'
import { THEME_INIT_SCRIPT } from '~/composables/useTheme'
import { useAuthLocale } from '~/composables/useAuthCopy'

const props = defineProps<{
  metaTitle: string
  eyebrow?: string
  /** Renders the eyebrow as a green pill instead of plain text. */
  eyebrowPill?: boolean
  title?: string
  titleAccent?: string
  lead?: string
}>()

const { locale, t, setLocale } = useAuthLocale()
const { isDark, toggle } = useTheme()
const year = new Date().getFullYear()

useHead({
  htmlAttrs: { lang: computed(() => t.value.htmlLang), class: 'kirim-scroll' },
  title: computed(() => props.metaTitle),
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
    <a href="#auth-form" class="k-skip">{{ t.shell.skip }}</a>

    <main class="auth__main">
      <header class="bar">
        <a href="/" class="bar__mark" :aria-label="t.shell.home">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="15" class="bar__tile" />
            <g fill="none" class="bar__glyph" stroke-width="8.5" stroke-linecap="round">
              <path d="M21.5 15V49" />
              <path d="M25 32 42.5 17" />
              <path d="M25 32 44 47" />
            </g>
          </svg>
          <span>InvoKita</span>
        </a>

        <div class="bar__end">
          <p v-if="$slots.alt" class="bar__alt"><slot name="alt" /></p>
          <div class="seg" role="group" :aria-label="t.shell.language">
            <button type="button" :aria-pressed="locale === 'en'" lang="en" @click="setLocale('en')">EN</button>
            <button type="button" :aria-pressed="locale === 'ms'" lang="ms" @click="setLocale('ms')">BM</button>
          </div>
          <button type="button" class="bar__icon" :aria-label="t.shell.theme" @click="toggle">
            <svg v-if="isDark" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r="3.8" fill="currentColor" />
              <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                <path d="M10 1.4v2.2M10 16.4v2.2M1.4 10h2.2M16.4 10h2.2" />
                <path d="M3.9 3.9 5.5 5.5M14.5 14.5l1.6 1.6M16.1 3.9 14.5 5.5M5.5 14.5l-1.6 1.6" />
              </g>
            </svg>
            <svg v-else viewBox="0 0 20 20" aria-hidden="true">
              <path d="M16.5 12.6A7.2 7.2 0 0 1 7.4 3.5a7.2 7.2 0 1 0 9.1 9.1Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </header>

      <div class="auth__center">
        <div id="auth-form" class="auth__inner">
          <slot name="top" />
          <div v-if="title" class="head">
            <p v-if="eyebrow" class="head__eyebrow" :class="{ 'head__eyebrow--pill': eyebrowPill }">{{ eyebrow }}</p>
            <h1 class="head__title">
              {{ title }} <span v-if="titleAccent" class="head__accent k-serif">{{ titleAccent }}</span>
            </h1>
            <p v-if="lead" class="head__lead">{{ lead }}</p>
          </div>
          <slot />
          <!-- On a phone the top bar has no room for the alternate action, so
               it sits under the form instead. -->
          <p v-if="$slots.alt" class="alt-mobile"><slot name="alt" /></p>
        </div>
      </div>

      <footer class="foot">
        <span>© {{ year }} InvoKita · {{ t.shell.madeBy }} <a href="https://bsyx.my" rel="noopener">Bsyx Labs</a></span>
        <span class="foot__links">
          <a href="/legal/terms">{{ t.shell.terms }}</a>
          <a href="/legal/privacy">{{ t.shell.privacy }}</a>
          <a href="mailto:support@invokita.my">{{ t.shell.support }}</a>
        </span>
      </footer>
    </main>

    <aside class="panel k-grain-host" aria-hidden="true">
      <KirimGrain id="auth" :opacity="0.16" />
      <div class="panel__glow"></div>
      <slot name="panel" />
    </aside>
  </div>
</template>

<style scoped>
.auth {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background-color: var(--surface-page);
  color: var(--text-primary);
}
@media (min-width: 900px) {
  .auth {
    height: 100vh;
    height: 100dvh;
    min-height: 40rem;
    overflow: hidden;
  }
}

.auth__main {
  flex: 1 1 30rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: var(--space-6) clamp(1.5rem, 4vw, 3.5rem);
}

/* ── Top bar ───────────────────────────────────────────── */
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.bar__mark {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-primary);
  font-size: var(--text-lg);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  text-decoration: none;
}
.bar__mark svg {
  width: 30px;
  height: 30px;
}
.bar__tile {
  fill: var(--brand-green);
}
.bar__glyph {
  stroke: var(--brand-ink);
}
.bar__end {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.bar__alt {
  display: none;
  margin: 0 var(--space-2) 0 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.bar__alt :deep(a) {
  color: var(--text-accent);
  font-weight: var(--weight-bold);
  text-decoration: none;
}
.bar__alt :deep(a:hover) {
  text-decoration: underline;
}
.alt-mobile {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.alt-mobile :deep(a) {
  color: var(--text-accent);
  font-weight: var(--weight-bold);
}
@media (min-width: 560px) {
  .bar__alt {
    display: block;
  }
  .alt-mobile {
    display: none;
  }
}
.seg {
  display: inline-flex;
  padding: 3px;
  border-radius: var(--radius-md);
  background-color: var(--chip-bg);
}
.seg button {
  min-width: 2.6rem;
  height: 2rem;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  cursor: pointer;
}
.seg button[aria-pressed='true'] {
  background-color: var(--surface-raised);
  color: var(--text-primary);
  box-shadow: var(--shadow-xs);
}
.bar__icon {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}
.bar__icon:hover {
  background-color: var(--chip-hover-bg);
  color: var(--text-primary);
}
.bar__icon svg {
  width: 18px;
  height: 18px;
}

/* ── Form column ───────────────────────────────────────── */
.auth__center {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-block: var(--space-6);
}
.auth__inner {
  width: 100%;
  max-width: 25rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.head {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.head__eyebrow {
  margin: 0;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-accent);
}
.head__eyebrow--pill {
  align-self: flex-start;
  padding: 3px var(--space-3);
  border-radius: var(--radius-full);
  background-color: var(--surface-accent-soft);
  font-weight: var(--weight-extrabold);
}
.head__title {
  margin: 0;
  font-size: clamp(2rem, 3.4vw, 2.5rem);
  font-weight: var(--weight-extrabold);
  line-height: 1.04;
  letter-spacing: -0.045em;
}
.head__accent {
  color: var(--text-accent);
  letter-spacing: -0.01em;
}
.head__lead {
  margin: 0;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

.foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-2) var(--space-5);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
.foot a {
  color: var(--text-tertiary);
  text-decoration: none;
}
.foot a:hover {
  color: var(--text-primary);
}
.foot > span:first-child a {
  color: var(--text-primary);
  font-weight: var(--weight-bold);
}
.foot__links {
  display: flex;
  gap: var(--space-4);
}

/* ── Panel ─────────────────────────────────────────────── */
.panel {
  display: none;
}
@media (min-width: 900px) {
  .panel {
    flex: 1 1 35rem;
    min-width: 0;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    isolation: isolate;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--space-6);
    margin: var(--space-4) var(--space-4) var(--space-4) 0;
    padding: clamp(1.75rem, 3.4vw, 3rem);
    border-radius: var(--radius-2xl);
    background-color: var(--surface-slab);
    color: var(--text-on-slab);
  }
  /* In dark mode the page is dark too, so lift the panel off it. */
  [data-theme='dark'] .panel {
    background-color: var(--ink-900);
    border: 1px solid var(--a-paper-08);
  }
}
.panel__glow {
  position: absolute;
  z-index: -1;
  right: -14rem;
  top: -16rem;
  width: 40rem;
  height: 40rem;
  border-radius: var(--radius-full);
  background: radial-gradient(circle, var(--a-green-32), transparent 62%);
}
</style>
