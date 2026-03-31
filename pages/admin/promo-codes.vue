<template>
  <div class="admin-promo-codes-page mx-auto font-sans pb-8 px-4">
    <div class="flex flex-col gap-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
            Promo Code Management
          </h2>
          <p class="text-xs font-medium text-slate-500 mt-1">
            Create and manage discount codes for subscriptions.
          </p>
        </div>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all">
          <UiIcon icon="heroicons:plus" custom-class="w-4 h-4 mr-2" />
          Create Promo Code
        </button>
      </div>

      <!-- Promo Codes Table -->
      <div
        class="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Code
              </th>
              <th
                class="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Discount
              </th>
              <th
                class="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Usage
              </th>
              <th
                class="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Expires
              </th>
              <th
                class="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="promo in promoStore.promoCodes"
              :key="promo.id"
              class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-mono font-bold text-slate-900">{{
                  promo.code
                }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-semibold text-slate-700">
                  {{
                    promo.discountType === "PERCENTAGE"
                      ? promo.discountValue + "%"
                      : promo.discountValue + " MYR"
                  }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="promoStore.togglePromoStatus(promo.id)"
                  class="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border"
                  :class="
                    promo.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-100'
                  ">
                  {{ promo.isActive ? "Active" : "Inactive" }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {{ promo.uses }}{{ promo.maxUses ? " / " + promo.maxUses : "" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {{
                  promo.expiresAt
                    ? new Date(promo.expiresAt).toLocaleDateString()
                    : "Never"
                }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button
                  @click="confirmDelete(promo.id)"
                  class="text-rose-600 hover:text-rose-900 transition-colors">
                  <UiIcon icon="heroicons:trash" custom-class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="promoStore.promoCodes.length === 0">
              <td
                colspan="6"
                class="px-6 py-12 text-center text-slate-400 italic">
                No promo codes found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <UiModal
      v-model="showCreateModal"
      title="Create New Promo Code"
      max-width="lg"
      description="Fill in the details below to create a new promotional discount code.">
      <form @submit.prevent="handleCreate" class="space-y-6 p-6">
        <div>
          <label
            class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
            >Code</label
          >
          <input
            v-model="newPromo.code"
            type="text"
            required
            placeholder="e.g. SUMMER50"
            class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all uppercase" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <UiSelect
            v-model="newPromo.discountType"
            label="Discount Type"
            :options="discountOptions"
            custom-class="!py-2 !px-3 !rounded-md" />
          <div>
            <label
              class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
              >Value</label
            >
            <input
              v-model="newPromo.discountValue"
              type="number"
              required
              step="0.01"
              class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
              >Max Uses (Optional)</label
            >
            <input
              v-model="newPromo.maxUses"
              type="number"
              class="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-slate-950 outline-none transition-all" />
          </div>
          <UiDatePicker
            v-model="newPromo.expiresAt"
            label="Expiry (Optional)"
            placeholder="Select expiry date" />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="showCreateModal = false"
            class="px-4 py-2.5 rounded-md font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm">
            Cancel
          </button>
          <button
            type="submit"
            :disabled="promoStore.loading"
            class="px-5 py-2.5 bg-slate-900 text-white rounded-md font-bold hover:bg-slate-800 transition-all disabled:opacity-50 text-sm">
            {{ promoStore.loading ? "Creating..." : "Create" }}
          </button>
        </div>
      </form>
    </UiModal>

    <UiToast v-model="toast" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { usePromoStore } from "~/stores/promoStore";

const promoStore = usePromoStore();
const toast = ref({ message: "", type: "success" });
const showCreateModal = ref(false);

const newPromo = ref({
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  maxUses: null,
  expiresAt: null,
});

const discountOptions = [
  { value: "PERCENTAGE", label: "Percentage (%)" },
  { value: "FIXED", label: "Fixed (MYR)" },
];

const handleCreate = async () => {
  try {
    await promoStore.createPromoCode(newPromo.value);
    toast.value = {
      message: "Promo code created successfully!",
      type: "success",
    };
    showCreateModal.value = false;
    newPromo.value = {
      code: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      maxUses: null,
      expiresAt: null,
    };
  } catch (err) {
    toast.value = {
      message: err.message || "Failed to create promo code",
      type: "error",
    };
  }
};

const confirmDelete = async (id) => {
  if (confirm("Are you sure you want to delete this promo code?")) {
    try {
      await promoStore.deletePromoCode(id);
      toast.value = {
        message: "Promo code deleted successfully!",
        type: "success",
      };
    } catch (err) {
      toast.value = {
        message: err.message || "Failed to delete promo code",
        type: "error",
      };
    }
  }
};

onMounted(() => {
  promoStore.fetchAllPromoCodes();
});

definePageMeta({
  layout: "default",
});
</script>
