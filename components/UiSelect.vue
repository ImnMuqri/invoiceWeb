<template>
  <div class="relative" ref="selectRef">
    <!-- `text-slate-500` at 11px measured 4.25:1 on the app's light card and
         failed AA. `.f__label` is the tokenised equivalent (gray-660, 4.99:1
         page / 4.59:1 sunken) and tracks the theme, so the same label works
         everywhere this control is used. -->
    <label v-if="label" class="f__label">
      {{ label }}
    </label>
    <!-- `.inp` so this control is the same object as every other field it sits
         beside: same 40px box, same 6px radius, same hairline, same 14px. It was
         `border-slate-200 bg-white shadow-sm rounded-md sm:text-[12px]` — raw
         slate the dark theme had to override, a border and a shadow doing one
         job, and two pixels smaller than the input next to it in the grid. -->
    <button
      type="button"
      @click="!disabled && toggle()"
      ref="buttonRef"
      :disabled="disabled"
      :class="customClass"
      class="inp no-ik sel__trigger"
      :aria-haspopup="true"
      :aria-expanded="isOpen">
      <span class="sel__value">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <span class="sel__chev" :class="{ 'sel__chev--open': isOpen }">
        <svg
          width="16"
          height="16"
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
        <!-- `.mnu` — the same definition the row-action popover uses. A list of
             choices floating over the page is one object, so it has one
             description: size, radius, hairline and elevation all come from
             there. This panel was `text-base`, i.e. 16px, two steps above the
             control that opened it and the reason the popover read as oversized. -->
        <ul
          v-if="isOpen"
          ref="menuRef"
          :style="menuStyle"
          class="mnu sel__panel">
          <template v-if="options.length > 0">
            <li
              v-for="option in options"
              :key="option.value"
              @click="select(option)"
              class="mnu__item"
              :class="{ 'sel__opt--on': modelValue === option.value }">
              <span class="sel__value">{{ option.label }}</span>
              <span v-if="modelValue === option.value" class="sel__tick">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clip-rule="evenodd" />
                </svg>
              </span>
            </li>
          </template>
          <li v-else class="sel__empty">
            {{ emptyMessage || "No options available" }}
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
  emptyMessage: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
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
