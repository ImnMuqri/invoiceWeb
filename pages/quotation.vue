<script setup lang="ts">
/**
 * Quotations — English (spec 07).
 *
 * Public. It answers the question somebody has *before* they sign up, so it
 * must never be added to PROTECTED_PREFIXES in utils/routeAccess.ts.
 *
 * Note the singular: /quotation is this marketing page, /quotes is the
 * authenticated module. The two must not be confused, which is why the
 * protected prefix list is keyed on the plural.
 */
definePageMeta({ layout: false })
</script>

<template>
  <QuotationPage locale="en" />
</template>
