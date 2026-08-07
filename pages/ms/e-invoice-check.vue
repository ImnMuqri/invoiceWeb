<script setup lang="ts">
/**
 * LHDN e-Invoice scope checker — Bahasa Malaysia (spec 06).
 *
 * A real route (/ms/e-invoice-check) rather than a client-side language
 * toggle, so the BM version is independently crawlable, linkable and
 * indexable — the same reasoning as pages/ms/index.vue. People search for this
 * in Malay far more than they search for it in English.
 */
definePageMeta({ layout: false })
</script>

<template>
  <ScopeChecker locale="ms" />
</template>
