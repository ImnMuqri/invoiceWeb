<script setup>
/**
 * THE PRINT TARGET — /invoices/:id/export
 *
 * Not a page anyone navigates to. The backend generates every PDF by launching
 * Puppeteer against this URL, waiting for `#invoice-content` to be visible and
 * printing it (Backend/src/plugins/puppeteer.js). That contract is load-bearing:
 * the wrapper id and the fact that the document renders without a session both
 * have to stay exactly as they are.
 *
 * What changed is that this page no longer contains its own copy of the invoice
 * layout. It renders the same InvoicePaper component the builder previews, so
 * "what you see is what your client gets" is structurally true rather than a
 * thing two files were supposed to keep agreeing on. They had already stopped:
 * this file laid the party details out in three columns where the preview used
 * two, stamped PAID where the preview did not, and rounded money differently.
 *
 * Deliberately theme-blind. Puppeteer runs headless with no stored preference,
 * and a client's invoice must not depend on what the sender's OS was set to —
 * see the header of assets/css/invoice-paper.css.
 */
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useInvoiceStore } from "~/stores/invoiceStore";
import { docFromInvoice } from "~/utils/invoice";

definePageMeta({ layout: false });

const route = useRoute();
const invoiceStore = useInvoiceStore();

const invoice = ref(null);
const failed = ref(false);

onMounted(async () => {
  try {
    invoice.value = await invoiceStore.fetchInvoiceById(route.params.id);
  } catch {
    failed.value = true;
  }
});

const doc = computed(() =>
  invoice.value
    ? docFromInvoice(invoice.value, {
        receipt: route.query.type === "receipt",
        /* `?template=` exists so a caller can render a layout the invoice has
           not been saved with — used by the live preview links. */
        layout: route.query.template || undefined,
        /* Comes off the invoice's own sender rather than the logged-in user,
           because this page runs without a session — it is loaded by headless
           Chrome. It was simply missing, so every PDF went out unbranded while
           the builder preview showed the logo. */
        logo: invoice.value.user?.profile?.logoUrl || null,
      })
    : null,
);
</script>

<template>
  <div class="sheet">
    <!-- The id Puppeteer waits on. It must wrap something with layout, and it
         must only appear once the document is ready to be photographed. -->
    <div v-if="doc" id="invoice-content" class="sheet__page">
      <InvoicePaper :doc="doc" variant="print" />
    </div>

    <p v-else-if="failed" class="sheet__msg">
      This invoice could not be loaded.
    </p>
    <p v-else class="sheet__msg">Preparing the document…</p>
  </div>
</template>

<style scoped>
/* No shell, no chrome, no theme. The sheet is the page. */
.sheet {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: var(--paper-25);
}
.sheet__page {
  width: 100%;
}
.sheet__msg {
  padding: 4rem 1rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--ink-700);
  text-align: center;
}

@media print {
  .sheet {
    min-height: 0;
    background: none;
  }
}
</style>
