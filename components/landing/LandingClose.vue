<script setup lang="ts">
/**
 * The close. No new information, one CTA, nothing competing.
 * Carries the second and final appearance of the serif — the page opens and
 * shuts on the same voice.
 */
import type { LandingCopy } from '~/composables/useLandingCopy'

defineProps<{ copy: LandingCopy }>()
</script>

<template>
  <section class="close k-section k-section--inverse k-section--loose k-grain-host">
    <KirimGrain id="close" :opacity="0.22" />
    <div class="close__glow" aria-hidden="true"></div>

    <div class="k-container close__inner">
      <h2 class="k-headline close__title" data-reveal>
        <span class="k-serif close__serif">{{ copy.close.title }}</span>
      </h2>
      <p class="k-lead close__lead" data-reveal>{{ copy.close.lead }}</p>
      <div class="close__cta" data-reveal>
        <a href="/register" class="k-btn k-btn--primary k-btn--lg">{{ copy.close.cta }}</a>
        <p class="close__note">{{ copy.close.note }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.close {
  position: relative;
  isolation: isolate;
  text-align: center;
  overflow: hidden;
}

.close__glow {
  position: absolute;
  inset: auto -20% -55% -20%;
  height: 90%;
  z-index: -1;
  background: radial-gradient(
    50% 60% at 50% 100%,
    var(--a-green-32) 0%,
    var(--a-green-08) 45%,
    transparent 72%
  );
}

.close__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
}

.close__title {
  max-width: 18ch;
}
.close__serif {
  color: var(--text-on-slab);
}

.close__lead {
  max-width: 34rem;
}

.close__cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
.close__note {
  font-size: var(--text-sm);
  color: var(--text-on-slab-muted);
}
</style>
