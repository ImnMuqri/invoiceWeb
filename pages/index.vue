<template>
  <div
    class="landing-bg min-h-screen w-full relative overflow-x-hidden font-sans text-slate-900 flex flex-col selection:bg-indigo-500/30">
    <!-- Navigation -->
    <nav
      class="relative z-50 px-6 py-6 md:px-12 flex items-center justify-between pointer-events-auto">
      <div
        class="flex items-center gap-2 text-2xl font-bold tracking-tighter text-slate-900">
        <svg
          class="w-7 h-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round">
          <path
            d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
          <path d="M7 7h.01" />
        </svg>
        arto.
      </div>
      <div class="flex items-center">
        <NuxtLink
          to="/login"
          class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mr-6"
          >Sign In</NuxtLink
        >
        <NuxtLink
          to="/dashboard"
          class="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-full border border-transparent hover:bg-slate-800 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md">
          <span>Enter App</span>
          <svg
            class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </NuxtLink>
      </div>
    </nav>

    <!-- Animated Background Orbs (Simple & Professional) -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        class="orb orb-1 absolute w-[600px] h-[600px] rounded-full bg-slate-200/60 blur-[120px] -top-[10%] -right-[10%]"></div>
      <div
        class="orb orb-2 absolute w-[500px] h-[500px] rounded-full bg-indigo-100/50 blur-[120px] bottom-[10%] -left-[10%]"></div>
      <div
        class="orb orb-3 absolute w-[400px] h-[400px] rounded-full bg-slate-100/80 blur-[100px] top-[40%] left-[30%]"></div>
    </div>

    <!-- Floating UI Elements -->
    <div
      class="absolute inset-0 z-10 pointer-events-none flex justify-center items-center">
      <!-- Floating Card 1 -->
      <div
        class="float-slow absolute -left-12 md:left-24 top-1/4 w-64 h-32 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rotate-[-6deg] hidden sm:block">
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-800">Invoice Paid</div>
            <div class="text-[10px] text-slate-500">Just now</div>
          </div>
        </div>
        <div class="text-2xl font-bold tracking-tight text-slate-900">
          $4,250.00
        </div>
      </div>

      <!-- Floating Card 2 -->
      <div
        class="float-medium absolute -right-8 md:right-32 bottom-1/3 w-48 h-48 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rotate-[8deg] hidden lg:flex flex-col">
        <div class="text-xs font-semibold text-slate-500 mb-4">
          Weekly Revenue
        </div>
        <div class="flex items-end gap-2 h-16 mt-auto">
          <div class="w-full bg-slate-100 rounded-t-sm h-[40%]"></div>
          <div class="w-full bg-slate-100 rounded-t-sm h-[60%]"></div>
          <div class="w-full bg-slate-100 rounded-t-sm h-[30%]"></div>
          <div class="w-full bg-indigo-500 rounded-t-sm h-[90%] relative">
            <div
              class="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
          </div>
          <div class="w-full bg-slate-100 rounded-t-sm h-[70%]"></div>
        </div>
      </div>

      <!-- Floating Card 3 -->
      <div
        class="float-subtle absolute right-8 md:right-48 top-20 w-56 h-auto bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hidden md:block"
        style="--rotation: 4deg">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
            <img
              src="https://i.pravatar.cc/100?img=33"
              alt="Avatar"
              class="w-full h-full object-cover opacity-90" />
          </div>
          <div>
            <div class="text-sm font-semibold text-slate-800">
              Sarah Jenkins
            </div>
            <div class="text-[10px] text-slate-500">New Client Added</div>
          </div>
        </div>
      </div>

      <!-- Floating Card 4 -->
      <div
        class="float-slow absolute left-8 md:left-32 bottom-24 w-auto bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-full py-2.5 px-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hidden sm:flex items-center gap-2"
        style="--rotation: -4deg; animation-delay: 2s">
        <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
        <span class="text-xs font-semibold text-slate-600"
          >3 Invoices Pending</span
        >
      </div>

      <!-- Subtle particles -->
      <div
        class="particle anim-p-1 absolute top-[20%] right-[25%] w-2 h-2 rounded-full bg-slate-300 blur-[1px]"></div>
      <div
        class="particle anim-p-2 absolute bottom-[30%] left-[40%] w-1.5 h-1.5 rounded-full bg-indigo-300 blur-[1px]"></div>
      <div
        class="particle anim-p-3 absolute top-[60%] right-[15%] w-2.5 h-2.5 rounded-full bg-slate-200 blur-[2px]"></div>
      <div
        class="particle anim-p-1 absolute top-[40%] left-[20%] w-3 h-3 rounded-full bg-indigo-200 blur-[2px]"
        style="animation-delay: 1s"></div>
      <div
        class="particle anim-p-2 absolute bottom-[20%] right-[30%] w-2 h-2 rounded-full bg-emerald-200 blur-[1px]"
        style="animation-delay: 2.5s"></div>
      <div
        class="particle anim-p-3 absolute top-[15%] left-[60%] w-1.5 h-1.5 rounded-full bg-violet-200 blur-[1px]"
        style="animation-delay: 4s"></div>
    </div>

    <!-- Hero Section -->
    <main
      class="relative z-20 flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-32 pointer-events-none min-h-[90vh]">
      <div
        class="max-w-4xl mx-auto text-center pointer-events-auto mt-12 md:mt-24">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-white/60 border border-slate-200 backdrop-blur-sm shadow-sm float-subtle">
          <span class="flex h-2 w-2 relative">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span
            class="text-xs font-semibold tracking-wide text-slate-700 uppercase"
            >AI-Powered Billing</span
          >
        </div>

        <h1
          class="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] pb-8 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-800 to-slate-500">
          Invoicing that<br />feels weightless.
        </h1>

        <p
          class="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          Create, send, and track beautiful invoices in seconds. Let the AI
          handle the heavy lifting while you focus on your craft.
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink
            to="/dashboard"
            class="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
            Get Started Free
            <svg
              class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </NuxtLink>
          <button
            class="px-8 py-4 text-base font-semibold text-slate-600 hover:text-slate-900 transition-colors duration-300">
            View Live Demo
          </button>
        </div>
      </div>
    </main>

    <!-- How It Works Section -->
    <section
      class="relative z-20 py-24 px-6 md:px-12 bg-white/50 backdrop-blur-md border-y border-slate-200/50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2
            class="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            How it works
          </h2>
          <p class="text-slate-600 max-w-2xl mx-auto">
            Our automated flow takes the pain out of billing. See how simple it
            is to get paid faster.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 relative">
          <!-- Step 1 -->
          <div
            class="relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div
              class="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl mb-6">
              1
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">Create</h3>
            <p class="text-slate-600 text-sm leading-relaxed mb-6">
              Enter your client details and line items. Our AI auto-fills and
              suggests common items to speed up the process.
            </p>
            <div
              class="bg-slate-50 border border-slate-100 rounded-lg p-3 relative overflow-hidden">
              <div class="h-2 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div class="h-2 bg-slate-200 rounded w-full mb-1"></div>
              <div class="h-2 bg-slate-200 rounded w-5/6"></div>
              <div
                class="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent"></div>
            </div>
          </div>

          <!-- Step 2 -->
          <div
            class="relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div
              class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl mb-6">
              2
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">Send</h3>
            <p class="text-slate-600 text-sm leading-relaxed mb-6">
              Dispatch via email or generate a secure payment link instantly.
              Track when your client opens the invoice.
            </p>
            <div
              class="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center gap-3">
              <svg
                class="w-5 h-5 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <div class="text-xs font-medium text-emerald-700">
                Invoice #INV-2024 Sent
              </div>
            </div>
          </div>

          <!-- Step 3 -->
          <div
            class="relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div
              class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xl mb-6">
              3
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">Get Paid</h3>
            <p class="text-slate-600 text-sm leading-relaxed mb-6">
              Accept payments globally. Auto-reconciliation ensures your
              dashboard is always up to date without lifting a finger.
            </p>
            <div
              class="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
              <div class="text-lg font-bold text-amber-700">$2,400.00</div>
              <div
                class="text-[10px] text-amber-600 uppercase tracking-wide font-semibold mt-1">
                Payment Received
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Can Help Section -->
    <section class="relative z-20 py-24 px-6 md:px-12 bg-transparent">
      <div
        class="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div class="lg:w-1/2">
          <h2
            class="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6">
            Designed to help you
            <span class="text-indigo-600">grow faster.</span>
          </h2>
          <p class="text-slate-600 mb-8 leading-relaxed">
            Stop chasing emails and tracking spreadsheets. Arto centralizes your
            entire billing workflow so you never lose visibility on your revenue
            stream again.
          </p>

          <ul class="space-y-6">
            <li class="flex items-start gap-4">
              <div
                class="mt-1 w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <svg
                  class="w-4 h-4 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <h4 class="font-bold text-slate-900 mb-1">Zero Manual Entry</h4>
                <p class="text-sm text-slate-600">
                  Smart templates and recurring profiles mean you generate
                  invoices with a single click.
                </p>
              </div>
            </li>
            <li class="flex items-start gap-4">
              <div
                class="mt-1 w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <svg
                  class="w-4 h-4 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <h4 class="font-bold text-slate-900 mb-1">
                  Cash Flow Insights
                </h4>
                <p class="text-sm text-slate-600">
                  Beautiful dashboards that actually make sense of your
                  outstanding, paid, and overdue balances.
                </p>
              </div>
            </li>
            <li class="flex items-start gap-4">
              <div
                class="mt-1 w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <svg
                  class="w-4 h-4 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <h4 class="font-bold text-slate-900 mb-1">
                  Automated Reminders
                </h4>
                <p class="text-sm text-slate-600">
                  Gentle, AI-crafted nudges sent to clients before and after due
                  dates to ensure timely payments.
                </p>
              </div>
            </li>
          </ul>
        </div>
        <div
          class="lg:w-1/2 relative w-full aspect-square md:aspect-video lg:aspect-square bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
          <div class="text-slate-400 font-medium">Dashboard Preview</div>
          <!-- Mock up overlay graphic -->
          <div
            class="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 rotate-[-2deg]">
            <div class="h-4 w-1/3 bg-slate-100 rounded mb-4"></div>
            <div
              class="h-32 w-full bg-indigo-50 rounded-xl mb-4 border border-indigo-100/50"></div>
            <div class="flex gap-4">
              <div class="h-12 w-1/2 bg-slate-50 rounded-lg"></div>
              <div class="h-12 w-1/2 bg-slate-50 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section
      class="relative z-20 py-24 px-6 md:px-12 bg-white/50 backdrop-blur-md border-y border-slate-200/50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2
            class="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Transparent Pricing
          </h2>
          <p class="text-slate-600 max-w-2xl mx-auto">
            Choose the plan that fits your business needs. No hidden fees.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <!-- Basic Plan -->
          <div
            class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Basic</h3>
            <p class="text-sm text-slate-500 mb-6">
              For freelancers just starting out.
            </p>
            <div class="mb-6">
              <span class="text-4xl font-black text-slate-900">RM 29</span
              ><span class="text-slate-500 font-medium">/mo</span>
            </div>
            <ul class="space-y-4 mb-8 flex-1">
              <li class="flex items-center gap-2 text-sm text-slate-700">
                <svg
                  class="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
                Up to 10 invoices/mo
              </li>
              <li class="flex items-center gap-2 text-sm text-slate-700">
                <svg
                  class="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
                Basic templates
              </li>
              <li class="flex items-center gap-2 text-sm text-slate-700">
                <svg
                  class="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
                Standard support
              </li>
            </ul>
            <button
              class="w-full py-3 rounded-full border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              Start Basic
            </button>
          </div>

          <!-- Pro Plan -->
          <div
            class="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col relative transform md:-translate-y-4">
            <div
              class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
              Most Popular
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Pro</h3>
            <p class="text-sm text-slate-400 mb-6">
              For growing small businesses.
            </p>
            <div class="mb-6">
              <span class="text-4xl font-black text-white">RM 49</span
              ><span class="text-slate-400 font-medium">/mo</span>
            </div>
            <ul class="space-y-4 mb-8 flex-1">
              <li class="flex items-center gap-2 text-sm text-slate-300">
                <svg
                  class="w-4 h-4 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
                Unlimited invoices
              </li>
              <li class="flex items-center gap-2 text-sm text-slate-300">
                <svg
                  class="w-4 h-4 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
                Premium templates
              </li>
              <li class="flex items-center gap-2 text-sm text-slate-300">
                <svg
                  class="w-4 h-4 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
                Automated reminders
              </li>
              <li class="flex items-center gap-2 text-sm text-slate-300">
                <svg
                  class="w-4 h-4 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
                Priority support
              </li>
            </ul>
            <button
              class="w-full py-3 rounded-full bg-white font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
              Start Pro
            </button>
          </div>

          <!-- Full Plan -->
          <div
            class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Full</h3>
            <p class="text-sm text-slate-500 mb-6">
              For teams needing advanced tools.
            </p>
            <div class="mb-6">
              <span class="text-4xl font-black text-slate-900">RM 79</span
              ><span class="text-slate-500 font-medium">/mo</span>
            </div>
            <ul class="space-y-4 mb-8 flex-1">
              <li class="flex items-center gap-2 text-sm text-slate-700">
                <svg
                  class="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
                Everything in Pro
              </li>
              <li class="flex items-center gap-2 text-sm text-slate-700">
                <svg
                  class="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
                Multiple user seats (up to 5)
              </li>
              <li class="flex items-center gap-2 text-sm text-slate-700">
                <svg
                  class="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
                AI Data & Cashflow insights
              </li>
              <li class="flex items-center gap-2 text-sm text-slate-700">
                <svg
                  class="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
                Dedicated account manager
              </li>
            </ul>
            <button
              class="w-full py-3 rounded-full border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              Start Full
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="relative z-20 py-24 px-6 md:px-12 bg-transparent">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-16">
          <h2
            class="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div class="space-y-4">
          <div
            class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 class="text-lg font-bold text-slate-900 mb-2">
              Can I cancel my subscription at any time?
            </h4>
            <p class="text-slate-600">
              Yes! Arto is a month-to-month service. You can cancel, downgrade,
              or upgrade your plan at any time from your billing settings.
            </p>
          </div>
          <div
            class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 class="text-lg font-bold text-slate-900 mb-2">
              Does Arto support international currencies?
            </h4>
            <p class="text-slate-600">
              Absolutely. You can issue invoices in over 135 currencies.
              Exchange rates are handled seamlessly if you accept digital
              payments.
            </p>
          </div>
          <div
            class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 class="text-lg font-bold text-slate-900 mb-2">
              Is my data secure?
            </h4>
            <p class="text-slate-600">
              We take security seriously. All data is encrypted at rest and in
              transit using bank-level AES-256 encryption.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer
      class="relative z-20 bg-slate-900 pt-16 pb-8 px-6 md:px-12 text-slate-400 border-t border-slate-800">
      <div
        class="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div class="col-span-2 lg:col-span-1">
          <div
            class="flex items-center gap-2 text-2xl font-bold tracking-tighter text-white mb-4">
            <svg
              class="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <path
                d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
              <path d="M7 7h.01" />
            </svg>
            arto.
          </div>
          <p class="text-sm text-slate-500 mb-6">
            Invoicing that feels weightless. Designed for modern businesses.
          </p>
        </div>
        <div>
          <h4 class="text-slate-50 font-semibold mb-4">Product</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="#" class="hover:text-white transition-colors"
                >Features</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors">Pricing</a>
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors"
                >Integrations</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors"
                >Changelog</a
              >
            </li>
          </ul>
        </div>
        <div>
          <h4 class="text-slate-50 font-semibold mb-4">Resources</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="#" class="hover:text-white transition-colors"
                >Documentation</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors">Blog</a>
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors"
                >Templates</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors"
                >Help Center</a
              >
            </li>
          </ul>
        </div>
        <div>
          <h4 class="text-slate-50 font-semibold mb-4">Company</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="#" class="hover:text-white transition-colors">About</a>
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors">Careers</a>
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors">Legal</a>
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors">Contact</a>
            </li>
          </ul>
        </div>
      </div>
      <div
        class="max-w-6xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="text-sm">© 2024 Arto. All rights reserved.</div>
        <div class="flex gap-4">
          <a href="#" class="text-slate-500 hover:text-white transition-colors"
            ><svg
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                clip-rule="evenodd" /></svg
          ></a>
          <a href="#" class="text-slate-500 hover:text-white transition-colors"
            ><svg
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true">
              <path
                d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg
          ></a>
        </div>
      </div>
    </footer>

    <!-- Original Footer fade overlay is no longer needed at bottom, but keep wrapper -->
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
});
</script>

<style scoped>
.landing-bg {
  background-color: #f8fafc;
  background-image:
    radial-gradient(
      circle at 50% 0%,
      rgba(255, 255, 255, 0.8) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 50% 100%,
      rgba(241, 245, 249, 1) 0%,
      transparent 50%
    );
}

/* Animations Make Magic */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(var(--rotation, 0deg));
  }
  50% {
    transform: translateY(-20px) rotate(calc(var(--rotation, 0deg) + 2deg));
  }
}

@keyframes float-orb {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

@keyframes float-particle {
  0%,
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-30px) translateX(10px);
    opacity: 1;
  }
}

.float-slow {
  --rotation: -6deg;
  animation: float 8s ease-in-out infinite;
}

.float-medium {
  --rotation: 8deg;
  animation: float 6s ease-in-out infinite 1s;
}

.float-subtle {
  animation: float 4s ease-in-out infinite;
}

.orb-1 {
  animation: float-orb 15s ease-in-out infinite;
}
.orb-2 {
  animation: float-orb 18s ease-in-out infinite -5s;
}
.orb-3 {
  animation: float-orb 20s ease-in-out infinite -10s;
}

.anim-p-1 {
  animation: float-particle 10s ease-in-out infinite;
}
.anim-p-2 {
  animation: float-particle 12s ease-in-out infinite -3s;
}
.anim-p-3 {
  animation: float-particle 14s ease-in-out infinite -7s;
}
</style>
