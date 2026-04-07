<template>
  <div>
    <!-- Maintenance Overlay -->
    <div
      v-if="systemStore.config.maintenanceMode && !authStore.isAdmin"
      class="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <!-- Animated Background Elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] animate-pulse-slow"></div>
      </div>

      <div class="relative z-10 max-w-md w-full">
        <UiLogo size="lg" :showText="true" containerClass="flex-col mb-12 brightness-0 invert" />
        
        <div class="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div class="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <UiIcon icon="heroicons:wrench-screwdriver" class="w-8 h-8 text-emerald-400" />
          </div>
          
          <h1 class="text-2xl font-bold text-white mb-3 tracking-tight">Scheduled Maintenance</h1>
          <p class="text-slate-400 text-sm leading-relaxed mb-8">
            We're currently performing some essential updates to improve your invoicing experience. 
            We'll be back online shortly. Thank you for your patience!
          </p>
          
          <div class="pt-6 border-t border-white/5 flex flex-col items-center gap-4">
            <div class="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <div class="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">System Status: Updating</span>
            </div>
          </div>
        </div>
        
        <p class="mt-12 text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
          Engineered for excellence
        </p>
      </div>
    </div>

    <!-- Main App Content -->
    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "~/stores/authStore";

const authStore = useAuthStore();
const systemStore = useSystemStore();

onMounted(() => {
  // authStore state is now computed from cookies, no init needed
  systemStore.fetchSystemConfig();
});

useHead({
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    },
  ],
});
</script>
