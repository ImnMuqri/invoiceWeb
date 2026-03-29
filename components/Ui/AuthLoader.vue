<template>
  <div
    class="fixed inset-0 bg-slate-50 z-[9999] flex flex-col items-center justify-center transition-all duration-300">
    <div class="relative flex flex-col items-center">
      <!-- Animated Spinner Logo Wrapper -->
      <div class="w-20 h-20 relative flex items-center justify-center mb-6">
        <UiLogo
          size="lg"
          :showText="false"
          class="absolute z-10 right-5 animate-pulse" />
        <svg
          class="absolute inset-0 w-full h-full text-emerald-500 animate-[spin_2s_linear_infinite]"
          fill="none"
          viewBox="0 0 100 100">
          <!-- Background track -->
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="currentColor"
            stroke-width="2"
            class="opacity-10" />
          <!-- Animated dash -->
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="currentColor"
            stroke-width="3"
            stroke-dasharray="80 200"
            stroke-linecap="round" />
        </svg>
      </div>

      <!-- Loading Text -->
      <h3
        class="text-xs font-bold text-slate-800 tracking-[0.2em] uppercase mb-3">
        Loading...
      </h3>

      <!-- Bouncing Dots -->
      <div class="flex gap-1.5">
        <div
          class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
          style="animation-delay: 0ms"></div>
        <div
          class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
          style="animation-delay: 150ms"></div>
        <div
          class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
          style="animation-delay: 300ms"></div>
      </div>
    </div>
  </div>
</template>
