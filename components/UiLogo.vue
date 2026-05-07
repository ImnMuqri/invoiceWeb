<template>
  <div class="flex items-center gap-2" :class="containerClass">
    <div
      v-if="finalSrc"
      :class="[
        sizeClasses[size],
        'relative flex items-center justify-center shrink-0',
      ]">
      <!-- Logo Mark -->
      <img
        :src="finalSrc"
        alt="Logo"
        class="w-full h-full object-contain" />
    </div>
    <span
      v-if="showText && !isCustomLogo"
      :class="[
        textClasses[size],
        theme === 'dark' ? 'text-slate-900' : 'text-white',
      ]"
      class="font-bold tracking-tighter normal-case">
      InvoKita<span class="text-emerald-600">.</span>
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "~/stores/authStore";

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
  theme: {
    type: String,
    default: "dark", // dark, light
  },
  src: {
    type: String,
    default: null,
  },
  userLogo: {
    type: Boolean,
    default: false,
  },
});

const authStore = useAuthStore();
const config = useRuntimeConfig();

const isCustomLogo = computed(() => {
  return props.src || (props.userLogo && authStore.user?.profile?.logoUrl);
});

const finalSrc = computed(() => {
  if (props.src) return props.src;
  if (props.userLogo && authStore.user?.profile?.logoUrl) {
    const url = authStore.user.profile.logoUrl;
    if (url.startsWith("http")) return url;
    return `${config.public.apiBase}${url}`;
  }
  return "/InvoKitaLogo.png";
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
