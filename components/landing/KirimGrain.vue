<script setup lang="ts">
/**
 * Layered noise, generated not imported.
 *
 * Rendered as a real inline SVG rather than a data-URI background so the
 * tint comes from `currentColor` — which means it resolves to a design token
 * and no raw hex is smuggled into the page. feTurbulence produces the grain;
 * a luminance mask turns it into coverage over a token-coloured rect.
 */
withDefaults(
  defineProps<{
    /** Unique id — two filters on one page must not share one. */
    id: string
    opacity?: number
    /** Higher = finer grain. */
    frequency?: number
  }>(),
  { opacity: 0.42, frequency: 0.82 }
)
</script>

<template>
  <svg class="grain" :style="{ opacity }" aria-hidden="true" focusable="false" preserveAspectRatio="none">
    <defs>
      <filter :id="`grain-f-${id}`" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          :baseFrequency="frequency"
          numOctaves="3"
          stitchTiles="stitch"
          result="n" />
        <feColorMatrix
          in="n"
          type="matrix"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  1 0 0 0 0" />
      </filter>
      <mask :id="`grain-m-${id}`">
        <!-- #fff here is a MASK LUMINANCE VALUE, not a colour: in an SVG mask
             white means "fully opaque". The visible tint comes from the rect
             below, which uses currentColor and therefore a design token. -->
        <rect width="100%" height="100%" fill="#fff" :filter="`url(#grain-f-${id})`" />
      </mask>
    </defs>
    <rect
      width="100%"
      height="100%"
      fill="currentColor"
      :mask="`url(#grain-m-${id})`" />
  </svg>
</template>

<style scoped>
/* currentColor is set by the consuming section to a token, never a literal. */
.grain {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: var(--grain-blend);
  color: var(--grain-color);
}
</style>
