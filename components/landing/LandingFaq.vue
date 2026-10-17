<script setup lang="ts">
/**
 * Built on native <details>/<summary>.
 *
 * Reason: it is keyboard-operable, screen-reader-announced and expandable with
 * zero JavaScript, and the answers stay in the DOM for crawlers. A custom
 * button/aria-expanded implementation would be more code for less behaviour.
 */
import type { Locale, LandingCopy } from '~/composables/useLandingCopy'
import { scopeCheckerPath } from '~/composables/useLandingCopy'

const props = defineProps<{ copy: LandingCopy; locale: Locale }>()

/* The e-Invoice answer is the one that carries a link, so it renders as its
   own entry rather than as another string in the items list. It sits last on
   purpose: it is the longest, and it is the one people arrive already looking
   for, which is what the deep link from the checker relies on. */
const checkerHref = computed(() => scopeCheckerPath(props.locale))
</script>

<template>
  <section id="faq" class="faq k-section" aria-labelledby="faq-title">
    <div class="k-container faq__inner">
      <header class="faq__head" data-reveal>
        <p class="k-eyebrow">{{ copy.faq.eyebrow }}</p>
        <h2 id="faq-title" class="k-headline faq__title"><KirimText :text="copy.faq.title" /></h2>
      </header>

      <div class="faq__list">
        <details v-for="(item, i) in copy.faq.items" :key="i" class="qa" :name="'faq'">
          <summary class="qa__q">
            <span>{{ item.q }}</span>
            <span class="qa__sign" aria-hidden="true">
              <i></i><i></i>
            </span>
          </summary>
          <div class="qa__a">
            <p>{{ item.a }}</p>
          </div>
        </details>

        <details id="einvoice" class="qa" :name="'faq'">
          <summary class="qa__q">
            <span>{{ copy.faq.einvoice.q }}</span>
            <span class="qa__sign" aria-hidden="true">
              <i></i><i></i>
            </span>
          </summary>
          <div class="qa__a">
            <p v-for="(p, i) in copy.faq.einvoice.a" :key="i">{{ p }}</p>
            <a :href="checkerHref" class="qa__cta">{{ copy.faq.einvoice.linkLabel }} →</a>
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq__inner {
  display: grid;
  gap: clamp(2rem, 5vw, 3.5rem);
}

.faq__head {
  max-width: 26rem;
}
.faq__title {
  margin-top: var(--space-4);
}

.faq__list {
  border-top: 1px solid var(--border-default);
}

.qa {
  border-bottom: 1px solid var(--border-default);
}

.qa__q {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-5);
  padding-block: var(--space-5);
  cursor: pointer;
  list-style: none;
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-snug);
  color: var(--text-primary);
  transition: color var(--dur-fast) var(--ease-out);
}
.qa__q::-webkit-details-marker {
  display: none;
}
.qa__q:hover {
  color: var(--text-accent);
}

/* Plus/minus built from two rules so it can animate without an icon font */
.qa__sign {
  position: relative;
  flex: none;
  width: 1.35rem;
  height: 1.35rem;
  margin-top: 2px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-strong);
  transition:
    background-color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out);
}
.qa__sign i {
  position: absolute;
  inset: 50% 22% auto 22%;
  height: 1.5px;
  background-color: currentColor;
  transform: translateY(-50%);
  transition: transform var(--dur-base) var(--ease-out);
}
.qa__sign i:last-child {
  transform: translateY(-50%) rotate(90deg);
}
.qa[open] .qa__sign {
  background-color: var(--surface-accent-soft);
  border-color: var(--border-accent);
}
.qa[open] .qa__sign i:last-child {
  transform: translateY(-50%) rotate(0deg);
}
.qa[open] .qa__q {
  color: var(--text-accent);
}

.qa__a {
  padding-bottom: var(--space-6);
  padding-right: var(--space-8);
  max-width: var(--measure);
}
.qa__a p {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.qa__a p + p {
  margin-top: var(--space-4);
}

.qa__cta {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  margin-top: var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--text-accent);
  text-decoration: none;
  border-bottom: 1px solid var(--border-accent);
  padding-bottom: 2px;
  transition: border-color var(--dur-fast) var(--ease-out);
}
.qa__cta:hover {
  border-bottom-color: currentColor;
}

/* Progressive enhancement: browsers that support it animate the disclosure. */
@supports (interpolate-size: allow-keywords) {
  .qa {
    interpolate-size: allow-keywords;
  }
  .qa::details-content {
    block-size: 0;
    overflow: hidden;
    opacity: 0;
    transition:
      block-size var(--dur-slow) var(--ease-out),
      opacity var(--dur-base) var(--ease-out),
      content-visibility var(--dur-slow) allow-discrete;
  }
  .qa[open]::details-content {
    block-size: auto;
    opacity: 1;
  }
}

@media (min-width: 1024px) {
  .faq__inner {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.4fr);
    gap: clamp(3rem, 6vw, 5rem);
    align-items: start;
  }
  .faq__head {
    position: sticky;
    top: 7rem;
  }
  .faq__list {
    border-top: none;
  }
  .qa:first-child {
    border-top: 1px solid var(--border-default);
  }
}

@media (prefers-reduced-motion: reduce) {
  .qa::details-content {
    transition: none;
  }
}
</style>
