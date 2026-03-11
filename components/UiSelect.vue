<template>
  <div class="relative" ref="selectRef">
    <label v-if="label" class="block text-sm font-medium text-slate-700 mb-2">
      {{ label }}
    </label>
    <button
      type="button"
      @click="toggle"
      ref="buttonRef"
      :class="customClass"
      class="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-950 sm:text-sm shadow-sm hover:border-slate-300 transition-colors"
      :aria-haspopup="true"
      :aria-expanded="isOpen">
      <span class="block truncate font-medium text-slate-900">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <span
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg
          class="h-5 w-5 text-slate-400 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd" />
        </svg>
      </span>
    </button>

    <Teleport to="body">
      <transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <ul
          v-if="isOpen"
          ref="menuRef"
          :style="menuStyle"
          class="fixed z-[9999] mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-[12px]">
          <li
            v-for="option in options"
            :key="option.value"
            @click="select(option)"
            class="relative cursor-default select-none py-1 pl-3 pr-9 text-slate-900 hover:bg-slate-50 transition-colors"
            :class="{ 'bg-slate-50': modelValue === option.value }">
            <span
              class="block truncate"
              :class="{ 'font-semibold': modelValue === option.value }">
              {{ option.label }}
            </span>
            <span
              v-if="modelValue === option.value"
              class="absolute inset-y-0 right-0 flex items-center pr-4 text-emerald-600">
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clip-rule="evenodd" />
              </svg>
            </span>
          </li>
        </ul>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";

const props = defineProps({
  modelValue: [String, Number],
  options: {
    type: Array,
    required: true,
  },
  label: String,
  placeholder: {
    type: String,
    default: "Select an option",
  },
  customClass: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const selectRef = ref(null);
const buttonRef = ref(null);
const menuRef = ref(null);
const menuStyle = ref({});

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue);
});

const updatePosition = () => {
  if (!buttonRef.value || !isOpen.value) return;

  const rect = buttonRef.value.getBoundingClientRect();
  menuStyle.value = {
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  };
};

const toggle = async () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await nextTick();
    updatePosition();
  }
};

const select = (option) => {
  emit("update:modelValue", option.value);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    // Also check if the click was on the teleported menu
    if (menuRef.value && menuRef.value.contains(event.target)) return;
    isOpen.value = false;
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
</script>
