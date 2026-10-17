<script setup lang="ts">
/**
 * Optical correction for full stops in display type.
 *
 * Plus Jakarta Sans ExtraBold gives the period a generous left sidebearing.
 * At 40–76px that reads as a visible gap — "the invoice ." — which makes every
 * headline on the page look like a typo. The text itself is clean; it is a
 * metrics problem, and the fix belongs in the rendering, not in the copy.
 *
 * This wraps each period so it can be pulled back optically. Horizontal margins
 * apply to inline elements, so the period stays inline and line-breaking,
 * selection and copy-paste all behave normally.
 *
 * Optical alignment over mathematical — see README.
 */
const props = defineProps<{ text: string }>()

const parts = computed(() => props.text.split(/(\.)/).filter((p) => p !== ''))
</script>

<template>
  <template v-for="(part, i) in parts" :key="i"
    ><span v-if="part === '.'" class="stop">.</span
    ><template v-else>{{ part }}</template
  ></template>
</template>

<style scoped>
.stop {
  margin-left: -0.06em;
}
</style>
