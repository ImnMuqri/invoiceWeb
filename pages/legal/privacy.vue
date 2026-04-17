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
          Privacy <span class="text-emerald-600">Policy.</span>
        </h1>
        <p class="text-slate-500 font-medium">Last updated: April 17, 2026</p>
      </div>

      <div class="prose prose-slate max-w-none text-sm">
        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">1. Introduction</h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            At InvoKita, we respect your privacy and are committed to protecting
            your personal data. This Privacy Policy explains how BSYX LABS
            ("we," "us," or "our") collects, uses, and safeguards your
            information when you use our service.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            2. Data We Collect
          </h2>
          <p class="text-slate-600 leading-relaxed mb-1">
            We may collect the following types of information:
          </p>
          <ul class="list-disc pl-6 text-slate-600 space-y-2">
            <li>
              <strong>Account Information:</strong> Name, email address, and
              company details provided during registration.
            </li>
            <li>
              <strong>Transactional Data:</strong> Information about invoices
              you create, client details, and payment statuses.
            </li>
            <li>
              <strong>Usage Data:</strong> Information on how you interact with
              our Service, collected via logs and cookies.
            </li>
            <li>
              <strong>Payment Information:</strong> We do not store credit card
              details. All payments are processed via secure third-party
              gateways (Billplz, ToyyibPay).
            </li>
          </ul>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            3. How We Use Your Data
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            We use your information to provide and improve the Service, process
            transactions, send automated reminders to your clients
            (Email/WhatsApp), and communicate with you about your account.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            4. Data Security
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            We implement bank-level encryption (AES-256) and strict access
            controls to protect your data. However, no method of transmission
            over the internet is 100% secure, and we cannot guarantee absolute
            security.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            5. Third-Party Services
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            We share data with trusted third-party service providers only as
            necessary to provide the Service (e.g., Resend for emails, WhatsApp
            API providers, and Payment Gateways). We do not sell your personal
            information to third parties.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">6. Your Rights</h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            Under Malaysian law (PDPA), you have the right to access, correct,
            or delete your personal data. You may exercise these rights through
            your account settings or by contacting our support team.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            7. Updates to This Policy
          </h2>
          <p class="text-slate-600 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated "Last updated" date.
          </p>
        </section>
      </div>

      <div
        class="mt-16 pt-8 border-t border-slate-200 flex flex-col items-center gap-6">
        <p class="text-sm text-slate-500 font-medium">
          Have questions about your data?
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
  title: "Privacy Policy - InvoKita",
  meta: [
    {
      name: "description",
      content:
        "InvoKita Privacy Policy - Learn how we protect your business data.",
    },
  ],
});
</script>

<style scoped>
.prose h2 {
  margin-top: 2.5rem;
}
</style>
