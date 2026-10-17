<script setup lang="ts">
/**
 * privacy — see composables/useLegalContent.ts for the content and for the list of
 * clauses that still need a lawyer's review.
 */
import { useLegalDoc } from '~/composables/useLegalContent'

definePageMeta({ layout: false })

const doc = useLegalDoc('privacy')
</script>

<template>
  <LegalDoc :doc="doc" />
</template>
