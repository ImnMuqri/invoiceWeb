<script setup lang="ts">
/**
 * InvoKita landing page — Bahasa Malaysia.
 *
 * A real route (/ms) rather than a client-side language toggle, so the BM
 * version is independently crawlable, linkable and indexable, with its own
 * canonical and its own <html lang="ms-MY">.
 */
definePageMeta({ layout: false })
</script>

<template>
  <LandingPage locale="ms" />
</template>
