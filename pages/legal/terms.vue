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
          Terms & <span class="text-emerald-600">Conditions.</span>
        </h1>
        <p class="text-slate-500 font-medium">Last updated: April 17, 2026</p>
      </div>

      <div class="prose prose-slate max-w-none text-sm">
        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            1. Acceptance of Terms
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            By accessing and using InvoKita ("the Service"), provided by BSYX
            LABS ("the Company"), you agree to be bound by these Terms and
            Conditions. If you do not agree to these terms, please do not use
            the Service.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            2. Description of Service
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            InvoKita is an AI-powered invoicing and billing platform designed
            for Malaysian businesses and freelancers. Features include invoice
            generation, client management, automated reminders, and payment
            gateway integrations.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            3. User Accounts
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            To use certain features of the Service, you must register for an
            account. You are responsible for maintaining the confidentiality of
            your account credentials and for all activities that occur under
            your account. You agree to provide accurate and complete information
            during registration.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            4. Subscriptions and Payments
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            Certain features of InvoKita require a paid subscription. All fees
            are in Malaysian Ringgit (MYR) unless otherwise stated.
            Subscriptions are billed on a recurring basis. You may cancel your
            subscription at any time; however, unless required by law, payments
            are non-refundable except as provided in our Refund Policy.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            5. Use of AI Features
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            InvoKita utilizes artificial intelligence to assist in drafting
            invoices. While we strive for accuracy, the Company does not
            guarantee the correctness of AI-generated content. Users are
            responsible for reviewing and verifying all information before
            sending invoices to clients.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            6. Intellectual Property
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            All content, trademarks, and data on InvoKita, including software,
            layout, and graphics, are the property of BSYX LABS or its
            licensors. You are granted a limited, non-exclusive license to use
            the Service for your business purposes.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">7. Termination</h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            The Company reserves the right to terminate or suspend your access
            to the Service at any time, without prior notice, for conduct that
            we believe violates these Terms or is harmful to other users or the
            Company.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            8. Governing Law
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            These Terms shall be governed by and construed in accordance with
            the laws of Malaysia. Any disputes arising from these Terms shall be
            subject to the exclusive jurisdiction of the courts of Malaysia.
          </p>
        </section>
      </div>

      <div
        class="mt-16 pt-8 border-t border-slate-200 flex flex-col items-center gap-6">
        <p class="text-sm text-slate-500 font-medium">
          Questions about our terms?
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
  title: "Terms & Conditions - InvoKita",
  meta: [
    {
      name: "description",
      content:
        "InvoKita Terms and Conditions for using our AI-powered invoicing services.",
    },
  ],
});
</script>

<style scoped>
.prose h2 {
  margin-top: 2.5rem;
}
</style>
