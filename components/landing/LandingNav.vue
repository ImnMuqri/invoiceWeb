<script setup lang="ts">
import type { Locale, LandingCopy } from '~/composables/useLandingCopy'
import { localePath } from '~/composables/useLandingCopy'

const props = defineProps<{ copy: LandingCopy; locale: Locale }>()

const scrolled = ref(false)
const menuOpen = ref(false)
const { isDark, toggle } = useTheme()

const otherLocale = computed<Locale>(() => (props.locale === 'ms' ? 'en' : 'ms'))
const otherHref = computed(() => localePath(otherLocale.value))
const home = computed(() => localePath(props.locale))

let onScroll: (() => void) | undefined
onMounted(() => {
  onScroll = () => {
    scrolled.value = window.scrollY > 12
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  if (onScroll) window.removeEventListener('scroll', onScroll)
})

watch(menuOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="nav" :class="{ 'nav--scrolled': scrolled }">
    <div class="nav__inner k-container k-container--wide">
      <a :href="home" class="mark" :aria-label="copy.nav.home">
        <!-- Wordmark rendered as text so it stays crisp and themes for free.
             Swap point for the real logo asset — see README. -->
        <span class="mark__text">InvoKita</span><span class="mark__dot" aria-hidden="true">.</span>
      </a>

      <nav class="nav__links" aria-label="Sections">
        <a v-for="l in copy.nav.links" :key="l.id" :href="`#${l.id}`" class="nav__link">
          {{ l.label }}
        </a>
      </nav>

      <div class="nav__actions">
        <a :href="otherHref" class="nav__lang nav__lang--wide" :hreflang="otherLocale === 'ms' ? 'ms-MY' : 'en-MY'">
          <svg class="nav__lang-ico" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.4" />
            <ellipse cx="8" cy="8" rx="2.9" ry="6.6" fill="none" stroke="currentColor" stroke-width="1.4" />
            <path d="M1.6 8h12.8" stroke="currentColor" stroke-width="1.4" />
          </svg>
          {{ otherLocale === 'ms' ? 'BM' : 'EN' }}
          <span class="k-sr">{{ copy.nav.localeSwitchTo }}</span>
        </a>

        <button type="button" class="nav__icon-btn" @click="toggle">
          <span class="k-sr">{{ copy.nav.themeToggle }}</span>
          <svg v-if="isDark" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="3.8" fill="currentColor" />
            <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
              <path d="M10 1.4v2.2M10 16.4v2.2M1.4 10h2.2M16.4 10h2.2" />
              <path d="M3.9 3.9 5.5 5.5M14.5 14.5l1.6 1.6M16.1 3.9 14.5 5.5M5.5 14.5l-1.6 1.6" />
            </g>
          </svg>
          <svg v-else viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M16.5 12.6A7.2 7.2 0 0 1 7.4 3.5a7.2 7.2 0 1 0 9.1 9.1Z"
              fill="currentColor" />
          </svg>
        </button>

        <a href="/login" class="nav__signin">{{ copy.nav.signIn }}</a>
        <a href="/register" class="k-btn k-btn--primary nav__cta">{{ copy.nav.cta }}</a>

        <button
          type="button"
          class="nav__burger"
          :aria-expanded="menuOpen"
          aria-controls="k-mobile-menu"
          @click="menuOpen = !menuOpen">
          <span class="k-sr">{{ menuOpen ? copy.nav.closeMenu : copy.nav.openMenu }}</span>
          <span class="nav__burger-lines" :class="{ 'is-open': menuOpen }" aria-hidden="true">
            <i></i><i></i>
          </span>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="sheet">
      <div v-if="menuOpen" id="k-mobile-menu" class="sheet k-scroll">
        <nav class="sheet__nav" aria-label="Sections">
          <a
            v-for="l in copy.nav.links"
            :key="l.id"
            :href="`#${l.id}`"
            class="sheet__link"
            @click="closeMenu">
            {{ l.label }}
          </a>
        </nav>
        <div class="sheet__foot">
          <a
            :href="otherHref"
            class="sheet__lang"
            :hreflang="otherLocale === 'ms' ? 'ms-MY' : 'en-MY'">
            {{ copy.localeSwitchTo }}
          </a>
          <a href="/login" class="k-btn k-btn--secondary sheet__btn" @click="closeMenu">
            {{ copy.nav.signIn }}
          </a>
          <a href="/register" class="k-btn k-btn--primary sheet__btn" @click="closeMenu">
            {{ copy.nav.cta }}
          </a>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: var(--z-nav);
  background-color: transparent;
  transition:
    background-color var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out);
  border-bottom: 1px solid transparent;
}
.nav--scrolled {
  background-color: var(--nav-bg);
  -webkit-backdrop-filter: saturate(1.4) blur(12px);
  backdrop-filter: saturate(1.4) blur(12px);
  border-bottom-color: var(--border-subtle);
}

.nav__inner {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  height: 4.25rem;
}

.mark {
  display: inline-flex;
  align-items: baseline;
  text-decoration: none;
  font-size: var(--text-lg);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tighter);
  color: var(--text-primary);
  flex: none;
}
.mark__dot {
  color: var(--text-accent);
}

.nav__links {
  display: none;
  gap: var(--space-5);
  margin-inline: auto;
}
.nav__link {
  position: relative;
  /* inline-flex so the vertical padding actually creates a >=24px target;
     on an inline <a> it would paint but not affect the hit area (WCAG 2.5.8) */
  display: inline-flex;
  align-items: center;
  min-height: 2.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  transition: color var(--dur-fast) var(--ease-out);
}
.nav__link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0.55rem;
  height: 1.5px;
  width: 0;
  background-color: var(--text-accent);
  transition: width var(--dur-base) var(--ease-out);
}
.nav__link:hover {
  color: var(--text-primary);
}
.nav__link:hover::after {
  width: 100%;
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

.nav__lang,
.nav__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  height: 2.5rem;
  min-width: 2.5rem;
  padding-inline: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  background: none;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wide);
  text-decoration: none;
  cursor: pointer;
  transition:
    color var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) var(--ease-out);
}
.nav__lang:hover,
.nav__icon-btn:hover {
  color: var(--text-primary);
  background-color: var(--chip-hover-bg);
}
.nav__lang-ico {
  width: 14px;
  height: 14px;
}
/* The language toggle stays visible at every width. Hiding it below 480px was
   a regression from making room for the CTA: on a 390px phone — the primary
   device for this audience — the only way to reach the Malay page was the
   footer. It is a 44px control; there is room. */
.nav__lang--wide {
  display: inline-flex;
}
.nav__icon-btn svg {
  width: 18px;
  height: 18px;
}

.nav__signin {
  display: none;
  align-items: center;
  min-height: 2.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  padding-inline: var(--space-3);
}
.nav__signin:hover {
  color: var(--text-primary);
}

/* The CTA stays visible at every width. Hiding the single most important
   conversion element behind a hamburger on mobile is a conversion tax. */
.nav__cta {
  min-height: 2.5rem;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  box-shadow: none;
}

.nav__burger {
  display: inline-grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: none;
  color: var(--text-primary);
  cursor: pointer;
}
.nav__burger-lines {
  display: grid;
  gap: 4px;
  width: 16px;
}
.nav__burger-lines i {
  display: block;
  height: 1.8px;
  background-color: currentColor;
  border-radius: var(--radius-full);
  transition: transform var(--dur-base) var(--ease-out);
}
.nav__burger-lines.is-open i:first-child {
  transform: translateY(3px) rotate(45deg);
}
.nav__burger-lines.is-open i:last-child {
  transform: translateY(-3px) rotate(-45deg);
}

/* ─── Mobile sheet ──────────────────────────────────────────────────────── */
.sheet {
  position: fixed;
  inset: 4.25rem 0 0;
  z-index: var(--z-overlay);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--space-6) var(--gutter) var(--space-9);
  background-color: var(--surface-page);
  overflow-y: auto;
}
.sheet__nav {
  display: flex;
  flex-direction: column;
}
.sheet__link {
  padding-block: var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
  text-decoration: none;
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
}
.sheet__foot {
  display: grid;
  gap: var(--space-3);
  padding-top: var(--space-7);
}
.sheet__btn {
  width: 100%;
}
.sheet__lang {
  display: inline-block;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-accent);
  text-decoration: none;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity var(--dur-base) var(--ease-out);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

/* ─── Breakpoints ───────────────────────────────────────────────────────── */
@media (min-width: 480px) {
  .nav__cta {
    padding-inline: var(--space-5);
  }
}
@media (min-width: 768px) {
  .nav__signin {
    display: inline-flex;
  }
  .nav__burger {
    display: none;
  }
}
@media (min-width: 1024px) {
  .nav__links {
    display: flex;
  }
}
</style>
