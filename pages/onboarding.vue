<template>
  <div
    style="zoom: 0.9"
    class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center mb-6">
        <UiLogo size="lg" />
      </div>
      <h2
        class="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
        Welcome to InvoKita
      </h2>
      <p class="mt-2 text-center text-sm text-slate-600 max-w">
        Let's get your account set up so you can start creating invoices.
      </p>
    </div>

    <div
      class="mt-8 sm:mx-auto px-6 transition-all duration-500"
      :class="{ 'sm:max-w-lg w-full': step !== 4, '!w-fit': step === 4 }">
      <div
        class="bg-white py-8 px-4 shadow-sm shadow-slate-200/40 rounded-2xl sm:px-10 border border-slate-100 relative transition-all duration-500">
        <!-- Progress Bar -->
        <div class="mb-8">
          <div
            class="flex justify-between text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">
            <span>Step {{ step }} of 4</span>
            <span>{{
              step === 1
                ? "Role"
                : step === 2
                  ? "Discovery"
                  : step === 3
                    ? "Profile"
                    : "Plan Selection"
            }}</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div
              class="bg-emerald-500 h-1 rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${(step / 4) * 100}%` }"></div>
          </div>
        </div>

        <form @submit.prevent="step < 4 ? nextStep() : null" class="space-y-6">
          <!-- Step 1: Current Status -->
          <div
            v-show="step === 1"
            class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <label class="block text-sm font-semibold text-slate-900 mb-4">
              I am primarily a...
            </label>
            <div class="grid grid-cols-1 gap-4">
              <label
                v-for="status in [
                  'Freelancer / Solopreneur',
                  'Small Business Owner',
                  'Agency / Studio',
                  'Finance Team',
                  'Other',
                ]"
                :key="status"
                class="relative border rounded-xl p-4 flex cursor-pointer hover:border-slate-400 transition-all shadow-sm"
                :class="
                  form.currentStatus === status
                    ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50'
                    : 'border-slate-200 bg-white'
                ">
                <input
                  type="radio"
                  v-model="form.currentStatus"
                  :value="status"
                  class="sr-only" />
                <div class="flex-1">
                  <span class="block text-sm font-medium text-slate-900">{{
                    status
                  }}</span>
                </div>
                <div
                  class="flex items-center justify-center w-5 h-5 rounded-full transition-colors"
                  :class="
                    form.currentStatus === status ? ' bg-emerald-600' : ''
                  ">
                  <UiIcon
                    v-if="form.currentStatus === status"
                    icon="heroicons:check"
                    custom-class="w-3 h-3 text-white" />
                </div>
              </label>
            </div>
          </div>

          <!-- Step 2: Heard About -->
          <div
            v-show="step === 2"
            class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <label class="block text-sm font-semibold text-slate-900 mb-4">
              Where did you hear about InvoKita?
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                v-for="source in [
                  'Social Media',
                  'Google Search',
                  'Friend / Colleague',
                  'Advertisement',
                  'Blog / Article',
                  'Other',
                ]"
                :key="source"
                class="relative border rounded-xl p-3 flex items-center cursor-pointer hover:border-slate-400 transition-all text-sm font-medium shadow-sm"
                :class="
                  form.heardAbout === source
                    ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600'
                ">
                <input
                  type="radio"
                  v-model="form.heardAbout"
                  :value="source"
                  class="sr-only" />
                <div class="flex-1">
                  <span class="block text-sm font-medium text-slate-900">{{
                    source
                  }}</span>
                </div>
                <div
                  class="flex items-center justify-center w-5 h-5 rounded-full transition-colors"
                  :class="form.heardAbout === source ? ' bg-emerald-600' : ''">
                  <UiIcon
                    v-if="form.heardAbout === source"
                    icon="heroicons:check"
                    custom-class="w-3 h-3 text-white" />
                </div>
              </label>
            </div>
          </div>

          <!-- Step 3: Contact Info -->
          <div
            v-show="step === 3"
            class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <p class="text-[12px] text-slate-500 mb-2">
              The information below is required to generate an invoice.
            </p>
            <div>
              <label class="block text-sm font-semibold text-slate-900 mb-1"
                >Full Name</label
              >
              <input
                type="text"
                v-model="form.name"
                required
                placeholder="John Doe"
                class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-900 mb-1"
                >Company / Business Name</label
              >
              <input
                type="text"
                v-model="form.companyName"
                required
                placeholder="Acme Corp"
                class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-900 mb-1"
                >Billing Email</label
              >
              <input
                type="email"
                v-model="form.companyEmail"
                required
                placeholder="example@email.com"
                class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-900 mb-1"
                >WhatsApp / Phone Number</label
              >

              <input
                type="tel"
                v-model="form.phoneNumber"
                required
                placeholder="+60 12-345 6789"
                class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
            </div>
          </div>

          <!-- Step 4: Plan Selection -->
          <div
            v-show="step === 4"
            class="animate-in fade-in slide-in-from-right-4 duration-500">
            <div class="text-center mb-8">
              <h3 class="text-2xl font-black text-slate-900 tracking-tight">
                Select your starting plan
              </h3>
              <p class="text-sm text-slate-500 mt-2 font-medium">
                You can upgrade or downgrade at any time.
              </p>
            </div>

            <!-- Loading overlay during save -->
            <div
              v-if="loading"
              class="absolute inset-0 z-50 bg-white/80 backdrop-blur-[4px] rounded-2xl flex flex-col items-center justify-center">
              <div
                class="w-20 h-20 relative flex items-center justify-center mb-6">
                <UiLogo
                  size="lg"
                  :showText="false"
                  class="absolute z-10 right-5 animate-pulse" />
                <svg
                  class="absolute inset-0 w-full h-full text-emerald-500 animate-[spin_2s_linear_infinite]"
                  fill="none"
                  viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    stroke="currentColor"
                    stroke-width="2"
                    class="opacity-10" />
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

              <h3
                class="text-xs font-bold text-slate-800 tracking-[0.2em] uppercase mb-3">
                Setting up workspace...
              </h3>

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

            <div class="grid md:grid-cols-3 gap-4">
              <!-- Free Plan -->
              <div
                class="border border-slate-200 rounded-2xl p-6 transition-all hover:border-slate-300 bg-slate-50 flex flex-col">
                <div class="mb-8">
                  <h5 class="text-lg font-semibold text-slate-900 mb-2">
                    Free
                  </h5>
                  <p class="text-sm text-slate-500 font-medium">For starters</p>
                </div>
                <div class="mb-8 flex items-baseline">
                  <span
                    class="text-4xl font-semibold text-slate-900 tracking-tight"
                    >RM 0</span
                  >
                  <span class="text-slate-400 text-sm ml-1 font-medium"
                    >/month</span
                  >
                </div>
                <ul class="space-y-4 mb-8 flex-1">
                  <li
                    v-for="feature in [
                      '5 Invoices/mo',
                      '5 Email Deliveries/mo',
                    ]"
                    :key="feature"
                    class="flex items-center text-sm font-medium text-slate-600">
                    <UiIcon
                      icon="heroicons:check"
                      class="w-4 h-4 mr-3 text-slate-400" />
                    {{ feature }}
                  </li>
                  <li
                    v-for="limit in [
                      'No Reminders',
                      'No AI Drafts',
                      'No WhatsApp Features',
                      'No Auto-Chasers',
                    ]"
                    :key="limit"
                    class="flex items-center text-sm font-medium text-slate-400 line-through">
                    <UiIcon
                      icon="heroicons:x-mark"
                      class="w-4 h-4 mr-3 text-slate-300" />
                    {{ limit }}
                  </li>
                </ul>
                <button
                  type="button"
                  @click="selectPlan('FREE')"
                  class="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  Continue with Free
                </button>
              </div>

              <!-- Pro Plan -->
              <div
                class="border border-emerald-200 rounded-2xl p-6 transition-all hover:border-emerald-300 bg-emerald-50/50 flex flex-col relative">
                <div
                  class="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full">
                  Recommended
                </div>
                <div class="mb-8 mt-2">
                  <h5 class="text-lg font-semibold text-slate-900 mb-2">Pro</h5>
                  <p class="text-sm text-slate-500 font-medium">
                    Perfect for freelancers
                  </p>
                </div>
                <div class="mb-8 flex items-baseline">
                  <span
                    class="text-4xl font-semibold text-slate-900 tracking-tight"
                    >RM 59</span
                  >
                  <span class="text-slate-400 text-sm ml-1 font-medium"
                    >/month</span
                  >
                </div>
                <ul class="space-y-4 mb-8 flex-1">
                  <li
                    v-for="feature in [
                      '30 Invoices/mo',
                      '30 WhatsApp Sends & Reminders',
                      '50 Email Deliveries & Reminders',
                      '20 AI Drafts/mo',
                      'Auto-Chaser',
                    ]"
                    :key="feature"
                    class="flex items-center text-sm font-medium text-slate-600">
                    <UiIcon
                      icon="heroicons:check"
                      class="w-4 h-4 mr-3 text-emerald-600" />
                    {{ feature }}
                  </li>
                  <li
                    class="flex items-center text-sm font-medium text-slate-400 line-through">
                    <UiIcon
                      icon="heroicons:x-mark"
                      class="w-4 h-4 mr-3 text-slate-300" />
                    White Labelling
                  </li>
                </ul>
                <button
                  type="button"
                  @click="selectPlan('PRO')"
                  class="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700">
                  Select Pro
                </button>
              </div>

              <!-- Max Plan -->
              <div
                class="border border-indigo-100 rounded-2xl p-6 transition-all hover:border-indigo-200 bg-slate-50 flex flex-col">
                <div class="mb-8">
                  <h5 class="text-lg font-semibold text-slate-900 mb-2">Max</h5>
                  <p class="text-sm text-slate-500 font-medium">Power users</p>
                </div>
                <div class="mb-8 flex items-baseline">
                  <span
                    class="text-4xl font-semibold text-slate-900 tracking-tight"
                    >RM 99</span
                  >
                  <span class="text-slate-400 text-sm ml-1 font-medium"
                    >/month</span
                  >
                </div>
                <ul class="space-y-4 mb-8 flex-1">
                  <li
                    v-for="feature in [
                      '100 Invoices/mo',
                      '100 WhatsApp Sends & Reminders',
                      '100 Email Deliveries & Reminders',
                      '50 AI Drafts/mo',
                      'Auto-Chaser',
                      'White Labelling',
                    ]"
                    :key="feature"
                    class="flex items-center text-sm font-medium text-slate-600">
                    <UiIcon
                      icon="heroicons:check"
                      class="w-4 h-4 mr-3 text-indigo-500" />
                    {{ feature }}
                  </li>
                </ul>
                <button
                  type="button"
                  @click="selectPlan('MAX')"
                  class="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border bg-slate-900 text-white border-slate-900 hover:bg-slate-800">
                  Select Max
                </button>
              </div>
            </div>
          </div>

          <!-- Error Alert -->
          <div
            v-if="error"
            class="bg-rose-50 border border-rose-100 rounded-xl p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <UiIcon
                  icon="tabler:exclamation-circle"
                  custom-class="h-5 w-5" />
              </div>
              <div class="pl-3">
                <h3 class="text-sm font-medium text-rose-800">{{ error }}</h3>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons (Only Steps 1-3) -->
          <div
            v-show="step < 4"
            class="flex gap-4 pt-4 border-t border-slate-100">
            <button
              v-if="step > 1"
              type="button"
              @click="step--"
              class="w-1/3 flex justify-center py-3 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors">
              Back
            </button>
            <button
              type="button"
              @click="nextStep"
              class="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none transition-colors">
              Continue
              <svg
                class="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/stores/authStore";
import { useSubscribeStore } from "~/stores/subscribeStore";

definePageMeta({
  layout: "blank", // Using blank layout to hide sidebar
});

const router = useRouter();
const authStore = useAuthStore();
const subscribeStore = useSubscribeStore();

const step = ref(1);
const loading = ref(false);
const error = ref("");

const form = reactive({
  currentStatus: "",
  heardAbout: "",
  name: "",
  companyName: "",
  companyEmail: "",
  phoneNumber: "",
});

// Autofill fields explicitly on mount
onMounted(() => {
  if (authStore.user) {
    if (authStore.user.name) form.name = authStore.user.name;
    if (authStore.user.email) form.companyEmail = authStore.user.email;
    if (authStore.user.companyName)
      form.companyName = authStore.user.companyName;
    if (authStore.user.phoneNumber)
      form.phoneNumber = authStore.user.phoneNumber;
  }
});

const nextStep = () => {
  error.value = "";
  if (step.value === 1 && !form.currentStatus) {
    error.value = "Please select your current role.";
    return;
  }
  if (step.value === 2 && !form.heardAbout) {
    error.value = "Please select where you heard about us.";
    return;
  }
  if (step.value === 3) {
    if (
      !form.name ||
      !form.companyName ||
      !form.companyEmail ||
      !form.phoneNumber
    ) {
      error.value = "Please fill out all contact fields to continue.";
      return;
    }
  }

  if (step.value < 4) {
    step.value++;
  }
};

const selectPlan = async (plan) => {
  error.value = "";
  loading.value = true;

  try {
    // 1. Update Profile & complete onboarding flag
    await authStore.updateProfile({
      ...form,
      onboardingCompleted: true,
    });

    // 2. Validate and subscribe
    if (plan === "FREE") {
      router.push("/dashboard");
    } else {
      // PRO or MAX
      const res = await subscribeStore.subscribe(plan);
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        // Fallback incase of unexpected response
        router.push("/dashboard");
      }
    }
  } catch (err) {
    error.value = err.message || "Failed to complete setup.";
    loading.value = false;
  }
};
</script>
