<template>
  <Transition name="modal-backdrop">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60] transition-opacity"
      @click="closeOnBackdrop && $emit('update:modelValue', false)"></div>
  </Transition>

  <Transition name="modal-content">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[70] overflow-y-auto pointer-events-none">
      <div
        class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full pointer-events-auto border border-slate-200"
          :class="maxWidthClass">
          <!-- Close Button -->
          <button
            v-if="showClose"
            @click="$emit('update:modelValue', false)"
            class="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all z-10">
            <UiIcon icon="heroicons:x-mark" class="w-5 h-5" />
          </button>

          <!-- Content Slot -->
          <slot></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  maxWidth: {
    type: String,
    default: "sm", // sm, md, lg, xl, 2xl
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["update:modelValue"]);

const maxWidthClass = computed(() => {
  const classes = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
  };
  return classes[props.maxWidth] || classes.sm;
});

// Prevent body scroll when modal is open
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
);
</script>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-content-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-content-leave-active {
  transition: all 0.2s ease-in;
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(5px);
}
</style>
