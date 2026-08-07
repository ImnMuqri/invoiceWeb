<script setup lang="ts">
/**
 * LHDN e-Invoice scope checker — English (spec 06).
 *
 * Public. It answers the question people have *before* they sign up, so it
 * must never be added to PROTECTED_PREFIXES in utils/routeAccess.ts.
 */
definePageMeta({ layout: false })
</script>

<template>
  <ScopeChecker locale="en" />
</template>
