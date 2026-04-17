<template>
  <div class="min-h-screen bg-[#f8fafc] font-sans selection:bg-emerald-600/20">
    <!-- Simple Header -->
    <nav
      class="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4 md:px-12 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2">
        <UiLogo size="md" />
      </NuxtLink>
      <NuxtLink
        to="/register"
        class="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
        Create free account
      </NuxtLink>
    </nav>

    <main class="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <div class="mb-12">
        <h1
          class="text-4xl md:text-5xl font-semibold tracking-tighter text-slate-900 mb-4">
          Refund <span class="text-emerald-600">Policy.</span>
        </h1>
        <p class="text-slate-500 font-medium">Last updated: April 17, 2026</p>
      </div>

      <div class="prose prose-slate max-w-none text-sm">
        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            1. General Policy
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            At InvoKita, we strive to provide a high-quality invoicing
            experience. Because our service is digital and provides immediate
            access upon subscription, we generally do not offer refunds once a
            payment has been processed.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            2. 7-Day Satisfaction Guarantee
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            We want you to be completely satisfied with InvoKita. For first-time
            subscribers to our Paid Plans, we offer a
            <strong>7-day satisfaction guarantee</strong>. If you decide that
            InvoKita isn't the right fit for your business within the first 7
            days of your initial subscription, you may request a full refund.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            3. Refund Eligibility
          </h2>
          <p class="text-slate-600 leading-relaxed mb-1">
            To be eligible for a refund under the 7-day guarantee:
          </p>
          <ul class="list-disc pl-6 text-slate-600 space-y-2">
            <li>
              It must be your first time subscribing to a paid plan on InvoKita.
            </li>
            <li>
              The refund request must be made via email within 7 days of the
              transaction date.
            </li>
            <li>
              Accounts that have violated our Terms & Conditions are not
              eligible for refunds.
            </li>
          </ul>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            4. Process for Requesting a Refund
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            To request a refund, please email our support team at
            <a
              href="mailto:support@invokita.my"
              class="text-emerald-600 hover:text-emerald-700 font-semibold"
              >support@invokita.my</a
            >
            with your account email address and the reason for your request.
            Once approved, the refund will be processed to your original payment
            method within 5-10 business days.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            5. Plan Downgrades
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            If you downgrade your plan mid-cycle, the change will take effect at
            the end of your current billing period. No partial refunds or
            credits will be issued for unused time on a higher-tier plan.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            6. Exceptional Circumstances
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            In rare cases (such as billing errors or prolonged service
            downtime), we may issue refunds or account credits at our sole
            discretion.
          </p>
        </section>
      </div>

      <div
        class="mt-16 pt-8 border-t border-slate-200 flex flex-col items-center gap-6">
        <p class="text-sm text-slate-500 font-medium">
          Need help with a payment issue?
        </p>
        <a
          href="mailto:support@invokita.my"
          class="text-sm px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all">
          Contact Support
        </a>
      </div>
    </main>

    <!-- Footer Simple -->
    <footer
      class="flex flex-col items-center bg-white border-t border-slate-200 px-6 py-12 md:px-12 text-center">
      <UiLogo size="md" class="mb-6 opacity-50 grayscale" />
      <p class="text-xs text-slate-400 font-medium">
        © 2026 InvoKita. A product of BSYX LABS (202603086039).
      </p>
    </footer>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
});

useHead({
  title: "Refund Policy - InvoKita",
  meta: [
    {
      name: "description",
      content:
        "InvoKita Refund Policy - Fair and transparent refund terms for our subscribers.",
    },
  ],
});
</script>

<style scoped>
.prose h2 {
  margin-top: 2.5rem;
}
</style>
