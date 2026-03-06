<template>
  <div
    class="landing-bg min-h-screen w-full relative overflow-hidden font-sans text-white flex flex-col selection:bg-indigo-500/30">
    <!-- Navigation -->
    <nav
      class="relative z-50 px-6 py-6 md:px-12 flex items-center justify-between pointer-events-auto">
      <div class="flex items-center gap-2 text-2xl font-bold tracking-tighter">
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
      <div>
        <NuxtLink
          to="/login"
          class="text-sm font-medium hover:text-indigo-400 transition-colors mr-6"
          >Sign In</NuxtLink
        >
        <NuxtLink
          to="/dashboard"
          class="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">
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

    <!-- Animated Background Orbs -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        class="orb orb-1 absolute w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] -top-[10%] -right-[10%] mix-blend-screen"></div>
      <div
        class="orb orb-2 absolute w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px] bottom-[10%] -left-[10%] mix-blend-screen"></div>
      <div
        class="orb orb-3 absolute w-[400px] h-[400px] rounded-full bg-fuchsia-600/10 blur-[100px] top-[40%] left-[30%] mix-blend-screen"></div>
    </div>

    <!-- Floating UI Elements -->
    <div
      class="absolute inset-0 z-10 pointer-events-none flex justify-center items-center">
      <!-- Floating Card 1 -->
      <div
        class="float-slow absolute -left-12 md:left-24 top-1/4 w-64 h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl rotate-[-6deg] hidden sm:block">
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
          </div>
          <div>
            <div class="text-xs font-semibold text-white/80">Invoice Paid</div>
            <div class="text-[10px] text-white/50">Just now</div>
          </div>
        </div>
        <div class="text-2xl font-bold tracking-tight">$4,250.00</div>
      </div>

      <!-- Floating Card 2 -->
      <div
        class="float-medium absolute -right-8 md:right-32 bottom-1/3 w-48 h-48 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl rotate-[8deg] hidden lg:flex flex-col">
        <div class="text-xs font-semibold text-white/60 mb-4">
          Weekly Revenue
        </div>
        <div class="flex items-end gap-2 h-16 mt-auto">
          <div class="w-full bg-white/10 rounded-t-sm h-[40%]"></div>
          <div class="w-full bg-white/10 rounded-t-sm h-[60%]"></div>
          <div class="w-full bg-white/10 rounded-t-sm h-[30%]"></div>
          <div class="w-full bg-indigo-500/80 rounded-t-sm h-[90%] relative">
            <div
              class="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full blur-[1px]"></div>
          </div>
          <div class="w-full bg-white/10 rounded-t-sm h-[70%]"></div>
        </div>
      </div>

      <!-- Subtle particles -->
      <div
        class="particle p-1 absolute top-[20%] right-[25%] w-2 h-2 rounded-full bg-white/40 blur-[1px]"></div>
      <div
        class="particle p-2 absolute bottom-[30%] left-[40%] w-1.5 h-1.5 rounded-full bg-indigo-400/60 blur-[1px]"></div>
      <div
        class="particle p-3 absolute top-[60%] right-[15%] w-2.5 h-2.5 rounded-full bg-violet-400/50 blur-[2px]"></div>
    </div>

    <!-- Hero Content -->
    <main
      class="relative z-20 flex-1 flex items-center justify-center px-6 pointer-events-none">
      <div class="max-w-4xl mx-auto text-center pointer-events-auto">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl float-subtle">
          <span class="flex h-2 w-2 relative">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span
            class="text-xs font-semibold tracking-wide text-white/80 uppercase"
            >AI-Powered Billing</span
          >
        </div>

        <h1
          class="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/40">
          Invoicing that<br />feels weightless.
        </h1>

        <p
          class="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          Create, send, and track beautiful invoices in seconds. Let the AI
          handle the heavy lifting while you focus on your craft.
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink
            to="/dashboard"
            class="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-900 bg-white rounded-full hover:bg-slate-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
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
            class="px-8 py-4 text-base font-semibold text-white/80 hover:text-white transition-colors duration-300">
            View Live Demo
          </button>
        </div>
      </div>
    </main>

    <!-- Footer fade -->
    <div
      class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030305] to-transparent z-10 pointer-events-none"></div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
});
</script>

<style scoped>
.landing-bg {
  background-color: #030305;
  background-image:
    radial-gradient(
      circle at 50% 0%,
      rgba(79, 70, 229, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 50% 100%,
      rgba(139, 92, 246, 0.05) 0%,
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

.p-1 {
  animation: float-particle 10s ease-in-out infinite;
}
.p-2 {
  animation: float-particle 12s ease-in-out infinite -3s;
}
.p-3 {
  animation: float-particle 14s ease-in-out infinite -7s;
}
</style>
