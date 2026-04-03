<template>
  <UiModal
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    maxWidth="2xl">
    <div class="p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h3 class="text-xl font-bold text-slate-900 tracking-tight">
            {{ isEdit ? "Edit Plan" : "Create New Plan" }}
          </h3>
          <p class="text-xs text-slate-500 font-medium mt-1">
            {{
              isEdit
                ? "Modify existing plan details and limits."
                : "Define a new subscription tier for your users."
            }}
          </p>
        </div>
        <button
          @click="$emit('update:modelValue', false)"
          class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <UiIcon icon="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="save" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Basic Info -->
          <div class="space-y-4">
            <h4
              class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              Basic Information
            </h4>
            <div>
              <label
                class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                >Plan Name</label
              >
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. PRO, ENTERPRISE"
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900 transition-all font-medium uppercase"
                required />
            </div>
            <div>
              <label
                class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                >Description</label
              >
              <textarea
                v-model="form.description"
                placeholder="Briefly describe who this plan is for..."
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900 transition-all font-medium min-h-[100px]"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                  >Price</label
                >
                <div class="relative">
                  <span
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold"
                    >{{ form.currency }}</span
                  >
                  <input
                    v-model.number="form.price"
                    type="number"
                    step="0.01"
                    class="w-full pl-14 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900 transition-all font-bold"
                    required />
                </div>
              </div>
              <div>
                <label
                  class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                  >Interval</label
                >
                <select
                  v-model="form.interval"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900 transition-all font-bold">
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Limits -->
          <div class="space-y-4">
            <h4
              class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              Usage Limits
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                  >Invoices</label
                >
                <input
                  v-model.number="form.invoices"
                  type="number"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
              </div>
              <div>
                <label
                  class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                  >AI Credits</label
                >
                <input
                  v-model.number="form.aiCredits"
                  type="number"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
              </div>
              <div>
                <label
                  class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                  >WA Sends</label
                >
                <input
                  v-model.number="form.waSends"
                  type="number"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
              </div>
              <div>
                <label
                  class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                  >WA Reminders</label
                >
                <input
                  v-model.number="form.waReminders"
                  type="number"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
              </div>
              <div>
                <label
                  class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                  >Email Sends</label
                >
                <input
                  v-model.number="form.emailSends"
                  type="number"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
              </div>
              <div>
                <label
                  class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2"
                  >Email Reminders</label
                >
                <input
                  v-model.number="form.emailReminders"
                  type="number"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
              </div>
            </div>
            <p
              class="text-[10px] text-slate-400 font-medium italic mt-2 text-center">
              Use 999999 for unlimited.
            </p>
          </div>
        </div>

        <!-- Features List -->
        <div class="pt-6 border-t border-slate-100">
          <h4
            class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
            Marketing Features (shown on cards)
          </h4>
          <div class="space-y-3">
            <div
              v-for="(feature, index) in form.features"
              :key="index"
              class="flex gap-2">
              <input
                v-model="form.features[index]"
                type="text"
                placeholder="e.g. White Labelling"
                class="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium" />
              <button
                type="button"
                @click="removeFeature(index)"
                class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                <UiIcon icon="heroicons:trash" class="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              @click="addFeature"
              class="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-all">
              + Add Feature Line
            </button>
          </div>
        </div>

        <!-- Meta -->
        <div class="flex items-center gap-6 pt-6">
          <label class="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              v-model="form.isPublic"
              class="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
            <span
              class="text-sm font-bold text-slate-600 group-hover:text-slate-900"
              >Show on Landing/Onboarding</span
            >
          </label>
        </div>

        <div class="pt-8 flex gap-3">
          <button
            type="button"
            @click="$emit('update:modelValue', false)"
            class="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-[2] py-3 px-4 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
            {{ loading ? "Saving..." : isEdit ? "Update Plan" : "Create Plan" }}
          </button>
        </div>
      </form>
    </div>
  </UiModal>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: Boolean,
  plan: Object,
  loading: Boolean,
});

const emit = defineEmits(["update:modelValue", "save"]);

const isEdit = ref(false);
const form = ref({
  name: "",
  description: "",
  price: 0,
  currency: "MYR",
  interval: "month",
  waSends: 0,
  emailSends: 0,
  aiCredits: 0,
  waReminders: 0,
  emailReminders: 0,
  invoices: 0,
  features: [],
  isPublic: true,
});

watch(
  () => props.plan,
  (newVal) => {
    if (newVal) {
      isEdit.value = true;
      form.value = { ...newVal };
    } else {
      isEdit.value = false;
      form.value = {
        name: "",
        description: "",
        price: 0,
        currency: "MYR",
        interval: "month",
        waSends: 0,
        emailSends: 0,
        aiCredits: 0,
        waReminders: 0,
        emailReminders: 0,
        invoices: 0,
        features: [],
        isPublic: true,
      };
    }
  },
  { immediate: true },
);

const addFeature = () => {
  form.value.features.push("");
};

const removeFeature = (index) => {
  form.value.features.splice(index, 1);
};

const save = () => {
  emit("save", { ...form.value });
};
</script>
