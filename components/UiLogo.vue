<template>
  <div class="flex items-center gap-2" :class="containerClass">
    <div
      :class="[
        sizeClasses[size],
        'relative flex items-center justify-center shrink-0',
      ]">
      <!-- Logo Mark -->
      <img
        src="/InvoKitaLogo.png"
        alt="InvoKita Logo"
        class="w-full h-full object-contain" />
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
