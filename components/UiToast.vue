<script setup>
/**
 * Toast.
 *
 * The markup was three hardcoded Tailwind pastel gradients — from-emerald-50,
 * from-rose-50, from-amber-50 — with `text-slate-900` on top of them. None of it
 * responded to the theme, so in dark mode a toast was a pale mint slab carrying
 * near-black text on a near-black page. Styling now lives in .toast, on token
 * triplets with a real pair per theme.
 *
 * Teleported to <body>. A toast is fixed-position and every page renders its own
 * inside .desk, so two pages transitioning could otherwise stack them inside
 * different stacking contexts; from <body> there is one place it can land.
 */
import { watch, computed, ref, onUnmounted } from "vue";

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

const type = computed(() => {
  const t = props.modelValue?.type;
  return ["success", "error", "warning"].includes(t) ? t : "success";
});

const icon = computed(
  () =>
    ({
      error: "heroicons:x-circle",
      warning: "heroicons:exclamation-triangle",
      success: "heroicons:check-circle",
    })[type.value],
);

/* A screen reader should be interrupted by a failure and not by a confirmation
   it can pick up in passing. */
const live = computed(() => (type.value === "error" ? "assertive" : "polite"));

/* The old version set a fresh timeout on every message without clearing the
   last, so two toasts in quick succession left the first timer running — and it
   fired against the second message, cutting it short. */
let timer = null;

watch(
  () => props.modelValue?.message,
  (message) => {
    if (timer) clearTimeout(timer);
    if (!message) return;
    timer = setTimeout(() => {
      emit("update:modelValue", { message: "", type: type.value });
    }, props.duration);
  },
);

onUnmounted(() => timer && clearTimeout(timer));
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="modelValue?.message"
        class="toast"
        :class="`toast--${type}`"
        role="status"
        :aria-live="live">
        <span class="toast__icon" aria-hidden="true">
          <UiIcon :icon="icon" custom-class="w-4 h-4" />
        </span>
        <span class="toast__msg">{{ modelValue.message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.2s ease;
  }
  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}
</style>
