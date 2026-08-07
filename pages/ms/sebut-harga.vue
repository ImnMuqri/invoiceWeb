<script setup lang="ts">
/**
 * Quotations — Bahasa Malaysia (spec 07).
 *
 * The slug is "sebut-harga", not a translation of the English route name. That
 * is the phrase people actually type, and a Malay page sitting on an English
 * word in its url ranks for nothing it is written for. quotationPath() in
 * useLandingCopy is the single place that knows both paths.
 */
definePageMeta({ layout: false })
</script>

<template>
  <QuotationPage locale="ms" />
</template>
