<template>
  <Teleport to="body">
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
          class="flex min-h-full items-center justify-center p-4 text-center sm:p-0"
          style="zoom: 0.9">
          <div
            class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full pointer-events-auto border border-slate-200"
            :class="maxWidthClass">
            <div
              v-if="title"
              class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div class="flex-1 pr-8">
                <h3 class="text-base font-bold text-slate-900 tracking-tight">
                  {{ title }}
                </h3>
                <p
                  v-if="description"
                  class="mt-1 text-[12px] text-slate-500 font-medium leading-relaxed">
                  {{ description }}
                </p>
              </div>
              <button
                v-if="showClose"
                @click="$emit('update:modelValue', false)"
                class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all">
                <UiIcon icon="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>

            <!-- Close Button (Absolute if no title) -->
            <button
              v-else-if="showClose"
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
  </Teleport>
</template>

<script setup>
import { computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  maxWidth: {
    type: String,
    default: "sm", // sm, md, lg, xl, 2xl, 3xl, 4xl
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
    /* Added for the client import preview (spec 08). A preview table the user
       has to scroll sideways to read is a preview they will skip — which
       defeats the point of having one, since it is the only thing standing
       between a bad paste and 200 wrong clients. */
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
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
