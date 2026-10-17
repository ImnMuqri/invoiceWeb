<template>
  <!-- surface="light": the content below is still hardcoded Tailwind slate, so
       it needs the fixed-white shell rather than the themed one. -->
  <UiModal
    v-model="uiStore.isWelcomeModalOpen"
    maxWidth="lg"
    surface="light"
    :showClose="true">
    <div class="relative overflow-hidden min-h-[500px] flex flex-col">
      <!-- Decorative Background Orbs -->
      <div
        class="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div
        class="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

      <!-- Step Content Area -->
      <div class="p-8 relative flex-1 flex flex-col justify-center">
        <Transition name="fade-slide" mode="out-in">
          <!-- Step 1: Welcome -->
          <div v-if="currentStep === 1" key="step1" class="text-center">
            <div class="flex justify-center mb-8">
              <UiLogo size="lg" />
            </div>
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome to the Family!
            </h2>
            <p
              class="text-sm text-slate-500 mt-4 leading-relaxed max-w-sm mx-auto font-medium">
              We're thrilled to have you here. InvoKita is designed to make your
              invoicing seamless and professional. Let's take a quick look
              around.
            </p>
          </div>

          <!-- Step 2: Invoices -->
          <div v-else-if="currentStep === 2" key="step2" class="space-y-6">
            <div class="flex flex-col items-center text-center">
              <div
                class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100/50 shadow-sm">
                <UiIcon icon="heroicons:document-text" custom-class="w-8 h-8" />
              </div>
              <h3 class="text-xl font-bold text-slate-900">
                Effortless Invoicing
              </h3>
              <p
                class="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
                Create professional invoices in seconds. Customize terms, add
                items, and send them directly to your clients via Email or
                WhatsApp.
              </p>
            </div>
          </div>

          <!-- Step 3: Clients -->
          <div v-else-if="currentStep === 3" key="step3" class="space-y-6">
            <div class="flex flex-col items-center text-center">
              <div
                class="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 border border-amber-100/50 shadow-sm">
                <UiIcon icon="heroicons:user-group" custom-class="w-8 h-8" />
              </div>
              <h3 class="text-xl font-bold text-slate-900">
                Relationship Manager
              </h3>
              <p
                class="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
                Keep all your client details in one place. Track their payment
                history, manage multiple contact points, and view their lifetime
                value.
              </p>
            </div>
          </div>

          <!-- Step 4: Payments -->
          <div v-else-if="currentStep === 4" key="step4" class="space-y-6">
            <div class="flex flex-col items-center text-center">
              <div
                class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100/50 shadow-sm">
                <UiIcon icon="heroicons:bolt" custom-class="w-8 h-8" />
              </div>
              <h3 class="text-xl font-bold text-slate-900">
                Automation Mastery
              </h3>
              <p
                class="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
                Connect payment gateways to get paid 3x faster. Enable "AI
                Chaser" to automatically follow up on late payments while you
                sleep.
              </p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Footer / Controls -->
      <div class="p-8 pt-0 relative z-10 flex flex-col gap-4">
        <!-- Progress Dots -->
        <div class="flex justify-center gap-2 mb-2">
          <div
            v-for="i in 4"
            :key="i"
            class="h-1.5 rounded-full transition-all duration-300"
            :class="
              i === currentStep ? 'w-8 bg-slate-900' : 'w-1.5 bg-slate-200'
            "></div>
        </div>

        <div class="flex gap-3">
          <button
            v-if="currentStep > 1"
            @click="currentStep--"
            class="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold text-[12px] rounded-md hover:bg-slate-50 transition-all">
            Back
          </button>

          <button
            v-if="currentStep < 4"
            @click="currentStep++"
            class="flex-[2] py-3.5 bg-slate-900 text-white font-bold text-[12px] rounded-md hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
            Next
          </button>

          <button
            v-else
            @click="close"
            class="flex-[2] py-3.5 bg-emerald-600 text-white font-bold text-[12px] rounded-md hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10">
            Let's Go!
          </button>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<script setup>
import { ref, watch } from "vue";
import { useUiStore } from "@/stores/uiStore";

const uiStore = useUiStore();
const currentStep = ref(1);

// Reset step when modal is opened
watch(
  () => uiStore.isWelcomeModalOpen,
  (isOpen) => {
    if (isOpen) {
      currentStep.value = 1;
    }
  },
);

const close = () => {
  uiStore.toggleWelcomeModal(false);
};
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
