<template>
  <!-- surface="light": the content below is still hardcoded Tailwind slate, so
       it needs the fixed-white shell rather than the themed one. -->
  <UiModal
    v-model="isOpen"
    :title="title"
    :description="providerDescription"
    maxWidth="md"
    surface="light">
    <div class="p-6">
      <div v-if="step === 1">
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
            <img
              :src="providerLogo"
              class="w-8 h-8 object-contain"
              :alt="providerName" />
          </div>
          <div>
            <h4 class="text-sm font-semibold text-slate-900">
              {{ providerName }} Setup
            </h4>
          </div>
        </div>

        <div class="space-y-6">
          <div
            v-for="(instruction, index) in instructions"
            :key="index"
            class="flex gap-4">
            <div
              class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
              {{ index + 1 }}
            </div>
            <p class="text-sm text-slate-600">{{ instruction }}</p>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-100 flex justify-end">
          <button
            @click="step = 2"
            class="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all">
            Continue to Fields
          </button>
        </div>
      </div>

      <div v-else>
        <div class="space-y-4 relative">
          <div v-for="field in fields" :key="field.key">
            <label
              class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2"
              >{{ field.label }}</label
            >
            <input
              v-model="form[field.key]"
              :type="field.type || 'text'"
              :id="`payment_${field.key}_${Math.random().toString(36).substring(7)}`"
              :name="`payment_gateway_${field.key}`"
              class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all"
              :placeholder="field.placeholder"
              :autocomplete="
                field.type === 'password' ? 'new-password' : 'off'
              " />
          </div>
        </div>

        <div
          class="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
          <UiIcon
            name="heroicons:shield-check"
            custom-class="text-blue-600 w-5 h-5 shrink-0 "
            class="place-self-start" />
          <div class="text-[12px] text-blue-700 leading-relaxed">
            <p class="font-bold">Secure Connection</p>
            <p>
              Your payment credentials are encrypted and stored securely.
              InvoKita only uses them to generate payment links. We never store
              or access your bank information.
            </p>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            @click="step = 1"
            class="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-50 rounded-lg transition-all">
            Back
          </button>
          <button
            @click="handleSave"
            :disabled="loading"
            class="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50">
            {{ loading ? "Saving..." : "Save Connection" }}
          </button>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: Boolean,
  provider: String, // 'TOYYIBPAY' or 'BILLPLZ'
  existingData: Object,
});

const emit = defineEmits(["update:modelValue", "save"]);

const step = ref(1);
const loading = ref(false);
const form = ref({});

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const providerName = computed(() => {
  if (props.provider === "TOYYIBPAY") return "ToyyibPay";
  if (props.provider === "BILLPLZ") return "Billplz";
  if (props.provider === "HITPAY") return "HitPay";
  if (props.provider === "SENANGPAY") return "SenangPay";
  return "Unknown";
});
const providerLogo = computed(() => {
  if (props.provider === "TOYYIBPAY")
    return "https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/e2hhr8kgl2hq5bkkqueq?ik-sanitizeSvg=true";
  if (props.provider === "BILLPLZ")
    return "https://make-cxp-documentation.ams3.digitaloceanspaces.com/apps-center-icons/billplz.png";
  if (props.provider === "HITPAY")
    return "https://www.hitpayapp.com/static/favicons/apple-touch-icon.png";
  if (props.provider === "SENANGPAY")
    return "https://pbs.twimg.com/profile_images/718283577546059777/jA21-7N__400x400.jpg";
  return "";
});
const providerDescription = computed(() => {
  if (props.provider === "TOYYIBPAY") {
    return "Accept FPX online banking easily with industry-low flat rates.";
  }
  if (props.provider === "BILLPLZ") {
    return "Seamlessly collect payments via FPX, cards, and e-wallets.";
  }
  if (props.provider === "HITPAY") {
    return "Modern payment collection for freelancers and small businesses with zero monthly fees.";
  }
  if (props.provider === "SENANGPAY") {
    return "Powerful Malaysian gateway with support for FPX and Credit Card installments.";
  }
  return "";
});
const title = computed(() => `Connect to ${providerName.value}`);

const instructions = computed(() => {
  if (props.provider === "TOYYIBPAY") {
    return [
      "Create a ToyyibPay account at toyyibpay.com.",
      "Create a payment category inside the ToyyibPay dashboard.",
      "Copy the Secret Key and Category Code from your dashboard settings.",
    ];
  }
  if (props.provider === "BILLPLZ") {
    return [
      "Create a Billplz account at billplz.com.",
      "Create a Collection in the Billplz dashboard.",
      "Copy the API Key, Collection ID, and X Signature Key from your account settings.",
    ];
  }
  if (props.provider === "HITPAY") {
    return [
      "Login to your HitPay dashboard at hitpayapp.com.",
      "Navigate to Settings > API Keys.",
      "Copy your Business API Key and Salt.",
    ];
  }
  if (props.provider === "SENANGPAY") {
    return [
      "Login to your SenangPay dashboard.",
      "Navigate to Settings > Profile.",
      "Generate and copy your Merchant ID and Secret Key.",
    ];
  }
  return [];
});

const fields = computed(() => {
  const isEditing = !!props.existingData?.id;
  if (props.provider === "TOYYIBPAY") {
    return [
      {
        key: "secretKey",
        label: "Secret Key",
        type: "password",
        placeholder: isEditing
          ? "Leave blank to keep current"
          : "Enter ToyyibPay Secret Key",
      },
      {
        key: "categoryCode",
        label: "Category Code",
        placeholder: "Enter Category Code",
      },
    ];
  }
  if (props.provider === "BILLPLZ") {
    return [
      {
        key: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: isEditing
          ? "Leave blank to keep current"
          : "Enter Billplz API Key",
      },
      {
        key: "collectionId",
        label: "Collection ID",
        placeholder: "Enter Collection ID",
      },
      {
        key: "xSignatureKey",
        label: "X Signature Key",
        type: "password",
        placeholder: isEditing
          ? "Leave blank to keep current"
          : "Enter X Signature Key",
      },
    ];
  }
  if (props.provider === "HITPAY") {
    return [
      {
        key: "apiKey",
        label: "Business API Key",
        type: "password",
        placeholder: isEditing
          ? "Leave blank to keep current"
          : "Enter HitPay API Key",
      },
      {
        key: "salt",
        label: "Salt Key",
        type: "password",
        placeholder: isEditing ? "Leave blank to keep current" : "Enter Salt",
      },
    ];
  }
  if (props.provider === "SENANGPAY") {
    return [
      {
        key: "merchantId",
        label: "Merchant ID",
        placeholder: "Enter SenangPay Merchant ID",
      },
      {
        key: "secretKey",
        label: "Secret Key",
        type: "password",
        placeholder: isEditing
          ? "Leave blank to keep current"
          : "Enter SenangPay Secret Key",
      },
    ];
  }
  return [];
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      step.value = 1;
      form.value = { ...props.existingData };
    } else {
      // Clear form when closed to prevent leak or persistent autofill
      form.value = {};
    }
  },
);

const handleSave = async () => {
  loading.value = true;
  try {
    await emit("save", { ...form.value, provider: props.provider });
    emit("update:modelValue", false);
  } finally {
    loading.value = false;
  }
};
</script>
