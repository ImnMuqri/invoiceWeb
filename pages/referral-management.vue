<template>
  <div class="referral-management-page w-full mx-auto font-sans pb-8 px-4">
    <div class="flex flex-col gap-8">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/dashboard"
          class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <UiIcon icon="heroicons:arrow-left" class="w-5 h-5 text-slate-600" />
        </NuxtLink>
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
            Referral Management
          </h2>
          <p class="text-xs font-medium text-slate-500 mt-1">
            Manage your referrals and claim rewards.
          </p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm">
          <dt
            class="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
            Available Credits
          </dt>
          <dd class="text-3xl font-semibold text-indigo-950">
            {{ referralStore.stats.referralCredits || 0 }}
          </dd>
        </div>
        <div
          class="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm">
          <dt
            class="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
            Total Referrals
          </dt>
          <dd class="text-3xl font-semibold text-emerald-950">
            {{ referralStore.stats.totalReferrals || 0 }}
          </dd>
        </div>
        <div
          class="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <dt
              class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
              Your Referral Code
            </dt>
            <dd class="text-xl font-mono font-bold text-slate-900">
              {{ referralStore.stats.referralCode || "..." }}
            </dd>
          </div>
          <button
            @click="copyCode"
            class="mt-4 text-xs font-bold text-slate-900 flex items-center gap-1 hover:text-indigo-600 transition-colors">
            <UiIcon icon="heroicons:document-duplicate" class="w-3.5 h-3.5" />
            COPY CODE
          </button>
        </div>
      </div>

      <!-- Rewards Section -->
      <div
        class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div class="p-6 border-b border-slate-100">
          <h3 class="text-lg font-bold text-slate-900">Claim Rewards</h3>
          <p class="text-sm text-slate-500 mt-1 font-medium">
            Use your credits to upgrade your plan for free.
          </p>
        </div>
        <div class="divide-y divide-slate-100">
          <!-- Pro Plan Reward -->
          <div
            class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
            <div class="flex items-start gap-4">
              <div class="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <UiIcon icon="heroicons:sparkles" class="w-6 h-6" />
              </div>
              <div>
                <h4 class="text-base font-bold text-slate-900">
                  1 Month Free of PRO Plan
                </h4>
                <p class="text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">
                  Unlock advanced multi-currency tracking, AI insights, and
                  increased WhatsApp limits.
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4 shrink-0">
              <div class="text-right">
                <p
                  class="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  COST
                </p>
                <p class="text-lg font-semibold text-slate-900">5 Credits</p>
              </div>
              <button
                @click="claim('PRO')"
                :disabled="referralStore.stats.referralCredits < 5 || loading"
                class="px-6 py-2.5 rounded-xl font-bold transition-all"
                :class="
                  referralStore.stats.referralCredits < 5
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                ">
                {{ loading && rewardType === "PRO" ? "Claiming..." : "Claim" }}
              </button>
            </div>
          </div>

          <!-- Max Plan Reward -->
          <div
            class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
            <div class="flex items-start gap-4">
              <div class="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <UiIcon icon="heroicons:fire" class="w-6 h-6" />
              </div>
              <div>
                <h4 class="text-base font-bold text-slate-900">
                  1 Month Free of MAX Plan
                </h4>
                <p class="text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">
                  Full access to all premium features with maximum usage limits
                  for power users.
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4 shrink-0">
              <div class="text-right">
                <p
                  class="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  COST
                </p>
                <p class="text-lg font-semibold text-slate-900">10 Credits</p>
              </div>
              <button
                @click="claim('MAX')"
                :disabled="referralStore.stats.referralCredits < 10 || loading"
                class="px-6 py-2.5 rounded-xl font-bold transition-all"
                :class="
                  referralStore.stats.referralCredits < 10
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                ">
                {{ loading && rewardType === "MAX" ? "Claiming..." : "Claim" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <UiToast v-model="toast" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useReferralStore } from "~/stores/referralStore";

const referralStore = useReferralStore();
const toast = ref({ message: "", type: "success" });
const loading = ref(false);
const rewardType = ref("");

const fetchStats = async () => {
  try {
    await referralStore.fetchStats();
  } catch (err) {
    toast.value = {
      message: err.message || "Failed to load stats",
      type: "error",
    };
  }
};

const copyCode = () => {
  if (referralStore.stats.referralCode) {
    navigator.clipboard.writeText(referralStore.stats.referralCode);
    toast.value = { message: "Referral code copied!", type: "success" };
  }
};

const claim = async (type) => {
  loading.value = true;
  rewardType.value = type;
  try {
    await referralStore.claimReward(type);
    toast.value = {
      message: `Successfully claimed 1 month of ${type}!`,
      type: "success",
    };
  } catch (err) {
    toast.value = {
      message: err.message || "Failed to claim reward",
      type: "error",
    };
  } finally {
    loading.value = false;
    rewardType.value = "";
  }
};

onMounted(() => {
  fetchStats();
});

definePageMeta({
  layout: "default",
});
</script>
