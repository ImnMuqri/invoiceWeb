<template>
  <Transition name="toast">
    <div v-if="modelValue?.message" class="fixed bottom-8 right-8 z-[100]">
      <div
        class="bg-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border-2"
        :class="containerClass">
        <UiIcon :icon="iconName" :custom-class="iconClass" />
        <span class="text-sm font-semibold text-slate-900">{{
          modelValue.message
        }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { watch, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ message: "", type: "success" }),
  },
  duration: {
    type: Number,
    default: 5000,
  },
});

const emit = defineEmits(["update:modelValue"]);

const type = computed(() => props.modelValue?.type || "success");

const containerClass = computed(() => {
  switch (type.value) {
    case "error":
      return "border-red-100 shadow-red-100/50";
    case "warning":
      return "border-amber-100 shadow-amber-100/50";
    default:
      return "border-slate-100 shadow-slate-100/50";
  }
});

const iconName = computed(() => {
  switch (type.value) {
    case "error":
      return "heroicons:x-circle";
    case "warning":
      return "heroicons:exclamation-triangle";
    default:
      return "heroicons:check-circle";
  }
});

const iconClass = computed(() => {
  switch (type.value) {
    case "error":
      return "w-6 h-6 text-red-500";
    case "warning":
      return "w-6 h-6 text-amber-500";
    default:
      return "w-6 h-6 text-emerald-400";
  }
});

watch(
  () => props.modelValue?.message,
  (newVal) => {
    if (newVal) {
      setTimeout(() => {
        emit("update:modelValue", { message: "", type: type.value });
      }, props.duration);
    }
  },
);
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
