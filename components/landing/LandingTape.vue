<script setup lang="ts">
/**
 * The green tape between the hero slab and the page. Decorative: the words
 * repeat what the hero already said, so the band is aria-hidden and screen
 * readers get nothing they would have to sit through twice.
 *
 * The phrase list is rendered four times and the row slides by -50%, which
 * lands exactly on the start of the third copy — a seamless loop.
 */
import type { LandingCopy } from '~/composables/useLandingCopy'

const props = defineProps<{ copy: LandingCopy }>()
const words = computed(() => {
  const w = props.copy.hero.tape
  return [...w, ...w, ...w, ...w]
})
</script>

<template>
  <div class="tape" aria-hidden="true">
    <div class="tape__row">
      <template v-for="(w, i) in words" :key="i">
        <span class="tape__word">{{ w }}</span>
        <span class="tape__sep">✳</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tape {
  overflow: hidden;
  padding-block: var(--space-5);
  background-color: var(--surface-accent);
  color: var(--text-on-accent);
}
.tape__row {
  display: flex;
  align-items: center;
  gap: var(--space-7);
  width: max-content;
  padding-left: var(--space-7);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(2rem, 4vw, 2.9rem);
  line-height: 1.1;
  animation: tape 34s linear infinite;
}
.tape__word {
  white-space: nowrap;
}
@keyframes tape {
  to { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .tape__row {
    animation: none;
  }
}
</style>
