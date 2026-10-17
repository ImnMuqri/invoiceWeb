<script setup lang="ts">
/**
 * terms — see composables/useLegalContent.ts for the content and for the list of
 * clauses that still need a lawyer's review.
 */
import { useLegalDoc } from '~/composables/useLegalContent'

definePageMeta({ layout: false })

const doc = useLegalDoc('terms')
</script>

<template>
  <LegalDoc :doc="doc" />
</template>
