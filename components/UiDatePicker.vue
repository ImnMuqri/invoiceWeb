<template>
  <div class="relative w-full" ref="container">
    <!-- See UiSelect: the old 11px slate-500 label measured 4.25:1 on the light
         card. `.f__label` is the tokenised, theme-tracking equivalent. -->
    <label v-if="label" class="f__label">
      {{ label }}
    </label>

    <div class="relative cursor-pointer" @click="toggleCalendar">
      <input
        type="text"
        :value="formattedDate"
        readonly
        :placeholder="placeholder"
        class="w-full border border-slate-200 rounded-md pl-10 pr-3 py-2 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-950 transition-colors shadow-sm text-slate-900 font-medium text-sm cursor-pointer" />
      <div
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <UiIcon icon="heroicons:calendar" class="w-4 h-4 text-slate-400" />
      </div>
    </div>

    <Teleport to="body">
      <Transition
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
          class="fixed z-[9999] w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 select-none">
          <!-- Calendar Header -->
          <div class="flex items-center justify-between mb-4">
            <button
              type="button"
              @click.stop="prevMonth"
              class="p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
              <UiIcon
                icon="heroicons:chevron-left"
                class="w-4 h-4 text-slate-600" />
            </button>

            <span class="text-sm font-bold text-slate-900">
              {{ monthNames[viewDate.getMonth()] }} {{ viewDate.getFullYear() }}
            </span>

            <button
              type="button"
              @click.stop="nextMonth"
              class="p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
              <UiIcon
                icon="heroicons:chevron-right"
                class="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <!-- Days of Week -->
          <div class="grid grid-cols-7 mb-2">
            <div
              v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']"
              :key="day"
              class="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">
              {{ day }}
            </div>
          </div>

          <!-- Days Grid -->
          <div class="grid grid-cols-7 gap-1">
            <div
              v-for="(day, idx) in calendarDays"
              :key="idx"
              class="aspect-square flex items-center justify-center text-xs font-semibold rounded-lg transition-all cursor-pointer"
              :class="[
                day.isCurrentMonth ? 'text-slate-900' : 'text-slate-300',
                day.isSelected
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'hover:bg-slate-50',
                day.isToday && !day.isSelected
                  ? 'text-emerald-600 border border-emerald-100'
                  : '',
              ]"
              @click.stop="selectDate(day.date)">
              {{ day.date.getDate() }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { formatDate } from "~/utils/date";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Select date",
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const container = ref(null);
const popoverRef = ref(null);
const popoverStyle = ref({});
const viewDate = ref(
  props.modelValue ? new Date(props.modelValue) : new Date(),
);

const updatePosition = () => {
  if (!container.value || !isOpen.value) return;

  const rect = container.value.getBoundingClientRect();
  const offset = 8;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  let top = rect.bottom + offset;
  let left = rect.left;

  // Wait for next tick to get popover dimensions
  nextTick(() => {
    if (popoverRef.value) {
      const popoverRect = popoverRef.value.getBoundingClientRect();

      // Horizontal collision
      if (left + popoverRect.width > viewportWidth) {
        left = rect.right - popoverRect.width;
      }

      // Vertical collision
      if (top + popoverRect.height > viewportHeight) {
        top = rect.top - popoverRect.height - offset;
      }

      popoverStyle.value = {
        top: `${top}px`,
        left: `${left}px`,
      };
    }
  });
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formattedDate = computed(() => formatDate(props.modelValue));

const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = firstDay.getDay();
  const days = [];

  // Padding from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
    });
  }

  // Current month
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = props.modelValue ? new Date(props.modelValue) : null;
  if (selected) selected.setHours(0, 0, 0, 0);

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    days.push({
      date,
      isCurrentMonth: true,
      isToday: compareDate.getTime() === today.getTime(),
      isSelected: selected && compareDate.getTime() === selected.getTime(),
    });
  }

  // Padding for next month
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  return days;
});

const toggleCalendar = async () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await nextTick();
    updatePosition();
  }
};

const selectDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const localDateStr = `${y}-${m}-${d}`;
  emit("update:modelValue", localDateStr);
  isOpen.value = false;
};

const prevMonth = () => {
  viewDate.value = new Date(
    viewDate.value.getFullYear(),
    viewDate.value.getMonth() - 1,
    1,
  );
  nextTick(updatePosition);
};

const nextMonth = () => {
  viewDate.value = new Date(
    viewDate.value.getFullYear(),
    viewDate.value.getMonth() + 1,
    1,
  );
  nextTick(updatePosition);
};

const handleClickOutside = (event) => {
  if (container.value && !container.value.contains(event.target)) {
    if (popoverRef.value && popoverRef.value.contains(event.target)) return;
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
