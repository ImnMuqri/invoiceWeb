<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useAuthStore } from "~/stores/authStore";

const authStore = useAuthStore();

// Inter is now self-hosted (see assets/css/main.css). The previous Google
// Fonts <link> was a render-blocking request to a third-party origin on every
// page — two DNS/TLS round trips before first paint. Removing it is the single
// largest LCP win available here.
</script>
