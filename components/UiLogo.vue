<template>
  <div class="flex items-center gap-2" :class="containerClass">
    <div
      :class="[
        sizeClasses[size],
        'relative flex items-center justify-center shrink-0',
      ]">
      <!-- Logo Mark -->
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="w-full h-full">
        <!-- Background Leaf/Paper Shape -->
        <path
          d="M7 3C4.23858 3 2 5.23858 2 8V18C2 19.1046 2.89543 20 4 20H14C15.1046 20 16 19.1046 16 18V10L11 3H7Z"
          fill="currentColor"
          class="text-slate-900" />
        <!-- Accent Dot (The "Mate" or Spark) -->
        <circle
          cx="18"
          cy="7"
          r="4"
          fill="currentColor"
          class="text-emerald-600" />
        <!-- Inner Line (Invoicing feel) -->
        <path
          d="M6 10H10M6 14H12"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round" />
      </svg>
    </div>
    <span
      v-if="showText"
      :class="textClasses[size]"
      class="font-bold tracking-tighter text-slate-900 normal-case">
      InvoKita<span class="text-emerald-600">.</span>
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    default: "md", // sm, md, lg, xl
  },
  showText: {
    type: Boolean,
    default: true,
  },
  containerClass: {
    type: String,
    default: "",
  },
});

const sizeClasses = {
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-9 h-9",
  xl: "w-12 h-12",
};

const textClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};
</script>
