<template>
  <div
    class="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Back Button -->
    <div class="absolute top-6 left-6 z-20">
      <NuxtLink
        to="/"
        class="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group">
        <svg
          class="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back home
      </NuxtLink>
    </div>

    <!-- Animated Background Orbs -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        class="orb orb-1 absolute w-[600px] h-[600px] rounded-full bg-slate-200/60 blur-[120px] -top-[10%] -right-[10%]"></div>
      <div
        class="orb orb-2 absolute w-[500px] h-[500px] rounded-full bg-indigo-100/50 blur-[120px] bottom-[10%] -left-[10%]"></div>
      <div
        class="orb orb-3 absolute w-[400px] h-[400px] rounded-full bg-slate-100/80 blur-[100px] top-[40%] left-[30%]"></div>
    </div>

    <div class="relative z-10 w-full max-w-md mx-auto">
      <NuxtLink
        to="/"
        class="flex justify-center items-center gap-2 text-2xl font-bold tracking-tighter text-slate-900 mb-8 hover:opacity-80 transition-opacity">
        <svg
          class="w-8 h-8"
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
        InvoMate.
      </NuxtLink>
    </div>

    <div class="relative z-10 w-full sm:mx-auto sm:max-w-md">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.orb {
  animation: float-orb 20s infinite ease-in-out alternate;
}
.orb-1 {
  animation-delay: 0s;
}
.orb-2 {
  animation-delay: -5s;
  animation-duration: 25s;
}
.orb-3 {
  animation-delay: -10s;
  animation-duration: 30s;
}

@keyframes float-orb {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(5%, 5%) scale(1.05);
  }
  100% {
    transform: translate(-5%, -5%) scale(0.95);
  }
}
</style>
