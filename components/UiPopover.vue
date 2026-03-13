<template>
  <div class="inline-block" ref="containerRef">
    <div @click.stop="toggle" ref="triggerRef" class="cursor-pointer">
      <slot name="trigger" :is-open="isOpen"></slot>
    </div>

    <Teleport to="body">
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95">
        <div
          v-if="isOpen"
          ref="popoverRef"
          :style="popoverStyle"
          class="fixed z-[9999] min-w-[160px] rounded-xl bg-white p-1.5 shadow-2xl ring-1 ring-slate-200 focus:outline-none border border-slate-100"
          @click.stop>
          <div class="flex flex-col gap-0.5">
            <slot :close="close"></slot>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";

const props = defineProps({
  placement: {
    type: String,
    default: "bottom-end", // bottom-start, bottom-end
  },
});

const isOpen = ref(false);
const containerRef = ref(null);
const triggerRef = ref(null);
const popoverRef = ref(null);
const popoverStyle = ref({});

const updatePosition = () => {
  if (!triggerRef.value || !isOpen.value) return;

  const rect = triggerRef.value.getBoundingClientRect();
  const offset = 8;
  
  let top = rect.bottom + offset;
  let left = rect.left;

  if (props.placement === "bottom-end") {
    // We'll need the popover width for bottom-end, so we use nextTick in toggle
    if (popoverRef.value) {
      const popoverRect = popoverRef.value.getBoundingClientRect();
      left = rect.right - popoverRect.width;
    }
  }

  popoverStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
};

const toggle = async () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await nextTick();
    updatePosition();
    // Second call to handle placement logic after width is known
    if (props.placement === "bottom-end") {
      updatePosition();
    }
  }
};

const close = () => {
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    if (popoverRef.value && popoverRef.value.contains(event.target)) return;
    close();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("scroll", updatePosition, true);
  window.addEventListener("resize", updatePosition);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("scroll", updatePosition, true);
  window.removeEventListener("resize", updatePosition);
});

watch(isOpen, (val) => {
  if (val) {
    updatePosition();
  }
});

defineExpose({ close });
</script>
