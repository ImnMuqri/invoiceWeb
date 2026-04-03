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
      :class="{ 'sm:max-w-xl w-full': step !== 4, '!w-fit': step === 4 }">
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
            class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <!-- User Details Section -->
            <div class="space-y-4">
              <h3
                class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                User Details
              </h3>
              <div>
                <label
                  class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
                  >Full Name</label
                >
                <input
                  type="text"
                  v-model="form.name"
                  required
                  placeholder="John Doe"
                  class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
                    >Login Email</label
                  >
                  <input
                    type="email"
                    :value="authStore.user?.email"
                    disabled
                    class="block w-full rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed outline-none" />
                </div>
                <div>
                  <label
                    class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
                    >Phone Number</label
                  >
                  <input
                    type="tel"
                    v-model="form.phoneNumber"
                    required
                    placeholder="+60 12-345 6789"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
                </div>
              </div>
            </div>

            <!-- Company Details Section -->
            <div class="space-y-4 pt-2">
              <div class="space-y-1 pb-2 border-b border-slate-100">
                <h3 class="text-sm font-bold text-slate-900">
                  Company Details
                </h3>
                <div class="text-[11px] text-slate-500">
                  This details will be displayed on your invoices.
                </div>
              </div>
              <div>
                <label
                  class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
                  >Company / Business Name</label
                >
                <input
                  type="text"
                  v-model="form.companyName"
                  required
                  placeholder="Acme Corp"
                  class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
                    >Company Email</label
                  >
                  <input
                    type="email"
                    v-model="form.companyEmail"
                    required
                    placeholder="billing@acme.com"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
                  <label
                    class="flex items-center gap-2 mt-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      v-model="useUserEmail"
                      @change="syncEmail"
                      class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 w-3.5 h-3.5" />
                    <span
                      class="text-[11px] font-medium text-slate-500 group-hover:text-slate-700 transition-colors"
                      >Use same as user's</span
                    >
                  </label>
                </div>
                <div>
                  <label
                    class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
                    >Company Phone</label
                  >
                  <input
                    type="tel"
                    v-model="form.companyPhone"
                    required
                    placeholder="+60 12-345 6789"
                    class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
                  <label
                    class="flex items-center gap-2 mt-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      v-model="useUserPhone"
                      @change="syncPhone"
                      class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 w-3.5 h-3.5" />
                    <span
                      class="text-[11px] font-medium text-slate-500 group-hover:text-slate-700 transition-colors"
                      >Use same as user's</span
                    >
                  </label>
                </div>
              </div>
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

            <!-- Promo Code Section -->
            <div class="max-w-md mx-auto mb-8">
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <input
                    v-model="promoCodeInput"
                    type="text"
                    placeholder="Promo code (Optional)"
                    class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900 uppercase"
                    :disabled="isPromoValid" />
                  <div
                    v-if="promoLoading"
                    class="absolute right-3 top-1/2 -translate-y-1/2">
                    <UiIcon
                      icon="heroicons:arrow-path"
                      class="w-4 h-4 animate-spin text-slate-400" />
                  </div>
                </div>
                <button
                  v-if="!isPromoValid"
                  type="button"
                  @click="validatePromo"
                  :disabled="!promoCodeInput || promoLoading"
                  class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all disabled:opacity-50">
                  Apply
                </button>
                <button
                  v-else
                  type="button"
                  @click="clearPromo"
                  class="px-4 py-2 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl hover:bg-rose-100 transition-all">
                  Clear
                </button>
              </div>
              <p
                v-if="promoError"
                class="text-[10px] font-bold text-rose-500 mt-1 ml-1">
                {{ promoError }}
              </p>
              <p
                v-if="isPromoValid"
                class="text-[10px] font-bold text-emerald-600 mt-1 ml-1">
                Applied: {{ appliedDiscountText }} off!
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
              <!-- Dynamic Plans -->
              <div
                v-for="plan in dynamicPlans"
                :key="plan.id"
                :class="[
                  'border rounded-2xl p-6 transition-all flex flex-col relative',
                  plan.name === 'PRO'
                    ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300'
                    : plan.name === 'MAX'
                      ? 'border-indigo-100 bg-indigo-50/10 hover:border-indigo-200'
                      : 'border-slate-100 bg-white hover:border-slate-200',
                ]">
                <div
                  v-if="plan.name === 'PRO'"
                  class="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full">
                  Recommended
                </div>
                <div class="mb-8 mt-2">
                  <h5
                    class="text-lg font-semibold text-slate-900 mb-2 uppercase tracking-tight">
                    {{ plan.name }}
                  </h5>
                  <p class="text-sm text-slate-500 font-medium">
                    {{ plan.description }}
                  </p>
                </div>
                <div class="mb-8 flex items-baseline">
                  <span
                    class="text-4xl font-semibold text-slate-900 tracking-tight">
                    {{ plan.currency }} {{ plan.price }}
                  </span>
                  <span class="text-slate-400 text-sm ml-1 font-medium"
                    >/{{ plan.interval }}</span
                  >
                </div>
                <ul class="space-y-4 mb-8 flex-1 text-left">
                  <li
                    v-for="feature in plan.features"
                    :key="feature"
                    class="flex items-center text-sm font-medium text-slate-600">
                    <UiIcon
                      icon="heroicons:check"
                      :class="[
                        'w-4 h-4 mr-3 shrink-0',
                        plan.name === 'PRO'
                          ? 'text-emerald-600'
                          : plan.name === 'MAX'
                            ? 'text-indigo-500'
                            : 'text-slate-400',
                      ]" />
                    {{ feature }}
                  </li>
                </ul>
                <button
                  type="button"
                  @click="selectPlan(plan.name)"
                  :class="[
                    'w-full py-2.5 rounded-xl text-sm font-semibold transition-all border outline-none cursor-pointer',
                    plan.name === 'PRO'
                      ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                      : plan.name === 'MAX'
                        ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100',
                  ]">
                  {{
                    plan.name === "FREE"
                      ? "Continue with Free"
                      : `Select ${plan.name}`
                  }}
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
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/stores/authStore";
import { useSubscribeStore } from "~/stores/subscribeStore";

definePageMeta({
  layout: "blank", // Using blank layout to hide sidebar
});

const router = useRouter();
const authStore = useAuthStore();
const subscribeStore = useSubscribeStore();

const promoCodeInput = ref("");
const isPromoValid = ref(false);
const promoLoading = ref(false);
const promoError = ref("");
const appliedDiscount = ref(null);

const step = ref(1);
const loading = ref(false);
const error = ref("");
const dynamicPlans = ref([]);

const fetchPlans = async () => {
  const { $api } = useNuxtApp();
  try {
    const { data } = await $api.get("/plans");
    dynamicPlans.value = data;
  } catch (err) {
    console.error("Failed to fetch plans", err);
  }
};

onMounted(() => {
  fetchPlans();
});

const form = reactive({
  currentStatus: "",
  heardAbout: "",
  name: "",
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  phoneNumber: "",
});

const useUserEmail = ref(false);
const useUserPhone = ref(false);

const syncEmail = () => {
  if (useUserEmail.value) {
    form.companyEmail = authStore.user?.email || "";
  } else {
    form.companyEmail = "";
  }
};

const syncPhone = () => {
  if (useUserPhone.value) {
    form.companyPhone = form.phoneNumber || "";
  } else {
    form.companyPhone = "";
  }
};

// Autofill fields explicitly on mount
onMounted(() => {
  if (authStore.user) {
    if (authStore.user.name) form.name = authStore.user.name;
    if (authStore.user.email) form.companyEmail = authStore.user.email;
    if (authStore.user.companyName)
      form.companyName = authStore.user.companyName;
    if (authStore.user.companyPhone)
      form.companyPhone = authStore.user.companyPhone;
    if (authStore.user.phoneNumber)
      form.phoneNumber = authStore.user.phoneNumber;
  }
});

const validatePromo = async () => {
  if (!promoCodeInput.value) return;
  promoLoading.value = true;
  promoError.value = "";
  try {
    const { $api } = useNuxtApp();
    const { data } = await $api.post("/promo/validate", {
      code: promoCodeInput.value,
    });
    appliedDiscount.value = data;
    isPromoValid.value = true;
  } catch (err) {
    promoError.value = err.response?.data?.message || "Invalid promo code";
    isPromoValid.value = false;
  } finally {
    promoLoading.value = false;
  }
};

const clearPromo = () => {
  promoCodeInput.value = "";
  isPromoValid.value = false;
  appliedDiscount.value = null;
  promoError.value = "";
};

const appliedDiscountText = computed(() => {
  if (!appliedDiscount.value) return "";
  const d = appliedDiscount.value;
  return d.discountType === "PERCENTAGE"
    ? `${d.discountValue}%`
    : `${d.discountValue} MYR`;
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
      !form.companyPhone ||
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
      const res = await subscribeStore.subscribe(
        plan,
        isPromoValid.value ? promoCodeInput.value : null,
      );
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
