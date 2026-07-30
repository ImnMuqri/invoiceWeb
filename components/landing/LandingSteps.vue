<script setup lang="ts">
/**
 * Objection 2 — "setting this up is a whole afternoon I don't have."
 *
 * Deliberately NOT a three-card grid. Steps run as a ruled editorial list with
 * the numeral hanging in the margin and each row indenting further right, so
 * the section reads as a descent toward "done" rather than three equal options.
 */
import type { LandingCopy } from '~/composables/useLandingCopy'

defineProps<{ copy: LandingCopy }>()
</script>

<template>
  <section class="steps k-section" aria-labelledby="steps-title">
    <div class="k-container">
      <header class="steps__head" data-reveal>
        <p class="k-eyebrow">{{ copy.steps.eyebrow }}</p>
        <h2 id="steps-title" class="k-headline steps__title"><KirimText :text="copy.steps.title" /></h2>
        <p class="k-lead steps__lead">{{ copy.steps.lead }}</p>
      </header>

      <ol class="steps__list">
        <li
          v-for="(s, i) in copy.steps.items"
          :key="s.n"
          class="step"
          :style="{ '--_i': i }"
          data-reveal
          data-reveal-group="steps">
          <span class="step__n k-num" aria-hidden="true">{{ s.n }}</span>
          <div class="step__body">
            <h3 class="k-title step__title">{{ s.title }}</h3>
            <p class="k-body step__text">{{ s.body }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.steps__head {
  max-width: var(--measure);
  margin-bottom: clamp(2.5rem, 5vw, 3.5rem);
}
.steps__title {
  margin-block: var(--space-4) var(--space-5);
}

.steps__list {
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
  max-width: 44rem;
}

/* ─── 768: numeral hangs in the margin at display size ──────────────────── */
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
    /* was --border-strong: 1.54:1. A 39px numeral is content, not decoration,
       so it needs 3:1. --text-muted-large exists for exactly this case. */
    color: var(--text-muted-large);
    transition: color var(--dur-base) var(--ease-out);
  }
  .step:hover .step__n {
    color: var(--text-accent);
  }
}

/* ─── 1024: the staircase — each row starts further right ───────────────── */
@media (min-width: 1024px) {
  .step {
    grid-template-columns: 6.5rem minmax(0, 1fr);
    margin-left: calc(var(--_i) * 4.5rem);
    padding-block: var(--space-9);
  }
  .step__text {
    max-width: 38rem;
  }
}

@media (min-width: 1600px) {
  .step {
    margin-left: calc(var(--_i) * 6rem);
  }
}
</style>
